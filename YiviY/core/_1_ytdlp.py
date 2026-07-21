import os
import sys
import glob
import re
import subprocess
import time
from core.utils import *

# Session-level cache: only update yt-dlp once per session
_ytdlp_class = None
_ytdlp_update_done = False

def sanitize_filename(filename):
    # Remove or replace illegal characters
    filename = re.sub(r'[<>:"/\\|?*]', '', filename)
    # Ensure filename doesn't start or end with a dot or space
    filename = filename.strip('. ')
    # Use default name if filename is empty
    return filename if filename else 'video'


def _do_update_ytdlp():
    """Update yt-dlp to latest version. Called once per session."""
    try:
        subprocess.check_call(
            [sys.executable, "-m", "pip", "install", "--upgrade", "yt-dlp"],
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
        )
        if 'yt_dlp' in sys.modules:
            del sys.modules['yt_dlp']
        rprint("[green]yt-dlp updated[/green]")
        return True
    except subprocess.CalledProcessError:
        rprint("[yellow]Warning: Failed to update yt-dlp, using current version[/yellow]")
        return False


def get_ytdlp():
    """Get YoutubeDL class, updating it once per session if needed."""
    global _ytdlp_class, _ytdlp_update_done
    if _ytdlp_class is not None:
        return _ytdlp_class
    if not _ytdlp_update_done:
        _ytdlp_update_done = True
        _do_update_ytdlp()
    from yt_dlp import YoutubeDL
    _ytdlp_class = YoutubeDL
    return _ytdlp_class


def _build_progress_hook(status_callback=None):
    """Build a yt-dlp progress hook that reports download progress."""
    def progress_hook(d):
        if d['status'] == 'downloading':
            total = d.get('total_bytes') or d.get('total_bytes_estimate')
            downloaded = d.get('downloaded_bytes', 0)
            speed = d.get('speed') or 0
            eta = d.get('eta')  # seconds
            pct = (downloaded / total * 100) if total else 0

            if status_callback:
                status_callback({
                    'status': 'downloading',
                    'percent': round(pct, 1),
                    'downloaded': downloaded,
                    'total': total,
                    'speed': speed,
                    'speed_str': d.get('_speed_str', ''),
                    'eta': eta,
                    'eta_str': d.get('_eta_str', ''),
                    'filename': d.get('filename', ''),
                })
        elif d['status'] == 'finished':
            if status_callback:
                status_callback({
                    'status': 'finished',
                    'filename': d.get('filename', ''),
                })
    return progress_hook


def download_video_ytdlp(url, save_path='output', resolution='1080',
                          download_format='video+audio', status_callback=None,
                          download_subs=False, sub_langs=None):
    """
    Download a YouTube video using yt-dlp.

    Args:
        url: YouTube URL
        save_path: Directory to save the video
        resolution: '360', '480', '720', '1080', '1440', '2160', or 'best'
        download_format: 'video+audio' or 'audio-only'
        status_callback: Optional callback(dict) for progress updates
        download_subs: Whether to download subtitles
        sub_langs: List of language codes for subtitles (e.g. ['en', 'zh'])
    """
    os.makedirs(save_path, exist_ok=True)

    # Build format string
    if download_format == 'audio-only':
        format_str = 'bestaudio/best'
    elif download_format == 'video+audio':
        if resolution == 'best':
            format_str = 'bestvideo+bestaudio/best'
        else:
            # Prefer mp4 formats; fall back gracefully
            format_str = (
                f'bestvideo[height<={resolution}][ext=mp4]+bestaudio[ext=m4a]/'
                f'bestvideo[height<={resolution}]+bestaudio/'
                f'best[height<={resolution}]/'
                f'best'
            )
    else:
        format_str = 'bestvideo+bestaudio/best'

    ydl_opts = {
        'format': format_str,
        'outtmpl': f'{save_path}/%(title)s.%(ext)s',
        'noplaylist': True,
        'quiet': True,
        'no_warnings': True,
        'progress_hooks': [_build_progress_hook(status_callback)],
        'merge_output_format': 'mp4',
        'concurrent_fragment_downloads': 8,
        'retries': 5,
        'fragment_retries': 5,
        'file_access_retries': 3,
        'extractor_retries': 3,
        'socket_timeout': 30,
    }

    # Only download thumbnail for video
    if download_format != 'audio-only':
        ydl_opts['writethumbnail'] = True
        ydl_opts.setdefault('postprocessors', [])
        ydl_opts['postprocessors'].append({
            'key': 'FFmpegThumbnailsConvertor',
            'format': 'jpg',
        })

    # Subtitle download
    if download_subs:
        ydl_opts['writesubtitles'] = True
        ydl_opts['writeautomaticsub'] = True
        ydl_opts['subtitleslangs'] = sub_langs or ['en']
        ydl_opts['subtitlesformat'] = 'vtt'

    # Cookies for authentication
    try:
        cookies_path = load_key("youtube.cookies_path")
        if cookies_path and os.path.exists(cookies_path):
            ydl_opts["cookiefile"] = str(cookies_path)
    except KeyError:
        pass

    # Proxy support
    try:
        proxy = load_key("youtube.proxy")
        if proxy and proxy.strip():
            ydl_opts['proxy'] = proxy.strip()
            rprint(f"[dim]Using proxy: {proxy}[/dim]")
    except KeyError:
        pass

    # Get YoutubeDL class (updated once per session)
    YoutubeDL = get_ytdlp()

    # Download with retry for transient failures
    max_retries = 2
    last_error = None
    for attempt in range(max_retries + 1):
        try:
            with YoutubeDL(ydl_opts) as ydl:
                ydl.download([url])
            last_error = None
            break
        except Exception as e:
            last_error = e
            if attempt < max_retries:
                rprint(f"[yellow]Download attempt {attempt + 1} failed, retrying...[/yellow]")
                time.sleep(2)
            else:
                rprint(f"[red]Download failed after {max_retries + 1} attempts[/red]")
                raise

    if last_error:
        raise last_error

    # Sanitize filenames after download
    for file in os.listdir(save_path):
        filepath = os.path.join(save_path, file)
        if os.path.isfile(filepath):
            filename, ext = os.path.splitext(file)
            new_filename = sanitize_filename(filename)
            if new_filename != filename:
                new_path = os.path.join(save_path, new_filename + ext)
                os.rename(filepath, new_path)


