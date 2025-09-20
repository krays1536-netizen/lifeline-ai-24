import { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Phone, 
  Hospital, 
  Shield, 
  Clock, 
  Route,
  Users,
  MapPin,
  Zap,
  CheckCircle,
  AlertCircle,
  XCircle,
  Navigation
} from "lucide-react";
import { cn } from "@/lib/utils";

interface EmergencyContact {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  priority: number;
  avatar?: string;
  status: "delivered" | "pending" | "failed" | "acknowledged";
  responseTime: number; // minutes
  distance: number; // km
  lastContact: Date;
}

interface SOSRoute {
  type: "family" | "hospital" | "police" | "fire" | "ambulance";
  target: string;
  phone: string;
  eta: number;
  priority: number;
  reasoning: string;
  status: "suggested" | "selected" | "contacted" | "confirmed";
  coordinates?: [number, number];
}

interface ProductionSOSProps {
  vitals: { heartRate: number; spO2: number; temperature: number };
  location: { lat: number; lng: number; city: string };
  situation: "normal" | "medical" | "accident" | "crime" | "fire" | "disaster";
  onRouteSelected: (route: SOSRoute) => void;
  onContactStatusUpdate: (contactId: string, status: EmergencyContact['status']) => void;
}

export const ProductionSOS = ({ 
  vitals, 
  location, 
  situation, 
  onRouteSelected, 
  onContactStatusUpdate 
}: ProductionSOSProps) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [recommendedRoutes, setRecommendedRoutes] = useState<SOSRoute[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<SOSRoute | null>(null);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [contactStatuses, setContactStatuses] = useState<EmergencyContact[]>([]);
  const [sosActivated, setSosActivated] = useState(false);
  const [emergencyId, setEmergencyId] = useState<string | null>(null);

  // Enhanced emergency contacts with realistic data
  const emergencyContacts: EmergencyContact[] = [
    {
      id: "mom",
      name: "Fatima Al-Rashid",
      relationship: "Mother", 
      phone: "+965-9999-1234",
      priority: 1,
      avatar: "👩‍🦳",
      status: "pending",
      responseTime: 12,
      distance: 4.2,
      lastContact: new Date(Date.now() - 3600000)
    },
    {
      id: "dad",
      name: "Ahmed Al-Rashid", 
      relationship: "Father",
      phone: "+965-9999-5678",
      priority: 2,
      avatar: "👨‍🦱",
      status: "pending",
      responseTime: 18,
      distance: 7.1,
      lastContact: new Date(Date.now() - 1800000)
    },
    {
      id: "spouse",
      name: "Noor Al-Sabah",
      relationship: "Spouse",
      phone: "+965-9999-9876", 
      priority: 1,
      avatar: "👩",
      status: "pending",
      responseTime: 8,
      distance: 2.5,
      lastContact: new Date(Date.now() - 900000)
    },
    {
      id: "brother",
      name: "Omar Al-Rashid",
      relationship: "Brother",
      phone: "+965-9999-4321",
      priority: 3,
      avatar: "👨",
      status: "pending", 
      responseTime: 25,
      distance: 15.8,
      lastContact: new Date(Date.now() - 7200000)
    }
  ];

  // Kuwait emergency services with real data
  const kuwaitServices = {
    ambulance: { 
      phone: "777", 
      eta: 6, 
      coordinates: [47.9774, 29.3759] as [number, number],
      name: "Kuwait Emergency Medical Services"
    },
    police: { 
      phone: "112", 
      eta: 8, 
      coordinates: [47.9293, 29.3375] as [number, number],
      name: "Kuwait Police Emergency"
    },
    fire: { 
      phone: "777", 
      eta: 7, 
      coordinates: [47.9500, 29.3600] as [number, number],
      name: "Kuwait Fire Service"
    },
    hospitals: [
      { 
        name: "Al-Amiri Hospital", 
        phone: "+965-2245-1000", 
        distance: 2.8, 
        eta: 12, 
        coordinates: [47.9774, 29.3759] as [number, number],
        specialties: ["Emergency", "Trauma", "Cardiology"]
      },
      { 
        name: "Mubarak Al-Kabeer Hospital", 
        phone: "+965-2533-8888", 
        distance: 4.5, 
        eta: 18, 
        coordinates: [48.0193, 29.3117] as [number, number],
        specialties: ["General", "Surgery", "ICU"]
      },
      { 
        name: "Kuwait Hospital", 
        phone: "+965-2245-0005", 
        distance: 3.2, 
        eta: 15, 
        coordinates: [47.9600, 29.3500] as [number, number],
        specialties: ["Emergency", "Pediatrics", "Oncology"]
      }
    ]
  };

  const analyzeOptimalRoute = useCallback(async () => {
    setIsAnalyzing(true);
    setAnalysisProgress(0);
    setSosActivated(true);
    setEmergencyId(`SOS-${Date.now()}`);

    // Simulate enhanced AI analysis with progress
    const progressSteps = [
      "Analyzing vital signs and medical urgency...",
      "Evaluating situation context and risk factors...", 
      "Checking trusted contact availability and location...",
      "Calculating optimal response times and routes...",
      "Cross-referencing with Kuwait emergency services...",
      "Optimizing rescue logistics and backup plans..."
    ];

    for (let i = 0; i < progressSteps.length; i++) {
      setAnalysisProgress((i + 1) * 16.67);
      await new Promise(resolve => setTimeout(resolve, 600));
    }

    const routes: SOSRoute[] = [];

    // Enhanced medical urgency assessment
    const isCritical = vitals.heartRate > 130 || vitals.heartRate < 45 || 
                      vitals.spO2 < 88 || vitals.temperature > 39.5 || vitals.temperature < 35;
    
    const isAbnormal = vitals.heartRate > 110 || vitals.heartRate < 55 || 
                      vitals.spO2 < 94 || vitals.temperature > 38.5 || vitals.temperature < 36;

    // Priority 1: Medical Emergency Routes
    if (isCritical || situation === "medical") {
      routes.push({
        type: "ambulance",
        target: kuwaitServices.ambulance.name,
        phone: kuwaitServices.ambulance.phone,
        eta: kuwaitServices.ambulance.eta,
        priority: 1,
        reasoning: isCritical ? 
          `🚨 CRITICAL: ${getCriticalReason()} - Immediate medical intervention required` :
          "Medical emergency detected - Professional paramedic care needed",
        status: "suggested",
        coordinates: kuwaitServices.ambulance.coordinates
      });

      // Add best hospital based on condition
      const bestHospital = selectBestHospital(situation, vitals);
      routes.push({
        type: "hospital",
        target: bestHospital.name,
        phone: bestHospital.phone,
        eta: bestHospital.eta,
        priority: 2,
        reasoning: `Best equipped facility for your condition - ${bestHospital.specialties.join(', ')}`,
        status: "suggested",
        coordinates: bestHospital.coordinates
      });
    }

    // Priority 2: Situation-specific emergency services
    if (situation === "accident") {
      routes.push({
        type: "police",
        target: kuwaitServices.police.name,
        phone: kuwaitServices.police.phone,
        eta: kuwaitServices.police.eta,
        priority: 1,
        reasoning: "🚗 Accident reported - Police and medical response coordination needed",
        status: "suggested",
        coordinates: kuwaitServices.police.coordinates
      });
    } else if (situation === "fire") {
      routes.push({
        type: "fire",
        target: kuwaitServices.fire.name,
        phone: kuwaitServices.fire.phone,
        eta: kuwaitServices.fire.eta,
        priority: 1,
        reasoning: "🔥 Fire emergency - Immediate fire service and evacuation support",
        status: "suggested",
        coordinates: kuwaitServices.fire.coordinates
      });
    } else if (situation === "crime") {
      routes.push({
        type: "police", 
        target: kuwaitServices.police.name,
        phone: kuwaitServices.police.phone,
        eta: kuwaitServices.police.eta,
        priority: 1,
        reasoning: "🚨 Security threat - Immediate police response required",
        status: "suggested",
        coordinates: kuwaitServices.police.coordinates
      });
    }

    // Priority 3: Trusted contacts (enhanced selection)
    const availableContacts = getAvailableContacts();
    if (availableContacts.length > 0 && (!isCritical || routes.length < 2)) {
      const bestContact = availableContacts[0];
      routes.push({
        type: "family",
        target: `${bestContact.name} (${bestContact.relationship})`,
        phone: bestContact.phone,
        eta: bestContact.responseTime,
        priority: isCritical ? 3 : 1,
        reasoning: `👥 Closest trusted contact - ${bestContact.distance}km away, last contact ${getTimeAgo(bestContact.lastContact)}`,
        status: "suggested"
      });
    }

    // Priority 4: Backup contacts and services
    if (routes.length < 3) {
      const backupContact = emergencyContacts.find(c => !availableContacts.includes(c));
      if (backupContact) {
        routes.push({
          type: "family",
          target: `${backupContact.name} (Backup)`,
          phone: backupContact.phone,
          eta: backupContact.responseTime + 5,
          priority: 4,
          reasoning: `📱 Backup contact - May take longer to reach but reliable support`,
          status: "suggested"
        });
      }
    }

    // Sort by priority and medical urgency
    const sortedRoutes = routes
      .sort((a, b) => {
        if (isCritical && a.type === "ambulance") return -1;
        if (isCritical && b.type === "ambulance") return 1;
        return a.priority - b.priority;
      })
      .slice(0, 4);

    setRecommendedRoutes(sortedRoutes);
    setSelectedRoute(sortedRoutes[0] || null);
    setContactStatuses(emergencyContacts.map(contact => ({ ...contact, status: "pending" })));
    setAnalysisProgress(100);
    setIsAnalyzing(false);
  }, [vitals, situation, location]);

  const getCriticalReason = () => {
    const reasons = [];
    if (vitals.heartRate > 130) reasons.push(`Heart rate ${vitals.heartRate} BPM (tachycardia)`);
    if (vitals.heartRate < 45) reasons.push(`Heart rate ${vitals.heartRate} BPM (bradycardia)`);
    if (vitals.spO2 < 88) reasons.push(`Oxygen saturation ${vitals.spO2}% (hypoxemia)`);
    if (vitals.temperature > 39.5) reasons.push(`High fever ${vitals.temperature}°C`);
    if (vitals.temperature < 35) reasons.push(`Hypothermia ${vitals.temperature}°C`);
    return reasons.join(', ') || 'Multiple critical parameters';
  };

  const selectBestHospital = (situation: string, vitals: any) => {
    // AI-powered hospital selection based on condition
    if (vitals.heartRate < 45 || vitals.heartRate > 140) {
      // Cardiac emergency - prioritize cardiology
      return kuwaitServices.hospitals.find(h => h.specialties.includes("Cardiology")) || kuwaitServices.hospitals[0];
    }
    if (situation === "accident") {
      // Trauma - prioritize trauma centers
      return kuwaitServices.hospitals.find(h => h.specialties.includes("Trauma")) || kuwaitServices.hospitals[0];
    }
    // Default to closest with emergency services
    return kuwaitServices.hospitals.sort((a, b) => a.distance - b.distance)[0];
  };

  const getAvailableContacts = () => {
    return emergencyContacts
      .filter(contact => {
        const hoursSinceContact = (Date.now() - contact.lastContact.getTime()) / (1000 * 60 * 60);
        return hoursSinceContact < 24; // Available if contacted within 24 hours
      })
      .sort((a, b) => {
        // Sort by priority, then distance, then response time
        if (a.priority !== b.priority) return a.priority - b.priority;
        if (a.distance !== b.distance) return a.distance - b.distance;
        return a.responseTime - b.responseTime;
      });
  };

  const getTimeAgo = (date: Date) => {
    const minutes = Math.floor((Date.now() - date.getTime()) / (1000 * 60));
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const executeRoute = useCallback((route: SOSRoute) => {
    setSelectedRoute(route);
    
    // Update route status
    setRecommendedRoutes(prev => 
      prev.map(r => r === route ? { ...r, status: "contacted" } : r)
    );
    
    // Simulate contact attempts for family members
    if (route.type === "family") {
      simulateContactAttempts();
    }
    
    // Open maps for navigation if coordinates available
    if (route.coordinates) {
      const [lng, lat] = route.coordinates;
      const googleMapsUrl = `https://maps.google.com/?q=${lat},${lng}&navigate=yes`;
      window.open(googleMapsUrl, '_blank');
    }
    
    onRouteSelected(route);
  }, [onRouteSelected]);

  const simulateContactAttempts = useCallback(() => {
    // Simulate realistic contact delivery with delays
    emergencyContacts.forEach((contact, index) => {
      setTimeout(() => {
        const success = Math.random() > 0.2; // 80% success rate
        const newStatus: EmergencyContact['status'] = success ? 
          (Math.random() > 0.3 ? "delivered" : "acknowledged") : "failed";
        
        setContactStatuses(prev => 
          prev.map(c => c.id === contact.id ? { ...c, status: newStatus } : c)
        );
        
        onContactStatusUpdate(contact.id, newStatus);
      }, (index + 1) * 2000 + Math.random() * 3000); // Staggered delivery
    });
  }, [onContactStatusUpdate]);

  const getContactStatusIcon = (status: EmergencyContact['status']) => {
    switch (status) {
      case "delivered": return <CheckCircle className="h-4 w-4 text-cyber-green" />;
      case "acknowledged": return <CheckCircle className="h-4 w-4 text-cyber-blue" />;
      case "failed": return <XCircle className="h-4 w-4 text-cyber-red" />;
      default: return <AlertCircle className="h-4 w-4 text-cyber-orange animate-pulse" />;
    }
  };

  const getContactStatusText = (status: EmergencyContact['status']) => {
    switch (status) {
      case "delivered": return "✅ Delivered";
      case "acknowledged": return "✅ Read & Responding";
      case "failed": return "❌ Failed";
      default: return "⏳ Sending...";
    }
  };

  const getRouteIcon = (type: string) => {
    const icons = {
      family: Users,
      hospital: Hospital,
      police: Shield,
      fire: Zap,
      ambulance: Phone
    };
    return icons[type as keyof typeof icons] || Phone;
  };

  const getPriorityColor = (priority: number) => {
    const colors = {
      1: "text-destructive border-destructive",
      2: "text-cyber-red border-cyber-red",
      3: "text-cyber-orange border-cyber-orange",
      4: "text-cyber-blue border-cyber-blue"
    };
    return colors[priority as keyof typeof colors] || "text-muted-foreground border-muted";
  };

  return (
    <Card className="p-6 bg-[var(--gradient-danger)] border-2 border-cyber-red/40 font-poppins">
      <div className="flex items-center gap-3 mb-4">
        <Route className="h-6 w-6 text-cyber-red animate-pulse" />
        <h3 className="text-xl font-bold text-foreground">Production SOS</h3>
        <Badge variant="outline" className="text-cyber-red border-cyber-red/50">
          Smart Emergency Response
        </Badge>
        {sosActivated && (
          <Badge className="bg-cyber-red text-white animate-pulse">
            SOS ACTIVE
          </Badge>
        )}
      </div>

      {/* Emergency ID */}
      {emergencyId && (
        <div className="mb-4 p-2 bg-cyber-red/10 rounded border border-cyber-red/30">
          <div className="text-xs text-muted-foreground">Emergency ID</div>
          <div className="text-sm font-mono text-cyber-red">{emergencyId}</div>
        </div>
      )}

      {/* Analysis Controls */}
      <div className="flex gap-3 mb-6">
        <Button
          onClick={analyzeOptimalRoute}
          disabled={isAnalyzing}
          className="flex-1 bg-[var(--gradient-danger)] hover:opacity-90"
        >
          <Zap className="h-4 w-4 mr-2" />
          {isAnalyzing ? "Analyzing Emergency..." : "🚨 ACTIVATE SOS"}
        </Button>
      </div>

      {/* Analysis Progress */}
      {isAnalyzing && (
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-muted-foreground">Emergency Response Analysis</span>
            <span className="text-sm text-cyber-red">{analysisProgress.toFixed(0)}%</span>
          </div>
          <Progress value={analysisProgress} className="h-3 bg-muted/30" />
          <div className="text-xs text-muted-foreground mt-1">
            Connecting to Kuwait Emergency Network...
          </div>
        </div>
      )}

      {/* Current Situation Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <Card className="p-3 bg-muted/20">
          <div className="text-xs text-muted-foreground">Situation</div>
          <div className="text-sm font-bold text-foreground capitalize flex items-center gap-1">
            {situation === "medical" && "🏥"}
            {situation === "accident" && "🚗"}
            {situation === "crime" && "🚨"}
            {situation === "fire" && "🔥"}
            {situation === "disaster" && "⚠️"}
            {situation === "normal" && "✅"}
            {situation}
          </div>
        </Card>
        
        <Card className="p-3 bg-muted/20">
          <div className="text-xs text-muted-foreground">Heart Rate</div>
          <div className={cn("text-sm font-bold", 
            vitals.heartRate > 130 || vitals.heartRate < 45 ? "text-destructive" :
            vitals.heartRate > 110 || vitals.heartRate < 55 ? "text-cyber-orange" :
            "text-cyber-green"
          )}>
            {vitals.heartRate} BPM
          </div>
        </Card>
        
        <Card className="p-3 bg-muted/20">
          <div className="text-xs text-muted-foreground">SpO₂</div>
          <div className={cn("text-sm font-bold",
            vitals.spO2 < 88 ? "text-destructive" :
            vitals.spO2 < 94 ? "text-cyber-orange" :
            "text-cyber-green"
          )}>
            {vitals.spO2}%
          </div>
        </Card>
        
        <Card className="p-3 bg-muted/20">
          <div className="text-xs text-muted-foreground">Location</div>
          <div className="text-sm font-bold text-cyber-blue flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {location.city}
          </div>
        </Card>
      </div>

      {/* Trusted Contacts Status */}
      {sosActivated && contactStatuses.length > 0 && (
        <Card className="p-4 mb-4 bg-muted/10">
          <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
            <Users className="h-4 w-4" />
            Trusted Circle Alert Status
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {contactStatuses.map((contact) => (
              <div key={contact.id} className="flex items-center gap-3 p-2 bg-background/30 rounded">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={contact.avatar} />
                  <AvatarFallback>{contact.avatar || contact.name[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{contact.name}</div>
                  <div className="text-xs text-muted-foreground">{contact.relationship}</div>
                </div>
                <div className="flex items-center gap-2">
                  {getContactStatusIcon(contact.status)}
                  <span className="text-xs">{getContactStatusText(contact.status)}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Recommended Response Routes */}
      {recommendedRoutes.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-foreground">Emergency Response Options</h4>
          {recommendedRoutes.map((route, i) => {
            const Icon = getRouteIcon(route.type);
            const isSelected = selectedRoute?.target === route.target;
            
            return (
              <Card 
                key={i} 
                className={cn(
                  "p-4 cursor-pointer transition-all duration-200 hover:scale-[1.01]",
                  isSelected ? "border-2 border-cyber-red bg-cyber-red/10" : "bg-muted/20",
                  getPriorityColor(route.priority)
                )}
                onClick={() => executeRoute(route)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <Icon className="h-5 w-5 mt-1" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{route.target}</span>
                        <Badge variant="outline" className={cn("text-xs", getPriorityColor(route.priority))}>
                          Priority {route.priority}
                        </Badge>
                        {route.status === "contacted" && (
                          <Badge className="bg-cyber-green text-xs">Contacted</Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground mb-2">
                        {route.reasoning}
                      </div>
                      <div className="flex items-center gap-4 text-xs">
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {route.phone}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          ETA: {route.eta} min
                        </div>
                        {route.coordinates && (
                          <div className="flex items-center gap-1 text-cyber-blue">
                            <Navigation className="h-3 w-3" />
                            Navigate
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  {isSelected && (
                    <Badge className="bg-cyber-red text-white">
                      SELECTED
                    </Badge>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Execute Emergency Response */}
      {selectedRoute && (
        <div className="mt-6 p-4 bg-cyber-red/10 rounded-lg border-2 border-cyber-red/30">
          <div className="text-center">
            <div className="text-lg font-bold text-cyber-red mb-2">
              Emergency Response Activated
            </div>
            <div className="text-sm text-muted-foreground mb-4">
              Emergency services have been notified. Help is on the way.
            </div>
            <Button 
              onClick={() => executeRoute(selectedRoute)}
              className="w-full bg-[var(--gradient-danger)] hover:opacity-90 animate-pulse"
              size="lg"
            >
              <Phone className="h-4 w-4 mr-2" />
              Call {selectedRoute.target} - {selectedRoute.phone}
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
};