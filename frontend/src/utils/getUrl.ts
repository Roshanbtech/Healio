export const signedUrltoNormalUrl = (signedUrl: string) => {
    return signedUrl.split("?")[0];
  };