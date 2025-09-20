import { useState, useRef, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Camera, Play, Square, Download, Eye, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface WitnessCamProps {
  isActive: boolean;
  onRecordingStart: () => void;
  onRecordingStop: (recordingData: Blob) => void;
}

export const WitnessCam = ({ isActive, onRecordingStart, onRecordingStop }: WitnessCamProps) => {
  const { toast } = useToast();
  
  // Recording states
  const [isRecording, setIsRecording] = useState(false);
  const [isPreBuffering, setIsPreBuffering] = useState(false);
  const [preBufferProgress, setPreBufferProgress] = useState(0);
  const [showPlayback, setShowPlayback] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  
  // Media refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const playbackRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const preBufferChunksRef = useRef<Blob[]>([]);
  const recordingChunksRef = useRef<Blob[]>([]);
  
  // Pre-buffer management (continuous 10-second rolling buffer)
  const preBufferIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize camera stream
  useEffect(() => {
    if (isActive) {
      initializeCamera();
    } else {
      cleanup();
    }
    
    return cleanup;
  }, [isActive]);

  const initializeCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          frameRate: { ideal: 30 }
        }, 
        audio: true 
      });
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      // Start pre-buffering immediately
      startPreBuffering();
      
      toast({
        title: "Witness Cam Active",
        description: "Pre-buffer recording started (10s rolling)",
        variant: "default"
      });
    } catch (error) {
      toast({
        title: "Camera Access Failed",
        description: "Unable to access camera for witness recording",
        variant: "destructive"
      });
    }
  };

  // Start continuous 10-second pre-buffer
  const startPreBuffering = useCallback(() => {
    if (!streamRef.current) return;
    
    setIsPreBuffering(true);
    
    const mediaRecorder = new MediaRecorder(streamRef.current, {
      mimeType: 'video/webm;codecs=vp9'
    });
    
    mediaRecorderRef.current = mediaRecorder;
    preBufferChunksRef.current = [];
    
    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        preBufferChunksRef.current.push(event.data);
        
        // Keep only last 10 seconds of chunks (rolling buffer)
        if (preBufferChunksRef.current.length > 20) { // ~0.5s per chunk
          preBufferChunksRef.current.shift();
        }
      }
    };
    
    mediaRecorder.start(500); // Chunk every 500ms
    
    // Progress indicator for pre-buffer
    let progress = 0;
    preBufferIntervalRef.current = setInterval(() => {
      progress = (progress + 10) % 100;
      setPreBufferProgress(progress);
    }, 500);
  }, []);

  // Start full recording (includes pre-buffer + ongoing)
  const startRecording = useCallback(() => {
    setIsRecording(true);
    setRecordingDuration(0);
    onRecordingStart();
    
    // Copy pre-buffer chunks to recording
    recordingChunksRef.current = [...preBufferChunksRef.current];
    
    toast({
      title: "🎥 WITNESS CAM RECORDING",
      description: "10s pre-buffer + live recording active",
      variant: "destructive"
    });
    
    // Track recording duration
    recordingIntervalRef.current = setInterval(() => {
      setRecordingDuration(prev => prev + 1);
    }, 1000);
  }, [onRecordingStart]);

  // Stop recording and generate playback
  const stopRecording = useCallback(() => {
    setIsRecording(false);
    
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current);
    }
    
    // Combine all chunks (pre-buffer + recording)
    const fullRecording = new Blob(recordingChunksRef.current, { 
      type: 'video/webm' 
    });
    
    onRecordingStop(fullRecording);
    
    // Create playback URL
    if (playbackRef.current) {
      const recordingURL = URL.createObjectURL(fullRecording);
      playbackRef.current.src = recordingURL;
    }
    
    setShowPlayback(true);
    
    toast({
      title: "Recording Saved",
      description: `${recordingDuration + 10}s total (10s pre-buffer + ${recordingDuration}s live)`,
      variant: "default"
    });
  }, [onRecordingStop, recordingDuration]);

  // Download recording
  const downloadRecording = useCallback(() => {
    if (playbackRef.current?.src) {
      const a = document.createElement('a');
      a.href = playbackRef.current.src;
      a.download = `witness-recording-${new Date().toISOString()}.webm`;
      a.click();
      
      toast({
        title: "Download Started",
        description: "Witness cam recording downloading...",
        variant: "default"
      });
    }
  }, []);

  // Cleanup function
  const cleanup = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    
    if (preBufferIntervalRef.current) {
      clearInterval(preBufferIntervalRef.current);
    }
    
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current);
    }
    
    setIsPreBuffering(false);
    setIsRecording(false);
    setShowPlayback(false);
  }, []);

  // Auto-start recording on external trigger
  useEffect(() => {
    if (isActive && !isRecording && isPreBuffering) {
      startRecording();
    }
  }, [isActive, isRecording, isPreBuffering, startRecording]);

  return (
    <Card className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={cn(
            "p-2 rounded-lg",
            isActive ? "bg-red-500/20" : "bg-muted"
          )}>
            <Camera className={cn(
              "w-6 h-6",
              isActive ? "text-red-500" : "text-muted-foreground"
            )} />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Witness Cam</h3>
            <p className="text-sm text-muted-foreground">
              10s Pre-buffer • Auto-trigger on Fall/Distress
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {isPreBuffering && (
            <Badge variant="outline" className="flex items-center gap-2">
              <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
              Pre-buffer
            </Badge>
          )}
          {isRecording && (
            <Badge variant="destructive" className="flex items-center gap-2">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
              Recording {recordingDuration}s
            </Badge>
          )}
        </div>
      </div>

      {/* Live Camera Feed */}
      <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="w-full h-full object-cover"
        />
        
        {/* Recording Overlay */}
        {isRecording && (
          <div className="absolute top-4 left-4 flex items-center gap-2 bg-red-500/90 text-white px-3 py-1 rounded-full text-sm font-medium">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            REC {Math.floor(recordingDuration / 60)}:{(recordingDuration % 60).toString().padStart(2, '0')}
          </div>
        )}
        
        {/* Pre-buffer Indicator */}
        {isPreBuffering && !isRecording && (
          <div className="absolute bottom-4 left-4 right-4">
            <div className="bg-black/50 backdrop-blur-sm rounded-lg p-2">
              <div className="flex items-center justify-between text-white text-xs mb-1">
                <span>Pre-buffer Active</span>
                <span>10s Rolling</span>
              </div>
              <Progress value={preBufferProgress} className="h-1" />
            </div>
          </div>
        )}
        
        {/* Hotspot Indicator */}
        <div className="absolute top-4 right-4">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowPlayback(!showPlayback)}
            className="bg-black/50 backdrop-blur-sm border border-white/20 text-white hover:bg-white/10"
          >
            <Eye className="w-4 h-4 mr-2" />
            Witness Cam
          </Button>
        </div>
      </div>

      {/* Playback Section */}
      {showPlayback && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold flex items-center gap-2">
              <Play className="w-4 h-4" />
              Pre-buffer Playback Demo
            </h4>
            <Badge variant="outline">
              10 Second Replay
            </Badge>
          </div>
          
          <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
            <video
              ref={playbackRef}
              controls
              playsInline
              className="w-full h-full object-cover"
            />
            
            <div className="absolute top-4 left-4 bg-blue-500/90 text-white px-3 py-1 rounded-full text-sm font-medium">
              Pre-buffer Footage
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button
              onClick={downloadRecording}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download Evidence
            </Button>
            <Button
              onClick={() => setShowPlayback(false)}
              variant="ghost"
              size="sm"
              className="flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Close Playback
            </Button>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center justify-between pt-4 border-t">
        <div className="flex gap-2">
          {!isRecording && isPreBuffering && (
            <Button
              onClick={startRecording}
              variant="destructive"
              size="sm"
              className="flex items-center gap-2"
            >
              <Camera className="w-4 h-4" />
              Start Recording
            </Button>
          )}
          {isRecording && (
            <Button
              onClick={stopRecording}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Square className="w-4 h-4" />
              Stop Recording
            </Button>
          )}
        </div>
        
        <div className="text-sm text-muted-foreground">
          {isPreBuffering ? "Pre-buffer ready" : "Camera standby"}
        </div>
      </div>
    </Card>
  );
};
