import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { EnhancedHealthProfile } from "./HealthProfileWizard";
import { useToast } from "@/hooks/use-toast";
import { 
  Shield, 
  Heart, 
  Activity, 
  Phone, 
  Camera, 
  Mic, 
  MapPin,
  Clock,
  AlertTriangle,
  CheckCircle,
  Battery,
  Wifi,
  Volume2,
  User,
  Settings,
  Zap,
  Brain,
  Eye
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileGuardianInterfaceProps {
  healthProfile: EnhancedHealthProfile;
  guardianStatus: "safe" | "elevated" | "emergency";
  isActive: boolean;
  onActivate: () => void;
  onDeactivate: () => void;
  onEmergencyTrigger: () => void;
  heartRate: number;
  batteryLevel: number;
  isOnline: boolean;
  currentLocation?: {
    city: string;
    address: string;
  };
}

export const MobileGuardianInterface = ({
  healthProfile,
  guardianStatus,
  isActive,
  onActivate,
  onDeactivate,
  onEmergencyTrigger,
  heartRate,
  batteryLevel,
  isOnline,
  currentLocation
}: MobileGuardianInterfaceProps) => {
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState("guardian");
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [voiceActive, setVoiceActive] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [riskScore, setRiskScore] = useState(0);

  // Calculate risk score based on health profile and current readings
  useEffect(() => {
    let score = 0;
    
    // Heart rate analysis
    if (heartRate > 100 || heartRate < 60) score += 2;
    if (heartRate > 120 || heartRate < 50) score += 3;
    
    // Health conditions risk
    const highRiskConditions = ["Heart Disease", "Diabetes", "Stroke History", "Epilepsy"];
    const conditionRisk = healthProfile.medicalConditions.filter(c => 
      highRiskConditions.includes(c)
    ).length;
    score += conditionRisk * 1.5;
    
    // Age factor
    const age = parseInt(healthProfile.age);
    if (age > 65) score += 1;
    if (age > 75) score += 2;
    
    setRiskScore(Math.min(10, Math.max(0, score)));
  }, [heartRate, healthProfile]);

  // Simulate analysis progress
  useEffect(() => {
    if (isActive) {
      const interval = setInterval(() => {
        setAnalysisProgress(prev => (prev + 1) % 101);
        setLastUpdate(new Date());
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [isActive]);

  const getStatusConfig = () => {
    switch (guardianStatus) {
      case "safe":
        return {
          color: "cyber-green",
          icon: CheckCircle,
          label: "All Systems Normal",
          description: "Guardian AI is monitoring your safety"
        };
      case "elevated":
        return {
          color: "cyber-orange",
          icon: AlertTriangle,
          label: "Elevated Risk",
          description: "Increased monitoring active"
        };
      case "emergency":
        return {
          color: "cyber-red",
          icon: Shield,
          label: "Emergency Active",
          description: "Emergency response initiated"
        };
    }
  };

  const statusConfig = getStatusConfig();
  const StatusIcon = statusConfig.icon;

  const renderGuardianTab = () => (
    <div className="space-y-4">
      {/* Status Card */}
      <Card className={cn(
        "p-4 border-2 transition-all duration-500 relative overflow-hidden",
        guardianStatus === "safe" && "border-cyber-green/30",
        guardianStatus === "elevated" && "border-cyber-orange/30",
        guardianStatus === "emergency" && "border-cyber-red/30 animate-pulse"
      )}>
        {/* Background gradient */}
        <div className={cn(
          "absolute inset-0 opacity-5",
          guardianStatus === "safe" && "bg-[var(--gradient-success)]",
          guardianStatus === "elevated" && "bg-[var(--gradient-warning)]",
          guardianStatus === "emergency" && "bg-[var(--gradient-danger)]"
        )} />
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className={cn(
                "p-2 rounded-full",
                guardianStatus === "safe" && "bg-cyber-green/20",
                guardianStatus === "elevated" && "bg-cyber-orange/20",
                guardianStatus === "emergency" && "bg-cyber-red/20"
              )}>
                <StatusIcon className={cn(
                  "w-5 h-5",
                  guardianStatus === "safe" && "text-cyber-green",
                  guardianStatus === "elevated" && "text-cyber-orange",
                  guardianStatus === "emergency" && "text-cyber-red"
                )} />
              </div>
              <div>
                <h3 className="font-bold text-foreground">Guardian Status</h3>
                <p className={cn(
                  "text-sm font-medium",
                  guardianStatus === "safe" && "text-cyber-green",
                  guardianStatus === "elevated" && "text-cyber-orange",
                  guardianStatus === "emergency" && "text-cyber-red"
                )}>
                  {statusConfig.label}
                </p>
              </div>
            </div>
            
            <Badge variant={guardianStatus === "safe" ? "default" : "destructive"}>
              Risk: {riskScore.toFixed(1)}/10
            </Badge>
          </div>
          
          <p className="text-sm text-muted-foreground mb-4">
            {statusConfig.description}
          </p>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="text-center">
              <div className="text-lg font-bold text-cyber-blue">{heartRate}</div>
              <div className="text-xs text-muted-foreground">BPM</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-cyber-green">24/7</div>
              <div className="text-xs text-muted-foreground">Active</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-cyber-purple">{batteryLevel}%</div>
              <div className="text-xs text-muted-foreground">Battery</div>
            </div>
          </div>
          
          {/* Guardian Controls */}
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant={isActive ? "destructive" : "default"}
              onClick={isActive ? onDeactivate : onActivate}
              className="w-full"
            >
              {isActive ? "Deactivate" : "Activate"} Guardian
            </Button>
            <Button
              variant="destructive"
              onClick={onEmergencyTrigger}
              className="w-full bg-cyber-red text-white"
            >
              🆘 Emergency
            </Button>
          </div>
        </div>
      </Card>

      {/* Analysis Progress */}
      {isActive && (
        <Card className="p-4">
          <h4 className="font-semibold mb-2 flex items-center gap-2">
            <Brain className="w-4 h-4 text-cyber-purple" />
            AI Analysis
          </h4>
          <Progress value={analysisProgress} className="mb-2" />
          <p className="text-xs text-muted-foreground">
            Continuous health monitoring • Last update: {lastUpdate.toLocaleTimeString()}
          </p>
        </Card>
      )}

      {/* Monitoring Systems */}
      <Card className="p-4">
        <h4 className="font-semibold mb-3">Active Monitoring</h4>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-cyber-red" />
              <span className="text-sm">Heart Rate</span>
            </div>
            <Badge variant={healthProfile.enableHeartRateMonitoring ? "default" : "outline"}>
              {healthProfile.enableHeartRateMonitoring ? "Active" : "Disabled"}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyber-orange" />
              <span className="text-sm">Fall Detection</span>
            </div>
            <Badge variant={healthProfile.enableFallDetection ? "default" : "outline"}>
              {healthProfile.enableFallDetection ? "Active" : "Disabled"}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mic className="w-4 h-4 text-cyber-blue" />
              <span className="text-sm">Voice Commands</span>
            </div>
            <Badge variant={healthProfile.enableVoiceCommands ? "default" : "outline"}>
              {healthProfile.enableVoiceCommands ? "Active" : "Disabled"}
            </Badge>
          </div>
        </div>
      </Card>

      {/* Emergency Contacts Quick Access */}
      {healthProfile.emergencyContacts.length > 0 && (
        <Card className="p-4">
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <Phone className="w-4 h-4 text-cyber-green" />
            Emergency Contacts
          </h4>
          <div className="space-y-2">
            {healthProfile.emergencyContacts.slice(0, 2).map((contact, index) => (
              <div key={index} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{contact.name}</p>
                  <p className="text-xs text-muted-foreground">{contact.relation}</p>
                </div>
                <Button size="sm" variant="outline">
                  Call
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );

  const renderHealthTab = () => (
    <div className="space-y-4">
      {/* Health Summary */}
      <Card className="p-4">
        <h4 className="font-semibold mb-3 flex items-center gap-2">
          <User className="w-4 h-4 text-cyber-blue" />
          Health Profile
        </h4>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm">Age:</span>
            <span className="text-sm font-medium">{healthProfile.age} years</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm">Blood Type:</span>
            <span className="text-sm font-medium">{healthProfile.bloodType}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm">Guardian Sensitivity:</span>
            <Badge variant="outline">{healthProfile.guardianSensitivity}</Badge>
          </div>
        </div>
      </Card>

      {/* Medical Conditions */}
      {healthProfile.medicalConditions.length > 0 && (
        <Card className="p-4">
          <h4 className="font-semibold mb-3 text-cyber-red">Medical Conditions</h4>
          <div className="flex flex-wrap gap-1">
            {healthProfile.medicalConditions.map(condition => (
              <Badge key={condition} variant="destructive" className="text-xs">
                {condition}
              </Badge>
            ))}
          </div>
        </Card>
      )}

      {/* Current Medications */}
      {healthProfile.currentMedications.length > 0 && (
        <Card className="p-4">
          <h4 className="font-semibold mb-3 text-cyber-purple">Current Medications</h4>
          <div className="space-y-2">
            {healthProfile.currentMedications.map((med, index) => (
              <div key={index} className="p-2 bg-muted rounded text-sm">
                <div className="font-medium">{med.name}</div>
                <div className="text-xs text-muted-foreground">
                  {med.dosage} • {med.frequency}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Allergies */}
      {healthProfile.allergies.length > 0 && (
        <Card className="p-4">
          <h4 className="font-semibold mb-3 text-cyber-orange">Allergies</h4>
          <div className="flex flex-wrap gap-1">
            {healthProfile.allergies.map(allergy => (
              <Badge key={allergy} variant="secondary" className="text-xs bg-cyber-orange/20">
                {allergy}
              </Badge>
            ))}
          </div>
        </Card>
      )}
    </div>
  );

  const renderSystemTab = () => (
    <div className="space-y-4">
      {/* System Status */}
      <Card className="p-4">
        <h4 className="font-semibold mb-3">System Status</h4>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wifi className={cn("w-4 h-4", isOnline ? "text-cyber-green" : "text-cyber-red")} />
              <span className="text-sm">Connection</span>
            </div>
            <Badge variant={isOnline ? "default" : "destructive"}>
              {isOnline ? "Online" : "Offline"}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Battery className={cn(
                "w-4 h-4",
                batteryLevel > 50 ? "text-cyber-green" : 
                batteryLevel > 20 ? "text-cyber-orange" : "text-cyber-red"
              )} />
              <span className="text-sm">Battery</span>
            </div>
            <Badge variant={batteryLevel > 20 ? "default" : "destructive"}>
              {batteryLevel}%
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-cyber-blue" />
              <span className="text-sm">Location</span>
            </div>
            <Badge variant="outline">
              {currentLocation?.city || "Unknown"}
            </Badge>
          </div>
        </div>
      </Card>

      {/* Quick Actions */}
      <Card className="p-4">
        <h4 className="font-semibold mb-3">Quick Actions</h4>
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setVoiceActive(!voiceActive);
              toast({
                title: voiceActive ? "Voice Disabled" : "Voice Activated",
                description: voiceActive ? "Voice commands turned off" : "Say 'Hey Guardian' to activate",
              });
            }}
          >
            <Volume2 className="w-4 h-4 mr-2" />
            Voice {voiceActive ? "Off" : "On"}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setCameraActive(!cameraActive);
              toast({
                title: cameraActive ? "Camera Disabled" : "Camera Activated",
                description: cameraActive ? "Visual monitoring stopped" : "Visual monitoring started",
              });
            }}
          >
            <Camera className="w-4 h-4 mr-2" />
            Camera {cameraActive ? "Off" : "On"}
          </Button>
          
          <Button variant="outline" size="sm">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
          
          <Button variant="outline" size="sm">
            <Eye className="w-4 h-4 mr-2" />
            Test Mode
          </Button>
        </div>
      </Card>

      {/* Guardian Preferences */}
      <Card className="p-4">
        <h4 className="font-semibold mb-3">Guardian Preferences</h4>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm">Auto SOS Delay:</span>
            <span className="text-sm font-medium">{healthProfile.autoSOSDelay}s</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm">Language:</span>
            <span className="text-sm font-medium">{healthProfile.language === 'en' ? 'English' : 'Arabic'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm">Smart Watch:</span>
            <Badge variant={healthProfile.smartWatchConnected ? "default" : "outline"}>
              {healthProfile.smartWatchConnected ? "Connected" : "Not Connected"}
            </Badge>
          </div>
        </div>
      </Card>
    </div>
  );

  return (
    <div className="w-full max-w-md mx-auto">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="guardian">Guardian</TabsTrigger>
          <TabsTrigger value="health">Health</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
        </TabsList>
        
        <TabsContent value="guardian">{renderGuardianTab()}</TabsContent>
        <TabsContent value="health">{renderHealthTab()}</TabsContent>
        <TabsContent value="system">{renderSystemTab()}</TabsContent>
      </Tabs>
      
      {/* Emergency Alert */}
      {guardianStatus === "emergency" && (
        <Alert className="mt-4 border-cyber-red bg-cyber-red/10">
          <AlertTriangle className="h-4 w-4 text-cyber-red" />
          <AlertDescription className="text-cyber-red">
            Emergency mode active. Emergency services have been notified.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};