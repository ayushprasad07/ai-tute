// import { YoutubeTranscript } from "youtube-transcript";
import { fetchTranscript } from 'youtube-transcript-plus';

export async function extractTranscript(videoUrl: string) {
  try {
    if (!videoUrl) throw new Error("Please provide video url");

    // const transcript = await YoutubeTranscript.fetchTranscript(videoUrl);
    const transcript = await fetchTranscript(videoUrl);
    console.log("RAW TRANSCRIPT OBJECT:", transcript);

    if (!transcript || transcript.length === 0) {
      console.error("❌ No transcript found for video:", videoUrl);
      throw new Error("Transcript not available");
    }

    const text = transcript
      .map((item) => item.text)
      .filter(Boolean)
      .join(" ");

    if (!text || text.trim().length < 50) {
      throw new Error("Transcript too short");
    }

    return text;
  } catch (error) {
    console.log("❌ Error while extracting transcript:", error);
    throw new Error("Transcript extraction failed");
  }
}
