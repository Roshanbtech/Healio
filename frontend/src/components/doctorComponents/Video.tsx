"use client";

import React, { useEffect, useRef, useState } from "react";
import SimplePeer from "simple-peer";
import { useSocket } from "../../context/SocketContext";
import {
  PhoneCall,
  PhoneOff,
  Mic,
  MicOff,
  Camera,
  CameraOff,
  X,
  Maximize2,
  Minimize2,
} from "lucide-react";

interface DoctorVideoCallProps {
  chatId: string;
  doctorId: string;
  userId: string;
  onClose: () => void;
  logo?: string; // Optional logo URL
}

const DoctorVideoCall: React.FC<DoctorVideoCallProps> = ({
  chatId,
  doctorId,
  userId,
  onClose,
  logo,
}) => {
  const socket = useSocket();
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [callActive, setCallActive] = useState(false);
  const [peer, setPeer] = useState<SimplePeer.Instance | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Register doctor on mount
  useEffect(() => {
    if (socket && doctorId) {
      socket.emit("register", { type: "doctor", id: doctorId });
      console.log("Doctor: Registered on socket as doctor", doctorId);
    }
  }, [socket, doctorId]);

  // Get local camera & mic
  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        localStreamRef.current = stream;
        setLocalStream(stream);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
        console.log("Doctor: Local stream obtained.");
      })
      .catch((err) => {
        console.error("Doctor: Error accessing camera/mic:", err);
      });
    
    // Cleanup function
    return () => {
      endCallCleanup();
    };
  }, []);

  // Listen for signaling events
  useEffect(() => {
    if (!socket) return;
    
    socket.on("video:accepted", (data) => {
      if (data.chatId === chatId && data.recipientId === userId) {
        console.log("Doctor: User accepted call.");
        setIsConnecting(false);
        // If a peer already exists, do not recreate it.
        if (!peer) {
          console.log("Doctor: Starting peer as initiator...");
          startPeer(true);
        } else {
          console.log("Doctor: Peer already exists, no need to start a new one.");
        }
      }
    });
    
    socket.on("video:rejected", (data) => {
      if (data.chatId === chatId && data.recipientId === userId) {
        console.log("Doctor: User rejected call.", data);
        setIsConnecting(false);
        endCallCleanup();
      }
    });
    
    socket.on("video:ended", (data) => {
      if (data.chatId === chatId) {
        console.log("Doctor: Call ended by user.", data);
        endCallCleanup();
      }
    });
    
    socket.on("video-signal", (data) => {
      if (data.chatId === chatId) {
        console.log("Doctor: Received video signal", data.signal);
        handleSignal(data.signal);
      }
    });
    
    return () => {
      socket.off("video:accepted");
      socket.off("video:rejected");
      socket.off("video:ended");
      socket.off("video-signal");
    };
  }, [socket, chatId, userId, peer]);

  // Doctor initiates call
  const startCall = () => {
    if (!socket) return;
    setIsConnecting(true);
    console.log("Doctor: Initiating call to user...");
    socket.emit("video:call", {
      chatId,
      callerType: "doctor",
      callerId: doctorId,
      recipientType: "user",
      recipientId: userId,
    });
  };

  // End call and cleanup
  const endCall = () => {
    if (!socket) return;
    if (callActive) {
      socket.emit("video:end", {
        chatId,
        callerType: "doctor",
        callerId: doctorId,
        recipientType: "user",
        recipientId: userId,
      });
    }
    endCallCleanup();
    onClose();
  };

  const endCallCleanup = () => {
    setCallActive(false);
    setIsConnecting(false);
    if (peer) {
      peer.destroy();
      setPeer(null);
      console.log("Doctor: Peer connection destroyed.");
    }
    setRemoteStream(null);
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        track.stop();
      });
      localStreamRef.current = null;
    }
  };

  const startPeer = (initiator: boolean, incomingSignal?: SimplePeer.SignalData) => {
    if (!localStreamRef.current) {
      console.error("Doctor: Cannot start peer, no local stream.");
      return;
    }
    
    console.log("Doctor: Starting peer connection. Initiator:", initiator);
    
    const newPeer = new SimplePeer({
      initiator,
      trickle: false,
      stream: localStreamRef.current,
    });
    
    newPeer.on("signal", (signalData) => {
      console.log("Doctor: Emitting video-signal", signalData);
      socket?.emit("video-signal", {
        chatId,
        callerType: "doctor",
        callerId: doctorId,
        recipientType: "user",
        recipientId: userId,
        signal: signalData,
      });
    });
    
    newPeer.on("stream", (remoteStreamData) => {
      console.log("Doctor: Received remote stream from user.");
      setRemoteStream(remoteStreamData);
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = remoteStreamData;
      }
    });
    
    newPeer.on("error", (err) => {
      console.error("Doctor: Peer connection error:", err);
      endCallCleanup();
    });
    
    newPeer.on("close", () => {
      console.log("Doctor: Peer connection closed.");
      endCallCleanup();
    });
    
    if (incomingSignal) {
      console.log("Doctor: Applying incoming signal to peer.");
      newPeer.signal(incomingSignal);
    }
    
    setPeer(newPeer);
    setCallActive(true);
  };

  const handleSignal = (signal: SimplePeer.SignalData) => {
    if (peer) {
      console.log("Doctor: Adding received signal to existing peer", signal);
      peer.signal(signal);
    } else {
      console.error("Doctor: No peer exists when receiving signal. This should not happen.");
    }
  };

  // Toggle audio mute
  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTracks = localStreamRef.current.getAudioTracks();
      audioTracks.forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsMuted(!isMuted);
    }
  };

  // Toggle video on/off
  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTracks = localStreamRef.current.getVideoTracks();
      videoTracks.forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsVideoOff(!isVideoOff);
    }
  };

  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Handle fullscreen change
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
      <div 
        ref={containerRef}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col relative overflow-hidden border border-green-100"
        style={{
          boxShadow: "0 10px 25px -5px rgba(220, 38, 38, 0.4), 0 8px 10px -6px rgba(220, 38, 38, 0.3)",
        }}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-4 bg-red-600 border-b border-red-700 rounded-t-2xl">
          <div className="flex items-center space-x-3">
            {logo && (
              <img src={logo} alt="Healio Logo" className="h-8" />
            )}
            <h2 className="text-xl font-bold text-white">Healio Video Consultation</h2>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={toggleFullscreen}
              className="bg-red-700 hover:bg-red-800 text-white p-2 rounded-full transition-all duration-200 ease-in-out flex items-center justify-center"
              aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            >
              {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
            </button>
            <button
              onClick={endCall}
              className="bg-red-700 hover:bg-red-800 text-white p-2 rounded-full transition-all duration-200 ease-in-out flex items-center justify-center"
              aria-label="Close call"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Video Container */}
        <div className="flex-1 flex flex-col md:flex-row p-6 relative overflow-hidden bg-gradient-to-br from-green-50 to-white">
          <div 
            className={`${
              callActive ? 'w-full md:w-3/4 h-full' : 'w-full h-full'
            } relative rounded-xl overflow-hidden shadow-lg`}
            style={{
              boxShadow:
                "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), inset 0 0 0 1px rgba(220, 38, 38, 0.1)",
            }}
          >
            {/* Remote Video (User) */}
            {callActive ? (
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover rounded-xl bg-gray-800"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-800 rounded-xl">
                {isConnecting ? (
                  <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-100 mb-4"></div>
                    <p className="text-white text-lg">Connecting to patient...</p>
                  </div>
                ) : (
                  <div
                    className="text-center px-4"
                    style={{ background: "linear-gradient(135deg, #1a1a1a, #2d3748)" }}
                  >
                    <div className="py-12 px-8">
                      <Camera size={64} className="mx-auto text-green-100 mb-6 opacity-70" />
                      <p className="text-white text-xl mb-10 font-light">Ready to start your consultation</p>
                      <button
                        onClick={startCall}
                        className="bg-green-100 hover:bg-green-200 text-gray-800 px-8 py-4 rounded-full text-lg font-medium flex items-center mx-auto transition-all duration-300 ease-in-out shadow-lg"
                        style={{
                          boxShadow: "0 4px 14px rgba(0, 0, 0, 0.25), 0 0 0 2px rgba(240, 255, 244, 0.1)",
                        }}
                      >
                        <PhoneCall className="mr-3" size={22} />
                        Call Patient
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Local Video (Doctor) - Picture in Picture */}
            <div
              className={`
              absolute bottom-4 right-4 w-1/4 h-1/4 md:w-1/5 md:h-1/5 
              rounded-lg overflow-hidden
              transition-all duration-300 border-2 border-green-100
            `}
              style={{
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
              }}
            >
              <video
                ref={localVideoRef}
                muted
                autoPlay
                playsInline
                className={`
                  w-full h-full object-cover bg-gray-900
                  ${isVideoOff ? 'opacity-50' : 'opacity-100'}
                `}
              />
              {isVideoOff && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-70">
                  <Camera size={24} className="text-red-500" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Call Controls */}
        <div className="p-5 bg-gray-50 flex justify-center items-center space-x-6 border-t border-green-100 rounded-b-2xl">
          <button
            onClick={toggleMute}
            className={`
              p-4 rounded-full transition-all duration-300 shadow-lg
              ${isMuted ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-200 hover:bg-gray-300'}
            `}
            style={{
              boxShadow: isMuted
                ? "0 4px 10px rgba(220, 38, 38, 0.3)"
                : "0 4px 10px rgba(0, 0, 0, 0.1)",
            }}
            aria-label={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? <MicOff size={24} className="text-white" /> : <Mic size={24} className="text-gray-700" />}
          </button>

          {callActive ? (
            <button
              onClick={endCall}
              className="p-5 bg-red-600 hover:bg-red-700 rounded-full transition-all duration-300 shadow-lg"
              style={{ boxShadow: "0 4px 14px rgba(220, 38, 38, 0.4)" }}
              aria-label="End call"
            >
              <PhoneOff size={30} className="text-white" />
            </button>
          ) : (
            <button
              onClick={startCall}
              disabled={isConnecting}
              className={`
                p-5 rounded-full transition-all duration-300 shadow-lg
                ${isConnecting ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-100 hover:bg-green-200'}
              `}
              style={{
                boxShadow: isConnecting
                  ? "0 4px 10px rgba(0, 0, 0, 0.1)"
                  : "0 4px 14px rgba(0, 0, 0, 0.15)",
              }}
              aria-label="Start call"
            >
              <PhoneCall size={30} className="text-gray-800" />
            </button>
          )}

          <button
            onClick={toggleVideo}
            className={`
              p-4 rounded-full transition-all duration-300 shadow-lg
              ${isVideoOff ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-200 hover:bg-gray-300'}
            `}
            style={{
              boxShadow: isVideoOff
                ? "0 4px 10px rgba(220, 38, 38, 0.3)"
                : "0 4px 10px rgba(0, 0, 0, 0.1)",
            }}
            aria-label={isVideoOff ? "Turn on camera" : "Turn off camera"}
          >
            {isVideoOff ? <CameraOff size={24} className="text-white" /> : <Camera size={24} className="text-gray-700" />}
          </button>
        </div>

        {/* Custom Scrollbar Styles */}
        <style jsx>{`
          ::-webkit-scrollbar {
            width: 8px;
            height: 8px;
          }
          
          ::-webkit-scrollbar-track {
            background: rgba(240, 255, 244, 0.3);
            border-radius: 10px;
          }
          
          ::-webkit-scrollbar-thumb {
            background: rgba(220, 38, 38, 0.7);
            border-radius: 10px;
          }
          
          ::-webkit-scrollbar-thumb:hover {
            background: rgba(220, 38, 38, 0.9);
          }
        `}</style>
      </div>
    </div>
  );
};

export default DoctorVideoCall;
