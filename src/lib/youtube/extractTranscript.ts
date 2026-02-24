// import { YoutubeTranscript } from "youtube-transcript";
// import { fetchTranscript } from 'youtube-transcript-plus';
import { Supadata, TranscriptChunk } from "@supadata/js";
import "dotenv/config";

const supadata = new Supadata({
  apiKey: process.env.SUPADATA_API_KEY!,
})

export async function extractTranscript(videoUrl: string) {
  try {
    if (!videoUrl) throw new Error("Please provide video url");

    // const transcript = await YoutubeTranscript.fetchTranscript(videoUrl);
    // const transcript = await fetchTranscript(videoUrl);
    // console.log("RAW TRANSCRIPT OBJECT:", transcript);

    // if (!transcript || transcript.length === 0) {
    //   console.error("❌ No transcript found for video:", videoUrl);
    //   throw new Error("Transcript not available");
    // }

    // const text = transcript
    //   .map((item) => item.text)
    //   .filter(Boolean)
    //   .join(" ");

    // if (!text || text.trim().length < 50) {
    //   throw new Error("Transcript too short");
    // }

    // return text;

    const transcriptResult = await supadata.transcript({
      url: videoUrl,
      lang: "en", // optional
      text: true, // optional: return plain text instead of timestamped chunks
      mode: "auto", // optional: 'native', 'auto', or 'generate'
    });

    // console.log("TRANSCRIPT RESULT:", transcriptResult);

    if(!("content" in transcriptResult)){
       throw new Error ("Transcript not ready yet");
    }

    const content = transcriptResult.content;

    if(typeof content == "string"){
      return content;
    }

    if (Array.isArray(content)) {

      const text = content
        .map((chunk: TranscriptChunk) => chunk.text)
        .filter(Boolean)
        .join(" ");

      if (text.trim().length < 50) {
        throw new Error("Transcript too short");
      }

      return text;
    }

    throw new Error("Unknown transcript format");


    // return transcriptResult.content;

  } catch (error) {
    console.log("❌ Error while extracting transcript:", error);
    throw new Error("Transcript extraction failed");
  }
}
