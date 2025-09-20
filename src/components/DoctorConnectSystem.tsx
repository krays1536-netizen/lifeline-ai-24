import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { QRCodeSVG } from "qrcode.react";
import { 
  UserPlus, 
  QrCode, 
  Link, 
  Phone, 
  Video, 
  Calendar, 
  FileText, 
  Heart, 
  Stethoscope,
  Share,
  Copy,
  CheckCircle,
  AlertCircle,
  Clock,
  MapPin,
  User,
  Shield,
  Send,
  Download
} from "lucide-react";

interface DoctorInfo {
  id: string;
  name: string;
  specialty: string;
  hospital: string;
  phone: string;
  email: string;
  licenseNumber: string;
  isVerified: boolean;
  connectionDate: Date;
}

interface PatientData {
  personalInfo: {
    name: string;
    age: number;
    bloodType: string;
    allergies: string[];
    conditions: string[];
  };
  emergencyContacts: {
    name: string;
    relation: string;
    phone: string;
  }[];
  currentVitals: {
    heartRate: number;
    spO2: number;
    temperature: number;
    timestamp: Date;
  };
  location: {
    latitude: number;
    longitude: number;
    address: string;
  } | null;
}

interface DoctorConnectSystemProps {
  patientData?: PatientData;
  onDoctorConnected?: (doctor: DoctorInfo) => void;
  onDataShared?: (data: any) => void;
}