def find_video_files(save_path='output'):
    """Find the downloaded video file. Returns the path to the video file."""
    allowed_formats = load_key("allowed_video_formats")

    # Collect all video files in save_path (not in subdirectories)
    video_files = []
    for file in os.listdir(save_path):
        filepath = os.path.join(save_path, file)
        if not os.path.isfile(filepath):
            continue
        ext = os.path.splitext(file)[1]
        if not ext:
            continue
        ext_clean = ext[1:].lower()  # remove leading dot
        if ext_clean in allowed_formats:
            video_files.append(filepath)

    # Normalize paths on Windows
    if sys.platform.startswith('win'):
        video_files = [f.replace("\\", "/") for f in video_files]

    if len(video_files) == 0:
        raise FileNotFoundError(
            f"No video file found in '{save_path}'. "
            f"Supported formats: {', '.join(allowed_formats)}"
        )
    if len(video_files) > 1:
        raise ValueError(
            f"Found {len(video_files)} video files in '{save_path}'. "
            f"Please ensure only one video exists. Files: {video_files}"
        )

    return video_files[0]


def get_video_info(url):
    """Get video metadata without downloading."""
    YoutubeDL = get_ytdlp()
    ydl_opts = {
        'quiet': True,
        'no_warnings': True,
        'noplaylist': True,
    }
    # Apply proxy if configured
    try:
        proxy = load_key("youtube.proxy")
        if proxy and proxy.strip():
            ydl_opts['proxy'] = proxy.strip()
    except KeyError:
        pass

    try:
        cookies_path = load_key("youtube.cookies_path")
        if cookies_path and os.path.exists(cookies_path):
            ydl_opts["cookiefile"] = str(cookies_path)
    except KeyError:
        pass

    with YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(url, download=False)
        return {
            'title': info.get('title', 'Unknown'),
            'duration': info.get('duration', 0),
            'duration_str': f"{info.get('duration', 0) // 60}:{info.get('duration', 0) % 60:02d}",
            'view_count': info.get('view_count', 0),
            'uploader': info.get('uploader', 'Unknown'),
            'thumbnail': info.get('thumbnail', ''),
            'description': (info.get('description', '') or '')[:200],
            'formats_available': len(info.get('formats', [])),
        }


if __name__ == '__main__':
    # Example usage
    url = input('Please enter the URL of the video you want to download: ')
    resolution = input('Please enter the desired resolution (360/480/720/1080/1440/2160/best, default 1080): ')
    if resolution.isdigit():
        resolution = int(resolution) if int(resolution) in [360, 480, 720, 1080, 1440, 2160] else 1080
    elif resolution.lower() == 'best':
        pass
    else:
        resolution = 1080

    def cb(info):
        if info['status'] == 'downloading':
            print(f"\rDownloading: {info['percent']}% | Speed: {info['speed_str']} | ETA: {info['eta_str']}", end='')
        elif info['status'] == 'finished':
            print(f"\nProcessing: {info['filename']}")

    download_video_ytdlp(url, resolution=str(resolution), status_callback=cb)
    print(f"\n🎥 Video has been downloaded to {find_video_files()}")
