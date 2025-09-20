import { useState, useEffect, useRef, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Shield, Activity, Heart, Brain, Eye, Zap, Smartphone, 
  AlertTriangle, CheckCircle, Clock, Phone, MessageSquare,
  MapPin, Camera, Mic, Settings, Power, Battery,
  Users, Navigation, Ambulance, Star, Target, Stethoscope
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface AegisSystemStatus {
  overallHealth: "excellent" | "good" | "warning" | "critical";
  confidence: number;
  systems: {
    guardian: { status: string; accuracy: number };
    neural: { status: string; accuracy: number };  
    vitals: { status: string; accuracy: number };
    triage: { status: string; accuracy: number };
    location: { status: string; accuracy: number };
  };
  alerts: Array<{
    type: "info" | "warning" | "critical";
    message: string;
    timestamp: Date;
  }>;
  batteryLevel: number;
  signalStrength: number;
}

interface VitalReadings {
  heartRate: number;
  spO2: number;
  temperature: number;
  bloodPressure?: { systolic: number; diastolic: number };
  stressLevel: number;
  riskScore: number;
}

interface AegisWatchHubProps {
  onEmergencyTrigger: () => void;
  onGuardianActivate: () => void;
  onNeuroScan: () => void;
  onVitalScan: () => void;
  onTriageChat: () => void;
  currentLocation?: [number, number];
}

export const AegisWatchHub = ({
  onEmergencyTrigger,
  onGuardianActivate, 
  onNeuroScan,
  onVitalScan,
  onTriageChat,
  currentLocation
}: AegisWatchHubProps) => {
  const { toast } = useToast();
  
  // System states
  const [systemStatus, setSystemStatus] = useState<AegisSystemStatus>({
    overallHealth: "excellent",
    confidence: 98,
    systems: {
      guardian: { status: "Active Monitoring", accuracy: 96 },
      neural: { status: "Stress Analysis Ready", accuracy: 94 },
      vitals: { status: "PPG Scanner Ready", accuracy: 92 },
      triage: { status: "50+ Conditions Ready", accuracy: 95 },
      location: { status: currentLocation ? "GPS Lock" : "Acquiring GPS", accuracy: currentLocation ? 99 : 45 }
    },
    alerts: [
      { type: "info", message: "Aegis Watch initialized successfully", timestamp: new Date() }
    ],
    batteryLevel: 87,
    signalStrength: 95
  });

  const [vitalReadings, setVitalReadings] = useState<VitalReadings>({
    heartRate: 72,
    spO2: 98.1,
    temperature: 36.6,
    bloodPressure: { systolic: 120, diastolic: 80 },
    stressLevel: 15,
    riskScore: 2.1
  });

  const [isMonitoring, setIsMonitoring] = useState(true);
  const [emergencyMode, setEmergencyMode] = useState(false);
  const [showAdvancedView, setShowAdvancedView] = useState(false);
  const [aegisUptime, setAegisUptime] = useState(0);
  const [incidentsToday, setIncidentsToday] = useState(0);
  const [lastHealthCheck, setLastHealthCheck] = useState(new Date());

  const monitoringIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const uptimeIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize Aegis monitoring
  useEffect(() => {
    startAegisMonitoring();
    
    // Uptime counter
    uptimeIntervalRef.current = setInterval(() => {
      setAegisUptime(prev => prev + 1);
    }, 1000);

    return () => {
      if (monitoringIntervalRef.current) clearInterval(monitoringIntervalRef.current);
      if (uptimeIntervalRef.current) clearInterval(uptimeIntervalRef.current);
    };
  }, []);

  const startAegisMonitoring = useCallback(() => {
    setIsMonitoring(true);
    
    monitoringIntervalRef.current = setInterval(() => {
      performSystemHealthCheck();
      updateVitalReadings();
      checkForAnomalies();
    }, 2000);

    toast({
      title: "🛡️ Aegis Watch Activated",
      description: "Multi-system monitoring initiated",
      variant: "default"
    });
  }, []);

  const performSystemHealthCheck = useCallback(() => {
    // Simulate system health monitoring with realistic variations
    const newStatus = { ...systemStatus };
    
    // Update system accuracies with slight variations
    newStatus.systems.guardian.accuracy = 95 + Math.random() * 3;
    newStatus.systems.neural.accuracy = 93 + Math.random() * 4;
    newStatus.systems.vitals.accuracy = 91 + Math.random() * 3;
    newStatus.systems.triage.accuracy = 94 + Math.random() * 2;
    
    // Update location based on GPS
    if (currentLocation) {
      newStatus.systems.location.status = "GPS Lock Active";
      newStatus.systems.location.accuracy = 98 + Math.random() * 2;
    }
    
    // Battery drain simulation
    newStatus.batteryLevel = Math.max(20, systemStatus.batteryLevel - 0.1);
    
    // Signal strength variations
    newStatus.signalStrength = 90 + Math.random() * 10;
    
    // Overall confidence calculation
    const avgAccuracy = Object.values(newStatus.systems)
      .reduce((sum, sys) => sum + sys.accuracy, 0) / 5;
    newStatus.confidence = Math.round(avgAccuracy);
    
    // Overall health determination
    if (avgAccuracy > 95) newStatus.overallHealth = "excellent";
    else if (avgAccuracy > 90) newStatus.overallHealth = "good";
    else if (avgAccuracy > 85) newStatus.overallHealth = "warning";
    else newStatus.overallHealth = "critical";
    
    setSystemStatus(newStatus);
    setLastHealthCheck(new Date());
  }, [systemStatus, currentLocation]);

  const updateVitalReadings = useCallback(() => {
    // Simulate realistic vital sign variations
    const newVitals = { ...vitalReadings };
    
    // Heart rate with circadian variation
    const baseHR = 70;
    const timeVariation = Math.sin(Date.now() / 3600000) * 5; // Hourly variation
    newVitals.heartRate = Math.round(baseHR + timeVariation + (Math.random() - 0.5) * 6);
    
    // SpO2 with minor variations
    newVitals.spO2 = Math.round((97.5 + Math.random() * 1.5) * 10) / 10;
    
    // Temperature with circadian rhythm
    newVitals.temperature = Math.round((36.4 + Math.sin(Date.now() / 3600000) * 0.3 + Math.random() * 0.2) * 10) / 10;
    
    // Blood pressure with activity correlation
    newVitals.bloodPressure = {
      systolic: 115 + Math.round(Math.random() * 10),
      diastolic: 75 + Math.round(Math.random() * 10)
    };
    
    // Stress level based on heart rate variability
    const hrStress = Math.max(0, (newVitals.heartRate - 70) * 2);
    newVitals.stressLevel = Math.round(Math.max(10, Math.min(100, hrStress + Math.random() * 20)));
    
    // Risk score calculation
    let riskScore = 0;
    if (newVitals.heartRate > 100 || newVitals.heartRate < 60) riskScore += 2;
    if (newVitals.spO2 < 95) riskScore += 3;
    if (newVitals.temperature > 37.8 || newVitals.temperature < 35.5) riskScore += 2;
    if (newVitals.stressLevel > 70) riskScore += 1;
    
    newVitals.riskScore = Math.round(riskScore * 10) / 10;
    
    setVitalReadings(newVitals);
  }, [vitalReadings]);

  const checkForAnomalies = useCallback(() => {
    const alerts = [...systemStatus.alerts];
    
    // Check for critical vitals
    if (vitalReadings.heartRate > 120 || vitalReadings.heartRate < 50) {
      alerts.unshift({
        type: "critical",
        message: `Critical heart rate detected: ${vitalReadings.heartRate} BPM`,
        timestamp: new Date()
      });
    }
    
    if (vitalReadings.spO2 < 90) {
      alerts.unshift({
        type: "critical", 
        message: `Low oxygen saturation: ${vitalReadings.spO2}%`,
        timestamp: new Date()
      });
    }
    
    if (vitalReadings.stressLevel > 85) {
      alerts.unshift({
        type: "warning",
        message: `High stress level detected: ${vitalReadings.stressLevel}%`,
        timestamp: new Date()
      });
    }
    
    // Keep only last 10 alerts
    if (alerts.length > 10) {
      alerts.splice(10);
    }
    
    setSystemStatus(prev => ({ ...prev, alerts }));
  }, [systemStatus.alerts, vitalReadings]);

  const triggerEmergency = useCallback(() => {
    setEmergencyMode(true);
    setIncidentsToday(prev => prev + 1);
    
    // Add emergency alert
    const emergencyAlert = {
      type: "critical" as const,
      message: "🚨 EMERGENCY MODE ACTIVATED - All systems engaged",
      timestamp: new Date()
    };
    
    setSystemStatus(prev => ({
      ...prev,
      alerts: [emergencyAlert, ...prev.alerts]
    }));
    
    toast({
      title: "🚨 EMERGENCY ACTIVATED",
      description: "Aegis emergency protocols engaged",
      variant: "destructive"
    });
    
    onEmergencyTrigger();
  }, [onEmergencyTrigger]);

  const getHealthColor = (health: string) => {
    switch (health) {
      case "excellent": return "text-green-500";
      case "good": return "text-blue-500";
      case "warning": return "text-yellow-500";
      case "critical": return "text-red-500";
      default: return "text-gray-500";
    }
  };

  const getHealthIcon = (health: string) => {
    switch (health) {
      case "excellent": return <CheckCircle className="w-5 h-5" />;
      case "good": return <Activity className="w-5 h-5" />;
      case "warning": return <Clock className="w-5 h-5" />;
      case "critical": return <AlertTriangle className="w-5 h-5" />;
      default: return <Shield className="w-5 h-5" />;
    }
  };

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Aegis Header */}
      <Card className="p-6 bg-gradient-to-r from-slate-900 to-slate-800 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Shield className="w-12 h-12 text-blue-400" />
              {isMonitoring && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full animate-pulse" />
              )}
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                AEGIS WATCH
              </h1>
              <p className="text-slate-300">Advanced Emergency Guardian Intelligence System</p>
            </div>
          </div>
          
          <div className="text-right space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Battery className="w-4 h-4" />
              <span>{systemStatus.batteryLevel}%</span>
              <div className="w-8 h-3 border rounded">
                <div 
                  className="h-full bg-green-400 rounded"
                  style={{ width: `${systemStatus.batteryLevel}%` }}
                />
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Smartphone className="w-4 h-4" />
              <span>{systemStatus.signalStrength}%</span>
            </div>
            <div className="text-xs text-slate-400">
              Uptime: {formatUptime(aegisUptime)}
            </div>
          </div>
        </div>
      </Card>

      {/* System Overview */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Overall Status */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Activity className="w-5 h-5" />
              System Status
            </h3>
            <Badge 
              variant="secondary"
              className={cn("flex items-center gap-1", getHealthColor(systemStatus.overallHealth))}
            >
              {getHealthIcon(systemStatus.overallHealth)}
              {systemStatus.overallHealth.toUpperCase()}
            </Badge>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Overall Confidence</span>
              <span className="font-bold text-lg">{systemStatus.confidence}%</span>
            </div>
            <Progress value={systemStatus.confidence} className="h-3" />
            
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-primary">{incidentsToday}</div>
                <div className="text-xs text-muted-foreground">Incidents Today</div>
              </div>
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-green-500">
                  {Object.values(systemStatus.systems).filter(s => s.accuracy > 90).length}
                </div>
                <div className="text-xs text-muted-foreground">Systems Online</div>
              </div>
            </div>
          </div>
        </Card>

        {/* Live Vitals */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
            <Heart className="w-5 h-5 text-red-500" />
            Live Vitals Monitor
          </h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <div className="text-2xl font-bold text-red-500">{vitalReadings.heartRate}</div>
              <div className="text-xs text-muted-foreground">BPM</div>
            </div>
            <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="text-2xl font-bold text-blue-500">{vitalReadings.spO2}%</div>
              <div className="text-xs text-muted-foreground">SpO2</div>
            </div>
            <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="text-2xl font-bold text-green-500">{vitalReadings.temperature}°C</div>
              <div className="text-xs text-muted-foreground">Temperature</div>
            </div>
            <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div className="text-2xl font-bold text-purple-500">{vitalReadings.stressLevel}%</div>
              <div className="text-xs text-muted-foreground">Stress Level</div>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-muted rounded-lg">
            <div className="flex items-center justify-between text-sm">
              <span>Risk Score:</span>
              <span className={cn("font-bold", vitalReadings.riskScore > 5 ? "text-red-500" : "text-green-500")}>
                {vitalReadings.riskScore}/10
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Emergency Controls */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5" />
          Emergency Response Center
        </h3>
        
        <div className="grid sm:grid-cols-2 md:grid-cols-5 gap-4">
          <Button
            onClick={triggerEmergency}
            variant="destructive"
            size="lg"
            className="h-16 text-lg font-bold"
          >
            <Phone className="w-6 h-6 mr-2" />
            SOS
          </Button>
          
          <Button
            onClick={onGuardianActivate}
            variant="outline"
            size="lg"
            className="h-16"
          >
            <Shield className="w-5 h-5 mb-1" />
            <div className="text-sm">Guardian AI</div>
          </Button>
          
          <Button
            onClick={onNeuroScan}
            variant="outline" 
            size="lg"
            className="h-16"
          >
            <Brain className="w-5 h-5 mb-1" />
            <div className="text-sm">Neural Scan</div>
          </Button>
          
          <Button
            onClick={onVitalScan}
            variant="outline"
            size="lg"
            className="h-16"
          >
            <Activity className="w-5 h-5 mb-1" />
            <div className="text-sm">Vital Scan</div>
          </Button>
          
          <Button
            onClick={onTriageChat}
            variant="outline"
            size="lg" 
            className="h-16"
          >
            <MessageSquare className="w-5 h-5 mb-1" />
            <div className="text-sm">AI Triage</div>
          </Button>
        </div>
      </Card>

      {/* System Details */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Sub-system Status */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Sub-System Status</h3>
          
          <div className="space-y-3">
            {Object.entries(systemStatus.systems).map(([key, system]) => (
              <div key={key} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-3">
                  {key === "guardian" && <Shield className="w-4 h-4" />}
                  {key === "neural" && <Brain className="w-4 h-4" />}
                  {key === "vitals" && <Heart className="w-4 h-4" />}
                  {key === "triage" && <Stethoscope className="w-4 h-4" />}
                  {key === "location" && <MapPin className="w-4 h-4" />}
                  <div>
                    <div className="font-medium capitalize">{key}</div>
                    <div className="text-xs text-muted-foreground">{system.status}</div>
                  </div>
                </div>
                <Badge variant="secondary">
                  {system.accuracy.toFixed(1)}%
                </Badge>
              </div>
            ))}
          </div>
        </Card>

        {/* Alert Feed */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Alert Feed</h3>
          
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {systemStatus.alerts.map((alert, index) => (
              <Alert key={index} variant={alert.type === "critical" ? "destructive" : "default"}>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  <div className="flex justify-between items-start">
                    <span>{alert.message}</span>
                    <span className="text-xs opacity-70 ml-2">
                      {alert.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                </AlertDescription>
              </Alert>
            ))}
          </div>
        </Card>
      </div>

      {emergencyMode && (
        <Alert variant="destructive" className="border-red-500 bg-red-50 dark:bg-red-900/20">
          <Ambulance className="h-4 w-4" />
          <AlertDescription className="text-red-700 dark:text-red-200">
            <strong>EMERGENCY MODE ACTIVE</strong> - All Aegis systems engaged. Emergency services have been notified. 
            Location: {currentLocation ? `${currentLocation[0].toFixed(4)}, ${currentLocation[1].toFixed(4)}` : "Acquiring GPS..."}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};
