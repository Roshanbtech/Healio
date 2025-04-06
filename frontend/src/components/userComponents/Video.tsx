"use client";

import React, { useEffect, useRef, useState } from "react";
import SimplePeer from "simple-peer";
import { useSocket } from "../../context/SocketContext";
import {
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
  PhoneCall,
} from "lucide-react";

interface UserVideoCallProps {
  chatId: string;
  userId: string;
  doctorId: string;
  onClose: () => void;
  logo?: string;
  doctorName?: string;
}

const UserVideoCall: React.FC<UserVideoCallProps> = ({
  chatId,
  userId,
  doctorId,
  onClose,
  logo,
  doctorName = "Doctor",
}) => {
  const socket = useSocket();
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [callActive, setCallActive] = useState(false);
  const [peer, setPeer] = useState<SimplePeer.Instance | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [callTimerInterval, setCallTimerInterval] = useState<NodeJS.Timeout | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<"idle" | "connecting" | "connected" | "failed">("idle");
  const [incomingCall, setIncomingCall] = useState(false);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const formatCallDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    if (callActive && !callTimerInterval) {
      const interval = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
      setCallTimerInterval(interval);
    } else if (!callActive && callTimerInterval) {
      clearInterval(callTimerInterval);
      setCallTimerInterval(null);
      setCallDuration(0);
    }
    return () => {
      if (callTimerInterval) clearInterval(callTimerInterval);
    };
  }, [callActive, callTimerInterval]);

  useEffect(() => {
    if (socket && userId) {
      socket.emit("register", { type: "user", id: userId });
      console.log("User: Registered on socket as user", userId);
    }
  }, [socket, userId]);

  useEffect(() => {
    const initializeMedia = async () => {
      try {
        setConnectionStatus("connecting");
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        localStreamRef.current = stream;
        setLocalStream(stream);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
        console.log("User: Local stream obtained.");
        setConnectionStatus("idle");
      } catch (err) {
        console.error("User: Error accessing camera/mic:", err);
        setConnectionStatus("failed");
      }
    };
    initializeMedia();

    return () => {
      stopLocalStream();
      endCallCleanup();
      console.log("User: Component unmounted, all resources cleaned up.");
    };
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.on("video:incoming", (data) => {
      if (data.chatId === chatId && data.callerId === doctorId) {
        console.log("User: Incoming call from doctor:", data);
        setIncomingCall(true);
      }
    });

    socket.on("video:ended", (data) => {
      if (data.chatId === chatId) {
        console.log("User: Call ended by doctor.", data);
        stopLocalStream();
        endCallCleanup();
      }
    });

    socket.on("video-signal", (data) => {
      if (data.chatId === chatId) {
        console.log("User: Received video signal", data.signal);
        handleSignal(data.signal);
      }
    });

    return () => {
      socket.off("video:incoming");
      socket.off("video:ended");
      socket.off("video-signal");
    };
  }, [socket, chatId, userId, doctorId]);

  const stopMediaTracks = (stream: MediaStream | null) => {
    if (!stream) return;
    stream.getTracks().forEach((track) => {
      track.stop();
      console.log(`User: Track ${track.kind} stopped.`);
    });
  };

  const stopLocalStream = () => {
    if (localStreamRef.current) {
      stopMediaTracks(localStreamRef.current);
      if (localVideoRef.current) {
        localVideoRef.current.pause();
        localVideoRef.current.srcObject = null;
      }
      localStreamRef.current = null;
    }
    if (localStream) {
      stopMediaTracks(localStream);
      setLocalStream(null);
    }
    console.log("User: Local stream fully stopped.");
  };

  const acceptCall = () => {
    if (!socket || !localStreamRef.current) {
      console.error("User: Cannot accept call without socket or local stream.");
      return;
    }
    console.log("User: Accepting call from doctor.");
    socket.emit("video:accept", {
      chatId,
      callerType: "user",
      callerId: userId,
      recipientType: "doctor",
      recipientId: doctorId,
    });
    setIncomingCall(false);
    setConnectionStatus("connecting");
  };

  const endCallCleanup = () => {
    console.log("User: Call cleanup started.");
    setCallActive(false);
    setConnectionStatus("idle");
    setIncomingCall(false);
    if (peer) {
      peer.destroy();
      setPeer(null);
      console.log("User: Peer connection destroyed.");
    }
    if (remoteVideoRef.current && remoteVideoRef.current.srcObject) {
      remoteVideoRef.current.srcObject = null;
      console.log("User: Remote stream cleared.");
    }
    setRemoteStream(null);
    console.log("User: Call cleanup completed.");
  };

  const endCall = () => {
    console.log("User: End call button clicked.");
    if (!socket) return;
    if (callActive) {
      socket.emit("video:end", {
        chatId,
        callerType: "user",
        callerId: userId,
        recipientType: "doctor",
        recipientId: doctorId,
      });
      console.log("User: Emitted video:end event.");
    }
    stopLocalStream();
    endCallCleanup();
    onClose();
  };

  const startPeer = (initiator: boolean, incomingSignal?: SimplePeer.SignalData) => {
    if (!localStreamRef.current) {
      console.error("User: Cannot start peer, no local stream.");
      return;
    }
    console.log("User: Starting peer connection. Initiator:", initiator);
    try {
      const newPeer = new SimplePeer({
        initiator,
        trickle: false,
        stream: localStreamRef.current,
      });

      newPeer.on("signal", (signalData) => {
        console.log("User: Emitting video-signal", signalData);
        socket?.emit("video-signal", {
          chatId,
          callerType: "user",
          callerId: userId,
          recipientType: "doctor",
          recipientId: doctorId,
          signal: signalData,
        });
      });

      newPeer.on("stream", (remoteStreamData) => {
        console.log("User: Received remote stream from doctor.");
        setRemoteStream(remoteStreamData);
        setConnectionStatus("connected");
        setCallActive(true); // Set callActive to true only when the remote stream is received
      });

      newPeer.on("connect", () => {
        console.log("User: Peer connection established successfully.");
        setConnectionStatus("connected");
      });

      newPeer.on("error", (err) => {
        console.error("User: Peer connection error:", err);
        setConnectionStatus("failed");
        endCallCleanup();
      });

      newPeer.on("close", () => {
        console.log("User: Peer connection closed.");
        endCallCleanup();
      });

      if (incomingSignal) {
        console.log("User: Applying incoming signal to peer.");
        newPeer.signal(incomingSignal);
      }

      setPeer(newPeer);
    } catch (err) {
      console.error("User: Error creating SimplePeer:", err);
      setConnectionStatus("failed");
    }
  };

  const handleSignal = (signal: SimplePeer.SignalData) => {
    if (peer) {
      console.log("User: Adding received signal to existing peer:", signal);
      peer.signal(signal);
    } else {
      console.log("User: No peer exists. Starting peer with received signal.");
      startPeer(false, signal);
    }
  };

  useEffect(() => {
    if (remoteStream && remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = remoteStream;
      remoteVideoRef.current.play().catch((err) => console.error("User: Error playing remote video:", err));
    }
  }, [remoteStream]);

  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTracks = localStreamRef.current.getAudioTracks();
      const newMuteState = !isMuted;
      audioTracks.forEach((track) => (track.enabled = !newMuteState));
      setIsMuted(newMuteState);
      console.log("User: Toggled mute. Now muted:", newMuteState);
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTracks = localStreamRef.current.getVideoTracks();
      const newVideoState = !isVideoOff;
      videoTracks.forEach((track) => (track.enabled = !newVideoState));
      setIsVideoOff(newVideoState);
      console.log("User: Toggled video. Video off:", newVideoState);
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch((err) => {
        console.error(`Error enabling fullscreen: ${err.message}`);
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
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
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 backdrop-blur-sm">
      <div
        ref={containerRef}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col relative overflow-hidden border border-red-100"
        style={{ boxShadow: "0 10px 25px -5px rgba(220,38,38,0.4), 0 8px 10px -6px rgba(220,38,38,0.3)" }}
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
              aria-label="End call"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Video Container */}
        <div className="flex-1 flex flex-col md:flex-row p-6 relative overflow-hidden bg-gradient-to-br from-green-50 to-white">
          <div
            className={`${callActive ? "w-full md:w-3/4 h-full" : "w-full h-full"} relative rounded-xl overflow-hidden shadow-lg bg-gray-900`}
            style={{ boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06), inset 0 0 0 1px rgba(220,38,38,0.1)" }}
          >
            {/* Remote Video (Doctor) */}
            {callActive ? (
              remoteStream ? (
                <>
                  <video
                    ref={remoteVideoRef}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover rounded-xl bg-gray-800"
                  />
                  <div className="absolute top-4 left-4 bg-black bg-opacity-60 px-3 py-1 rounded-lg text-white text-sm font-medium flex items-center">
                    <User size={14} className="mr-2" />
                    {doctorName}
                  </div>
                  <div className="absolute top-4 right-4 bg-green-600 bg-opacity-80 px-2 py-1 rounded-lg text-white text-xs font-medium flex items-center">
                    <Shield size={12} className="mr-1" />
                    Secure Connection
                  </div>
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-800 rounded-xl">
                  <p className="text-white">Connecting to {doctorName}...</p>
                </div>
              )
            ) : incomingCall ? (
              <div className="w-full h-full flex items-center justify-center bg-gray-800 rounded-xl">
                <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-gray-800"></div>
                <div className="text-center px-4 z-10">
                  <div className="py-12 px-8">
                    <PhoneCall size={64} className="mx-auto text-red-100 mb-6 opacity-70" />
                    <p className="text-white text-xl mb-4 font-light">Incoming call from {doctorName}</p>
                    <button
                      onClick={acceptCall}
                      className="bg-green-100 hover:bg-green-200 text-gray-800 px-8 py-3 rounded-full text-lg font-medium flex items-center mx-auto transition-all duration-300 ease-in-out shadow-lg"
                    >
                      <PhoneCall className="mr-2" size={20} />
                      Accept Call
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-800 rounded-xl">
                <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-gray-800"></div>
                <div className="text-center px-4 z-10">
                  <div className="py-12 px-8">
                    <Camera size={64} className="mx-auto text-red-100 mb-6 opacity-70" />
                    <p className="text-white text-xl mb-4 font-light">Waiting for doctor to connect...</p>
                    <p className="text-red-100 text-sm opacity-70">Your camera and microphone are ready</p>
                  </div>
                </div>
              </div>
            )}

            {/* Local Video (User) */}
            <div
              className={`absolute bottom-4 right-4 w-1/4 h-1/4 md:w-1/5 md:h-1/5 rounded-lg overflow-hidden transition-all duration-300 border-2 border-red-100 ${isVideoOff ? "bg-gray-900" : ""}`}
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
        <div className="p-5 bg-green-50 flex justify-center items-center space-x-6 border-t border-red-100 rounded-b-2xl">
          <button
            onClick={toggleMute}
            className={`p-4 rounded-full transition-all duration-300 shadow-lg ${isMuted ? "bg-red-600 hover:bg-red-700" : "bg-green-100 hover:bg-green-200"}`}
            style={{ boxShadow: isMuted ? "0 4px 10px rgba(220,38,38,0.3)" : "0 4px 10px rgba(0,0,0,0.1)" }}
            aria-label={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? <MicOff size={24} className="text-white" /> : <Mic size={24} className="text-gray-700" />}
          </button>

          {callActive ? (
            <button
              onClick={endCall}
              className="p-5 bg-red-600 hover:bg-red-700 rounded-full transition-all duration-300 shadow-lg"
              style={{ boxShadow: "0 4px 14px rgba(220,38,38,0.4)" }}
              aria-label="End call"
            >
              <PhoneOff size={30} className="text-white" />
            </button>
          ) : (
            <button
              disabled
              className="p-5 bg-gray-400 cursor-not-allowed rounded-full shadow-lg opacity-60"
              aria-label="Waiting for call"
            >
              <PhoneOff size={30} className="text-white" />
            </button>
          )}

          <button
            onClick={toggleVideo}
            className={`p-4 rounded-full transition-all duration-300 shadow-lg ${isVideoOff ? "bg-red-600 hover:bg-red-700" : "bg-green-100 hover:bg-green-200"}`}
            style={{ boxShadow: isVideoOff ? "0 4px 10px rgba(220,38,38,0.3)" : "0 4px 10px rgba(0,0,0,0.1)" }}
            aria-label={isVideoOff ? "Turn on camera" : "Turn off camera"}
          >
            {isVideoOff ? <CameraOff size={24} className="text-white" /> : <Camera size={24} className="text-gray-700" />}
          </button>
        </div>

        <style>
          {`
            ::-webkit-scrollbar { width: 8px; height: 8px; }
            ::-webkit-scrollbar-track { background: rgba(254,226,226,0.3); border-radius: 10px; }
            ::-webkit-scrollbar-thumb { background: rgba(220,38,38,0.7); border-radius: 10px; }
            ::-webkit-scrollbar-thumb:hover { background: rgba(220,38,38,0.9); }
          `}
        </style>
      </div>
    </div>
  );
};

