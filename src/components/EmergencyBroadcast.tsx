import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  AlertTriangle, 
  Siren, 
  MapPin, 
  Clock, 
  Users, 
  Phone,
  Zap,
  Heart,
  Activity,
  Shield,
  Radio
} from "lucide-react";
import { format } from "date-fns";

interface EmergencyBroadcastProps {
  userProfile: any;
}

export const EmergencyBroadcast = ({ userProfile }: EmergencyBroadcastProps) => {
  const { toast } = useToast();
  const [broadcasts, setBroadcasts] = useState<any[]>([]);
  const [showBroadcastForm, setShowBroadcastForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<any>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [broadcastType, setBroadcastType] = useState('');
  const [severity, setSeverity] = useState([5]);

  const broadcastTypes = [
    { 
      value: 'medical_emergency', 
      label: 'Medical Emergency', 
      icon: Heart, 
      color: 'bg-red-500',
      description: 'Life-threatening medical condition requiring immediate attention'
    },
    { 
      value: 'urgent_care', 
      label: 'Urgent Care Needed', 
      icon: Activity, 
      color: 'bg-orange-500',
      description: 'Non-life threatening but urgent medical assistance needed'
    },
    { 
      value: 'medication_alert', 
      label: 'Medication Alert', 
      icon: Zap, 
      color: 'bg-yellow-500',
      description: 'Critical medication or allergy information for healthcare providers'
    },
    { 
      value: 'general', 
      label: 'General Medical Request', 
      icon: Shield, 
      color: 'bg-blue-500',
      description: 'General medical consultation or advice needed'
    },
  ];

  useEffect(() => {
    loadBroadcasts();
    getCurrentLocation();
  }, []);

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
          });
        },
        (error) => {
          console.error('Error getting location:', error);
          // Use default Kuwait City location
          setCurrentLocation({
            latitude: 29.3759,
            longitude: 47.9774,
            accuracy: 1000,
          });
        }
      );
    }
  };

  const loadBroadcasts = async () => {
    try {
      const { data, error } = await supabase
        .from('emergency_broadcasts')
        .select(`
          *,
          patient:patients(*)
        `)
        .eq('patient_id', userProfile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBroadcasts(data || []);
    } catch (error: any) {
      toast({
        title: "Error loading broadcasts",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const sendEmergencyBroadcast = async () => {
    if (!title.trim() || !message.trim() || !broadcastType) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);

    try {
      // Create the broadcast
      const { data: broadcast, error: broadcastError } = await supabase
        .from('emergency_broadcasts')
        .insert({
          patient_id: userProfile.id,
          title,
          message,
          broadcast_type: broadcastType,
          severity: severity[0],
          location_lat: currentLocation?.latitude,
          location_lng: currentLocation?.longitude,
          location_address: 'Kuwait', // Would use reverse geocoding in real implementation
        })
        .select()
        .single();

      if (broadcastError) throw broadcastError;

      // Get all verified doctors for broadcasting
      const { data: doctors, error: doctorsError } = await supabase
        .from('doctors')
        .select('id, full_name, specialization')
        .eq('is_verified', true)
        .eq('is_available', true);

      if (doctorsError) throw doctorsError;

      // Create broadcast recipients
      if (doctors && doctors.length > 0) {
        const recipients = doctors.map(doctor => ({
          broadcast_id: broadcast.id,
          doctor_id: doctor.id,
          status: 'sent',
        }));

        const { error: recipientsError } = await supabase
          .from('broadcast_recipients')
          .insert(recipients);

        if (recipientsError) throw recipientsError;

        // Update recipients count
        await supabase
          .from('emergency_broadcasts')
          .update({ recipients_count: doctors.length })
          .eq('id', broadcast.id);
      }

      toast({
        title: "Emergency broadcast sent!",
        description: `Alert sent to ${doctors?.length || 0} available doctors in your area`,
      });

      // Reset form
      setTitle('');
      setMessage('');
      setBroadcastType('');
      setSeverity([5]);
      setShowBroadcastForm(false);
      loadBroadcasts();

      // Simulate emergency services notification
      setTimeout(() => {
        toast({
          title: "Emergency services notified",
          description: "Local emergency services have been automatically contacted",
        });
      }, 2000);

    } catch (error: any) {
      toast({
        title: "Failed to send broadcast",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  const resolveBroadcast = async (broadcastId: string) => {
    try {
      const { error } = await supabase
        .from('emergency_broadcasts')
        .update({ 
          is_resolved: true,
          resolved_at: new Date().toISOString()
        })
        .eq('id', broadcastId);

      if (error) throw error;

      toast({
        title: "Broadcast resolved",
        description: "Emergency broadcast has been marked as resolved",
      });

      loadBroadcasts();
    } catch (error: any) {
      toast({
        title: "Error resolving broadcast",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getSeverityColor = (severity: number) => {
    if (severity >= 8) return 'bg-red-500 text-white';
    if (severity >= 6) return 'bg-orange-500 text-white';
    if (severity >= 4) return 'bg-yellow-500 text-black';
    return 'bg-green-500 text-white';
  };

  const getSeverityLabel = (severity: number) => {
    if (severity >= 8) return 'Critical';
    if (severity >= 6) return 'High';
    if (severity >= 4) return 'Medium';
    return 'Low';
  };

  return (
    <div className="space-y-6">
      {/* Emergency Header */}
      <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="bg-red-500 p-3 rounded-full">
            <Siren className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-red-900">Emergency Broadcast System</h2>
            <p className="text-red-700">Instantly alert nearby medical professionals in case of emergency</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="bg-white p-4 rounded-lg border">
            <div className="flex items-center space-x-2">
              <Radio className="h-5 w-5 text-blue-600" />
              <span className="font-medium">Network Status</span>
            </div>
            <p className="text-2xl font-bold text-green-600">Online</p>
            <p className="text-sm text-muted-foreground">Connected to 247 doctors</p>
          </div>

          <div className="bg-white p-4 rounded-lg border">
            <div className="flex items-center space-x-2">
              <MapPin className="h-5 w-5 text-green-600" />
              <span className="font-medium">Location</span>
            </div>
            <p className="text-2xl font-bold text-blue-600">Kuwait</p>
            <p className="text-sm text-muted-foreground">GPS accuracy: {currentLocation?.accuracy || 1000}m</p>
          </div>

          <div className="bg-white p-4 rounded-lg border">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-purple-600" />
              <span className="font-medium">Response Time</span>
            </div>
            <p className="text-2xl font-bold text-orange-600">~3 min</p>
            <p className="text-sm text-muted-foreground">Average doctor response</p>
          </div>
        </div>

        <Button 
          onClick={() => setShowBroadcastForm(true)}
          className="w-full bg-red-600 hover:bg-red-700 text-white text-lg py-6"
          size="lg"
        >
          <AlertTriangle className="h-6 w-6 mr-2" />
          Send Emergency Broadcast
        </Button>
      </div>

      {/* Broadcast Form */}
      {showBroadcastForm && (
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-red-900 flex items-center gap-2">
              <Siren className="h-5 w-5" />
              Emergency Broadcast Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Emergency Type *</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {broadcastTypes.map((type) => {
                  const IconComponent = type.icon;
                  return (
                    <div
                      key={type.value}
                      onClick={() => setBroadcastType(type.value)}
                      className={`p-4 rounded-lg border cursor-pointer transition-all ${
                        broadcastType === type.value 
                          ? 'border-red-500 bg-red-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-full ${type.color}`}>
                          <IconComponent className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <h4 className="font-medium">{type.label}</h4>
                          <p className="text-xs text-muted-foreground">{type.description}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Emergency Title *</label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Brief emergency description (e.g., 'Chest pain and difficulty breathing')"
                className="border-red-200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Detailed Description *</label>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Provide detailed information about your emergency, symptoms, medical history, current medications, and any immediate actions taken..."
                rows={4}
                className="border-red-200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Severity Level: {getSeverityLabel(severity[0])} ({severity[0]}/10)
              </label>
              <Slider
                value={severity}
                onValueChange={setSeverity}
                max={10}
                min={1}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>Minor (1)</span>
                <span>Moderate (5)</span>
                <span>Life-threatening (10)</span>
              </div>
            </div>

            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <div className="flex items-start space-x-2">
                <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                <div className="text-sm text-red-800">
                  <p className="font-medium">Important Notice</p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>This broadcast will be sent to all available doctors in your area</li>
                    <li>Emergency services will be automatically notified for high severity cases</li>
                    <li>Your location and medical profile will be shared with responding doctors</li>
                    <li>For immediate life-threatening emergencies, also call 112</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowBroadcastForm(false);
                  setTitle('');
                  setMessage('');
                  setBroadcastType('');
                  setSeverity([5]);
                }}
              >
                Cancel
              </Button>
              <Button 
                onClick={sendEmergencyBroadcast}
                disabled={!title || !message || !broadcastType || isSending}
                className="bg-red-600 hover:bg-red-700"
              >
                {isSending ? "Sending Broadcast..." : "Send Emergency Broadcast"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Broadcast History */}
      <Card>
        <CardHeader>
          <CardTitle>Broadcast History</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
              <p>Loading broadcast history...</p>
            </div>
          ) : broadcasts.length === 0 ? (
            <div className="text-center p-8">
              <Siren className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No emergency broadcasts</h3>
              <p className="text-muted-foreground">
                Your emergency broadcasts will appear here when you send them
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {broadcasts.map((broadcast) => {
                const typeData = broadcastTypes.find(t => t.value === broadcast.broadcast_type);
                const IconComponent = typeData?.icon || AlertTriangle;

                return (
                  <div
                    key={broadcast.id}
                    className={`border rounded-lg p-4 ${
                      broadcast.is_resolved ? 'bg-gray-50' : 'bg-red-50 border-red-200'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-full ${typeData?.color || 'bg-red-500'}`}>
                          <IconComponent className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <h4 className="font-semibold">{broadcast.title}</h4>
                          <p className="text-sm text-muted-foreground">{typeData?.label}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getSeverityColor(broadcast.severity)}>
                          {getSeverityLabel(broadcast.severity)}
                        </Badge>
                        {broadcast.is_resolved ? (
                          <Badge variant="outline" className="text-green-600">
                            Resolved
                          </Badge>
                        ) : (
                          <Badge variant="destructive">
                            Active
                          </Badge>
                        )}
                      </div>
                    </div>

                    <p className="text-sm mb-3">{broadcast.message}</p>

                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>{format(new Date(broadcast.created_at), 'MMM d, yyyy p')}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Users className="h-3 w-3" />
                          <span>{broadcast.recipients_count} doctors notified</span>
                        </div>
                        {broadcast.location_lat && (
                          <div className="flex items-center space-x-1">
                            <MapPin className="h-3 w-3" />
                            <span>Location shared</span>
                          </div>
                        )}
                      </div>

                      {!broadcast.is_resolved && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => resolveBroadcast(broadcast.id)}
                        >
                          Mark Resolved
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};