"""Integration tests for domain/files/local.py — real filesystem I/O."""
import os
import pytest
import tempfile
import shutil
import base64
from unittest.mock import patch
from domain.files.local import (
    read_file,
    write_file,
    delete_file,
    delete_folder,
    rename_file,
    rename_folder,
    upload_file,
    _resolve_project_path,
    read_project_file,
    write_project_file,
    delete_project_folder,
    rename_project_folder,
)
from shared.exceptions import BusinessException


def _patch_settings(temp_dir):
    """Patch settings in both local.py and paths.py to use temp_dir."""
    patches = [
        patch("domain.files.local.settings"),
        patch("domain.files.paths.settings"),
    ]
    result = [p.start() for p in patches]
    for s in result:
        s.static_base_dir = temp_dir
        s.static_base_url = "http://localhost/static"
    return patches, result


@pytest.fixture
def temp_static_dir():
    d = tempfile.mkdtemp()
    yield d
    shutil.rmtree(d, ignore_errors=True)


@pytest.fixture
def temp_projects_root():
    d = tempfile.mkdtemp()
    os.makedirs(os.path.join(d, "YiVad", "src"), exist_ok=True)
    yield d
    shutil.rmtree(d, ignore_errors=True)


class TestReadWriteFile:
    @pytest.mark.asyncio
    async def test_write_and_read_text(self, temp_static_dir):
        patches, _ = _patch_settings(temp_static_dir)
        try:
            await write_file("test/hello.md", "# Hello", False)
            result = await read_file("test/hello.md")
            assert result["content"] == "# Hello"
            assert result["type"] == "text"
        finally:
            for p in patches:
                p.stop()

    @pytest.mark.asyncio
    async def test_write_and_read_base64(self, temp_static_dir):
        patches, _ = _patch_settings(temp_static_dir)
        try:
            # Non-UTF-8 binary data to trigger base64 path
            binary = b"\x00\x01\x02\x03\xff\xfe"
            b64 = base64.b64encode(binary).decode()
            await write_file("test/data.bin", b64, True)
            result = await read_file("test/data.bin")
            assert result["content"] == b64
            assert result["type"] == "base64"
        finally:
            for p in patches:
                p.stop()

    @pytest.mark.asyncio
    async def test_read_nonexistent_file(self, temp_static_dir):
        patches, _ = _patch_settings(temp_static_dir)
        try:
            with pytest.raises(BusinessException, match="File does not exist"):
                await read_file("nonexistent.md")
        finally:
            for p in patches:
                p.stop()

    @pytest.mark.asyncio
    async def test_read_image_returns_url(self, temp_static_dir):
        patches, _ = _patch_settings(temp_static_dir)
        try:
            img_dir = os.path.join(temp_static_dir, "images")
            os.makedirs(img_dir, exist_ok=True)
            img_path = os.path.join(img_dir, "photo.png")
            with open(img_path, "wb") as f:
                f.write(b"\x89PNG\r\n\x1a\n")

            result = await read_file("images/photo.png")
            assert result["type"] == "url"
            assert "photo.png" in result["content"]
        finally:
            for p in patches:
                p.stop()


class TestDeleteFile:
    @pytest.mark.asyncio
    async def test_delete_existing_file(self, temp_static_dir):
        patches, _ = _patch_settings(temp_static_dir)
        try:
            file_path = os.path.join(temp_static_dir, "to_delete.md")
            with open(file_path, "w") as f:
                f.write("content")

            result = await delete_file("to_delete.md")
            assert result["message"] == "Delete successful"
            assert not os.path.exists(file_path)
        finally:
            for p in patches:
                p.stop()

    @pytest.mark.asyncio
    async def test_delete_nonexistent_file(self, temp_static_dir):
        patches, _ = _patch_settings(temp_static_dir)
        try:
            with pytest.raises(BusinessException, match="File does not exist"):
                await delete_file("nonexistent.md")
        finally:
            for p in patches:
                p.stop()


