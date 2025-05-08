import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { 
  Download, Copy, Share, RefreshCw, Image, Palette,
  CloudDownload, Loader, Check
} from "lucide-react";

const BACKEND_URL = "http://localhost:5000";

export default function QRGenerator({ menuId, menuName, onClose }) {
  // State management
  const [qrData, setQrData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [customizing, setCustomizing] = useState(false);
  const [qrOptions, setQrOptions] = useState({
    foregroundColor: "#000000",
    backgroundColor: "#FFFFFF",
    logoUrl: null,
    cornerRadius: 0,
    margin: 16,
    logoSize: 60
  });
  const [copied, setCopied] = useState(false);
  const [downloadStarted, setDownloadStarted] = useState(false);
  const [error, setError] = useState(null);
  
  // Refs
  const qrContainerRef = useRef(null);
  const fileInputRef = useRef(null);
  
  // Effect to generate QR code on initial load
  useEffect(() => {
    if (menuId) {
      generateQR();
    }
  }, [menuId]);
  
  // Generate QR code with options
  const generateQR = async (options = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem("token");
      
      const response = await axios.post(
        `${BACKEND_URL}/api/qr-generator`,
        {
          menuId,
          ...qrOptions,
          ...options
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      setQrData(response.data);
      setCustomizing(false);
    } catch (error) {
      console.error("Error generating QR code:", error);
      setError("Failed to generate QR code. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  
  // Handle logo upload
  const handleLogoUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", "image");
    
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      
      const response = await axios.post(
        `${BACKEND_URL}/api/uploads`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      const logoUrl = response.data.fileUrl;
      setQrOptions({ ...qrOptions, logoUrl });
      generateQR({ logoUrl });
    } catch (error) {
      console.error("Error uploading logo:", error);
      setError("Failed to upload logo. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  
  // Download QR code
  const downloadQR = async (format = 'png') => {
    if (!qrData?.qrCodeUrl) return;
    
    setDownloadStarted(true);
    
    try {
      // You can implement different format downloads (PNG, SVG, PDF) here
      const a = document.createElement("a");
      a.href = qrData.qrCodeUrl;
      a.download = `${menuName || 'menu'}-qr-code.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      // Reset the download started state after a delay
      setTimeout(() => {
        setDownloadStarted(false);
      }, 2000);
    } catch (error) {
      console.error("Error downloading QR code:", error);
      setError("Failed to download QR code. Please try again.");
      setDownloadStarted(false);
    }
  };
  
  // Copy QR code URL
  const copyQrUrl = () => {
    if (!qrData?.menuUrl) return;
    
    navigator.clipboard.writeText(qrData.menuUrl);
    setCopied(true);
    
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };
  
  // Share QR code
  const shareQR = async () => {
    if (!qrData?.menuUrl) return;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${menuName || 'Restaurant'} AR Menu`,
          text: 'Scan this QR code to view our AR menu!',
          url: qrData.menuUrl
        });
      } catch (error) {
        console.error("Error sharing:", error);
      }
    } else {
      copyQrUrl();
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-auto overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white">
        <h2 className="text-2xl font-bold">AR Menu QR Code</h2>
        <p className="opacity-90">
          {menuName ? `For "${menuName}"` : "Share your menu with customers"}
        </p>
      </div>
      
      {/* Content */}
      <div className="p-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-10">
            <Loader className="w-12 h-12 text-blue-600 animate-spin mb-4" />
            <p>Generating your QR code...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
            <p className="text-red-700">{error}</p>
            <button 
              className="mt-2 text-red-700 underline"
              onClick={() => generateQR()}
            >
              Try again
            </button>
          </div>
        ) : qrData ? (
          <div className="flex flex-col items-center">
            {!customizing && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gray-100 p-4 rounded-lg mb-6 text-center"
                ref={qrContainerRef}
              >
                {/* QR Code Display */}
                <div className="relative mb-3 inline-block">
                  <img 
                    src={qrData.qrCodeUrl} 
                    alt="QR Code" 
                    className="w-64 h-64 object-contain"
                  />
                  
                  {/* Floating Indicator for AR Capability */}
                  <div className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                    AR
                  </div>
                </div>
                
                {/* URL Display */}
                <div className="text-sm text-gray-500 mt-2 mb-4">
                  <p className="truncate max-w-xs mx-auto">{qrData.menuUrl}</p>
                </div>
                
                {/* Action Buttons */}
                <div className="flex justify-center space-x-3">
                  <button
                    onClick={() => downloadQR('png')}
                    disabled={downloadStarted}
                    className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-400"
                  >
                    {downloadStarted ? (
                      <>
                        <Check size={18} className="mr-1" />
                        Downloaded
                      </>
                    ) : (
                      <>
                        <Download size={18} className="mr-1" />
                        Download
                      </>
                    )}
                  </button>
                  
                  <button
                    onClick={copyQrUrl}
                    className="flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                  >
                    {copied ? (
                      <>
                        <Check size={18} className="mr-1 text-green-600" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy size={18} className="mr-1" />
                        Copy URL
                      </>
                    )}
                  </button>
                  
                  <button
                    onClick={shareQR}
                    className="flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                  >
                    <Share size={18} className="mr-1" />
                    Share
                  </button>
                </div>
              </motion.div>
            )}
            
            {/* Customization UI */}
            {customizing ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full bg-gray-50 p-4 rounded-lg mb-6"
              >
                <h3 className="font-medium text-lg mb-4">Customize QR Code</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Foreground Color
                    </label>
                    <div className="flex items-center">
                      <input
                        type="color"
                        value={qrOptions.foregroundColor}
                        onChange={(e) => 
                          setQrOptions({
                            ...qrOptions,
                            foregroundColor: e.target.value
                          })
                        }
                        className="w-10 h-10 border-0 p-0 mr-2"
                      />
                      <input
                        type="text"
                        value={qrOptions.foregroundColor}
                        onChange={(e) =>
                          setQrOptions({
                            ...qrOptions,
                            foregroundColor: e.target.value
                          })
                        }
                        className="w-24 p-2 border rounded-md"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Background Color
                    </label>
                    <div className="flex items-center">
                      <input
                        type="color"
                        value={qrOptions.backgroundColor}
                        onChange={(e) =>
                          setQrOptions({
                            ...qrOptions,
                            backgroundColor: e.target.value
                          })
                        }
                        className="w-10 h-10 border-0 p-0 mr-2"
                      />
                      <input
                        type="text"
                        value={qrOptions.backgroundColor}
                        onChange={(e) =>
                          setQrOptions({
                            ...qrOptions,
                            backgroundColor: e.target.value
                          })
                        }
                        className="w-24 p-2 border rounded-md"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Corner Radius
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="50"
                      value={qrOptions.cornerRadius}
                      onChange={(e) =>
                        setQrOptions({
                          ...qrOptions,
                          cornerRadius: parseInt(e.target.value)
                        })
                      }
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Square</span>
                      <span>Rounded</span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Logo Size
                    </label>
                    <input
                      type="range"
                      min="30"
                      max="100"
                      value={qrOptions.logoSize}
                      onChange={(e) =>
                        setQrOptions({
                          ...qrOptions,
                          logoSize: parseInt(e.target.value)
                        })
                      }
                      className="w-full"
                      disabled={!qrOptions.logoUrl}
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Small</span>
                      <span>Large</span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Restaurant Logo
                  </label>
                  <div className="flex items-center">
                    {qrOptions.logoUrl ? (
                      <div className="relative mr-3">
                        <img
                          src={qrOptions.logoUrl}
                          alt="Logo"
                          className="w-16 h-16 object-contain border rounded-md"
                        />
                        <button
                          onClick={() => setQrOptions({ ...qrOptions, logoUrl: null })}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                        >
                          ×
                        </button>
                      </div>
                    ) : null}
                    
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-2 bg-gray-100 text-gray-700 rounded flex items-center text-sm hover:bg-gray-200"
                    >
                      <Image size={16} className="mr-1" />
                      {qrOptions.logoUrl ? "Change Logo" : "Add Logo"}
                    </button>
                    
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept="image/*"
                      onChange={handleLogoUpload}
                    />
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    onClick={() => setCustomizing(false)}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => generateQR()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Generate QR
                  </button>
                </div>
              </motion.div>
            ) : (
              <div className="w-full flex justify-center mb-6">
                <button
                  onClick={() => setCustomizing(true)}
                  className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                >
                  <Palette size={18} className="mr-1" />
                  Customize QR
                </button>
              </div>
            )}
            
            {/* Instructions */}
            <div className="w-full bg-blue-50 p-4 rounded-lg border border-blue-100">
              <h3 className="font-medium text-blue-800 mb-2">
                How to use your QR code:
              </h3>
              <ul className="text-sm text-blue-700 space-y-2">
                <li className="flex items-start">
                  <CloudDownload size={16} className="mr-2 mt-0.5 flex-shrink-0" />
                  <span>Download and print the QR code to display in your restaurant</span>
                </li>
                <li className="flex items-start">
                  <Share size={16} className="mr-2 mt-0.5 flex-shrink-0" />
                  <span>Share the link with customers on your website or social media</span>
                </li>
                <li className="flex items-start">
                  <RefreshCw size={16} className="mr-2 mt-0.5 flex-shrink-0" />
                  <span>When you update your menu, customers will always see the latest version</span>
                </li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="text-center py-10">
            <p>No QR code generated yet.</p>
            <button
              onClick={() => generateQR()}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Generate QR Code
            </button>
          </div>
        )}
      </div>
      
      {/* Footer */}
      <div className="bg-gray-50 px-6 py-4 flex justify-end">
        <button
          onClick={onClose}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
}