export default UserVideoCall;

// "use client";

// import React, { useEffect, useRef, useState } from "react";
// import SimplePeer from "simple-peer";
// import { useSocket } from "../../context/SocketContext";
// import {
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

// interface UserVideoCallProps {
//   chatId: string;
//   userId: string;   
//   doctorId: string; 
//   onClose: () => void;
//   logo?: string;    
//   doctorName?: string;
// }

// const UserVideoCall: React.FC<UserVideoCallProps> = ({
//   chatId,
//   userId,
//   doctorId,
//   onClose,
//   logo,
//   doctorName = "Doctor",
// }) => {
//   const socket = useSocket();
//   const [localStream, setLocalStream] = useState<MediaStream | null>(null);
//   const [, setRemoteStream] = useState<MediaStream | null>(null);
//   const [callActive, setCallActive] = useState(false);
//   const [peer, setPeer] = useState<SimplePeer.Instance | null>(null);
//   const [isMuted, setIsMuted] = useState(false);
//   const [isVideoOff, setIsVideoOff] = useState(false);
//   const [isFullscreen, setIsFullscreen] = useState(false);
//   const [callDuration, setCallDuration] = useState(0);
//   const [callTimerInterval, setCallTimerInterval] = useState<NodeJS.Timeout | null>(null);
//   const [connectionStatus, setConnectionStatus] = useState<"idle" | "connecting" | "connected" | "failed">("idle");

