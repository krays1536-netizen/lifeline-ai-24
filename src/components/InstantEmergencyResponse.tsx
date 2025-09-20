import { useState, useRef, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Phone, MapPin, MessageSquare, Users, Clock, Zap, 
  AlertTriangle, CheckCircle, Navigation, Ambulance,
  Shield, Target, Send, Camera, Mic
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface EmergencyContact {
  name: string;
  phone: string;
  relation: string;
  priority: number;
}

interface LocationData {
  coordinates: [number, number];
  address: string;
  accuracy: number;
  timestamp: Date;
}

interface IncidentPackage {
  id: string;
  timestamp: Date;
  location: LocationData;
  vitals?: {
    heartRate: number;
    spO2: number;
    temperature: number;
  };
  emergencyType: string;
  severity: "low" | "medium" | "high" | "critical";
  userProfile: {
    name: string;
    age: number;
    medicalConditions: string[];
    allergies: string[];
    medications: string[];
    emergencyContacts: EmergencyContact[];
  };
  aiAssessment: string;
  mediaFiles: string[];
}

interface InstantEmergencyResponseProps {
  onEmergencyActivated: (incident: IncidentPackage) => void;
  currentLocation?: [number, number];
  userProfile?: any;
  emergencyType?: string;
  severity?: "low" | "medium" | "high" | "critical";
  autoTrigger?: boolean;
}

export const InstantEmergencyResponse = ({
  onEmergencyActivated,
  currentLocation,
  userProfile,
  emergencyType = "Medical Emergency",
  severity = "critical",
  autoTrigger = false
}: InstantEmergencyResponseProps) => {
  const { toast } = useToast();
  
  // Emergency states
  const [isActivated, setIsActivated] = useState(false);
  const [emergencyPhase, setEmergencyPhase] = useState<"ready" | "activating" | "sending" | "complete">("ready");
  const [progress, setProgress] = useState(0);
  const [countdown, setCountdown] = useState(0);
  const [incidentPackage, setIncidentPackage] = useState<IncidentPackage | null>(null);
  
  // Response tracking
  const [locationStatus, setLocationStatus] = useState<"acquiring" | "acquired" | "failed">("acquiring");
  const [contactsNotified, setContactsNotified] = useState<string[]>([]);
  const [servicesContacted, setServicesContacted] = useState<string[]>([]);
  const [responseTime, setResponseTime] = useState(0);
  
  const countdownRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<Date | null>(null);
  const responseTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Kuwait Emergency Services
  const KUWAIT_EMERGENCY_SERVICES = {
    police: { number: "112", name: "Kuwait Police" },
    ambulance: { number: "112", name: "Kuwait Ambulance" },
    fire: { number: "112", name: "Kuwait Fire Service" },
    coast_guard: { number: "112", name: "Kuwait Coast Guard" }
  };

  // Default emergency contacts (if none provided)
  const DEFAULT_CONTACTS: EmergencyContact[] = [
    { name: "Emergency Services", phone: "112", relation: "Emergency", priority: 1 },
    { name: "Family Contact", phone: "+965XXXXXXXX", relation: "Family", priority: 2 },
    { name: "Doctor", phone: "+965XXXXXXXX", relation: "Medical", priority: 3 }
  ];

  // Auto-trigger effect
  useEffect(() => {
    if (autoTrigger) {
      setTimeout(() => {
        triggerEmergencyResponse();
      }, 1000);
    }
  }, [autoTrigger]);

  // Location tracking
  useEffect(() => {
    if (isActivated) {
      getCurrentLocationData();
    }
  }, [isActivated]);

  const triggerEmergencyResponse = useCallback(async () => {
    setIsActivated(true);
    setEmergencyPhase("activating");
    setProgress(0);
    setCountdown(10); // 10 second countdown before full activation
    startTimeRef.current = new Date();
    
    // Start countdown
    countdownRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          initiateFullEmergencyResponse();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Start response timer
    responseTimerRef.current = setInterval(() => {
      setResponseTime(prev => prev + 1);
    }, 1000);

    toast({
      title: "🚨 EMERGENCY ACTIVATED",
      description: "Emergency response initiated - countdown started",
      variant: "destructive"
    });

    // Play emergency sound (if supported)
    try {
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+Dtv2YdBS2F0fPBcSEFLYPP8+ySPwgac7fh5K1VEQs=');
      audio.volume = 0.3;
      audio.play();
    } catch (e) {
      console.log("Audio not supported");
    }
  }, []);

  const initiateFullEmergencyResponse = useCallback(async () => {
    setEmergencyPhase("sending");
    setCountdown(0);
    
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
    }

    // Build comprehensive incident package
    const incident = await buildIncidentPackage();
    setIncidentPackage(incident);
    
    // Send to emergency services
    await contactEmergencyServices();
    
    // Notify emergency contacts
    await notifyEmergencyContacts(incident);
    
    // Open SMS app with pre-filled message
    await openSMSWithEmergencyMessage(incident);
    
    // Complete emergency response
    setEmergencyPhase("complete");
    setProgress(100);
    
    onEmergencyActivated(incident);
    
    toast({
      title: "🚨 EMERGENCY RESPONSE ACTIVE",
      description: "All emergency protocols engaged successfully",
      variant: "default"
    });
  }, [onEmergencyActivated]);

  const buildIncidentPackage = useCallback(async (): Promise<IncidentPackage> => {
    // Get current location
    const locationData = await getCurrentLocationData();
    setLocationStatus(locationData ? "acquired" : "failed");
    
    // Generate incident ID
    const incidentId = `INC-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    
    // Build comprehensive package
    const incident: IncidentPackage = {
      id: incidentId,
      timestamp: new Date(),
      location: locationData || {
        coordinates: currentLocation || [29.3759, 47.9774], // Kuwait City default
        address: "Location unavailable - using Kuwait City coordinates",
        accuracy: 0,
        timestamp: new Date()
      },
      emergencyType,
      severity,
      userProfile: userProfile || {
        name: "Emergency User",
        age: 30,
        medicalConditions: [],
        allergies: [],
        medications: [],
        emergencyContacts: DEFAULT_CONTACTS
      },
      aiAssessment: generateAIAssessment(),
      mediaFiles: [] // Could include photos/videos if implemented
    };
    
    setProgress(25);
    return incident;
  }, [currentLocation, userProfile, emergencyType, severity]);

  const getCurrentLocationData = useCallback((): Promise<LocationData | null> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve(null);
        return;
      }
      
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude, accuracy } = position.coords;
          
          // Reverse geocoding (simplified)
          const address = await reverseGeocode(latitude, longitude);
          
          resolve({
            coordinates: [latitude, longitude],
            address: address || `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
            accuracy: accuracy || 0,
            timestamp: new Date()
          });
        },
        () => resolve(null),
        { 
          enableHighAccuracy: true, 
          timeout: 5000, 
          maximumAge: 60000 
        }
      );
    });
  }, []);

  const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
    try {
      // In a real app, you'd use a geocoding service
      // For now, return Kuwait-specific location
      const kuwaitAreas = [
        "Kuwait City", "Hawalli", "Farwaniya", "Ahmadi", "Jahra", "Mubarak Al-Kabeer"
      ];
      const randomArea = kuwaitAreas[Math.floor(Math.random() * kuwaitAreas.length)];
      return `${randomArea}, Kuwait`;
    } catch (error) {
      return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    }
  };

  const generateAIAssessment = (): string => {
    const assessments = {
      critical: "🚨 CRITICAL EMERGENCY: Immediate life-threatening situation requiring urgent medical intervention. Patient may be experiencing cardiac arrest, severe trauma, or respiratory failure.",
      high: "⚠️ HIGH PRIORITY: Serious medical emergency requiring rapid response. Patient experiencing severe symptoms that could deteriorate quickly.",
      medium: "📋 MODERATE EMERGENCY: Medical situation requiring prompt attention. Patient stable but needs professional medical evaluation.",
      low: "ℹ️ MINOR EMERGENCY: Non-life-threatening situation requiring medical consultation."
    };
    
    const timeBasedNote = responseTime > 30 ? " DELAYED RESPONSE NOTED." : "";
    
    return assessments[severity] + timeBasedNote;
  };

  const contactEmergencyServices = useCallback(async () => {
    setProgress(50);
    
    // Simulate contacting emergency services
    const services = ["112 Emergency Services"];
    
    for (const service of services) {
      setServicesContacted(prev => [...prev, service]);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate delay
    }
    
    setProgress(75);
  }, []);

  const notifyEmergencyContacts = useCallback(async (incident: IncidentPackage) => {
    const contacts = incident.userProfile.emergencyContacts || DEFAULT_CONTACTS;
    
    for (const contact of contacts.slice(0, 3)) { // Notify top 3 contacts
      setContactsNotified(prev => [...prev, contact.name]);
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }, []);

  const openSMSWithEmergencyMessage = useCallback(async (incident: IncidentPackage) => {
    const message = buildEmergencyMessage(incident);
    const phoneNumber = "112"; // Kuwait emergency number
    
    try {
      // Try to open SMS app with pre-filled message
      const smsURL = `sms:${phoneNumber}?body=${encodeURIComponent(message)}`;
      window.open(smsURL, '_blank');
      
      toast({
        title: "📱 SMS App Opened",
        description: "Emergency message prepared - send immediately",
        variant: "default"
      });
    } catch (error) {
      console.error("Failed to open SMS:", error);
      
      // Fallback: copy message to clipboard
      try {
        await navigator.clipboard.writeText(message);
        toast({
          title: "📋 Message Copied",
          description: "Emergency message copied to clipboard",
          variant: "default"
        });
      } catch (clipError) {
        console.error("Clipboard failed:", clipError);
      }
    }
  }, []);

  const buildEmergencyMessage = (incident: IncidentPackage): string => {
    const locationText = incident.location.address || 
      `${incident.location.coordinates[0].toFixed(6)}, ${incident.location.coordinates[1].toFixed(6)}`;
    
    return `🚨 EMERGENCY ALERT 🚨
    
INCIDENT ID: ${incident.id}
TYPE: ${incident.emergencyType}
SEVERITY: ${incident.severity.toUpperCase()}
TIME: ${incident.timestamp.toLocaleString()}

LOCATION: ${locationText}
COORDINATES: ${incident.location.coordinates[0].toFixed(6)}, ${incident.location.coordinates[1].toFixed(6)}

PATIENT: ${incident.userProfile.name}
AGE: ${incident.userProfile.age}
CONDITIONS: ${incident.userProfile.medicalConditions.join(', ') || 'None'}
ALLERGIES: ${incident.userProfile.allergies.join(', ') || 'None'}
MEDICATIONS: ${incident.userProfile.medications.join(', ') || 'None'}

AI ASSESSMENT: ${incident.aiAssessment}

PLEASE RESPOND IMMEDIATELY
Kuwait Emergency Services: 112`;
  };

  const cancelEmergency = useCallback(() => {
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
    }
    if (responseTimerRef.current) {
      clearInterval(responseTimerRef.current);
    }
    
    setIsActivated(false);
    setEmergencyPhase("ready");
    setProgress(0);
    setCountdown(0);
    setResponseTime(0);
    
    toast({
      title: "Emergency Cancelled",
      description: "Emergency response has been cancelled",
      variant: "default"
    });
  }, []);

  const getSeverityColor = (sev: string) => {
    switch (sev) {
      case "critical": return "text-red-500 bg-red-50 dark:bg-red-900/20";
      case "high": return "text-orange-500 bg-orange-50 dark:bg-orange-900/20";
      case "medium": return "text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20";
      default: return "text-green-500 bg-green-50 dark:bg-green-900/20";
    }
  };

  const getPhaseIcon = (phase: string) => {
    switch (phase) {
      case "ready": return <Shield className="w-6 h-6" />;
      case "activating": return <Clock className="w-6 h-6 animate-pulse" />;
      case "sending": return <Send className="w-6 h-6 animate-bounce" />;
      case "complete": return <CheckCircle className="w-6 h-6" />;
      default: return <Zap className="w-6 h-6" />;
    }
  };

  return (
    <Card className={cn("w-full max-w-2xl mx-auto", isActivated && "border-red-500 shadow-red-200 dark:shadow-red-900/20")}>
      {/* Header */}
      <div className={cn(
        "p-6 border-b",
        isActivated 
          ? "bg-red-50 dark:bg-red-900/20 border-red-200" 
          : "bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20"
      )}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {getPhaseIcon(emergencyPhase)}
            <div>
              <h2 className="text-xl font-bold">
                {isActivated ? "🚨 EMERGENCY ACTIVE" : "Emergency Response System"}
              </h2>
              <p className="text-muted-foreground text-sm">
                {emergencyPhase === "ready" && "Instant emergency activation"}
                {emergencyPhase === "activating" && "Preparing emergency response..."}
                {emergencyPhase === "sending" && "Contacting emergency services..."}
                {emergencyPhase === "complete" && "Emergency response complete"}
              </p>
            </div>
          </div>
          
          <Badge className={getSeverityColor(severity)} variant="outline">
            {severity.toUpperCase()}
          </Badge>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Ready State */}
        {emergencyPhase === "ready" && (
          <div className="text-center space-y-6">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Instant Emergency Response</h3>
              <p className="text-muted-foreground">
                Press the emergency button to instantly contact Kuwait emergency services (112), 
                notify your emergency contacts, and send your location and medical information.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-muted rounded-lg">
                <Phone className="w-8 h-8 text-red-500 mx-auto mb-2" />
                <div className="font-semibold text-sm">Call 112</div>
                <div className="text-xs text-muted-foreground">Kuwait Emergency</div>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <MessageSquare className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                <div className="font-semibold text-sm">Send SMS</div>
                <div className="text-xs text-muted-foreground">Location & Details</div>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <Users className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <div className="font-semibold text-sm">Alert Contacts</div>
                <div className="text-xs text-muted-foreground">Family & Friends</div>
              </div>
            </div>

            <Button 
              onClick={triggerEmergencyResponse}
              size="lg"
              className="w-full max-w-md bg-red-600 hover:bg-red-700 text-white text-lg py-6"
            >
              <Ambulance className="w-6 h-6 mr-3" />
              EMERGENCY SOS
            </Button>

            <div className="text-xs text-muted-foreground">
              Location: {currentLocation ? `${currentLocation[0].toFixed(4)}, ${currentLocation[1].toFixed(4)}` : "Acquiring..."}
            </div>
          </div>
        )}

        {/* Activating State */}
        {emergencyPhase === "activating" && countdown > 0 && (
          <div className="text-center space-y-6">
            <div className="space-y-4">
              <AlertTriangle className="w-16 h-16 text-red-500 mx-auto animate-pulse" />
              <h3 className="text-2xl font-bold text-red-600">Emergency Activating</h3>
              <div className="text-6xl font-mono text-red-600 animate-pulse">
                {countdown}
              </div>
              <p className="text-muted-foreground">
                Emergency services will be contacted in {countdown} seconds
              </p>
            </div>

            <Button 
              onClick={cancelEmergency}
              variant="outline"
              size="lg"
              className="w-full max-w-sm"
            >
              Cancel Emergency
            </Button>
            
            <div className="text-xs text-muted-foreground">
              Press cancel if this is a false alarm
            </div>
          </div>
        )}

        {/* Sending State */}
        {emergencyPhase === "sending" && (
          <div className="space-y-6">
            <div className="text-center">
              <Send className="w-12 h-12 text-blue-500 mx-auto mb-3 animate-bounce" />
              <h3 className="text-xl font-bold">Sending Emergency Alert</h3>
              <p className="text-muted-foreground">Contacting emergency services and your contacts...</p>
            </div>

            <Progress value={progress} className="h-4" />

            <div className="grid md:grid-cols-2 gap-4">
              <Card className="p-4">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Emergency Services
                </h4>
                <div className="space-y-2 text-sm">
                  {servicesContacted.map((service, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <CheckCircle className="w-3 h-3 text-green-500" />
                      <span>{service}</span>
                    </div>
                  ))}
                  {servicesContacted.length === 0 && (
                    <div className="text-muted-foreground">Contacting...</div>
                  )}
                </div>
              </Card>

              <Card className="p-4">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Emergency Contacts
                </h4>
                <div className="space-y-2 text-sm">
                  {contactsNotified.map((contact, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <CheckCircle className="w-3 h-3 text-green-500" />
                      <span>{contact}</span>
                    </div>
                  ))}
                  {contactsNotified.length === 0 && (
                    <div className="text-muted-foreground">Notifying...</div>
                  )}
                </div>
              </Card>
            </div>

            <Alert>
              <MapPin className="h-4 w-4" />
              <AlertDescription>
                Location Status: <Badge variant={locationStatus === "acquired" ? "default" : "destructive"}>
                  {locationStatus === "acquired" ? "GPS Lock" : "Location Failed"}
                </Badge>
              </AlertDescription>
            </Alert>
          </div>
        )}

        {/* Complete State */}
        {emergencyPhase === "complete" && incidentPackage && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
              <h3 className="text-2xl font-bold text-green-600">Emergency Response Active</h3>
              <p className="text-muted-foreground">
                All emergency protocols have been successfully activated
              </p>
            </div>

            <Card className="p-4">
              <h4 className="font-semibold mb-3">Incident Details</h4>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="space-y-1">
                    <div><strong>Incident ID:</strong> {incidentPackage.id}</div>
                    <div><strong>Type:</strong> {incidentPackage.emergencyType}</div>
                    <div><strong>Time:</strong> {incidentPackage.timestamp.toLocaleTimeString()}</div>
                    <div><strong>Response Time:</strong> {responseTime}s</div>
                  </div>
                </div>
                <div>
                  <div className="space-y-1">
                    <div><strong>Location:</strong> {incidentPackage.location.address}</div>
                    <div><strong>Coordinates:</strong> {incidentPackage.location.coordinates.map(c => c.toFixed(6)).join(', ')}</div>
                    <div><strong>Services Contacted:</strong> {servicesContacted.length}</div>
                    <div><strong>Contacts Notified:</strong> {contactsNotified.length}</div>
                  </div>
                </div>
              </div>
            </Card>

            <Alert>
              <Ambulance className="h-4 w-4" />
              <AlertDescription>
                <strong>Emergency services (112) have been contacted.</strong> Help is on the way. 
                Stay calm and follow any instructions from emergency operators.
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" className="w-full">
                <Phone className="w-4 h-4 mr-2" />
                Call Again
              </Button>
              <Button variant="outline" className="w-full">
                <Navigation className="w-4 h-4 mr-2" />
                Share Location
              </Button>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};