import { extractTranscript } from "@/lib/youtube/extractTranscript";

async function runTest() {

  try {

    console.log("Starting YouTube transcript test...");

    const url = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";

    const transcript = await extractTranscript(url);

    console.log("Transcript fetched successfully ✅");

    console.log("Length:", transcript);

    console.log("Preview:");
    // console.log(transcript.slice(0, 300));

  } catch (error) {

    console.error("Test failed ❌");
    console.error(error);

  }

}

// IMPORTANT: call function properly
runTest();