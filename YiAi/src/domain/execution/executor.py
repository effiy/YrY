"""Controlled Module Executor
- Validate whitelist, parse parameters, invoke target functions synchronously or asynchronously
- Integrates Observer sandbox and reentrancy guard
"""
import importlib
import asyncio
import logging
import json
import inspect
import time
from typing import Dict, Any, Optional, Union
from shared.config import settings
from shared.error_codes import ErrorCode
from shared.exceptions import BusinessException

logger = logging.getLogger(__name__)

EXEC_LOG_TRUNCATION = 500  # max chars for parameter/result recording

allowlist = settings.module_allowlist
if isinstance(allowlist, str):
    allowlist = [x.strip() for x in allowlist.split(',') if x.strip()]
EXEC_ALLOWLIST = set(allowlist)

# Lazy import to avoid circular dependency at module load time
_recorder = None
_guard = None

def _get_recorder():
    global _recorder
    if _recorder is None and settings.state_store_enabled:
        try:
            from domain.state.recorder import get_recorder
            _recorder = get_recorder()
        except Exception as e:
            logger.warning(f"SkillRecorder not available: {e}")
    return _recorder


def _get_guard():
    global _guard
    if _guard is None and settings.observer_guard_enabled:
        try:
            from observer import ReentrancyGuard
            _guard = ReentrancyGuard(max_depth=settings.observer_guard_max_depth)
        except Exception as e:
            logger.warning(f"ReentrancyGuard not available: {e}")
    return _guard

def parse_parameters(parameters: Union[Dict[str, Any], str]) -> Dict[str, Any]:
    """
    Parse parameters, supports dict or JSON string

    Args:
        parameters: Parameter dict or JSON string

    Returns:
        Dict[str, Any]: Parsed parameter dict

    Raises:
        HTTPException: If JSON format is invalid or parsed result is not a dict
    """
    if isinstance(parameters, dict):
        return parameters
    try:
        parsed = json.loads(parameters)
    except json.JSONDecodeError as e:
        raise BusinessException(ErrorCode.INVALID_PARAMS, message=f"Invalid JSON: {str(e)}")
    if not isinstance(parsed, dict):
        raise BusinessException(ErrorCode.INVALID_PARAMS, message="Parameters must be a JSON object")
    return parsed

async def run_script(script_path: str, timeout: int = 300) -> Dict[str, Any]:
    """
    Execute Python script

    Args:
        script_path: Script path
        timeout: Timeout in seconds

    Returns:
        Execution result
    """
    try:
        logger.info(f"Starting script execution: {script_path}")

        # Execute script using asyncio.create_subprocess_exec
        process = await asyncio.create_subprocess_exec(
            'python3',
            script_path,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE
        )

        # Wait for execution to complete with timeout
        try:
            stdout, stderr = await asyncio.wait_for(
                process.communicate(),
                timeout=timeout
            )
        except asyncio.TimeoutError:
            process.kill()
            await process.wait()
            raise Exception(f"Script execution timeout ({timeout}s)")

        # Decode output
        stdout_text = stdout.decode('utf-8') if stdout else ''
        stderr_text = stderr.decode('utf-8') if stderr else ''

        logger.info(f"Script execution complete, return code: {process.returncode}")

        if process.returncode != 0:
            logger.error(f"Script execution failed: {stderr_text}")
            return {
                'success': False,
                'message': f'Script execution failed (return code: {process.returncode})',
                'stdout': stdout_text,
                'stderr': stderr_text,
                'returncode': process.returncode
            }

        return {
            'success': True,
            'message': 'Script execution successful',
            'stdout': stdout_text,
            'stderr': stderr_text,
            'returncode': process.returncode
        }

    except Exception as e:
        logger.error(f"Script execution failed: {str(e)}", exc_info=True)
        return {
            'success': False,
            'message': f'Script execution failed: {str(e)}',
            'error': str(e)
        }

async def _run_function(target_function, parameters_dict):
    """Execute target function within Observer sandbox context"""
    if settings.observer_sandbox_enabled:
        from observer import sandbox_context
        with sandbox_context(
            fs_allowlist=settings.get_sandbox_fs_allowlist(),
            network_allowlist=settings.get_sandbox_network_allowlist(),
        ):
            if asyncio.iscoroutinefunction(target_function):
                return await target_function(parameters_dict)
            return target_function(parameters_dict)
    else:
        if asyncio.iscoroutinefunction(target_function):
            return await target_function(parameters_dict)
        return target_function(parameters_dict)


