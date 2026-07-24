"""业务领域层 - 按业务能力划分的领域模块。

Boundary contract: routes and other layers MUST import via the
package, never via internal files. That is:

    from domain.<area> import <symbol>      # ok
    from domain.<area>.<file> import <symbol>  # not allowed

Each `<area>/__init__.py` re-exports the public surface and declares
`__all__`. Adding a new public symbol requires updating the package
`__init__.py`; this is the boundary's enforcement point.
"""
