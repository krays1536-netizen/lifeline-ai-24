import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Heart, 
  Phone, 
  User, 
  Shield, 
  CheckCircle, 
  ArrowRight,
  Clock,
  Stethoscope,
  FileText,
  Lock
} from "lucide-react";
import { cn } from "@/lib/utils";

interface QuickMedConnectOnboardingProps {
  onComplete: (userId: string) => void;
}

export const QuickMedConnectOnboarding = ({ onComplete }: QuickMedConnectOnboardingProps) => {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  
  // Form states
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [emergencyContactName, setEmergencyContactName] = useState('');
  const [emergencyContactPhone, setEmergencyContactPhone] = useState('');
  const [userType, setUserType] = useState<'patient' | 'doctor'>('patient');
  const [bloodType, setBloodType] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  
  // Agreement states
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
  const [acceptedHipaa, setAcceptedHipaa] = useState(false);

  const handleQuickSignup = async () => {
    if (!acceptedTerms || !acceptedPrivacy || !acceptedHipaa) {
      toast({
        title: "Please accept all agreements",
        description: "You must accept the terms, privacy policy, and HIPAA agreement to continue",
        variant: "destructive"
      });
      return;
    }

    if (!fullName || !phone) {
      toast({
        title: "Missing information",
        description: "Please fill in your name and phone number",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      // Create a temporary email based on phone number for authentication
      const tempEmail = `${phone.replace(/[^0-9]/g, '')}@medconnect.temp`;
      const tempPassword = `MedConnect${Date.now()}`;

      // Sign up with temporary credentials
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: tempEmail,
        password: tempPassword,
        options: {
          emailRedirectTo: `${window.location.origin}/medconnect`,
          data: {
            full_name: fullName,
            user_type: userType,
            phone: phone,
            quick_signup: true
          }
        },
      });

      if (authError) throw authError;

      if (authData.user) {
        // Create profile based on user type
        if (userType === 'patient') {
          const { error: profileError } = await supabase
            .from('patients')
            .insert({
              user_id: authData.user.id,
              full_name: fullName,
              phone: phone,
              date_of_birth: dateOfBirth || null,
              blood_type: bloodType || null,
              emergency_contact_name: emergencyContactName || null,
              emergency_contact_phone: emergencyContactPhone || null,
            });

          if (profileError) throw profileError;
        } else {
          const { error: profileError } = await supabase
            .from('doctors')
            .insert({
              user_id: authData.user.id,
              full_name: fullName,
              phone: phone,
              specialization: specialization || 'General Practice',
              license_number: licenseNumber || 'Pending Verification',
              is_verified: false,
            });

          if (profileError) throw profileError;
        }

        toast({
          title: "🎉 Welcome to MedConnect!",
          description: "Your account has been created successfully. You now have full access to all medical features.",
        });

        onComplete(authData.user.id);
      }
    } catch (error: any) {
      toast({
        title: "Setup failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const nextStep = () => {
    if (step === 1 && (!fullName || !phone)) {
      toast({
        title: "Missing information",
        description: "Please fill in your name and phone number",
        variant: "destructive"
      });
      return;
    }
    if (step < 3) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="bg-gradient-to-r from-blue-500 to-green-500 p-4 rounded-full">
              <Heart className="h-10 w-10 text-white" />
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
              MedConnect
            </h1>
            <p className="text-gray-600 mt-2">Quick access to professional healthcare</p>
          </div>
          
          {/* Progress indicators */}
          <div className="flex justify-center space-x-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={cn(
                  "w-3 h-3 rounded-full transition-all duration-300",
                  i === step ? "bg-blue-500 scale-125" : 
                  i < step ? "bg-green-500" : "bg-gray-300"
                )}
              />
            ))}
          </div>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader className="text-center pb-4">
            <CardTitle className="flex items-center justify-center gap-2 text-xl">
              {step === 1 && (
                <>
                  <User className="h-5 w-5 text-blue-500" />
                  Basic Information
                </>
              )}
              {step === 2 && (
                <>
                  <Phone className="h-5 w-5 text-green-500" />
                  {userType === 'patient' ? 'Health & Emergency Info' : 'Professional Details'}
                </>
              )}
              {step === 3 && (
                <>
                  <Shield className="h-5 w-5 text-purple-500" />
                  Terms & Agreements
                </>
              )}
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Step 1: Basic Info */}
            {step === 1 && (
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={userType === 'patient' ? 'default' : 'outline'}
                    onClick={() => setUserType('patient')}
                    className="flex-1"
                  >
                    <User className="w-4 h-4 mr-2" />
                    Patient
                  </Button>
                  <Button
                    type="button"
                    variant={userType === 'doctor' ? 'default' : 'outline'}
                    onClick={() => setUserType('doctor')}
                    className="flex-1"
                  >
                    <Stethoscope className="w-4 h-4 mr-2" />
                    Doctor
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                    className="h-12"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+965 xxxx xxxx"
                    className="h-12"
                    required
                  />
                </div>

                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-blue-900">Quick Setup</h4>
                      <p className="text-sm text-blue-700">
                        Get instant access to video consultations, medical ID, and emergency features in under 2 minutes.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Additional Info */}
            {step === 2 && (
              <div className="space-y-4">
                {userType === 'patient' ? (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor="dateOfBirth">Date of Birth</Label>
                        <Input
                          id="dateOfBirth"
                          type="date"
                          value={dateOfBirth}
                          onChange={(e) => setDateOfBirth(e.target.value)}
                          className="h-10"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="bloodType">Blood Type</Label>
                        <Select value={bloodType} onValueChange={setBloodType}>
                          <SelectTrigger className="h-10">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="A+">A+</SelectItem>
                            <SelectItem value="A-">A-</SelectItem>
                            <SelectItem value="B+">B+</SelectItem>
                            <SelectItem value="B-">B-</SelectItem>
                            <SelectItem value="AB+">AB+</SelectItem>
                            <SelectItem value="AB-">AB-</SelectItem>
                            <SelectItem value="O+">O+</SelectItem>
                            <SelectItem value="O-">O-</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="emergencyContactName">Emergency Contact Name</Label>
                      <Input
                        id="emergencyContactName"
                        value={emergencyContactName}
                        onChange={(e) => setEmergencyContactName(e.target.value)}
                        placeholder="Emergency contact name"
                        className="h-10"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="emergencyContactPhone">Emergency Contact Phone</Label>
                      <Input
                        id="emergencyContactPhone"
                        type="tel"
                        value={emergencyContactPhone}
                        onChange={(e) => setEmergencyContactPhone(e.target.value)}
                        placeholder="+965 xxxx xxxx"
                        className="h-10"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="specialization">Medical Specialization</Label>
                      <Select value={specialization} onValueChange={setSpecialization}>
                        <SelectTrigger className="h-10">
                          <SelectValue placeholder="Select specialization" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="General Practice">General Practice</SelectItem>
                          <SelectItem value="Cardiology">Cardiology</SelectItem>
                          <SelectItem value="Neurology">Neurology</SelectItem>
                          <SelectItem value="Pediatrics">Pediatrics</SelectItem>
                          <SelectItem value="Emergency Medicine">Emergency Medicine</SelectItem>
                          <SelectItem value="Internal Medicine">Internal Medicine</SelectItem>
                          <SelectItem value="Surgery">Surgery</SelectItem>
                          <SelectItem value="Psychiatry">Psychiatry</SelectItem>
                          <SelectItem value="Dermatology">Dermatology</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="licenseNumber">Medical License Number</Label>
                      <Input
                        id="licenseNumber"
                        value={licenseNumber}
                        onChange={(e) => setLicenseNumber(e.target.value)}
                        placeholder="Enter license number"
                        className="h-10"
                      />
                    </div>

                    <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                      <div className="flex items-start gap-3">
                        <Stethoscope className="h-5 w-5 text-amber-600 mt-0.5" />
                        <div>
                          <h4 className="font-semibold text-amber-900">Doctor Verification</h4>
                          <p className="text-sm text-amber-700">
                            Your credentials will be verified by our medical team within 24 hours.
                          </p>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                <div className="text-center text-sm text-gray-500">
                  <p>This information helps us provide better care and emergency services.</p>
                </div>
              </div>
            )}

            {/* Step 3: Terms & Agreements */}
            {step === 3 && (
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-lg font-semibold mb-2">Quick Agreements</h3>
                  <p className="text-sm text-gray-600">Please accept our terms to get started</p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start space-x-3 p-4 rounded-lg border">
                    <Checkbox
                      id="terms"
                      checked={acceptedTerms}
                      onCheckedChange={(checked) => setAcceptedTerms(checked === true)}
                      className="mt-0.5"
                    />
                    <div className="flex-1">
                      <Label htmlFor="terms" className="text-sm cursor-pointer">
                        <strong>Terms of Service</strong> - I agree to the MedConnect platform terms and conditions
                      </Label>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 p-4 rounded-lg border">
                    <Checkbox
                      id="privacy"
                      checked={acceptedPrivacy}
                      onCheckedChange={(checked) => setAcceptedPrivacy(checked === true)}
                      className="mt-0.5"
                    />
                    <div className="flex-1">
                      <Label htmlFor="privacy" className="text-sm cursor-pointer">
                        <strong>Privacy Policy</strong> - I understand how my data will be used and protected
                      </Label>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 p-4 rounded-lg border border-blue-200 bg-blue-50">
                    <Checkbox
                      id="hipaa"
                      checked={acceptedHipaa}
                      onCheckedChange={(checked) => setAcceptedHipaa(checked === true)}
                      className="mt-0.5"
                    />
                    <div className="flex-1">
                      <Label htmlFor="hipaa" className="text-sm cursor-pointer">
                        <strong>HIPAA Compliance</strong> - I consent to secure handling of my medical information
                      </Label>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <div className="flex items-center gap-3">
                    <Lock className="h-5 w-5 text-green-600" />
                    <div>
                      <h4 className="font-semibold text-green-900">100% Secure & Private</h4>
                      <p className="text-sm text-green-700">
                        Your data is encrypted end-to-end and fully HIPAA compliant.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation buttons */}
            <div className="flex gap-3 pt-4">
              {step > 1 && (
                <Button
                  variant="outline"
                  onClick={prevStep}
                  className="flex-1"
                >
                  Back
                </Button>
              )}
              
              {step < 3 ? (
                <Button
                  onClick={nextStep}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600"
                >
                  Continue
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleQuickSignup}
                  disabled={!acceptedTerms || !acceptedPrivacy || !acceptedHipaa || isLoading}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600"
                >
                  {isLoading ? (
                    "Setting up..."
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Start Using MedConnect
                    </>
                  )}
                </Button>
              )}
            </div>

            {/* Quick benefits */}
            {step === 1 && (
              <div className="grid grid-cols-3 gap-3 pt-4 border-t">
                <div className="text-center">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Heart className="h-4 w-4 text-blue-600" />
                  </div>
                  <p className="text-xs text-gray-600">Video Calls</p>
                </div>
                <div className="text-center">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <FileText className="h-4 w-4 text-green-600" />
                  </div>
                  <p className="text-xs text-gray-600">Medical ID</p>
                </div>
                <div className="text-center">
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Shield className="h-4 w-4 text-red-600" />
                  </div>
                  <p className="text-xs text-gray-600">Emergency SOS</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="text-center text-xs text-gray-500">
          By continuing, you'll have instant access to all MedConnect features
        </div>
      </div>
    </div>
  );
};