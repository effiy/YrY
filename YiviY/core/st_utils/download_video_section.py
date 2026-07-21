import os
import re
import shutil
import subprocess
import time

import streamlit as st
from core._1_ytdlp import download_video_ytdlp, find_video_files, get_video_info
from core.utils import *
from translations.translations import translate as t

OUTPUT_DIR = "output"


def _validate_youtube_url(url: str) -> bool:
    """Basic validation for YouTube URLs."""
    youtube_patterns = [
        r'^https?://(www\.)?youtube\.com/watch\?v=',
        r'^https?://(www\.)?youtube\.com/shorts/',
        r'^https?://youtu\.be/',
        r'^https?://(www\.)?youtube\.com/embed/',
        r'^https?://(www\.)?youtube\.com/live/',
        r'^https?://(www\.)?youtube\.com/playlist\?list=',
    ]
    return any(re.match(p, url) for p in youtube_patterns)


def download_video_section():
    st.header(t("a. Download or Upload Video"))
    with st.container(border=True):
        try:
            video_file = find_video_files()
            st.video(video_file)
            col1, col2 = st.columns(2)
            with col1:
                if st.button(t("Delete and Reselect"), key="delete_video_button",
                             use_container_width=True):
                    os.remove(video_file)
                    # Also clean up related files
                    for f in os.listdir(OUTPUT_DIR):
                        fpath = os.path.join(OUTPUT_DIR, f)
                        if os.path.isfile(fpath):
                            os.remove(fpath)
                    time.sleep(0.5)
                    st.rerun()
            with col2:
                # Show video info if available
                file_size_mb = os.path.getsize(video_file) / (1024 * 1024)
                st.caption(f"📁 {os.path.basename(video_file)} ({file_size_mb:.1f} MB)")
            return True
        except FileNotFoundError:
            # No video found, show download/upload UI
            _render_download_ui()
            return False
        except ValueError as e:
            # Multiple videos found
            st.warning(str(e))
            if st.button(t("Clean output folder"), key="clean_output_btn"):
                if os.path.exists(OUTPUT_DIR):
                    shutil.rmtree(OUTPUT_DIR)
                os.makedirs(OUTPUT_DIR, exist_ok=True)
                time.sleep(0.5)
                st.rerun()
            return False


