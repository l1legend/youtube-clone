import express from 'express';
import ffmpeg from 'fluent-ffmpeg';

const app = express();
const port = 3000;

app.post("/process-video", (req, res) => {
    // get path of the input video file from the request body
    const inputFilePath = req.body.inputFilePath;
    const outputFilePath = req.body.outputFilePath;

    //check if inputFilePath is missing
    if (!inputFilePath) {
        return res.status(400).send("Bad request: inputFilePath is missing");
    }

    // Check if outputFilePath is missing
    if (!outputFilePath) {
        return res.status(400).send("Bad request: outputFilePath is missing");
    }

    ffmpeg(inputFilePath)
        .outputOptions("-vf", "scale=-1:360") // 360p
        .on("end", () => {

        })
        .on("error", (err) => {
            console.log(`An error occurred: ${err.message}`);
            res.status(500).send(`Internal Server Error: ${err.message}`);
        })
        .save(outputFilePath);
    return res.status(200).send("Video processing started");
});

app.listen(port, () => {
    console.log(
        `Video processing service listening at http://localhost:${port}`);
});