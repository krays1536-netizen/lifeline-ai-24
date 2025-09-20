import React, { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Heart, 
  Camera, 
  Flashlight, 
  Hand, 
  CheckCircle, 
  AlertCircle, 
  Activity,
  RotateCcw,
  Play,
  Square,
  Info
} from 'lucide-react';
import { HowItWorksModal } from './HowItWorksModal';
import { MonitoringGuidance } from './MonitoringGuidance';

interface HeartRateData {
  bpm: number;
  confidence: number;
  timestamp: number;
}

interface EnhancedHeartRateScannerProps {
  onComplete?: (data: { heartRate: number; confidence: number; ppgData: number[] }) => void;
}

export const EnhancedHeartRateScanner: React.FC<EnhancedHeartRateScannerProps> = ({ onComplete }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<'idle' | 'preparing' | 'scanning' | 'complete' | 'error'>('idle');
  const [readings, setReadings] = useState<HeartRateData[]>([]);
  const [currentBPM, setCurrentBPM] = useState(0);
  const [ppgSignal, setPpgSignal] = useState<number[]>([]);
  const [fingerDetected, setFingerDetected] = useState(false);
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  const [showGuidance, setShowGuidance] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const SCAN_DURATION = 120; // 2 minutes in seconds
  const MIN_READINGS = 10; // Minimum readings for stable result

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 640 },
          height: { ideal: 480 }
        }
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        // Enable flashlight
        const track = stream.getVideoTracks()[0];
        // Try to enable flashlight (may not work on all devices)
        try {
          await track.applyConstraints({
            advanced: [{ flashMode: 'torch' } as any]
          });
        } catch (e) {
          console.log('Flash not available');
        }
      }
    } catch (error) {
      console.error('Camera access failed:', error);
      setPhase('error');
    }
  };

  const analyzeFrame = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    if (!ctx || video.videoWidth === 0) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // Calculate average red channel intensity
    let totalRed = 0;
    let pixelCount = 0;

    for (let i = 0; i < data.length; i += 4) {
      totalRed += data[i]; // Red channel
      pixelCount++;
    }

    const avgRed = totalRed / pixelCount;
    
    // Detect finger presence (high red intensity indicates finger coverage)
    const fingerThreshold = 120;
    setFingerDetected(avgRed > fingerThreshold);

    if (avgRed > fingerThreshold) {
      // Add to PPG signal
      setPpgSignal(prev => {
        const newSignal = [...prev, avgRed].slice(-300); // Keep last 300 samples
        
        // Calculate heart rate from signal peaks
        if (newSignal.length > 60) {
          const peaks = findPeaks(newSignal);
          if (peaks.length > 3) {
            const avgPeakInterval = peaks.reduce((sum, peak, i) => {
              if (i === 0) return sum;
              return sum + (peak - peaks[i - 1]);
            }, 0) / (peaks.length - 1);
            
            const bpm = Math.round(60 / (avgPeakInterval / 10)); // Assuming 10 FPS
            
            if (bpm >= 50 && bpm <= 200) {
              setCurrentBPM(bpm);
              setReadings(prev => [...prev, {
                bpm,
                confidence: Math.min(95, 60 + (peaks.length * 5)),
                timestamp: Date.now()
              }]);
            }
          }
        }
        
        return newSignal;
      });
    }
  };

  const findPeaks = (signal: number[]) => {
    const peaks: number[] = [];
    const threshold = Math.max(...signal) * 0.7;
    
    for (let i = 1; i < signal.length - 1; i++) {
      if (signal[i] > signal[i - 1] && 
          signal[i] > signal[i + 1] && 
          signal[i] > threshold) {
        peaks.push(i);
      }
    }
    
    return peaks;
  };

  const startScan = async () => {
    setIsScanning(true);
    setPhase('preparing');
    setProgress(0);
    setReadings([]);
    setPpgSignal([]);
    setCurrentBPM(0);

    await startCamera();
    
    setTimeout(() => {
      if (streamRef.current) {
        setPhase('scanning');
        
        // Start frame analysis
        const analysisInterval = setInterval(analyzeFrame, 100); // 10 FPS
        
        // Progress tracking
        const progressInterval = setInterval(() => {
          setProgress(prev => {
            const newProgress = prev + (100 / SCAN_DURATION);
            if (newProgress >= 100) {
              clearInterval(progressInterval);
              clearInterval(analysisInterval);
              completeScan();
              return 100;
            }
            return newProgress;
          });
        }, 1000);
      }
    }, 2000);
  };

  const completeScan = () => {
    if (readings.length < MIN_READINGS) {
      setPhase('error');
      return;
    }

    // Calculate final stable heart rate
    const recentReadings = readings.slice(-MIN_READINGS);
    const avgBPM = Math.round(recentReadings.reduce((sum, r) => sum + r.bpm, 0) / recentReadings.length);
    const avgConfidence = Math.round(recentReadings.reduce((sum, r) => sum + r.confidence, 0) / recentReadings.length);

    setCurrentBPM(avgBPM);
    setPhase('complete');
    setIsScanning(false);

    // Stop camera
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    onComplete?.({
      heartRate: avgBPM,
      confidence: avgConfidence,
      ppgData: ppgSignal
    });
  };

  const resetScan = () => {
    setPhase('idle');
    setProgress(0);
    setReadings([]);
    setPpgSignal([]);
    setCurrentBPM(0);
    setIsScanning(false);
    setFingerDetected(false);

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const getPhaseMessage = () => {
    switch (phase) {
      case 'preparing':
        return 'Initializing camera and flashlight...';
      case 'scanning':
        return fingerDetected 
          ? 'Keep finger steady on camera lens' 
          : 'Place finger over camera lens and flash';
      case 'complete':
        return 'Scan completed successfully!';
      case 'error':
        return 'Scan failed. Please try again.';
      default:
        return 'Ready to start 2-minute heart rate scan';
    }
  };

  const renderPPGWaveform = () => {
    if (ppgSignal.length < 2) return null;

    const width = 300;
    const height = 80;
    const points = ppgSignal.slice(-150); // Show last 150 points
    const maxVal = Math.max(...points);
    const minVal = Math.min(...points);
    const range = maxVal - minVal || 1;

    const pathData = points.map((value, index) => {
      const x = (index / (points.length - 1)) * width;
      const y = height - ((value - minVal) / range) * height;
      return index === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
    }).join(' ');

    return (
      <div className="mt-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-muted-foreground">PPG Signal</span>
          <Badge variant="outline" className="text-xs">
            Live
          </Badge>
        </div>
        <div className="bg-black/20 rounded-lg p-3">
          <svg width={width} height={height} className="w-full h-16">
            <defs>
              <linearGradient id="ppgGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.1" />
                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="1" />
              </linearGradient>
            </defs>
            <path
              d={pathData}
              stroke="hsl(var(--primary))"
              strokeWidth="2"
              fill="none"
              className="animate-pulse"
            />
          </svg>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Scanner Header */}
      <Card className="p-6 border-border/50 bg-card/50 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-full bg-red-500/10">
              <Heart className="w-6 h-6 text-red-500" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">PPG Heart Rate Scanner</h3>
              <p className="text-sm text-muted-foreground">
                2-minute continuous monitoring for accurate results
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowHowItWorks(true)}
              className="flex items-center space-x-1"
            >
              <Info className="w-4 h-4" />
              <span className="text-xs">How it Works</span>
            </Button>
          </div>
          
          {currentBPM > 0 && (
            <div className="text-right">
              <div className="text-3xl font-bold text-red-500">
                {currentBPM}
              </div>
              <div className="text-sm text-muted-foreground">BPM</div>
            </div>
          )}
        </div>

        {/* Status Message */}
        <div className="flex items-center space-x-2 mb-4">
          {phase === 'scanning' && fingerDetected && (
            <CheckCircle className="w-4 h-4 text-green-500" />
          )}
          {phase === 'scanning' && !fingerDetected && (
            <AlertCircle className="w-4 h-4 text-yellow-500" />
          )}
          {phase === 'error' && (
            <AlertCircle className="w-4 h-4 text-red-500" />
          )}
          <span className="text-sm">{getPhaseMessage()}</span>
        </div>

        {/* Progress Bar */}
        {(phase === 'preparing' || phase === 'scanning') && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Scanning Progress</span>
              <span>{Math.round(progress)}% ({Math.round((progress / 100) * SCAN_DURATION)}s / {SCAN_DURATION}s)</span>
            </div>
            <Progress value={progress} className="h-2" />
            <div className="flex items-center justify-center space-x-2 text-xs text-muted-foreground">
              <Activity className="w-3 h-3" />
              <span>{readings.length} readings captured</span>
            </div>
          </div>
        )}
      </Card>

      {/* Camera View */}
      {(phase === 'preparing' || phase === 'scanning') && (
        <Card className="p-6 border-border/50 bg-card/50 backdrop-blur-sm">
          <div className="text-center space-y-4">
            <h4 className="font-medium">Camera View</h4>
            
            <div className="relative mx-auto w-64 h-48 bg-black rounded-lg overflow-hidden border-2 border-primary/20">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              
              {/* Finger Guide Overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-24 h-32 border-2 border-red-500/50 rounded-xl flex items-center justify-center bg-red-500/10">
                  <Hand className="w-8 h-8 text-red-500/70" />
                </div>
              </div>
              
              {/* Flash Indicator */}
              <div className="absolute top-2 right-2">
                <div className={`flex items-center space-x-1 px-2 py-1 rounded text-xs ${
                  fingerDetected ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                }`}>
                  <Flashlight className="w-3 h-3" />
                  <span>Flash</span>
                </div>
              </div>

              {/* Finger Detection Status */}
              <div className="absolute bottom-2 left-2">
                <div className={`flex items-center space-x-1 px-2 py-1 rounded text-xs ${
                  fingerDetected ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                }`}>
                  <div className={`w-2 h-2 rounded-full ${fingerDetected ? 'bg-green-400' : 'bg-red-400'} ${fingerDetected ? 'animate-pulse' : ''}`} />
                  <span>{fingerDetected ? 'Finger Detected' : 'No Finger'}</span>
                </div>
              </div>
            </div>

            <canvas ref={canvasRef} className="hidden" />

            {/* Instructions */}
            <div className="max-w-md mx-auto text-sm text-muted-foreground space-y-2">
              <div className="flex items-center space-x-2">
                <Camera className="w-4 h-4" />
                <span>Place your finger completely over the back camera lens</span>
              </div>
              <div className="flex items-center space-x-2">
                <Flashlight className="w-4 h-4" />
                <span>Ensure the flash is covered by your fingertip</span>
              </div>
              <div className="flex items-center space-x-2">
                <Hand className="w-4 h-4" />
                <span>Keep your finger steady for the full 2 minutes</span>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* PPG Waveform */}
      {phase === 'scanning' && fingerDetected && (
        <Card className="p-4 border-border/50 bg-card/50 backdrop-blur-sm">
          {renderPPGWaveform()}
        </Card>
      )}

      {/* Results */}
      {phase === 'complete' && readings.length > 0 && (
        <Card className="p-6 border-border/50 bg-card/50 backdrop-blur-sm">
          <div className="text-center space-y-4">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />
            <h3 className="text-xl font-semibold">Scan Complete</h3>
            
            <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
              <div className="p-4 bg-background/30 rounded-lg">
                <div className="text-2xl font-bold text-red-500">{currentBPM}</div>
                <div className="text-sm text-muted-foreground">Heart Rate (BPM)</div>
              </div>
              <div className="p-4 bg-background/30 rounded-lg">
                <div className="text-2xl font-bold text-green-500">
                  {Math.round(readings.slice(-MIN_READINGS).reduce((sum, r) => sum + r.confidence, 0) / MIN_READINGS)}%
                </div>
                <div className="text-sm text-muted-foreground">Confidence</div>
              </div>
            </div>

            <div className="text-sm text-muted-foreground">
              Based on {readings.length} readings over {Math.round(progress / 100 * SCAN_DURATION)} seconds
            </div>
          </div>
        </Card>
      )}

      {/* Monitoring Guidance */}
      <MonitoringGuidance isVisible={showGuidance} />

      {/* Controls */}
      <Card className="p-4 border-border/50 bg-card/50 backdrop-blur-sm">
        <div className="flex justify-center space-x-3">
          {phase === 'idle' && (
            <>
              <Button 
                variant="outline" 
                onClick={() => setShowGuidance(!showGuidance)}
                className="flex items-center space-x-2"
              >
                <Info className="w-4 h-4" />
                <span>{showGuidance ? 'Hide' : 'Show'} Tips</span>
              </Button>
              <Button onClick={startScan} size="lg" className="flex items-center space-x-2">
                <Play className="w-4 h-4" />
                <span>Start 2-Minute Scan</span>
              </Button>
            </>
          )}
          
          {(phase === 'preparing' || phase === 'scanning') && (
            <Button variant="outline" onClick={resetScan} size="lg">
              <Square className="w-4 h-4 mr-2" />
              Stop Scan
            </Button>
          )}
          
          {(phase === 'complete' || phase === 'error') && (
            <Button onClick={resetScan} variant="outline" size="lg">
              <RotateCcw className="w-4 h-4 mr-2" />
              Scan Again
            </Button>
          )}
        </div>
      </Card>

      {/* How It Works Modal */}
      <HowItWorksModal 
        isOpen={showHowItWorks} 
        onClose={() => setShowHowItWorks(false)} 
      />
    </div>
  );
};