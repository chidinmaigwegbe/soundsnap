import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, X, ChevronRight, Settings, Music, Loader2, ExternalLink } from "lucide-react";
import { identifySongFromFile, identifySongFromUrl } from "./api.js";
import "./index.css";

// iPod-style App
function App() {
  const [currentScreen, setCurrentScreen] = useState("menu"); // menu, record, url, result, settings
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [songResult, setSongResult] = useState(null);
  const [error, setError] = useState(null);
  const [urlInput, setUrlInput] = useState("");
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem("soundsnap_settings");
    return saved ? JSON.parse(saved) : { phone: "", name: "" };
  });

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordingTimerRef = useRef(null);

  useEffect(() => {
    localStorage.setItem("soundsnap_settings", JSON.stringify(settings));
  }, [settings]);

  const startRecording = async () => {
    try {
      console.log("Starting recording...");
      setSongResult(null);
      setError(null);
      setIsRecording(true);
      setRecordingTime(0);
      setCurrentScreen("record");
      audioChunksRef.current = [];

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log("Got audio stream");
      const mediaRecorder = new MediaRecorder(stream);

      mediaRecorder.ondataavailable = (event) => {
        console.log("Data available:", event.data.size, "bytes");
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        console.log("Recording stopped. Chunks:", audioChunksRef.current.length);
        const mimeType = mediaRecorder.mimeType || "audio/webm";
        const extension = mimeType.includes("webm") ? "webm" : mimeType.includes("mp4") ? "mp4" : "wav";
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        const fileName = `recording.${extension}`;
        console.log("Sending file:", fileName, "Type:", mimeType, "Size:", audioBlob.size, "bytes");
        await identifySong(new File([audioBlob], fileName, { type: mimeType }));
      };

      mediaRecorder.onerror = (e) => {
        console.error("MediaRecorder error:", e);
        setError("Recording error occurred");
        setIsRecording(false);
        setCurrentScreen("result");
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start(100);
      console.log("MediaRecorder started");

      recordingTimerRef.current = setInterval(() => {
        setRecordingTime((prev) => {
          if (prev >= 9) {
            stopRecording();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);

      setTimeout(() => {
        if (mediaRecorderRef.current?.state === "recording") stopRecording();
      }, 10000);
    } catch {
      setError("Mic access needed");
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
    }
    setIsRecording(false);
  };

  const identifySong = async (file) => {
    setIsAnalyzing(true);
    setCurrentScreen("result"); // Show result screen immediately with loading state
    try {
      console.log("Identifying song...", file.name, file.type, file.size);
      const result = await identifySongFromFile(file);
      console.log("Result:", result);
      if (result.success && result.song) {
        setSongResult(result.song);
        setError(null);
      } else {
        setError(result.error || "Song not found");
        setSongResult(null);
      }
    } catch (err) {
      console.error("Error:", err);
      setError(err.message || "Failed to identify song");
      setSongResult(null);
    }
    setIsAnalyzing(false);
  };

  const shareOnWhatsApp = () => {
    if (!settings.phone) {
      setCurrentScreen("settings");
      return;
    }
    if (!songResult) return;

    const phone = settings.phone.replace(/\D/g, "");
    const message = `${songResult.title}\nby ${songResult.artist}\n${songResult.album ? `Album: ${songResult.album}` : ""}\n\nvia SoundSnap`;

    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, "_blank");
  };

  // Menu items
  const menuItems = [
    { id: "record", label: "Identify Song", icon: "🎤" },
    { id: "url", label: "Paste Link", icon: "🔗" },
    { id: "settings", label: "Settings", icon: "⚙️" },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-[#1a1c24] via-[#2a2d38] to-[#1a1c24]">
      {/* iPod Body */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="ipod-body relative w-full max-w-[380px] p-6"
      >
        {/* Screen */}
        <div className="ipod-screen aspect-[3/4] mb-6 overflow-hidden relative">
          {/* Status Bar */}
          <div className="absolute top-0 left-0 right-0 h-8 flex items-center justify-between px-4 text-xs text-white/60 bg-black/50 backdrop-blur-sm z-10">
            <span className="font-semibold">SoundSnap</span>
            <div className="flex items-center gap-1">
              <span>{isRecording ? "◉" : "●"}</span>
              <span>{new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
            </div>
          </div>

          {/* Screen Content */}
          <div className="pt-8 h-full">
            <AnimatePresence mode="wait">
              {/* Menu Screen */}
              {currentScreen === "menu" && (
                <motion.div
                  key="menu"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="h-full flex flex-col"
                >
                  <div className="px-4 py-3 border-b border-white/10">
                    <h2 className="text-white font-bold text-lg">Menu</h2>
                  </div>
                  {menuItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        if (item.id === "record") startRecording();
                        else setCurrentScreen(item.id);
                      }}
                      className="ipod-menu-item flex items-center justify-between px-4 py-4 text-white/90 hover:text-[#00a2ff] w-full text-left"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{item.icon}</span>
                        <span className="text-base">{item.label}</span>
                      </div>
                      <ChevronRight size={18} className="text-white/30" />
                    </button>
                  ))}
                </motion.div>
              )}

              {/* Record Screen */}
              {currentScreen === "record" && (
                <motion.div
                  key="record"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full flex flex-col items-center justify-center p-6"
                >
                  {isAnalyzing ? (
                    <div className="text-center">
                      <Loader2 className="w-12 h-12 text-[#00a2ff] animate-spin mx-auto mb-4" />
                      <p className="text-white/60 text-sm">Listening...</p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className={`w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center ${isRecording ? "ipod-record-btn recording" : "ipod-record-btn"}`}>
                        <Mic size={36} className="text-white" />
                      </div>
                      <p className="text-white font-bold text-2xl mb-2">
                        {isRecording ? `${10 - recordingTime}s` : "Tap to Record"}
                      </p>
                      <p className="text-white/40 text-sm">
                        {isRecording ? "Recording..." : "Hold to capture"}
                      </p>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Result Screen */}
              {currentScreen === "result" && (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="h-full flex flex-col p-4"
                >
                  <button
                    onClick={() => setCurrentScreen("menu")}
                    className="flex items-center gap-1 text-white/50 mb-4 text-sm"
                  >
                    <ChevronRight size={16} className="rotate-180" /> Back
                  </button>

                  {isAnalyzing ? (
                    <div className="flex-1 flex flex-col items-center justify-center">
                      <Loader2 size={40} className="text-[#00a2ff] animate-spin mb-4" />
                      <p className="text-white/60 text-sm">Identifying song...</p>
                    </div>
                  ) : error ? (
                    <div className="text-center py-8">
                      <p className="text-white/60">{error}</p>
                      <button
                        onClick={() => setCurrentScreen("menu")}
                        className="mt-4 text-[#00a2ff] text-sm"
                      >
                        Try Again
                      </button>
                    </div>
                  ) : songResult ? (
                    <div className="text-center">
                      <Music size={48} className="text-[#00a2ff] mx-auto mb-4" />
                      <h3 className="text-white text-xl font-bold mb-1">{songResult.title}</h3>
                      <p className="text-white/60 text-sm mb-4">{songResult.artist}</p>
                      {songResult.album && (
                        <p className="text-white/40 text-xs mb-4">{songResult.album}</p>
                      )}
                      
                      {/* Streaming links */}
                      <div className="flex justify-center gap-4 mb-6">
                        {songResult.apple_music_url && (
                          <a 
                            href={songResult.apple_music_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-xs text-white/40 hover:text-[#00a2ff] transition-colors flex items-center gap-1"
                          >
                            Apple Music <ExternalLink size={10} />
                          </a>
                        )}
                        {songResult.spotify_url && (
                          <a 
                            href={songResult.spotify_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-xs text-white/40 hover:text-green-400 transition-colors flex items-center gap-1"
                          >
                            Spotify <ExternalLink size={10} />
                          </a>
                        )}
                      </div>

                      <button
                        onClick={shareOnWhatsApp}
                        className="w-full py-3 rounded-xl text-sm font-bold transition-all ipod-record-btn text-white"
                      >
                        Share to WhatsApp
                      </button>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-white/40 text-sm">Something went wrong</p>
                      <button
                        onClick={() => setCurrentScreen("menu")}
                        className="mt-4 text-[#00a2ff] text-sm"
                      >
                        Try Again
                      </button>
                    </div>
                  )}
                </motion.div>
              )}

              {/* URL Screen */}
              {currentScreen === "url" && (
                <motion.div
                  key="url"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="h-full flex flex-col p-4"
                >
                  <button
                    onClick={() => setCurrentScreen("menu")}
                    className="flex items-center gap-1 text-white/50 mb-6 text-sm"
                  >
                    <ChevronRight size={16} className="rotate-180" /> Paste Link
                  </button>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-white/40 text-xs mb-2 uppercase tracking-wider">
                        TikTok / Instagram URL
                      </label>
                      <input
                        type="text"
                        value={urlInput}
                        onChange={(e) => {
                          setUrlInput(e.target.value);
                          setError(null);
                        }}
                        placeholder="https://www.tiktok.com/..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#00a2ff]"
                      />
                      {error && (
                        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 mt-2">
                          <p className="text-red-300 text-xs">{error}</p>
                          {error.includes("blocking") && (
                            <p className="text-white/40 text-xs mt-1">
                              Try using Record instead!
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    <button
                      onClick={async () => {
                        if (!urlInput.trim()) {
                          setError("Please enter a URL");
                          return;
                        }
                        try {
                          new URL(urlInput);
                        } catch {
                          setError("Invalid URL format");
                          return;
                        }
                        setSongResult(null);
                        setError(null);
                        setIsAnalyzing(true);
                        
                        try {
                          const result = await identifySongFromUrl(urlInput);
                          if (result.success && result.song) {
                            setSongResult(result.song);
                            setCurrentScreen("result");
                          } else {
                            setError("Could not identify song from this video");
                            setCurrentScreen("result");
                          }
                        } catch (err) {
                          setError(err.message || "Failed to process URL");
                          setCurrentScreen("result");
                        }
                        setIsAnalyzing(false);
                      }}
                      disabled={isAnalyzing}
                      className={`w-full mt-2 py-3 rounded-xl text-sm font-bold text-black transition-all ${
                        isAnalyzing 
                          ? "bg-white/20 cursor-not-allowed" 
                          : "bg-gradient-to-r from-[#00a2ff] to-[#0088dd] hover:opacity-90"
                      }`}
                    >
                      {isAnalyzing ? (
                        <span className="flex items-center justify-center gap-2">
                          <Loader2 size={16} className="animate-spin" />
                          Processing...
                        </span>
                      ) : (
                        "Detect Song"
                      )}
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Settings Screen */}
              {currentScreen === "settings" && (
                <motion.div
                  key="settings"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="h-full flex flex-col p-4"
                >
                  <button
                    onClick={() => setCurrentScreen("menu")}
                    className="flex items-center gap-1 text-white/50 mb-6 text-sm"
                  >
                    <ChevronRight size={16} className="rotate-180" /> Settings
                  </button>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-white/40 text-xs mb-2 uppercase tracking-wider">
                        WhatsApp Number
                      </label>
                      <input
                        type="tel"
                        value={settings.phone}
                        onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                        placeholder="+1 234 567 8900"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#00a2ff]"
                      />
                      <p className="text-white/30 text-xs mt-1">Include country code</p>
                    </div>

                    <div>
                      <label className="block text-white/40 text-xs mb-2 uppercase tracking-wider">
                        Your Name
                      </label>
                      <input
                        type="text"
                        value={settings.name}
                        onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                        placeholder="Your name"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#00a2ff]"
                      />
                    </div>

                    <button
                      onClick={() => setCurrentScreen("menu")}
                      className="w-full mt-4 py-3 rounded-xl text-sm font-bold text-black bg-gradient-to-r from-[#00a2ff] to-[#0088dd]"
                    >
                      Save
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Click Wheel */}
        <div className="ipod-clickwheel w-48 h-48 mx-auto relative">
          {/* Center Button */}
          <button
            onClick={() => {
              if (currentScreen === "record" && isRecording) stopRecording();
              else if (currentScreen !== "menu") setCurrentScreen("menu");
            }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full bg-gradient-to-b from-[#e0e0e4] to-[#c8c8cc] shadow-inner flex items-center justify-center z-10"
          >
            <div className="w-16 h-16 rounded-full bg-gradient-to-b from-[#f0f0f4] to-[#d8d8dc] flex items-center justify-center">
              <span className="text-gray-400 text-xs font-medium">
                {currentScreen === "menu" ? "SELECT" : "MENU"}
              </span>
            </div>
          </button>

          {/* Wheel Buttons */}
          <button
            onClick={() => {
              if (currentScreen === "menu") startRecording();
            }}
            className="absolute top-2 left-1/2 -translate-x-1/2 text-gray-500 text-xs font-medium hover:text-gray-700"
          >
            ▲
          </button>
          <button className="absolute bottom-2 left-1/2 -translate-x-1/2 text-gray-500 text-xs font-medium">
            ▼
          </button>
          <button className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 text-xs font-medium">
            ◀
          </button>
          <button className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 text-xs font-medium">
            ▶
          </button>
        </div>
      </motion.div>

      {/* Footer */}
      <div className="fixed bottom-4 left-0 right-0 text-center">
        <p className="text-white/20 text-xs">SoundSnap</p>
      </div>
    </div>
  );
}

export default App;
