import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import {
  MessageSquare,
  PlusCircle,
  History,
  Info,
  Trash2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import logo from "./assets/xdfdfcfc.png"; // ✅ add MedBot logo here

export default function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState([]);
  const [activePage, setActivePage] = useState("chat");
  const [botSpeaking, setBotSpeaking] = useState(false);
  const [showUpload, setShowUpload] = useState(false);

  const navigate = useNavigate();
  const messagesEndRef = useRef(null);

  // Auto scroll chat to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send text message
  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { text: input, sender: "user" };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    try {
      const res = await axios.post("http://localhost:8000/chat", {
        message: input,
      });

      const botMessage = {
        text: res.data.reply || "⚠️ Sorry, I didn't understand.",
        sender: "bot",
      };
      setMessages((prev) => [...prev, botMessage]);

      setBotSpeaking(true);
      setTimeout(() => setBotSpeaking(false), 1500);
    } catch (error) {
      const botMessage = {
        text: "⚠️ Error connecting to server.",
        sender: "bot",
      };
      setMessages((prev) => [...prev, botMessage]);
    }
  };

  // Upload file/image
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const fileMessage = {
      text: `📂 ${file.name}`,
      sender: "user",
      fileUrl: URL.createObjectURL(file),
      fileType: file.type,
    };

    setMessages((prev) => [...prev, fileMessage]);
    setShowUpload(false);
  };

  const handleNewChat = () => {
    if (messages.length > 0) setHistory((prev) => [...prev, messages]);
    setMessages([]);
    setActivePage("chat");
  };

  const deleteHistoryItem = (index) => {
    setHistory((prev) => prev.filter((_, i) => i !== index));
  };

  const clearHistory = () => {
    setHistory([]);
  };

  return (
    <div className="h-screen w-screen flex bg-gradient-to-br from-blue-100 via-white to-blue-50">
      {/* Sidebar */}
      <motion.div
        initial={{ x: -250 }}
        animate={{ x: 0 }}
        transition={{ duration: 0.5 }}
        className="w-72 bg-white/80 backdrop-blur-lg shadow-2xl p-6 flex flex-col border-r"
      >
        {/* Logo + Title */}
        <div className="flex items-center gap-2 mb-8">
          <img src={logo} alt="MedBot Logo" className="w-10 h-10" />
          <h1 className="text-2xl font-bold text-blue-600">MedBot</h1>
        </div>

        <button
          onClick={handleNewChat}
          className="flex items-center gap-3 p-3 mb-4 rounded-xl hover:bg-blue-100 transition"
        >
          <PlusCircle className="w-5 h-5 text-blue-600" />
          <span className="font-medium">New Chat</span>
        </button>

        <button
          onClick={() => setActivePage("about")}
          className="flex items-center gap-3 p-3 mb-4 rounded-xl hover:bg-blue-100 transition"
        >
          <Info className="w-5 h-5 text-blue-600" />
          <span className="font-medium">About</span>
        </button>

        {/* History */}
        <div className="mt-6 flex-1">
          <h2 className="text-gray-600 font-semibold mb-2 flex items-center gap-2">
            <History className="w-4 h-4" /> History
          </h2>
          <div className="space-y-2 overflow-y-auto max-h-[300px] pr-1">
            {history.length === 0 && (
              <p className="text-sm text-gray-400">No chats yet</p>
            )}
            {history.map((chat, i) => (
              <div
                key={i}
                className="flex items-center justify-between bg-gray-50 p-2 rounded-lg hover:bg-gray-100"
              >
                <button
                  onClick={() => {
                    setMessages(chat);
                    setActivePage("chat");
                  }}
                  className="text-sm flex-1 text-left"
                >
                  💬 Chat {i + 1}
                </button>
                <button
                  onClick={() => deleteHistoryItem(i)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {history.length > 0 && (
            <button
              onClick={clearHistory}
              className="mt-4 w-full bg-red-500 text-white py-2 rounded-xl hover:bg-red-600 transition"
            >
              🗑 Clear All History
            </button>
          )}
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col relative">
        {/* Header */}
        <div className="bg-white/70 backdrop-blur-lg shadow p-4 text-lg font-semibold text-blue-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" /> Healthcare Chatbot
          </div>
          <button
            onClick={() => navigate("/login")}
            className="bg-blue-600 text-white px-4 py-1 rounded-lg hover:bg-blue-700 transition"
          >
            Login
          </button>
        </div>

        {/* About Page */}
        {activePage === "about" ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-10">
            <h2 className="text-3xl font-bold text-blue-700 mb-4">
              About MedBot
            </h2>
            <p className="text-gray-700 max-w-xl">
              MedBot is your AI-powered healthcare assistant 🤖.  
              It helps you find <strong>nearest hospitals, ambulance services, pharmacies</strong>,  
              validates medicines 🏥💊, and provides safe health guidance.  
              Designed for <span className="font-semibold">hackathons</span> but built to save lives!
            </p>
          </div>
        ) : (
          <>
            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-blue-50 to-white">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-400 text-lg">
                    👋 Start chatting with MedBot...
                  </p>
                </div>
              ) : (
                messages.map((msg, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`flex ${
                      msg.sender === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`px-4 py-2 rounded-2xl shadow max-w-[65%] ${
                        msg.sender === "user"
                          ? "bg-blue-500 text-white rounded-br-none"
                          : "bg-gray-200 text-gray-900 rounded-bl-none"
                      }`}
                    >
                      {msg.fileUrl ? (
                        msg.fileType.startsWith("image/") ? (
                          <img
                            src={msg.fileUrl}
                            alt={msg.text}
                            className="max-w-full rounded-lg"
                          />
                        ) : (
                          <a
                            href={msg.fileUrl}
                            download={msg.text}
                            className="underline text-sm"
                          >
                            {msg.text}
                          </a>
                        )
                      ) : (
                        msg.text
                      )}
                    </div>
                  </motion.div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div
              className={`p-4 border-t flex gap-2 bg-white/70 backdrop-blur-lg relative ${
                messages.length === 0
                  ? "absolute bottom-1/2 translate-y-1/2 w-full"
                  : ""
              }`}
            >
              {/* Upload Options */}
              <button
                onClick={() => setShowUpload((prev) => !prev)}
                className="bg-gray-200 px-3 py-2 rounded-xl cursor-pointer hover:bg-gray-300"
              >
                📎
              </button>

              {showUpload && (
                <div className="absolute bottom-16 left-4 bg-white shadow-lg rounded-xl p-2 flex flex-col gap-2 z-50 w-56">
                  {/* Camera Input */}
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="cameraInput"
                  />
                  <label
                    htmlFor="cameraInput"
                    className="px-3 py-2 rounded-lg hover:bg-blue-100 cursor-pointer text-sm"
                  >
                    📷 Use Camera
                  </label>

                  {/* File Input */}
                  <input
                    type="file"
                    accept="image/*,.pdf,.doc,.docx"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="fileInput"
                  />
                  <label
                    htmlFor="fileInput"
                    className="px-3 py-2 rounded-lg hover:bg-blue-100 cursor-pointer text-sm"
                  >
                    📂 Upload from Files/Gallery
                  </label>
                </div>
              )}

              {/* Text Input */}
              <input
                type="text"
                placeholder="Type your message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                className="flex-1 border rounded-xl px-4 py-2 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />

              {/* Send Button */}
              <button
                onClick={handleSend}
                className="bg-blue-600 text-white px-6 py-2 rounded-xl hover:bg-blue-700 transition"
              >
                Send
              </button>
            </div>
          </>
        )}

        {/* Floating Doctor Avatar */}
        <motion.div
          animate={
            botSpeaking ? { scale: 1.2, rotate: 10 } : { scale: 1, rotate: 0 }
          }
          transition={{ type: "spring", stiffness: 200, damping: 10 }}
          className="absolute bottom-24 right-6 w-16 h-16 rounded-full shadow-xl bg-white flex items-center justify-center border-2 border-blue-400"
        >
          <span className="text-3xl">🧑‍⚕️</span>
        </motion.div>
      </div>
    </div>
  );
}
