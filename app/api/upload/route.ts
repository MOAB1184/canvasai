import { NextRequest, NextResponse } from "next/server";
import { Storage } from "@/lib/Storage";
import { Canvas } from "@/lib/Canvas";

const RUNPOD_ENDPOINT_ID = process.env.RUNPOD_ENDPOINT_ID;
const RUNPOD_API_KEY = process.env.RUNPOD_API_KEY;
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // 1. Upload to Wasabi
    console.log("Uploading to Wasabi...");
    const audioUrl = await Storage.uploadFile(file);
    console.log("File uploaded to:", audioUrl);

    // 2. Call RunPod Worker
    console.log("Calling RunPod...");
    if (!RUNPOD_ENDPOINT_ID || !RUNPOD_API_KEY) {
      throw new Error("Missing RunPod configuration");
    }

    const runpodResponse = await fetch(`https://api.runpod.ai/v2/${RUNPOD_ENDPOINT_ID}/runsync`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RUNPOD_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        input: {
          audio_url: audioUrl,
          gemini_api_key: GOOGLE_API_KEY
        }
      })
    });

    if (!runpodResponse.ok) {
      const errText = await runpodResponse.text();
      throw new Error(`RunPod API error: ${errText}`);
    }

    const runpodData = await runpodResponse.json();
    console.log("RunPod response:", runpodData);

    if (runpodData.status === "FAILED") {
      throw new Error(`RunPod job failed: ${JSON.stringify(runpodData)}`);
    }

    const generatedContent = runpodData.output?.html_content;

    if (!generatedContent) {
      throw new Error("No content generated from RunPod");
    }

    // 3. Push to Canvas
    let canvasUrl = null;
    try {
      const lectureTitle = `Lecture Summary - ${new Date().toLocaleString()}`;
      canvasUrl = await Canvas.createPage(lectureTitle, generatedContent);
      console.log("Canvas Page Created:", canvasUrl);
    } catch (canvasError) {
      console.error("Canvas integration skipped/failed:", canvasError);
    }

    // 4. Cleanup Wasabi
    try {
      await Storage.deleteFile(audioUrl);
    } catch (cleanupError) {
      console.error("Failed to cleanup Wasabi file:", cleanupError);
    }

    return NextResponse.json({
      success: true,
      path: audioUrl,
      canvasUrl: canvasUrl
    });

  } catch (error) {
    console.error("Error uploading/processing file:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal Server Error" },
      { status: 500 }
    );
  }
}
