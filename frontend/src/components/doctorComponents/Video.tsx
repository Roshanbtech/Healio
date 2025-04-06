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
  User,
  Clock,
  Shield,
} from "lucide-react";

interface DoctorVideoCallProps {
  chatId: string;
  doctorId: string;
  userId: string;
  onClose: () => void;
  logo?: string;
  patientName?: string;
}

const DoctorVideoCall: React.FC<DoctorVideoCallProps> = ({
  chatId,
  doctorId,
  userId,
  onClose,
  logo,
  patientName = "Patient",
}) => {
  const socket = useSocket();
  const [callActive, setCallActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState<"idle" | "connecting" | "connected" | "failed">("idle");

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const peerRef = useRef<SimplePeer.Instance | null>(null);
  const callTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Helper to format call duration (mm:ss)
  const formatCallDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Timer management using a ref
  useEffect(() => {
    if (callActive && !callTimerRef.current) {
      console.log("Doctor: Starting call timer.");
      callTimerRef.current = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else if (!callActive && callTimerRef.current) {
      console.log("Doctor: Stopping call timer.");
      clearInterval(callTimerRef.current);
      callTimerRef.current = null;
      setCallDuration(0);
    }
    return () => {
      if (callTimerRef.current) {
        console.log("Doctor: Clearing call timer on cleanup.");
        clearInterval(callTimerRef.current);
        callTimerRef.current = null;
      }
    };
  }, [callActive]);

  // Register doctor on mount
  useEffect(() => {
    if (socket && doctorId) {
      console.log("Doctor: Registering on socket with ID:", doctorId);
      socket.emit("register", { type: "doctor", id: doctorId });
    }
  }, [socket, doctorId]);

  // Initialize media (camera and mic)
  useEffect(() => {
    const initializeMedia = async () => {
      try {
        console.log("Doctor: Requesting media (video/audio).");
        setConnectionStatus("connecting");
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        console.log("Doctor: Media stream obtained.");
        localStreamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
          console.log("Doctor: Local video element stream set.");
        }
        setConnectionStatus("idle");
      } catch (err) {
        console.error("Doctor: Error accessing media:", err);
        setConnectionStatus("failed");
      }
    };

    initializeMedia();
    return () => {
      console.log("Doctor: Component unmounting, cleaning up call.");
      cleanupCall();
    };
  }, []);

  // Socket event listeners for signaling and call control
  useEffect(() => {
    if (!socket) return;

    const onVideoAccepted = (data: any) => {
      console.log("Doctor: Received 'video:accepted' event:", data);
      if (data.chatId === chatId && data.recipientId === userId) {
        console.log("Doctor: Call accepted by user.");
        setConnectionStatus("connected");
        if (!peerRef.current) {
          console.log("Doctor: No peer exists, starting peer as initiator.");
          startPeer(true);
        }
      }
    };

    const onVideoRejected = (data: any) => {
      console.log("Doctor: Received 'video:rejected' event:", data);
      if (data.chatId === chatId && data.recipientId === userId) {
        console.error("Doctor: Call rejected by user.");
        setConnectionStatus("failed");
        cleanupCall();
      }
    };

    const onVideoEnded = (data: any) => {
      console.log("Doctor: Received 'video:ended' event:", data);
      if (data.chatId === chatId) {
        console.log("Doctor: Call ended by user.");
        cleanupCall();
      }
    };

    const onVideoSignal = (data: any) => {
      console.log("Doctor: Received 'video-signal' event:", data);
      if (data.chatId === chatId) {
        handleSignal(data.signal);
      }
    };

    socket.on("video:accepted", onVideoAccepted);
    socket.on("video:rejected", onVideoRejected);
    socket.on("video:ended", onVideoEnded);
    socket.on("video-signal", onVideoSignal);

    return () => {
      console.log("Doctor: Removing socket listeners on unmount.");
      socket.off("video:accepted", onVideoAccepted);
      socket.off("video:rejected", onVideoRejected);
      socket.off("video:ended", onVideoEnded);
      socket.off("video-signal", onVideoSignal);
    };
  }, [socket, chatId, userId]);

  // Start call by emitting video:call event
  const startCall = () => {
    if (!socket || connectionStatus === "connecting") return;
    if (!localStreamRef.current) {
      console.error("Doctor: Local stream not available. Cannot start call.");
      return;
    }
    console.log("Doctor: Initiating call to user...");
    setConnectionStatus("connecting");
    socket.emit("video:call", {
      chatId,
      callerType: "doctor",
      callerId: doctorId,
      recipientType: "user",
      recipientId: userId,
    });
  };

  // End call by emitting video:end event and cleaning up
  const endCall = () => {
    if (!socket) return;
    console.log("Doctor: Ending call.");
    if (callActive) {
      socket.emit("video:end", {
        chatId,
        callerType: "doctor",
        callerId: doctorId,
        recipientType: "user",
        recipientId: userId,
      });
      console.log("Doctor: Emitted 'video:end' event.");
    }
    cleanupCall();
    onClose();
  };

  // Cleanup function for call termination
  const cleanupCall = () => {
    console.log("Doctor: Cleaning up call.");
    setCallActive(false);
    setConnectionStatus("idle");

    if (peerRef.current) {
      console.log("Doctor: Destroying peer connection.");
      peerRef.current.destroy();
      peerRef.current = null;
    }

    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
      console.log("Doctor: Remote video element cleared.");
    }

    if (localStreamRef.current) {
      console.log("Doctor: Stopping local media tracks.");
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = null;
      }
      localStreamRef.current = null;
    }

    if (callTimerRef.current) {
      console.log("Doctor: Clearing call timer.");
      clearInterval(callTimerRef.current);
      callTimerRef.current = null;
      setCallDuration(0);
    }
  };

  // Create peer connection and handle its events
  const startPeer = (initiator: boolean, incomingSignal?: SimplePeer.SignalData) => {
    if (!localStreamRef.current) {
      console.error("Doctor: Local stream not available. Cannot start peer.");
      return;
    }
    console.log(`Doctor: Starting peer connection. Initiator: ${initiator}`);
    setConnectionStatus("connecting");

    try {
      const newPeer = new SimplePeer({
        initiator,
        trickle: false,
        stream: localStreamRef.current,
      });

      newPeer.on("signal", (signalData) => {
        console.log("Doctor: Peer generated signal data:", signalData);
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
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = remoteStreamData;
          remoteVideoRef.current.onloadedmetadata = () => {
            console.log("Doctor: Remote video metadata loaded, attempting to play.");
            remoteVideoRef.current?.play().catch(err => console.error("Doctor: Error playing remote video:", err));
          };
        }
        setConnectionStatus("connected");
      });

      newPeer.on("connect", () => {
        console.log("Doctor: Peer connection established.");
        setConnectionStatus("connected");
      });

      newPeer.on("error", (err) => {
        console.error("Doctor: Peer encountered an error:", err);
        setConnectionStatus("failed");
        cleanupCall();
      });

      newPeer.on("close", () => {
        console.log("Doctor: Peer connection closed.");
        cleanupCall();
      });

      if (incomingSignal) {
        console.log("Doctor: Applying incoming signal to peer:", incomingSignal);
        newPeer.signal(incomingSignal);
      }

      peerRef.current = newPeer;
      setCallActive(true);
    } catch (error) {
      console.error("Doctor: Error while creating peer:", error);
      setConnectionStatus("failed");
    }
  };

  // Handle incoming signal events
  const handleSignal = (signal: SimplePeer.SignalData) => {
    console.log("Doctor: Handling incoming signal:", signal);
    if (peerRef.current) {
      peerRef.current.signal(signal);
    } else {
      console.log("Doctor: No peer instance exists. Starting peer as receiver.");
      startPeer(false, signal);
    }
  };

  // Toggle audio mute
  const toggleMute = () => {
    if (localStreamRef.current) {
      const newMuteState = !isMuted;
      console.log("Doctor: Toggling mute. New state:", newMuteState);
      localStreamRef.current.getAudioTracks().forEach(track => {
        track.enabled = !newMuteState;
      });
      setIsMuted(newMuteState);
    }
  };

  // Toggle video on/off
  const toggleVideo = () => {
    if (localStreamRef.current) {
      const newVideoState = !isVideoOff;
      console.log("Doctor: Toggling video. Video off:", newVideoState);
      localStreamRef.current.getVideoTracks().forEach(track => {
        track.enabled = !newVideoState;
      });
      setIsVideoOff(newVideoState);
    }
  };

  // Toggle fullscreen mode
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      console.log("Doctor: Requesting fullscreen.");
      containerRef.current.requestFullscreen().catch(err => console.error("Doctor: Error enabling fullscreen:", err));
      setIsFullscreen(true);
    } else {
      console.log("Doctor: Exiting fullscreen.");
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      console.log("Doctor: Fullscreen changed.", document.fullscreenElement);
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const ConnectionIndicator = () => {
    if (connectionStatus === "connected") {
      return (
        <div className="flex items-center text-green-600">
          <div className="h-2 w-2 rounded-full bg-green-600 mr-2 animate-pulse"></div>
          <span className="text-xs font-medium">Connected</span>
        </div>
      );
    } else if (connectionStatus === "connecting") {
      return (
        <div className="flex items-center text-yellow-500">
          <div className="h-2 w-2 rounded-full bg-yellow-500 mr-2 animate-pulse"></div>
          <span className="text-xs font-medium">Connecting...</span>
        </div>
      );
    } else if (connectionStatus === "failed") {
      return (
        <div className="flex items-center text-red-600">
          <div className="h-2 w-2 rounded-full bg-red-600 mr-2"></div>
          <span className="text-xs font-medium">Connection Failed</span>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-85 flex items-center justify-center z-50 backdrop-blur-sm">
      <div
        ref={containerRef}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col relative overflow-hidden border border-green-100"
        style={{
          boxShadow: "0 10px 25px -5px rgba(220,38,38,0.4), 0 8px 10px -6px rgba(220,38,38,0.3)",
        }}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-4 bg-gradient-to-r from-red-600 to-red-700 border-b border-red-700 rounded-t-2xl">
          <div className="flex items-center space-x-3">
            {logo && <img src={logo} alt="Healio Logo" className="h-8" />}
            <div>
              <h2 className="text-xl font-bold text-white">Healio Video Consultation</h2>
              <div className="flex items-center mt-1">
                <ConnectionIndicator />
                {callActive && (
                  <div className="flex items-center text-white text-xs ml-3">
                    <Clock size={12} className="mr-1" />
                    {formatCallDuration(callDuration)}
                  </div>
                )}
              </div>
            </div>
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
            className={`${callActive ? "w-full md:w-3/4 h-full" : "w-full h-full"} relative rounded-xl overflow-hidden shadow-lg bg-gray-900`}
            style={{
              boxShadow:
                "0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06), inset 0 0 0 1px rgba(220,38,38,0.1)",
            }}
          >
            {callActive ? (
              <>
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover rounded-xl bg-gray-800"
                />
                <div className="absolute top-4 left-4 bg-black bg-opacity-60 px-3 py-1 rounded-lg text-white text-sm font-medium flex items-center">
                  <User size={14} className="mr-2" />
                  {patientName}
                </div>
                <div className="absolute top-4 right-4 bg-green-600 bg-opacity-80 px-2 py-1 rounded-lg text-white text-xs font-medium flex items-center">
                  <Shield size={12} className="mr-1" />
                  Secure Connection
                </div>
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center rounded-xl relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-gray-800"></div>
                <div className="text-center px-4 z-10 w-full max-w-md">
                  <div className="py-12 px-8">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center mx-auto mb-8 shadow-lg">
                      <Camera size={40} className="text-white" />
                    </div>
                    <h3 className="text-white text-2xl mb-3 font-semibold">Ready for Consultation</h3>
                    <p className="text-gray-300 text-md mb-10">
                      Your video and audio are ready. Start the call when you're ready to connect with the patient.
                    </p>
                    <button
                      onClick={startCall}
                      className="bg-gradient-to-r from-green-100 to-green-200 hover:from-green-200 hover:to-green-300 text-gray-800 px-10 py-4 rounded-full text-lg font-medium flex items-center mx-auto transition-all duration-300 ease-in-out shadow-lg"
                      style={{
                        boxShadow: "0 4px 14px rgba(0, 0, 0, 0.25), 0 0 0 2px rgba(240,255,244,0.1)",
                      }}
                    >
                      <PhoneCall className="mr-3" size={22} />
                      Call Patient
                    </button>
                  </div>
                </div>
              </div>
            )}
            {/* Local Video (Picture in Picture) */}
            <div
              className={`absolute bottom-4 right-4 w-1/4 h-1/4 md:w-1/5 md:h-1/5 rounded-lg overflow-hidden transition-all duration-300 border-2 border-green-100 ${isVideoOff ? "bg-gray-900" : ""}`}
              style={{ boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)" }}
            >
              <video
                ref={localVideoRef}
                muted
                autoPlay
                playsInline
                className={`w-full h-full object-cover bg-gray-900 ${isVideoOff ? "opacity-0" : "opacity-100"} transition-opacity duration-300`}
              />
              {isVideoOff && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900">
                  <Camera size={24} className="text-red-500 mb-1" />
                  <span className="text-xs text-gray-400">Camera Off</span>
                </div>
              )}
              {isMuted && (
                <div className="absolute top-1 right-1 bg-red-600 rounded-full p-1">
                  <MicOff size={12} className="text-white" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Call Controls */}
        <div className="p-5 bg-gradient-to-r from-gray-50 to-gray-100 flex justify-center items-center space-x-6 border-t border-green-100 rounded-b-2xl">
          <button
            onClick={toggleMute}
            className={`p-4 rounded-full transition-all duration-300 transform hover:scale-105 ${isMuted ? "bg-red-600 hover:bg-red-700" : "bg-gray-200 hover:bg-gray-300"}`}
            style={{ boxShadow: isMuted ? "0 4px 10px rgba(220,38,38,0.3)" : "0 4px 10px rgba(0,0,0,0.1)" }}
            aria-label={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? <MicOff size={24} className="text-white" /> : <Mic size={24} className="text-gray-700" />}
          </button>
          {callActive ? (
            <button
              onClick={endCall}
              className="p-5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg"
              style={{ boxShadow: "0 4px 14px rgba(220,38,38,0.4)" }}
              aria-label="End call"
            >
              <PhoneOff size={30} className="text-white" />
            </button>
          ) : (
            <button
              onClick={startCall}
              className="p-5 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg bg-gradient-to-r from-green-100 to-green-200 hover:from-green-200 hover:to-green-300"
              style={{ boxShadow: "0 4px 14px rgba(0,0,0,0.15)" }}
              aria-label="Start call"
            >
              <PhoneCall size={30} className="text-gray-800" />
            </button>
          )}
          <button
            onClick={toggleVideo}
            className={`p-4 rounded-full transition-all duration-300 transform hover:scale-105 ${isVideoOff ? "bg-red-600 hover:bg-red-700" : "bg-gray-200 hover:bg-gray-300"}`}
            style={{ boxShadow: isVideoOff ? "0 4px 10px rgba(220,38,38,0.3)" : "0 4px 10px rgba(0,0,0,0.1)" }}
            aria-label={isVideoOff ? "Turn on camera" : "Turn off camera"}
          >
            {isVideoOff ? <CameraOff size={24} className="text-white" /> : <Camera size={24} className="text-gray-700" />}
          </button>
        </div>

        <style>{`
          ::-webkit-scrollbar { width: 8px; height: 8px; }
          ::-webkit-scrollbar-track { background: rgba(240,255,244,0.3); border-radius: 10px; }
          ::-webkit-scrollbar-thumb { background: rgba(220,38,38,0.7); border-radius: 10px; }
          ::-webkit-scrollbar-thumb:hover { background: rgba(220,38,38,0.9); }
        `}</style>
      </div>
    </div>
  );
};

export default DoctorVideoCall;



// "use client";

// import React, { useEffect, useRef, useState } from "react";
// import SimplePeer from "simple-peer";
// import { useSocket } from "../../context/SocketContext";
// import {
//   PhoneCall,
//   PhoneOff,
//   Mic,
//   MicOff,
//   Camera,
//   CameraOff,
//   X,
//   Maximize2,
//   Minimize2,
//   User,
//   Clock,
//   Shield,
// } from "lucide-react";

// interface DoctorVideoCallProps {
//   chatId: string;
//   doctorId: string;
//   userId: string;
//   onClose: () => void;
//   logo?: string; // Optional logo URL
//   patientName?: string; // Optional patient name for display
// }

// const DoctorVideoCall: React.FC<DoctorVideoCallProps> = ({
//   chatId,
//   doctorId,
//   userId,
//   onClose,
//   logo,
//   patientName = "Patient",
// }) => {
//   const socket = useSocket();
//   // const [localStream, setLocalStream] = useState<MediaStream | null>(null);
//   // const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
//   const [callActive, setCallActive] = useState(false);
//   const [peer, setPeer] = useState<SimplePeer.Instance | null>(null);
//   const [isMuted, setIsMuted] = useState(false);
//   const [isVideoOff, setIsVideoOff] = useState(false);
//   const [isFullscreen, setIsFullscreen] = useState(false);
//   const [isConnecting, setIsConnecting] = useState(false);
//   const [callDuration, setCallDuration] = useState(0);
//   const [callTimerInterval, setCallTimerInterval] = useState<NodeJS.Timeout | null>(null);
//   const [connectionStatus, setConnectionStatus] = useState<"idle" | "connecting" | "connected" | "failed">("idle");

//   const localVideoRef = useRef<HTMLVideoElement>(null);
//   const remoteVideoRef = useRef<HTMLVideoElement>(null);
//   const localStreamRef = useRef<MediaStream | null>(null);
//   const containerRef = useRef<HTMLDivElement>(null);

//   // Format call duration as mm:ss
//   const formatCallDuration = (seconds: number) => {
//     const mins = Math.floor(seconds / 60);
//     const secs = seconds % 60;
//     return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
//   };

//   // Start call timer when call becomes active
//   useEffect(() => {
//     if (callActive && !callTimerInterval) {
//       const interval = setInterval(() => {
//         setCallDuration(prev => prev + 1);
//       }, 1000);
//       setCallTimerInterval(interval);
//     } else if (!callActive && callTimerInterval) {
//       clearInterval(callTimerInterval);
//       setCallTimerInterval(null);
//       setCallDuration(0);
//     }
    
//     return () => {
//       if (callTimerInterval) {
//         clearInterval(callTimerInterval);
//       }
//     };
//   }, [callActive, callTimerInterval]);

//   // Register doctor on mount
//   useEffect(() => {
//     if (socket && doctorId) {
//       socket.emit("register", { type: "doctor", id: doctorId });
//       console.log("Doctor: Registered on socket as doctor", doctorId);
//     }
//   }, [socket, doctorId]);

//   // Get local camera & mic
//   useEffect(() => {
//     const initializeMedia = async () => {
//       try {
//         setConnectionStatus("connecting");
//         const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
//         localStreamRef.current = stream;
//         // setLocalStream(stream);
//         if (localVideoRef.current) {
//           localVideoRef.current.srcObject = stream;
//         }
//         console.log("Doctor: Local stream obtained.");
//         setConnectionStatus("idle");
//       } catch (err) {
//         console.error("Doctor: Error accessing camera/mic:", err);
//         setConnectionStatus("failed");
//       }
//     };

//     initializeMedia();
    
//     // Cleanup function
//     return () => {
//       endCallCleanup();
//     };
//   }, []);

//   // Listen for signaling events
//   useEffect(() => {
//     if (!socket) return;
    
//     socket.on("video:accepted", (data) => {
//       if (data.chatId === chatId && data.recipientId === userId) {
//         console.log("Doctor: User accepted call.");
//         setIsConnecting(false);
//         setConnectionStatus("connected");
//         // If a peer already exists, do not recreate it.
//         if (!peer) {
//           console.log("Doctor: Starting peer as initiator...");
//           startPeer(true);
//         } else {
//           console.log("Doctor: Peer already exists, no need to start a new one.");
//         }
//       }
//     });
    
//     socket.on("video:rejected", (data) => {
//       if (data.chatId === chatId && data.recipientId === userId) {
//         console.log("Doctor: User rejected call.", data);
//         setIsConnecting(false);
//         setConnectionStatus("failed");
//         endCallCleanup();
//       }
//     });
    
//     socket.on("video:ended", (data) => {
//       if (data.chatId === chatId) {
//         console.log("Doctor: Call ended by user.", data);
//         endCallCleanup();
//       }
//     });
    
//     socket.on("video-signal", (data) => {
//       if (data.chatId === chatId) {
//         console.log("Doctor: Received video signal", data.signal);
//         handleSignal(data.signal);
//       }
//     });
    
//     return () => {
//       socket.off("video:accepted");
//       socket.off("video:rejected");
//       socket.off("video:ended");
//       socket.off("video-signal");
//     };
//   }, [socket, chatId, userId, peer]);

//   // Doctor initiates call
//   const startCall = () => {
//     if (!socket || isConnecting) return;
    
//     // Check if media is available before starting the call
//     if (!localStreamRef.current) {
//       console.error("Doctor: Cannot start call without local media stream");
//       return;
//     }
    
//     setIsConnecting(true);
//     setConnectionStatus("connecting");
//     console.log("Doctor: Initiating call to user...");
//     socket.emit("video:call", {
//       chatId,
//       callerType: "doctor",
//       callerId: doctorId,
//       recipientType: "user",
//       recipientId: userId,
//     });
//   };

//   // End call and cleanup
//   const endCall = () => {
//     if (!socket) return;
//     if (callActive) {
//       socket.emit("video:end", {
//         chatId,
//         callerType: "doctor",
//         callerId: doctorId,
//         recipientType: "user",
//         recipientId: userId,
//       });
//     }
//     endCallCleanup();
//   };

//   // Handle component close - ensure cleanup before closing
//   const handleClose = () => {
//     endCallCleanup();
//     onClose();
//   };

//   const endCallCleanup = () => {
//     setCallActive(false);
//     setIsConnecting(false);
//     setConnectionStatus("idle");
    
//     // Destroy peer connection
//     if (peer) {
//       peer.destroy();
//       setPeer(null);
//       console.log("Doctor: Peer connection destroyed.");
//     }
    
//     // Clear remote stream
//     if (remoteVideoRef.current && remoteVideoRef.current.srcObject) {
//       remoteVideoRef.current.srcObject = null;
//     }
//     // setRemoteStream(null);
    
//     // Stop all local tracks
//     if (localStreamRef.current) {
//       localStreamRef.current.getTracks().forEach((track) => {
//         track.stop();
//       });
      
//       // Clear srcObject from video element
//       if (localVideoRef.current && localVideoRef.current.srcObject) {
//         localVideoRef.current.srcObject = null;
//       }
      
//       localStreamRef.current = null;
//       // setLocalStream(null);
//     }
    
//     // Reset call duration
//     if (callTimerInterval) {
//       clearInterval(callTimerInterval);
//       setCallTimerInterval(null);
//       setCallDuration(0);
//     }
//   };

//   const startPeer = (initiator: boolean, incomingSignal?: SimplePeer.SignalData) => {
//     if (!localStreamRef.current) {
//       console.error("Doctor: Cannot start peer, no local stream.");
//       return;
//     }
    
//     console.log("Doctor: Starting peer connection. Initiator:", initiator);
    
//     const newPeer = new SimplePeer({
//       initiator,
//       trickle: false,
//       stream: localStreamRef.current,
//     });
    
//     newPeer.on("signal", (signalData) => {
//       console.log("Doctor: Emitting video-signal", signalData);
//       socket?.emit("video-signal", {
//         chatId,
//         callerType: "doctor",
//         callerId: doctorId,
//         recipientType: "user",
//         recipientId: userId,
//         signal: signalData,
//       });
//     });
    
//     newPeer.on("stream", (remoteStreamData) => {
//       console.log("Doctor: Received remote stream from user.");
//       // setRemoteStream(remoteStreamData);
//       if (remoteVideoRef.current) {
//         remoteVideoRef.current.srcObject = remoteStreamData;
        
//         // Ensure video plays when it's ready
//         remoteVideoRef.current.onloadedmetadata = () => {
//           remoteVideoRef.current?.play().catch(err => {
//             console.error("Doctor: Error playing remote video:", err);
//           });
//         };
//       }
//     });
    
//     newPeer.on("connect", () => {
//       console.log("Doctor: Peer connection established successfully.");
//       setConnectionStatus("connected");
//     });
    
//     newPeer.on("error", (err) => {
//       console.error("Doctor: Peer connection error:", err);
//       setConnectionStatus("failed");
//       endCallCleanup();
//     });
    
//     newPeer.on("close", () => {
//       console.log("Doctor: Peer connection closed.");
//       endCallCleanup();
//     });
    
//     if (incomingSignal) {
//       console.log("Doctor: Applying incoming signal to peer.");
//       newPeer.signal(incomingSignal);
//     }
    
//     setPeer(newPeer);
//     setCallActive(true);
//   };

//   const handleSignal = (signal: SimplePeer.SignalData) => {
//     if (peer) {
//       console.log("Doctor: Adding received signal to existing peer", signal);
//       peer.signal(signal);
//     } else {
//       console.error("Doctor: No peer exists when receiving signal. This should not happen.");
//     }
//   };

//   // Toggle audio mute with visual feedback
//   const toggleMute = () => {
//     if (localStreamRef.current) {
//       const audioTracks = localStreamRef.current.getAudioTracks();
//       const newMuteState = !isMuted;
      
//       audioTracks.forEach((track) => {
//         track.enabled = !newMuteState;
//       });
      
//       setIsMuted(newMuteState);
//     }
//   };

//   // Toggle video on/off with visual feedback
//   const toggleVideo = () => {
//     if (localStreamRef.current) {
//       const videoTracks = localStreamRef.current.getVideoTracks();
//       const newVideoState = !isVideoOff;
      
//       videoTracks.forEach((track) => {
//         track.enabled = !newVideoState;
//       });
      
//       setIsVideoOff(newVideoState);
//     }
//   };

//   // Toggle fullscreen with proper browser API handling
//   const toggleFullscreen = () => {
//     if (!containerRef.current) return;
    
//     if (!document.fullscreenElement) {
//       containerRef.current.requestFullscreen().catch((err) => {
//         console.error(`Error attempting to enable fullscreen: ${err.message}`);
//       });
//       setIsFullscreen(true);
//     } else {
//       document.exitFullscreen();
//       setIsFullscreen(false);
//     }
//   };

//   // Handle fullscreen change
//   useEffect(() => {
//     const handleFullscreenChange = () => {
//       setIsFullscreen(!!document.fullscreenElement);
//     };
//     document.addEventListener("fullscreenchange", handleFullscreenChange);
//     return () => {
//       document.removeEventListener("fullscreenchange", handleFullscreenChange);
//     };
//   }, []);

//   // Connection status indicator component
//   const ConnectionIndicator = () => {
//     if (connectionStatus === "connected") {
//       return (
//         <div className="flex items-center text-green-600">
//           <div className="h-2 w-2 rounded-full bg-green-600 mr-2 animate-pulse"></div>
//           <span className="text-xs font-medium">Connected</span>
//         </div>
//       );
//     } else if (connectionStatus === "connecting") {
//       return (
//         <div className="flex items-center text-yellow-500">
//           <div className="h-2 w-2 rounded-full bg-yellow-500 mr-2 animate-pulse"></div>
//           <span className="text-xs font-medium">Connecting...</span>
//         </div>
//       );
//     } else if (connectionStatus === "failed") {
//       return (
//         <div className="flex items-center text-red-600">
//           <div className="h-2 w-2 rounded-full bg-red-600 mr-2"></div>
//           <span className="text-xs font-medium">Connection Failed</span>
//         </div>
//       );
//     }
//     return null;
//   };

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-85 flex items-center justify-center z-50 backdrop-blur-sm">
//       <div 
//         ref={containerRef}
//         className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col relative overflow-hidden border border-green-100"
//         style={{
//           boxShadow: "0 10px 25px -5px rgba(220, 38, 38, 0.4), 0 8px 10px -6px rgba(220, 38, 38, 0.3)",
//         }}
//       >
//         {/* Header */}
//         <div className="flex justify-between items-center p-4 bg-gradient-to-r from-red-600 to-red-700 border-b border-red-700 rounded-t-2xl">
//           <div className="flex items-center space-x-3">
//             {logo && (
//               <img src={logo} alt="Healio Logo" className="h-8" />
//             )}
//             <div>
//               <h2 className="text-xl font-bold text-white">Healio Video Consultation</h2>
//               <div className="flex items-center mt-1">
//                 <ConnectionIndicator />
//                 {callActive && (
//                   <div className="flex items-center text-white text-xs ml-3">
//                     <Clock size={12} className="mr-1" />
//                     {formatCallDuration(callDuration)}
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>
          
//           <div className="flex items-center space-x-2">
//             <button
//               onClick={toggleFullscreen}
//               className="bg-red-700 hover:bg-red-800 text-white p-2 rounded-full transition-all duration-200 ease-in-out flex items-center justify-center"
//               aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
//             >
//               {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
//             </button>
//             <button
//               onClick={handleClose}
//               className="bg-red-700 hover:bg-red-800 text-white p-2 rounded-full transition-all duration-200 ease-in-out flex items-center justify-center"
//               aria-label="Close call"
//             >
//               <X size={18} />
//             </button>
//           </div>
//         </div>

//         {/* Video Container */}
//         <div className="flex-1 flex flex-col md:flex-row p-6 relative overflow-hidden bg-gradient-to-br from-green-50 to-white">
//           <div 
//             className={`${
//               callActive ? 'w-full md:w-3/4 h-full' : 'w-full h-full'
//             } relative rounded-xl overflow-hidden shadow-lg bg-gray-900`}
//             style={{
//               boxShadow:
//                 "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), inset 0 0 0 1px rgba(220, 38, 38, 0.1)",
//             }}
//           >
//             {/* Remote Video (User) */}
//             {callActive ? (
//               <>
//                 <video
//                   ref={remoteVideoRef}
//                   autoPlay
//                   playsInline
//                   className="w-full h-full object-cover rounded-xl bg-gray-800"
//                 />
//                 <div className="absolute top-4 left-4 bg-black bg-opacity-60 px-3 py-1 rounded-lg text-white text-sm font-medium flex items-center">
//                   <User size={14} className="mr-2" />
//                   {patientName}
//                 </div>
                
//                 {/* Secure connection badge */}
//                 <div className="absolute top-4 right-4 bg-green-600 bg-opacity-80 px-2 py-1 rounded-lg text-white text-xs font-medium flex items-center">
//                   <Shield size={12} className="mr-1" />
//                   Secure Connection
//                 </div>
//               </>
//             ) : (
//               <div className="w-full h-full flex items-center justify-center rounded-xl relative overflow-hidden">
//                 <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-gray-800"></div>
                
//                 {isConnecting ? (
//                   <div className="text-center z-10">
//                     <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-green-100 mb-6"></div>
//                     <p className="text-white text-lg font-light">Connecting to patient...</p>
//                     <p className="text-gray-400 text-sm mt-2">Please wait while we establish a secure connection</p>
//                   </div>
//                 ) : (
//                   <div
//                     className="text-center px-4 z-10 w-full max-w-md"
//                   >
//                     <div className="py-12 px-8">
//                       <div className="w-20 h-20 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center mx-auto mb-8 shadow-lg">
//                         <Camera size={40} className="text-white" />
//                       </div>
//                       <h3 className="text-white text-2xl mb-3 font-semibold">Ready for Consultation</h3>
//                       <p className="text-gray-300 text-md mb-10">Your video and audio are ready. Start the call when you're ready to connect with the patient.</p>
                      
//                       <button
//                         onClick={startCall}
//                         className="bg-gradient-to-r from-green-100 to-green-200 hover:from-green-200 hover:to-green-300 text-gray-800 px-10 py-4 rounded-full text-lg font-medium flex items-center mx-auto transition-all duration-300 ease-in-out shadow-lg"
//                         style={{
//                           boxShadow: "0 4px 14px rgba(0, 0, 0, 0.25), 0 0 0 2px rgba(240, 255, 244, 0.1)",
//                         }}
//                       >
//                         <PhoneCall className="mr-3" size={22} />
//                         Call Patient
//                       </button>
//                     </div>
//                   </div>
//                 )}
//               </div>
//             )}

//             {/* Local Video (Doctor) - Picture in Picture */}
//             <div
//               className={`
//               absolute bottom-4 right-4 w-1/4 h-1/4 md:w-1/5 md:h-1/5 
//               rounded-lg overflow-hidden
//               transition-all duration-300 border-2 border-green-100
//               ${isVideoOff ? 'bg-gray-900' : ''}
//             `}
//               style={{
//                 boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
//               }}
//             >
//               <video
//                 ref={localVideoRef}
//                 muted
//                 autoPlay
//                 playsInline
//                 className={`
//                   w-full h-full object-cover bg-gray-900
//                   ${isVideoOff ? 'opacity-0' : 'opacity-100'}
//                   transition-opacity duration-300
//                 `}
//               />
//               {isVideoOff && (
//                 <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900">
//                   <Camera size={24} className="text-red-500 mb-1" />
//                   <span className="text-xs text-gray-400">Camera Off</span>
//                 </div>
//               )}
              
//               {/* Mute indicator */}
//               {isMuted && (
//                 <div className="absolute top-1 right-1 bg-red-600 rounded-full p-1">
//                   <MicOff size={12} className="text-white" />
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>

//         {/* Call Controls */}
//         <div className="p-5 bg-gradient-to-r from-gray-50 to-gray-100 flex justify-center items-center space-x-6 border-t border-green-100 rounded-b-2xl">
//           <button
//             onClick={toggleMute}
//             className={`
//               p-4 rounded-full transition-all duration-300 transform hover:scale-105
//               ${isMuted ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-200 hover:bg-gray-300'}
//             `}
//             style={{
//               boxShadow: isMuted
//                 ? "0 4px 10px rgba(220, 38, 38, 0.3)"
//                 : "0 4px 10px rgba(0, 0, 0, 0.1)",
//             }}
//             aria-label={isMuted ? "Unmute" : "Mute"}
//           >
//             {isMuted ? <MicOff size={24} className="text-white" /> : <Mic size={24} className="text-gray-700" />}
//           </button>

//           {callActive ? (
//             <button
//               onClick={endCall}
//               className="p-5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg"
//               style={{ boxShadow: "0 4px 14px rgba(220, 38, 38, 0.4)" }}
//               aria-label="End call"
//             >
//               <PhoneOff size={30} className="text-white" />
//             </button>
//           ) : (
//             <button
//               onClick={startCall}
//               disabled={isConnecting}
//               className={`
//                 p-5 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg
//                 ${isConnecting 
//                   ? 'bg-gray-400 cursor-not-allowed' 
//                   : 'bg-gradient-to-r from-green-100 to-green-200 hover:from-green-200 hover:to-green-300'}
//               `}
//               style={{
//                 boxShadow: isConnecting
//                   ? "0 4px 10px rgba(0, 0, 0, 0.1)"
//                   : "0 4px 14px rgba(0, 0, 0, 0.15)",
//               }}
//               aria-label="Start call"
//             >
//               <PhoneCall size={30} className="text-gray-800" />
//             </button>
//           )}

//           <button
//             onClick={toggleVideo}
//             className={`
//               p-4 rounded-full transition-all duration-300 transform hover:scale-105
//               ${isVideoOff ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-200 hover:bg-gray-300'}
//             `}
//             style={{
//               boxShadow: isVideoOff
//                 ? "0 4px 10px rgba(220, 38, 38, 0.3)"
//                 : "0 4px 10px rgba(0, 0, 0, 0.1)",
//             }}
//             aria-label={isVideoOff ? "Turn on camera" : "Turn off camera"}
//           >
//             {isVideoOff ? <CameraOff size={24} className="text-white" /> : <Camera size={24} className="text-gray-700" />}
//           </button>
//         </div>

//         {/* Custom Scrollbar Styles */}
//         <style>{`
//           :global(::-webkit-scrollbar) {
//             width: 8px;
//             height: 8px;
//           }
          
//           :global(::-webkit-scrollbar-track) {
//             background: rgba(240, 255, 244, 0.3);
//             border-radius: 10px;
//           }
          
//           :global(::-webkit-scrollbar-thumb) {
//             background: rgba(220, 38, 38, 0.7);
//             border-radius: 10px;
//           }
          
//           :global(::-webkit-scrollbar-thumb:hover) {
//             background: rgba(220, 38, 38, 0.9);
//           }
//         `}</style>
//       </div>
//     </div>
//   );
// };

// export default DoctorVideoCall;