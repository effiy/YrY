"""Tests for domain/wework/client.py — pure helper functions."""
import pytest
from domain.wework.client import (
    _build_text_payload,
    _validate_webhook_url,
    _validate_content,
)
from shared.exceptions import BusinessException


class TestBuildTextPayload:
    def test_builds_correct_structure(self):
        payload = _build_text_payload("Hello World")
        assert payload["msgtype"] == "text"
        assert payload["text"]["content"] == "Hello World"

    def test_empty_content(self):
        payload = _build_text_payload("")
        assert payload["msgtype"] == "text"
        assert payload["text"]["content"] == ""


class TestValidateWebhookUrl:
    def test_valid_url(self):
        url = "https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=abc"
        assert _validate_webhook_url(url) == url

    def test_empty_url_raises(self):
        with pytest.raises(BusinessException, match="cannot be empty"):
            _validate_webhook_url("")

    def test_invalid_host_raises(self):
        with pytest.raises(BusinessException, match="Invalid WeCom"):
            _validate_webhook_url("https://evil.com/webhook")


class TestValidateContent:
    def test_valid_content(self):
        assert _validate_content("Hello") == "Hello"

    def test_empty_content_raises(self):
        with pytest.raises(BusinessException, match="cannot be empty"):
            _validate_content("")