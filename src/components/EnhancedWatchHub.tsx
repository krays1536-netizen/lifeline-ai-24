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
  Settings
} from "lucide-react";
import { cn } from "@/lib/utils";

interface WatchData {
  heartRate: number;
  spO2: number;
  temperature: number;
  steps: number;
  calories: number;
  batteryLevel: number;
  isConnected: boolean;
  hasGPS: boolean;
  emergencyMode: boolean;
}

interface EnhancedWatchHubProps {
  vitals?: {
    heartRate: number;
    spO2: number;
    temperature: number;
  };
  onEmergencyTrigger?: () => void;
  onVitalsUpdate?: (vitals: any) => void;
}

export const EnhancedWatchHub = ({ 
  vitals,
  onEmergencyTrigger,
  onVitalsUpdate 
}: EnhancedWatchHubProps) => {
  const { toast } = useToast();
  
  const [watchData, setWatchData] = useState<WatchData>({
    heartRate: vitals?.heartRate || 72,
    spO2: vitals?.spO2 || 98,
    temperature: vitals?.temperature || 36.5,
    steps: 8247,
    calories: 342,
    batteryLevel: 85,
    isConnected: true,
    hasGPS: true,
    emergencyMode: false
  });

  const [selectedFeature, setSelectedFeature] = useState<string | null>(null);
  const [realTimeMode, setRealTimeMode] = useState(false);
  const [guardianMode, setGuardianMode] = useState(false);
  const [sleepMode, setSleepMode] = useState(false);

  // Simulate real-time data updates
  useEffect(() => {
    if (!realTimeMode) return;

    const interval = setInterval(() => {
      setWatchData(prev => ({
        ...prev,
        heartRate: Math.max(60, Math.min(100, prev.heartRate + Math.floor(Math.random() * 6 - 3))),
        spO2: Math.max(95, Math.min(100, prev.spO2 + Math.floor(Math.random() * 2 - 1))),
        temperature: Math.max(36, Math.min(38, prev.temperature + (Math.random() * 0.2 - 0.1))),
        steps: prev.steps + Math.floor(Math.random() * 5),
        calories: prev.calories + Math.floor(Math.random() * 2),
        batteryLevel: Math.max(10, prev.batteryLevel - (Math.random() * 0.1))
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, [realTimeMode]);

  // Update parent component with vitals
  useEffect(() => {
    onVitalsUpdate?.({
      heartRate: watchData.heartRate,
      spO2: watchData.spO2,
      temperature: watchData.temperature,
      timestamp: new Date()
    });
  }, [watchData.heartRate, watchData.spO2, watchData.temperature, onVitalsUpdate]);

  const activateFeature = useCallback((feature: string) => {
    setSelectedFeature(feature);
    
    switch (feature) {
      case 'emergency':
        setWatchData(prev => ({ ...prev, emergencyMode: !prev.emergencyMode }));
        if (!watchData.emergencyMode) {
          onEmergencyTrigger?.();
          toast({
            title: "🚨 Emergency Mode Activated",
            description: "Watch is now in emergency monitoring mode",
            variant: "destructive"
          });
        }
        break;
      case 'guardian':
        setGuardianMode(!guardianMode);
        toast({
          title: guardianMode ? "Guardian Mode Disabled" : "🛡️ Guardian Mode Activated",
          description: guardianMode ? "Smart monitoring disabled" : "Advanced AI monitoring enabled",
          variant: guardianMode ? "default" : "destructive"
        });
        break;
      case 'realtime':
        setRealTimeMode(!realTimeMode);
        toast({
          title: realTimeMode ? "Real-time Mode Disabled" : "📊 Real-time Mode Activated",
          description: realTimeMode ? "Data updates paused" : "Live vitals streaming enabled",
          variant: "default"
        });
        break;
      case 'sleep':
        setSleepMode(!sleepMode);
        toast({
          title: sleepMode ? "Sleep Mode Disabled" : "😴 Sleep Mode Activated",
          description: sleepMode ? "Normal monitoring resumed" : "Silent health monitoring enabled",
          variant: "default"
        });
        break;
      default:
        toast({
          title: `${feature} Feature`,
          description: "Feature activated successfully",
          variant: "default"
        });
    }

    setTimeout(() => setSelectedFeature(null), 2000);
  }, [watchData.emergencyMode, guardianMode, realTimeMode, sleepMode, onEmergencyTrigger, toast]);

  const getHealthStatus = () => {
    if (watchData.heartRate > 100 || watchData.spO2 < 95 || watchData.temperature > 37.5) {
      return { status: "warning", color: "text-yellow-500", bgColor: "bg-yellow-500/10" };
    }
    if (watchData.heartRate > 90 || watchData.spO2 < 97 || watchData.temperature > 37) {
      return { status: "elevated", color: "text-orange-500", bgColor: "bg-orange-500/10" };
    }
    return { status: "normal", color: "text-green-500", bgColor: "bg-green-500/10" };
  };

  const healthStatus = getHealthStatus();

  return (
    <div className="space-y-6">
      {/* Watch Display */}
      <Card className="relative overflow-hidden bg-gradient-subtle border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className={cn("p-3 rounded-full", healthStatus.bgColor)}>
                <Watch className={cn("w-8 h-8", healthStatus.color)} />
              </div>
              <div>
                <h2 className="text-2xl font-bold">LifeLine Watch</h2>
                <p className="text-sm text-muted-foreground">
                  Advanced Health Monitoring
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {watchData.isConnected ? (
                <Badge variant="default" className="flex items-center gap-1">
                  <Wifi className="w-3 h-3" />
                  Connected
                </Badge>
              ) : (
                <Badge variant="destructive">Disconnected</Badge>
              )}
              <Badge variant="outline" className="flex items-center gap-1">
                <Battery className="w-3 h-3" />
                {watchData.batteryLevel.toFixed(0)}%
              </Badge>
            </div>
          </div>

          {/* Watch Interface Simulation */}
          <div className="relative mx-auto w-64 h-64 bg-black rounded-full border-8 border-muted shadow-2xl">
            {/* Watch Face */}
            <div className="absolute inset-4 bg-card rounded-full border border-border/50 flex flex-col items-center justify-center text-center">
              <div className="text-3xl font-bold text-primary">
                {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {new Date().toLocaleDateString()}
              </div>
              
              {/* Status Indicators */}
              <div className="mt-4 space-y-1">
                <div className={cn("flex items-center gap-1 text-xs", healthStatus.color)}>
                  <Heart className="w-3 h-3" />
                  <span>{watchData.heartRate} BPM</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-blue-500">
                  <Droplets className="w-3 h-3" />
                  <span>{watchData.spO2}% SpO2</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-orange-500">
                  <Thermometer className="w-3 h-3" />
                  <span>{watchData.temperature.toFixed(1)}°C</span>
                </div>
              </div>

              {/* Mode Indicators */}
              <div className="absolute bottom-2 flex gap-1">
                {watchData.emergencyMode && (
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                )}
                {guardianMode && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                )}
                {realTimeMode && (
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                )}
                {sleepMode && (
                  <div className="w-2 h-2 bg-purple-500 rounded-full" />
                )}
              </div>
            </div>

            {/* Digital Crown */}
            <div className="absolute right-0 top-16 w-4 h-8 bg-muted rounded-l border border-border"></div>
            
            {/* Action Button */}
            <div className="absolute right-0 top-32 w-4 h-6 bg-red-500 rounded-l border border-red-400"></div>
          </div>
        </CardContent>
      </Card>

      {/* Feature Tabs */}
      <Tabs defaultValue="vitals" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="vitals">Vitals</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="apps">Apps</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="vitals" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Card className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <Heart className="w-5 h-5 text-red-500" />
                <span className="font-medium">Heart Rate</span>
              </div>
              <div className="text-2xl font-bold text-red-500">
                {watchData.heartRate} BPM
              </div>
              <Progress value={(watchData.heartRate / 120) * 100} className="mt-2" />
              <p className="text-xs text-muted-foreground mt-1">
                {watchData.heartRate > 100 ? "Elevated" : watchData.heartRate < 60 ? "Low" : "Normal"}
              </p>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <Droplets className="w-5 h-5 text-blue-500" />
                <span className="font-medium">Blood Oxygen</span>
              </div>
              <div className="text-2xl font-bold text-blue-500">
                {watchData.spO2}%
              </div>
              <Progress value={watchData.spO2} className="mt-2" />
              <p className="text-xs text-muted-foreground mt-1">
                {watchData.spO2 < 95 ? "Low" : "Normal"}
              </p>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <Thermometer className="w-5 h-5 text-orange-500" />
                <span className="font-medium">Temperature</span>
              </div>
              <div className="text-2xl font-bold text-orange-500">
                {watchData.temperature.toFixed(1)}°C
              </div>
              <Progress value={(watchData.temperature / 40) * 100} className="mt-2" />
              <p className="text-xs text-muted-foreground mt-1">
                {watchData.temperature > 37.5 ? "Fever" : "Normal"}
              </p>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <Activity className="w-5 h-5 text-green-500" />
                <span className="font-medium">Activity</span>
              </div>
              <div className="text-2xl font-bold text-green-500">
                {watchData.steps.toLocaleString()}
              </div>
              <Progress value={(watchData.steps / 10000) * 100} className="mt-2" />
              <p className="text-xs text-muted-foreground mt-1">
                {watchData.calories} calories burned
              </p>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="features" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Button
              onClick={() => activateFeature('emergency')}
              variant={watchData.emergencyMode ? "destructive" : "outline"}
              className="h-20 flex flex-col items-center gap-2"
            >
              <AlertTriangle className="w-6 h-6" />
              <span className="text-sm">Emergency Mode</span>
            </Button>

            <Button
              onClick={() => activateFeature('guardian')}
              variant={guardianMode ? "default" : "outline"}
              className="h-20 flex flex-col items-center gap-2"
            >
              <Shield className="w-6 h-6" />
              <span className="text-sm">Guardian AI</span>
            </Button>

            <Button
              onClick={() => activateFeature('realtime')}
              variant={realTimeMode ? "default" : "outline"}
              className="h-20 flex flex-col items-center gap-2"
            >
              <TrendingUp className="w-6 h-6" />
              <span className="text-sm">Real-time Mode</span>
            </Button>

            <Button
              onClick={() => activateFeature('sleep')}
              variant={sleepMode ? "default" : "outline"}
              className="h-20 flex flex-col items-center gap-2"
            >
              <Moon className="w-6 h-6" />
              <span className="text-sm">Sleep Mode</span>
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="apps" className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            {[
              { icon: Camera, name: "Camera", description: "Remote photo" },
              { icon: Mic, name: "Voice", description: "Voice notes" },
              { icon: MapPin, name: "Find My", description: "Location sharing" },
              { icon: Bell, name: "Alerts", description: "Smart notifications" },
              { icon: Timer, name: "Timer", description: "Countdown timer" },
              { icon: Headphones, name: "Music", description: "Control playback" },
              { icon: Smartphone, name: "Phone", description: "Call control" },
              { icon: Brain, name: "AI Coach", description: "Health insights" },
              { icon: Sun, name: "Weather", description: "Local forecast" }
            ].map((app, index) => (
              <Button
                key={index}
                variant="outline"
                className="h-20 flex flex-col items-center gap-2 hover:bg-primary/10"
                onClick={() => activateFeature(app.name.toLowerCase())}
              >
                <app.icon className="w-5 h-5" />
                <div className="text-center">
                  <div className="text-xs font-medium">{app.name}</div>
                  <div className="text-xs text-muted-foreground">{app.description}</div>
                </div>
              </Button>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card className="p-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Battery className="w-5 h-5" />
                  <span>Battery Level</span>
                </div>
                <div className="flex items-center gap-2">
                  <Progress value={watchData.batteryLevel} className="w-20" />
                  <span className="text-sm">{watchData.batteryLevel.toFixed(0)}%</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Wifi className="w-5 h-5" />
                  <span>Connection</span>
                </div>
                <Badge variant={watchData.isConnected ? "default" : "destructive"}>
                  {watchData.isConnected ? "Connected" : "Disconnected"}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5" />
                  <span>GPS</span>
                </div>
                <Badge variant={watchData.hasGPS ? "default" : "secondary"}>
                  {watchData.hasGPS ? "Active" : "Inactive"}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Bluetooth className="w-5 h-5" />
                  <span>Bluetooth</span>
                </div>
                <Badge variant="default">Connected</Badge>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};