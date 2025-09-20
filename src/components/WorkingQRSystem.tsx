import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { QrCode, Download, Eye, MapPin, Heart, User } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { UserProfile } from "@/components/UserSignup";

interface VitalData {
  heartRate: number;
  spO2: number;
  temperature: number;
  timestamp: Date;
}

interface WorkingQRSystemProps {
  userProfile: UserProfile;
  vitals?: VitalData;
  location?: {
    city: string;
    address: string;
    coordinates: [number, number];
  };
}

export const WorkingQRSystem = ({ userProfile, vitals, location }: WorkingQRSystemProps) => {
  const [qrUrl, setQrUrl] = useState("");
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    generateQRUrl();
  }, [userProfile, vitals, location]);

  const generateQRUrl = () => {
    // Create incident data
    const incidentData = {
      id: `INC-${Date.now()}`,
      timestamp: new Date().toISOString(),
      user: {
        name: userProfile.name,
        age: userProfile.age,
        bloodType: userProfile.bloodType,
        medicalConditions: userProfile.medicalConditions,
        allergies: userProfile.allergies,
        emergencyContacts: userProfile.emergencyContacts
      },
      vitals: vitals ? {
        heartRate: vitals.heartRate,
        spO2: vitals.spO2,
        temperature: vitals.temperature,
        timestamp: vitals.timestamp.toISOString()
      } : null,
      location: location ? {
        city: location.city,
        address: location.address,
        coordinates: location.coordinates
      } : null
    };

    // For demo: create URL with compressed data
    const compressedData = btoa(JSON.stringify(incidentData));
    const baseUrl = window.location.origin;
    const qrLink = `${baseUrl}/incident/${compressedData}`;
    
    setQrUrl(qrLink);
  };

  const downloadQR = () => {
    const svg = document.getElementById('emergency-qr-code')?.querySelector('svg');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    canvas.width = 400;
    canvas.height = 500;

    img.onload = () => {
      if (!ctx) return;
      
      // White background
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw QR code
      ctx.drawImage(img, 50, 80, 300, 300);
      
      // Add text
      ctx.fillStyle = 'black';
      ctx.font = 'bold 24px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('EMERGENCY PROFILE', canvas.width / 2, 40);
      
      ctx.font = '18px Arial';
      ctx.fillText(userProfile.name, canvas.width / 2, 400);
      ctx.fillText(`Blood Type: ${userProfile.bloodType}`, canvas.width / 2, 425);
      ctx.fillText('Scan for Emergency Info', canvas.width / 2, 450);
      
      ctx.font = '12px Arial';
      ctx.fillText('LifeLine AI Emergency System', canvas.width / 2, 480);

      // Download
      const link = document.createElement('a');
      link.download = `emergency-card-${userProfile.name.replace(/\s+/g, '-')}.png`;
      link.href = canvas.toDataURL();
      link.click();
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  const previewIncident = () => {
    window.open(qrUrl, '_blank');
  };

  return (
    <Card className="w-full max-w-md mx-auto p-6">
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2 mb-4">
          <QrCode className="w-6 h-6 text-blue-500" />
          <h3 className="text-xl font-semibold">Emergency QR Code</h3>
        </div>

        {/* QR Code */}
        <div id="emergency-qr-code" className="flex justify-center p-4 bg-white rounded-lg">
          <QRCodeSVG
            value={qrUrl}
            size={256}
            bgColor="#ffffff"
            fgColor="#000000"
            level="M"
            includeMargin={true}
          />
        </div>

        {/* Profile Summary */}
        <div className="text-left space-y-2 p-4 bg-muted/20 rounded-lg">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4" />
            <span className="font-medium">{userProfile.name}</span>
            <Badge variant="outline">{userProfile.bloodType}</Badge>
          </div>
          
          {vitals && (
            <div className="flex items-center gap-2 text-sm">
              <Heart className="w-4 h-4 text-red-500" />
              <span>{vitals.heartRate} BPM • {vitals.spO2}% SpO2 • {vitals.temperature}°C</span>
            </div>
          )}
          
          {location && (
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="w-4 h-4 text-blue-500" />
              <span>{location.city}, Kuwait</span>
            </div>
          )}
          
          <div className="text-xs text-muted-foreground">
            Emergency Contacts: {userProfile.emergencyContacts.length}
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Button onClick={previewIncident} variant="outline" className="flex items-center gap-2">
            <Eye className="w-4 h-4" />
            Preview
          </Button>
          <Button onClick={downloadQR} className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Download
          </Button>
        </div>

        {/* Instructions */}
        <div className="text-xs text-muted-foreground space-y-1">
          <p>• Scan with any smartphone camera</p>
          <p>• Contains your emergency profile</p>
          <p>• Works offline after initial load</p>
          <p>• Share with emergency services</p>
        </div>
      </div>
    </Card>
  );
};