//   const localVideoRef = useRef<HTMLVideoElement>(null);
//   const remoteVideoRef = useRef<HTMLVideoElement>(null);
//   const localStreamRef = useRef<MediaStream | null>(null);
//   const containerRef = useRef<HTMLDivElement>(null);

//   const formatCallDuration = (seconds: number) => {
//     const mins = Math.floor(seconds / 60);
//     const secs = seconds % 60;
//     return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
//   };

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

//   useEffect(() => {
//     if (socket && userId) {
//       socket.emit("register", { type: "user", id: userId });
//       console.log("User: Registered on socket as user", userId);
//     }
//   }, [socket, userId]);

//   const stopMediaTracks = (stream: MediaStream | null) => {
//     if (!stream) return;
    
//     stream.getTracks().forEach((track) => {
//       track.stop();
//       console.log(`User: Track ${track.kind} stopped.`);
//     });
//   };

  
// const stopLocalStream = () => {
//   if (localStreamRef.current) {
//     stopMediaTracks(localStreamRef.current);
//     if (localVideoRef.current) {
//       localVideoRef.current.pause();
//       localVideoRef.current.srcObject = null;
//     }
//     localStreamRef.current = null;
//   }
  
//   if (localStream) {
//     stopMediaTracks(localStream);
//     setLocalStream(null);
//   }
  
