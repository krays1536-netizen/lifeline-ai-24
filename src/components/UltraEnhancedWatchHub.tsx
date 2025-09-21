import React, { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, 
  Heart, 
  Brain, 
  Phone, 
  MapPin, 
  Zap,
  Camera,
  Mic,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Battery,
  Wifi,
  Bluetooth,
  Settings,
  User,
  Stethoscope,
  Eye,
  Thermometer,
  Wind,
  RotateCcw,
  PlayCircle,
  PauseCircle,
  Volume2,
  VolumeX,
  Navigation,
  Target,
  Smartphone,
  Watch,
  Headphones,
  ChevronRight,
  Power,
  WifiOff,
  BluetoothOff,
  Circle
} from 'lucide-react';
import { DoctorConnectSystem } from './DoctorConnectSystem';
import { HospitalFinder } from './HospitalFinder';
import { WitnessCam } from './WitnessCam';
import { VoiceCommandSystem } from './VoiceCommandSystem';
import { EnhancedAITriage } from './EnhancedAITriage';

interface Vitals {
  heartRate: number;
  spO2: number;
  temperature: number;
  bloodPressure: { systolic: number; diastolic: number };
  respiratoryRate: number;
  stressLevel: number;
  hydrationLevel: number;
  sleepQuality: number;
}

interface UltraEnhancedWatchHubProps {
  vitals?: Vitals;
  isEmergencyActive?: boolean;
  onEmergencyTrigger?: () => void;
  onFeatureToggle?: (feature: string, enabled: boolean) => void;
}

