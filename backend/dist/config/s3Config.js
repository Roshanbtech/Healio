"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.AwsConfig = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const lib_storage_1 = require("@aws-sdk/lib-storage");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const crypto = __importStar(require("crypto"));
const stream_1 = require("stream");
class AwsConfig {
    constructor() {
        this.bucketName = process.env.S3_BUCKET_NAME;
        this.region = process.env.S3_BUCKET_REGION;
        this.s3client = new client_s3_1.S3Client({
            credentials: {
                accessKeyId: process.env.S3_ACCESS_KEY,
                secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
            },
            region: this.region,
        });
    }
    async getfile(fileName, folder) {
        try {
            const sanitizedFolder = folder.endsWith("/")
                ? folder.slice(0, -1)
                : folder;
            const key = `${sanitizedFolder}/${fileName}`;
            const options = {
                Bucket: this.bucketName,
                Key: key,
            };
            const getCommand = new client_s3_1.GetObjectCommand(options);
            const url = await (0, s3_request_presigner_1.getSignedUrl)(this.s3client, getCommand, {
                expiresIn: 1 * 60
            });
            return url;
        }
        catch (error) {
            console.error("Error generating signed URL:", error);
            throw error;
        }
    }
    async uploadFileToS3(folderPath, file) {
        try {
            console.log("Uploading file to S3 using @aws-sdk/lib-storage...");
            const uniqueName = crypto.randomBytes(16).toString("hex");
            const fileExtension = file.mimetype.split("/")[1];
            const fileName = `${folderPath}${uniqueName}.${fileExtension}`;
            const fileStream = stream_1.Readable.from(file.buffer);
            const upload = new lib_storage_1.Upload({
                client: this.s3client,
                params: {
                    Bucket: this.bucketName,
                    Key: fileName,
                    Body: fileStream,
                    ContentType: file.mimetype,
                },
            });
            const result = await upload.done();
            console.log("File successfully uploaded to S3:", result);
            return fileName;
        }
        catch (error) {
            console.error("Error uploading file to S3:", error.message);
            throw new Error("File upload failed");
        }
    }
}
exports.AwsConfig = AwsConfig;
