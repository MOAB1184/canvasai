import runpod
import os
import requests
import tempfile
import google.generativeai as genai
from google.generativeai.types import HarmCategory, HarmBlockThreshold

def download_file(url):
    response = requests.get(url, stream=True)
    response.raise_for_status()
    # Create a temp file
    fd, path = tempfile.mkstemp(suffix=".webm") # Assuming webm for now, could be dynamic
    with os.fdopen(fd, 'wb') as f:
        for chunk in response.iter_content(chunk_size=8192):
            f.write(chunk)
    return path

def handler(job):
    job_input = job["input"]
    audio_url = job_input.get("audio_url")
    gemini_api_key = job_input.get("gemini_api_key") or os.environ.get("GEMINI_API_KEY")

    if not audio_url:
        return {"error": "Missing audio_url"}
    if not gemini_api_key:
        return {"error": "Missing gemini_api_key"}

    print(f"Processing audio from: {audio_url}")

    try:
        # 1. Configure Gemini
        genai.configure(api_key=gemini_api_key)
        
        # 2. Download Audio
        local_audio_path = download_file(audio_url)
        file_size = os.path.getsize(local_audio_path)
        print(f"Downloaded to {local_audio_path}, size: {file_size} bytes")

        if file_size == 0:
             raise ValueError("Downloaded file is empty")

        # 2.5 Convert to MP3 (Fix for WebM issues)
        mp3_path = local_audio_path.replace(".webm", ".mp3")
        print("Converting to MP3...")
        import subprocess
        subprocess.run([
            "ffmpeg", "-i", local_audio_path, 
            "-vn", # Disable video
            "-acodec", "libmp3lame", 
            "-y", 
            mp3_path
        ], check=True)
        
        mp3_size = os.path.getsize(mp3_path)
        print(f"Converted to MP3: {mp3_path}, size: {mp3_size} bytes")

        # 3. Upload to Gemini
        print("Uploading to Gemini...")
        video_file = genai.upload_file(path=mp3_path, mime_type="audio/mp3")
        
        # Wait for processing
        import time
        while video_file.state.name == "PROCESSING":
            print('.', end='', flush=True)
            time.sleep(2)
            video_file = genai.get_file(video_file.name)

        if video_file.state.name == "FAILED":
            raise ValueError(f"Gemini file processing failed: {video_file.state.name}")

        print(f"\nFile processed: {video_file.uri}")

        # 4. Generate Content
        # User confirmed gemini-2.5-flash
        model = genai.GenerativeModel(model_name="gemini-2.5-flash")
        
        prompt = """
        You are an expert transcriptionist and summarizer. 
        1. Provide a full, accurate transcription of this audio.
        2. Provide a concise summary of the key points.

        Format the output in clean HTML (without ```html code blocks), suitable for pasting into a Canvas LMS page.
        Structure it as:
        <h2>Summary</h2>
        [Summary content]
        <h2>Transcription</h2>
        [Transcription content]
        """

        response = model.generate_content(
            [prompt, video_file],
            request_options={"timeout": 600}
        )

        # Cleanup
        os.remove(local_audio_path)
        # Optional: delete from Gemini to save space/privacy? 
        # genai.delete_file(video_file.name) 

        return {"html_content": response.text}

    except Exception as e:
        print(f"Error: {str(e)}")
        return {"error": str(e)}

runpod.serverless.start({"handler": handler})
