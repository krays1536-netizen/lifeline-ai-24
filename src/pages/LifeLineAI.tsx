import { useState, useEffect, useCallback, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { 
  Shield, 
  Heart, 
  Activity, 
  Thermometer,
  MapPin,
  Users,
  Mic,
  Camera,
  Phone,
  Settings,
  FileText,
  Navigation,
  Brain,
  Battery,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap,
  TrendingUp,
  Volume2,
  Car,
  Flame,
  Wind,
  User,
  MessageSquare,
  Smartphone,
  Wifi,
  WifiOff
} from "lucide-react";

interface VitalReading {
  heartRate: number;
  spO2: number;
  temperature: number;
  bloodPressure: { systolic: number; diastolic: number };
  confidence: number;
  timestamp: Date;
}

interface EmergencyContact {
  name: string;
  phone: string;
  relation: string;
  priority: number;
}

interface UserProfile {
  name: string;
  age: string;
  bloodType: string;
  medicalConditions: string[];
  allergies: string;
  emergencyContacts: EmergencyContact[];
  preferredHospital: string;
}

interface IncidentData {
  id: string;
  type: string;
  severity: "low" | "medium" | "high" | "critical";
  timestamp: Date;
  location: { lat: number; lng: number; address: string };
  vitals: VitalReading;
  aiAnalysis: string;
  responseTime: number;
  status: "detecting" | "confirmed" | "responding" | "resolved";
}

export const LifeLineAI = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("dashboard");
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Core System State
  const [systemStatus, setSystemStatus] = useState<"initializing" | "active" | "emergency" | "offline">("initializing");
  const [batteryLevel, setBatteryLevel] = useState(87);
  const [isOnline, setIsOnline] = useState(true);
  const [networkStrength, setNetworkStrength] = useState(4);
  
  // AI Guardian State
  const [aiGuardianActive, setAiGuardianActive] = useState(false);
  const [riskScore, setRiskScore] = useState(0);
  const [lastAiAnalysis, setLastAiAnalysis] = useState<string>("");
  const [activeAlerts, setActiveAlerts] = useState<string[]>([]);
  
  // Health Monitoring
  const [vitals, setVitals] = useState<VitalReading>({
    heartRate: 72,
    spO2: 98,
    temperature: 36.6,
    bloodPressure: { systolic: 120, diastolic: 80 },
    confidence: 95,
    timestamp: new Date()
  });
  
  const [vitalsHistory, setVitalsHistory] = useState<VitalReading[]>([]);
  const [continuousMonitoring, setContinuousMonitoring] = useState(false);
  
  // Location & Emergency
  const [currentLocation, setCurrentLocation] = useState<{
    lat: number; lng: number; address: string; accuracy: number;
  }>({ lat: 29.3759, lng: 47.9774, address: "Kuwait City, Kuwait", accuracy: 10 });
  
  const [emergencyMode, setEmergencyMode] = useState(false);
  const [activeIncident, setActiveIncident] = useState<IncidentData | null>(null);
  const [nearbyHelpers, setNearbyHelpers] = useState(0);
  const [estimatedResponseTime, setEstimatedResponseTime] = useState(0);
  
  // User Profile
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: "Guardian User",
    age: "30",
    bloodType: "O+",
    medicalConditions: [],
    allergies: "",
    emergencyContacts: [
      { name: "Emergency Mom", phone: "+965-9999-1234", relation: "Mother", priority: 1 },
      { name: "Emergency Dad", phone: "+965-9999-5678", relation: "Father", priority: 2 }
    ],
    preferredHospital: "Kuwait Hospital"
  });
  
  // Advanced Features
  const [voiceCommandActive, setVoiceCommandActive] = useState(false);
  const [cameraMonitoring, setCameraMonitoring] = useState(false);
  const [familyNotifications, setFamilyNotifications] = useState(true);
  const [communityWatch, setCommunityWatch] = useState(true);

  // Initialize System
  useEffect(() => {
    const initSystem = async () => {
      toast({
        title: "🔵 LifeLine AI Initializing",
        description: "Activating advanced protection systems...",
      });

      // Simulate system startup
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Request permissions
      try {
        await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setCameraMonitoring(true);
        setVoiceCommandActive(true);
      } catch (error) {
        console.log("Camera/Microphone access denied");
      }

      // Get location
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
          setCurrentLocation(prev => ({
            ...prev,
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy
          }));
        });
      }

      setSystemStatus("active");
      setAiGuardianActive(true);
      
      toast({
        title: "✅ LifeLine AI Active",
        description: "Advanced guardian protection is now online",
        variant: "default"
      });
    };

    initSystem();
  }, [toast]);

  // Real-time Vitals Monitoring
  useEffect(() => {
    if (!continuousMonitoring) return;

    intervalRef.current = setInterval(() => {
      const newVitals: VitalReading = {
        heartRate: Math.max(50, Math.min(120, vitals.heartRate + (Math.random() * 8 - 4))),
        spO2: Math.max(90, Math.min(100, vitals.spO2 + (Math.random() * 4 - 2))),
        temperature: Math.max(35.5, Math.min(39, vitals.temperature + (Math.random() * 0.6 - 0.3))),
        bloodPressure: {
          systolic: Math.max(90, Math.min(160, vitals.bloodPressure.systolic + (Math.random() * 10 - 5))),
          diastolic: Math.max(60, Math.min(100, vitals.bloodPressure.diastolic + (Math.random() * 6 - 3)))
        },
        confidence: Math.max(75, Math.min(99, 90 + Math.random() * 9)),
        timestamp: new Date()
      };

      setVitals(newVitals);
      setVitalsHistory(prev => [...prev.slice(-19), newVitals]);

      // AI Risk Analysis
      analyzeHealthRisk(newVitals);
    }, 3000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [continuousMonitoring, vitals]);

  // AI Risk Analysis Engine
  const analyzeHealthRisk = useCallback((vitals: VitalReading) => {
    let score = 0;
    let alerts: string[] = [];
    let analysis = "All vitals within normal ranges. ";

    // Heart rate analysis
    if (vitals.heartRate > 100) {
      score += 3;
      alerts.push("High Heart Rate");
      analysis += "Elevated heart rate detected. ";
    } else if (vitals.heartRate < 60) {
      score += 2;
      alerts.push("Low Heart Rate");
      analysis += "Bradycardia detected. ";
    }

    // Oxygen analysis
    if (vitals.spO2 < 95) {
      score += 4;
      alerts.push("Low Oxygen");
      analysis += "Oxygen saturation below safe threshold. ";
    }

    // Temperature analysis
    if (vitals.temperature > 37.8) {
      score += 2;
      alerts.push("Fever");
      analysis += "Elevated body temperature. ";
    } else if (vitals.temperature < 36) {
      score += 2;
      alerts.push("Hypothermia");
      analysis += "Body temperature below normal. ";
    }

    // Blood pressure analysis
    if (vitals.bloodPressure.systolic > 140 || vitals.bloodPressure.diastolic > 90) {
      score += 3;
      alerts.push("High Blood Pressure");
      analysis += "Hypertensive reading detected. ";
    }

    setRiskScore(score);
    setActiveAlerts(alerts);
    setLastAiAnalysis(analysis);

    // Auto-trigger emergency for critical conditions
    if (score >= 7) {
      triggerEmergency("AI Health Alert", "critical");
    }
  }, []);

  // Emergency Detection & Response
  const triggerEmergency = useCallback((type: string, severity: "low" | "medium" | "high" | "critical") => {
    const incident: IncidentData = {
      id: `INC-${Date.now()}`,
      type,
      severity,
      timestamp: new Date(),
      location: { 
        lat: currentLocation.lat, 
        lng: currentLocation.lng, 
        address: currentLocation.address 
      },
      vitals,
      aiAnalysis: lastAiAnalysis,
      responseTime: 0,
      status: "detecting"
    };

    setActiveIncident(incident);
    setEmergencyMode(true);
    setSystemStatus("emergency");

    // Calculate response time
    const responseTime = Math.floor(Math.random() * 8) + 3; // 3-10 minutes
    setEstimatedResponseTime(responseTime);
    
    // Find nearby helpers
    setNearbyHelpers(Math.floor(Math.random() * 5) + 1);

    toast({
      title: `🚨 EMERGENCY DETECTED`,
      description: `${type} - Response time: ${responseTime} minutes`,
      variant: "destructive"
    });

    // Auto-confirm after countdown
    setTimeout(() => {
      confirmEmergency();
    }, 15000);

    // Notify family immediately
    if (familyNotifications) {
      setTimeout(() => notifyFamily(), 2000);
    }
  }, [currentLocation, vitals, lastAiAnalysis, familyNotifications]);

  const confirmEmergency = useCallback(() => {
    if (!activeIncident) return;

    setActiveIncident(prev => prev ? { ...prev, status: "confirmed" } : null);
    
    toast({
      title: "📞 Emergency Services Contacted",
      description: "Ambulance dispatched to your location",
      variant: "destructive"
    });

    // Simulate emergency response
    setTimeout(() => {
      setActiveIncident(prev => prev ? { ...prev, status: "responding" } : null);
      toast({
        title: "🚑 Help On The Way",
        description: `Ambulance ETA: ${estimatedResponseTime} minutes`,
      });
    }, 3000);
  }, [activeIncident, estimatedResponseTime]);

  const notifyFamily = useCallback(() => {
    userProfile.emergencyContacts.forEach((contact, index) => {
      setTimeout(() => {
        toast({
          title: `📱 SMS Sent: ${contact.name}`,
          description: `Emergency alert with location sent to ${contact.phone}`,
        });
      }, index * 800);
    });
  }, [userProfile.emergencyContacts]);

  // Manual Emergency Triggers
  const handleManualEmergency = (type: string) => {
    triggerEmergency(`Manual ${type}`, "high");
  };

  const handleFallDetection = () => {
    triggerEmergency("Fall Detected", "high");
  };

  const handleCrashDetection = () => {
    triggerEmergency("Vehicle Crash", "critical");
  };

  const handleMedicalEmergency = () => {
    triggerEmergency("Medical Emergency", "critical");
  };

  // Voice Commands
  const activateVoiceCommand = () => {
    setVoiceCommandActive(true);
    toast({
      title: "🎤 Voice Commands Active",
      description: 'Say "Help me" or "Emergency" to activate',
    });
  };

  // Status Colors
  const getStatusColor = () => {
    switch (systemStatus) {
      case "emergency": return "text-cyber-red";
      case "active": return "text-cyber-green";
      case "offline": return "text-muted-foreground";
      default: return "text-cyber-blue";
    }
  };

  const getRiskColor = () => {
    if (riskScore >= 7) return "text-cyber-red";
    if (riskScore >= 4) return "text-cyber-orange";
    if (riskScore >= 2) return "text-cyber-yellow";
    return "text-cyber-green";
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-poppins">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="p-4 border-b border-border bg-[var(--gradient-card)]">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="p-2 bg-[var(--gradient-primary)] rounded-lg">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                {aiGuardianActive && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-cyber-green rounded-full animate-pulse" />
                )}
              </div>
              <div>
                <h1 className="text-xl font-bold bg-[var(--gradient-primary)] bg-clip-text text-transparent">
                  LifeLine AI
                </h1>
                <p className={`text-xs font-medium ${getStatusColor()}`}>
                  {systemStatus === "active" ? "Guardian Active" : 
                   systemStatus === "emergency" ? "EMERGENCY MODE" :
                   systemStatus === "offline" ? "System Offline" : "Initializing..."}
                </p>
              </div>
            </div>
            
            {/* Status Indicators */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <Battery className="h-4 w-4 text-cyber-green" />
                <span className="text-xs">{batteryLevel}%</span>
              </div>
              {isOnline ? (
                <Wifi className="h-4 w-4 text-cyber-green" />
              ) : (
                <WifiOff className="h-4 w-4 text-cyber-red" />
              )}
            </div>
          </div>

          {/* Risk Assessment */}
          <div className="bg-card/50 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">AI Risk Assessment</span>
              <span className={`text-sm font-bold ${getRiskColor()}`}>
                {riskScore}/10
              </span>
            </div>
            <Progress value={riskScore * 10} className="h-2 mb-2" />
            <div className="flex flex-wrap gap-1">
              {activeAlerts.map(alert => (
                <Badge key={alert} variant="destructive" className="text-xs">
                  {alert}
                </Badge>
              ))}
              {activeAlerts.length === 0 && (
                <Badge variant="default" className="text-xs">All Clear</Badge>
              )}
            </div>
          </div>
        </div>

        {/* Emergency Banner */}
        {emergencyMode && activeIncident && (
          <div className="bg-cyber-red text-white p-4 animate-danger-pulse">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                <div>
                  <p className="font-bold">{activeIncident.type}</p>
                  <p className="text-xs">Response Time: {estimatedResponseTime} min</p>
                </div>
              </div>
              <Badge variant="destructive">
                {activeIncident.status.toUpperCase()}
              </Badge>
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 bg-card/50 mx-2 mt-2">
            <TabsTrigger value="dashboard" className="text-xs">
              <TrendingUp className="h-4 w-4" />
            </TabsTrigger>
            <TabsTrigger value="health" className="text-xs">
              <Heart className="h-4 w-4" />
            </TabsTrigger>
            <TabsTrigger value="emergency" className="text-xs">
              <Phone className="h-4 w-4" />
            </TabsTrigger>
            <TabsTrigger value="location" className="text-xs">
              <MapPin className="h-4 w-4" />
            </TabsTrigger>
            <TabsTrigger value="ai" className="text-xs">
              <Brain className="h-4 w-4" />
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="p-4 space-y-4">
            {/* Quick Status Cards */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="p-4 bg-[var(--gradient-card)]">
                <div className="flex items-center gap-3">
                  <Heart className="h-8 w-8 text-cyber-red" />
                  <div>
                    <p className="text-2xl font-bold">{Math.round(vitals.heartRate)}</p>
                    <p className="text-xs text-muted-foreground">BPM</p>
                  </div>
                </div>
              </Card>
              
              <Card className="p-4 bg-[var(--gradient-card)]">
                <div className="flex items-center gap-3">
                  <Activity className="h-8 w-8 text-cyber-blue" />
                  <div>
                    <p className="text-2xl font-bold">{Math.round(vitals.spO2)}%</p>
                    <p className="text-xs text-muted-foreground">SpO₂</p>
                  </div>
                </div>
              </Card>
              
              <Card className="p-4 bg-[var(--gradient-card)]">
                <div className="flex items-center gap-3">
                  <Thermometer className="h-8 w-8 text-cyber-orange" />
                  <div>
                    <p className="text-2xl font-bold">{vitals.temperature.toFixed(1)}</p>
                    <p className="text-xs text-muted-foreground">°C</p>
                  </div>
                </div>
              </Card>
              
              <Card className="p-4 bg-[var(--gradient-card)]">
                <div className="flex items-center gap-3">
                  <Users className="h-8 w-8 text-cyber-green" />
                  <div>
                    <p className="text-2xl font-bold">{nearbyHelpers}</p>
                    <p className="text-xs text-muted-foreground">Helpers</p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Continuous Monitoring Toggle */}
            <Card className="p-4 bg-[var(--gradient-card)]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-cyber-green/20 rounded-lg">
                    <Activity className="h-5 w-5 text-cyber-green" />
                  </div>
                  <div>
                    <p className="font-medium">Continuous Health Monitoring</p>
                    <p className="text-sm text-muted-foreground">Real-time vitals tracking</p>
                  </div>
                </div>
                <Button
                  onClick={() => setContinuousMonitoring(!continuousMonitoring)}
                  variant={continuousMonitoring ? "default" : "outline"}
                  size="sm"
                >
                  {continuousMonitoring ? "ON" : "OFF"}
                </Button>
              </div>
            </Card>

            {/* AI Analysis */}
            {lastAiAnalysis && (
              <Card className="p-4 bg-[var(--gradient-neural)]">
                <div className="flex items-start gap-3">
                  <Brain className="h-5 w-5 text-cyber-purple mt-1" />
                  <div>
                    <p className="font-medium text-white mb-1">AI Health Analysis</p>
                    <p className="text-sm text-white/80">{lastAiAnalysis}</p>
                  </div>
                </div>
              </Card>
            )}
          </TabsContent>

          {/* Health Tab */}
          <TabsContent value="health" className="p-4 space-y-4">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-2">Health Monitoring</h2>
              <p className="text-muted-foreground">Advanced vital signs analysis</p>
            </div>

            {/* Detailed Vitals */}
            <Card className="p-6 bg-[var(--gradient-card)]">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Heart className="h-6 w-6 text-cyber-red" />
                    <span className="font-medium">Heart Rate</span>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold">{Math.round(vitals.heartRate)} BPM</p>
                    <p className="text-xs text-muted-foreground">Confidence: {vitals.confidence}%</p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Activity className="h-6 w-6 text-cyber-blue" />
                    <span className="font-medium">Blood Oxygen</span>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold">{Math.round(vitals.spO2)}%</p>
                    <p className="text-xs text-muted-foreground">SpO₂ Level</p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Thermometer className="h-6 w-6 text-cyber-orange" />
                    <span className="font-medium">Temperature</span>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold">{vitals.temperature.toFixed(1)}°C</p>
                    <p className="text-xs text-muted-foreground">Body Temp</p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="h-6 w-6 text-cyber-purple" />
                    <span className="font-medium">Blood Pressure</span>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold">
                      {Math.round(vitals.bloodPressure.systolic)}/{Math.round(vitals.bloodPressure.diastolic)}
                    </p>
                    <p className="text-xs text-muted-foreground">mmHg</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Health Trends */}
            <Card className="p-4 bg-[var(--gradient-card)]">
              <h3 className="font-medium mb-3">24-Hour Trends</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Average Heart Rate</span>
                  <span>74 BPM</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Peak Activity</span>
                  <span>2:30 PM - 4:15 PM</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Sleep Quality</span>
                  <span className="text-cyber-green">Excellent</span>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Emergency Tab */}
          <TabsContent value="emergency" className="p-4 space-y-4">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-2">Emergency Response</h2>
              <p className="text-muted-foreground">Advanced detection & response</p>
            </div>

            {/* Main SOS Button */}
            <Button 
              onClick={() => handleManualEmergency("SOS")}
              className="w-full h-20 bg-[var(--gradient-danger)] text-white text-xl font-bold hover:shadow-[var(--glow-danger)] transition-all duration-300 hover:scale-105 active:scale-95"
            >
              🆘 EMERGENCY SOS
            </Button>

            {/* Emergency Types */}
            <div className="grid grid-cols-2 gap-4">
              <Button
                onClick={handleMedicalEmergency}
                className="h-16 bg-cyber-red/20 text-cyber-red border border-cyber-red/30 hover:bg-cyber-red hover:text-white"
              >
                <div className="text-center">
                  <Heart className="h-6 w-6 mx-auto mb-1" />
                  <p className="text-sm font-medium">Medical</p>
                </div>
              </Button>

              <Button
                onClick={handleFallDetection}
                className="h-16 bg-cyber-orange/20 text-cyber-orange border border-cyber-orange/30 hover:bg-cyber-orange hover:text-white"
              >
                <div className="text-center">
                  <TrendingUp className="h-6 w-6 mx-auto mb-1" />
                  <p className="text-sm font-medium">Fall</p>
                </div>
              </Button>

              <Button
                onClick={handleCrashDetection}
                className="h-16 bg-cyber-purple/20 text-cyber-purple border border-cyber-purple/30 hover:bg-cyber-purple hover:text-white"
              >
                <div className="text-center">
                  <Car className="h-6 w-6 mx-auto mb-1" />
                  <p className="text-sm font-medium">Crash</p>
                </div>
              </Button>

              <Button
                onClick={() => handleManualEmergency("Fire")}
                className="h-16 bg-cyber-yellow/20 text-cyber-yellow border border-cyber-yellow/30 hover:bg-cyber-yellow hover:text-black"
              >
                <div className="text-center">
                  <Flame className="h-6 w-6 mx-auto mb-1" />
                  <p className="text-sm font-medium">Fire</p>
                </div>
              </Button>
            </div>

            {/* Voice Commands */}
            <Card className="p-4 bg-[var(--gradient-card)]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Mic className={`h-5 w-5 ${voiceCommandActive ? 'text-cyber-green' : 'text-muted-foreground'}`} />
                  <div>
                    <p className="font-medium">Voice Commands</p>
                    <p className="text-sm text-muted-foreground">Say "Help me" to activate</p>
                  </div>
                </div>
                <Button
                  onClick={activateVoiceCommand}
                  variant={voiceCommandActive ? "default" : "outline"}
                  size="sm"
                >
                  {voiceCommandActive ? "Listening" : "Activate"}
                </Button>
              </div>
            </Card>

            {/* Emergency Contacts */}
            <Card className="p-4 bg-[var(--gradient-card)]">
              <h3 className="font-medium mb-3 flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Emergency Contacts
              </h3>
              <div className="space-y-2">
                {userProfile.emergencyContacts.slice(0, 3).map((contact, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-card/50 rounded">
                    <div>
                      <p className="font-medium text-sm">{contact.name}</p>
                      <p className="text-xs text-muted-foreground">{contact.relation}</p>
                    </div>
                    <Button size="sm" variant="outline">Call</Button>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* Location Tab */}
          <TabsContent value="location" className="p-4 space-y-4">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-2">Location Services</h2>
              <p className="text-muted-foreground">GPS tracking & emergency routing</p>
            </div>

            {/* Current Location */}
            <Card className="p-4 bg-[var(--gradient-card)]">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-cyber-blue mt-1" />
                <div className="flex-1">
                  <p className="font-medium">Current Location</p>
                  <p className="text-sm text-muted-foreground">{currentLocation.address}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Accuracy: ±{currentLocation.accuracy}m
                  </p>
                </div>
              </div>
            </Card>

            {/* Nearby Services */}
            <Card className="p-4 bg-[var(--gradient-card)]">
              <h3 className="font-medium mb-3">Nearest Emergency Services</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-cyber-red/20 rounded">
                      <Heart className="h-4 w-4 text-cyber-red" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">Kuwait Hospital</p>
                      <p className="text-xs text-muted-foreground">1.2 km away</p>
                    </div>
                  </div>
                  <span className="text-sm text-cyber-green">3 min</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-cyber-blue/20 rounded">
                      <Shield className="h-4 w-4 text-cyber-blue" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">Police Station</p>
                      <p className="text-xs text-muted-foreground">0.8 km away</p>
                    </div>
                  </div>
                  <span className="text-sm text-cyber-green">2 min</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-cyber-orange/20 rounded">
                      <Flame className="h-4 w-4 text-cyber-orange" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">Fire Department</p>
                      <p className="text-xs text-muted-foreground">1.5 km away</p>
                    </div>
                  </div>
                  <span className="text-sm text-cyber-green">4 min</span>
                </div>
              </div>
            </Card>

            {/* Family Sharing */}
            <Card className="p-4 bg-[var(--gradient-card)]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-cyber-green" />
                  <div>
                    <p className="font-medium">Family Location Sharing</p>
                    <p className="text-sm text-muted-foreground">Share location with emergency contacts</p>
                  </div>
                </div>
                <Button
                  onClick={() => setFamilyNotifications(!familyNotifications)}
                  variant={familyNotifications ? "default" : "outline"}
                  size="sm"
                >
                  {familyNotifications ? "ON" : "OFF"}
                </Button>
              </div>
            </Card>

            {/* Community Watch */}
            <Card className="p-4 bg-[var(--gradient-card)]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-cyber-purple" />
                  <div>
                    <p className="font-medium">Community Watch</p>
                    <p className="text-sm text-muted-foreground">{nearbyHelpers} helpers nearby</p>
                  </div>
                </div>
                <Button
                  onClick={() => setCommunityWatch(!communityWatch)}
                  variant={communityWatch ? "default" : "outline"}
                  size="sm"
                >
                  {communityWatch ? "Active" : "Inactive"}
                </Button>
              </div>
            </Card>
          </TabsContent>

          {/* AI Tab */}
          <TabsContent value="ai" className="p-4 space-y-4">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-2">AI Guardian</h2>
              <p className="text-muted-foreground">Advanced health & safety analysis</p>
            </div>

            {/* AI Status */}
            <Card className="p-4 bg-[var(--gradient-neural)]">
              <div className="flex items-center gap-3 mb-4">
                <Brain className="h-8 w-8 text-white" />
                <div>
                  <p className="font-bold text-white text-lg">AI Guardian Active</p>
                  <p className="text-white/80 text-sm">Neural analysis running 24/7</p>
                </div>
              </div>
              
              <div className="bg-white/10 rounded-lg p-3">
                <p className="text-white text-sm leading-relaxed">
                  {lastAiAnalysis || "Monitoring all vitals and environmental factors. All systems normal. Advanced pattern recognition active for early detection of anomalies."}
                </p>
              </div>
            </Card>

            {/* AI Features */}
            <div className="space-y-3">
              <Card className="p-4 bg-[var(--gradient-card)]">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-cyber-green/20 rounded">
                    <CheckCircle className="h-5 w-5 text-cyber-green" />
                  </div>
                  <div>
                    <p className="font-medium">Predictive Health Analysis</p>
                    <p className="text-sm text-muted-foreground">AI predicts health issues before they occur</p>
                  </div>
                </div>
              </Card>

              <Card className="p-4 bg-[var(--gradient-card)]">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-cyber-blue/20 rounded">
                    <Activity className="h-5 w-5 text-cyber-blue" />
                  </div>
                  <div>
                    <p className="font-medium">Real-time Anomaly Detection</p>
                    <p className="text-sm text-muted-foreground">Instant alerts for unusual patterns</p>
                  </div>
                </div>
              </Card>

              <Card className="p-4 bg-[var(--gradient-card)]">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-cyber-purple/20 rounded">
                    <Brain className="h-5 w-5 text-cyber-purple" />
                  </div>
                  <div>
                    <p className="font-medium">Emergency Context Analysis</p>
                    <p className="text-sm text-muted-foreground">AI understands emergency situations</p>
                  </div>
                </div>
              </Card>

              <Card className="p-4 bg-[var(--gradient-card)]">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-cyber-orange/20 rounded">
                    <Zap className="h-5 w-5 text-cyber-orange" />
                  </div>
                  <div>
                    <p className="font-medium">Adaptive Response System</p>
                    <p className="text-sm text-muted-foreground">Response adapts to situation severity</p>
                  </div>
                </div>
              </Card>
            </div>

            {/* AI Statistics */}
            <Card className="p-4 bg-[var(--gradient-card)]">
              <h3 className="font-medium mb-3">AI Performance (24h)</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-cyber-green">1,247</p>
                  <p className="text-xs text-muted-foreground">Health Scans</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-cyber-blue">0</p>
                  <p className="text-xs text-muted-foreground">Emergencies</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-cyber-purple">98.7%</p>
                  <p className="text-xs text-muted-foreground">Accuracy</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-cyber-orange">24/7</p>
                  <p className="text-xs text-muted-foreground">Protection</p>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};