import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { 
  Heart, 
  User, 
  Shield, 
  Phone, 
  AlertTriangle, 
  CheckCircle, 
  Brain,
  Pill,
  Activity,
  MapPin,
  Clock,
  ChevronRight,
  ChevronLeft,
  Star
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface EnhancedHealthProfile {
  // Personal Info
  name: string;
  age: string;
  gender: "male" | "female" | "other";
  bloodType: string;
  weight: string;
  height: string;
  
  // Medical History
  medicalConditions: string[];
  currentMedications: Array<{
    name: string;
    dosage: string;
    frequency: string;
    prescribedBy: string;
  }>;
  allergies: string[];
  surgicalHistory: string[];
  familyHistory: string[];
  
  // Emergency Info
  emergencyContacts: Array<{
    name: string;
    phone: string;
    relation: string;
    isPrimary: boolean;
  }>;
  preferredHospital: string;
  insuranceInfo: string;
  
  // Guardian Settings
  language: "en" | "ar";
  guardianSensitivity: "low" | "medium" | "high";
  autoSOSDelay: number; // seconds
  enableFallDetection: boolean;
  enableHeartRateMonitoring: boolean;
  enableVoiceCommands: boolean;
  smartWatchConnected: boolean;
  
  // Lifestyle
  activityLevel: "sedentary" | "light" | "moderate" | "active" | "very_active";
  smokingStatus: "never" | "former" | "current";
  alcoholConsumption: "none" | "occasional" | "moderate" | "heavy";
  
  // Completion
  isComplete: boolean;
  setupDate: Date;
}

interface HealthProfileWizardProps {
  onComplete: (profile: EnhancedHealthProfile) => void;
  onSkip?: () => void;
  initialProfile?: Partial<EnhancedHealthProfile>;
}

const COMMON_CONDITIONS = [
  "Diabetes", "Hypertension", "Heart Disease", "Asthma", "COPD", "Epilepsy",
  "Alzheimer's", "Parkinson's", "Stroke History", "Cancer", "Kidney Disease",
  "Liver Disease", "Mental Health", "Arthritis", "Osteoporosis"
];

const COMMON_ALLERGIES = [
  "Penicillin", "Aspirin", "Nuts", "Shellfish", "Latex", "Sulfa Drugs",
  "Iodine", "Bee Stings", "Dairy", "Gluten", "Eggs", "Soy"
];

const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export const HealthProfileWizard = ({ onComplete, onSkip, initialProfile }: HealthProfileWizardProps) => {
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [totalSteps] = useState(6);
  
  const [profile, setProfile] = useState<EnhancedHealthProfile>({
    name: "",
    age: "",
    gender: "male",
    bloodType: "O+",
    weight: "",
    height: "",
    medicalConditions: [],
    currentMedications: [],
    allergies: [],
    surgicalHistory: [],
    familyHistory: [],
    emergencyContacts: [],
    preferredHospital: "",
    insuranceInfo: "",
    language: "en",
    guardianSensitivity: "medium",
    autoSOSDelay: 15,
    enableFallDetection: true,
    enableHeartRateMonitoring: true,
    enableVoiceCommands: true,
    smartWatchConnected: false,
    activityLevel: "moderate",
    smokingStatus: "never",
    alcoholConsumption: "none",
    isComplete: false,
    setupDate: new Date(),
    ...initialProfile
  });

  const [newMedication, setNewMedication] = useState({
    name: "", dosage: "", frequency: "", prescribedBy: ""
  });

  const progress = (currentStep / totalSteps) * 100;

  const addCondition = (condition: string) => {
    if (!profile.medicalConditions.includes(condition)) {
      setProfile(prev => ({
        ...prev,
        medicalConditions: [...prev.medicalConditions, condition]
      }));
    }
  };

  const removeCondition = (condition: string) => {
    setProfile(prev => ({
      ...prev,
      medicalConditions: prev.medicalConditions.filter(c => c !== condition)
    }));
  };

  const addAllergy = (allergy: string) => {
    if (!profile.allergies.includes(allergy)) {
      setProfile(prev => ({
        ...prev,
        allergies: [...prev.allergies, allergy]
      }));
    }
  };

  const removeAllergy = (allergy: string) => {
    setProfile(prev => ({
      ...prev,
      allergies: prev.allergies.filter(a => a !== allergy)
    }));
  };

  const addMedication = () => {
    if (newMedication.name && newMedication.dosage) {
      setProfile(prev => ({
        ...prev,
        currentMedications: [...prev.currentMedications, newMedication]
      }));
      setNewMedication({ name: "", dosage: "", frequency: "", prescribedBy: "" });
    }
  };

  const addEmergencyContact = () => {
    setProfile(prev => ({
      ...prev,
      emergencyContacts: [...prev.emergencyContacts, {
        name: "",
        phone: "",
        relation: "",
        isPrimary: prev.emergencyContacts.length === 0
      }]
    }));
  };

  const updateEmergencyContact = (index: number, field: string, value: string | boolean) => {
    setProfile(prev => ({
      ...prev,
      emergencyContacts: prev.emergencyContacts.map((contact, i) =>
        i === index ? { ...contact, [field]: value } : contact
      )
    }));
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
    } else {
      completeSetup();
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const completeSetup = () => {
    const completedProfile = {
      ...profile,
      isComplete: true,
      setupDate: new Date()
    };
    
    onComplete(completedProfile);
    
    toast({
      title: "🎉 Health Profile Complete!",
      description: "Guardian AI is now personalized for your health needs",
      variant: "default"
    });
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <User className="w-16 h-16 mx-auto mb-4 text-cyber-blue" />
              <h2 className="text-2xl font-bold text-foreground mb-2">Personal Information</h2>
              <p className="text-muted-foreground">Help us personalize your Guardian AI experience</p>
            </div>
            
            <div className="grid gap-4">
              <div>
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={profile.name}
                  onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter your full name"
                  className="mt-1"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="age">Age *</Label>
                  <Input
                    id="age"
                    type="number"
                    value={profile.age}
                    onChange={(e) => setProfile(prev => ({ ...prev, age: e.target.value }))}
                    placeholder="Age"
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="gender">Gender</Label>
                  <Select value={profile.gender} onValueChange={(value: any) => setProfile(prev => ({ ...prev, gender: value }))}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="bloodType">Blood Type</Label>
                  <Select value={profile.bloodType} onValueChange={(value) => setProfile(prev => ({ ...prev, bloodType: value }))}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {BLOOD_TYPES.map(type => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    value={profile.weight}
                    onChange={(e) => setProfile(prev => ({ ...prev, weight: e.target.value }))}
                    placeholder="70"
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="height">Height (cm)</Label>
                  <Input
                    id="height"
                    type="number"
                    value={profile.height}
                    onChange={(e) => setProfile(prev => ({ ...prev, height: e.target.value }))}
                    placeholder="170"
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Heart className="w-16 h-16 mx-auto mb-4 text-cyber-red" />
              <h2 className="text-2xl font-bold text-foreground mb-2">Medical Conditions</h2>
              <p className="text-muted-foreground">Select any conditions that apply to you</p>
            </div>
            
            <div>
              <Label>Common Conditions</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {COMMON_CONDITIONS.map(condition => (
                  <Button
                    key={condition}
                    variant={profile.medicalConditions.includes(condition) ? "default" : "outline"}
                    size="sm"
                    onClick={() => 
                      profile.medicalConditions.includes(condition) 
                        ? removeCondition(condition)
                        : addCondition(condition)
                    }
                    className="justify-start text-xs"
                  >
                    {condition}
                  </Button>
                ))}
              </div>
            </div>
            
            {profile.medicalConditions.length > 0 && (
              <div>
                <Label>Selected Conditions</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {profile.medicalConditions.map(condition => (
                    <Badge
                      key={condition}
                      variant="default"
                      className="cursor-pointer"
                      onClick={() => removeCondition(condition)}
                    >
                      {condition} ×
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Pill className="w-16 h-16 mx-auto mb-4 text-cyber-purple" />
              <h2 className="text-2xl font-bold text-foreground mb-2">Medications & Allergies</h2>
              <p className="text-muted-foreground">Current medications and known allergies</p>
            </div>
            
            <div>
              <Label>Current Medications</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <Input
                  placeholder="Medication name"
                  value={newMedication.name}
                  onChange={(e) => setNewMedication(prev => ({ ...prev, name: e.target.value }))}
                />
                <Input
                  placeholder="Dosage (e.g., 10mg)"
                  value={newMedication.dosage}
                  onChange={(e) => setNewMedication(prev => ({ ...prev, dosage: e.target.value }))}
                />
                <Input
                  placeholder="Frequency"
                  value={newMedication.frequency}
                  onChange={(e) => setNewMedication(prev => ({ ...prev, frequency: e.target.value }))}
                />
                <Button onClick={addMedication} size="sm">Add</Button>
              </div>
              
              {profile.currentMedications.length > 0 && (
                <div className="mt-4 space-y-2">
                  {profile.currentMedications.map((med, index) => (
                    <div key={index} className="p-2 bg-muted rounded text-sm">
                      <strong>{med.name}</strong> - {med.dosage} ({med.frequency})
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div>
              <Label>Allergies</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {COMMON_ALLERGIES.map(allergy => (
                  <Button
                    key={allergy}
                    variant={profile.allergies.includes(allergy) ? "destructive" : "outline"}
                    size="sm"
                    onClick={() => 
                      profile.allergies.includes(allergy) 
                        ? removeAllergy(allergy)
                        : addAllergy(allergy)
                    }
                    className="justify-start text-xs"
                  >
                    {allergy}
                  </Button>
                ))}
              </div>
              
              {profile.allergies.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {profile.allergies.map(allergy => (
                    <Badge
                      key={allergy}
                      variant="destructive"
                      className="cursor-pointer"
                      onClick={() => removeAllergy(allergy)}
                    >
                      {allergy} ×
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Phone className="w-16 h-16 mx-auto mb-4 text-cyber-green" />
              <h2 className="text-2xl font-bold text-foreground mb-2">Emergency Contacts</h2>
              <p className="text-muted-foreground">People to contact in case of emergency</p>
            </div>
            
            <Button onClick={addEmergencyContact} className="w-full">
              Add Emergency Contact
            </Button>
            
            {profile.emergencyContacts.map((contact, index) => (
              <Card key={index} className="p-4">
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    placeholder="Name"
                    value={contact.name}
                    onChange={(e) => updateEmergencyContact(index, 'name', e.target.value)}
                  />
                  <Input
                    placeholder="Phone"
                    value={contact.phone}
                    onChange={(e) => updateEmergencyContact(index, 'phone', e.target.value)}
                  />
                  <Input
                    placeholder="Relation"
                    value={contact.relation}
                    onChange={(e) => updateEmergencyContact(index, 'relation', e.target.value)}
                  />
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={contact.isPrimary}
                      onCheckedChange={(checked) => updateEmergencyContact(index, 'isPrimary', checked)}
                    />
                    <Label>Primary</Label>
                  </div>
                </div>
              </Card>
            ))}
            
            <div>
              <Label htmlFor="hospital">Preferred Hospital</Label>
              <Input
                id="hospital"
                value={profile.preferredHospital}
                onChange={(e) => setProfile(prev => ({ ...prev, preferredHospital: e.target.value }))}
                placeholder="Hospital name or location"
                className="mt-1"
              />
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Shield className="w-16 h-16 mx-auto mb-4 text-cyber-blue" />
              <h2 className="text-2xl font-bold text-foreground mb-2">Guardian Settings</h2>
              <p className="text-muted-foreground">Configure your AI Guardian preferences</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label>Guardian Sensitivity</Label>
                <Select value={profile.guardianSensitivity} onValueChange={(value: any) => setProfile(prev => ({ ...prev, guardianSensitivity: value }))}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low - Less frequent checks</SelectItem>
                    <SelectItem value="medium">Medium - Balanced monitoring</SelectItem>
                    <SelectItem value="high">High - Frequent monitoring</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Auto SOS Delay (seconds)</Label>
                <Input
                  type="number"
                  value={profile.autoSOSDelay}
                  onChange={(e) => setProfile(prev => ({ ...prev, autoSOSDelay: parseInt(e.target.value) || 15 }))}
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Time to wait before automatically calling for help if no response
                </p>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Fall Detection</Label>
                  <Switch
                    checked={profile.enableFallDetection}
                    onCheckedChange={(checked) => setProfile(prev => ({ ...prev, enableFallDetection: checked }))}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label>Heart Rate Monitoring</Label>
                  <Switch
                    checked={profile.enableHeartRateMonitoring}
                    onCheckedChange={(checked) => setProfile(prev => ({ ...prev, enableHeartRateMonitoring: checked }))}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label>Voice Commands</Label>
                  <Switch
                    checked={profile.enableVoiceCommands}
                    onCheckedChange={(checked) => setProfile(prev => ({ ...prev, enableVoiceCommands: checked }))}
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <CheckCircle className="w-16 h-16 mx-auto mb-4 text-cyber-green" />
              <h2 className="text-2xl font-bold text-foreground mb-2">Review & Complete</h2>
              <p className="text-muted-foreground">Verify your information and complete setup</p>
            </div>
            
            <div className="space-y-4">
              <Card className="p-4">
                <h3 className="font-semibold mb-2">Personal Info</h3>
                <p className="text-sm text-muted-foreground">
                  {profile.name}, {profile.age} years old, {profile.bloodType}
                </p>
              </Card>
              
              <Card className="p-4">
                <h3 className="font-semibold mb-2">Medical Conditions</h3>
                <div className="flex flex-wrap gap-1">
                  {profile.medicalConditions.length > 0 ? 
                    profile.medicalConditions.map(condition => (
                      <Badge key={condition} variant="outline" className="text-xs">{condition}</Badge>
                    )) : 
                    <span className="text-sm text-muted-foreground">None reported</span>
                  }
                </div>
              </Card>
              
              <Card className="p-4">
                <h3 className="font-semibold mb-2">Emergency Contacts</h3>
                <p className="text-sm text-muted-foreground">
                  {profile.emergencyContacts.length} contacts configured
                </p>
              </Card>
              
              <Card className="p-4">
                <h3 className="font-semibold mb-2">Guardian Settings</h3>
                <p className="text-sm text-muted-foreground">
                  Sensitivity: {profile.guardianSensitivity} • SOS Delay: {profile.autoSOSDelay}s
                </p>
              </Card>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={cn(
      "min-h-screen bg-[var(--gradient-medical)] flex items-center justify-center p-4",
      isMobile ? "px-2" : "px-8"
    )}>
      <Card className={cn(
        "w-full max-w-2xl p-6 bg-card/95 backdrop-blur-lg border-2 border-cyber-blue/20",
        "shadow-[var(--glow-primary)]"
      )}>
        {/* Progress Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-xl font-bold text-foreground">Health Profile Setup</h1>
            <Badge variant="outline">{currentStep}/{totalSteps}</Badge>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step Content */}
        <div className="mb-8">
          {renderStep()}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </Button>
          
          <div className="flex gap-2">
            {onSkip && (
              <Button variant="ghost" onClick={onSkip}>
                Skip Setup
              </Button>
            )}
            
            <Button
              onClick={nextStep}
              disabled={currentStep === 1 && (!profile.name || !profile.age)}
              className="flex items-center gap-2"
            >
              {currentStep === totalSteps ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Complete Setup
                </>
              ) : (
                <>
                  Next
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};