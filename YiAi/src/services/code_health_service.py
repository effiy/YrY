"""Code health analysis — re-export facade for RPC backward compatibility.

RPC entry: services.code_health_service.analyze
All logic lives in services/code_health/ sub-package.
"""

from services.code_health.service import analyze  # noqa: F401
