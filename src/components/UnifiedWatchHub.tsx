import { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Watch, 
  Heart, 
  Activity, 
  Battery,
  Zap,
  Shield,
  Phone,
  MapPin,
  Clock,
  Target,
  TrendingUp,
  Wifi,
  Bluetooth,
  AlertTriangle,
  CheckCircle,
  Calendar,
  Bell,
  Settings,
  QrCode
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface HealthReading {
  heartRate: number;
  spO2: number;
  temperature: number;
  confidence: number;
  timestamp: Date;
}

interface WatchNotification {
  id: string;
  type: "health" | "emergency" | "reminder" | "social";
  title: string;
  message: string;
  timestamp: Date;
  priority: "low" | "medium" | "high" | "critical";
  actionRequired?: boolean;
}

interface UnifiedWatchHubProps {
  healthReadings?: HealthReading;
  onEmergencyTrigger: () => void;
  onQRGenerate?: () => void;
  onIncidentCreate?: (incident: any) => void;
}

export const UnifiedWatchHub = ({ 
  healthReadings,
  onEmergencyTrigger,
  onQRGenerate,
  onIncidentCreate
}: UnifiedWatchHubProps) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [batteryLevel, setBatteryLevel] = useState(85);
  const [isConnected, setIsConnected] = useState(true);
  const [notifications, setNotifications] = useState<WatchNotification[]>([]);
  const [dailyStats, setDailyStats] = useState({
    steps: 8547,
    caloriesBurned: 425,
    activeMinutes: 67,
    floorsClimbed: 12,
    distance: 6.2,
    sleepScore: 82
  });
  const [healthTrends, setHealthTrends] = useState({
    heartRateVariability: 42,
    stressLevel: 28,
    recoveryScore: 76,
    fitnessAge: 25,
    vo2Max: 45,
    restingHeartRate: 62
  });
  const [emergencyContacts, setEmergencyContacts] = useState([
    { name: "Emergency Services", number: "112", type: "emergency" },
    { name: "Mom", number: "+965-9999-1234", type: "family" },
    { name: "Doctor", number: "+965-5555-6789", type: "medical" }
  ]);
  const [sosCountdown, setSosCountdown] = useState(0);
  const [activeWorkout, setActiveWorkout] = useState<{
    type: string;
    duration: number;
    calories: number;
    heartRateZone: string;
  } | null>(null);

  // Real-time health monitoring
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate real watch behavior
      setBatteryLevel(prev => Math.max(10, prev - (Math.random() * 0.1)));
      
      // Generate health notifications
      if (healthReadings) {
        if (healthReadings.heartRate > 120 && !activeWorkout) {
          addNotification({
            type: "health",
            title: "Elevated Heart Rate",
            message: `HR: ${healthReadings.heartRate} BPM - Are you feeling okay?`,
            priority: "medium",
            actionRequired: true
          });
        }
        
        if (healthReadings.spO2 < 90) {
          addNotification({
            type: "emergency",
            title: "Low Oxygen Alert",
            message: `SpO2: ${healthReadings.spO2}% - Seek immediate medical attention`,
            priority: "critical",
            actionRequired: true
          });
        }
      }
      
      // Update daily stats
      setDailyStats(prev => ({
        ...prev,
        steps: prev.steps + Math.floor(Math.random() * 10),
        caloriesBurned: prev.caloriesBurned + Math.floor(Math.random() * 2)
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, [healthReadings, activeWorkout]);

  // SOS Emergency System
  const triggerSOS = useCallback(() => {
    setSosCountdown(10);
    
    const countdownInterval = setInterval(() => {
      setSosCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          onEmergencyTrigger();
          
          // Auto-send location and health data to emergency contacts
          emergencyContacts.forEach(contact => {
            toast({
              title: `📱 SOS Alert Sent to ${contact.name}`,
              description: `Location and health data shared`,
              variant: "destructive"
            });
          });
          
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    toast({
      title: "🚨 SOS ACTIVATED",
      description: "Emergency alert will be sent in 10 seconds. Tap to cancel.",
      variant: "destructive"
    });
  }, [onEmergencyTrigger, emergencyContacts]);

  const cancelSOS = useCallback(() => {
    setSosCountdown(0);
    toast({
      title: "SOS Cancelled",
      description: "Emergency alert has been cancelled",
      variant: "default"
    });
  }, []);

  // Notification management
  const addNotification = useCallback((notif: Omit<WatchNotification, 'id' | 'timestamp'>) => {
    const newNotification: WatchNotification = {
      ...notif,
      id: Date.now().toString(),
      timestamp: new Date()
    };
    
    setNotifications(prev => [newNotification, ...prev.slice(0, 9)]);
    
    // Show toast for critical notifications
    if (notif.priority === "critical") {
      toast({
        title: notif.title,
        description: notif.message,
        variant: "destructive"
      });
    }
  }, []);

  // Workout detection
  const startWorkout = useCallback((type: string) => {
    setActiveWorkout({
      type,
      duration: 0,
      calories: 0,
      heartRateZone: "Zone 2"
    });
    
    toast({
      title: "Workout Started",
      description: `${type} tracking activated`,
      variant: "default"
    });
  }, []);

  const endWorkout = useCallback(() => {
    if (activeWorkout) {
      toast({
        title: "Workout Complete",
        description: `${activeWorkout.type} - ${activeWorkout.duration} minutes`,
        variant: "default"
      });
      setActiveWorkout(null);
    }
  }, [activeWorkout]);

  // Health alerts and recommendations
  const analyzeHealthTrends = useCallback(() => {
    const recommendations = [];
    
    if (healthTrends.stressLevel > 70) {
      recommendations.push("High stress detected - Consider breathing exercises");
    }
    if (healthTrends.recoveryScore < 50) {
      recommendations.push("Poor recovery - Ensure adequate sleep and hydration");
    }
    if (healthReadings?.heartRate && healthReadings.heartRate > 100) {
      recommendations.push("Elevated heart rate - Take a moment to rest");
    }

    recommendations.forEach(rec => {
      addNotification({
        type: "health",
        title: "Health Recommendation",
        message: rec,
        priority: "medium"
      });
    });
  }, [healthTrends, healthReadings, addNotification]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical": return "bg-red-500/20 border-red-500 text-red-500";
      case "high": return "bg-orange-500/20 border-orange-500 text-orange-500";
      case "medium": return "bg-yellow-500/20 border-yellow-500 text-yellow-500";
      default: return "bg-blue-500/20 border-blue-500 text-blue-500";
    }
  };

  return (
    <div className="space-y-6">
      {/* Smart Watch Display */}
      <Card className="p-6 bg-[var(--gradient-card)] border-cyber-blue/30">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-cyber-blue/20 relative">
              <Watch className="w-8 h-8 text-cyber-blue" />
              {isConnected && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse" />
              )}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-cyber-blue">LifeLine Watch</h2>
              <p className="text-sm text-muted-foreground">
                Real-time health monitoring • Emergency response • Life protection
              </p>
            </div>
          </div>
          
          <div className="text-right space-y-1">
            <div className="flex items-center gap-2">
              <Battery className={cn("w-4 h-4", batteryLevel > 30 ? "text-green-500" : "text-red-500")} />
              <span className="text-sm">{Math.round(batteryLevel)}%</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {isConnected ? <Wifi className="w-3 h-3 text-green-500" /> : <Wifi className="w-3 h-3 text-red-500" />}
              <Bluetooth className="w-3 h-3 text-blue-500" />
            </div>
          </div>
        </div>

        {/* SOS Emergency Button */}
        {sosCountdown > 0 ? (
          <Card className="p-4 bg-red-500/20 border-2 border-red-500 mb-6 animate-pulse">
            <div className="text-center">
              <h3 className="text-lg font-bold text-red-500 mb-2">🚨 SOS EMERGENCY ALERT</h3>
              <div className="text-3xl font-bold text-red-500 mb-3">{sosCountdown}</div>
              <Button 
                onClick={cancelSOS}
                variant="outline"
                className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
              >
                Cancel Emergency Alert
              </Button>
            </div>
          </Card>
        ) : (
          <Card className="p-4 bg-red-500/10 border border-red-500/30 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-red-500">Emergency SOS</h3>
                <p className="text-sm text-muted-foreground">
                  Hold for 3 seconds to trigger emergency alert
                </p>
              </div>
              <Button 
                onMouseDown={triggerSOS}
                className="bg-red-500 hover:bg-red-600 text-white w-16 h-16 rounded-full"
                size="lg"
              >
                <Shield className="w-8 h-8" />
              </Button>
            </div>
          </Card>
        )}

        {/* Watch Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="health">Health</TabsTrigger>
            <TabsTrigger value="notifications">Alerts</TabsTrigger>
            <TabsTrigger value="emergency">Emergency</TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-4 mt-6">
            {/* Current Health Display */}
            {healthReadings && (
              <div className="grid grid-cols-3 gap-4">
                <Card className="p-4 bg-red-500/10 border-red-500/30 text-center">
                  <Heart className="w-8 h-8 mx-auto mb-2 text-red-500" />
                  <div className="text-2xl font-bold">{healthReadings.heartRate}</div>
                  <div className="text-xs text-muted-foreground">BPM</div>
                </Card>
                
                <Card className="p-4 bg-blue-500/10 border-blue-500/30 text-center">
                  <Activity className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                  <div className="text-2xl font-bold">{healthReadings.spO2}%</div>
                  <div className="text-xs text-muted-foreground">SpO2</div>
                </Card>
                
                <Card className="p-4 bg-orange-500/10 border-orange-500/30 text-center">
                  <Target className="w-8 h-8 mx-auto mb-2 text-orange-500" />
                  <div className="text-2xl font-bold">{healthReadings.temperature.toFixed(1)}°</div>
                  <div className="text-xs text-muted-foreground">Temp</div>
                </Card>
              </div>
            )}

            {/* Daily Activity Summary */}
            <Card className="p-4 bg-green-500/10 border-green-500/30">
              <h3 className="font-semibold text-green-500 mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Today's Activity
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Steps</span>
                    <span className="font-bold">{dailyStats.steps.toLocaleString()}</span>
                  </div>
                  <Progress value={(dailyStats.steps / 10000) * 100} className="h-2" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Calories</span>
                    <span className="font-bold">{dailyStats.caloriesBurned}</span>
                  </div>
                  <Progress value={(dailyStats.caloriesBurned / 500) * 100} className="h-2" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Active Minutes</span>
                    <span className="font-bold">{dailyStats.activeMinutes}</span>
                  </div>
                  <Progress value={(dailyStats.activeMinutes / 90) * 100} className="h-2" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Distance (km)</span>
                    <span className="font-bold">{dailyStats.distance}</span>
                  </div>
                  <Progress value={(dailyStats.distance / 8) * 100} className="h-2" />
                </div>
              </div>
            </Card>

            {/* Workout Status */}
            {activeWorkout ? (
              <Card className="p-4 bg-purple-500/10 border-purple-500/30">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-purple-500">{activeWorkout.type} in Progress</h3>
                    <p className="text-sm text-muted-foreground">
                      Duration: {activeWorkout.duration} min • Zone: {activeWorkout.heartRateZone}
                    </p>
                  </div>
                  <Button onClick={endWorkout} variant="outline" size="sm">
                    End Workout
                  </Button>
                </div>
              </Card>
            ) : (
              <Card className="p-4 bg-purple-500/10 border-purple-500/30">
                <h3 className="font-semibold text-purple-500 mb-3">Quick Workout Start</h3>
                <div className="grid grid-cols-3 gap-2">
                  <Button onClick={() => startWorkout("Running")} variant="outline" size="sm">
                    🏃‍♂️ Run
                  </Button>
                  <Button onClick={() => startWorkout("Walking")} variant="outline" size="sm">
                    🚶‍♂️ Walk
                  </Button>
                  <Button onClick={() => startWorkout("Cycling")} variant="outline" size="sm">
                    🚴‍♂️ Cycle
                  </Button>
                </div>
              </Card>
            )}
          </TabsContent>

          {/* Health Tab */}
          <TabsContent value="health" className="space-y-4 mt-6">
            <Card className="p-4 bg-cyber-purple/10 border-cyber-purple/30">
              <h3 className="font-semibold text-cyber-purple mb-4">Health Insights</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>HRV</span>
                    <span className="font-bold">{healthTrends.heartRateVariability}ms</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Stress Level</span>
                    <span className={cn("font-bold", 
                      healthTrends.stressLevel > 70 ? "text-red-500" :
                      healthTrends.stressLevel > 40 ? "text-orange-500" : "text-green-500"
                    )}>{healthTrends.stressLevel}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Recovery Score</span>
                    <span className="font-bold text-green-500">{healthTrends.recoveryScore}%</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Fitness Age</span>
                    <span className="font-bold">{healthTrends.fitnessAge} years</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>VO2 Max</span>
                    <span className="font-bold">{healthTrends.vo2Max} ml/kg/min</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Resting HR</span>
                    <span className="font-bold">{healthTrends.restingHeartRate} BPM</span>
                  </div>
                </div>
              </div>
              
              <Button 
                onClick={analyzeHealthTrends}
                className="w-full mt-4"
                variant="outline"
              >
                Get Health Recommendations
              </Button>
            </Card>

            <Card className="p-4 bg-orange-500/10 border-orange-500/30">
              <h3 className="font-semibold text-orange-500 mb-3">Sleep Analysis</h3>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold">{dailyStats.sleepScore}</div>
                  <div className="text-sm text-muted-foreground">Sleep Score</div>
                </div>
                <div className="text-right text-sm">
                  <div>7h 23m total sleep</div>
                  <div className="text-muted-foreground">22:30 - 06:45</div>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-4 mt-6">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Health & Emergency Alerts</h3>
              <Badge variant="outline">{notifications.length}</Badge>
            </div>
            
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {notifications.length > 0 ? notifications.map((notif) => (
                <Card key={notif.id} className={cn("p-3", getPriorityColor(notif.priority))}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="font-medium text-sm">{notif.title}</div>
                      <div className="text-xs opacity-80">{notif.message}</div>
                      <div className="text-xs opacity-60 mt-1">
                        {notif.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                    {notif.actionRequired && (
                      <AlertTriangle className="w-4 h-4 ml-2" />
                    )}
                  </div>
                </Card>
              )) : (
                <div className="text-center py-6 text-muted-foreground">
                  <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No notifications</p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Emergency Tab */}
          <TabsContent value="emergency" className="space-y-4 mt-6">
            <Card className="p-4 bg-red-500/10 border-red-500/30">
              <h3 className="font-semibold text-red-500 mb-4 flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Emergency Contacts
              </h3>
              <div className="space-y-2">
                {emergencyContacts.map((contact, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-background/50 rounded">
                    <div>
                      <div className="font-medium">{contact.name}</div>
                      <div className="text-sm text-muted-foreground">{contact.number}</div>
                    </div>
                    <Button 
                      size="sm"
                      variant={contact.type === "emergency" ? "destructive" : "outline"}
                      onClick={() => window.open(`tel:${contact.number}`, "_self")}
                    >
                      Call
                    </Button>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-4 bg-blue-500/10 border-blue-500/30">
              <h3 className="font-semibold text-blue-500 mb-4 flex items-center gap-2">
                <QrCode className="w-4 h-4" />
                Emergency Tools
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  onClick={onQRGenerate}
                  variant="outline"
                  className="flex flex-col items-center p-4 h-auto"
                >
                  <QrCode className="w-6 h-6 mb-2" />
                  Medical QR
                </Button>
                
                <Button 
                  onClick={() => onIncidentCreate?.({})}
                  variant="outline"
                  className="flex flex-col items-center p-4 h-auto"
                >
                  <Shield className="w-6 h-6 mb-2" />
                  Incident Report
                </Button>
                
                <Button 
                  variant="outline"
                  className="flex flex-col items-center p-4 h-auto"
                >
                  <MapPin className="w-6 h-6 mb-2" />
                  Share Location
                </Button>
                
                <Button 
                  onClick={onEmergencyTrigger}
                  variant="destructive"
                  className="flex flex-col items-center p-4 h-auto"
                >
                  <Zap className="w-6 h-6 mb-2" />
                  Emergency
                </Button>
              </div>
            </Card>

            <Card className="p-4 bg-green-500/10 border-green-500/30">
              <h3 className="font-semibold text-green-500 mb-3">Auto-Emergency Features</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span>Fall Detection</span>
                  <CheckCircle className="w-4 h-4 text-green-500" />
                </div>
                <div className="flex items-center justify-between">
                  <span>Heart Rate Monitoring</span>
                  <CheckCircle className="w-4 h-4 text-green-500" />
                </div>
                <div className="flex items-center justify-between">
                  <span>Location Sharing</span>
                  <CheckCircle className="w-4 h-4 text-green-500" />
                </div>
                <div className="flex items-center justify-between">
                  <span>Emergency Auto-Call</span>
                  <CheckCircle className="w-4 h-4 text-green-500" />
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};