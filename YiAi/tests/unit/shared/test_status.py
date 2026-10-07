"""Tests for shared/status.py — canonical status constants and normalization."""
from shared.status import (
    Status, CLOSED_STATUSES, ACTIVE_STATUSES, NOT_DONE_STATUSES,
    OPEN_BUG_STATUSES, normalize_status, normalize_status_list,
    is_closed, is_active
)


class TestStatusConstants:
    def test_status_values_are_strings(self):
        """All Status constants are lowercase strings."""
        for attr in dir(Status):
            if attr.isupper() and not attr.startswith("_"):
                val = getattr(Status, attr)
                assert isinstance(val, str), f"Status.{attr} should be str"
                assert val == val.lower(), f"Status.{attr} should be lowercase"

    def test_done_is_done(self):
        assert Status.DONE == "done"

    def test_in_progress(self):
        assert Status.IN_PROGRESS == "in_progress"

    def test_bug_statuses(self):
        assert Status.OPEN == "open"
        assert Status.CLOSED == "closed"
        assert Status.REOPENED == "reopened"
        assert Status.RESOLVED == "resolved"


class TestStatusGroups:
    def test_closed_statuses(self):
        assert Status.DONE in CLOSED_STATUSES
        assert Status.CLOSED in CLOSED_STATUSES
        assert Status.RESOLVED in CLOSED_STATUSES
        assert Status.CANCELLED in CLOSED_STATUSES
        assert Status.IN_PROGRESS not in CLOSED_STATUSES

    def test_active_statuses(self):
        assert Status.TODO in ACTIVE_STATUSES
        assert Status.IN_PROGRESS in ACTIVE_STATUSES
        assert Status.IN_REVIEW in ACTIVE_STATUSES
        assert Status.DONE not in ACTIVE_STATUSES

    def test_open_bug_statuses(self):
        assert Status.OPEN in OPEN_BUG_STATUSES
        assert Status.REOPENED in OPEN_BUG_STATUSES
        assert Status.CLOSED not in OPEN_BUG_STATUSES

    def test_not_done_statuses(self):
        assert Status.DONE in NOT_DONE_STATUSES
        assert Status.CANCELLED in NOT_DONE_STATUSES
        assert Status.BACKLOG in NOT_DONE_STATUSES


class TestNormalizeStatus:
    def test_title_case_to_canonical(self):
        assert normalize_status("Done") == "done"
        assert normalize_status("In Progress") == "in_progress"
        assert normalize_status("To Do") == "todo"

    def test_capitalized(self):
        assert normalize_status("Closed") == "closed"
        assert normalize_status("Resolved") == "resolved"
        assert normalize_status("Open") == "open"

    def test_aliases(self):
        assert normalize_status("Completed") == "done"
        assert normalize_status("completed") == "done"
        assert normalize_status("active") == "active"

    def test_unknown_passthrough(self):
        assert normalize_status("custom_status") == "custom_status"

    def test_already_canonical(self):
        assert normalize_status("done") == "done"
        assert normalize_status("in_progress") == "in_progress"


class TestNormalizeStatusList:
    def test_includes_canonical_and_legacy(self):
        result = normalize_status_list([Status.DONE])
        assert "done" in result
        assert "Done" in result
        assert "Completed" in result

    def test_no_duplicates(self):
        result = normalize_status_list([Status.DONE, Status.DONE])
        assert len(result) == len(set(result))


class TestIsClosed:
    def test_closed_states(self):
        assert is_closed("done") is True
        assert is_closed("Done") is True
        assert is_closed("closed") is True
        assert is_closed("resolved") is True

    def test_open_states(self):
        assert is_closed("in_progress") is False
        assert is_closed("todo") is False
        assert is_closed("open") is False


class TestIsActive:
    def test_active_states(self):
        assert is_active("todo") is True
        assert is_active("in_progress") is True
        assert is_active("in_review") is True
        assert is_active("To Do") is True

    def test_inactive_states(self):
        assert is_active("done") is False
        assert is_active("closed") is False
        assert is_active("backlog") is False