def _acquire_guard() -> Optional[Any]:
    """Acquire reentrancy guard token, raise if depth limit exceeded"""
    guard = _get_guard()
    if guard is None:
        return None
    from observer.guard import _reentrancy_depth
    depth = _reentrancy_depth.get()
    if depth >= guard.max_depth:
        raise BusinessException(
            ErrorCode.SERVER_ERROR,
            message=f"Reentrancy depth {depth} exceeds limit {guard.max_depth}"
        )
    return _reentrancy_depth.set(depth + 1)


def _release_guard(token: Optional[Any]) -> None:
    """Release reentrancy guard token"""
    if token is not None:
        from observer.guard import _reentrancy_depth
        _reentrancy_depth.reset(token)


def _check_whitelist(module_path: str, function_name: str) -> None:
    """Verify module+function is in execution whitelist"""
    if not module_path or not function_name:
        raise BusinessException(ErrorCode.INVALID_PARAMS, message="Module path and function name required")
    allow_key = f"{module_path}:{function_name}"
    if "*" not in EXEC_ALLOWLIST and allow_key not in EXEC_ALLOWLIST:
        raise BusinessException(ErrorCode.PERMISSION_DENIED, message=f"Execution forbidden: {allow_key}")


def _import_target_function(module_path: str, function_name: str):
    """Dynamically import target module and return function object"""
    # PR3: log every RPC dispatch so we can collect the real module_name
    # strings callers use, then deprecate the services.* shim. See
    # docs/arch/scene-06-componentization-or-modularization (PR3).
    logger.info("RPC dispatch: module=%s function=%s", module_path, function_name)
    try:
        module = importlib.import_module(module_path)
        return getattr(module, function_name)
    except (ImportError, AttributeError) as e:
        logger.error(f"Module import error: {str(e)}")
        raise BusinessException(ErrorCode.INVALID_PARAMS, message=f"Module or function not found: {str(e)}")


def _record_execution(
    module_path: str, function_name: str,
    parameters: Any, result: Any, error_message: str,
    duration_ms: float, status: str,
) -> None:
    """Asynchronously record execution result to State Store (best-effort)"""
    recorder = _get_recorder()
    if recorder is None:
        return
    try:
        recorder.record_async(
            skill_name=f"{module_path}:{function_name}",
            status=status,
            duration_ms=duration_ms,
            input_summary=str(parameters)[:EXEC_LOG_TRUNCATION],
            output_summary=str(result)[:EXEC_LOG_TRUNCATION] if result else "",
            error_message=error_message,
        )
    except Exception as rec_err:
        logger.error(f"SkillRecorder failed: {rec_err}")


async def execute_module(module_path: str, function_name: str, parameters: Union[Dict[str, Any], str]) -> Any:
    """Execute target module/function, integrates Observer sandbox and reentrancy guard"""
    token = _acquire_guard()
    try:
        _check_whitelist(module_path, function_name)
        parameters_dict = parse_parameters(parameters)
        target_function = _import_target_function(module_path, function_name)

        start = time.perf_counter()
        status = "success"
        error_message = ""
        result = None

        try:
            if inspect.isasyncgenfunction(target_function):
                result = target_function(parameters_dict)
            elif inspect.isgeneratorfunction(target_function):
                result = target_function(parameters_dict)
            elif asyncio.iscoroutinefunction(target_function):
                result = await _run_function(target_function, parameters_dict)
            else:
                result = await _run_function(target_function, parameters_dict)
        except Exception as e:
            status = "failed"
            error_message = str(e)
            logger.error(f"Execution error: {str(e)}")
            raise BusinessException(ErrorCode.INTERNAL_ERROR, message=f"Execution failed: {str(e)}") from e
        finally:
            _record_execution(
                module_path, function_name, parameters, result,
                error_message, (time.perf_counter() - start) * 1000, status,
            )
        return result
    finally:
        _release_guard(token)

