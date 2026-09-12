"""Tests for domain/files/storage.py — pure helper functions."""
import pytest
from unittest.mock import patch, MagicMock
from domain.files.storage import (
    build_oss_url,
    OSSConfig,
)


class TestBuildOssUrl:
    def test_https_url(self):
        url = build_oss_url("my-bucket", "https://oss.example.com", "images/photo.jpg")
        assert url == "https://my-bucket.oss.example.com/images/photo.jpg"

    def test_http_endpoint_stripped(self):
        url = build_oss_url("my-bucket", "http://oss.example.com", "images/photo.jpg")
        assert url == "https://my-bucket.oss.example.com/images/photo.jpg"

    def test_no_protocol_prefix(self):
        url = build_oss_url("my-bucket", "oss.example.com", "images/photo.jpg")
        assert url == "https://my-bucket.oss.example.com/images/photo.jpg"

    def test_nested_object_key(self):
        url = build_oss_url("b", "oss.example.com", "a/b/c/file.txt")
        assert url == "https://b.oss.example.com/a/b/c/file.txt"


class TestOSSConfig:
    def test_all_fields_present(self):
        with patch("domain.files.storage.settings") as mock_settings:
            mock_settings.oss_access_key = "ak"
            mock_settings.oss_secret_key = "sk"
            mock_settings.oss_endpoint = "https://oss.example.com"
            mock_settings.oss_bucket = "my-bucket"
            config = OSSConfig()
            assert config.access_key_id == "ak"
            assert config.access_key_secret == "sk"
            assert config.endpoint == "https://oss.example.com"
            assert config.bucket_name == "my-bucket"

    def test_incomplete_config(self):
        with patch("domain.files.storage.settings") as mock_settings:
            mock_settings.oss_access_key = ""
            mock_settings.oss_secret_key = ""
            mock_settings.oss_endpoint = ""
            mock_settings.oss_bucket = ""
            config = OSSConfig()
            assert config.access_key_id == ""