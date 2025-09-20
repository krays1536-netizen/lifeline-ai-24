import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { User, Phone, Heart, AlertCircle, Plus, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export interface UserProfile {
  name: string;
  age: string;
  phone: string;
  bloodType: string;
  medicalConditions: string[];
  allergies: string;
  emergencyContacts: Array<{
    name: string;
    phone: string;
    relationship: string;
  }>;
  language: "en" | "ar";
}

interface UserSignupProps {
  onComplete: (profile: UserProfile) => void;
  onSkip: () => void;
}

export const UserSignup = ({ onComplete, onSkip }: UserSignupProps) => {
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfile>({
    name: "",
    age: "",
    phone: "",
    bloodType: "",
    medicalConditions: [],
    allergies: "",
    emergencyContacts: [],
    language: "en"
  });

  const [newCondition, setNewCondition] = useState("");
  const [newContact, setNewContact] = useState({
    name: "",
    phone: "",
    relationship: ""
  });

  const bloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
  const relationships = ["Parent", "Spouse", "Sibling", "Child", "Friend", "Doctor", "Colleague"];

  const addCondition = () => {
    if (newCondition.trim() && !profile.medicalConditions.includes(newCondition.trim())) {
      setProfile(prev => ({
        ...prev,
        medicalConditions: [...prev.medicalConditions, newCondition.trim()]
      }));
      setNewCondition("");
    }
  };

  const removeCondition = (condition: string) => {
    setProfile(prev => ({
      ...prev,
      medicalConditions: prev.medicalConditions.filter(c => c !== condition)
    }));
  };

  const addEmergencyContact = () => {
    if (newContact.name.trim() && newContact.phone.trim()) {
      setProfile(prev => ({
        ...prev,
        emergencyContacts: [...prev.emergencyContacts, { ...newContact }]
      }));
      setNewContact({ name: "", phone: "", relationship: "" });
    }
  };

  const removeContact = (index: number) => {
    setProfile(prev => ({
      ...prev,
      emergencyContacts: prev.emergencyContacts.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = () => {
    if (!profile.name.trim() || !profile.age.trim() || !profile.phone.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in your name, age, and phone number",
        variant: "destructive"
      });
      return;
    }

    if (profile.emergencyContacts.length === 0) {
      toast({
        title: "Emergency Contact Required",
        description: "Please add at least one emergency contact",
        variant: "destructive"
      });
      return;
    }

    // Save to localStorage
    localStorage.setItem('lifeline_user_profile', JSON.stringify(profile));
    
    toast({
      title: "Profile Created",
      description: "Your LifeLine AI profile has been saved",
      variant: "default"
    });

    onComplete(profile);
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto">
        <Card className="p-6">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-cyber-blue to-cyber-purple bg-clip-text text-transparent mb-2">
              LifeLine AI Setup
            </h1>
            <p className="text-muted-foreground">
              Create your emergency profile - Every second counts
            </p>
          </div>

          <div className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <User className="w-5 h-5" />
                Basic Information
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={profile.name}
                    onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <Label htmlFor="age">Age *</Label>
                  <Input
                    id="age"
                    type="number"
                    value={profile.age}
                    onChange={(e) => setProfile(prev => ({ ...prev, age: e.target.value }))}
                    placeholder="Enter your age"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={profile.phone}
                  onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="+965 XXXX XXXX"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Blood Type</Label>
                  <Select value={profile.bloodType} onValueChange={(value) => setProfile(prev => ({ ...prev, bloodType: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select blood type" />
                    </SelectTrigger>
                    <SelectContent>
                      {bloodTypes.map(type => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Language</Label>
                  <Select value={profile.language} onValueChange={(value: "en" | "ar") => setProfile(prev => ({ ...prev, language: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="ar">العربية</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Medical Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Heart className="w-5 h-5 text-red-500" />
                Medical Information
              </h3>

              <div>
                <Label>Medical Conditions</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={newCondition}
                    onChange={(e) => setNewCondition(e.target.value)}
                    placeholder="Add medical condition"
                    onKeyPress={(e) => e.key === 'Enter' && addCondition()}
                  />
                  <Button onClick={addCondition} size="sm">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {profile.medicalConditions.map((condition, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {condition}
                      <X className="w-3 h-3 cursor-pointer" onClick={() => removeCondition(condition)} />
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="allergies">Allergies</Label>
                <Textarea
                  id="allergies"
                  value={profile.allergies}
                  onChange={(e) => setProfile(prev => ({ ...prev, allergies: e.target.value }))}
                  placeholder="List any allergies (medications, food, etc.)"
                  rows={2}
                />
              </div>
            </div>

            {/* Emergency Contacts */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Phone className="w-5 h-5 text-green-500" />
                Emergency Contacts *
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <Input
                  value={newContact.name}
                  onChange={(e) => setNewContact(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Contact name"
                />
                <Input
                  value={newContact.phone}
                  onChange={(e) => setNewContact(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="Phone number"
                />
                <div className="flex gap-2">
                  <Select value={newContact.relationship} onValueChange={(value) => setNewContact(prev => ({ ...prev, relationship: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Relationship" />
                    </SelectTrigger>
                    <SelectContent>
                      {relationships.map(rel => (
                        <SelectItem key={rel} value={rel}>{rel}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button onClick={addEmergencyContact} size="sm">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                {profile.emergencyContacts.map((contact, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">{contact.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {contact.phone} • {contact.relationship}
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => removeContact(index)}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button onClick={handleSubmit} className="flex-1">
                Complete Setup
              </Button>
              <Button variant="outline" onClick={onSkip}>
                Skip for Now
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};