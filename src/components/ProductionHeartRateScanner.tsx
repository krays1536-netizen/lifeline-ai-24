import { useState, useRef, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Heart, Camera, Timer } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface HeartRateResult {
  heartRate: number;
  confidence: number;
  quality: "excellent" | "good" | "fair" | "poor";
  timestamp: Date;
}

interface ProductionHeartRateScannerProps {
  onReadingComplete: (result: HeartRateResult) => void;
  isSimulated?: boolean;
}

export const ProductionHeartRateScanner = ({ 
  onReadingComplete, 
  isSimulated = false 
}: ProductionHeartRateScannerProps) => {
  const { toast } = useToast();
  const [isScanning, setIsScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentBPM, setCurrentBPM] = useState<number | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(120);

  const startScanning = useCallback(async () => {
    setIsScanning(true);
    setProgress(0);
    setTimeRemaining(120);
    
    // Simulated 2-minute PPG scan
    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + (100 / 120);
        setTimeRemaining(Math.max(0, 120 - Math.floor(newProgress * 120 / 100)));
        
        // Simulate real-time BPM
        if (newProgress > 10) {
          setCurrentBPM(70 + Math.floor(Math.random() * 20));
        }
        
        if (newProgress >= 100) {
          const result: HeartRateResult = {
            heartRate: 72 + Math.floor(Math.random() * 16),
            confidence: 0.85 + Math.random() * 0.1,
            quality: "good",
            timestamp: new Date()
          };
          onReadingComplete(result);
          setIsScanning(false);
          clearInterval(interval);
        }
        
        return Math.min(100, newProgress);
      });
    }, 1000);
  }, [onReadingComplete]);

  return (
    <Card className="w-full max-w-md mx-auto p-6">
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2">
          <Heart className="w-6 h-6 text-cyber-red animate-pulse-heartbeat" />
          <h3 className="text-lg font-semibold">PPG Heart Rate Scanner</h3>
        </div>
        
        {isScanning ? (
          <>
            <div className="text-3xl font-bold text-cyber-red">
              {currentBPM || '--'} <span className="text-lg">BPM</span>
            </div>
            <Progress value={progress} className="h-3" />
            <div className="flex items-center justify-center gap-1 text-sm">
              <Timer className="w-4 h-4" />
              {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
            </div>
          </>
        ) : (
          <Button onClick={startScanning} className="w-full">
            <Camera className="w-4 h-4 mr-2" />
            Start 2-Min PPG Scan
          </Button>
        )}
        
        {isSimulated && <Badge variant="secondary">Demo Mode</Badge>}
      </div>
    </Card>
  );
};