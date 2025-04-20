import React, { useState, useRef, useCallback } from "react";
import Webcam from "react-webcam";
import { analyzeReceipt , fetchReceiptResults } from "../utils/requests/OCR";


export default function OCRscanner() {
    const webcamRef = useRef(null);
    const [image, setImage] = useState(null);
    const [text, setText] = useState("");
    const [loading, setLoading] = useState(false);

    // Capture an image from the webcam
    const capture = useCallback(() => {
        const imageSrc = webcamRef.current.getScreenshot();
        setImage(imageSrc);
        setText(""); // Clear previous text
    }, [webcamRef]);

    const processImage = async () => {
        if (!image) return;
        setLoading(true);
    
        try {
            // Convert Base64 image to binary Blob
            const blob = dataURLtoBlob(image);
            // Call your Azure OCR API
            const response = await analyzeReceipt(blob);
    
            // Log the response status and headers
            console.log("Response Status:", response.status);
            console.log("Response Headers:", response.headers);
           
            // setText(`${response.headers}`);
            const operationLocation = response.headers['operation-location'];
            console.log("Operation-Location:", operationLocation);
            
            if (!operationLocation) {
                setText("Operation-Location header missing in response.");
                return;
            }
    
            console.log("Operation-Location:", operationLocation);
    
            // Wait (optional) or directly call fetchReceiptResults
            const result = await fetchReceiptResults(operationLocation);
    
            const content = result.analyzeResult.content;
            console.log(content);
            setText(content);
            

        } catch (error) {
            setText(`${error}`);
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const dataURLtoBlob = (dataurl) => {
        const arr = dataurl.split(',');
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
        <div className="p-4">
            <h2 className="text-lg font-bold">Camera OCR with Tesseract.js</h2>

            {/* Webcam Preview with Back Camera */}
            {!image ? (
                <Webcam
                    audio={false}
                    ref={webcamRef}
                    screenshotFormat="image/png"
                    videoConstraints={{
                        facingMode: { exact: "environment" }, // Forces back camera
                    }}
                    className="w-full h-auto"
                />
            ) : (
                <img src={image} alt="Captured" className="w-full h-auto mt-2" />
            )}

            {/* Buttons */}
            <div className="mt-4 flex gap-2">
                {!image ? (
                    <button onClick={capture} className="bg-blue-500 text-white px-4 py-2 rounded">
                        Capture Image
                    </button>
                ) : (
                    <>
                        <button onClick={processImage} className="bg-green-500 text-white px-4 py-2 rounded">
                            {loading ? "Processing..." : "Extract Text"}
                        </button>
                        <button onClick={() => setImage(null)} className="bg-red-500 text-white px-4 py-2 rounded">
                            Retake
                        </button>
                    </>
                )}
            </div>

            {/* Extracted Text */}
            {text && (
                <div className="mt-4 p-2 border">
                    <h3 className="font-semibold">Extracted Text:</h3>
                    <p>{text}</p>
                </div>
            )}
        </div>
    );
}
