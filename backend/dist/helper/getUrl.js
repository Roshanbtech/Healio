"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUrl = void 0;
const uploadFiles_1 = require("./uploadFiles");
const s3Config_1 = require("../config/s3Config");
const getUrl = async (key) => {
    const uploadkey = key.split("/").pop();
    const folder = key.substring(0, key.lastIndexOf("/") + 1);
    const aws = new uploadFiles_1.awsFileUpload(new s3Config_1.AwsConfig());
    const url = await aws.getPresignedUrl(uploadkey, folder);
    return url;
};
exports.getUrl = getUrl;