//   console.log("User: Local stream fully stopped.");
// };

//   useEffect(() => {
//     setConnectionStatus("connecting");
//     navigator.mediaDevices
//       .getUserMedia({ video: true, audio: true })
//       .then((stream) => {
//         localStreamRef.current = stream;
//         setLocalStream(stream);
//         if (localVideoRef.current) {
//           localVideoRef.current.srcObject = stream;
//         }
//         console.log("User: Local stream obtained.");
//         setConnectionStatus("idle");
//       })
//       .catch((err) => {
//         console.error("User: Error accessing camera/mic:", err);
//         setConnectionStatus("failed");
//       });
    
//     return () => {
//       stopLocalStream();
//       endCallCleanup();
//       console.log("User: Component unmounted, all resources cleaned up.");
//     };
//   }, []);

//   useEffect(() => {
//     if (localStream && !callActive) {
//       console.log("User: Local stream is ready. Starting peer connection as callee (initiator: false).");
//       startPeer(false);
//     }
//   }, [localStream, callActive]);

//   useEffect(() => {
//     if (!socket) return;
    
//     socket.on("video:rejected", (data) => {
//       if (data.chatId === chatId && data.recipientId === userId) {
//         console.log("User: Doctor rejected call.", data);
//         setConnectionStatus("failed");
//         stopLocalStream();
//         endCallCleanup();
//       }
//     });
    
