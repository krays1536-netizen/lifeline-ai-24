import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  User, 
  Phone, 
  Calendar, 
  AlertTriangle, 
  Heart, 
  Pill, 
  QrCode,
  Download,
  Share2,
  Shield,
  MapPin
} from "lucide-react";
import { format } from "date-fns";

interface MedicalIDCardProps {
  userProfile: any;
  userType: 'patient' | 'doctor';
}

export const MedicalIDCard = ({ userProfile, userType }: MedicalIDCardProps) => {
  const { toast } = useToast();
  const [emergencyContacts, setEmergencyContacts] = useState<any[]>([]);
  const [medicalId, setMedicalId] = useState<string>('');

  useEffect(() => {
    generateMedicalId();
    if (userType === 'patient') {
      loadEmergencyContacts();
    }
  }, [userProfile]);

  const generateMedicalId = () => {
    const prefix = userType === 'patient' ? 'MID' : 'DID';
    const id = `${prefix}-${userProfile?.id?.slice(0, 8).toUpperCase()}`;
    setMedicalId(id);
  };

  const loadEmergencyContacts = async () => {
    if (!userProfile?.emergency_contact_name) return;
    
    setEmergencyContacts([{
      name: userProfile.emergency_contact_name,
      phone: userProfile.emergency_contact_phone,
      relationship: 'Emergency Contact'
    }]);
  };

  const downloadCard = () => {
    const cardElement = document.getElementById('medical-id-card');
    if (cardElement) {
      // In a real implementation, you'd use html2canvas or similar
      toast({
        title: "Download initiated",
        description: "Medical ID card download would start here",
      });
    }
  };

  const shareCard = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Medical ID Card',
        text: `Medical ID: ${medicalId}`,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(`Medical ID: ${medicalId}`);
      toast({
        title: "Copied to clipboard",
        description: "Medical ID copied to clipboard",
      });
    }
  };

  const getBloodTypeColor = (bloodType: string) => {
    const colors = {
      'A+': 'bg-red-100 text-red-800',
      'A-': 'bg-red-200 text-red-900',
      'B+': 'bg-blue-100 text-blue-800',
      'B-': 'bg-blue-200 text-blue-900',
      'AB+': 'bg-purple-100 text-purple-800',
      'AB-': 'bg-purple-200 text-purple-900',
      'O+': 'bg-green-100 text-green-800',
      'O-': 'bg-green-200 text-green-900',
    };
    return colors[bloodType as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  if (userType === 'doctor') {
    return (
      <Card id="medical-id-card" className="max-w-md mx-auto bg-gradient-to-br from-blue-50 to-indigo-100 border-2 border-blue-200">
        <CardHeader className="text-center pb-2">
          <div className="flex justify-center mb-2">
            <Shield className="h-12 w-12 text-blue-600" />
          </div>
          <CardTitle className="text-lg font-bold text-blue-900">MEDICAL PROFESSIONAL ID</CardTitle>
          <div className="text-2xl font-mono font-bold text-blue-700">{medicalId}</div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <h3 className="text-xl font-bold text-gray-900">{userProfile?.full_name}</h3>
            <p className="text-blue-600 font-semibold">{userProfile?.specialization}</p>
            <Badge variant="secondary" className="mt-1">
              {userProfile?.years_experience} years experience
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="flex items-center space-x-1 text-gray-600">
                <User className="h-4 w-4" />
                <span>License</span>
              </div>
              <p className="font-semibold">{userProfile?.license_number}</p>
            </div>
            <div>
              <div className="flex items-center space-x-1 text-gray-600">
                <Phone className="h-4 w-4" />
                <span>Contact</span>
              </div>
              <p className="font-semibold">{userProfile?.phone || 'Not provided'}</p>
            </div>
          </div>

          {userProfile?.languages && (
            <div>
              <p className="text-sm text-gray-600 mb-1">Languages</p>
              <div className="flex flex-wrap gap-1">
                {userProfile.languages.map((lang: string, index: number) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {lang}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-between pt-4 border-t">
            <Button variant="outline" size="sm" onClick={downloadCard}>
              <Download className="h-4 w-4 mr-1" />
              Download
            </Button>
            <Button variant="outline" size="sm" onClick={shareCard}>
              <Share2 className="h-4 w-4 mr-1" />
              Share
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card id="medical-id-card" className="max-w-md mx-auto bg-gradient-to-br from-red-50 to-pink-100 border-2 border-red-200">
      <CardHeader className="text-center pb-2">
        <div className="flex justify-center mb-2">
          <Heart className="h-12 w-12 text-red-600" />
        </div>
        <CardTitle className="text-lg font-bold text-red-900">MEDICAL ID CARD</CardTitle>
        <div className="text-2xl font-mono font-bold text-red-700">{medicalId}</div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <h3 className="text-xl font-bold text-gray-900">{userProfile?.full_name}</h3>
          <div className="flex justify-center space-x-2 mt-1">
            <Badge variant="secondary">
              {userProfile?.gender || 'Not specified'}
            </Badge>
            {userProfile?.blood_type && (
              <Badge className={getBloodTypeColor(userProfile.blood_type)}>
                {userProfile.blood_type}
              </Badge>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="flex items-center space-x-1 text-gray-600">
              <Calendar className="h-4 w-4" />
              <span>DOB</span>
            </div>
            <p className="font-semibold">
              {userProfile?.date_of_birth 
                ? format(new Date(userProfile.date_of_birth), 'MMM dd, yyyy')
                : 'Not provided'
              }
            </p>
          </div>
          <div>
            <div className="flex items-center space-x-1 text-gray-600">
              <Phone className="h-4 w-4" />
              <span>Phone</span>
            </div>
            <p className="font-semibold">{userProfile?.phone || 'Not provided'}</p>
          </div>
        </div>

        {userProfile?.allergies && userProfile.allergies.length > 0 && (
          <div>
            <div className="flex items-center space-x-1 text-red-600 mb-1">
              <AlertTriangle className="h-4 w-4" />
              <span className="font-semibold text-sm">ALLERGIES</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {userProfile.allergies.map((allergy: string, index: number) => (
                <Badge key={index} variant="destructive" className="text-xs">
                  {allergy}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {userProfile?.medical_conditions && userProfile.medical_conditions.length > 0 && (
          <div>
            <div className="flex items-center space-x-1 text-orange-600 mb-1">
              <Heart className="h-4 w-4" />
              <span className="font-semibold text-sm">CONDITIONS</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {userProfile.medical_conditions.map((condition: string, index: number) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {condition}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {userProfile?.medications && userProfile.medications.length > 0 && (
          <div>
            <div className="flex items-center space-x-1 text-blue-600 mb-1">
              <Pill className="h-4 w-4" />
              <span className="font-semibold text-sm">MEDICATIONS</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {userProfile.medications.map((medication: string, index: number) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {medication}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {emergencyContacts.length > 0 && (
          <div>
            <div className="flex items-center space-x-1 text-green-600 mb-1">
              <Phone className="h-4 w-4" />
              <span className="font-semibold text-sm">EMERGENCY CONTACT</span>
            </div>
            {emergencyContacts.map((contact, index) => (
              <div key={index} className="text-sm">
                <p className="font-semibold">{contact.name}</p>
                <p className="text-gray-600">{contact.phone}</p>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-between pt-4 border-t">
          <Button variant="outline" size="sm" onClick={downloadCard}>
            <Download className="h-4 w-4 mr-1" />
            Download
          </Button>
          <Button variant="outline" size="sm" onClick={shareCard}>
            <Share2 className="h-4 w-4 mr-1" />
            Share
          </Button>
          <Button variant="outline" size="sm">
            <QrCode className="h-4 w-4 mr-1" />
            QR Code
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};