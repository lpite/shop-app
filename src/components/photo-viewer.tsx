import { Base64 } from "js-base64";
import { useState } from "react";

type PhotoViewerProps = {
  photo?: string;
};

export default function PhotoViewer({ photo }: PhotoViewerProps) {
  const [isLoading, setIsLoading] = useState(true);
  if (!photo) {
    return null;
  }

  return (
    <div className="fixed end-0 top-20 bottom-20 w-3/6 bg-black bg-opacity-20 flex items-center justify-center">
      {isLoading ? (
        <div className="fixed start-60 top-0 end-0 right-0 bg-black bg-opacity-30 w-full h-full flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-sky-800 rounded-full border-t-transparent animate-spin"></div>
        </div>
      ) : null}
      <img
        className="h-5/6"
        onLoad={() => setIsLoading(false)}
        onError={() => setIsLoading(false)}
        src={
          "http://" +
          localStorage.getItem("ip") +
          "/api/get-photo.php?photo=" +
          encodeURIComponent(Base64.encode(photo))
        }
      />
    </div>
  );
}