//     socket.on("video:ended", (data) => {
//       if (data.chatId === chatId) {
//         console.log("User: Call ended by doctor.", data);
//         stopLocalStream();
//         endCallCleanup();
//       }
//     });
    
//     socket.on("video-signal", (data) => {
//       if (data.chatId === chatId) {
//         console.log("User: Received video signal", data.signal);
//         handleSignal(data.signal);
//       }
//     });
    
//     return () => {
//       socket.off("video:rejected");
//       socket.off("video:ended");
//       socket.off("video-signal");
//     };
//   }, [socket, chatId, userId]);

//   const endCallCleanup = () => {
//     console.log("User: Call cleanup started.");
//     setCallActive(false);
//     setConnectionStatus("idle");
    
//     if (peer) {
//       peer.destroy();
//       setPeer(null);
//       console.log("User: Peer connection destroyed.");
//     }
    
//     if (remoteVideoRef.current && remoteVideoRef.current.srcObject) {
//       remoteVideoRef.current.srcObject = null;
//       console.log("User: Remote stream cleared.");
//     }
//     setRemoteStream(null);
    
//     console.log("User: Call cleanup completed.");
//   };

//   const endCall = () => {
//     console.log("User: End call button clicked.");
//     if (!socket) return;
    
//     if (callActive) {
//       socket.emit("video:end", {
//         chatId,
//         callerType: "user",
//         callerId: userId,
//         recipientType: "doctor",
//         recipientId: doctorId,
//       });
//       console.log("User: Emitted video:end event.");
//     }
    
//     // First stop the streams, then do the other cleanup
//     stopLocalStream();
//     endCallCleanup();
    
//     // Finally call the onClose prop
//     onClose();
//   };

//   // Start the peer connection (user should always be non-initiator)
//   const startPeer = (initiator: boolean, incomingSignal?: SimplePeer.SignalData) => {
//     if (!localStreamRef.current) {
//       console.error("User: Cannot start peer, no local stream.");
//       return;
//     }
    
//     console.log("User: Starting peer connection. Initiator:", initiator);
    
//     const newPeer = new SimplePeer({
//       initiator, // for user, should be false
//       trickle: false,
//       stream: localStreamRef.current,
//     });
    
//     newPeer.on("signal", (signalData) => {
//       console.log("User: Emitting video-signal", signalData);
//       socket?.emit("video-signal", {
//         chatId,
//         callerType: "user",
//         callerId: userId,
//         recipientType: "doctor",
//         recipientId: doctorId,
//         signal: signalData,
//       });
//     });
    
