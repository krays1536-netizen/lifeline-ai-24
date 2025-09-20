import { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Watch, 
  Heart, 
  Activity, 
  Smartphone, 
  Bluetooth,
  Battery,
  Wifi,
  AlertTriangle,
  CheckCircle,
  Zap,
  Target,
  Settings
} from "lucide-react";
import { cn } from "@/lib/utils";

interface WatchData {
  heartRate: number;
  spO2: number;
  steps: number;
  battery: number;
  isConnected: boolean;
  sosActive: boolean;
  lastSync: Date;
  fallDetected: boolean;
  location: { lat: number; lng: number };
}

interface FuturisticSmartwatchHubProps {
  healthData: {
    heartRate: number;
    spO2: number;
    temperature: number;
  };
  onFallDetected: () => void;
  onSOSTriggered: () => void;
}

export const FuturisticSmartwatchHub = ({ 
  healthData, 
  onFallDetected, 
  onSOSTriggered 
}: FuturisticSmartwatchHubProps) => {
  const [watchData, setWatchData] = useState<WatchData>({
    heartRate: healthData.heartRate || 72,
    spO2: healthData.spO2 || 98,
    steps: 8247,
    battery: 78,
    isConnected: true,
    sosActive: false,
    lastSync: new Date(),
    fallDetected: false,
    location: { lat: 29.3759, lng: 47.9774 }
  });

  const [isShaking, setIsShaking] = useState(false);
  const [watchScreen, setWatchScreen] = useState<"home" | "health" | "sos" | "settings">("home");
  const [fallCountdown, setFallCountdown] = useState(0);

  // Simulate device shake detection
  useEffect(() => {
    let shakeThreshold = 15;
    let lastUpdate = Date.now();
    let lastX = 0, lastY = 0, lastZ = 0;

    const handleMotion = (event: DeviceMotionEvent) => {
      const { accelerationIncludingGravity } = event;
      if (!accelerationIncludingGravity) return;

      const { x = 0, y = 0, z = 0 } = accelerationIncludingGravity;
      const now = Date.now();

      if (now - lastUpdate > 100) {
        const deltaX = Math.abs(x - lastX);
        const deltaY = Math.abs(y - lastY);
        const deltaZ = Math.abs(z - lastZ);
        
        const acceleration = deltaX + deltaY + deltaZ;
        
        if (acceleration > shakeThreshold) {
          setIsShaking(true);
          simulateFallDetection();
          setTimeout(() => setIsShaking(false), 1000);
        }
        
        lastX = x;
        lastY = y;
        lastZ = z;
        lastUpdate = now;
      }
    };

    if (typeof DeviceMotionEvent !== 'undefined') {
      window.addEventListener('devicemotion', handleMotion);
      return () => window.removeEventListener('devicemotion', handleMotion);
    }
  }, []);

  const simulateFallDetection = useCallback(() => {
    setWatchData(prev => ({ ...prev, fallDetected: true }));
    setFallCountdown(10);
    
    const countdown = setInterval(() => {
      setFallCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdown);
          onFallDetected();
          setWatchData(prev => ({ ...prev, sosActive: true }));
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [onFallDetected]);

  const cancelFallDetection = () => {
    setFallCountdown(0);
    setWatchData(prev => ({ ...prev, fallDetected: false }));
  };

  const triggerManualSOS = () => {
    setWatchData(prev => ({ ...prev, sosActive: true }));
    onSOSTriggered();
  };

  // Sync health data from main app
  useEffect(() => {
    setWatchData(prev => ({
      ...prev,
      heartRate: healthData.heartRate || prev.heartRate,
      spO2: healthData.spO2 || prev.spO2,
      lastSync: new Date()
    }));
  }, [healthData]);

  // Simulate realistic watch data updates
  useEffect(() => {
    const interval = setInterval(() => {
      setWatchData(prev => ({
        ...prev,
        steps: prev.steps + Math.floor(Math.random() * 5),
        battery: Math.max(0, prev.battery - (Math.random() < 0.1 ? 1 : 0)),
        heartRate: Math.max(50, Math.min(120, prev.heartRate + Math.floor(Math.random() * 6 - 3))),
        spO2: Math.max(90, Math.min(100, prev.spO2 + Math.floor(Math.random() * 3 - 1))),
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getHeartRateColor = (hr: number) => {
    if (hr > 120 || hr < 50) return "text-cyber-red";
    if (hr > 100 || hr < 60) return "text-cyber-orange";
    return "text-cyber-green";
  };

  const getSpO2Color = (spo2: number) => {
    if (spo2 < 90) return "text-cyber-red";
    if (spo2 < 95) return "text-cyber-orange";
    return "text-cyber-green";
  };

  const renderWatchScreen = () => {
    switch (watchScreen) {
      case "health":
        return (
          <div className="space-y-3">
            <div className="text-center">
              <Heart className={cn("h-8 w-8 mx-auto mb-2 animate-pulse-heartbeat", getHeartRateColor(watchData.heartRate))} />
              <div className={cn("text-2xl font-bold", getHeartRateColor(watchData.heartRate))}>
                {watchData.heartRate}
              </div>
              <div className="text-xs text-muted-foreground">BPM</div>
            </div>
            <div className="flex justify-between text-sm">
              <div>
                <div className={cn("font-bold", getSpO2Color(watchData.spO2))}>SpO₂: {watchData.spO2}%</div>
                <div className="text-muted-foreground">Steps: {watchData.steps.toLocaleString()}</div>
              </div>
            </div>
          </div>
        );
      
      case "sos":
        return (
          <div className="text-center space-y-3">
            <AlertTriangle className="h-8 w-8 mx-auto text-cyber-red animate-pulse" />
            <div className="text-sm font-bold text-cyber-red">EMERGENCY</div>
            <Button
              onClick={triggerManualSOS}
              className="w-full bg-cyber-red text-white font-bold text-xs py-2"
              disabled={watchData.sosActive}
            >
              {watchData.sosActive ? "SOS ACTIVE" : "TRIGGER SOS"}
            </Button>
          </div>
        );

      case "settings":
        return (
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span>Battery</span>
              <span className="font-bold">{watchData.battery}%</span>
            </div>
            <Progress value={watchData.battery} className="h-1" />
            <div className="flex justify-between items-center text-sm">
              <span>Connection</span>
              <div className="flex items-center gap-1">
                <div className={cn("w-2 h-2 rounded-full", watchData.isConnected ? "bg-cyber-green" : "bg-cyber-red")}></div>
                <span className="text-xs">{watchData.isConnected ? "Connected" : "Disconnected"}</span>
              </div>
            </div>
            <div className="text-xs text-muted-foreground">
              Last sync: {watchData.lastSync.toLocaleTimeString()}
            </div>
          </div>
        );

      default: // home
        return (
          <div className="space-y-2">
            <div className="text-center">
              <div className="text-lg font-bold">{new Date().toLocaleTimeString().slice(0, -3)}</div>
              <div className="text-xs text-muted-foreground">{new Date().toLocaleDateString()}</div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-1">
                <Heart className="h-3 w-3 text-cyber-red" />
                <span>{watchData.heartRate}</span>
              </div>
              <div className="flex items-center gap-1">
                <Activity className="h-3 w-3 text-cyber-blue" />
                <span>{watchData.spO2}%</span>
              </div>
              <div className="flex items-center gap-1">
                <Target className="h-3 w-3 text-cyber-green" />
                <span>{watchData.steps}</span>
              </div>
              <div className="flex items-center gap-1">
                <Battery className="h-3 w-3 text-cyber-orange" />
                <span>{watchData.battery}%</span>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <Card className="p-6 bg-[var(--gradient-card)] border-2 border-cyber-blue/40 font-poppins">
      <div className="flex items-center gap-3 mb-4">
        <Watch className="h-6 w-6 text-cyber-blue animate-pulse" />
        <h3 className="text-xl font-bold text-foreground">Smartwatch Hub</h3>
        <Badge variant="outline" className="text-cyber-blue border-cyber-blue/50">
          Digital Twin
        </Badge>
        {isShaking && (
          <Badge className="bg-cyber-orange text-white animate-pulse">
            Shake Detected!
          </Badge>
        )}
      </div>

      {/* Connection Status */}
      <div className="flex items-center justify-between mb-4 p-3 bg-muted/20 rounded-lg">
        <div className="flex items-center gap-2">
          <Bluetooth className={cn("h-4 w-4", watchData.isConnected ? "text-cyber-blue" : "text-muted-foreground")} />
          <span className="text-sm">
            {watchData.isConnected ? "Apple Watch Connected" : "Searching for device..."}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Wifi className="h-3 w-3 text-cyber-blue" />
          <div className={cn("w-2 h-2 rounded-full animate-pulse", 
            watchData.isConnected ? "bg-cyber-green" : "bg-cyber-red")} />
        </div>
      </div>

      {/* Fall Detection Alert */}
      {fallCountdown > 0 && (
        <Card className="p-4 mb-4 border-2 border-cyber-red animate-danger-pulse">
          <div className="text-center">
            <AlertTriangle className="h-6 w-6 mx-auto mb-2 text-cyber-red animate-pulse" />
            <div className="text-lg font-bold text-cyber-red mb-2">
              Fall Detected!
            </div>
            <div className="text-sm text-muted-foreground mb-3">
              Emergency services will be contacted in:
            </div>
            <div className="text-3xl font-bold text-cyber-red mb-4 animate-pulse">
              {fallCountdown}
            </div>
            <div className="flex gap-2">
              <Button onClick={cancelFallDetection} variant="outline" className="flex-1">
                I'm OK
              </Button>
              <Button onClick={triggerManualSOS} className="flex-1 bg-cyber-red text-white">
                Get Help Now
              </Button>
            </div>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Watch Digital Twin */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <Watch className="h-4 w-4" />
            Live Watch Display
          </h4>
          
          {/* Watch Frame */}
          <div className="relative mx-auto w-48 h-60">
            {/* Watch Body */}
            <div className="absolute inset-x-8 inset-y-4 bg-gradient-to-b from-gray-800 to-gray-900 rounded-[2rem] border-4 border-gray-600 shadow-2xl">
              {/* Screen */}
              <div className="absolute inset-2 bg-black rounded-[1.5rem] border border-gray-700 overflow-hidden">
                <div className="absolute inset-1 bg-gradient-to-b from-gray-900 to-black rounded-[1.2rem] p-3">
                  {renderWatchScreen()}
                </div>
              </div>
              
              {/* Digital Crown */}
              <div className="absolute -right-1 top-12 w-2 h-6 bg-gray-600 rounded-l-sm"></div>
              <div className="absolute -right-1 top-20 w-2 h-4 bg-gray-600 rounded-l-sm"></div>
            </div>
            
            {/* Watch Band */}
            <div className="absolute inset-x-0 top-0 h-4 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 rounded-t-full"></div>
            <div className="absolute inset-x-0 bottom-0 h-4 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 rounded-b-full"></div>
            
            {/* Status Indicators */}
            {watchData.sosActive && (
              <div className="absolute -top-2 -right-2 w-4 h-4 bg-cyber-red rounded-full animate-pulse flex items-center justify-center">
                <AlertTriangle className="h-2 w-2 text-white" />
              </div>
            )}
            
            {watchData.isConnected && (
              <div className="absolute -top-2 -left-2 w-4 h-4 bg-cyber-blue rounded-full animate-pulse flex items-center justify-center">
                <Bluetooth className="h-2 w-2 text-white" />
              </div>
            )}
          </div>
        </div>

        {/* Watch Controls & Data */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <Smartphone className="h-4 w-4" />
            Watch Control Panel
          </h4>
          
          {/* Screen Navigation */}
          <div className="grid grid-cols-4 gap-2">
            {[
              { id: "home", label: "Home", icon: Watch },
              { id: "health", label: "Health", icon: Heart },
              { id: "sos", label: "SOS", icon: AlertTriangle },
              { id: "settings", label: "Settings", icon: Settings }
            ].map(({ id, label, icon: Icon }) => (
              <Button
                key={id}
                onClick={() => setWatchScreen(id as any)}
                variant={watchScreen === id ? "default" : "outline"}
                className="flex flex-col items-center p-2 h-auto"
                size="sm"
              >
                <Icon className="h-4 w-4 mb-1" />
                <span className="text-xs">{label}</span>
              </Button>
            ))}
          </div>

          {/* Live Health Data */}
          <Card className="p-3 bg-muted/20">
            <h5 className="text-xs font-medium mb-2">Live Health Data</h5>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs">Heart Rate</span>
                <span className={cn("text-sm font-bold", getHeartRateColor(watchData.heartRate))}>
                  {watchData.heartRate} BPM
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs">SpO₂</span>
                <span className={cn("text-sm font-bold", getSpO2Color(watchData.spO2))}>
                  {watchData.spO2}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs">Steps Today</span>
                <span className="text-sm font-bold text-cyber-green">
                  {watchData.steps.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs">Battery</span>
                <div className="flex items-center gap-2">
                  <Progress value={watchData.battery} className="h-1 w-12" />
                  <span className="text-sm font-bold">{watchData.battery}%</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="space-y-2">
            <Button
              onClick={() => {
                setIsShaking(true);
                simulateFallDetection();
                setTimeout(() => setIsShaking(false), 1000);
              }}
              variant="outline"
              className="w-full"
              disabled={fallCountdown > 0}
            >
              <Zap className="h-4 w-4 mr-2" />
              Simulate Fall Detection
            </Button>
            
            <Button
              onClick={triggerManualSOS}
              className="w-full bg-[var(--gradient-danger)] hover:opacity-90"
              disabled={watchData.sosActive}
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              {watchData.sosActive ? "SOS Active" : "Manual SOS"}
            </Button>
          </div>

          {/* Instructions */}
          <div className="text-xs text-muted-foreground p-2 bg-muted/10 rounded">
            💡 <strong>Tip:</strong> Shake your phone/device to simulate fall detection, or use the simulate button above.
          </div>
        </div>
      </div>
    </Card>
  );
};