import React from "react";
// import { useMimeType } from "../../../hooks/useMIMEtype";

interface CertificateViewerProps {
  url: string;
}

const CertificateViewer: React.FC<CertificateViewerProps> = ({ url }) => {
  const fileName = url.split("?")[0].split("/").pop()?.toLowerCase() || "";

  if (/\.(jpg|jpeg|png|webp|gif)$/i.test(fileName)) {
    return <img src={url} alt="Certificate" style={{ maxWidth: "100%", maxHeight: 350 }} />;
  }

 if (url.endsWith(".pdf")) {
  return (
    <object
      data={url}
      type="application/pdf"
      width="100%"
      height="400px"
    >
      <p className="text-center text-gray-600">
        PDF preview is not available.{" "}
        <a href={url} target="_blank" rel="noopener noreferrer" className="underline">
          Click here to download
        </a>
      </p>
    </object>
  );
}

  if (fileName.endsWith(".doc") || fileName.endsWith(".docx")) {
    const googleViewer = `https://docs.google.com/gview?url=${encodeURIComponent(url)}&embedded=true`;
    return <iframe src={googleViewer} title="Certificate DOCX" style={{ width: "100%", height: 350 }} />;
  }

  return (
    <div className="flex items-center justify-center h-72 bg-gray-100 rounded-lg border border-gray-200">
      <span className="text-gray-500">
        Cannot preview this file type.
        <a href={url} target="_blank" rel="noopener noreferrer" className="underline ml-2">Download</a>
      </span>
    </div>
  );
};


export default CertificateViewer;
