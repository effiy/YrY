"""Controlled Module Executor
- Validate whitelist, parse parameters, invoke target functions synchronously or asynchronously
- Integrates Observer sandbox and reentrancy guard
- Caches imported function references to avoid repeated importlib calls
"""
import asyncio
import importlib
import inspect
import json
import logging
import time
from typing import Any, Dict, Optional, Union

from shared.config import settings
from shared.error_codes import ErrorCode
from shared.exceptions import BusinessException

logger = logging.getLogger(__name__)

EXEC_LOG_TRUNCATION = 500  # max chars for parameter/result recording

allowlist = settings.module_allowlist
if isinstance(allowlist, str):
    allowlist = [x.strip() for x in allowlist.split(',') if x.strip()]
EXEC_ALLOWLIST = set(allowlist)

# Cache for imported function references — avoids repeated importlib.import_module
# on every RPC call. The same (module_path, function_name) pair is resolved once
# and reused. Python's sys.modules already caches the module object; this cache
# skips the getattr lookup as well.
_FUNC_CACHE: dict[tuple[str, str], Any] = {}

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

def parse_parameters(parameters: dict[str, Any] | str) -> dict[str, Any]:
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
        raise BusinessException(ErrorCode.INVALID_PARAMS, message=f"Invalid JSON: {e!s}") from e
    if not isinstance(parsed, dict):
        raise BusinessException(ErrorCode.INVALID_PARAMS, message="Parameters must be a JSON object")
    return parsed

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


def _acquire_guard() -> Any | None:
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


def _release_guard(token: Any | None) -> None:
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
    """Dynamically import target module and return function object.

    Results are cached in ``_FUNC_CACHE`` so repeated RPC calls to the same
    module+function skip the importlib+getattr overhead entirely.
    """
    cache_key = (module_path, function_name)
    if cache_key in _FUNC_CACHE:
        return _FUNC_CACHE[cache_key]

    # PR3: log every RPC dispatch so we can collect the real module_name
    # strings callers use, then deprecate the services.* shim. See
    # docs/arch/scene-06-componentization-or-modularization (PR3).
    logger.info("RPC dispatch: module=%s function=%s", module_path, function_name)
    try:
        module = importlib.import_module(module_path)
        func = getattr(module, function_name)
        _FUNC_CACHE[cache_key] = func
        return func
    except (ImportError, AttributeError) as e:
        logger.error(f"Module import error: {e!s}")
        raise BusinessException(ErrorCode.INVALID_PARAMS, message=f"Module or function not found: {e!s}") from e


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


async def execute_module(module_path: str, function_name: str, parameters: dict[str, Any] | str) -> Any:
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
            if inspect.isasyncgenfunction(target_function) or inspect.isgeneratorfunction(target_function):
                result = target_function(parameters_dict)
            elif asyncio.iscoroutinefunction(target_function):
                result = await _run_function(target_function, parameters_dict)
            else:
                result = await _run_function(target_function, parameters_dict)
        except Exception as e:
            status = "failed"
            error_message = str(e)
            logger.error(f"Execution error: {e!s}")
            raise BusinessException(ErrorCode.INTERNAL_ERROR, message=f"Execution failed: {e!s}") from e
        finally:
            _record_execution(
                module_path, function_name, parameters, result,
                error_message, (time.perf_counter() - start) * 1000, status,
            )
        return result
    finally:
        _release_guard(token)

