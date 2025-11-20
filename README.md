# CanvasAI Lecture Recorder

A Next.js application that records lectures, uploads them to Wasabi Storage, transcribes/summarizes them using a RunPod worker (Gemini 1.5 Flash), and publishes the summary to Canvas LMS.

## Features
- **Audio Recording**: Record lectures directly in the browser.
- **Cloud Storage**: Securely store audio in Wasabi (S3 compatible).
- **AI Processing**: Scalable transcription and summarization using RunPod serverless workers.
- **Canvas Integration**: Automatically create pages in Canvas with the lecture summary.

## Setup

1.  **Clone the repository**:
    ```bash
    git clone <your-repo-url>
    cd canvasai
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Environment Variables**:
    Create a `.env` file with the following:
    ```env
    # Canvas
    CANVAS_BASE_URL=https://<your-canvas-instance>.instructure.com
    CANVAS_ACCESS_TOKEN=your_canvas_token
    CANVAS_COURSE_ID=your_course_id

    # Wasabi
    WASABI_ACCESS_KEY=your_wasabi_key
    WASABI_SECRET_KEY=your_wasabi_secret
    WASABI_REGION=us-east-1
    WASABI_BUCKET_NAME=your_bucket

    # RunPod
    RUNPOD_API_KEY=your_runpod_key
    RUNPOD_ENDPOINT_ID=your_endpoint_id
    GOOGLE_API_KEY=your_gemini_key
    ```

4.  **Run Locally**:
    ```bash
    npm run dev
    ```

## Deployment
See `walkthrough.md` for detailed deployment instructions for the RunPod worker.
