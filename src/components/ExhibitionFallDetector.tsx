import { useState, useEffect, useRef, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Shield, Watch, Camera, Phone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface FallData {
  impact: number;
  orientation: { x: number; y: number; z: number };
  stillness: number;
  timestamp: Date;
}

interface ExhibitionFallDetectorProps {
  onFallDetected: (fallData: FallData) => void;
  onGuardianActivate: () => void;
  onCameraRecord: () => void;
  onSMSAlert: () => void;
}

export const ExhibitionFallDetector = ({ 
  onFallDetected, 
  onGuardianActivate,
  onCameraRecord, 
  onSMSAlert 
}: ExhibitionFallDetectorProps) => {
  const { toast } = useToast();
  
  // Detection states
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [fallAlert, setFallAlert] = useState(false);
  const [distressAlert, setDistressAlert] = useState(false);
  
  // Sensor data
  const [impactLevel, setImpactLevel] = useState(0);
  const [orientationChange, setOrientationChange] = useState(0);
  const [stillnessLevel, setStillnessLevel] = useState(0);
  const [lastMovement, setLastMovement] = useState(Date.now());
  const [audioLevel, setAudioLevel] = useState(0);
  
  // Refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Watch vibration pattern
  const vibrateWatch = useCallback(() => {
    if ('vibrate' in navigator) {
      navigator.vibrate([500, 200, 500, 200, 1000]);
    }
    
    toast({
      title: "⌚ Watch Vibrating",
      description: "Fall detected - Checking user status",
      variant: "default"
    });
  }, []);

  // Initialize monitoring
  useEffect(() => {
    if (isMonitoring) {
      startMonitoring();
    } else {
      stopMonitoring();
    }
    
    return stopMonitoring;
  }, [isMonitoring]);

  const startMonitoring = async () => {
    try {
      // Setup audio monitoring for distress screams
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      audioContextRef.current = new AudioContext();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 2048;
      source.connect(analyserRef.current);
      
      // Start audio analysis
      monitorAudio();
      
      toast({
        title: "🛡️ Monitoring Active",
        description: "Fall detection and distress monitoring enabled",
        variant: "default"
      });
      
    } catch (error) {
      toast({
        title: "Microphone Access Required",
        description: "Audio monitoring disabled - Motion detection only",
        variant: "default"
      });
    }
  };

  const stopMonitoring = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
  };

  const monitorAudio = () => {
    if (!analyserRef.current) return;
    
    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    const checkAudio = () => {
      if (!analyserRef.current || !isMonitoring) return;
      
      analyserRef.current.getByteFrequencyData(dataArray);
      
      // Calculate audio level
      const average = dataArray.reduce((sum, value) => sum + value, 0) / bufferLength;
      setAudioLevel(average);
      
      // Detect sudden loud sounds (distress screams)
      if (average > 120 && !distressAlert && !fallAlert) {
        triggerDistressDetection();
      }
      
      requestAnimationFrame(checkAudio);
    };
    
    checkAudio();
  };

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

        // 3. Stillness Window (3 seconds)
        const stillnessDuration = (Date.now() - lastMovement) / 1000;
        setStillnessLevel(stillnessDuration);

        // FALL DETECTION ALGORITHM
        const impactDetected = totalAcceleration > 30;
        const stillnessDetected = stillnessDuration > 3;
        
        if (impactDetected && orientationFlip && stillnessDetected && !fallAlert && !distressAlert) {
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
  }, [isMonitoring, fallAlert, distressAlert, lastMovement]);

  // Fall detection trigger
  const triggerFallDetection = useCallback((fallData: FallData) => {
    setFallAlert(true);
    onFallDetected(fallData);
    
    // Immediate response sequence
    vibrateWatch();
    
    // Activate Guardian AI
    setTimeout(() => onGuardianActivate(), 1000);
    
    // Start camera recording
    setTimeout(() => onCameraRecord(), 1500);
    
    toast({
      title: "🚨 FALL DETECTED!",
      description: "Guardian AI activating - Watch vibrating",
      variant: "destructive"
    });
  }, [onFallDetected, onGuardianActivate, onCameraRecord, vibrateWatch]);

  // Distress scream detection
  const triggerDistressDetection = useCallback(() => {
    setDistressAlert(true);
    
    toast({
      title: "🔊 DISTRESS DETECTED!",
      description: "Loud sound detected - Activating emergency protocols",
      variant: "destructive"
    });
    
    // Same response as fall
    vibrateWatch();
    setTimeout(() => onGuardianActivate(), 500);
    setTimeout(() => onCameraRecord(), 1000);
    
    // Auto-clear distress after 10 seconds
    setTimeout(() => setDistressAlert(false), 10000);
  }, [onGuardianActivate, onCameraRecord, vibrateWatch]);

  // Clear alerts
  const clearAlerts = () => {
    setFallAlert(false);
    setDistressAlert(false);
  };

  // Test functions
  const simulateFall = () => {
    const mockFallData: FallData = {
      impact: 35.2,
      orientation: { x: 180, y: -90, z: 45 },
      stillness: 4.1,
      timestamp: new Date()
    };
    triggerFallDetection(mockFallData);
  };

  const simulateDistress = () => {
    triggerDistressDetection();
  };

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
            <h3 className="text-lg font-semibold">Exhibition Fall Detector</h3>
            <p className="text-sm text-muted-foreground">
              3G Impact • Orientation • Stillness • Distress Audio
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

      {/* Alert Panels */}
      {(fallAlert || distressAlert) && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive animate-pulse" />
              <span className="font-semibold text-destructive">
                {fallAlert ? "FALL DETECTED" : "DISTRESS DETECTED"}
              </span>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Watch className="w-4 h-4" />
              <span>Watch vibrating...</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Shield className="w-4 h-4" />
              <span>Guardian AI activated</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Camera className="w-4 h-4" />
              <span>Witness camera recording</span>
            </div>
          </div>
          
          <Button 
            onClick={clearAlerts}
            variant="outline" 
            size="sm"
            className="w-full"
          >
            Clear Alert
          </Button>
        </div>
      )}

      {/* Sensor Monitoring */}
      {isMonitoring && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
              className="text-xs w-full justify-center"
            >
              {impactLevel > 30 ? "HIGH IMPACT" : impactLevel > 15 ? "Medium" : "Normal"}
            </Badge>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Orientation</span>
              <span className="font-mono">{orientationChange.toFixed(0)}°/s</span>
            </div>
            <Progress 
              value={Math.min((orientationChange / 300) * 100, 100)} 
              className="h-2"
            />
            <Badge 
              variant={orientationChange > 200 ? "destructive" : orientationChange > 100 ? "secondary" : "outline"}
              className="text-xs w-full justify-center"
            >
              {orientationChange > 200 ? "FLIP" : orientationChange > 100 ? "Rotating" : "Stable"}
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
              className="text-xs w-full justify-center"
            >
              {stillnessLevel > 3 ? "NO MOVEMENT" : stillnessLevel > 1 ? "Minimal" : "Active"}
            </Badge>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Audio Level</span>
              <span className="font-mono">{audioLevel.toFixed(0)} dB</span>
            </div>
            <Progress 
              value={Math.min((audioLevel / 150) * 100, 100)} 
              className="h-2"
            />
            <Badge 
              variant={audioLevel > 120 ? "destructive" : audioLevel > 80 ? "secondary" : "outline"}
              className="text-xs w-full justify-center"
            >
              {audioLevel > 120 ? "LOUD SOUND" : audioLevel > 80 ? "Noise" : "Quiet"}
            </Badge>
          </div>
        </div>
      )}

      {/* Testing Controls */}
      <div className="flex gap-2 pt-4 border-t">
        <Button
          onClick={simulateFall}
          variant="outline"
          size="sm"
          disabled={fallAlert || distressAlert}
          className="flex items-center gap-2"
        >
          <AlertTriangle className="w-4 h-4" />
          Test Fall
        </Button>
        <Button
          onClick={simulateDistress}
          variant="outline"
          size="sm"
          disabled={fallAlert || distressAlert}
          className="flex items-center gap-2"
        >
          <Camera className="w-4 h-4" />
          Test Scream
        </Button>
        <Badge variant="outline" className="flex items-center gap-2 ml-auto">
          <div className={cn(
            "w-2 h-2 rounded-full",
            isMonitoring ? "bg-green-500 animate-pulse" : "bg-gray-400"
          )} />
          {isMonitoring ? "Monitoring" : "Standby"}
        </Badge>
      </div>
    </Card>
  );
};