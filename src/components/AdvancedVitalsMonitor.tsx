import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Heart, 
  Activity, 
  Thermometer, 
  Droplets, 
  Brain, 
  Zap,
  Radar,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Timer,
  Waves
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface VitalReading {
  value: number;
  timestamp: Date;
  status: 'normal' | 'warning' | 'critical';
  confidence: number;
}

interface AdvancedVitalsData {
  heartRate: VitalReading;
  spO2: VitalReading;
  temperature: VitalReading;
  heartRateVariability: VitalReading;
  stressLevel: VitalReading;
  bloodPressure: {
    systolic: number;
    diastolic: number;
    timestamp: Date;
    status: 'normal' | 'warning' | 'critical';
  };
}

interface AdvancedVitalsMonitorProps {
  onVitalAlert?: (vital: string, status: 'warning' | 'critical') => void;
  onEmergencyDetected?: () => void;
  isLive?: boolean;
}

export const AdvancedVitalsMonitor = ({ 
  onVitalAlert, 
  onEmergencyDetected,
  isLive = false 
}: AdvancedVitalsMonitorProps) => {
  const { toast } = useToast();
  const [vitalsData, setVitalsData] = useState<AdvancedVitalsData>({
    heartRate: { value: 72, timestamp: new Date(), status: 'normal', confidence: 0.95 },
    spO2: { value: 98, timestamp: new Date(), status: 'normal', confidence: 0.92 },
    temperature: { value: 98.6, timestamp: new Date(), status: 'normal', confidence: 0.88 },
    heartRateVariability: { value: 45, timestamp: new Date(), status: 'normal', confidence: 0.87 },
    stressLevel: { value: 25, timestamp: new Date(), status: 'normal', confidence: 0.91 },
    bloodPressure: { 
      systolic: 120, 
      diastolic: 80, 
      timestamp: new Date(), 
      status: 'normal' 
    }
  });

  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [activeAnalysis, setActiveAnalysis] = useState<string | null>(null);

  // Advanced vital analysis with AI-like decision making
  const analyzeVitalStatus = useCallback((vital: string, value: number): 'normal' | 'warning' | 'critical' => {
    switch (vital) {
      case 'heartRate':
        if (value < 50 || value > 120) return 'critical';
        if (value < 60 || value > 100) return 'warning';
        return 'normal';
      case 'spO2':
        if (value < 90) return 'critical';
        if (value < 95) return 'warning';
        return 'normal';
      case 'temperature':
        if (value > 103 || value < 95) return 'critical';
        if (value > 100.4 || value < 97) return 'warning';
        return 'normal';
      case 'stressLevel':
        if (value > 80) return 'critical';
        if (value > 60) return 'warning';
        return 'normal';
      default:
        return 'normal';
    }
  }, []);

  // Advanced scanning with realistic simulation
  const performComprehensiveScan = useCallback(async () => {
    setIsScanning(true);
    setScanProgress(0);
    
    toast({
      title: "🔄 Advanced Vitals Scan Started",
      description: "Performing comprehensive biometric analysis...",
    });

    const scanSteps = [
      { name: 'Heart Rate', duration: 30000 },
      { name: 'Blood Oxygen', duration: 25000 },
      { name: 'Temperature', duration: 15000 },
      { name: 'HRV Analysis', duration: 35000 },
      { name: 'Stress Assessment', duration: 20000 },
      { name: 'Blood Pressure', duration: 30000 }
    ];

    let totalTime = 0;
    const maxTime = scanSteps.reduce((sum, step) => sum + step.duration, 0);

    for (const step of scanSteps) {
      setActiveAnalysis(step.name);
      
      // Simulate progressive scanning
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, step.duration / 10));
        totalTime += step.duration / 10;
        setScanProgress((totalTime / maxTime) * 100);
      }
    }

    // Generate realistic readings
    const newVitals: AdvancedVitalsData = {
      heartRate: {
        value: 65 + Math.random() * 25,
        timestamp: new Date(),
        status: 'normal',
        confidence: 0.85 + Math.random() * 0.1
      },
      spO2: {
        value: 96 + Math.random() * 4,
        timestamp: new Date(),
        status: 'normal',
        confidence: 0.88 + Math.random() * 0.1
      },
      temperature: {
        value: 97.8 + Math.random() * 1.2,
        timestamp: new Date(),
        status: 'normal',
        confidence: 0.82 + Math.random() * 0.15
      },
      heartRateVariability: {
        value: 35 + Math.random() * 20,
        timestamp: new Date(),
        status: 'normal',
        confidence: 0.78 + Math.random() * 0.15
      },
      stressLevel: {
        value: 15 + Math.random() * 30,
        timestamp: new Date(),
        status: 'normal',
        confidence: 0.85 + Math.random() * 0.1
      },
      bloodPressure: {
        systolic: 110 + Math.random() * 20,
        diastolic: 70 + Math.random() * 15,
        timestamp: new Date(),
        status: 'normal'
      }
    };

    // Analyze status for each vital
    Object.keys(newVitals).forEach(key => {
      if (key !== 'bloodPressure') {
        const vital = newVitals[key as keyof typeof newVitals] as VitalReading;
        vital.status = analyzeVitalStatus(key, vital.value);
        
        if (vital.status !== 'normal') {
          onVitalAlert?.(key, vital.status);
        }
        
        if (vital.status === 'critical') {
          onEmergencyDetected?.();
        }
      }
    });

    setVitalsData(newVitals);
    setIsScanning(false);
    setScanProgress(0);
    setActiveAnalysis(null);

    toast({
      title: "✅ Comprehensive Scan Complete",
      description: "All vital signs analyzed with AI health insights",
    });
  }, [analyzeVitalStatus, onVitalAlert, onEmergencyDetected, toast]);

  // Real-time monitoring simulation
  useEffect(() => {
    if (isLive && !isScanning) {
      const interval = setInterval(() => {
        setVitalsData(prev => ({
          ...prev,
          heartRate: {
            ...prev.heartRate,
            value: Math.max(50, Math.min(120, prev.heartRate.value + (Math.random() - 0.5) * 4)),
            timestamp: new Date()
          },
          spO2: {
            ...prev.spO2,
            value: Math.max(90, Math.min(100, prev.spO2.value + (Math.random() - 0.5) * 2)),
            timestamp: new Date()
          }
        }));
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [isLive, isScanning]);

  const getStatusColor = (status: 'normal' | 'warning' | 'critical') => {
    switch (status) {
      case 'critical': return 'text-red-400 border-red-500 bg-red-500/10';
      case 'warning': return 'text-yellow-400 border-yellow-500 bg-yellow-500/10';
      default: return 'text-green-400 border-green-500 bg-green-500/10';
    }
  };

  const getStatusIcon = (status: 'normal' | 'warning' | 'critical') => {
    switch (status) {
      case 'critical': return <AlertTriangle className="w-4 h-4" />;
      case 'warning': return <AlertTriangle className="w-4 h-4" />;
      default: return <CheckCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Scanning Progress */}
      {isScanning && (
        <Card className="border-2 border-blue-500 bg-blue-500/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Radar className="w-5 h-5 text-blue-400 animate-spin" />
                <span className="font-semibold text-blue-300">
                  {activeAnalysis ? `Analyzing ${activeAnalysis}...` : 'Comprehensive Health Scan'}
                </span>
              </div>
              <Badge variant="outline" className="text-blue-300 border-blue-400">
                {Math.round(scanProgress)}%
              </Badge>
            </div>
            <Progress value={scanProgress} className="h-2" />
          </CardContent>
        </Card>
      )}

      {/* Vitals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Heart Rate */}
        <Card className={cn("border-2", getStatusColor(vitalsData.heartRate.status))}>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-red-400 animate-pulse" />
                Heart Rate
              </div>
              {getStatusIcon(vitalsData.heartRate.status)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white mb-1">
              {Math.round(vitalsData.heartRate.value)} BPM
            </div>
            <div className="text-xs text-gray-400">
              Confidence: {Math.round(vitalsData.heartRate.confidence * 100)}%
            </div>
          </CardContent>
        </Card>

        {/* Blood Oxygen */}
        <Card className={cn("border-2", getStatusColor(vitalsData.spO2.status))}>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-400" />
                SpO2
              </div>
              {getStatusIcon(vitalsData.spO2.status)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white mb-1">
              {Math.round(vitalsData.spO2.value)}%
            </div>
            <div className="text-xs text-gray-400">
              Confidence: {Math.round(vitalsData.spO2.confidence * 100)}%
            </div>
          </CardContent>
        </Card>

        {/* Temperature */}
        <Card className={cn("border-2", getStatusColor(vitalsData.temperature.status))}>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Thermometer className="w-5 h-5 text-orange-400" />
                Temperature
              </div>
              {getStatusIcon(vitalsData.temperature.status)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white mb-1">
              {vitalsData.temperature.value.toFixed(1)}°F
            </div>
            <div className="text-xs text-gray-400">
              Confidence: {Math.round(vitalsData.temperature.confidence * 100)}%
            </div>
          </CardContent>
        </Card>

        {/* Heart Rate Variability */}
        <Card className={cn("border-2", getStatusColor(vitalsData.heartRateVariability.status))}>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Waves className="w-5 h-5 text-purple-400" />
                HRV
              </div>
              {getStatusIcon(vitalsData.heartRateVariability.status)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white mb-1">
              {Math.round(vitalsData.heartRateVariability.value)} ms
            </div>
            <div className="text-xs text-gray-400">
              Recovery Indicator
            </div>
          </CardContent>
        </Card>

        {/* Stress Level */}
        <Card className={cn("border-2", getStatusColor(vitalsData.stressLevel.status))}>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-indigo-400" />
                Stress Level
              </div>
              {getStatusIcon(vitalsData.stressLevel.status)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white mb-1">
              {Math.round(vitalsData.stressLevel.value)}%
            </div>
            <Progress 
              value={vitalsData.stressLevel.value} 
              className="h-2 mt-2"
            />
          </CardContent>
        </Card>

        {/* Blood Pressure */}
        <Card className={cn("border-2", getStatusColor(vitalsData.bloodPressure.status))}>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-400" />
                Blood Pressure
              </div>
              {getStatusIcon(vitalsData.bloodPressure.status)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white mb-1">
              {Math.round(vitalsData.bloodPressure.systolic)}/
              {Math.round(vitalsData.bloodPressure.diastolic)}
            </div>
            <div className="text-xs text-gray-400">
              mmHg
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Control Panel */}
      <div className="flex gap-4">
        <Button 
          onClick={performComprehensiveScan}
          disabled={isScanning}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          {isScanning ? (
            <>
              <Timer className="w-4 h-4 mr-2 animate-spin" />
              Scanning...
            </>
          ) : (
            <>
              <Zap className="w-4 h-4 mr-2" />
              Advanced Health Scan
            </>
          )}
        </Button>
        
        <Button 
          variant="outline"
          onClick={() => setVitalsData(prev => ({
            ...prev,
            heartRate: { ...prev.heartRate, timestamp: new Date() },
            spO2: { ...prev.spO2, timestamp: new Date() },
            temperature: { ...prev.temperature, timestamp: new Date() }
          }))}
          className="border-green-500/50 text-green-300 hover:bg-green-500/20"
        >
          <Activity className="w-4 h-4 mr-2" />
          Refresh Readings
        </Button>
      </div>
    </div>
  );
};