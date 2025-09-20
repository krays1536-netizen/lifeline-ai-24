import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Shield, Heart, Fingerprint, User, Phone, AlertTriangle } from 'lucide-react';

interface UserProfile {
  name: string;
  age: string;
  gender: string;
  bloodType: string;
  emergencyContact: {
    name: string;
    phone: string;
    relation: string;
  };
  medicalHistory: {
    allergies: string;
    conditions: string;
    medications: string;
  };
  biometricEnabled: boolean;
}

interface UserOnboardingProps {
  onComplete: (profile: UserProfile) => void;
}

export const UserOnboarding: React.FC<UserOnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState<UserProfile>({
    name: '',
    age: '',
    gender: '',
    bloodType: '',
    emergencyContact: {
      name: '',
      phone: '',
      relation: ''
    },
    medicalHistory: {
      allergies: '',
      conditions: '',
      medications: ''
    },
    biometricEnabled: false
  });

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleComplete = () => {
    localStorage.setItem('userProfile', JSON.stringify(profile));
    localStorage.setItem('onboardingComplete', 'true');
    onComplete(profile);
  };

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const relations = ['Parent', 'Spouse', 'Sibling', 'Friend', 'Doctor', 'Other'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-background/80 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-primary to-primary-glow mb-4">
            <Shield className="w-10 h-10 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
            LifeLine AI Guardian
          </h1>
          <p className="text-muted-foreground mt-2">
            Complete setup to activate your personal health guardian
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Step {step} of 4</span>
            <span className="text-sm text-muted-foreground">{Math.round((step / 4) * 100)}%</span>
          </div>
          <div className="w-full bg-secondary/20 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-primary to-primary-glow h-2 rounded-full transition-all duration-500"
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>
        </div>

        <Card className="p-8 border-border/50 bg-card/50 backdrop-blur-sm shadow-elegant">
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center">
                <User className="w-12 h-12 text-primary mx-auto mb-4" />
                <h2 className="text-2xl font-semibold mb-2">Personal Information</h2>
                <p className="text-muted-foreground">Let's start with basic details</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    placeholder="Enter your full name"
                    className="bg-background/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="age">Age *</Label>
                  <Input
                    id="age"
                    type="number"
                    value={profile.age}
                    onChange={(e) => setProfile({ ...profile, age: e.target.value })}
                    placeholder="Your age"
                    className="bg-background/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Gender *</Label>
                  <Select value={profile.gender} onValueChange={(value) => setProfile({ ...profile, gender: value })}>
                    <SelectTrigger className="bg-background/50">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Blood Type</Label>
                  <Select value={profile.bloodType} onValueChange={(value) => setProfile({ ...profile, bloodType: value })}>
                    <SelectTrigger className="bg-background/50">
                      <SelectValue placeholder="Select blood type" />
                    </SelectTrigger>
                    <SelectContent>
                      {bloodTypes.map(type => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center">
                <Phone className="w-12 h-12 text-primary mx-auto mb-4" />
                <h2 className="text-2xl font-semibold mb-2">Emergency Contact</h2>
                <p className="text-muted-foreground">Who should we contact in case of emergency?</p>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="contactName">Contact Name *</Label>
                  <Input
                    id="contactName"
                    value={profile.emergencyContact.name}
                    onChange={(e) => setProfile({ 
                      ...profile, 
                      emergencyContact: { ...profile.emergencyContact, name: e.target.value }
                    })}
                    placeholder="Full name of emergency contact"
                    className="bg-background/50"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contactPhone">Phone Number *</Label>
                    <Input
                      id="contactPhone"
                      value={profile.emergencyContact.phone}
                      onChange={(e) => setProfile({ 
                        ...profile, 
                        emergencyContact: { ...profile.emergencyContact, phone: e.target.value }
                      })}
                      placeholder="+965 XXXX XXXX"
                      className="bg-background/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Relationship</Label>
                    <Select 
                      value={profile.emergencyContact.relation} 
                      onValueChange={(value) => setProfile({ 
                        ...profile, 
                        emergencyContact: { ...profile.emergencyContact, relation: value }
                      })}
                    >
                      <SelectTrigger className="bg-background/50">
                        <SelectValue placeholder="Select relationship" />
                      </SelectTrigger>
                      <SelectContent>
                        {relations.map(relation => (
                          <SelectItem key={relation} value={relation.toLowerCase()}>{relation}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div className="text-center">
                <Heart className="w-12 h-12 text-primary mx-auto mb-4" />
                <h2 className="text-2xl font-semibold mb-2">Medical History</h2>
                <p className="text-muted-foreground">Help us provide better health monitoring</p>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="allergies">Known Allergies</Label>
                  <Textarea
                    id="allergies"
                    value={profile.medicalHistory.allergies}
                    onChange={(e) => setProfile({ 
                      ...profile, 
                      medicalHistory: { ...profile.medicalHistory, allergies: e.target.value }
                    })}
                    placeholder="List any known allergies (medications, food, etc.)"
                    className="bg-background/50 h-20"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="conditions">Existing Medical Conditions</Label>
                  <Textarea
                    id="conditions"
                    value={profile.medicalHistory.conditions}
                    onChange={(e) => setProfile({ 
                      ...profile, 
                      medicalHistory: { ...profile.medicalHistory, conditions: e.target.value }
                    })}
                    placeholder="Diabetes, hypertension, asthma, etc."
                    className="bg-background/50 h-20"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="medications">Current Medications</Label>
                  <Textarea
                    id="medications"
                    value={profile.medicalHistory.medications}
                    onChange={(e) => setProfile({ 
                      ...profile, 
                      medicalHistory: { ...profile.medicalHistory, medications: e.target.value }
                    })}
                    placeholder="List current medications and dosages"
                    className="bg-background/50 h-20"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              <div className="text-center">
                <Fingerprint className="w-12 h-12 text-primary mx-auto mb-4" />
                <h2 className="text-2xl font-semibold mb-2">Security Setup</h2>
                <p className="text-muted-foreground">Secure your health data with biometric authentication</p>
              </div>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-3 p-4 border border-border/50 rounded-lg bg-background/30">
                  <Checkbox
                    id="biometric"
                    checked={profile.biometricEnabled}
                    onCheckedChange={(checked) => setProfile({ ...profile, biometricEnabled: !!checked })}
                  />
                  <div className="space-y-1">
                    <Label htmlFor="biometric" className="text-base font-medium">
                      Enable Biometric Authentication
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Use fingerprint or Face ID to quickly access your health data
                    </p>
                  </div>
                </div>

                <div className="p-4 border border-amber-500/20 rounded-lg bg-amber-500/5">
                  <div className="flex items-start space-x-3">
                    <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-amber-500">Privacy Notice</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Your health data is stored locally on your device and encrypted. 
                        Emergency contacts will only receive alerts during actual emergencies.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-between mt-8">
            {step > 1 && (
              <Button variant="outline" onClick={handleBack}>
                Back
              </Button>
            )}
            {step < 4 ? (
              <Button 
                onClick={handleNext} 
                className="ml-auto"
                disabled={
                  (step === 1 && (!profile.name || !profile.age || !profile.gender)) ||
                  (step === 2 && (!profile.emergencyContact.name || !profile.emergencyContact.phone))
                }
              >
                Continue
              </Button>
            ) : (
              <Button onClick={handleComplete} className="ml-auto">
                Complete Setup
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};