class TestDeleteFolder:
    @pytest.mark.asyncio
    async def test_delete_existing_folder(self, temp_static_dir):
        patches, _ = _patch_settings(temp_static_dir)
        try:
            dir_path = os.path.join(temp_static_dir, "to_delete_dir")
            os.makedirs(dir_path, exist_ok=True)
            with open(os.path.join(dir_path, "f.txt"), "w") as f:
                f.write("x")

            result = await delete_folder("to_delete_dir")
            assert result["message"] == "Delete successful"
            assert not os.path.exists(dir_path)
        finally:
            for p in patches:
                p.stop()

    @pytest.mark.asyncio
    async def test_delete_nonexistent_folder(self, temp_static_dir):
        patches, _ = _patch_settings(temp_static_dir)
        try:
            with pytest.raises(BusinessException, match="Directory does not exist"):
                await delete_folder("nonexistent_dir")
        finally:
            for p in patches:
                p.stop()


class TestRenameFile:
    @pytest.mark.asyncio
    async def test_rename_file(self, temp_static_dir):
        patches, _ = _patch_settings(temp_static_dir)
        try:
            file_path = os.path.join(temp_static_dir, "old.md")
            with open(file_path, "w") as f:
                f.write("content")

            result = await rename_file("old.md", "new.md")
            assert result["message"] == "Rename successful"
            assert not os.path.exists(file_path)
            assert os.path.exists(os.path.join(temp_static_dir, "new.md"))
        finally:
            for p in patches:
                p.stop()


class TestRenameFolder:
    @pytest.mark.asyncio
    async def test_rename_folder(self, temp_static_dir):
        patches, _ = _patch_settings(temp_static_dir)
        try:
            old_dir = os.path.join(temp_static_dir, "old_dir")
            os.makedirs(old_dir, exist_ok=True)
            with open(os.path.join(old_dir, "f.txt"), "w") as f:
                f.write("x")

            result = await rename_folder("old_dir", "new_dir")
            assert result["message"] == "Rename successful"
            assert not os.path.exists(old_dir)
            assert os.path.exists(os.path.join(temp_static_dir, "new_dir", "f.txt"))
        finally:
            for p in patches:
                p.stop()


class TestUploadFile:
    @pytest.mark.asyncio
    async def test_upload_text_file(self, temp_static_dir):
        patches, _ = _patch_settings(temp_static_dir)
        try:
            result = await upload_file("uploads", "data.json", '{"key": 1}', False)
            assert result["url"] == "/uploads/data.json"
            assert os.path.exists(os.path.join(temp_static_dir, "uploads", "data.json"))
        finally:
            for p in patches:
                p.stop()


class TestResolveProjectPath:
    def test_simple_project_path(self):
        with patch("domain.files.local.settings") as mock_settings:
            mock_settings.projects_root = "/tmp/projects"
            mock_settings.knowledge_base_dir = "/tmp/yk"
            abs_path, proj = _resolve_project_path("YiVad", "src/App.vue")
            assert abs_path.endswith("/tmp/projects/YiVad/src/App.vue")
            assert proj == "YiVad"

    def test_project_prefixed_path(self):
        with patch("domain.files.local.settings") as mock_settings:
            mock_settings.projects_root = "/tmp/projects"
            mock_settings.knowledge_base_dir = "/tmp/yk"
            abs_path, proj = _resolve_project_path("YiVad", "YiVad/src/App.vue")
            assert abs_path.endswith("/tmp/projects/YiVad/src/App.vue")
            assert proj == "YiVad"

    def test_knowledge_prefixed_path(self):
        with patch("domain.files.local.settings") as mock_settings:
            mock_settings.projects_root = "/tmp/projects"
            mock_settings.knowledge_base_dir = "/tmp/yk"
            abs_path, proj = _resolve_project_path("YiAi", "YiKnowledge/engineer/notes/test.md")
            assert abs_path.endswith("/tmp/yk/engineer/notes/test.md")
            assert proj == "YiAi"

    def test_empty_project_raises(self):
        with patch("domain.files.local.settings") as mock_settings:
            mock_settings.projects_root = "/tmp/projects"
            mock_settings.knowledge_base_dir = "/tmp/yk"
            with pytest.raises(BusinessException, match="Invalid project"):
                _resolve_project_path("", "src/foo.py")

    def test_traversal_rejected(self):
        with patch("domain.files.local.settings") as mock_settings:
            mock_settings.projects_root = "/tmp/projects"
            mock_settings.knowledge_base_dir = "/tmp/yk"
            with pytest.raises(BusinessException, match="Invalid path"):
                _resolve_project_path("YiVad", "../etc/passwd")

    def test_absolute_path_rejected(self):
        with patch("domain.files.local.settings") as mock_settings:
            mock_settings.projects_root = "/tmp/projects"
            mock_settings.knowledge_base_dir = "/tmp/yk"
            with pytest.raises(BusinessException, match="Invalid path"):
                _resolve_project_path("YiVad", "/etc/passwd")


