import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleAIFileManager, FileState } from "@google/generative-ai/server";

const API_KEY = process.env.GOOGLE_API_KEY;

export class Gemini {
  static async transcribeAudio(filePath: string, mimeType: string) {
    if (!API_KEY) {
      throw new Error("GOOGLE_API_KEY is not set");
    }

    const fileManager = new GoogleAIFileManager(API_KEY);
    const genAI = new GoogleGenerativeAI(API_KEY);

    console.log("Uploading file to Gemini...", filePath);
    
    // 1. Upload the file
    const uploadResult = await fileManager.uploadFile(filePath, {
      mimeType: mimeType,
      displayName: "Lecture Recording",
    });

    const fileUri = uploadResult.file.uri;
    console.log(`File uploaded: ${fileUri}`);

    // 2. Wait for file to be processed
    let file = await fileManager.getFile(uploadResult.file.name);
    while (file.state === FileState.PROCESSING) {
        console.log("Processing file...");
        await new Promise((resolve) => setTimeout(resolve, 2000)); // Sleep 2s
        file = await fileManager.getFile(uploadResult.file.name);
    }

    if (file.state === FileState.FAILED) {
        throw new Error("Gemini file processing failed");
    }

    console.log("File processed. Generating transcription...");

    // 3. Generate content (Transcribe & Summarize)
    // Using gemini-1.5-flash as it accepts audio input and is fast
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });


    
    const result = await model.generateContent([
      "You are an expert transcriptionist and summarizer. \n" +
      "1. Provide a full, accurate transcription of this audio.\n" +
      "2. Provide a concise summary of the key points.\n\n" +
      "Format the output in clean HTML (without ```html code blocks), suitable for pasting into a Canvas LMS page.\n" +
      "Structure it as:\n" +
      "<h2>Summary</h2>\n[Summary content]\n" +
      "<h2>Transcription</h2>\n[Transcription content]",
      {
        fileData: {
          fileUri: fileUri,
          mimeType: mimeType,
        },
      },
    ]);

    const response = result.response;
    return response.text();
  }
}
