import { useState } from "react";
import { QRCodeCanvas } from "qrcode.react";

export default function QrCodeScanner() {
  const [showQr, setShowQr] = useState(false);
  const [qrText] = useState("https://example.com");

  const handleButtonClick = () => {
    setShowQr(true);
  };

  const handleCloseQr = () => {
    setShowQr(false);
  };

  return (
    <div>
      {/* Button to open QR popup */}
      <button type="button" className="p-0 mt-2" onClick={handleButtonClick}>
        <svg
          width="32"
          height="32"
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M5 6.5C5 5.672 5.672 5 6.5 5H12.5C13.328 5 14 5.672 14 6.5V12.5C14 13.328 13.328 14 12.5 14H6.5C6.10218 14 5.72064 13.842 5.43934 13.5607C5.15804 13.2794 5 12.8978 5 12.5V6.5ZM5 19.5C5 18.672 5.672 18 6.5 18H12.5C13.328 18 14 18.672 14 19.5V25.5C14 26.328 13.328 27 12.5 27H6.5C6.10218 27 5.72064 26.842 5.43934 26.5607C5.15804 26.2794 5 25.8978 5 25.5V19.5ZM18 6.5C18 5.672 18.672 5 19.5 5H25.5C26.328 5 27 5.672 27 6.5V12.5C27 13.328 26.328 14 25.5 14H19.5C19.1022 14 18.7206 13.842 18.4393 13.5607C18.15804 13.2794 18 12.8978 18 12.5V6.5Z"
            stroke="black"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M9 9H10V10H9V9ZM9 22H10V23H9V22ZM22 9H23V10H22V9ZM18 18H19V19H18V18ZM18 26H19V27H18V26ZM26 18H27V19H26V18ZM26 26H27V27H26V26ZM22 22H23V23H22V22Z"
            stroke="black"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {/* QR Popup */}
      {showQr && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg flex flex-col items-center justify-center relative w-96 h-[70vh]">
            <QRCodeCanvas
              value={qrText}
              size={370} // Ensures QR fits inside the modal size (adjust as needed)
              bgColor="#ffffff"
              fgColor="#000000"
              level="H"
              marginSize={4}
            />
            <button
              onClick={handleCloseQr}
              className="mt-4 px-4 py-2 bg-[#040b2b] text-white rounded-lg"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
