import { useEffect, useState } from "react";

/**
 * Custom hook that fetches MIME type of a given URL
 * Works reliably even for Cloudinary `raw` resources by using a range-based GET request
 */
export const useMimeType = (url: string) => {
  const [mime, setMime] = useState<string | null>(null);

  useEffect(() => {
    const fetchMime = async () => {
      try {
        const response = await fetch(url, {
          method: "GET",
          headers: { Range: "bytes=0-0" }, // Lightweight fetch to trigger headers with MIME info
        });

        const contentType = response.headers.get("Content-Type");
        if (contentType) {
          setMime(contentType);
        } else {
          console.warn("Content-Type missing in response headers.");
          setMime(null);
        }
      } catch (error) {
        console.error("❌ MIME fetch failed:", error);
        setMime(null);
      }
    };

    if (url) {
      fetchMime();
    }
  }, [url]);

  return mime;
};
