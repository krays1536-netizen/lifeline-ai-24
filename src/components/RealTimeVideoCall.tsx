import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Phone, 
  PhoneOff,
  Monitor,
  Settings,
  Users,
  MessageCircle,
  Heart,
  Activity
} from "lucide-react";

interface RealTimeVideoCallProps {
  consultationId: string;
  userType: 'patient' | 'doctor';
  otherParticipant: any;
  onEndCall: () => void;
}

export const RealTimeVideoCall = ({ 
  consultationId, 
  userType, 
  otherParticipant, 
  onEndCall 
}: RealTimeVideoCallProps) => {
  const { toast } = useToast();
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');
  const [showChat, setShowChat] = useState(false);
  const [vitalsVisible, setVitalsVisible] = useState(false);
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);

  useEffect(() => {
    initializeCall();
    const timer = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);

    return () => {
      clearInterval(timer);
      endCall();
    };
  }, []);

  const initializeCall = async () => {
    try {
      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      
      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      // Initialize WebRTC
      const configuration = {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' }
        ]
      };
      
      const peerConnection = new RTCPeerConnection(configuration);
      peerConnectionRef.current = peerConnection;

      // Add local stream to peer connection
      stream.getTracks().forEach(track => {
        peerConnection.addTrack(track, stream);
      });

      // Handle remote stream
      peerConnection.ontrack = (event) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0];
        }
      };

      // Handle connection state changes
      peerConnection.onconnectionstatechange = () => {
        setConnectionStatus(peerConnection.connectionState as any);
      };

      setConnectionStatus('connected');
      
      toast({
        title: "Call connected",
        description: `Connected with ${otherParticipant.full_name}`,
      });

    } catch (error) {
      console.error('Error initializing call:', error);
      toast({
        title: "Call failed",
        description: "Failed to initialize video call",
        variant: "destructive",
      });
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
      }
    }
  };

  const toggleAudio = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
      }
    }
  };

  const shareScreen = async () => {
    try {
      if (!isScreenSharing) {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true
        });
        
        // Replace video track with screen share
        const videoTrack = screenStream.getVideoTracks()[0];
        const sender = peerConnectionRef.current?.getSenders().find(
          s => s.track?.kind === 'video'
        );
        
        if (sender) {
          await sender.replaceTrack(videoTrack);
        }
        
        setIsScreenSharing(true);
        
        // Handle screen share end
        videoTrack.onended = () => {
          setIsScreenSharing(false);
          // Switch back to camera
          if (localStreamRef.current) {
            const cameraTrack = localStreamRef.current.getVideoTracks()[0];
            if (sender) {
              sender.replaceTrack(cameraTrack);
            }
          }
        };
      } else {
        // Stop screen sharing
        setIsScreenSharing(false);
      }
    } catch (error) {
      console.error('Error sharing screen:', error);
      toast({
        title: "Screen share failed",
        description: "Could not start screen sharing",
        variant: "destructive",
      });
    }
  };

  const endCall = () => {
    // Clean up media streams
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
    }
    
    // Close peer connection
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }
    
    // Update consultation status
    supabase
      .from('consultations')
      .update({ 
        status: 'completed',
        ended_at: new Date().toISOString()
      })
      .eq('id', consultationId);

    onEndCall();
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="bg-black/50 p-4 flex justify-between items-center text-white">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${
              connectionStatus === 'connected' ? 'bg-green-500' : 
              connectionStatus === 'connecting' ? 'bg-yellow-500' : 'bg-red-500'
            }`} />
            <span className="text-sm capitalize">{connectionStatus}</span>
          </div>
          <div className="text-sm">
            Duration: {formatDuration(callDuration)}
          </div>
        </div>
        
        <div className="text-center">
          <h2 className="text-lg font-semibold">{otherParticipant.full_name}</h2>
          <p className="text-sm text-gray-300">
            {userType === 'patient' ? otherParticipant.specialization : 'Patient'}
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {userType === 'doctor' && (
            <Button
              variant={vitalsVisible ? "default" : "secondary"}
              size="sm"
              onClick={() => setVitalsVisible(!vitalsVisible)}
            >
              <Activity className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant={showChat ? "default" : "secondary"}
            size="sm"
            onClick={() => setShowChat(!showChat)}
          >
            <MessageCircle className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Video Area */}
      <div className="flex-1 relative">
        {/* Remote Video */}
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
        />

        {/* Local Video (Picture-in-Picture) */}
        <div className="absolute top-4 right-4 w-48 h-36 bg-gray-800 rounded-lg overflow-hidden border-2 border-white/20">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
          {!isVideoEnabled && (
            <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
              <VideoOff className="h-8 w-8 text-gray-400" />
            </div>
          )}
        </div>

        {/* Vitals Panel (for doctors) */}
        {vitalsVisible && userType === 'doctor' && (
          <Card className="absolute top-4 left-4 w-64">
            <CardContent className="p-4">
              <h3 className="font-semibold mb-2 flex items-center">
                <Heart className="h-4 w-4 mr-2 text-red-500" />
                Patient Vitals
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Heart Rate:</span>
                  <span className="font-mono">72 BPM</span>
                </div>
                <div className="flex justify-between">
                  <span>Blood Pressure:</span>
                  <span className="font-mono">120/80</span>
                </div>
                <div className="flex justify-between">
                  <span>Temperature:</span>
                  <span className="font-mono">98.6°F</span>
                </div>
                <div className="flex justify-between">
                  <span>Oxygen:</span>
                  <span className="font-mono">98%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Chat Panel */}
        {showChat && (
          <Card className="absolute right-4 top-20 bottom-20 w-80">
            <CardContent className="p-4 h-full flex flex-col">
              <h3 className="font-semibold mb-2">Chat</h3>
              <div className="flex-1 bg-gray-50 rounded p-2 mb-2">
                <p className="text-sm text-gray-500">Chat messages would appear here...</p>
              </div>
              <div className="flex space-x-2">
                <input 
                  type="text" 
                  placeholder="Type a message..."
                  className="flex-1 px-3 py-2 border rounded-md text-sm"
                />
                <Button size="sm">Send</Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Control Bar */}
      <div className="bg-black/70 p-4">
        <div className="flex justify-center space-x-4">
          <Button
            variant={isAudioEnabled ? "secondary" : "destructive"}
            size="lg"
            onClick={toggleAudio}
            className="rounded-full w-12 h-12"
          >
            {isAudioEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
          </Button>
          
          <Button
            variant={isVideoEnabled ? "secondary" : "destructive"}
            size="lg"
            onClick={toggleVideo}
            className="rounded-full w-12 h-12"
          >
            {isVideoEnabled ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
          </Button>

          <Button
            variant={isScreenSharing ? "default" : "secondary"}
            size="lg"
            onClick={shareScreen}
            className="rounded-full w-12 h-12"
          >
            <Monitor className="h-5 w-5" />
          </Button>

          <Button
            variant="destructive"
            size="lg"
            onClick={endCall}
            className="rounded-full w-12 h-12"
          >
            <PhoneOff className="h-5 w-5" />
          </Button>

          <Button
            variant="secondary"
            size="lg"
            className="rounded-full w-12 h-12"
          >
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};