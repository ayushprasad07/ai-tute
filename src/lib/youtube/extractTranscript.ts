import {YoutubeTranscript} from "youtube-transcript";

export async function extractTranscript(videoUrl : string){
    try {
        if(!videoUrl)  throw new Error("Please provide video url");
        const transcript = await YoutubeTranscript.fetchTranscript(videoUrl);

        return transcript.map((item) => item.text).join(" ");
    } catch (error) {
        console.log("Error while extracting transcript",error);
        throw new Error("Error while extracting transcript");
    }
}