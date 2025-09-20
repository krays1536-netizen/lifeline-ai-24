import { useState, useEffect, useRef, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Shield, Mic, Phone, Camera, Watch } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface FallData {
  impact: number;
  orientation: { x: number; y: number; z: number };
  stillness: number;
  timestamp: Date;
}

interface AdvancedFallDetectorProps {
  onFallDetected: (fallData: FallData) => void;
  onSOSActivated: () => void;
  onCameraRecord: () => void;
  onSMSAlert: () => void;
}

export const AdvancedFallDetector = ({ 
  onFallDetected, 
  onSOSActivated, 
  onCameraRecord, 
  onSMSAlert 
}: AdvancedFallDetectorProps) => {
  const { toast } = useToast();
  
  // Detection states
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [fallAlert, setFallAlert] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [isResponseWaiting, setIsResponseWaiting] = useState(false);
  
  // Sensor data
  const [impactLevel, setImpactLevel] = useState(0);
  const [orientationChange, setOrientationChange] = useState(0);
  const [stillnessLevel, setStillnessLevel] = useState(0);
  const [lastMovement, setLastMovement] = useState(Date.now());
  
  // Refs for audio
  const audioContextRef = useRef<AudioContext | null>(null);
  const voiceResponseRef = useRef<boolean>(false);
  
  // Watch vibration pattern
  const vibrateWatch = useCallback(() => {
    if ('vibrate' in navigator) {
      navigator.vibrate([500, 200, 500, 200, 1000]);
    }
  }, []);

  // Voice prompt system
  const playVoicePrompt = useCallback(async () => {
    const utterance = new SpeechSynthesisUtterance("Are you okay? Tap the watch or say something to cancel emergency.");
    utterance.rate = 1.2;
    utterance.volume = 1.0;
    speechSynthesis.speak(utterance);
    
    // Start voice detection
    startVoiceDetection();
  }, []);

  // Voice detection for response
  const startVoiceDetection = useCallback(() => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new (window as any).webkitSpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      
      recognition.onresult = (event: any) => {
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            voiceResponseRef.current = true;
            cancelFallAlert();
            break;
          }
        }
      };
      
      recognition.start();
      setTimeout(() => recognition.stop(), 8000);
    }
  }, []);

  // 3G Impact + Orientation + Stillness Detection
  useEffect(() => {
    if (!isMonitoring) return;

    const handleDeviceMotion = (event: DeviceMotionEvent) => {
      const acc = event.accelerationIncludingGravity;
      const rotation = event.rotationRate;
      
      if (acc && rotation) {
        // 1. 3G Impact Detection (30 m/s²)
        const totalAcceleration = Math.sqrt(
          (acc.x || 0) ** 2 + (acc.y || 0) ** 2 + (acc.z || 0) ** 2
        );
        const impactDetected = totalAcceleration > 30;
        setImpactLevel(totalAcceleration);

        // 2. Orientation Flip Detection
        const orientationFlip = Math.abs(rotation.alpha || 0) > 200 || 
                              Math.abs(rotation.beta || 0) > 200 || 
                              Math.abs(rotation.gamma || 0) > 200;
        setOrientationChange(Math.max(
          Math.abs(rotation.alpha || 0),
          Math.abs(rotation.beta || 0),
          Math.abs(rotation.gamma || 0)
        ));

        // Update movement tracking
        if (totalAcceleration > 2) {
          setLastMovement(Date.now());
        }

        // 3. Stillness Window (3 seconds of minimal movement)
        const stillnessDuration = (Date.now() - lastMovement) / 1000;
        setStillnessLevel(stillnessDuration);
        const stillnessDetected = stillnessDuration > 3;

        // FALL DETECTION ALGORITHM
        if (impactDetected && orientationFlip && stillnessDetected && !fallAlert) {
          const fallData: FallData = {
            impact: totalAcceleration,
            orientation: { 
              x: rotation.alpha || 0, 
              y: rotation.beta || 0, 
              z: rotation.gamma || 0 
            },
            stillness: stillnessDuration,
            timestamp: new Date()
          };
          
          triggerFallDetection(fallData);
        }
      }
    };

    window.addEventListener('devicemotion', handleDeviceMotion);
    return () => window.removeEventListener('devicemotion', handleDeviceMotion);
  }, [isMonitoring, fallAlert, lastMovement]);

  // Fall detection trigger
  const triggerFallDetection = useCallback((fallData: FallData) => {
    setFallAlert(true);
    setIsResponseWaiting(true);
    setCountdown(10);
    voiceResponseRef.current = false;
    
    // Immediate actions
    vibrateWatch();
    playVoicePrompt();
    onFallDetected(fallData);
    
    toast({
      title: "🚨 FALL DETECTED",
      description: "Watch vibrating - Voice prompt active",
      variant: "destructive"
    });

    // Start 10-second countdown
    const countdownInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          if (!voiceResponseRef.current) {
            activateEmergencyResponse();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [vibrateWatch, playVoicePrompt, onFallDetected]);

  // Cancel fall alert
  const cancelFallAlert = useCallback(() => {
    setFallAlert(false);
    setIsResponseWaiting(false);
    setCountdown(0);
    voiceResponseRef.current = true;
    
    toast({
      title: "Fall Alert Cancelled",
      description: "User responded - Emergency cancelled",
      variant: "default"
    });
  }, []);

  // Activate full emergency response
  const activateEmergencyResponse = useCallback(() => {
    setIsResponseWaiting(false);
    
    // Sequence: SOS → Camera → SMS
    onSOSActivated();
    
    setTimeout(() => {
      onCameraRecord();
    }, 1000);
    
    setTimeout(() => {
      onSMSAlert();
    }, 2000);
    
    toast({
      title: "🚨 EMERGENCY ACTIVATED",
      description: "No response - Full emergency protocol initiated",
      variant: "destructive"
    });
  }, [onSOSActivated, onCameraRecord, onSMSAlert]);

  // Simulate fall for testing
  const simulateFall = useCallback(() => {
    const mockFallData: FallData = {
      impact: 35.2,
      orientation: { x: 180, y: -90, z: 45 },
      stillness: 4.1,
      timestamp: new Date()
    };
    triggerFallDetection(mockFallData);
  }, [triggerFallDetection]);

  return (
    <Card className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={cn(
            "p-2 rounded-lg",
            isMonitoring ? "bg-primary/20" : "bg-muted"
          )}>
            <Shield className={cn(
              "w-6 h-6",
              isMonitoring ? "text-primary" : "text-muted-foreground"
            )} />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Advanced Fall Detection</h3>
            <p className="text-sm text-muted-foreground">
              3G Impact • Orientation • Stillness Window
            </p>
          </div>
        </div>
        
        <Button
          onClick={() => setIsMonitoring(!isMonitoring)}
          variant={isMonitoring ? "default" : "outline"}
          className="flex items-center gap-2"
        >
          <Watch className="w-4 h-4" />
          {isMonitoring ? "Active" : "Start"}
        </Button>
      </div>

      {/* Fall Alert Panel */}
      {fallAlert && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive animate-pulse" />
              <span className="font-semibold text-destructive">FALL DETECTED</span>
            </div>
            <Badge variant="destructive" className="text-lg px-3 py-1">
              {countdown}s
            </Badge>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Watch className="w-4 h-4" />
              <span>Watch vibrating...</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Mic className="w-4 h-4" />
              <span>"Are you okay?" - Voice detection active</span>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button 
              onClick={cancelFallAlert}
              variant="outline" 
              size="sm"
              className="flex-1"
            >
              I'm OK - Cancel
            </Button>
            <Button 
              onClick={activateEmergencyResponse}
              variant="destructive" 
              size="sm"
              className="flex-1"
            >
              Emergency Help
            </Button>
          </div>
        </div>
      )}

      {/* Sensor Monitoring */}
      {isMonitoring && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Impact Level</span>
              <span className="font-mono">{impactLevel.toFixed(1)} m/s²</span>
            </div>
            <Progress 
              value={Math.min((impactLevel / 40) * 100, 100)} 
              className="h-2"
            />
            <Badge 
              variant={impactLevel > 30 ? "destructive" : impactLevel > 15 ? "secondary" : "outline"}
              className="text-xs"
            >
              {impactLevel > 30 ? "HIGH IMPACT" : impactLevel > 15 ? "Medium" : "Normal"}
            </Badge>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Orientation Change</span>
              <span className="font-mono">{orientationChange.toFixed(0)}°/s</span>
            </div>
            <Progress 
              value={Math.min((orientationChange / 300) * 100, 100)} 
              className="h-2"
            />
            <Badge 
              variant={orientationChange > 200 ? "destructive" : orientationChange > 100 ? "secondary" : "outline"}
              className="text-xs"
            >
              {orientationChange > 200 ? "FLIP DETECTED" : orientationChange > 100 ? "Rotating" : "Stable"}
            </Badge>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Stillness</span>
              <span className="font-mono">{stillnessLevel.toFixed(1)}s</span>
            </div>
            <Progress 
              value={Math.min((stillnessLevel / 10) * 100, 100)} 
              className="h-2"
            />
            <Badge 
              variant={stillnessLevel > 3 ? "destructive" : stillnessLevel > 1 ? "secondary" : "outline"}
              className="text-xs"
            >
              {stillnessLevel > 3 ? "NO MOVEMENT" : stillnessLevel > 1 ? "Minimal" : "Active"}
            </Badge>
          </div>
        </div>
      )}

      {/* Emergency Response Preview */}
      {isResponseWaiting && (
        <div className="bg-muted/50 rounded-lg p-4 space-y-3">
          <h4 className="font-semibold flex items-center gap-2">
            <Phone className="w-4 h-4" />
            Emergency Response Protocol
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 opacity-75">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              <span>SOS Alert → Incident Pack Generated</span>
            </div>
            <div className="flex items-center gap-2 opacity-75">
              <Camera className="w-4 h-4" />
              <span>Witness Camera → 10s Pre-buffer Recording</span>
            </div>
            <div className="flex items-center gap-2 opacity-75">
              <Phone className="w-4 h-4" />
              <span>Family SMS → Location + QR Code</span>
            </div>
          </div>
        </div>
      )}

      {/* Testing Controls */}
      <div className="flex gap-2 pt-4 border-t">
        <Button
          onClick={simulateFall}
          variant="outline"
          size="sm"
          disabled={fallAlert}
          className="flex items-center gap-2"
        >
          <AlertTriangle className="w-4 h-4" />
          Simulate Fall
        </Button>
        <Badge variant="outline" className="flex items-center gap-2">
          <div className={cn(
            "w-2 h-2 rounded-full",
            isMonitoring ? "bg-green-500 animate-pulse" : "bg-gray-400"
          )} />
          {isMonitoring ? "Monitoring Active" : "Standby"}
        </Badge>
      </div>
    </Card>
  );
};