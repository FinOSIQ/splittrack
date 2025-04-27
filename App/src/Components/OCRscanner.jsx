import React, { useState, useRef, useCallback } from "react";
import Webcam from "react-webcam";
import { analyzeReceipt, fetchReceiptResults } from "../utils/requests/OCR";
import {
  CameraIcon,
  CheckIcon,
  ArrowPathIcon,
  XMarkIcon,
} from "@heroicons/react/24/solid";

export default function OCRscanner() {
  const [isOpen, setIsOpen] = useState(false);
  const [image, setImage] = useState(null);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const webcamRef = useRef(null);

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    setImage(imageSrc);
    setText("");
  }, []);

  const processImage = async () => {
    if (!image) return;
    setLoading(true);
    try {
      const blob = dataURLtoBlob(image);
      const response = await analyzeReceipt(blob);
      const operationLocation = response.headers["operation-location"];
      if (!operationLocation) {
        setText("Operation-Location header missing.");
        return;
      }
      const result = await fetchReceiptResults(operationLocation);
      setText(result.analyzeResult.content);
    } catch (error) {
      setText(`${error}`);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const dataURLtoBlob = (dataurl) => {
    const arr = dataurl.split(",");
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  };

  return (
    <div>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="w-12 h-12 flex items-center justify-center rounded-full transition"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="52"
          height="52"
          viewBox="0 0 48 46"
          fill="none"
          className="w-7 h-7"
        >
          <path
            d="M4 17.2499V12.4583C4 7.68575 8.02 3.83325 13 3.83325H18M30 3.83325H35C39.98 3.83325 44 7.68575 44 12.4583V17.2499M44 30.6666V33.5416C44 38.3141 39.98 42.1666 35 42.1666H32M18 42.1666H13C8.02 42.1666 4 38.3141 4 33.5416V28.7499M38 22.9999H10M34 18.2083V27.7916C34 31.6249 32 33.5416 28 33.5416H20C16 33.5416 14 31.6249 14 27.7916V18.2083C14 14.3749 16 12.4583 20 12.4583H28C32 12.4583 34 14.3749 34 18.2083Z"
            stroke="#040B2B"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-4 relative">
            {/* Close Button */}
            <button
              onClick={() => {
                setIsOpen(false);
                setImage(null);
                setText("");
              }}
              className="absolute top-2 right-2 text-gray-600 hover:text-black"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>

            {/* Webcam or Captured Image */}
            {!image ? (
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/png"
                className="w-full rounded"
                style={{ aspectRatio: "3/4" }}
                videoConstraints={{
                        facingMode: { exact: "environment" }, // Forces back camera
                    }}
              />
            ) : (
              <img src={image} alt="Captured" className="w-full rounded mb-2" />
            )}

            {/* Action Buttons */}
            <div className="mt-4 flex gap-4 justify-center">
              {!image ? (
                <button
                  onClick={capture}
                  className="w-16 h-16 flex items-center justify-center rounded-full bg-white border-2 border-black shadow-md"
                >
                  <CameraIcon className="w-6 h-6 text-black" />
                </button>
              ) : (
                <>
                  {/* Confirm Button */}
                  <button
                    onClick={processImage}
                    className="w-16 h-16 flex items-center justify-center rounded-full bg-white border-2 border-black shadow-md"
                  >
                    {loading ? (
                      <div className="text-xs text-black">...</div>
                    ) : (
                      <CheckIcon className="w-6 h-6 text-black" />
                    )}
                  </button>

                  {/* Retake Button */}
                  <button
                    onClick={() => setImage(null)}
                    className="w-16 h-16 flex items-center justify-center rounded-full bg-white border-2 border-black shadow-md"
                  >
                    <ArrowPathIcon className="w-6 h-6 text-black" />
                  </button>
                </>
              )}
            </div>

            {/* Extracted Text */}
            {/* {text && (
              <div className="mt-4 p-2 border rounded text-sm max-h-40 overflow-auto whitespace-pre-wrap">
                <h3 className="font-semibold mb-1">Extracted Text:</h3>
                <p>{text}</p>
              </div>
            )} */}
          </div>
        </div>
      )}
    </div>
  );
}
