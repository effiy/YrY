"""Tests for shared/config.py — pure helper functions."""
from shared.config import YamlConfigSettingsSource, Settings


class TestYamlFlatten:
    def test_flat_dict(self):
        result = YamlConfigSettingsSource._flatten({"a": 1, "b": 2})
        assert result == {"a": 1, "b": 2}

    def test_nested_dict(self):
        result = YamlConfigSettingsSource._flatten({"server": {"host": "0.0.0.0", "port": 8000}})
        assert result == {"server_host": "0.0.0.0", "server_port": 8000}

    def test_deeply_nested(self):
        result = YamlConfigSettingsSource._flatten({
            "a": {"b": {"c": 1}}
        })
        assert result == {"a_b_c": 1}

    def test_custom_separator(self):
        result = YamlConfigSettingsSource._flatten(
            {"server": {"host": "x"}}, sep="."
        )
        assert result == {"server.host": "x"}

    def test_empty_dict(self):
        result = YamlConfigSettingsSource._flatten({})
        assert result == {}


class TestToList:
    def test_string_to_list(self):
        result = Settings._to_list("a, b, c")
        assert result == ["a", "b", "c"]

    def test_string_with_spaces(self):
        result = Settings._to_list("a ,  b ,c")
        assert result == ["a", "b", "c"]

    def test_list_passthrough(self):
        result = Settings._to_list(["a", "b"])
        assert result == ["a", "b"]

    def test_empty_string(self):
        result = Settings._to_list("")
        assert result == []