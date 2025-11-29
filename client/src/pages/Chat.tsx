import React, { useState, useEffect, useRef } from 'react';
import { useSocket, useAuth } from '../utils/context';
import { api } from '../utils/api';
import { useParams, useNavigate } from 'react-router-dom';
import { useUI } from '../utils/uiContext';

interface Message {
  id: string;
  senderId: string;
  recipientId: string;
  content: string;
  createdAt: string;
  attachmentUrl?: string | null;
  attachmentType?: string | null;
}

interface TypingIndicator {
  [key: string]: boolean;
}

export function Chat() {
  const { friendId } = useParams<{ friendId: string }>();
  const { user } = useAuth();
  const { socket, isConnected } = useSocket();
  const [messages, setMessages] = useState<Message[]>([]);
  const [fileInputKey, setFileInputKey] = useState<number>(Date.now());
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<any>(null);
  const recordedChunksRef = useRef<BlobPart[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState<TypingIndicator>({});
  const [friend, setFriend] = useState<any>(null);
  const [inCall, setInCall] = useState(false);
  const [incomingCall, setIncomingCall] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const autoRefreshRef = useRef<NodeJS.Timeout>();
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const callAnswerTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const navigate = useNavigate();
  const { toggleSidebar } = useUI();

  // Load conversation
  useEffect(() => {
    if (!friendId || !user) return;

    loadConversation();
    loadFriendInfo();
  }, [friendId, user]);

  // Auto refresh messages every 3 seconds
  useEffect(() => {
    if (!friendId) return;

    autoRefreshRef.current = setInterval(() => {
      loadConversation();
    }, 3000);

    return () => {
      if (autoRefreshRef.current) clearInterval(autoRefreshRef.current);
    };
  }, [friendId]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Listen for new messages and call events
  useEffect(() => {
    if (!socket) return;

    socket.on('receive_message', (message: Message) => {
      setMessages((prev) => [...prev, message]);
    });

    socket.on('user_typing', (data: { userId: string; isTyping: boolean }) => {
      setIsTyping((prev) => ({
        ...prev,
        [data.userId]: data.isTyping,
      }));
    });

    socket.on('incoming_call', (data: { callerId: string; offer: any; callType: 'audio' | 'video' }) => {
      setIncomingCall(data);
    });

    socket.on('call_answered', (data: { answererId: string; answer: any }) => {
      if (callAnswerTimeoutRef.current) {
        clearTimeout(callAnswerTimeoutRef.current);
        callAnswerTimeoutRef.current = null;
      }
      if (peerConnectionRef.current) {
        peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(data.answer));
      }
    });

    socket.on('ice_candidate', (data: { from: string; candidate: any }) => {
      if (peerConnectionRef.current && data.candidate) {
        peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(data.candidate));
      }
    });

    socket.on('call_ended', () => {
      endCall();
    });

    return () => {
      socket.off('receive_message');
      socket.off('user_typing');
      socket.off('incoming_call');
      socket.off('call_answered');
      socket.off('ice_candidate');
      socket.off('call_ended');
    };
  }, [socket]);

  const loadFriendInfo = async () => {
    try {
      const response = await api.auth.getUserById(friendId!);
      setFriend(response.data);
    } catch (error) {
      console.error('Failed to load friend info:', error);
    }
  };

  const loadConversation = async () => {
    try {
      const response = await api.messages.getConversation(friendId!);
      setMessages(response.data);
    } catch (error) {
      console.error('Failed to load conversation:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !socket || !isConnected) return;

    socket.emit(
      'send_message',
      {
        recipientId: friendId,
        content: messageInput,
      },
      (response: any) => {
        if (response.success) {
          setMessageInput('');
          setMessages((prev) => [...prev, response.message]);
        }
      }
    );
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f || !socket || !isConnected) return;

    try {
      const res = await api.messages.uploadAttachment(friendId!, f);
      if (res.data?.message) {
        setMessages((prev) => [...prev, res.data.message]);
        // reset file input
        setFileInputKey(Date.now());
      }
    } catch (err) {
      console.error('Upload failed', err);
      alert('Failed to upload file');
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new (window as any).MediaRecorder(stream);
      recordedChunksRef.current = [];
      mediaRecorder.ondataavailable = (ev: any) => {
        if (ev.data && ev.data.size) recordedChunksRef.current.push(ev.data);
      };
      mediaRecorder.onstop = async () => {
        const blob = new Blob(recordedChunksRef.current, { type: 'audio/webm' });
        const file = new File([blob], `voice-${Date.now()}.webm`, { type: blob.type });
        try {
          const res = await api.messages.uploadAttachment(friendId!, file);
          if (res.data?.message) setMessages((prev) => [...prev, res.data.message]);
        } catch (err) {
          console.error('Voice upload failed', err);
          alert('Failed to send voice message');
        }
      };
      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);
    } catch (err) {
      console.error('Failed to start recording', err);
      alert('Microphone access denied');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      // stop tracks
      try {
        const stream = (mediaRecorderRef.current.stream as MediaStream);
        stream.getTracks().forEach((t: MediaStreamTrack) => t.stop());
      } catch (e) {}
      mediaRecorderRef.current = null;
    }
    setIsRecording(false);
  };

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessageInput(e.target.value);

    if (!socket) return;

    socket.emit('typing', { recipientId: friendId, isTyping: true });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('typing', { recipientId: friendId, isTyping: false });
    }, 3000);
  };

  const startCall = async (callType: 'audio' | 'video') => {
    try {
      setInCall(true);

      // Get user media
      const constraints = {
        audio: true,
        video: callType === 'video' ? { width: { ideal: 1280 }, height: { ideal: 720 } } : false,
      };

      const localStream = await navigator.mediaDevices.getUserMedia(constraints);

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = localStream;
      }

      // Create peer connection
      const peerConnection = new RTCPeerConnection({
        iceServers: [{ urls: ['stun:stun.l.google.com:19302'] }],
      });

      peerConnectionRef.current = peerConnection;

      // Add local stream tracks to peer connection
      localStream.getTracks().forEach((track) => {
        peerConnection.addTrack(track, localStream);
      });

      // Handle remote stream
      peerConnection.ontrack = (event) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0];
        }
      };

      // Handle ICE candidates
      peerConnection.onicecandidate = (event) => {
        if (event.candidate && socket) {
          socket.emit('ice_candidate', {
            recipientId: friendId,
            candidate: event.candidate,
          });
        }
      };

      // Create offer
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);

      // Send offer via Socket.IO
      socket?.emit('call_offer', {
        recipientId: friendId,
        offer,
        callType,
      });

      // If no answer within 30s, end the call
      if (callAnswerTimeoutRef.current) clearTimeout(callAnswerTimeoutRef.current);
      callAnswerTimeoutRef.current = setTimeout(() => {
        console.warn('Call not answered in time, ending call');
        endCall();
      }, 30000);
    } catch (error) {
      console.error('Failed to start call:', error);
      setInCall(false);
    }
  };

  const acceptCall = async () => {
    try {
      if (!incomingCall) return;

      setInCall(true);

      // Get user media
      const constraints = {
        audio: true,
        video: incomingCall.callType === 'video' ? { width: { ideal: 1280 }, height: { ideal: 720 } } : false,
      };

      const localStream = await navigator.mediaDevices.getUserMedia(constraints);

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = localStream;
      }

      // Create peer connection
      const peerConnection = new RTCPeerConnection({
        iceServers: [{ urls: ['stun:stun.l.google.com:19302'] }],
      });

      peerConnectionRef.current = peerConnection;

      // Add local stream tracks
      localStream.getTracks().forEach((track) => {
        peerConnection.addTrack(track, localStream);
      });

      // Handle remote stream
      peerConnection.ontrack = (event) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0];
        }
      };

      // Handle ICE candidates
      peerConnection.onicecandidate = (event) => {
        if (event.candidate && socket) {
          socket.emit('ice_candidate', {
            recipientId: incomingCall.callerId,
            candidate: event.candidate,
          });
        }
      };

      // Set remote description
      await peerConnection.setRemoteDescription(new RTCSessionDescription(incomingCall.offer));

      // Create and send answer
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);

      socket?.emit('call_answer', {
        recipientId: incomingCall.callerId,
        answer,
      });

      setIncomingCall(null);
    } catch (error) {
      console.error('Failed to accept call:', error);
      setInCall(false);
    }
  };

  const endCall = () => {
    // Stop all tracks
    if (localVideoRef.current?.srcObject) {
      (localVideoRef.current.srcObject as MediaStream).getTracks().forEach((track) => track.stop());
    }
    if (remoteVideoRef.current?.srcObject) {
      (remoteVideoRef.current.srcObject as MediaStream).getTracks().forEach((track) => track.stop());
    }

    // Close peer connection
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    setInCall(false);
    setIncomingCall(null);

    // Notify other user
    socket?.emit('call_end', { recipientId: friendId });
  };

  if (!friendId) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <p className="text-gray-600">Select a conversation to start</p>
      </div>
    );
  }

  if (inCall) {
    return (
      <div className="flex flex-col h-full bg-black">
        {/* Call Header */}
        <div className="bg-gray-900 text-white p-4 flex items-center justify-between">
          <h2 className="font-semibold text-lg">{friend?.displayName} - Call in progress</h2>
          <button
            onClick={endCall}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
          >
            End Call
          </button>
        </div>

        {/* Video Container */}
        <div className="flex-1 flex gap-4 p-4 overflow-hidden">
          {/* Remote Video */}
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="flex-1 bg-black rounded-lg object-cover"
          />

          {/* Local Video */}
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="w-48 h-48 bg-gray-800 rounded-lg object-cover"
          />
        </div>
      </div>
    );
  }

  if (incomingCall) {
    return (
      <div className="flex flex-col h-full bg-gradient-to-b from-cyan-500 to-blue-600 items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center max-w-md">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">{friend?.displayName}</h2>
          <p className="text-gray-600 mb-6">
            Incoming {incomingCall.callType === 'video' ? 'video' : 'audio'} call...
          </p>

          <div className="flex gap-4 justify-center">
            <button
              onClick={acceptCall}
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-semibold"
            >
              Accept
            </button>
            <button
              onClick={() => setIncomingCall(null)}
              className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-semibold"
            >
              Decline
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/chat')}
            className="text-xl hover:opacity-80 md:hidden"
          >
            ←
          </button>
          <button className="mr-2 hidden md:inline" id="sidebar-toggle" onClick={() => toggleSidebar()}>☰</button>
          <div>
            <h2 className="font-semibold text-lg">{friend?.displayName || friend?.username}</h2>
            <p className="text-sm opacity-90">Online</p>
          </div>
        </div>

        {/* Call Buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => startCall('audio')}
            title="Voice Call"
            className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded-lg transition text-xl"
          >
            ☎️
          </button>
          <button
            onClick={() => startCall('video')}
            title="Video Call"
            className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded-lg transition text-xl"
          >
            📹
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.senderId === user?.userId ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs px-4 py-2 rounded-lg ${
                msg.senderId === user?.userId
                  ? 'bg-cyan-500 text-white rounded-br-none'
                  : 'bg-gray-200 text-gray-800 rounded-bl-none'
              }`}
            >
              {msg.attachmentUrl ? (
                msg.attachmentType?.startsWith('image/') ? (
                  <img src={msg.attachmentUrl} alt="attachment" className="max-w-xs rounded mb-2" />
                ) : msg.attachmentType?.startsWith('audio/') ? (
                  <audio controls src={msg.attachmentUrl} className="mb-2" />
                ) : (
                  <a href={msg.attachmentUrl} target="_blank" rel="noreferrer" className="underline">
                    Download attachment
                  </a>
                )
              ) : (
                <p>{msg.content}</p>
              )}
              <p className="text-xs opacity-70 mt-1">
                {new Date(msg.createdAt).toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
        {isTyping[friendId] && (
          <div className="flex justify-start">
            <div className="text-gray-500 text-sm italic">typing...</div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSendMessage} className="border-t border-gray-200 p-4 flex gap-2 items-center">
        <input
          type="text"
          value={messageInput}
          onChange={handleTyping}
          placeholder="Type a message..."
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
          disabled={!isConnected}
        />

        <input key={fileInputKey} type="file" onChange={handleFileChange} className="hidden" id="file-upload" />
        <label htmlFor="file-upload" className="px-3 py-2 bg-gray-100 rounded cursor-pointer">📎</label>

        <button
          type="button"
          onMouseDown={() => startRecording()}
          onMouseUp={() => stopRecording()}
          title="Hold to record voice"
          className={`px-3 py-2 rounded ${isRecording ? 'bg-red-500 text-white' : 'bg-gray-100'}`}
        >
          🎤
        </button>

        <button
          type="submit"
          disabled={!isConnected || !messageInput.trim()}
          className="bg-cyan-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-cyan-600 transition disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </div>
  );
}