def _render_download_ui():
    """Render the YouTube download and file upload interface."""
    col1, col2 = st.columns([3, 1])
    with col1:
        url = st.text_input(
            t("Enter YouTube link:"),
            placeholder="https://www.youtube.com/watch?v=...",
            key="youtube_url_input",
        )
    with col2:
        res_dict = {
            "360p": "360",
            "480p": "480",
            "720p": "720",
            "1080p": "1080",
            "1440p (2K)": "1440",
            "2160p (4K)": "2160",
            "Best": "best",
        }
        target_res = load_key("ytb_resolution")
        res_options = list(res_dict.keys())
        try:
            default_idx = list(res_dict.values()).index(target_res)
        except ValueError:
            default_idx = 3  # Default to 1080p
        res_display = st.selectbox(
            t("Resolution"),
            options=res_options,
            index=default_idx,
            key="resolution_select",
        )
        res = res_dict[res_display]

    # Download format: video+audio or audio-only
    try:
        default_fmt = load_key("youtube.download_format")
    except KeyError:
        default_fmt = "video+audio"
    fmt_options = {
        "video+audio": "🎬 Video + Audio",
        "audio-only": "🎵 Audio Only",
    }
    fmt_idx = list(fmt_options.keys()).index(default_fmt) if default_fmt in fmt_options else 0
    download_format = st.radio(
        t("Download Format"),
        options=list(fmt_options.keys()),
        format_func=lambda x: fmt_options[x],
        index=fmt_idx,
        horizontal=True,
        key="download_format_radio",
    )

    # Advanced options in a collapsible section
    with st.expander(t("Advanced Options"), expanded=False):
        try:
            download_subs_default = load_key("youtube.download_subtitles")
        except KeyError:
            download_subs_default = False
        download_subs = st.checkbox(
            t("Download subtitles"),
            value=download_subs_default,
            key="download_subs_checkbox",
        )
        if download_subs:
            sub_langs = st.text_input(
                t("Subtitle languages"),
                value="en",
                placeholder="en,zh-CN,ja (comma separated ISO 639-1 codes)",
                key="sub_langs_input",
            )
            sub_langs_list = [lang.strip() for lang in sub_langs.split(",") if lang.strip()]
        else:
            sub_langs_list = None

    # Download button
    download_col1, download_col2 = st.columns([2, 1])
    with download_col1:
        download_clicked = st.button(
            t("Download Video"),
            key="download_button",
            use_container_width=True,
            type="primary",
        )
    with download_col2:
        # Preview button
        preview_clicked = st.button(
            t("Preview Info"),
            key="preview_button",
            use_container_width=True,
        )

    # Handle preview
    if preview_clicked and url:
        if not _validate_youtube_url(url):
            st.error(t("Invalid YouTube URL. Please enter a valid YouTube link."))
        else:
            with st.spinner(t("Fetching video info...") + " 🔍"):
                try:
                    info = get_video_info(url)
                    st.info(
                        f"**{info['title']}**\n\n"
                        f"📺 {t('Uploader')}: {info['uploader']}\n"
                        f"⏱️ {t('Duration')}: {info['duration_str']}\n"
                        f"👁️ {t('Views')}: {info['view_count']:,}\n"
                        f"📋 {t('Available formats')}: {info['formats_available']}",
                    )
                except Exception as e:
                    st.error(f"{t('Failed to fetch video info')}: {str(e)}")

    # Handle download
    if download_clicked and url:
        if not _validate_youtube_url(url):
            st.error(t("Invalid YouTube URL. Please enter a valid YouTube link."))
        else:
            # Create placeholders for progress
            progress_bar = st.progress(0, text=t("Preparing download..."))
            status_text = st.empty()
            speed_text = st.empty()

            def progress_callback(info):
                if info['status'] == 'downloading':
                    pct = min(info['percent'], 100)
                    progress_bar.progress(
                        int(pct),
                        text=f"{t('Downloading')}... {info['percent']}%",
                    )
                    if info.get('speed_str'):
                        speed_text.caption(
                            f"⚡ {info['speed_str']} | ⏳ ETA: {info.get('eta_str', '...')}"
                        )
                elif info['status'] == 'finished':
                    progress_bar.progress(100, text=t("Processing video...") + " 🔄")
                    speed_text.empty()

            try:
                sub_langs_arg = sub_langs_list if download_subs else None
                download_video_ytdlp(
                    url,
                    save_path=OUTPUT_DIR,
                    resolution=res,
                    download_format=download_format,
                    status_callback=progress_callback,
                    download_subs=download_subs,
                    sub_langs=sub_langs_arg,
                )
                progress_bar.progress(100, text=t("Download complete!") + " ✅")
                status_text.empty()
                speed_text.empty()
                time.sleep(0.8)
                st.rerun()
            except Exception as e:
                progress_bar.empty()
                status_text.empty()
                speed_text.empty()
                error_msg = str(e)
                # Make common errors more user-friendly
                if "HTTP Error 403" in error_msg:
                    st.error(
                        t("YouTube blocked the request. Try setting a proxy in YouTube Settings "
                          "or check your cookies.")
                    )
                elif "HTTP Error 429" in error_msg:
                    st.error(
                        t("Too many requests. Please wait a moment and try again.")
                    )
                elif "Private video" in error_msg or " unavailable" in error_msg:
                    st.error(
                        t("This video is unavailable. It may be private, deleted, "
                          "or region-restricted.")
                    )
                elif "confirm your age" in error_msg.lower():
                    st.error(
                        t("This video requires age verification. Please set cookies "
                          "in YouTube Settings.")
                    )
                else:
                    st.error(f"{t('Download failed')}: {error_msg}")

    # File uploader as fallback
    st.divider()
    uploaded_file = st.file_uploader(
        t("Or upload video"),
        type=load_key("allowed_video_formats") + load_key("allowed_audio_formats"),
        key="video_uploader",
        label_visibility="collapsed",
    )
    if uploaded_file:
        if os.path.exists(OUTPUT_DIR):
            shutil.rmtree(OUTPUT_DIR)
        os.makedirs(OUTPUT_DIR, exist_ok=True)

        raw_name = uploaded_file.name.replace(' ', '_')
        name, ext = os.path.splitext(raw_name)
        clean_name = re.sub(r'[^\w\-_\.]', '', name) + ext.lower()

        filepath = os.path.join(OUTPUT_DIR, clean_name)
        with open(filepath, "wb") as f:
            f.write(uploaded_file.getbuffer())

        if ext.lower() in load_key("allowed_audio_formats"):
            convert_audio_to_video(filepath)
        st.rerun()


def convert_audio_to_video(audio_file: str) -> str:
    output_video = os.path.join(OUTPUT_DIR, 'black_screen.mp4')
    if not os.path.exists(output_video):
        print(f"🎵➡️🎬 Converting audio to video with FFmpeg ......")
        ffmpeg_cmd = [
            'ffmpeg', '-y',
            '-f', 'lavfi', '-i', 'color=c=black:s=640x360',
            '-i', audio_file,
            '-shortest',
            '-c:v', 'libx264', '-c:a', 'aac',
            '-pix_fmt', 'yuv420p',
            output_video,
        ]
        subprocess.run(ffmpeg_cmd, check=True, capture_output=True, text=True, encoding='utf-8')
        print(f"🎵➡️🎬 Converted <{audio_file}> to <{output_video}> with FFmpeg\n")
        os.remove(audio_file)
    return output_video