//     newPeer.on("stream", (remoteStreamData) => {
//       console.log("User: Received remote stream from doctor.");
//       setRemoteStream(remoteStreamData);
//       if (remoteVideoRef.current) {
//         remoteVideoRef.current.srcObject = remoteStreamData;
//       }
//       setConnectionStatus("connected");
//     });
    
//     newPeer.on("connect", () => {
//       console.log("User: Peer connection established successfully.");
//       setConnectionStatus("connected");
//     });
    
//     newPeer.on("error", (err) => {
//       console.error("User: Peer connection error:", err);
//       setConnectionStatus("failed");
//       endCallCleanup();
//     });
    
//     newPeer.on("close", () => {
//       console.log("User: Peer connection closed.");
//       endCallCleanup();
//     });
    
//     if (incomingSignal) {
//       console.log("User: Applying incoming signal to peer.");
//       newPeer.signal(incomingSignal);
//     }
    
//     setPeer(newPeer);
//     setCallActive(true);
//   };

//   const handleSignal = (signal: SimplePeer.SignalData) => {
//     if (peer) {
//       console.log("User: Adding received signal to existing peer:", signal);
//       peer.signal(signal);
//     } else {
//       console.log("User: No peer exists. Starting peer with received signal.");
//       startPeer(false, signal);
//     }
//   };

//   // Toggle audio mute
//   const toggleMute = () => {
//     if (localStreamRef.current) {
//       const audioTracks = localStreamRef.current.getAudioTracks();
//       const newMuteState = !isMuted;
      
//       audioTracks.forEach((track) => {
//         track.enabled = !newMuteState;
//       });
      
//       setIsMuted(newMuteState);
//       console.log("User: Toggled mute. Now muted:", newMuteState);
//     }
//   };

//   // Toggle video on/off
//   const toggleVideo = () => {
//     if (localStreamRef.current) {
//       const videoTracks = localStreamRef.current.getVideoTracks();
//       const newVideoState = !isVideoOff;
      
//       videoTracks.forEach((track) => {
//         track.enabled = !newVideoState;
//       });
      
//       setIsVideoOff(newVideoState);
//       console.log("User: Toggled video. Video off:", newVideoState);
//     }
//   };

//   // Toggle fullscreen
//   const toggleFullscreen = () => {
//     if (!containerRef.current) return;
    
//     if (!document.fullscreenElement) {
//       containerRef.current.requestFullscreen().catch((err) => {
//         console.error(`Error enabling fullscreen: ${err.message}`);
//       });
//       setIsFullscreen(true);
//     } else {
//       document.exitFullscreen();
//       setIsFullscreen(false);
//     }
//   };

//   // Listen for fullscreen changes
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
//     <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 backdrop-blur-sm">
//       <div 
//         ref={containerRef}
//         className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col relative overflow-hidden border border-red-100"
//         style={{
//           boxShadow: "0 10px 25px -5px rgba(220,38,38,0.4), 0 8px 10px -6px rgba(220,38,38,0.3)",
//         }}
//       >
//         {/* Header */}
//         <div className="flex justify-between items-center p-4 bg-gradient-to-r from-red-600 to-red-700 border-b border-red-700 rounded-t-2xl">
//           <div className="flex items-center space-x-3">
//             {logo && <img src={logo} alt="Healio Logo" className="h-8" />}
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
//               onClick={endCall}
//               className="bg-red-700 hover:bg-red-800 text-white p-2 rounded-full transition-all duration-200 ease-in-out flex items-center justify-center"
//               aria-label="End call"
//             >
//               <X size={18} />
//             </button>
//           </div>
//         </div>

//         {/* Video Container */}
//         <div className="flex-1 flex flex-col md:flex-row p-6 relative overflow-hidden bg-gradient-to-br from-green-50 to-white">
//           <div 
//             className={`${callActive ? "w-full md:w-3/4 h-full" : "w-full h-full"} relative rounded-xl overflow-hidden shadow-lg bg-gray-900`}
//             style={{
//               boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06), inset 0 0 0 1px rgba(220,38,38,0.1)"
//             }}
//           >
//             {/* Remote Video (Doctor) */}
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
//                   {doctorName}
//                 </div>
                
