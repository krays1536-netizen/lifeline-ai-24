import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { 
  Watch, 
  Heart, 
  Activity, 
  Zap, 
  Shield, 
  Brain, 
  Thermometer,
  Droplets,
  Battery,
  Wifi,
  Bluetooth,
  MapPin,
  Camera,
  Mic,
  Bell,
  Sun,
  Moon,
  Timer,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Smartphone,
  Headphones,
  Settings,
  Radio,
  Satellite,
  Radar,
  Signal,
  Waves,
  Eye,
  Fingerprint,
  Wind,
  CloudRain,
  Navigation,
  Users,
  MessageSquare,
  ScanLine
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AdvancedWatchData {
  // Core Vitals
  heartRate: number;
  heartRateVariability: number;
  spO2: number;
  temperature: number;
  bloodPressure: { systolic: number; diastolic: number };
  respiratoryRate: number;
  
  // Activity & Fitness
  steps: number;
  calories: number;
  activeMinutes: number;
  distance: number;
  floorsClimbed: number;
  
  // Sleep & Recovery
  sleepScore: number;
  recoveryScore: number;
  stressLevel: number;
  
  // Environmental
  altitude: number;
  airQuality: number;
  uvIndex: number;
  temperature_ambient: number;
  humidity: number;
  
  // System
  batteryLevel: number;
  isConnected: boolean;
  hasGPS: boolean;
  has5G: boolean;
  emergencyMode: boolean;
  
  // Advanced Features
  ecgReading: number[];
  fallDetectionActive: boolean;
  voiceCommandActive: boolean;
  witnessRecordingActive: boolean;
  medicalAlerts: string[];
  locationSharing: boolean;
  doctorConnected: boolean;
}

interface SuperEnhancedWatchHubProps {
  vitals?: {
    heartRate: number;
    spO2: number;
    temperature: number;
  };
  onEmergencyTrigger?: () => void;
  onWitnessCamActivate?: () => void;
  onDoctorConnect?: () => void;
}

export const SuperEnhancedWatchHub = ({ 
  vitals,
  onEmergencyTrigger,
  onWitnessCamActivate,
  onDoctorConnect
}: SuperEnhancedWatchHubProps) => {
  const { toast } = useToast();
  const [watchData, setWatchData] = useState<AdvancedWatchData>({
    heartRate: vitals?.heartRate || 72,
    heartRateVariability: 45,
    spO2: vitals?.spO2 || 98,
    temperature: vitals?.temperature || 98.6,
    bloodPressure: { systolic: 120, diastolic: 80 },
    respiratoryRate: 16,
    steps: 8432,
    calories: 2100,
    activeMinutes: 67,
    distance: 3.2,
    floorsClimbed: 12,
    sleepScore: 85,
    recoveryScore: 78,
    stressLevel: 25,
    altitude: 45,
    airQuality: 78,
    uvIndex: 6,
    temperature_ambient: 24,
    humidity: 65,
    batteryLevel: 78,
    isConnected: true,
    hasGPS: true,
    has5G: true,
    emergencyMode: false,
    ecgReading: [0.2, 0.8, -0.3, 0.1, 0.9, -0.2, 0.4],
    fallDetectionActive: true,
    voiceCommandActive: true,
    witnessRecordingActive: false,
    medicalAlerts: [],
    locationSharing: false,
    doctorConnected: false
  });

  const [activeFeature, setActiveFeature] = useState("vitals");
  const [isScanning, setIsScanning] = useState(false);
  const [emergencyCountdown, setEmergencyCountdown] = useState(0);
  const [realtimeMode, setRealtimeMode] = useState(false);

  // Advanced scanning simulation
  const performAdvancedScan = useCallback(async () => {
    setIsScanning(true);
    toast({
      title: "🔄 Advanced Health Scan Started",
      description: "Performing comprehensive biometric analysis...",
    });

    // Simulate advanced scanning over 5 seconds
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Update readings progressively
      setWatchData(prev => ({
        ...prev,
        heartRate: prev.heartRate + (Math.random() - 0.5) * 4,
        spO2: Math.max(95, Math.min(100, prev.spO2 + (Math.random() - 0.5) * 2)),
        temperature: prev.temperature + (Math.random() - 0.5) * 0.5,
        bloodPressure: {
          systolic: Math.max(100, Math.min(140, prev.bloodPressure.systolic + (Math.random() - 0.5) * 6)),
          diastolic: Math.max(60, Math.min(90, prev.bloodPressure.diastolic + (Math.random() - 0.5) * 4))
        },
        stressLevel: Math.max(0, Math.min(100, prev.stressLevel + (Math.random() - 0.5) * 10)),
        recoveryScore: Math.max(0, Math.min(100, prev.recoveryScore + (Math.random() - 0.5) * 5))
      }));
    }

    setIsScanning(false);
    toast({
      title: "✅ Advanced Scan Complete",
      description: "All biometric readings updated successfully",
    });
  }, [toast]);

  // Emergency SOS countdown
  const triggerEmergencySOS = useCallback(() => {
    setEmergencyCountdown(5);
    const countdown = setInterval(() => {
      setEmergencyCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdown);
          setWatchData(prev => ({ ...prev, emergencyMode: true, witnessRecordingActive: true }));
          onEmergencyTrigger?.();
          onWitnessCamActivate?.();
          toast({
            title: "🚨 EMERGENCY SOS ACTIVATED",
            description: "Emergency services contacted. Witness cam recording started.",
            variant: "destructive"
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    toast({
      title: "⚠️ Emergency SOS Countdown",
      description: "Press cancel to stop, or wait 5 seconds to activate",
      variant: "destructive"
    });
  }, [onEmergencyTrigger, onWitnessCamActivate, toast]);

  const cancelEmergency = useCallback(() => {
    setEmergencyCountdown(0);
    toast({
      title: "Emergency SOS Cancelled",
      description: "Emergency activation has been stopped",
    });
  }, [toast]);

  // Real-time monitoring toggle
  useEffect(() => {
    if (realtimeMode) {
      const interval = setInterval(() => {
        setWatchData(prev => ({
          ...prev,
          heartRate: Math.max(50, Math.min(180, prev.heartRate + (Math.random() - 0.5) * 2)),
          spO2: Math.max(95, Math.min(100, prev.spO2 + (Math.random() - 0.5))),
          temperature: prev.temperature + (Math.random() - 0.5) * 0.1
        }));
      }, 2000);

      return () => clearInterval(interval);
    }
  }, [realtimeMode]);

  const getVitalStatus = (type: string, value: number) => {
    switch (type) {
      case 'heartRate':
        if (value < 60 || value > 100) return 'warning';
        return 'normal';
      case 'spO2':
        if (value < 95) return 'critical';
        if (value < 98) return 'warning';
        return 'normal';
      case 'temperature':
        if (value > 100.4 || value < 97) return 'warning';
        return 'normal';
      case 'bloodPressure':
        if (value > 140 || value < 90) return 'warning';
        return 'normal';
      default:
        return 'normal';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critical': return 'text-red-400 border-red-500';
      case 'warning': return 'text-yellow-400 border-yellow-500';
      case 'normal': return 'text-green-400 border-green-500';
      default: return 'text-gray-400 border-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Emergency SOS Overlay */}
      {emergencyCountdown > 0 && (
        <Card className="border-2 border-red-500 bg-red-500/10 animate-pulse">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-400 mb-2">
              🚨 EMERGENCY SOS ACTIVATING IN {emergencyCountdown}
            </div>
            <Button 
              onClick={cancelEmergency}
              variant="destructive"
              className="bg-red-600 hover:bg-red-700"
            >
              CANCEL EMERGENCY
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Main Watch Display */}
      <Card className="bg-black/95 border-2 border-blue-500/30 overflow-hidden">
        <CardContent className="p-0">
          {/* Watch Header */}
          <div className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 p-4 border-b border-blue-500/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Watch className={cn(
                    "w-8 h-8",
                    watchData.isConnected ? "text-green-400" : "text-red-400"
                  )} />
                  {watchData.emergencyMode && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping" />
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">LifeLine Watch Pro</h3>
                  <div className="flex items-center gap-2 text-sm">
                    <Badge variant={watchData.isConnected ? "default" : "destructive"} className="text-xs">
                      {watchData.isConnected ? "Connected" : "Disconnected"}
                    </Badge>
                    {watchData.emergencyMode && (
                      <Badge variant="destructive" className="animate-pulse text-xs">
                        🚨 EMERGENCY MODE
                      </Badge>
                    )}
                    {watchData.has5G && (
                      <Badge variant="outline" className="text-green-400 border-green-400 text-xs">
                        5G
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => setRealtimeMode(!realtimeMode)}
                  variant="outline"
                  size="sm"
                  className={cn(
                    "border-blue-500/50",
                    realtimeMode ? "bg-blue-500/30 text-blue-300" : "text-blue-300"
                  )}
                >
                  <Activity className="w-4 h-4 mr-1" />
                  {realtimeMode ? "Real-time ON" : "Real-time OFF"}
                </Button>
                <div className="flex items-center gap-1 text-white">
                  <Battery className={cn(
                    "w-5 h-5",
                    watchData.batteryLevel > 50 ? "text-green-400" : 
                    watchData.batteryLevel > 20 ? "text-yellow-400" : "text-red-400"
                  )} />
                  <span className="text-sm">{watchData.batteryLevel}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Tabs */}
          <Tabs value={activeFeature} onValueChange={setActiveFeature} className="w-full">
            <TabsList className="w-full bg-black/50 border-b border-blue-500/20 rounded-none justify-start overflow-x-auto">
              <TabsTrigger value="vitals" className="flex items-center gap-2">
                <Heart className="w-4 h-4" />
                Vitals
              </TabsTrigger>
              <TabsTrigger value="activity" className="flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Activity
              </TabsTrigger>
              <TabsTrigger value="environment" className="flex items-center gap-2">
                <Wind className="w-4 h-4" />
                Environment
              </TabsTrigger>
              <TabsTrigger value="emergency" className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Emergency
              </TabsTrigger>
              <TabsTrigger value="advanced" className="flex items-center gap-2">
                <Brain className="w-4 h-4" />
                Advanced
              </TabsTrigger>
            </TabsList>

            {/* Vitals Tab */}
            <TabsContent value="vitals" className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <VitalCard
                  icon={<Heart className="w-6 h-6" />}
                  title="Heart Rate"
                  value={`${Math.round(watchData.heartRate)}`}
                  unit="BPM"
                  status={getVitalStatus('heartRate', watchData.heartRate)}
                  trend={"+2 BPM vs avg"}
                />
                <VitalCard
                  icon={<Activity className="w-6 h-6" />}
                  title="Blood Oxygen"
                  value={`${Math.round(watchData.spO2)}`}
                  unit="%"
                  status={getVitalStatus('spO2', watchData.spO2)}
                  trend="Normal range"
                />
                <VitalCard
                  icon={<Thermometer className="w-6 h-6" />}
                  title="Temperature"
                  value={`${watchData.temperature.toFixed(1)}`}
                  unit="°F"
                  status={getVitalStatus('temperature', watchData.temperature)}
                  trend="Stable"
                />
                <VitalCard
                  icon={<TrendingUp className="w-6 h-6" />}
                  title="Blood Pressure"
                  value={`${Math.round(watchData.bloodPressure.systolic)}/${Math.round(watchData.bloodPressure.diastolic)}`}
                  unit="mmHg"
                  status={getVitalStatus('bloodPressure', watchData.bloodPressure.systolic)}
                  trend="Optimal"
                />
                <VitalCard
                  icon={<Wind className="w-6 h-6" />}
                  title="Respiratory Rate"
                  value={`${Math.round(watchData.respiratoryRate)}`}
                  unit="BPM"
                  status="normal"
                  trend="Regular"
                />
                <VitalCard
                  icon={<Brain className="w-6 h-6" />}
                  title="HRV"
                  value={`${Math.round(watchData.heartRateVariability)}`}
                  unit="ms"
                  status="normal"
                  trend="Good recovery"
                />
              </div>

              <div className="flex gap-3">
                <Button 
                  onClick={performAdvancedScan}
                  disabled={isScanning}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isScanning ? (
                    <>
                      <ScanLine className="w-4 h-4 mr-2 animate-spin" />
                      Scanning...
                    </>
                  ) : (
                    <>
                      <Radar className="w-4 h-4 mr-2" />
                      Advanced Scan
                    </>
                  )}
                </Button>
                <Button 
                  onClick={onDoctorConnect}
                  variant="outline"
                  className="border-green-500/50 text-green-300 hover:bg-green-500/20"
                >
                  <Users className="w-4 h-4 mr-2" />
                  Connect Doctor
                </Button>
              </div>
            </TabsContent>

            {/* Activity Tab */}
            <TabsContent value="activity" className="p-6 space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-800/50 rounded-lg p-4 border border-blue-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="w-5 h-5 text-blue-400" />
                    <span className="text-sm text-gray-300">Steps</span>
                  </div>
                  <div className="text-2xl font-bold text-white">{watchData.steps.toLocaleString()}</div>
                  <Progress value={(watchData.steps / 10000) * 100} className="mt-2" />
                </div>

                <div className="bg-gray-800/50 rounded-lg p-4 border border-orange-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-5 h-5 text-orange-400" />
                    <span className="text-sm text-gray-300">Calories</span>
                  </div>
                  <div className="text-2xl font-bold text-white">{watchData.calories}</div>
                  <Progress value={(watchData.calories / 2500) * 100} className="mt-2" />
                </div>

                <div className="bg-gray-800/50 rounded-lg p-4 border border-green-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Timer className="w-5 h-5 text-green-400" />
                    <span className="text-sm text-gray-300">Active Min</span>
                  </div>
                  <div className="text-2xl font-bold text-white">{watchData.activeMinutes}</div>
                  <Progress value={(watchData.activeMinutes / 150) * 100} className="mt-2" />
                </div>

                <div className="bg-gray-800/50 rounded-lg p-4 border border-purple-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Navigation className="w-5 h-5 text-purple-400" />
                    <span className="text-sm text-gray-300">Distance</span>
                  </div>
                  <div className="text-2xl font-bold text-white">{watchData.distance.toFixed(1)}</div>
                  <div className="text-xs text-gray-500">miles</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-800/50 rounded-lg p-4 border border-indigo-500/20">
                  <h4 className="text-lg font-semibold text-indigo-400 mb-2">Sleep Score</h4>
                  <div className="text-3xl font-bold text-white mb-2">{watchData.sleepScore}/100</div>
                  <Progress value={watchData.sleepScore} className="mb-2" />
                  <p className="text-sm text-gray-400">Good sleep quality</p>
                </div>

                <div className="bg-gray-800/50 rounded-lg p-4 border border-cyan-500/20">
                  <h4 className="text-lg font-semibold text-cyan-400 mb-2">Recovery</h4>
                  <div className="text-3xl font-bold text-white mb-2">{watchData.recoveryScore}/100</div>
                  <Progress value={watchData.recoveryScore} className="mb-2" />
                  <p className="text-sm text-gray-400">Ready for training</p>
                </div>

                <div className="bg-gray-800/50 rounded-lg p-4 border border-yellow-500/20">
                  <h4 className="text-lg font-semibold text-yellow-400 mb-2">Stress Level</h4>
                  <div className="text-3xl font-bold text-white mb-2">{watchData.stressLevel}/100</div>
                  <Progress value={watchData.stressLevel} className="mb-2" />
                  <p className="text-sm text-gray-400">Low stress</p>
                </div>
              </div>
            </TabsContent>

            {/* Environment Tab */}
            <TabsContent value="environment" className="p-6 space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <EnvironmentCard
                  icon={<MapPin className="w-5 h-5" />}
                  title="Altitude"
                  value={`${watchData.altitude}`}
                  unit="ft"
                  color="text-blue-400"
                />
                <EnvironmentCard
                  icon={<Waves className="w-5 h-5" />}
                  title="Air Quality"
                  value={`${watchData.airQuality}`}
                  unit="AQI"
                  color="text-green-400"
                />
                <EnvironmentCard
                  icon={<Sun className="w-5 h-5" />}
                  title="UV Index"
                  value={`${watchData.uvIndex}`}
                  unit="UV"
                  color="text-yellow-400"
                />
                <EnvironmentCard
                  icon={<Thermometer className="w-5 h-5" />}
                  title="Ambient Temp"
                  value={`${watchData.temperature_ambient}`}
                  unit="°C"
                  color="text-orange-400"
                />
                <EnvironmentCard
                  icon={<Droplets className="w-5 h-5" />}
                  title="Humidity"
                  value={`${watchData.humidity}`}
                  unit="%"
                  color="text-cyan-400"
                />
                <EnvironmentCard
                  icon={<Signal className="w-5 h-5" />}
                  title="GPS Signal"
                  value="Strong"
                  unit=""
                  color="text-green-400"
                />
              </div>
            </TabsContent>

            {/* Emergency Tab */}
            <TabsContent value="emergency" className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-red-900/20 border-red-500/30">
                  <CardContent className="p-4">
                    <h4 className="text-lg font-semibold text-red-400 mb-4">Emergency SOS</h4>
                    <Button
                      onClick={triggerEmergencySOS}
                      disabled={emergencyCountdown > 0}
                      className="w-full bg-red-600 hover:bg-red-700 text-white mb-3"
                      size="lg"
                    >
                      <Shield className="w-5 h-5 mr-2" />
                      ACTIVATE EMERGENCY SOS
                    </Button>
                    <p className="text-sm text-gray-400">
                      Press and hold to activate emergency services and witness recording
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-blue-900/20 border-blue-500/30">
                  <CardContent className="p-4">
                    <h4 className="text-lg font-semibold text-blue-400 mb-4">Witness Cam</h4>
                    <Button
                      onClick={onWitnessCamActivate}
                      variant="outline"
                      className="w-full border-blue-500/50 text-blue-300 hover:bg-blue-500/20 mb-3"
                      size="lg"
                    >
                      <Camera className="w-5 h-5 mr-2" />
                      {watchData.witnessRecordingActive ? "RECORDING ACTIVE" : "START WITNESS CAM"}
                    </Button>
                    <p className="text-sm text-gray-400">
                      Activate pre-buffer witness recording system
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-3">
                <h4 className="text-lg font-semibold text-white">Emergency Features Status</h4>
                <div className="grid grid-cols-2 gap-3">
                  <StatusIndicator 
                    label="Fall Detection" 
                    active={watchData.fallDetectionActive}
                    icon={<Shield className="w-4 h-4" />}
                  />
                  <StatusIndicator 
                    label="Voice Commands" 
                    active={watchData.voiceCommandActive}
                    icon={<Mic className="w-4 h-4" />}
                  />
                  <StatusIndicator 
                    label="Location Sharing" 
                    active={watchData.locationSharing}
                    icon={<MapPin className="w-4 h-4" />}
                  />
                  <StatusIndicator 
                    label="Doctor Connected" 
                    active={watchData.doctorConnected}
                    icon={<Users className="w-4 h-4" />}
                  />
                </div>
              </div>
            </TabsContent>

            {/* Advanced Tab */}
            <TabsContent value="advanced" className="p-6 space-y-4">
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-white">Advanced Biometrics</h4>
                
                <Card className="bg-gray-800/50 border-gray-600/30">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-white font-medium">ECG Reading</span>
                      <Badge variant="outline" className="text-green-400 border-green-400">
                        Normal Rhythm
                      </Badge>
                    </div>
                    <div className="h-20 bg-black/50 rounded-lg flex items-center justify-center border border-green-500/30">
                      <div className="flex items-center gap-1">
                        {watchData.ecgReading.map((value, index) => (
                          <div
                            key={index}
                            className="w-2 bg-green-400 rounded-full"
                            style={{ height: `${Math.abs(value) * 20 + 10}px` }}
                          />
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-2 gap-4">
                  <AdvancedMetric
                    title="Heart Rate Variability"
                    value={`${watchData.heartRateVariability}ms`}
                    description="Autonomic nervous system balance"
                    status="good"
                  />
                  <AdvancedMetric
                    title="Respiratory Rate"
                    value={`${watchData.respiratoryRate} BPM`}
                    description="Breathing pattern analysis"
                    status="normal"
                  />
                </div>

                <div className="space-y-3">
                  <h5 className="text-white font-medium">System Connectivity</h5>
                  <div className="grid grid-cols-3 gap-3">
                    <ConnectionStatus icon={<Wifi />} label="WiFi" connected={true} />
                    <ConnectionStatus icon={<Bluetooth />} label="Bluetooth" connected={true} />
                    <ConnectionStatus icon={<Satellite />} label="GPS" connected={watchData.hasGPS} />
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

// Helper Components
const VitalCard = ({ icon, title, value, unit, status, trend }: {
  icon: React.ReactNode;
  title: string;
  value: string;
  unit: string;
  status: string;
  trend: string;
}) => (
  <Card className={cn("bg-gray-800/50 border", {
    "border-green-500/30": status === 'normal',
    "border-yellow-500/30": status === 'warning',
    "border-red-500/30": status === 'critical'
  })}>
    <CardContent className="p-4">
      <div className="flex items-center gap-2 mb-2">
        <div className={cn("", {
          "text-green-400": status === 'normal',
          "text-yellow-400": status === 'warning',
          "text-red-400": status === 'critical'
        })}>
          {icon}
        </div>
        <span className="text-sm text-gray-300">{title}</span>
      </div>
      <div className="text-2xl font-bold text-white">
        {value} <span className="text-sm text-gray-400">{unit}</span>
      </div>
      <p className="text-xs text-gray-500 mt-1">{trend}</p>
    </CardContent>
  </Card>
);

const EnvironmentCard = ({ icon, title, value, unit, color }: {
  icon: React.ReactNode;
  title: string;
  value: string;
  unit: string;
  color: string;
}) => (
  <Card className="bg-gray-800/50 border-gray-600/30">
    <CardContent className="p-4">
      <div className="flex items-center gap-2 mb-2">
        <div className={color}>{icon}</div>
        <span className="text-sm text-gray-300">{title}</span>
      </div>
      <div className="text-xl font-bold text-white">
        {value} <span className="text-sm text-gray-400">{unit}</span>
      </div>
    </CardContent>
  </Card>
);

const StatusIndicator = ({ label, active, icon }: {
  label: string;
  active: boolean;
  icon: React.ReactNode;
}) => (
  <div className="flex items-center gap-2 p-2 bg-gray-800/50 rounded-lg border border-gray-600/30">
    <div className={active ? "text-green-400" : "text-gray-500"}>
      {icon}
    </div>
    <span className="text-sm text-white">{label}</span>
    <Badge variant={active ? "default" : "secondary"} className="ml-auto text-xs">
      {active ? "ON" : "OFF"}
    </Badge>
  </div>
);

const AdvancedMetric = ({ title, value, description, status }: {
  title: string;
  value: string;
  description: string;
  status: string;
}) => (
  <Card className="bg-gray-800/50 border-gray-600/30">
    <CardContent className="p-4">
      <h5 className="text-white font-medium mb-1">{title}</h5>
      <div className="text-xl font-bold text-white mb-1">{value}</div>
      <p className="text-xs text-gray-400">{description}</p>
      <Badge 
        variant="outline" 
        className={cn("mt-2 text-xs", {
          "text-green-400 border-green-400": status === 'good' || status === 'normal',
          "text-yellow-400 border-yellow-400": status === 'warning',
          "text-red-400 border-red-400": status === 'critical'
        })}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    </CardContent>
  </Card>
);

const ConnectionStatus = ({ icon, label, connected }: {
  icon: React.ReactNode;
  label: string;
  connected: boolean;
}) => (
  <div className="flex items-center gap-2 p-2 bg-gray-800/50 rounded-lg border border-gray-600/30">
    <div className={connected ? "text-green-400" : "text-red-400"}>
      {icon}
    </div>
    <span className="text-sm text-white">{label}</span>
    <div className={cn("w-2 h-2 rounded-full ml-auto", {
      "bg-green-400": connected,
      "bg-red-400": !connected
    })} />
  </div>
);