class TestProjectFileOps:
    @pytest.mark.asyncio
    async def test_read_project_file(self, temp_projects_root):
        with patch("domain.files.local.settings") as mock_settings:
            mock_settings.projects_root = temp_projects_root
            mock_settings.knowledge_base_dir = os.path.join(temp_projects_root, "..", "YiKnowledge")

            fpath = os.path.join(temp_projects_root, "YiVad", "src", "App.vue")
            with open(fpath, "w") as f:
                f.write("<template></template>")

            result = await read_project_file("YiVad", "src/App.vue")
            assert result["content"] == "<template></template>"
            assert result["type"] == "text"
            assert result["source"] == "project_disk"

    @pytest.mark.asyncio
    async def test_read_nonexistent_project_file(self, temp_projects_root):
        with patch("domain.files.local.settings") as mock_settings:
            mock_settings.projects_root = temp_projects_root
            mock_settings.knowledge_base_dir = os.path.join(temp_projects_root, "..", "YiKnowledge")

            with pytest.raises(BusinessException, match="File does not exist"):
                await read_project_file("YiVad", "src/Missing.vue")

    @pytest.mark.asyncio
    async def test_write_project_file(self, temp_projects_root):
        with patch("domain.files.local.settings") as mock_settings:
            mock_settings.projects_root = temp_projects_root
            mock_settings.knowledge_base_dir = os.path.join(temp_projects_root, "..", "YiKnowledge")

            result = await write_project_file("YiVad", "src/New.vue", "<template>New</template>", False)
            assert result["message"] == "Write successful"
            fpath = os.path.join(temp_projects_root, "YiVad", "src", "New.vue")
            assert os.path.exists(fpath)

    @pytest.mark.asyncio
    async def test_delete_project_folder(self, temp_projects_root):
        with patch("domain.files.local.settings") as mock_settings:
            mock_settings.projects_root = temp_projects_root
            mock_settings.knowledge_base_dir = os.path.join(temp_projects_root, "..", "YiKnowledge")

            dir_path = os.path.join(temp_projects_root, "YiVad", "to_delete")
            os.makedirs(dir_path, exist_ok=True)
            with open(os.path.join(dir_path, "f.txt"), "w") as f:
                f.write("x")

            result = await delete_project_folder("YiVad", "to_delete")
            assert result["message"] == "Delete successful"
            assert not os.path.exists(dir_path)

    @pytest.mark.asyncio
    async def test_rename_project_folder(self, temp_projects_root):
        with patch("domain.files.local.settings") as mock_settings:
            mock_settings.projects_root = temp_projects_root
            mock_settings.knowledge_base_dir = os.path.join(temp_projects_root, "..", "YiKnowledge")

            old_dir = os.path.join(temp_projects_root, "YiVad", "old_dir")
            os.makedirs(old_dir, exist_ok=True)
            with open(os.path.join(old_dir, "f.txt"), "w") as f:
                f.write("x")

            result = await rename_project_folder("YiVad", "old_dir", "new_dir")
            assert result["message"] == "Rename successful"
            assert not os.path.exists(old_dir)
            assert os.path.exists(os.path.join(temp_projects_root, "YiVad", "new_dir", "f.txt"))