export const UltraEnhancedWatchHub: React.FC<UltraEnhancedWatchHubProps> = ({
  vitals: initialVitals,
  isEmergencyActive = false,
  onEmergencyTrigger,
  onFeatureToggle
}) => {
  // States
  const [currentTab, setCurrentTab] = useState('watch');
  const [isRecording, setIsRecording] = useState(false);
  const [batteryLevel, setBatteryLevel] = useState(85);
  const [isConnected, setIsConnected] = useState(true);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [autoSOSEnabled, setAutoSOSEnabled] = useState(true);
  const [riskScore, setRiskScore] = useState(2);
  const [emergencyContacts] = useState([
    { name: "Emergency Services", number: "112", type: "emergency" },
    { name: "Family", number: "+965-9999-1234", type: "family" },
    { name: "Doctor", number: "+965-2222-3333", type: "medical" }
  ]);

  // Enhanced vitals with AI predictions
  const [vitals, setVitals] = useState<Vitals>(initialVitals || {
    heartRate: 72,
    spO2: 98,
    temperature: 36.8,
    bloodPressure: { systolic: 120, diastolic: 80 },
    respiratoryRate: 16,
    stressLevel: 3,
    hydrationLevel: 75,
    sleepQuality: 8.2
  });

  // Current location
  const [currentLocation, setCurrentLocation] = useState({
    latitude: 29.3759,
    longitude: 47.9774,
    city: "Kuwait City"
  });

  // 3D Watch Display Component
  const Watch3D = () => (
    <div className="relative">
      <div className="w-80 h-80 mx-auto perspective-1000">
        <div className="relative w-full h-full transform-style-preserve-3d hover:rotate-y-12 transition-transform duration-700">
          {/* Watch Face */}
          <div className="absolute inset-4 bg-gradient-to-br from-gray-900 to-gray-800 rounded-full shadow-2xl border-8 border-gray-700">
            {/* Screen */}
            <div className="absolute inset-6 bg-black rounded-full overflow-hidden">
              <div className="w-full h-full bg-gradient-to-br from-blue-900 via-purple-900 to-black p-4 flex flex-col items-center justify-center text-white">
                <div className="text-center space-y-2">
                  <div className="text-2xl font-bold">{new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                  <div className="text-sm opacity-75">{new Date().toLocaleDateString()}</div>
                  
                  {/* Key Vitals Display */}
                  <div className="mt-4 space-y-1">
                    <div className="flex items-center justify-center gap-2 text-sm">
                      <Heart className="w-4 h-4 text-red-500" />
                      <span>{vitals.heartRate} BPM</span>
                    </div>
                    <div className="flex items-center justify-center gap-2 text-sm">
                      <Activity className="w-4 h-4 text-blue-500" />
                      <span>{vitals.spO2}% SpO₂</span>
                    </div>
                    <div className="flex items-center justify-center gap-2 text-sm">
                      <Thermometer className="w-4 h-4 text-orange-500" />
                      <span>{vitals.temperature}°C</span>
                    </div>
                  </div>

                  {/* Status Indicators */}
                  <div className="flex justify-center gap-2 mt-3">
                    <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
                    <div className={`w-2 h-2 rounded-full ${batteryLevel > 20 ? 'bg-green-500' : 'bg-red-500'}`} />
                    <div className={`w-2 h-2 rounded-full ${voiceEnabled ? 'bg-blue-500' : 'bg-gray-500'}`} />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Side Button */}
            <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-3 h-8 bg-gray-600 rounded-r"></div>
            
            {/* Crown */}
            <div className="absolute right-1 top-1/3 w-2 h-4 bg-gray-500 rounded-r"></div>
          </div>
          
          {/* Watch Band */}
          <div className="absolute left-1/2 top-12 transform -translate-x-1/2 w-8 h-16 bg-gradient-to-b from-gray-700 to-gray-800 rounded-t-lg"></div>
          <div className="absolute left-1/2 bottom-12 transform -translate-x-1/2 w-8 h-16 bg-gradient-to-t from-gray-700 to-gray-800 rounded-b-lg"></div>
        </div>
      </div>
    </div>
  );

  // Emergency SOS Handler
  const triggerSOS = () => {
    setIsRecording(true);
    onEmergencyTrigger?.();
    
    // Auto-notify all emergency contacts
    console.log("🚨 SOS TRIGGERED - Notifying emergency contacts");
    console.log("📍 Location:", currentLocation);
    console.log("💓 Current vitals:", vitals);
  };

  // Real-time vitals simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setVitals(prev => ({
        ...prev,
        heartRate: prev.heartRate + (Math.random() - 0.5) * 4,
        spO2: Math.max(95, prev.spO2 + (Math.random() - 0.5) * 2),
        temperature: prev.temperature + (Math.random() - 0.5) * 0.3
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      {/* Emergency Status Bar */}
      {isEmergencyActive && (
        <Card className="p-4 border-red-500 bg-red-500/5 animate-pulse">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-red-500" />
              <div>
                <h3 className="font-semibold text-red-500">EMERGENCY ACTIVE</h3>
                <p className="text-sm text-muted-foreground">All systems monitoring - Help is on the way</p>
              </div>
            </div>
            <Badge variant="destructive">LIVE</Badge>
          </div>
        </Card>
      )}

      {/* Main Interface */}
      <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6 bg-card h-12">
          <TabsTrigger value="watch" className="flex items-center gap-2 text-xs">
            <Watch className="h-3 w-3" />
            Watch
          </TabsTrigger>
          <TabsTrigger value="health" className="flex items-center gap-2 text-xs">
            <Heart className="h-3 w-3" />
            Health
          </TabsTrigger>
          <TabsTrigger value="emergency" className="flex items-center gap-2 text-xs">
            <Shield className="h-3 w-3" />
            Emergency
          </TabsTrigger>
          <TabsTrigger value="doctors" className="flex items-center gap-2 text-xs">
            <Stethoscope className="h-3 w-3" />
            Doctors
          </TabsTrigger>
          <TabsTrigger value="voice" className="flex items-center gap-2 text-xs">
            <Mic className="h-3 w-3" />
            Voice
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2 text-xs">
            <Settings className="h-3 w-3" />
            Settings
          </TabsTrigger>
        </TabsList>

        {/* Watch Display */}
        <TabsContent value="watch" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 3D Watch */}
            <Card className="p-6">
              <Watch3D />
              
              {/* Quick Actions */}
              <div className="flex justify-center gap-3 mt-6">
                <Button
                  onClick={triggerSOS}
                  variant="destructive"
                  size="lg"
                  className="flex items-center gap-2 animate-pulse"
                >
                  <Shield className="w-5 h-5" />
                  SOS
                </Button>
                
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setCurrentTab('health')}
                >
                  <Heart className="w-5 h-5 mr-2" />
                  Health
                </Button>
                
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setCurrentTab('voice')}
                >
                  <Mic className="w-5 h-5 mr-2" />
                  Voice
                </Button>
              </div>
            </Card>

            {/* Status & Connectivity */}
            <Card className="p-6 space-y-4">
              <h3 className="text-lg font-semibold">System Status</h3>
              
              {/* Battery */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Battery</span>
                  <span className="text-sm font-medium">{batteryLevel}%</span>
                </div>
                <Progress value={batteryLevel} className="h-2" />
              </div>

              {/* Connectivity */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {isConnected ? <Wifi className="w-4 h-4 text-green-500" /> : <WifiOff className="w-4 h-4 text-red-500" />}
                    <span className="text-sm">WiFi</span>
                  </div>
                  <Badge variant={isConnected ? "default" : "destructive"}>
                    {isConnected ? "Connected" : "Disconnected"}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bluetooth className="w-4 h-4 text-blue-500" />
                    <span className="text-sm">Bluetooth</span>
                  </div>
                  <Badge variant="default">Connected</Badge>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-purple-500" />
                    <span className="text-sm">Phone Sync</span>
                  </div>
                  <Badge variant="default">Active</Badge>
                </div>
              </div>

              {/* Emergency Contacts Quick Access */}
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Emergency Contacts</h4>
                {emergencyContacts.map((contact, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="w-full justify-between"
                    onClick={() => window.open(`tel:${contact.number}`)}
                  >
                    <span>{contact.name}</span>
                    <Phone className="w-4 h-4" />
                  </Button>
                ))}
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* Health Monitoring */}
        <TabsContent value="health" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Heart Rate */}
            <Card className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Heart className="w-5 h-5 text-red-500" />
                <span className="text-2xl font-bold">{Math.round(vitals.heartRate)}</span>
              </div>
              <div className="text-sm text-muted-foreground">BPM</div>
              <Progress value={(vitals.heartRate / 120) * 100} className="h-1 mt-2" />
            </Card>

            {/* Blood Oxygen */}
            <Card className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Wind className="w-5 h-5 text-blue-500" />
                <span className="text-2xl font-bold">{Math.round(vitals.spO2)}</span>
              </div>
              <div className="text-sm text-muted-foreground">% SpO₂</div>
              <Progress value={vitals.spO2} className="h-1 mt-2" />
            </Card>

            {/* Temperature */}
            <Card className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Thermometer className="w-5 h-5 text-orange-500" />
                <span className="text-2xl font-bold">{vitals.temperature.toFixed(1)}</span>
              </div>
              <div className="text-sm text-muted-foreground">°C</div>
              <Progress value={(vitals.temperature / 40) * 100} className="h-1 mt-2" />
            </Card>

            {/* Risk Score */}
            <Card className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Target className="w-5 h-5 text-purple-500" />
                <span className="text-2xl font-bold">{riskScore}</span>
              </div>
              <div className="text-sm text-muted-foreground">Risk Level</div>
              <Progress value={(riskScore / 10) * 100} className="h-1 mt-2" />
            </Card>
          </div>

          {/* AI Triage Integration */}
          <EnhancedAITriage />
        </TabsContent>

        {/* Emergency Features */}
        <TabsContent value="emergency" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* SOS & Emergency Response */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-red-500" />
                Emergency Response
              </h3>
              
              <div className="space-y-4">
                <Button
                  onClick={triggerSOS}
                  variant="destructive"
                  size="lg"
                  className="w-full animate-pulse"
                >
                  <Shield className="w-6 h-6 mr-3" />
                  TRIGGER SOS
                </Button>

                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" size="sm">
                    <Phone className="w-4 h-4 mr-2" />
                    Call 112
                  </Button>
                  <Button variant="outline" size="sm">
                    <MapPin className="w-4 h-4 mr-2" />
                    Share Location
                  </Button>
                </div>

                {/* Auto-Features */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Auto-SOS Detection</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setAutoSOSEnabled(!autoSOSEnabled)}
                      className={autoSOSEnabled ? "text-green-500" : "text-gray-500"}
                    >
                      {autoSOSEnabled ? <CheckCircle className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
              </div>
            </Card>

            {/* Witness Cam */}
            <WitnessCam 
              isActive={isRecording}
              onRecordingStart={() => setIsRecording(true)}
              onRecordingStop={() => setIsRecording(false)}
              emergencyMode={isEmergencyActive}
            />

          </div>

          {/* Hospital Finder */}
          <div className="mt-6">
            <HospitalFinder 
              userLocation={currentLocation}
              emergencyMode={isEmergencyActive}
            />
          </div>
        </TabsContent>

        {/* Doctor Connect */}
        <TabsContent value="doctors" className="mt-6">
          <DoctorConnectSystem 
            patientData={{
              personalInfo: {
                name: "Guardian User",
                age: 30,
                bloodType: "O+",
                allergies: ["Penicillin"],
                conditions: []
              },
              emergencyContacts: emergencyContacts.map(c => ({
                name: c.name,
                relation: c.type,
                phone: c.number
              })),
              currentVitals: {
                heartRate: Math.round(vitals.heartRate),
                spO2: Math.round(vitals.spO2),
                temperature: vitals.temperature,
                timestamp: new Date()
              },
              location: {
                latitude: currentLocation.latitude,
                longitude: currentLocation.longitude,
                address: `${currentLocation.city}, Kuwait`
              }
            }}
            onDoctorConnected={(doctor) => {
              console.log("Doctor connected:", doctor);
            }}
            onDataShared={(data) => {
              console.log("Data shared with doctor:", data);
            }}
          />
        </TabsContent>

        {/* Voice Commands */}
        <TabsContent value="voice" className="mt-6">
          <VoiceCommandSystem 
            enabled={voiceEnabled}
            onCommand={(action, data) => {
              console.log("Voice command:", action, data);
              
              switch (action) {
                case 'TRIGGER_SOS':
                  triggerSOS();
                  break;
                case 'START_HEART_SCAN':
                  setCurrentTab('health');
                  break;
                case 'SHOW_HEALTH_DASHBOARD':
                  setCurrentTab('health');
                  break;
                case 'FIND_HOSPITAL':
                  setCurrentTab('emergency');
                  break;
                default:
                  console.log("Unknown voice command:", action);
              }
            }}
          />
        </TabsContent>

        {/* Settings */}
        <TabsContent value="settings" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Device Settings</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Voice Commands</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setVoiceEnabled(!voiceEnabled)}
                  >
                    {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <span>Auto Emergency Detection</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setAutoSOSEnabled(!autoSOSEnabled)}
                  >
                    {autoSOSEnabled ? <CheckCircle className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                  </Button>
                </div>

                <Button variant="outline" className="w-full">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Factory Reset
                </Button>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Data & Privacy</h3>
              
              <div className="space-y-4">
                <Button variant="outline" className="w-full justify-start">
                  <User className="w-4 h-4 mr-2" />
                  Personal Information
                </Button>
                
                <Button variant="outline" className="w-full justify-start">
                  <Shield className="w-4 h-4 mr-2" />
                  Privacy Settings
                </Button>
                
                <Button variant="outline" className="w-full justify-start">
                  <Activity className="w-4 h-4 mr-2" />
                  Health Data Export
                </Button>
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};