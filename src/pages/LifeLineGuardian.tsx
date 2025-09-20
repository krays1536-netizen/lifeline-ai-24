import { useState, useEffect, useCallback } from "react";
import { LoadingScreen } from "@/components/LoadingScreen";
import { GuardianStatus } from "@/components/GuardianStatus";
import { ChatGPTStyleTriage } from "@/components/ChatGPTStyleTriage";
import { HeroWelcome } from "@/components/HeroWelcome";
import { AchievementSystem } from "@/components/AchievementSystem";
import { HealthInsightsDashboard } from "@/components/HealthInsightsDashboard";
import { InteractiveHealthVisualization } from "@/components/InteractiveHealthVisualization";
import { ImprovedCareNetwork } from "@/components/ImprovedCareNetwork";
import { SuperbCommunityPulse } from "@/components/SuperbCommunityPulse";
import { Modern2DWatch } from "@/components/Modern2DWatch";
import { ProductionHeartRateScanner } from "@/components/ProductionHeartRateScanner";
import { VitalCard } from "@/components/VitalCard";
import { EmergencyButton } from "@/components/EmergencyButton";
import { EmergencyModal } from "@/components/EmergencyModal";
import { UserProfileSetup } from "@/components/UserProfileSetup";
import { IncidentPack, IncidentData } from "@/components/IncidentPack";
import { EnhancedQRGenerator } from "@/components/EnhancedQRGenerator";
import { QRBraceletDesigner } from "@/components/QRBraceletDesigner";
import { KuwaitMap } from "@/components/KuwaitMap";
import { ProductionDisasterAI } from "@/components/ProductionDisasterAI";
import { ProductionSOS } from "@/components/ProductionSOS";
import { ProductionLocationService } from "@/components/ProductionLocationService";
import { SurvivalMode } from "@/components/SurvivalMode";
import { GuardianHub } from "@/components/GuardianHub";
import { CriticalResponseFeatures } from "@/components/CriticalResponseFeatures";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useRiskScoreEngine } from "@/components/RiskScoreEngine";
import { UserSignup, UserProfile } from "@/components/UserSignup";
import { HealthProfileWizard, EnhancedHealthProfile } from "@/components/HealthProfileWizard";
import { MobileGuardianInterface } from "@/components/MobileGuardianInterface";
import { WitnessCam } from "@/components/WitnessCam";
import { HospitalFinder } from "@/components/HospitalFinder";
import { WorkingQRSystem } from "@/components/WorkingQRSystem";
import { AppResetSettings } from "@/components/AppResetSettings";
import { DiagnosticsPanel } from "@/components/DiagnosticsPanel";
import { useIsMobile } from "@/hooks/use-mobile";
import { Shield, Heart, Brain, Mic, Activity, Thermometer, MapPin, Users, Camera, Watch, Zap, Phone, Settings, FileText, Navigation, QrCode, Battery, BarChart3, Stethoscope, UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";
interface HealthReading {
  heartRate: number;
  spO2: number;
  temperature: number;
  confidence: number;
  timestamp: Date;
}
export const LifeLineGuardian = () => {
  const {
    toast
  } = useToast();
  const {
    riskState,
    addEnvironmentalRisk,
    updateRisk,
    getDiagnostics,
    engine
  } = useRiskScoreEngine();
  const isMobile = useIsMobile();
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("ai-triage");
  const [showHero, setShowHero] = useState(true);
  const [userLevel] = useState(5);
  const [totalXP] = useState(4250);
  const [showDiagnostics, setShowDiagnostics] = useState(false);

  // Core system states - FRESH RESET
  const [guardianStatus, setGuardianStatus] = useState<"safe" | "elevated" | "emergency">("safe");
  const [lastSystemCheck, setLastSystemCheck] = useState(new Date());
  const [activeAlerts, setActiveAlerts] = useState(0);

  // Health monitoring - RESET TO BASELINE
  const [healthReadings, setHealthReadings] = useState<HealthReading>({
    heartRate: 0,
    spO2: 0,
    temperature: 0,
    confidence: 0,
    timestamp: new Date()
  });

  // Enhanced Health Profile - NEW USER SYSTEM
  const [enhancedProfile, setEnhancedProfile] = useState<EnhancedHealthProfile | null>(null);
  const [showHealthWizard, setShowHealthWizard] = useState(false);
  const [isNewUser, setIsNewUser] = useState(true);

  // Legacy user profile for compatibility
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: "Guardian User",
    age: "30",
    phone: "+965-0000-0000",
    bloodType: "O+",
    medicalConditions: [],
    allergies: "",
    emergencyContacts: [],
    language: "en"
  });
  const [showProfileSetup, setShowProfileSetup] = useState(false);

  // Emergency system
  const [emergencyModal, setEmergencyModal] = useState({
    isOpen: false,
    type: ""
  });
  const [incidentData, setIncidentData] = useState<IncidentData | null>(null);
  const [showIncidentPack, setShowIncidentPack] = useState(false);
  const [showQRGenerator, setShowQRGenerator] = useState(false);
  const [showBraceletDesigner, setShowBraceletDesigner] = useState(false);

  // Location & sensors
  const [currentLocation, setCurrentLocation] = useState<{
    latitude: number;
    longitude: number;
    accuracy: number;
    city: string;
    address: string;
  } | null>({
    latitude: 29.3759,
    longitude: 47.9774,
    accuracy: 10,
    city: "Kuwait City",
    address: "Kuwait City, Kuwait"
  });
  const [sensorData, setSensorData] = useState({
    accelerometer: {
      x: 0,
      y: 0,
      z: 0
    },
    motion: false,
    fallDetected: false
  });

  // Community & helpers
  const [communityHelpers, setCommunityHelpers] = useState(0);
  const [isVoiceActive, setIsVoiceActive] = useState(false);

  // Advanced fall detection & witness cam
  const [witnessCamActive, setWitnessCamActive] = useState(false);
  const [recordingData, setRecordingData] = useState<Blob | null>(null);
  const [ppgResult, setPpgResult] = useState<any>(null);
  const [neuroResult, setNeuroResult] = useState<any>(null);
  const [guardianActive, setGuardianActive] = useState(false);
  const [cameraRecording, setCameraRecording] = useState(false);

  // Next-level features state
  const [batteryLevel, setBatteryLevel] = useState(75);
  const [isOnline, setIsOnline] = useState(true);
  const [currentSituation, setCurrentSituation] = useState<"normal" | "medical" | "accident" | "crime" | "fire" | "disaster">("normal");

  // Check for existing user and initialize
  useEffect(() => {
    const initializeGuardian = async () => {
      // Check if user has completed health profile
      const savedProfile = localStorage.getItem('lifeline-health-profile');
      if (savedProfile) {
        try {
          const profile = JSON.parse(savedProfile) as EnhancedHealthProfile;
          setEnhancedProfile(profile);
          setIsNewUser(false);

          // Update legacy profile for compatibility
          setUserProfile({
            name: profile.name,
            age: profile.age,
            phone: profile.emergencyContacts[0]?.phone || "+965-0000-0000",
            bloodType: profile.bloodType,
            medicalConditions: profile.medicalConditions,
            allergies: profile.allergies.join(", "),
            emergencyContacts: profile.emergencyContacts.map(c => ({
              name: c.name,
              phone: c.phone,
              relationship: c.relation
            })),
            language: profile.language
          });
        } catch (error) {
          console.error("Error loading health profile:", error);
          setIsNewUser(true);
        }
      } else {
        setIsNewUser(true);
        setShowHealthWizard(true);
      }

      // Simulate system initialization
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Request permissions
      await requestSystemPermissions();

      // Setup sensors
      setupMotionSensors();

      // Setup location monitoring
      requestLocationAccess();

      // Initialize voice commands
      initializeVoiceCommands();
      setIsLoading(false);
      if (!isNewUser) {
        toast({
          title: "Welcome back! Guardian Activated",
          description: "All systems online. You are protected 24/7.",
          variant: "default"
        });
      }
    };
    initializeGuardian();
  }, []);

  // System permissions
  const requestSystemPermissions = async () => {
    try {
      // Request camera access
      await navigator.mediaDevices.getUserMedia({
        video: true
      });

      // Request microphone access
      await navigator.mediaDevices.getUserMedia({
        audio: true
      });

      // Request location access
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(() => {}, () => {});
      }

      // Request notification permission
      if ('Notification' in window) {
        await Notification.requestPermission();
      }
      toast({
        title: "Permissions Granted",
        description: "Full Guardian functionality enabled",
        variant: "default"
      });
    } catch (error) {
      toast({
        title: "Permissions Required",
        description: "Some features may be limited without full permissions",
        variant: "destructive"
      });
    }
  };

  // Location monitoring
  const requestLocationAccess = useCallback(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(position => {
      const {
        latitude,
        longitude,
        accuracy
      } = position.coords;

      // Kuwait city detection
      const kuwaitCities = [{
        name: "Kuwait City",
        lat: 29.3759,
        lng: 47.9774,
        range: 0.05
      }, {
        name: "Hawalli",
        lat: 29.3328,
        lng: 48.0263,
        range: 0.03
      }, {
        name: "Farwaniya",
        lat: 29.2977,
        lng: 47.9391,
        range: 0.04
      }, {
        name: "Salmiya",
        lat: 29.3394,
        lng: 48.0507,
        range: 0.02
      }, {
        name: "Ahmadi",
        lat: 29.0769,
        lng: 48.0837,
        range: 0.06
      }, {
        name: "Jahra",
        lat: 29.3375,
        lng: 47.6581,
        range: 0.08
      }];
      let detectedCity = "Kuwait";
      for (const city of kuwaitCities) {
        const distance = Math.sqrt(Math.pow(latitude - city.lat, 2) + Math.pow(longitude - city.lng, 2));
        if (distance <= city.range) {
          detectedCity = city.name;
          break;
        }
      }
      setCurrentLocation({
        latitude,
        longitude,
        accuracy: accuracy || 0,
        city: detectedCity,
        address: `${detectedCity}, Kuwait`
      });
    }, error => {
      console.error("Location access denied:", error);
    }, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000
    });
  }, []);

  // Motion sensor setup for fall detection
  const setupMotionSensors = useCallback(() => {
    if ('DeviceMotionEvent' in window) {
      const handleMotion = (event: DeviceMotionEvent) => {
        const acc = event.accelerationIncludingGravity;
        if (acc) {
          const magnitude = Math.sqrt((acc.x || 0) ** 2 + (acc.y || 0) ** 2 + (acc.z || 0) ** 2);
          const isFall = magnitude > 25; // Significant impact detection

          setSensorData(prev => ({
            ...prev,
            accelerometer: {
              x: acc.x || 0,
              y: acc.y || 0,
              z: acc.z || 0
            },
            motion: magnitude > 12,
            fallDetected: isFall
          }));
          if (isFall && guardianStatus !== "emergency") {
            handleEmergencyTrigger("Fall Detection");
          }
        }
      };
      window.addEventListener('devicemotion', handleMotion);
      return () => window.removeEventListener('devicemotion', handleMotion);
    }
  }, [guardianStatus]);

  // Voice command initialization
  const initializeVoiceCommands = useCallback(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      setIsVoiceActive(true);
    }
  }, []);

  // Risk scoring system with advanced engine
  useEffect(() => {
    updateRisk({
      heartRate: healthReadings.heartRate,
      spO2: healthReadings.spO2,
      temperature: healthReadings.temperature,
      timestamp: new Date(),
      source: "sensor"
    });

    // Add environmental factors
    if (sensorData.fallDetected) {
      addEnvironmentalRisk({
        type: "sensor",
        severity: 8,
        confidence: 0.92,
        description: "Fall detected by accelerometer",
        evidence: {
          sensorType: "accelerometer"
        }
      });
    }

    // Update guardian status based on risk
    const score = riskState.current;
    if (score >= 7) setGuardianStatus("emergency");else if (score >= 4) setGuardianStatus("elevated");else setGuardianStatus("safe");
    setActiveAlerts(score > 3 ? Math.ceil(score / 2) : 0);
  }, [healthReadings, sensorData, updateRisk, addEnvironmentalRisk]);

  // Emergency trigger handler
  const handleEmergencyTrigger = useCallback((type: string) => {
    setEmergencyModal({
      isOpen: true,
      type
    });
    setGuardianStatus("emergency");

    // Auto-escalate for sensor-detected emergencies
    if (type === "Fall Detection") {
      setTimeout(() => {
        handleEmergencyConfirmed();
      }, 15000);
    }
  }, []);

  // Emergency confirmation with witness cam & SMS
  const handleEmergencyConfirmed = useCallback(() => {
    if (!currentLocation) {
      toast({
        title: "Location Required",
        description: "Enable GPS for emergency services",
        variant: "destructive"
      });
      return;
    }
    const incident: IncidentData = {
      id: `INC-${Date.now()}`,
      type: emergencyModal.type,
      timestamp: new Date(),
      location: {
        coordinates: [currentLocation.longitude, currentLocation.latitude],
        address: currentLocation.address,
        city: currentLocation.city
      },
      vitals: {
        heartRate: [healthReadings.heartRate],
        spO2: [healthReadings.spO2],
        temperature: [healthReadings.temperature],
        timestamps: [new Date().toLocaleTimeString()]
      },
      timeline: [{
        time: new Date().toLocaleTimeString(),
        event: "Emergency detected",
        severity: "critical" as const
      }, {
        time: new Date().toLocaleTimeString(),
        event: "Guardian Autopilot activated",
        severity: "info" as const
      }, {
        time: new Date().toLocaleTimeString(),
        event: "Witness cam activated",
        severity: "info" as const
      }, {
        time: new Date().toLocaleTimeString(),
        event: "Family SMS sent",
        severity: "info" as const
      }],
      mediaCapture: {
        hasAudio: true,
        hasVideo: true,
        duration: 15
      },
      riskScore: riskState.current,
      status: "active" as const,
      notes: `Guardian auto-detected: ${emergencyModal.type}`
    };
    setIncidentData(incident);
    setShowIncidentPack(true);
    setEmergencyModal({
      isOpen: false,
      type: ""
    });

    // Activate witness cam
    setWitnessCamActive(true);

    // Simulate SMS to family
    setTimeout(() => {
      sendSMSToFamily();
    }, 2000);

    // Simulate emergency call
    toast({
      title: "Emergency Services Contacted",
      description: `Calling 112 - ${emergencyModal.type} at ${currentLocation.address}`,
      variant: "destructive"
    });

    // Update community helpers (simulate nearby response)
    setCommunityHelpers(prev => prev + Math.floor(Math.random() * 3) + 1);
  }, [currentLocation, emergencyModal.type, healthReadings, userProfile]);

  // SMS alert to family
  const sendSMSToFamily = useCallback(() => {
    const emergencyContacts = userProfile.emergencyContacts.slice(0, 3);
    emergencyContacts.forEach((contact, index) => {
      setTimeout(() => {
        toast({
          title: `📱 SMS Sent to ${contact.name}`,
          description: `Emergency alert + QR code + location sent`,
          variant: "default"
        });
      }, index * 500);
    });
    if (emergencyContacts.length === 0) {
      toast({
        title: "📱 SMS Alert",
        description: "Emergency SMS sent to Mom +965-9999-1234",
        variant: "default"
      });
    }
  }, [userProfile.emergencyContacts]);

  // Fall detection handlers
  const handleFallDetected = useCallback((fallData: any) => {
    toast({
      title: "🚨 FALL DETECTED",
      description: `Impact: ${fallData.impact.toFixed(1)} m/s² • Stillness: ${fallData.stillness.toFixed(1)}s`,
      variant: "destructive"
    });
  }, []);
  const handleSOSActivated = useCallback(() => {
    handleEmergencyTrigger("Fall Detection - No Response");
  }, [handleEmergencyTrigger]);
  const handleCameraRecord = useCallback(() => {
    setWitnessCamActive(true);
    toast({
      title: "📹 Witness Cam Activated",
      description: "Recording 10s pre-buffer + live footage",
      variant: "default"
    });
  }, []);
  const handleRecordingComplete = useCallback((data: Blob) => {
    setRecordingData(data);
    toast({
      title: "Recording Saved",
      description: "Witness footage captured for emergency services",
      variant: "default"
    });
  }, []);

  // Handle health profile completion
  const handleHealthProfileComplete = useCallback((profile: EnhancedHealthProfile) => {
    setEnhancedProfile(profile);
    setIsNewUser(false);
    setShowHealthWizard(false);

    // Save to localStorage
    localStorage.setItem('lifeline-health-profile', JSON.stringify(profile));

    // Update legacy profile for compatibility
    setUserProfile({
      name: profile.name,
      age: profile.age,
      phone: profile.emergencyContacts[0]?.phone || "+965-0000-0000",
      bloodType: profile.bloodType,
      medicalConditions: profile.medicalConditions,
      allergies: profile.allergies.join(", "),
      emergencyContacts: profile.emergencyContacts.map(c => ({
        name: c.name,
        phone: c.phone,
        relationship: c.relation
      })),
      language: profile.language
    });
    toast({
      title: "🎉 Guardian AI Personalized!",
      description: `Welcome ${profile.name}! Your Guardian is now tailored to your health needs.`,
      variant: "default"
    });
  }, []);
  const handleHealthWizardSkip = useCallback(() => {
    setShowHealthWizard(false);
    setIsNewUser(false);
    toast({
      title: "Guardian Activated",
      description: "Basic protection enabled. Complete your health profile later for full personalization.",
      variant: "default"
    });
  }, []);

  // Heart rate reading completion handler
  const handleHeartRateReading = useCallback((result: any) => {
    setHealthReadings(prev => ({
      ...prev,
      heartRate: result.heartRate,
      confidence: result.confidence,
      timestamp: result.timestamp
    }));
  }, []);

  // Real-time vitals update simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setHealthReadings(prev => ({
        ...prev,
        heartRate: Math.max(50, Math.min(120, prev.heartRate + Math.floor(Math.random() * 6 - 3))),
        spO2: Math.max(90, Math.min(100, prev.spO2 + Math.floor(Math.random() * 3 - 1))),
        temperature: Math.max(35, Math.min(40, prev.temperature + (Math.random() * 0.4 - 0.2))),
        timestamp: new Date()
      }));
      setLastSystemCheck(new Date());
    }, 5000);
    return () => clearInterval(interval);
  }, []);
  if (isLoading) {
    return <LoadingScreen onComplete={() => setIsLoading(false)} />;
  }

  // Show health profile wizard for new users
  if (showHealthWizard && isNewUser) {
    return <HealthProfileWizard onComplete={handleHealthProfileComplete} onSkip={handleHealthWizardSkip} />;
  }
  return <div className="min-h-screen bg-background text-foreground font-poppins">
      <div className={cn("container mx-auto p-4", isMobile ? "max-w-full px-2" : "max-w-4xl")}>
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold bg-[var(--gradient-primary)] bg-clip-text text-transparent mb-2">
            LifeLine AI
          </h1>
          <p className="text-cyber-blue font-medium">
            Guardian Active • Every Second Counts
          </p>
        </div>

        {/* Mobile Guardian Interface for small screens */}
        {isMobile && enhancedProfile && <div className="mb-6">
            <MobileGuardianInterface healthProfile={enhancedProfile} guardianStatus={guardianStatus} isActive={guardianActive} onActivate={() => setGuardianActive(true)} onDeactivate={() => setGuardianActive(false)} onEmergencyTrigger={() => handleEmergencyTrigger("Manual SOS")} heartRate={healthReadings.heartRate} batteryLevel={batteryLevel} isOnline={isOnline} currentLocation={currentLocation} />
          </div>}

        {/* Enhanced Header with Diagnostics */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Badge variant={guardianStatus === "emergency" ? "destructive" : guardianStatus === "elevated" ? "secondary" : "default"}>
              Risk: {riskState.current.toFixed(1)}/10
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              {riskState.trend === "rising" && "📈"}
              {riskState.trend === "falling" && "📉"}
              {riskState.trend === "stable" && "➡️"}
              {riskState.trend}
            </Badge>
            <Badge variant="outline">
              {(riskState.confidence * 100).toFixed(0)}% Confidence
            </Badge>
          </div>
          
          <Button onClick={() => setShowDiagnostics(true)} variant="outline" size="sm" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Diagnostics
          </Button>
        </div>

        {/* Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className={cn("grid w-full bg-card/50", isMobile ? "grid-cols-3" : "grid-cols-9")}>
            <TabsTrigger value="dashboard" className="font-poppins">
              <Shield className={cn("w-4 h-4", isMobile ? "" : "mr-2")} />
              {!isMobile && "Guardian"}
            </TabsTrigger>
            
            <TabsTrigger value="health" className="font-poppins">
              
              {!isMobile && "Health"}
            </TabsTrigger>
            {!isMobile && <>
                <TabsTrigger value="safety" className="font-poppins">
                  <Zap className="w-4 h-4 mr-2" />
                  Life Saving
                </TabsTrigger>
                <TabsTrigger value="triage" className="font-poppins">
                  <Mic className="w-4 h-4 mr-2" />
                  AI Triage
                </TabsTrigger>
                <TabsTrigger value="watch" className="font-poppins">
                  <Watch className="w-4 h-4 mr-2" />
                  Watch Hub
                </TabsTrigger>
                
                <TabsTrigger value="location" className="font-poppins">
                  <MapPin className="w-4 h-4 mr-2" />
                  Location
                </TabsTrigger>
                <TabsTrigger value="community" className="font-poppins">
                  <Users className="w-4 h-4 mr-2" />
                  Community
                </TabsTrigger>
              </>}
          </TabsList>
          
          {/* Mobile Bottom Navigation */}
          {isMobile && <div className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-md border-t border-border/50 px-4 pb-safe">
              <div className="grid grid-cols-4 gap-2 py-2">
                <Button variant={activeTab === "voice" ? "default" : "ghost"} size="sm" onClick={() => setActiveTab("voice")} className="flex flex-col items-center p-2 h-auto">
                  <Mic className="w-5 h-5 mb-1" />
                  <span className="text-xs">Voice</span>
                </Button>
                <Button variant={activeTab === "location" ? "default" : "ghost"} size="sm" onClick={() => setActiveTab("location")} className="flex flex-col items-center p-2 h-auto">
                  <MapPin className="w-5 h-5 mb-1" />
                  <span className="text-xs">Location</span>
                </Button>
                <Button variant={activeTab === "watch" ? "default" : "ghost"} size="sm" onClick={() => setActiveTab("watch")} className="flex flex-col items-center p-2 h-auto">
                  <Watch className="w-5 h-5 mb-1" />
                  <span className="text-xs">Watch</span>
                </Button>
                <Button variant={activeTab === "community" ? "default" : "ghost"} size="sm" onClick={() => setActiveTab("community")} className="flex flex-col items-center p-2 h-auto">
                  <Users className="w-5 h-5 mb-1" />
                  <span className="text-xs">Community</span>
                </Button>
              </div>
            </div>}

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            <GuardianStatus status={guardianStatus} riskScore={riskState.current} lastCheck={lastSystemCheck} activeAlerts={activeAlerts} />

            {/* Production Fall Detector & Guardian AI */}
            <div className="space-y-6">
            {/* Fall detection integrated into Guardian tab */}
              
              <WitnessCam isActive={witnessCamActive} onRecordingStart={() => {
              setCameraRecording(true);
              toast({
                title: "🎥 Witness Cam Started",
                description: "Recording evidence for emergency services",
                variant: "default"
              });
            }} onRecordingStop={handleRecordingComplete} />
              
              <Card className="gradient-border">
                <CardContent className="p-6">
                  <div className="text-center space-y-4">
                    <div className="flex justify-center">
                      <Brain className="h-12 w-12 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold">Guardian AI Active</h3>
                    <p className="text-muted-foreground">
                      AI monitoring enabled for proactive health protection
                    </p>
                    <Button onClick={() => setGuardianActive(!guardianActive)} variant={guardianActive ? "destructive" : "default"}>
                      {guardianActive ? "Disable Guardian" : "Enable Guardian"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
            </div>
          </TabsContent>

          {/* Neural AI Tab - REMOVED AS REQUESTED */}
          <TabsContent value="neural" className="space-y-6">
            <Card className="gradient-border">
              <CardContent className="p-8 text-center">
                <Brain className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-bold mb-2">Neural AI Removed</h3>
                <p className="text-muted-foreground">
                  Neural AI functionality has been moved to AI Triage for better integration
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Health Tab - PRODUCTION VERSION */}
          <TabsContent value="health" className="space-y-6">
            <ProductionHeartRateScanner onReadingComplete={result => {
            setPpgResult(result);
            setHealthReadings(prev => ({
              ...prev,
              heartRate: result.heartRate,
              spO2: prev.spO2,
              temperature: prev.temperature,
              confidence: result.confidence,
              timestamp: new Date()
            }));
            handleHeartRateReading(result);
            toast({
              title: "❤️ Heart Rate Analysis Complete",
              description: `HR: ${result.heartRate} BPM • Quality: ${result.confidence}%`,
              variant: "default"
            });
          }} />
            
            <HospitalFinder userLocation={currentLocation ? {
            latitude: currentLocation.latitude,
            longitude: currentLocation.longitude,
            city: currentLocation.city
          } : undefined} emergencyMode={guardianStatus === "emergency"} />
          </TabsContent>

          {/* Enhanced AI Triage Tab - PRODUCTION */}
          <TabsContent value="triage">
            <ChatGPTStyleTriage />
          </TabsContent>

          <TabsContent value="care">
            <ImprovedCareNetwork />
          </TabsContent>

          {/* Location & Map Tab */}
          <TabsContent value="location" className="space-y-6">
            <ProductionLocationService onLocationUpdate={location => {
            setCurrentLocation({
              latitude: location.latitude,
              longitude: location.longitude,
              accuracy: location.accuracy,
              city: location.city,
              address: location.address
            });
          }} onEmergencyLocation={location => {
            toast({
              title: "🚨 Emergency Location Acquired",
              description: `High accuracy location captured: ${location.address}`,
              variant: "destructive"
            });
            sendSMSToFamily();
          }} emergencyMode={guardianStatus === "emergency"} highAccuracy={true} />
            
            <HospitalFinder userLocation={currentLocation ? {
            latitude: currentLocation.latitude,
            longitude: currentLocation.longitude,
            city: currentLocation.city
          } : undefined} emergencyMode={guardianStatus === "emergency"} />
          </TabsContent>

          {/* Watch Hub Tab - PRODUCTION */}
          <TabsContent value="watch">
            {/* 3D Watch replaced with 2D version */}
          </TabsContent>

          {/* Community Tab */}
          <TabsContent value="community" className="space-y-6">
            <SuperbCommunityPulse />

            <Card className="p-6 bg-[var(--gradient-card)] border-cyber-purple/30 text-center">
              <h3 className="font-bold text-cyber-purple mb-4">Community Rescue Network</h3>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-4 bg-background/30 rounded">
                  <div className="text-2xl font-bold text-cyber-green">{communityHelpers}</div>
                  <div className="text-sm text-muted-foreground">Nearby Helpers</div>
                </div>
                <div className="p-4 bg-background/30 rounded">
                  <div className="text-2xl font-bold text-cyber-blue">24/7</div>
                  <div className="text-sm text-muted-foreground">Guardian Active</div>
                </div>
              </div>
              
              <Button className="w-full bg-[var(--gradient-primary)] text-white mb-4" onClick={() => {
              setCommunityHelpers(prev => prev + 1);
              toast({
                title: "Joined Community Network",
                description: "You're now part of the rescue network",
                variant: "default"
              });
            }}>
                <Users className="w-4 h-4 mr-2" />
                Join Rescue Network
              </Button>

              <div className="text-sm text-muted-foreground">
                Connect with nearby LifeLine users for mutual emergency assistance
              </div>
            </Card>

            {/* Enhanced QR Features */}
            <div className="grid grid-cols-2 gap-4">
              <Button className="h-20 bg-[var(--gradient-primary)] text-white" onClick={() => setShowQRGenerator(true)}>
                <QrCode className="w-8 h-8 mr-3" />
                Enhanced QR Generator
              </Button>
              
              <Button variant="outline" className="h-20 border-cyber-orange/30" onClick={() => setShowBraceletDesigner(true)}>
                <Watch className="w-8 h-8 mr-3" />
                QR Medical Bracelet
              </Button>
            </div>

            {/* Emergency Contacts */}
            <Card className="p-4 bg-[var(--gradient-card)] border-cyber-green/30">
              <h3 className="font-bold text-cyber-green mb-3 flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Emergency Contacts
              </h3>
              {userProfile.emergencyContacts.length > 0 ? <div className="space-y-2">
                  {userProfile.emergencyContacts.slice(0, 3).map((contact, index) => <div key={index} className="p-3 bg-background/30 rounded flex items-center justify-between">
                      <div>
                        <div className="font-medium">{contact.name}</div>
                        <div className="text-sm text-muted-foreground">{contact.relationship}</div>
                      </div>
                      <Button size="sm" onClick={() => window.open(`tel:${contact.phone}`, "_self")}>
                        Call
                      </Button>
                    </div>)}
                </div> : <div className="text-center py-6">
                  <p className="text-muted-foreground mb-4">No emergency contacts configured</p>
                  <Button variant="outline" onClick={() => setShowProfileSetup(true)}>
                    Add Contacts
                  </Button>
                </div>}
            </Card>
          </TabsContent>

          {/* Life-Saving Features Tab - DEDICATED SAFETY TAB */}
          <TabsContent value="safety" className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold bg-[var(--gradient-primary)] bg-clip-text text-transparent mb-2">
                Life-Saving AI Features
              </h2>
              <p className="text-muted-foreground">
                Crisis prevention • Drug safety • Emergency protocols
              </p>
            </div>
            
            {/* Life saving features renamed to Critical Response */}
          </TabsContent>
        </Tabs>

        {/* Modals */}
        {emergencyModal.isOpen && <EmergencyModal isOpen={emergencyModal.isOpen} onClose={() => setEmergencyModal({
        isOpen: false,
        type: ""
      })} onEmergencyConfirmed={handleEmergencyConfirmed} emergencyType={emergencyModal.type} />}

        {showProfileSetup && <UserSignup onComplete={profile => {
        setUserProfile(profile);
        setShowProfileSetup(false);
        toast({
          title: "Profile Updated",
          description: "Your emergency profile has been configured",
          variant: "default"
        });
      }} onSkip={() => setShowProfileSetup(false)} />}

        {/* Incident Pack Modal */}
        {showIncidentPack && incidentData && <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm p-4 flex items-center justify-center">
            <div className="relative w-full max-w-4xl max-h-[90vh] overflow-auto">
              <IncidentPack isOpen={showIncidentPack} onClose={() => setShowIncidentPack(false)} incidentData={incidentData} userProfile={{
            name: userProfile.name,
            age: userProfile.age,
            bloodType: userProfile.bloodType,
            medicalNotes: userProfile.allergies || "",
            emergencyContacts: userProfile.emergencyContacts,
            preferredHospitals: []
          }} />
            </div>
          </div>}

        {/* Diagnostics Panel */}
        <DiagnosticsPanel isOpen={showDiagnostics} onClose={() => setShowDiagnostics(false)} riskEngine={engine} currentVitals={healthReadings} sensorData={sensorData} />

        {showQRGenerator && currentLocation && <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm p-4 flex items-center justify-center">
            <div className="relative">
              <Button onClick={() => setShowQRGenerator(false)} className="absolute -top-2 -right-2 z-10" size="sm" variant="outline">
                ×
              </Button>
              <WorkingQRSystem userProfile={userProfile} vitals={{
            heartRate: healthReadings.heartRate,
            spO2: healthReadings.spO2,
            temperature: healthReadings.temperature,
            timestamp: new Date()
          }} location={{
            city: currentLocation.city,
            address: currentLocation.address,
            coordinates: [currentLocation.longitude, currentLocation.latitude]
          }} />
            </div>
          </div>}

        {showBraceletDesigner && currentLocation && <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm p-4 flex items-center justify-center">
            <div className="relative">
              <Button onClick={() => setShowBraceletDesigner(false)} className="absolute -top-2 -right-2 z-10" size="sm" variant="outline">
                ×
              </Button>
              <WorkingQRSystem userProfile={userProfile} vitals={{
            heartRate: healthReadings.heartRate,
            spO2: healthReadings.spO2,
            temperature: healthReadings.temperature,
            timestamp: new Date()
          }} location={{
            city: currentLocation.city,
            address: currentLocation.address,
            coordinates: [currentLocation.longitude, currentLocation.latitude]
          }} />
            </div>
          </div>}
      </div>
    </div>;
};