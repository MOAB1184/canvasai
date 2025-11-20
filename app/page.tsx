"use client";

import { useState, useRef } from "react";
import { Mic, Square, Loader2 } from "lucide-react";

export default function Home() {
  const [isRecording, setIsRecording] = useState(false);
  const [status, setStatus] = useState<"idle" | "recording" | "processing" | "completed">("idle");
  const [lectureId, setLectureId] = useState<string | null>(null);
  
  // Refs for recording
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      setStatus("recording");
    } catch (error) {
      console.error("Error accessing microphone:", error);
      alert("Could not access microphone. Please check permissions.");
    }
  };

  const stopRecording = async () => {
    if (!mediaRecorderRef.current) return;

    setIsRecording(false);
    setStatus("processing");

    // Stop recording and wait for final data
    const mediaRecorder = mediaRecorderRef.current;
    
    return new Promise<void>((resolve) => {
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: "audio/webm" });
        const file = new File([audioBlob], `recording-${Date.now()}.webm`, { type: "audio/webm" });
        
        const formData = new FormData();
        formData.append("file", file);

        try {
          const res = await fetch("/api/upload", {
            method: "POST",
            body: formData,
          });
          
          if (!res.ok) throw new Error("Upload failed");
          
          const data = await res.json();
          console.log("File saved at:", data.path);
          setLectureId("saved-locally"); // Temp ID for now
          setStatus("completed");
        } catch (error) {
          console.error("Error uploading recording", error);
          setStatus("idle");
          alert("Failed to save recording.");
        }
        
        // Stop all tracks
        mediaRecorder.stream.getTracks().forEach(track => track.stop());
        resolve();
      };

      mediaRecorder.stop();
    });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-2">Lecture Recorder</h2>
        <p className="text-slate-600">
          Record your lecture. Summaries will be automatically generated and pushed to Canvas.
        </p>
      </div>

      <div className="p-12 rounded-full bg-slate-100 relative">
        {isRecording && (
          <div className="absolute inset-0 rounded-full animate-ping bg-red-100"></div>
        )}
        <button
          onClick={isRecording ? stopRecording : startRecording}
          disabled={status === "processing"}
          className={`relative z-10 w-32 h-32 rounded-full flex items-center justify-center transition-all ${
            isRecording
              ? "bg-red-500 hover:bg-red-600 text-white"
              : "bg-slate-900 hover:bg-slate-800 text-white"
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {status === "processing" ? (
            <Loader2 className="w-12 h-12 animate-spin" />
          ) : isRecording ? (
            <Square className="w-12 h-12" />
          ) : (
            <Mic className="w-12 h-12" />
          )}
        </button>
      </div>

      <div className="text-xl font-medium h-8">
        {status === "recording" && <span className="text-red-500 animate-pulse">Recording...</span>}
        {status === "processing" && <span className="text-slate-500">Processing & Summarizing...</span>}
        {status === "completed" && (
          <div className="text-green-600 flex flex-col items-center">
            <span>Recording Saved!</span>
            <span className="text-sm text-slate-500 mt-1">Summary sent to Canvas (Lecture ID: {lectureId})</span>
            <a href={`/recordings/${lectureId}`} className="text-sm text-blue-500 underline mt-2">View Recording</a>
          </div>
        )}
      </div>
    </div>
  );
}
