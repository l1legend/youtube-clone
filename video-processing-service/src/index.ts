import express from "express";
import ffmpeg from "fluent-ffmpeg";

const app = express();
app.use(express.json());

app.post("/process-video", (req, res) => {
    // get path of the input video file from the request body
    const inputFilePath = req.body.inputFilePath;
    const outputFilePath = req.body.outputFilePath;

    if (!inputFilePath || !outputFilePath) {
        res.status(400).send("Bad Request: Missing file path.");
    }

    ffmpeg(inputFilePath)
        .outputOptions("-vf", "scale=640:360") // Fixed dimensions
        .outputOptions("-c:v", "libx264") // Specify video codec
        .outputOptions("-c:a", "aac") // Specify audio codec
        .on("start", (commandLine) => {
            console.log(`FFmpeg process started with command: ${commandLine}`);
        })
        .on("end", () => {
            res.status(200).send("Video processing finished successfully");
        })
        .on("error", (err) => {
            console.log(`An error occurred: ${err.message}`);
            res.status(500).send(`Internal Server Error: ${err.message}`);
        })
        .on("stderr", (stderrLine) => {
            console.log(`FFmpeg stderr: ${stderrLine}`);
        })
        .save(outputFilePath);
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`Video processing service listening at http://localhost:${port}`);
});
