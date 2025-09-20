import { useState, useEffect, useRef, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Brain, Camera, Mic, Activity, AlertTriangle, Eye, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface ProductionNeuroAIProps {
  onStressDetected: (level: "calm" | "alert" | "stressed" | "fearful" | "critical") => void;
  onConditionDetected: (condition: string, confidence: number) => void;
}

interface StressReading {
  level: "calm" | "alert" | "stressed" | "fearful" | "critical";
  confidence: number;
  factors: string[];
  timestamp: Date;
  moodTag: string;
  voiceStress: number;
  facialStress: number;
  physiological: number;
}

interface VoiceAnalysis {
  tone: "calm" | "anxious" | "distressed" | "panicked";
  clarity: number;
  stress: number;
  confidence: number;
  pitch: number;
  volume: number;
}

export const ProductionNeuroAI = ({ onStressDetected, onConditionDetected }: ProductionNeuroAIProps) => {
  const { toast } = useToast();
  const [isScanning, setIsScanning] = useState(false);
  const [stressReading, setStressReading] = useState<StressReading | null>(null);
  const [voiceAnalysis, setVoiceAnalysis] = useState<VoiceAnalysis | null>(null);
  const [detectedConditions, setDetectedConditions] = useState<Array<{condition: string, confidence: number}>>([]);
  const [currentMood, setCurrentMood] = useState<string>("Ready to analyze");
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [hasPermissions, setHasPermissions] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const analysisIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Enhanced condition database
  const conditionDatabase = {
    'panic_attack': { 
      triggers: ['high_stress', 'rapid_breathing', 'facial_pallor', 'voice_tremor'],
      confidence: 85, 
      description: 'Acute anxiety episode detected'
    },
    'anxiety_disorder': { 
      triggers: ['persistent_stress', 'facial_tension', 'voice_anxiety'],
      confidence: 78, 
      description: 'Chronic anxiety indicators present'
    },
    'acute_stress': { 
      triggers: ['elevated_heart_rate', 'facial_flushing', 'voice_strain'],
      confidence: 80, 
      description: 'Immediate stress response detected'
    },
    'fatigue_syndrome': { 
      triggers: ['eye_strain', 'reduced_alertness', 'slowed_speech'],
      confidence: 75, 
      description: 'Signs of physical/mental exhaustion'
    }
  };

  // Check device capabilities
  useEffect(() => {
    const checkCapabilities = async () => {
      try {
        // Test permissions
        const constraints = { video: true, audio: true };
        const testStream = await navigator.mediaDevices.getUserMedia(constraints);
        setHasPermissions(true);
        setErrorMessage(null);
        testStream.getTracks().forEach(track => track.stop());
      } catch (error) {
        setHasPermissions(false);
        setErrorMessage("Camera and microphone access required for neural analysis");
      }
    };
    
    checkCapabilities();
  }, []);

  const startNeuroScan = useCallback(async () => {
    setIsScanning(true);
    setAnalysisProgress(0);
    setErrorMessage(null);
    setCurrentMood("Initializing NeuroAI...");
    
    try {
      if (!hasPermissions) {
        throw new Error("Permissions required");
      }

      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 },
          facingMode: 'user'
        }, 
        audio: {
          echoCancellation: true,
          noiseSuppression: false,
          sampleRate: 44100
        }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        await videoRef.current.play();
      }

      // Setup audio analysis
      audioContextRef.current = new AudioContext({ sampleRate: 44100 });
      const source = audioContextRef.current.createMediaStreamSource(stream);
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 4096;
      analyserRef.current.smoothingTimeConstant = 0.85;
      source.connect(analyserRef.current);

      setCurrentMood("Neural analysis active...");
      
      // Start comprehensive analysis
      analysisIntervalRef.current = setInterval(() => {
        performComprehensiveAnalysis();
        updateAnalysisProgress();
      }, 200);

      // Auto-complete after 60 seconds
      setTimeout(() => {
        if (isScanning) {
          completeAnalysis();
        }
      }, 60000);

    } catch (error) {
      console.error("NeuroAI access denied:", error);
      setCurrentMood("Switching to simulation mode...");
      setErrorMessage("Using simulation mode - grant permissions for real analysis");
      
      // Fallback to simulation
      setTimeout(() => {
        simulateAnalysis();
      }, 1000);
    }
  }, [hasPermissions, isScanning]);

  const stopScanning = useCallback(() => {
    setIsScanning(false);
    setCurrentMood("Analysis stopped");
    
    // Clear interval
    if (analysisIntervalRef.current) {
      clearInterval(analysisIntervalRef.current);
      analysisIntervalRef.current = null;
    }
    
    // Clean up streams
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    // Clean up audio context
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
  }, []);

  const performComprehensiveAnalysis = useCallback(() => {
    if (!canvasRef.current || !videoRef.current || videoRef.current.readyState < 2) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;

    try {
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      
      // Analyze facial features
      const faceAnalysis = analyzeFacialFeatures(imageData);
      const voiceStressData = analyzeVoiceStress();
      
      // Calculate comprehensive stress
      const comprehensiveStress = calculateStress(faceAnalysis, voiceStressData);
      
      // Update states
      setStressReading(comprehensiveStress);
      setVoiceAnalysis(voiceStressData);
      setCurrentMood(comprehensiveStress.moodTag);
      
      // Check for conditions
      checkMedicalConditions(comprehensiveStress, voiceStressData);
      
      // Trigger callbacks
      onStressDetected(comprehensiveStress.level);
      
    } catch (error) {
      console.error("Analysis error:", error);
      setErrorMessage("Analysis error - switching to fallback mode");
    }
  }, [onStressDetected]);

  const analyzeFacialFeatures = (imageData: ImageData) => {
    const pixels = imageData.data;
    const width = imageData.width;
    const height = imageData.height;
    
    // Simple face detection based on skin color
    let skinPixels = 0;
    let totalRed = 0, totalGreen = 0, totalBlue = 0;
    
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 4;
    
    for (let y = centerY - radius; y < centerY + radius; y++) {
      for (let x = centerX - radius; x < centerX + radius; x++) {
        if (x >= 0 && x < width && y >= 0 && y < height) {
          const i = (Math.floor(y) * width + Math.floor(x)) * 4;
          const r = pixels[i];
          const g = pixels[i + 1];
          const b = pixels[i + 2];
          
          if (isSkinColor(r, g, b)) {
            skinPixels++;
            totalRed += r;
            totalGreen += g;
            totalBlue += b;
          }
        }
      }
    }
    
    const faceDetected = skinPixels > (radius * radius * 0.3);
    
    if (!faceDetected) {
      return { faceDetected: false, stressLevel: 0.3 };
    }
    
    // Calculate skin tone metrics
    const avgRed = totalRed / skinPixels;
    const avgGreen = totalGreen / skinPixels;
    const avgBlue = totalBlue / skinPixels;
    
    // Stress indicators from skin color
    const redness = avgRed / (avgGreen + avgBlue + 1);
    const pallor = (avgRed + avgGreen + avgBlue) < 300;
    const flushing = redness > 1.2;
    
    let stressLevel = 0.2; // baseline
    if (flushing) stressLevel += 0.3;
    if (pallor) stressLevel += 0.4;
    
    return {
      faceDetected: true,
      stressLevel: Math.min(1, stressLevel),
      redness,
      pallor,
      flushing,
      skinTone: { avgRed, avgGreen, avgBlue }
    };
  };

  const isSkinColor = (r: number, g: number, b: number): boolean => {
    const total = r + g + b;
    if (total === 0) return false;
    
    const rn = r / total;
    const gn = g / total;
    const bn = b / total;
    
    return (
      rn > 0.36 && rn < 0.50 &&
      gn > 0.28 && gn < 0.42 &&
      bn > 0.005 && bn < 0.35 &&
      r > 85 && g > 35 && b > 15
    );
  };

  const analyzeVoiceStress = (): VoiceAnalysis => {
    if (!analyserRef.current) {
      return {
        tone: "calm",
        clarity: 0.5,
        stress: 0.3,
        confidence: 0.1,
        pitch: 0,
        volume: 0
      };
    }

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    const freqArray = new Uint8Array(bufferLength);
    
    analyserRef.current.getByteTimeDomainData(dataArray);
    analyserRef.current.getByteFrequencyData(freqArray);

    // Calculate metrics
    const volume = dataArray.reduce((sum, val) => sum + Math.abs(val - 128), 0) / bufferLength;
    const pitch = calculatePitch(freqArray);
    const clarity = calculateVoiceClarity(dataArray);
    const stress = Math.min(1, (volume / 50) + (pitch > 200 ? 0.3 : 0));

    let tone: "calm" | "anxious" | "distressed" | "panicked" = "calm";
    if (stress > 0.8) tone = "panicked";
    else if (stress > 0.6) tone = "distressed";
    else if (stress > 0.4) tone = "anxious";

    const confidence = volume > 5 ? Math.min(0.9, volume / 50) : 0.1;

    return {
      tone,
      clarity: Math.round(clarity * 100) / 100,
      stress: Math.round(stress * 100) / 100,
      confidence: Math.round(confidence * 100) / 100,
      pitch: Math.round(pitch),
      volume: Math.round(volume)
    };
  };

  const calculatePitch = (freqData: Uint8Array): number => {
    let maxIndex = 0;
    let maxValue = 0;
    
    for (let i = 10; i < 100; i++) {
      if (freqData[i] > maxValue) {
        maxValue = freqData[i];
        maxIndex = i;
      }
    }
    
    return maxIndex * (44100 / 2) / freqData.length;
  };

  const calculateVoiceClarity = (timeData: Uint8Array): number => {
    const rms = Math.sqrt(timeData.reduce((sum, val) => sum + Math.pow(val - 128, 2), 0) / timeData.length);
    return Math.min(1, rms / 50);
  };

  const calculateStress = (faceAnalysis: any, voiceAnalysis: VoiceAnalysis): StressReading => {
    const factors = [];
    let level: "calm" | "alert" | "stressed" | "fearful" | "critical" = "calm";
    
    const facialStress = faceAnalysis.faceDetected ? faceAnalysis.stressLevel : 0.3;
    const voiceStress = voiceAnalysis.stress;
    
    if (facialStress > 0.7) factors.push("High facial tension detected");
    if (faceAnalysis.flushing) factors.push("Facial flushing (stress response)");
    if (faceAnalysis.pallor) factors.push("Facial pallor (fear/shock)");
    if (voiceStress > 0.6) factors.push(`Voice stress: ${voiceAnalysis.tone}`);
    
    const overallStress = (facialStress * 0.6 + voiceStress * 0.4);
    
    let moodTag = "Calm";
    if (overallStress > 0.8) {
      level = "critical";
      moodTag = faceAnalysis.pallor ? "Fearful" : "Critical Stress";
    } else if (overallStress > 0.6) {
      level = "stressed";
      moodTag = "Stressed";
    } else if (overallStress > 0.4) {
      level = "alert";
      moodTag = "Alert";
    }
    
    if (factors.length === 0) {
      factors.push("Normal physiological patterns");
      moodTag = "Calm";
    }
    
    return {
      level,
      confidence: Math.max(faceAnalysis.faceDetected ? 80 : 30, voiceAnalysis.confidence * 100),
      factors,
      timestamp: new Date(),
      moodTag,
      voiceStress: Math.round(voiceStress * 100),
      facialStress: Math.round(facialStress * 100),
      physiological: Math.round(overallStress * 100)
    };
  };

  const checkMedicalConditions = (stressReading: StressReading, voiceAnalysis: VoiceAnalysis) => {
    const newConditions = [];
    
    // Check each condition in database
    for (const [condition, data] of Object.entries(conditionDatabase)) {
      let score = 0;
      
      if (stressReading.level === "critical" && condition === "panic_attack") score += 30;
      if (stressReading.level === "stressed" && condition === "anxiety_disorder") score += 25;
      if (voiceAnalysis.tone === "panicked" && condition === "panic_attack") score += 20;
      if (stressReading.facialStress > 70 && condition === "acute_stress") score += 25;
      
      if (score >= 20) {
        const confidence = Math.min(95, score + data.confidence - 50);
        newConditions.push({ condition: data.description, confidence });
        onConditionDetected(data.description, confidence);
      }
    }
    
    setDetectedConditions(newConditions);
  };

  const updateAnalysisProgress = () => {
    setAnalysisProgress(prev => Math.min(100, prev + 1));
  };

  const completeAnalysis = () => {
    setIsScanning(false);
    setCurrentMood("Analysis complete");
    setAnalysisProgress(100);
    
    if (analysisIntervalRef.current) {
      clearInterval(analysisIntervalRef.current);
      analysisIntervalRef.current = null;
    }
    
    toast({
      title: "Neural Analysis Complete",
      description: "Stress assessment and condition screening finished",
      variant: "default"
    });
  };

  const simulateAnalysis = useCallback(() => {
    setIsScanning(true);
    setCurrentMood("Simulating neural analysis...");
    setAnalysisProgress(0);
    
    let progress = 0;
    const interval = setInterval(() => {
      progress += 5;
      setAnalysisProgress(progress);
      
      if (progress === 25) setCurrentMood("Analyzing facial patterns...");
      else if (progress === 50) setCurrentMood("Processing voice data...");
      else if (progress === 75) setCurrentMood("Computing stress levels...");
      
      if (progress >= 100) {
        clearInterval(interval);
        
        const simulatedReading: StressReading = {
          level: "alert",
          confidence: 75,
          factors: ["Simulated analysis - Demo mode", "Facial expression analysis", "Voice pattern simulation"],
          timestamp: new Date(),
          moodTag: "Demo Mode - Normal Stress",
          voiceStress: 35,
          facialStress: 40,
          physiological: 30
        };
        
        const simulatedVoice: VoiceAnalysis = {
          tone: "calm",
          clarity: 0.8,
          stress: 0.35,
          confidence: 0.75,
          pitch: 150,
          volume: 25
        };
        
        setStressReading(simulatedReading);
        setVoiceAnalysis(simulatedVoice);
        setCurrentMood("Simulation Complete");
        setIsScanning(false);
        
        onStressDetected("alert");
        
        // Simulate condition detection
        setTimeout(() => {
          const demoConditions = [
            { condition: "Mild stress response detected", confidence: 75 }
          ];
          setDetectedConditions(demoConditions);
          onConditionDetected("Mild stress response detected", 75);
        }, 1000);
      }
    }, 100);
  }, [onStressDetected, onConditionDetected]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopScanning();
    };
  }, [stopScanning]);

  return (
    <Card className="w-full p-6 bg-gradient-to-br from-cyber-purple/10 to-cyber-blue/10">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Brain className="w-6 h-6 text-cyber-purple animate-pulse" />
          <h3 className="text-xl font-semibold bg-[var(--gradient-neural)] bg-clip-text text-transparent">
            Production NeuroAI
          </h3>
        </div>
        <div className="text-sm text-muted-foreground">
          {currentMood}
        </div>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <Alert className="mb-4 border-orange-500 bg-orange-500/10">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      {/* Progress Bar */}
      {isScanning && (
        <div className="mb-6">
          <div className="flex justify-between text-sm mb-2">
            <span>Neural Analysis Progress</span>
            <span>{analysisProgress.toFixed(0)}%</span>
          </div>
          <Progress value={analysisProgress} className="h-3" />
        </div>
      )}

      {/* Video Feed */}
      {isScanning && hasPermissions && (
        <div className="relative mb-6">
          <video 
            ref={videoRef} 
            className="w-full max-w-sm mx-auto rounded-lg"
            playsInline 
            muted 
          />
          <canvas ref={canvasRef} className="hidden" />
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-32 h-32 border-2 border-cyber-purple rounded-full animate-pulse opacity-50" />
          </div>
        </div>
      )}

      {/* Results */}
      {stressReading && (
        <div className="space-y-4 mb-6">
          {/* Stress Overview */}
          <Card className="p-4 bg-background/50">
            <div className="text-center">
              <div className="text-2xl font-bold mb-2">
                {stressReading.moodTag}
              </div>
              <Badge variant={
                stressReading.level === "critical" ? "destructive" : 
                stressReading.level === "stressed" ? "secondary" : "default"
              }>
                {stressReading.level.toUpperCase()} - {stressReading.confidence}% confidence
              </Badge>
            </div>
            
            <div className="grid grid-cols-3 gap-4 mt-4 text-center">
              <div>
                <div className="font-semibold">Face</div>
                <div className="text-xl">{stressReading.facialStress}%</div>
              </div>
              <div>
                <div className="font-semibold">Voice</div>
                <div className="text-xl">{stressReading.voiceStress}%</div>
              </div>
              <div>
                <div className="font-semibold">Overall</div>
                <div className="text-xl">{stressReading.physiological}%</div>
              </div>
            </div>
          </Card>

          {/* Voice Analysis */}
          {voiceAnalysis && (
            <Card className="p-4 bg-background/50">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Mic className="w-4 h-4" />
                Voice Analysis
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Tone:</span>
                  <Badge variant="outline">{voiceAnalysis.tone}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Stress:</span>
                  <div className="flex items-center gap-2">
                    <Progress value={voiceAnalysis.stress * 100} className="h-1 w-16" />
                    <span className="text-xs">{Math.round(voiceAnalysis.stress * 100)}%</span>
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Detected Conditions */}
      {detectedConditions.length > 0 && (
        <Card className="p-4 mb-4 border-2 border-cyber-red/30">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="h-4 w-4 text-cyber-red" />
            <span className="font-medium text-cyber-red">Detected Indicators</span>
          </div>
          <div className="space-y-2">
            {detectedConditions.map((condition, i) => (
              <div key={i} className="flex justify-between items-center p-2 bg-cyber-red/10 rounded">
                <span className="text-sm font-medium">{condition.condition}</span>
                <Badge variant="outline" className="text-cyber-red border-cyber-red/50">
                  {condition.confidence}% confidence
                </Badge>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            ⚠️ AI analysis for informational purposes only. Consult healthcare professionals.
          </p>
        </Card>
      )}

      {/* Controls */}
      <div className="flex gap-3">
        <Button
          onClick={isScanning ? stopScanning : startNeuroScan}
          className={cn(
            "flex-1 transition-all duration-300",
            isScanning 
              ? "bg-gradient-to-r from-red-500 to-red-600 hover:opacity-90" 
              : "bg-gradient-to-r from-cyber-purple to-cyber-blue hover:opacity-90"
          )}
        >
          {isScanning ? (
            <>
              <Zap className="h-4 w-4 mr-2" />
              Stop Analysis
            </>
          ) : (
            <>
              <Brain className="h-4 w-4 mr-2" />
              Start NeuroAI Scan
            </>
          )}
        </Button>
      </div>
    </Card>
  );
};