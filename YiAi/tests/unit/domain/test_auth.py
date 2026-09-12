"""Tests for domain/auth/core.py — password hashing and JWT management."""
import pytest
from domain.auth.core import hash_password, verify_password, create_jwt, verify_jwt


class TestHashPassword:
    def test_returns_string(self):
        result = hash_password("mypassword")
        assert isinstance(result, str)
        assert len(result) > 0

    def test_different_passwords_produce_different_hashes(self):
        h1 = hash_password("password1")
        h2 = hash_password("password2")
        assert h1 != h2

    def test_same_password_produces_different_hash_each_time(self):
        """Bcrypt uses random salt — each call produces a different hash."""
        h1 = hash_password("samepass")
        h2 = hash_password("samepass")
        assert h1 != h2

    def test_starts_with_bcrypt_prefix(self):
        result = hash_password("test")
        assert result.startswith("$2b$") or result.startswith("$2a$")


class TestVerifyPassword:
    def test_correct_password(self):
        stored = hash_password("secret")
        assert verify_password("secret", stored) is True

    def test_wrong_password(self):
        stored = hash_password("secret")
        assert verify_password("wrong", stored) is False

    def test_empty_plain(self):
        assert verify_password("", "$2b$...") is False

    def test_empty_stored(self):
        assert verify_password("secret", "") is False

    def test_empty_both(self):
        assert verify_password("", "") is False

    def test_malformed_stored_hash(self):
        """Malformed stored hash returns False, not raises."""
        assert verify_password("secret", "not-a-valid-hash") is False

    def test_none_plain(self):
        assert verify_password(None, "$2b$...") is False


class TestJwt:
    def test_create_and_verify_roundtrip(self):
        token = create_jwt("user123", "testuser")
        assert isinstance(token, str)
        payload = verify_jwt(token)
        assert payload is not None
        assert payload["sub"] == "user123"
        assert payload["username"] == "testuser"

    def test_verify_invalid_token(self):
        assert verify_jwt("not.a.valid.token") is None

    def test_verify_empty_token(self):
        assert verify_jwt("") is None

    def test_create_different_users(self):
        t1 = create_jwt("user1", "alice")
        t2 = create_jwt("user2", "bob")
        assert t1 != t2

    def test_verify_tampered_token(self):
        token = create_jwt("user1", "alice")
        # Tamper with the payload portion
        parts = token.split(".")
        tampered = parts[0] + "." + parts[1] + "x" + "." + parts[2]
        assert verify_jwt(tampered) is None