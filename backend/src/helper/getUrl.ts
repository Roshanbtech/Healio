import {awsFileUpload} from "./uploadFiles";
import { AwsConfig } from "../config/s3Config";

export const getUrl = async (key: string) => {
  const uploadkey = key.split("/").pop()!;
  const folder = key.substring(0, key.lastIndexOf("/") + 1);
  const aws = new awsFileUpload(new AwsConfig());
  const url = await aws.getPresignedUrl(uploadkey, folder);
  return url;
};