//                 {/* Secure connection badge */}
//                 <div className="absolute top-4 right-4 bg-green-600 bg-opacity-80 px-2 py-1 rounded-lg text-white text-xs font-medium flex items-center">
//                   <Shield size={12} className="mr-1" />
//                   Secure Connection
//                 </div>
//               </>
//             ) : (
//               <div className="w-full h-full flex items-center justify-center bg-gray-800 rounded-xl">
//                 <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-gray-800"></div>
//                 <div className="text-center px-4 z-10">
//                   <div className="py-12 px-8">
//                     <Camera size={64} className="mx-auto text-red-100 mb-6 opacity-70" />
//                     <p className="text-white text-xl mb-4 font-light">Waiting for doctor to connect...</p>
//                     <p className="text-red-100 text-sm opacity-70">Your camera and microphone are ready</p>
//                   </div>
//                 </div>
//               </div>
//             )}

//             {/* Local Video (User) - Picture in Picture */}
//             <div 
//               className={`
//                 absolute bottom-4 right-4 w-1/4 h-1/4 md:w-1/5 md:h-1/5 
//                 rounded-lg overflow-hidden transition-all duration-300 
//                 border-2 border-red-100 ${isVideoOff ? 'bg-gray-900' : ''}
//               `}
//               style={{ boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)" }}
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
//         <div className="p-5 bg-green-50 flex justify-center items-center space-x-6 border-t border-red-100 rounded-b-2xl">
//           <button
//             onClick={toggleMute}
//             className={`p-4 rounded-full transition-all duration-300 shadow-lg ${isMuted ? 'bg-red-600 hover:bg-red-700' : 'bg-green-100 hover:bg-green-200'}`}
//             style={{ boxShadow: isMuted ? "0 4px 10px rgba(220,38,38,0.3)" : "0 4px 10px rgba(0,0,0,0.1)" }}
//             aria-label={isMuted ? "Unmute" : "Mute"}
//           >
//             {isMuted ? <MicOff size={24} className="text-white" /> : <Mic size={24} className="text-gray-700" />}
//           </button>

//           {callActive ? (
//             <button
//               onClick={endCall}
//               className="p-5 bg-red-600 hover:bg-red-700 rounded-full transition-all duration-300 shadow-lg"
//               style={{ boxShadow: "0 4px 14px rgba(220,38,38,0.4)" }}
//               aria-label="End call"
//             >
//               <PhoneOff size={30} className="text-white" />
//             </button>
//           ) : (
//             <button
//               disabled
//               className="p-5 bg-gray-400 cursor-not-allowed rounded-full shadow-lg opacity-60"
//               aria-label="Waiting for call"
//             >
//               <PhoneOff size={30} className="text-white" />
//             </button>
//           )}

//           <button
//             onClick={toggleVideo}
//             className={`p-4 rounded-full transition-all duration-300 shadow-lg ${isVideoOff ? 'bg-red-600 hover:bg-red-700' : 'bg-green-100 hover:bg-green-200'}`}
//             style={{ boxShadow: isVideoOff ? "0 4px 10px rgba(220,38,38,0.3)" : "0 4px 10px rgba(0,0,0,0.1)" }}
//             aria-label={isVideoOff ? "Turn on camera" : "Turn off camera"}
//           >
//             {isVideoOff ? <CameraOff size={24} className="text-white" /> : <Camera size={24} className="text-gray-700" />}
//           </button>
//         </div>

//         {/* Custom Scrollbar Styles */}
//         <style>
//           {`
//             ::-webkit-scrollbar { width: 8px; height: 8px; }
//             ::-webkit-scrollbar-track { background: rgba(254,226,226,0.3); border-radius: 10px; }
//             ::-webkit-scrollbar-thumb { background: rgba(220,38,38,0.7); border-radius: 10px; }
//             ::-webkit-scrollbar-thumb:hover { background: rgba(220,38,38,0.9); }
//           `}
//         </style>
//       </div>
//     </div>
//   );
// };

// export default UserVideoCall;




