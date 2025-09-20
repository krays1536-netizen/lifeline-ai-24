import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Phone, 
  MapPin, 
  Heart, 
  Thermometer, 
  Activity,
  Clock,
  User,
  AlertTriangle,
  Download,
  Share2
} from "lucide-react";
import { toast } from "sonner";

interface IncidentData {
  id: string;
  timestamp: string;
  user: {
    name: string;
    age: number;
    bloodType: string;
    medicalConditions: string[];
    allergies: string[];
    emergencyContacts: Array<{
      name: string;
      phone: string;
      relationship: string;
    }>;
  };
  vitals?: {
    heartRate: number;
    spO2: number;
    temperature: number;
    timestamp: string;
  };
  location?: {
    city: string;
    address: string;
    coordinates: [number, number];
  };
}

export const IncidentViewer = () => {
  const { encodedData } = useParams();
  const navigate = useNavigate();
  const [incidentData, setIncidentData] = useState<IncidentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (encodedData) {
      try {
        // Decode the base64 encoded incident data
        const decodedString = atob(encodedData);
        const parsedData = JSON.parse(decodedString);
        setIncidentData(parsedData);
        setLoading(false);
      } catch (err) {
        console.error("Error decoding incident data:", err);
        setError("Invalid incident data format");
        setLoading(false);
      }
    } else {
      setError("No incident data provided");
      setLoading(false);
    }
  }, [encodedData]);

  const callEmergencyContact = (phone: string, name: string) => {
    if (confirm(`Call ${name} at ${phone}?`)) {
      window.open(`tel:${phone}`, "_self");
    }
  };

  const openLocation = () => {
    if (incidentData?.location) {
      const [lng, lat] = incidentData.location.coordinates;
      const mapsUrl = `https://maps.google.com/?q=${lat},${lng}&z=15`;
      window.open(mapsUrl, '_blank');
    }
  };

  const downloadReport = () => {
    if (!incidentData) return;
    
    const reportData = {
      ...incidentData,
      generatedAt: new Date().toISOString(),
      reportType: "Emergency Medical Report"
    };
    
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { 
      type: 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `emergency-report-${incidentData.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success("Emergency report downloaded");
  };

  const shareReport = async () => {
    if (!incidentData) return;
    
    const shareText = `Emergency Report for ${incidentData.user.name}\nIncident ID: ${incidentData.id}\nGenerated: ${new Date(incidentData.timestamp).toLocaleString()}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Emergency Medical Report',
          text: shareText,
          url: window.location.href
        });
      } catch (err) {
        // Fallback to clipboard
        navigator.clipboard.writeText(`${shareText}\n${window.location.href}`);
        toast.success("Report link copied to clipboard");
      }
    } else {
      navigator.clipboard.writeText(`${shareText}\n${window.location.href}`);
      toast.success("Report link copied to clipboard");
    }
  };

  const getVitalStatus = (vital: string, value: number) => {
    switch (vital) {
      case 'heartRate':
        if (value < 60) return { status: 'low', color: 'text-blue-500' };
        if (value > 100) return { status: 'high', color: 'text-red-500' };
        return { status: 'normal', color: 'text-green-500' };
      case 'spO2':
        if (value < 95) return { status: 'low', color: 'text-red-500' };
        return { status: 'normal', color: 'text-green-500' };
      case 'temperature':
        if (value < 36) return { status: 'low', color: 'text-blue-500' };
        if (value > 37.5) return { status: 'high', color: 'text-red-500' };
        return { status: 'normal', color: 'text-green-500' };
      default:
        return { status: 'normal', color: 'text-gray-500' };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading emergency data...</p>
        </div>
      </div>
    );
  }

  if (error || !incidentData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 max-w-md mx-auto">
          <div className="text-center">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Unable to Load Data</h2>
            <p className="text-muted-foreground mb-4">
              {error || "The emergency data could not be decoded."}
            </p>
            <Button onClick={() => navigate("/")} className="w-full">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Return to Dashboard
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-6">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button 
            variant="outline" 
            onClick={() => navigate("/")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Button>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={shareReport}>
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
            <Button variant="outline" size="sm" onClick={downloadReport}>
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          </div>
        </div>

        {/* Emergency Header */}
        <Card className="p-6 mb-6 border-red-200 bg-red-50/50">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-red-900">Emergency Medical Report</h1>
                  <p className="text-red-600">Incident ID: {incidentData.id}</p>
                </div>
              </div>
              <p className="text-sm text-red-700">
                Generated: {new Date(incidentData.timestamp).toLocaleString()}
              </p>
            </div>
            <Badge variant="destructive" className="animate-pulse">
              EMERGENCY
            </Badge>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Patient Information */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <User className="w-5 h-5 text-blue-500" />
              <h2 className="text-xl font-semibold">Patient Information</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-medium">{incidentData.user.name}</span>
                <Badge variant="outline">{incidentData.user.bloodType}</Badge>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Age:</span>
                  <span className="ml-2 font-medium">{incidentData.user.age} years</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Blood Type:</span>
                  <span className="ml-2 font-medium">{incidentData.user.bloodType}</span>
                </div>
              </div>

              {incidentData.user.medicalConditions.length > 0 && (
                <div>
                  <h3 className="font-medium mb-2 text-orange-600">Medical Conditions:</h3>
                  <div className="flex flex-wrap gap-2">
                    {incidentData.user.medicalConditions.map((condition, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {condition}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {incidentData.user.allergies.length > 0 && (
                <div>
                  <h3 className="font-medium mb-2 text-red-600">Allergies:</h3>
                  <div className="flex flex-wrap gap-2">
                    {incidentData.user.allergies.map((allergy, index) => (
                      <Badge key={index} variant="destructive" className="text-xs">
                        {allergy}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Vital Signs */}
          {incidentData.vitals && (
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Activity className="w-5 h-5 text-green-500" />
                <h2 className="text-xl font-semibold">Vital Signs</h2>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-red-500" />
                    <span className="font-medium">Heart Rate</span>
                  </div>
                  <div className="text-right">
                    <span className={`text-lg font-bold ${getVitalStatus('heartRate', incidentData.vitals.heartRate).color}`}>
                      {incidentData.vitals.heartRate}
                    </span>
                    <span className="text-sm text-muted-foreground ml-1">BPM</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-blue-500" />
                    <span className="font-medium">Blood Oxygen</span>
                  </div>
                  <div className="text-right">
                    <span className={`text-lg font-bold ${getVitalStatus('spO2', incidentData.vitals.spO2).color}`}>
                      {incidentData.vitals.spO2}
                    </span>
                    <span className="text-sm text-muted-foreground ml-1">%</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Thermometer className="w-4 h-4 text-orange-500" />
                    <span className="font-medium">Temperature</span>
                  </div>
                  <div className="text-right">
                    <span className={`text-lg font-bold ${getVitalStatus('temperature', incidentData.vitals.temperature).color}`}>
                      {incidentData.vitals.temperature}
                    </span>
                    <span className="text-sm text-muted-foreground ml-1">°C</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>Recorded: {new Date(incidentData.vitals.timestamp).toLocaleString()}</span>
                </div>
              </div>
            </Card>
          )}

          {/* Location */}
          {incidentData.location && (
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-5 h-5 text-purple-500" />
                <h2 className="text-xl font-semibold">Location</h2>
              </div>
              
              <div className="space-y-3">
                <div>
                  <p className="font-medium">{incidentData.location.city}</p>
                  <p className="text-sm text-muted-foreground">{incidentData.location.address}</p>
                </div>
                
                <div className="text-xs text-muted-foreground font-mono">
                  {incidentData.location.coordinates[1].toFixed(6)}°N, {incidentData.location.coordinates[0].toFixed(6)}°E
                </div>
                
                <Button 
                  onClick={openLocation} 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                >
                  <MapPin className="w-4 h-4 mr-2" />
                  Open in Maps
                </Button>
              </div>
            </Card>
          )}

          {/* Emergency Contacts */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Phone className="w-5 h-5 text-green-500" />
              <h2 className="text-xl font-semibold">Emergency Contacts</h2>
            </div>
            
            <div className="space-y-3">
              {incidentData.user.emergencyContacts.map((contact, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between p-3 bg-muted/20 rounded-lg"
                >
                  <div>
                    <p className="font-medium">{contact.name}</p>
                    <p className="text-sm text-muted-foreground">{contact.relationship}</p>
                  </div>
                  <Button
                    onClick={() => callEmergencyContact(contact.phone, contact.name)}
                    size="sm"
                    className="bg-green-500 hover:bg-green-600"
                  >
                    <Phone className="w-4 h-4 mr-2" />
                    Call
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Footer */}
        <Card className="p-4 mt-6 bg-muted/10">
          <div className="text-center text-sm text-muted-foreground">
            <p>This emergency report was generated by LifeLine AI Emergency System</p>
            <p className="text-xs mt-1">For medical emergencies, call 112 (Kuwait Emergency Services)</p>
          </div>
        </Card>
      </div>
    </div>
  );
};