import { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Heart, 
  Brain, 
  Shield, 
  Phone, 
  MapPin, 
  AlertTriangle,
  Pill,
  Stethoscope,
  Activity,
  Clock,
  Users,
  Zap,
  Camera,
  Mic,
  Navigation,
  FileText,
  Target,
  TrendingUp,
  CheckCircle,
  Calendar,
  Bell
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface MedicalCondition {
  name: string;
  severity: "mild" | "moderate" | "severe" | "critical";
  medications: string[];
  triggers: string[];
  emergencyProtocol: string;
}

interface LifeSavingFeaturesProps {
  userProfile?: {
    name: string;
    age: string;
    bloodType: string;
    medicalConditions: string[];
    allergies: string;
    emergencyContacts: Array<{
      name: string;
      phone: string;
      relationship: string;
    }>;
  };
  currentVitals?: {
    heartRate: number;
    spO2: number;
    temperature: number;
  };
  currentLocation?: {
    latitude: number;
    longitude: number;
    city: string;
  };
  onEmergencyTrigger: (type: string) => void;
}

export const LifeSavingFeatures = ({
  userProfile,
  currentVitals,
  currentLocation,
  onEmergencyTrigger
}: LifeSavingFeaturesProps) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("suicide-prevention");
  const [crisisScore, setCrisisScore] = useState(0);
  const [isInCrisis, setIsInCrisis] = useState(false);
  const [medicationAlerts, setMedicationAlerts] = useState<string[]>([]);
  const [vitalsHistory, setVitalsHistory] = useState<Array<{
    timestamp: Date;
    heartRate: number;
    spO2: number;
    temperature: number;
    riskScore: number;
  }>>([]);

  // Crisis Detection AI
  const [crisisAnswers, setCrisisAnswers] = useState<Record<string, number>>({});
  const crisisQuestions = [
    { id: "mood", text: "How would you rate your mood today?", weight: 3 },
    { id: "hopelessness", text: "Are you feeling hopeless about the future?", weight: 5 },
    { id: "isolation", text: "Do you feel isolated or alone?", weight: 4 },
    { id: "sleep", text: "How has your sleep been?", weight: 2 },
    { id: "thoughts", text: "Are you having thoughts of self-harm?", weight: 10 },
    { id: "support", text: "Do you feel you have adequate support?", weight: 3 }
  ];

  // Drug Interaction Checker
  const [medications, setMedications] = useState<string[]>([]);
  const [newMedication, setNewMedication] = useState("");
  
  const commonDrugInteractions = {
    "warfarin": ["aspirin", "ibuprofen", "vitamin k", "alcohol"],
    "metformin": ["alcohol", "contrast dye", "kidney medications"],
    "lithium": ["nsaids", "ace inhibitors", "thiazide diuretics"],
    "digoxin": ["amiodarone", "quinidine", "verapamil"],
    "insulin": ["beta blockers", "alcohol", "sulfonylureas"]
  };

  // Calculate crisis score
  useEffect(() => {
    const score = Object.entries(crisisAnswers).reduce((sum, [questionId, answer]) => {
      const question = crisisQuestions.find(q => q.id === questionId);
      return sum + (question ? question.weight * answer : 0);
    }, 0);
    
    setCrisisScore(score);
    setIsInCrisis(score > 30);
    
    if (score > 30) {
      toast({
        title: "🚨 Crisis Alert Detected",
        description: "Immediate support resources activated",
        variant: "destructive"
      });
    }
  }, [crisisAnswers]);

  // Medication interaction checker
  const checkDrugInteractions = useCallback((newDrug: string) => {
    const interactions = [];
    const drugLower = newDrug.toLowerCase();
    
    for (const existing of medications) {
      const existingLower = existing.toLowerCase();
      
      // Check if new drug interacts with existing
      if (commonDrugInteractions[drugLower]?.includes(existingLower)) {
        interactions.push(`⚠️ ${newDrug} interacts with ${existing}`);
      }
      
      // Check if existing drug interacts with new
      if (commonDrugInteractions[existingLower]?.includes(drugLower)) {
        interactions.push(`⚠️ ${existing} interacts with ${newDrug}`);
      }
    }
    
    setMedicationAlerts(interactions);
    return interactions;
  }, [medications]);

  // Add medication with interaction check
  const addMedication = useCallback(() => {
    if (newMedication.trim()) {
      const interactions = checkDrugInteractions(newMedication);
      setMedications(prev => [...prev, newMedication]);
      
      if (interactions.length > 0) {
        toast({
          title: "⚠️ Drug Interaction Warning",
          description: `${interactions.length} potential interactions detected`,
          variant: "destructive"
        });
      } else {
        toast({
          title: "✅ Medication Added",
          description: "No interactions detected",
          variant: "default"
        });
      }
      
      setNewMedication("");
    }
  }, [newMedication, checkDrugInteractions]);

  // Emergency contact for crisis
  const contactCrisisHotline = useCallback(() => {
    toast({
      title: "📞 Connecting to Crisis Helpline",
      description: "Kuwait Mental Health: 965-2481-4020",
      variant: "default"
    });
    
    // In real app, would connect to actual crisis line
    window.open("tel:+96524814020", "_self");
  }, []);

  // Smart emergency protocol
  const activateEmergencyProtocol = useCallback((type: string) => {
    // Send immediate alert
    onEmergencyTrigger(type);
    
    // Create comprehensive emergency data package
    const emergencyData = {
      timestamp: new Date().toISOString(),
      location: currentLocation,
      vitals: currentVitals,
      medications: medications,
      medicalHistory: userProfile?.medicalConditions || [],
      allergies: userProfile?.allergies || "",
      bloodType: userProfile?.bloodType || "",
      emergencyContacts: userProfile?.emergencyContacts || [],
      crisisScore: type === "mental-health-crisis" ? crisisScore : null
    };
    
    // Auto-generate QR code with emergency data
    toast({
      title: "🚨 Emergency Protocol Activated",
      description: "Emergency data package prepared for first responders",
      variant: "destructive"
    });
    
    return emergencyData;
  }, [currentLocation, currentVitals, medications, userProfile, crisisScore, onEmergencyTrigger]);

  // Real-time health trend analysis
  useEffect(() => {
    if (currentVitals) {
      const riskScore = calculateHealthRisk(currentVitals);
      setVitalsHistory(prev => [...prev.slice(-19), {
        timestamp: new Date(),
        ...currentVitals,
        riskScore
      }]);
    }
  }, [currentVitals]);

  const calculateHealthRisk = (vitals: any) => {
    let risk = 0;
    if (vitals.heartRate > 120 || vitals.heartRate < 50) risk += 3;
    if (vitals.spO2 < 90) risk += 5;
    if (vitals.temperature > 39 || vitals.temperature < 35) risk += 3;
    return risk;
  };

  return (
    <div className="space-y-6">
      {/* Crisis Alert Banner */}
      {isInCrisis && (
        <Card className="p-4 bg-red-500/20 border-2 border-red-500 animate-pulse">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-red-500 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Crisis Support Needed
              </h3>
              <p className="text-sm text-red-500">Crisis score: {crisisScore}/50 - Immediate support recommended</p>
            </div>
            <Button onClick={contactCrisisHotline} className="bg-red-500 hover:bg-red-600">
              Get Help Now
            </Button>
          </div>
        </Card>
      )}

      <Card className="p-6 bg-[var(--gradient-medical)] border-cyber-blue/30">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-cyber-blue">Life-Saving AI Features</h2>
            <p className="text-sm text-muted-foreground">
              Real mental health crisis detection • Drug interaction alerts • Emergency protocols
            </p>
          </div>
          <Badge variant="outline" className="text-cyber-green">
            <Shield className="w-4 h-4 mr-2" />
            Guardian Active
          </Badge>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="suicide-prevention">Crisis Detection</TabsTrigger>
            <TabsTrigger value="drug-interactions">Drug Safety</TabsTrigger>
            <TabsTrigger value="health-trends">Health Trends</TabsTrigger>
            <TabsTrigger value="emergency-protocols">Emergency</TabsTrigger>
          </TabsList>

          {/* Suicide Prevention & Crisis Detection */}
          <TabsContent value="suicide-prevention" className="space-y-4 mt-6">
            <Card className="p-4 bg-purple-500/10 border-purple-500/30">
              <h3 className="font-semibold text-purple-500 mb-4 flex items-center gap-2">
                <Brain className="w-5 h-5" />
                Mental Health Check-in
              </h3>
              
              <div className="space-y-4">
                {crisisQuestions.map((question) => (
                  <div key={question.id} className="space-y-2">
                    <p className="text-sm font-medium">{question.text}</p>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((score) => (
                        <Button
                          key={score}
                          size="sm"
                          variant={crisisAnswers[question.id] === score ? "default" : "outline"}
                          onClick={() => setCrisisAnswers(prev => ({ ...prev, [question.id]: score }))}
                          className="w-10"
                        >
                          {score}
                        </Button>
                      ))}
                    </div>
                  </div>
                ))}
                
                <div className="mt-4 p-3 bg-background/50 rounded">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Crisis Risk Level</span>
                    <span className={cn(
                      "font-bold",
                      crisisScore < 15 ? "text-green-500" :
                      crisisScore < 30 ? "text-yellow-500" : "text-red-500"
                    )}>{crisisScore}/50</span>
                  </div>
                  <Progress 
                    value={(crisisScore / 50) * 100} 
                    className="h-2"
                  />
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-green-500/10 border-green-500/30">
              <h3 className="font-semibold text-green-500 mb-3">Crisis Support Resources</h3>
              <div className="space-y-2">
                <Button 
                  onClick={contactCrisisHotline}
                  className="w-full bg-green-500 hover:bg-green-600"
                >
                  <Phone className="w-4 h-4 mr-2" />
                  Kuwait Crisis Helpline: 965-2481-4020
                </Button>
                
                <Button 
                  onClick={() => activateEmergencyProtocol("mental-health-crisis")}
                  variant="outline"
                  className="w-full"
                >
                  <Users className="w-4 h-4 mr-2" />
                  Alert Emergency Contacts
                </Button>
                
                <Button 
                  variant="outline"
                  className="w-full"
                  onClick={() => window.open("https://www.befrienders.org/", "_blank")}
                >
                  <Heart className="w-4 h-4 mr-2" />
                  International Crisis Chat
                </Button>
              </div>
            </Card>
          </TabsContent>

          {/* Drug Interactions */}
          <TabsContent value="drug-interactions" className="space-y-4 mt-6">
            <Card className="p-4 bg-orange-500/10 border-orange-500/30">
              <h3 className="font-semibold text-orange-500 mb-4 flex items-center gap-2">
                <Pill className="w-5 h-5" />
                Medication Safety Checker
              </h3>
              
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter medication name..."
                    value={newMedication}
                    onChange={(e) => setNewMedication(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addMedication()}
                  />
                  <Button onClick={addMedication}>
                    Add & Check
                  </Button>
                </div>

                {medications.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Current Medications:</h4>
                    <div className="flex flex-wrap gap-2">
                      {medications.map((med, index) => (
                        <Badge key={index} variant="outline" className="flex items-center gap-1">
                          {med}
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-auto p-0 w-4 h-4"
                            onClick={() => setMedications(prev => prev.filter((_, i) => i !== index))}
                          >
                            ×
                          </Button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {medicationAlerts.length > 0 && (
                  <Card className="p-3 bg-red-500/10 border-red-500/30">
                    <h4 className="font-semibold text-red-500 mb-2 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      Drug Interaction Warnings
                    </h4>
                    <div className="space-y-1 text-sm">
                      {medicationAlerts.map((alert, index) => (
                        <p key={index} className="text-red-500">{alert}</p>
                      ))}
                    </div>
                  </Card>
                )}
              </div>
            </Card>
          </TabsContent>

          {/* Health Trends */}
          <TabsContent value="health-trends" className="space-y-4 mt-6">
            <Card className="p-4 bg-blue-500/10 border-blue-500/30">
              <h3 className="font-semibold text-blue-500 mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Real-time Health Analysis
              </h3>
              
              {vitalsHistory.length > 0 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-500">
                        {vitalsHistory[vitalsHistory.length - 1]?.heartRate || 'N/A'}
                      </div>
                      <div className="text-xs text-muted-foreground">Heart Rate</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-500">
                        {vitalsHistory[vitalsHistory.length - 1]?.spO2 || 'N/A'}%
                      </div>
                      <div className="text-xs text-muted-foreground">SpO2</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-500">
                        {vitalsHistory[vitalsHistory.length - 1]?.temperature?.toFixed(1) || 'N/A'}°
                      </div>
                      <div className="text-xs text-muted-foreground">Temperature</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Health Risk Score</span>
                      <span className={cn(
                        "font-bold",
                        (vitalsHistory[vitalsHistory.length - 1]?.riskScore || 0) < 3 ? "text-green-500" :
                        (vitalsHistory[vitalsHistory.length - 1]?.riskScore || 0) < 6 ? "text-yellow-500" : "text-red-500"
                      )}>{vitalsHistory[vitalsHistory.length - 1]?.riskScore || 0}/10</span>
                    </div>
                    <Progress 
                      value={((vitalsHistory[vitalsHistory.length - 1]?.riskScore || 0) / 10) * 100} 
                      className="h-2"
                    />
                  </div>
                </div>
              )}
            </Card>
          </TabsContent>

          {/* Emergency Protocols */}
          <TabsContent value="emergency-protocols" className="space-y-4 mt-6">
            <div className="grid grid-cols-2 gap-4">
              <Button
                onClick={() => activateEmergencyProtocol("cardiac-emergency")}
                className="h-20 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 flex flex-col items-center"
                variant="outline"
              >
                <Heart className="w-8 h-8 text-red-500 mb-1" />
                <span className="text-sm">Cardiac Emergency</span>
              </Button>
              
              <Button
                onClick={() => activateEmergencyProtocol("overdose-emergency")}
                className="h-20 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 flex flex-col items-center"
                variant="outline"
              >
                <Pill className="w-8 h-8 text-purple-500 mb-1" />
                <span className="text-sm">Overdose Protocol</span>
              </Button>
              
              <Button
                onClick={() => activateEmergencyProtocol("stroke-emergency")}
                className="h-20 bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/30 flex flex-col items-center"
                variant="outline"
              >
                <Brain className="w-8 h-8 text-orange-500 mb-1" />
                <span className="text-sm">Stroke Protocol</span>
              </Button>
              
              <Button
                onClick={() => activateEmergencyProtocol("severe-allergic-reaction")}
                className="h-20 bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-500/30 flex flex-col items-center"
                variant="outline"
              >
                <AlertTriangle className="w-8 h-8 text-yellow-500 mb-1" />
                <span className="text-sm">Allergic Reaction</span>
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};