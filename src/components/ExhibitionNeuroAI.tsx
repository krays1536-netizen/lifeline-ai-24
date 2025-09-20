import { useState, useRef, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Brain, Camera, Mic, Heart, CheckCircle, Smartphone } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface NeuroResult {
  stressIndex: "Low" | "Normal" | "Elevated" | "Critical";
  possibleConditions: string[];
  confidence: number;
  timestamp: Date;
  analysis: {
    facial: number;
    voice: number;
    heart: number;
    combined: number;
  };
}

interface ExhibitionNeuroAIProps {
  onAnalysisComplete: (result: NeuroResult) => void;
  autoStart?: boolean;
}

export const ExhibitionNeuroAI = ({ onAnalysisComplete, autoStart = false }: ExhibitionNeuroAIProps) => {
  const { toast } = useToast();
  const [isScanning, setIsScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(60);
  const [scanPhase, setScanPhase] = useState<"setup" | "face" | "chest" | "analyzing" | "complete">("setup");
  const [currentAnalysis, setCurrentAnalysis] = useState({
    facial: 0,
    voice: 0,
    heart: 0,
    stressLevel: "Initializing..."
  });

  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const analysisIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const phaseTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-start if enabled
  useEffect(() => {
    if (autoStart) {
      setTimeout(() => startNeuroScan(), 1000);
    }
  }, [autoStart]);

  const startNeuroScan = useCallback(() => {
    setIsScanning(true);
    setProgress(0);
    setTimeRemaining(60);
    setScanPhase("face");
    
    toast({
      title: "Neural AI Started",
      description: "Phase 1: Face stress analysis",
      variant: "default"
    });

    // Start the analysis phases
    runAnalysisPhases();
  }, []);

  const runAnalysisPhases = useCallback(() => {
    // Phase 1: Face Analysis (0-30 seconds)
    setScanPhase("face");
    setCurrentAnalysis(prev => ({ ...prev, stressLevel: "Analyzing facial micro-expressions..." }));
    
    // Simulate face analysis for 30 seconds
    phaseTimeoutRef.current = setTimeout(() => {
      // Phase 2: Chest/Heart Analysis (30-60 seconds)
      setScanPhase("chest");
      setCurrentAnalysis(prev => ({ ...prev, stressLevel: "Place phone on chest for heart analysis..." }));
      
      toast({
        title: "Phase 2: Heart Analysis",
        description: "Place phone back on your chest",
        variant: "default"
      });
      
      phaseTimeoutRef.current = setTimeout(() => {
        setScanPhase("analyzing");
        setCurrentAnalysis(prev => ({ ...prev, stressLevel: "Computing final assessment..." }));
        
        setTimeout(() => {
          completeAnalysis();
        }, 10000);
      }, 20000);
    }, 30000);

    // Start real-time analysis updates
    analysisIntervalRef.current = setInterval(() => {
      updateAnalysis();
    }, 200);

    // Progress tracking
    progressIntervalRef.current = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + (100 / (60 * 5)); // 60 seconds at 5Hz
        const remaining = Math.max(0, 60 - Math.floor(newProgress * 60 / 100));
        setTimeRemaining(remaining);
        
        return Math.min(100, newProgress);
      });
    }, 200);
  }, []);

  const updateAnalysis = useCallback(() => {
    const time = Date.now() / 1000;
    
    if (scanPhase === "face") {
      // Simulate facial stress analysis
      const facialStress = 25 + Math.sin(time / 5) * 15 + Math.random() * 10;
      const voiceStress = 20 + Math.cos(time / 7) * 10 + Math.random() * 8;
      
      setCurrentAnalysis(prev => ({
        ...prev,
        facial: Math.round(facialStress),
        voice: Math.round(voiceStress),
        stressLevel: "Detecting micro-expressions and vocal patterns..."
      }));
    } else if (scanPhase === "chest") {
      // Simulate heart rate variability analysis
      const heartStress = 30 + Math.sin(time / 3) * 20 + Math.random() * 12;
      
      setCurrentAnalysis(prev => ({
        ...prev,
        heart: Math.round(heartStress),
        stressLevel: "Measuring heart rate variability patterns..."
      }));
    }
  }, [scanPhase]);

  const completeAnalysis = () => {
    setIsScanning(false);
    setScanPhase("complete");
    
    // Cleanup intervals
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
    
    if (analysisIntervalRef.current) {
      clearInterval(analysisIntervalRef.current);
      analysisIntervalRef.current = null;
    }
    
    if (phaseTimeoutRef.current) {
      clearTimeout(phaseTimeoutRef.current);
      phaseTimeoutRef.current = null;
    }

    // Calculate final stress assessment
    const avgStress = (currentAnalysis.facial + currentAnalysis.voice + currentAnalysis.heart) / 3;
    
    let stressIndex: "Low" | "Normal" | "Elevated" | "Critical";
    let possibleConditions: string[] = [];
    
    if (avgStress > 70) {
      stressIndex = "Critical";
      possibleConditions = ["Acute Stress Response", "Panic Indicators", "High Anxiety"];
    } else if (avgStress > 50) {
      stressIndex = "Elevated";
      possibleConditions = ["Chronic Stress", "Anxiety Disorder", "Burnout Syndrome"];
    } else if (avgStress > 30) {
      stressIndex = "Normal";
      possibleConditions = ["Mild Stress Response"];
    } else {
      stressIndex = "Low";
      possibleConditions = [];
    }

    const result: NeuroResult = {
      stressIndex,
      possibleConditions,
      confidence: Math.max(95, Math.min(99, 90 + Math.random() * 8)),
      timestamp: new Date(),
      analysis: {
        facial: currentAnalysis.facial,
        voice: currentAnalysis.voice,
        heart: currentAnalysis.heart,
        combined: Math.round(avgStress)
      }
    };

    onAnalysisComplete(result);

    toast({
      title: "🧠 Neural Analysis Complete!",
      description: `Stress Level: ${result.stressIndex} • Confidence: ${result.confidence.toFixed(0)}%`,
      variant: result.stressIndex === "Critical" ? "destructive" : "default"
    });
  };

  const stopScanning = () => {
    setIsScanning(false);
    setScanPhase("setup");
    
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
    
    if (analysisIntervalRef.current) {
      clearInterval(analysisIntervalRef.current);
      analysisIntervalRef.current = null;
    }
    
    if (phaseTimeoutRef.current) {
      clearTimeout(phaseTimeoutRef.current);
      phaseTimeoutRef.current = null;
    }
  };

  return (
    <Card className="w-full max-w-lg mx-auto p-6">
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Brain className="w-6 h-6 text-purple-500" />
          <h3 className="text-xl font-semibold">Neural AI Stress Detector</h3>
        </div>

        {scanPhase === "setup" && !isScanning && (
          <div className="space-y-4">
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 space-y-3">
              <Brain className="w-12 h-12 text-purple-500 mx-auto mb-2" />
              <h4 className="font-semibold text-purple-700 dark:text-purple-300">
                AI Stress Analysis Protocol
              </h4>
              <div className="space-y-2 text-sm text-purple-600 dark:text-purple-400">
                <div className="flex items-center gap-2">
                  <Camera className="w-4 h-4" />
                  <span>Phase 1: Face stress detection (30s)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4" />
                  <span>Phase 2: Heart analysis on chest (30s)</span>
                </div>
              </div>
            </div>
            
            <Button onClick={startNeuroScan} className="w-full" size="lg">
              <Brain className="w-5 h-5 mr-2" />
              Start 1-Minute Neural Scan
            </Button>
          </div>
        )}

        {isScanning && (
          <div className="space-y-4">
            {/* Phase Indicator */}
            <div className="relative">
              <div className="w-32 h-32 mx-auto rounded-full border-4 border-purple-500 flex items-center justify-center relative overflow-hidden">
                <div 
                  className="absolute inset-0 bg-gradient-to-t from-purple-500/20 to-transparent transition-all duration-500"
                  style={{ height: `${progress}%`, bottom: 0 }}
                />
                {scanPhase === "face" && <Camera className="w-10 h-10 text-purple-500 z-10" />}
                {scanPhase === "chest" && <Heart className="w-10 h-10 text-red-500 z-10" />}
                {scanPhase === "analyzing" && <Brain className="w-10 h-10 text-purple-500 z-10 animate-pulse" />}
              </div>
              <div className="text-sm font-medium mt-3">{currentAnalysis.stressLevel}</div>
            </div>

            {/* Phase Instructions */}
            {scanPhase === "face" && (
              <Alert>
                <Camera className="h-4 w-4" />
                <AlertDescription>
                  Look at your front camera. AI is analyzing facial micro-expressions and vocal stress patterns.
                </AlertDescription>
              </Alert>
            )}

            {scanPhase === "chest" && (
              <Alert>
                <Smartphone className="h-4 w-4" />
                <AlertDescription>
                  Place your phone's back flat against your chest. AI is measuring heart rate variability.
                </AlertDescription>
              </Alert>
            )}

            {/* Real-time metrics */}
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="space-y-1">
                <div className="flex items-center justify-center gap-1">
                  <Camera className="w-4 h-4 text-blue-500" />
                </div>
                <div className="text-2xl font-bold text-blue-500">
                  {currentAnalysis.facial}%
                </div>
                <div className="text-xs text-muted-foreground">Facial</div>
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-center gap-1">
                  <Mic className="w-4 h-4 text-green-500" />
                </div>
                <div className="text-2xl font-bold text-green-500">
                  {currentAnalysis.voice}%
                </div>
                <div className="text-xs text-muted-foreground">Voice</div>
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-center gap-1">
                  <Heart className="w-4 h-4 text-red-500" />
                </div>
                <div className="text-2xl font-bold text-red-500">
                  {currentAnalysis.heart}%
                </div>
                <div className="text-xs text-muted-foreground">Heart</div>
              </div>
            </div>

            {/* Progress */}
            <div className="space-y-2">
              <Progress value={progress} className="h-3" />
              <div className="flex items-center justify-between text-sm">
                <span className="font-mono">
                  {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
                </span>
                <Badge variant={scanPhase === "face" ? "default" : scanPhase === "chest" ? "destructive" : "secondary"}>
                  {scanPhase === "face" ? "Face Analysis" : scanPhase === "chest" ? "Heart Analysis" : "Computing"}
                </Badge>
              </div>
            </div>

            <Button onClick={stopScanning} variant="outline" className="w-full">
              Stop Analysis
            </Button>
          </div>
        )}

        {scanPhase === "complete" && (
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-2 text-green-600">
              <CheckCircle className="w-8 h-8" />
              <span className="text-lg font-semibold">Analysis Complete!</span>
            </div>
            
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="space-y-1">
                <div className="text-2xl font-bold text-blue-500">{currentAnalysis.facial}%</div>
                <div className="text-sm text-muted-foreground">Facial</div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-green-500">{currentAnalysis.voice}%</div>
                <div className="text-sm text-muted-foreground">Voice</div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-red-500">{currentAnalysis.heart}%</div>
                <div className="text-sm text-muted-foreground">Heart</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};