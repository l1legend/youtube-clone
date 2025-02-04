// 1. GCS file interactions
// 2. GCS file interactions

import { Storage } from '@google-cloud/storage';
import fs from 'fs';
import ffmpeg from 'fluent-ffmpeg';

// Initialize Google Cloud Storage client
const storage = new Storage();

// Define bucket names for raw and processed videos
const rawVideoBucketName = "mintwin-raw-videos";
const processedVideoBucketName = "mintwin-processed-videos"; //bucket in google cloud is called mintwin-processed-video due to typo. The docker container contains the ts code from the typo version and is uploadeding processed videos to mintwin-processed-video. Will need to reuploaded the docker container to gc in the future with the corrected name and test it. 

// Define local paths for storing raw and processed videos
const localRawVideoPath = "./raw-videos";
const localProcessedVideoPath = "./processed-videos";


/**
 * Creates the local directories for raw and processed videos.
 */
export function setupDirectories() {
    ensureDirectoryExistence(localRawVideoPath);
    ensureDirectoryExistence(localProcessedVideoPath);
}

/**
 * Converts a video file from raw format to processed format.
 * @param rawVideoName - The name of the file to convert from {@link localRawVideoPath}.
 * @param processedVideoName - The name of the file to convert to {@link localProcessedVideoPath}.
 * @returns A promise that resolves when the video has been converted.
 */

export function convertVideo(rawVideoName: string, processedVideoName: string) {
    return new Promise<void>((resolve, reject) => {
        ffmpeg(`${localRawVideoPath}/${rawVideoName}`)
            .outputOptions("-vf", "scale=640:360") // Fixed dimensions
            .outputOptions("-c:v", "libx264") // Specify video codec (H.264)
            .outputOptions("-c:a", "aac") // Specify audio codec 

            .on("end", () => {
                console.log("Video processing finished successfully");
                resolve();
            })

            .on("error", (err) => {
                console.log(`An error occurred: ${err.message}`);
                reject(err);
            })

            .on("stderr", (stderrLine) => {
                console.log(`FFmpeg stderr: ${stderrLine}`);
            })
            .save(`${localProcessedVideoPath}/${processedVideoName}`);
    })
}

/**
 * Downloads a raw video from Google Cloud Storage to the local directory.
 * @param fileName - The name of the file to download from the 
 * {@link rawVideoBucketName} bucket into the {@link localRawVideoPath} folder.
 * @returns A promise that resolves when the file has been downloaded.
 */
export async function downloadRawVideo(fileName: string) {
    await storage.bucket(rawVideoBucketName)
        .file(fileName)
        .download({ destination: `${localRawVideoPath}/${fileName}` });

    console.log(
        `gs://${rawVideoBucketName}/${fileName} downloaded to ${localRawVideoPath}/${fileName}.`
    )
}

/**
 * Uploads a processed video from the local directory to Google Cloud Storage. 
 * @param fileName - The name of the file to upload from the 
 * {@link localProcessedVideoPath} folder into the {@link processedVideoBucketName}.
 * @returns A promise that resolves when the file has been uploaded.
 */
export async function uploadProcessedVideo(fileName: string) {
    const bucket = storage.bucket(processedVideoBucketName);

    await bucket.upload(`${localProcessedVideoPath}/${fileName}`, {
        destination: fileName,
    });
    console.log(
        `${localProcessedVideoPath}/${fileName} uploaded to gs://${processedVideoBucketName}/${fileName}.`
    );

    await bucket.file(fileName).makePublic();
}

/**
 * Deletes a raw video file from the local directory.
 * @param fileName - The name of the file to delete from the
 * {@link localRawVideoPath} folder.
 * @returns A promise that resolves when the file has been deleted.
 * 
 */
export function deleteRawVideo(fileName: string) {
    return deleteFile(`${localRawVideoPath}/${fileName}`);
  }
  
  
  /**
  * @param fileName - The name of the file to delete from the
  * {@link localProcessedVideoPath} folder.
  * @returns A promise that resolves when the file has been deleted.
  * 
  */
  export function deleteProcessedVideo(fileName: string) {
    return deleteFile(`${localProcessedVideoPath}/${fileName}`);
  }
  
/**
 * Deletes a file from the local filesystem.
 * @param filePath - The path of the file to delete.
 * @returns A promise that resolves when the file has been deleted.
 */
function deleteFile(filePath: string): Promise<void> {
    return new Promise((resolve, reject) => {
        if (fs.existsSync(filePath)) {
            fs.unlink(filePath, (err) => {
                if (err) {
                    console.log(`Failed to delete file at ${filePath}, err`);
                    reject(err);
                }
                else {
                    console.log(`File deleted successfully at ${filePath}`);
                    resolve();
                }
            });
        }
        else {
            console.log(`File not found at ${filePath}, skipping the delete.`);
            resolve();
        }
    });
}

/**
 * Ensures a directory exists, creating it if necessary.
 * @param {string} dirPath - The directory path to check.
 */
function ensureDirectoryExistence(dirPath: string) {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true }); // recursive: true enables creating nested directories
      console.log(`Directory created at ${dirPath}`);
    }
  }