export const DoctorConnectSystem = ({ 
  patientData,
  onDoctorConnected,
  onDataShared 
}: DoctorConnectSystemProps) => {
  const { toast } = useToast();
  
  const [connectedDoctors, setConnectedDoctors] = useState<DoctorInfo[]>([]);
  const [shareCode, setShareCode] = useState("");
  const [connectionLink, setConnectionLink] = useState("");
  const [showQR, setShowQR] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [selectedData, setSelectedData] = useState<string[]>([
    "vitals", "medical-history", "emergency-contacts", "location"
  ]);

  // Generate secure sharing code
  const generateShareCode = useCallback(() => {
    const code = Math.random().toString(36).substring(2, 10).toUpperCase();
    setShareCode(code);
    
    // Generate connection link
    const baseUrl = window.location.origin;
    const link = `${baseUrl}/doctor-connect?code=${code}&patient=${Date.now()}`;
    setConnectionLink(link);
    
    toast({
      title: "🔗 Share Code Generated",
      description: `Code: ${code} (Valid for 24 hours)`,
      variant: "default"
    });
  }, [toast]);

  // Generate QR code for doctor connection
  const generateQRCode = useCallback(() => {
    if (!shareCode) {
      generateShareCode();
    }
    
    setShowQR(true);
    
    toast({
      title: "📱 QR Code Generated",
      description: "Doctor can scan this to connect securely",
      variant: "default"
    });
  }, [shareCode, generateShareCode, toast]);

  // Share patient data with doctor
  const shareDataWithDoctor = useCallback(async (doctorId: string) => {
    setIsSharing(true);
    
    const dataToShare = {
      shareCode,
      timestamp: new Date(),
      selectedData: selectedData.reduce((acc, key) => {
        switch (key) {
          case 'vitals':
            acc.vitals = patientData?.currentVitals;
            break;
          case 'medical-history':
            acc.medicalHistory = {
              bloodType: patientData?.personalInfo.bloodType,
              allergies: patientData?.personalInfo.allergies,
              conditions: patientData?.personalInfo.conditions
            };
            break;
          case 'emergency-contacts':
            acc.emergencyContacts = patientData?.emergencyContacts;
            break;
          case 'location':
            acc.location = patientData?.location;
            break;
        }
        return acc;
      }, {} as any),
      patientInfo: {
        name: patientData?.personalInfo.name,
        age: patientData?.personalInfo.age
      }
    };

    // Simulate API call
    setTimeout(() => {
      setIsSharing(false);
      onDataShared?.(dataToShare);
      
      toast({
        title: "✅ Data Shared Successfully",
        description: "Secure medical data sent to doctor",
        variant: "default"
      });
    }, 2000);
  }, [shareCode, selectedData, patientData, onDataShared, toast]);

  // Copy connection link
  const copyConnectionLink = useCallback(() => {
    if (!connectionLink) {
      generateShareCode();
      return;
    }
    
    navigator.clipboard.writeText(connectionLink);
    toast({
      title: "📋 Link Copied",
      description: "Connection link copied to clipboard",
      variant: "default"
    });
  }, [connectionLink, generateShareCode, toast]);

  // Mock doctor connection (in real app, this would come from doctor's action)
  const simulateDoctorConnection = useCallback(() => {
    const mockDoctor: DoctorInfo = {
      id: `doc-${Date.now()}`,
      name: "Dr. Sarah Al-Rashid",
      specialty: "Emergency Medicine",
      hospital: "Kuwait Hospital",
      phone: "+965-2222-3333",
      email: "s.alrashid@kuwaithosp.kw",
      licenseNumber: "KW-MED-2024-1234",
      isVerified: true,
      connectionDate: new Date()
    };

    setConnectedDoctors(prev => [...prev, mockDoctor]);
    onDoctorConnected?.(mockDoctor);
    
    toast({
      title: "👨‍⚕️ Doctor Connected",
      description: `${mockDoctor.name} has joined your care team`,
      variant: "default"
    });
  }, [onDoctorConnected, toast]);

  const mockPatientData = patientData || {
    personalInfo: {
      name: "Guardian User",
      age: 30,
      bloodType: "O+",
      allergies: ["Penicillin"],
      conditions: []
    },
    emergencyContacts: [
      { name: "Family Member", relation: "Spouse", phone: "+965-9999-1234" }
    ],
    currentVitals: {
      heartRate: 72,
      spO2: 98,
      temperature: 36.5,
      timestamp: new Date()
    },
    location: {
      latitude: 29.3759,
      longitude: 47.9774,
      address: "Kuwait City, Kuwait"
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-primary/20 bg-gradient-subtle">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <UserPlus className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Doctor Connect</h3>
              <p className="text-sm text-muted-foreground">
                Secure medical professional access
              </p>
            </div>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Connection Methods */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-6">
          <div className="text-center space-y-4">
            <div className="p-3 bg-blue-500/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto">
              <QrCode className="w-8 h-8 text-blue-500" />
            </div>
            <h3 className="font-semibold">QR Code Connection</h3>
            <p className="text-sm text-muted-foreground">
              Generate QR code for instant doctor access
            </p>
            <Button onClick={generateQRCode} className="w-full">
              Generate QR Code
            </Button>
          </div>
        </Card>

        <Card className="p-6">
          <div className="text-center space-y-4">
            <div className="p-3 bg-green-500/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto">
              <Link className="w-8 h-8 text-green-500" />
            </div>
            <h3 className="font-semibold">Secure Link</h3>
            <p className="text-sm text-muted-foreground">
              Share encrypted link with your doctor
            </p>
            <Button onClick={copyConnectionLink} variant="outline" className="w-full">
              <Copy className="w-4 h-4 mr-2" />
              Copy Link
            </Button>
          </div>
        </Card>
      </div>

      {/* QR Code Display */}
      {showQR && (
        <Card className="p-6 text-center">
          <h3 className="font-semibold mb-4">Doctor Connection QR Code</h3>
          
          <div className="inline-block p-4 bg-white rounded-lg">
            <QRCodeSVG
              value={connectionLink || `lifeline://doctor-connect?code=${shareCode}`}
              size={200}
              level="H"
              includeMargin={true}
            />
          </div>
          
          <div className="mt-4 space-y-2">
            <Badge variant="outline" className="text-lg px-4 py-2">
              Code: {shareCode}
            </Badge>
            <p className="text-sm text-muted-foreground">
              Valid for 24 hours • Encrypted connection
            </p>
          </div>

          <div className="flex gap-2 mt-4 justify-center">
            <Button variant="outline" size="sm" onClick={() => setShowQR(false)}>
              Close
            </Button>
            <Button size="sm" onClick={simulateDoctorConnection}>
              <CheckCircle className="w-4 h-4 mr-2" />
              Test Connection
            </Button>
          </div>
        </Card>
      )}

      {/* Data Selection */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Data Sharing Permissions
        </h3>
        
        <div className="grid grid-cols-2 gap-3">
          {[
            { key: "vitals", label: "Current Vitals", icon: Heart, desc: "Heart rate, SpO2, temperature" },
            { key: "medical-history", label: "Medical History", icon: FileText, desc: "Allergies, conditions, blood type" },
            { key: "emergency-contacts", label: "Emergency Contacts", icon: Phone, desc: "Family and emergency numbers" },
            { key: "location", label: "Current Location", icon: MapPin, desc: "GPS coordinates and address" }
          ].map((item) => (
            <div
              key={item.key}
              className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                selectedData.includes(item.key) 
                  ? "border-primary bg-primary/10" 
                  : "border-muted hover:border-primary/50"
              }`}
              onClick={() => {
                setSelectedData(prev => 
                  prev.includes(item.key) 
                    ? prev.filter(k => k !== item.key)
                    : [...prev, item.key]
                );
              }}
            >
              <div className="flex items-center gap-2 mb-1">
                <item.icon className="w-4 h-4" />
                <span className="text-sm font-medium">{item.label}</span>
                {selectedData.includes(item.key) && (
                  <CheckCircle className="w-4 h-4 text-primary ml-auto" />
                )}
              </div>
              <p className="text-xs text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Connected Doctors */}
      {connectedDoctors.length > 0 && (
        <Card className="p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Stethoscope className="w-5 h-5" />
            Connected Doctors ({connectedDoctors.length})
          </h3>
          
          <div className="space-y-4">
            {connectedDoctors.map((doctor) => (
              <div key={doctor.id} className="p-4 border rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-full">
                      <User className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{doctor.name}</h4>
                        {doctor.isVerified && (
                          <Badge variant="default" className="text-xs">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Verified
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{doctor.specialty}</p>
                      <p className="text-sm text-muted-foreground">{doctor.hospital}</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => shareDataWithDoctor(doctor.id)}
                      disabled={isSharing}
                    >
                      {isSharing ? (
                        <>
                          <Clock className="w-4 h-4 mr-2 animate-spin" />
                          Sharing...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Share Data
                        </>
                      )}
                    </Button>
                  </div>
                </div>
                
                <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                  <span>Connected: {doctor.connectionDate.toLocaleDateString()}</span>
                  <span>License: {doctor.licenseNumber}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Patient Data Preview */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Data Preview
        </h3>
        
        <div className="space-y-4 text-sm">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-primary mb-2">Personal Info</h4>
              <div className="space-y-1 text-muted-foreground">
                <p>Name: {mockPatientData.personalInfo.name}</p>
                <p>Age: {mockPatientData.personalInfo.age}</p>
                <p>Blood Type: {mockPatientData.personalInfo.bloodType}</p>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-primary mb-2">Current Vitals</h4>
              <div className="space-y-1 text-muted-foreground">
                <p>Heart Rate: {mockPatientData.currentVitals.heartRate} BPM</p>
                <p>SpO2: {mockPatientData.currentVitals.spO2}%</p>
                <p>Temperature: {mockPatientData.currentVitals.temperature}°C</p>
              </div>
            </div>
          </div>
          
          {mockPatientData.location && (
            <div>
              <h4 className="font-medium text-primary mb-2">Location</h4>
              <p className="text-muted-foreground">{mockPatientData.location.address}</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};