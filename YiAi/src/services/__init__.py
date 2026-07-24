"""Backward-compatibility shim package for the pre-restructure module paths.

Modules were moved in commit 1058a29:
  services.database.data_service   -> data.repository
  services.database.session_service -> data.sessions
  services.database.mongo_store     -> data.store
  services.ai.chat_service          -> domain.ai.chat
  services.execution.executor       -> domain.execution.executor
  services.storage.oss_client       -> domain.files.storage
  services.rss.feed_service         -> domain.rss.feed
  services.rss.rss_scheduler        -> domain.rss.scheduler
  services.state.skill_recorder    -> domain.state.recorder
  services.state.state_service      -> domain.state.store

These shims re-export the new modules so existing RPC clients
(module_name=services.database.data_service, etc.) keep working.

Deprecation: per the modularization plan (see
docs/arch/scene-06-componentization-or-modularization/index.md, PR3),
the services/ shim is on a deprecation path. RPC clients should migrate
their `module_name=` strings to the new paths (e.g. `data.repository`,
`domain.ai.chat`). The shim will be removed once RPC dispatch logs show
no remaining callers. See executor._import_target_function for the
dispatch logging.
"""
import warnings as _warnings

_warnings.warn(
    "services.* paths are deprecated; migrate to domain.* / data.* paths "
    "(see commit 1058a29 and docs/arch/scene-06-componentization-or-modularization). "
    "The services/ shim will be removed once RPC clients have migrated.",
    DeprecationWarning,
    stacklevel=2,
)

