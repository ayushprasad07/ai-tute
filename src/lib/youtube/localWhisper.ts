import { spawn } from "child_process";
import path from "path";

export function localWhisperTranscribe(videoUrl: string): Promise<string> {
  return new Promise((resolve, reject) => {

    const scriptPath = path.join(process.cwd(), "ml", "transcribe.py");

    const pythonPath = path.join(
      process.cwd(),
      "ml",
      "venv",
      "bin",
      "python"
    );

    const pyProcess = spawn(pythonPath, [scriptPath, videoUrl]);

    let data = "";
    let error = "";

    pyProcess.stdout.on("data", (chunk) => {
      data += chunk.toString();
    });

    pyProcess.stderr.on("data", (chunk) => {
      error += chunk.toString();
    });

    pyProcess.on("close", (code) => {
      if (code !== 0) {
        reject(error);
      } else {
        resolve(data);
      }
    });
  });
}
