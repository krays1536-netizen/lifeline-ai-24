import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Video, 
  Calendar, 
  Clock, 
  User, 
  Phone,
  Monitor,
  Mic,
  MicOff,
  VideoOff,
  PhoneOff,
  Settings,
  FileText,
  DollarSign
} from "lucide-react";
import { format } from "date-fns";

interface VideoConsultationProps {
  userType: 'patient' | 'doctor';
  userProfile: any;
}

export const VideoConsultation = ({ userType, userProfile }: VideoConsultationProps) => {
  const { toast } = useToast();
  const [consultations, setConsultations] = useState<any[]>([]);
  const [selectedConsultation, setSelectedConsultation] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [isInCall, setIsInCall] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  
  // Form states
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [selectedPatient, setSelectedPatient] = useState('');
  const [consultationDate, setConsultationDate] = useState('');
  const [consultationTime, setConsultationTime] = useState('');
  const [duration, setDuration] = useState('30');
  const [notes, setNotes] = useState('');
  const [doctors, setDoctors] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);

  useEffect(() => {
    loadConsultations();
    if (userType === 'patient') {
      loadDoctors();
    } else {
      loadPatients();
    }
  }, []);

  const loadConsultations = async () => {
    try {
      const { data, error } = await supabase
        .from('consultations')
        .select(`
          *,
          conversation:conversations(
            patient:patients(*),
            doctor:doctors(*)
          )
        `)
        .order('scheduled_at', { ascending: true });

      if (error) throw error;
      setConsultations(data || []);
    } catch (error: any) {
      toast({
        title: "Error loading consultations",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadDoctors = async () => {
    try {
      const { data, error } = await supabase
        .from('doctors')
        .select('*')
        .eq('is_verified', true)
        .eq('is_available', true);

      if (error) throw error;
      setDoctors(data || []);
    } catch (error: any) {
      console.error('Error loading doctors:', error);
    }
  };

  const loadPatients = async () => {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*');

      if (error) throw error;
      setPatients(data || []);
    } catch (error: any) {
      console.error('Error loading patients:', error);
    }
  };

  const scheduleConsultation = async () => {
    try {
      const scheduledDateTime = new Date(`${consultationDate}T${consultationTime}`);
      
      // First, create or get conversation
      let conversationId;
      
      if (userType === 'patient') {
        // Patient scheduling with a doctor
        const { data: existingConv } = await supabase
          .from('conversations')
          .select('id')
          .eq('patient_id', userProfile.id)
          .eq('doctor_id', selectedDoctor)
          .single();

        if (existingConv) {
          conversationId = existingConv.id;
        } else {
          const { data: newConv, error: convError } = await supabase
            .from('conversations')
            .insert({
              patient_id: userProfile.id,
              doctor_id: selectedDoctor,
              title: 'Video Consultation'
            })
            .select('id')
            .single();

          if (convError) throw convError;
          conversationId = newConv.id;
        }
      } else {
        // Doctor scheduling with a patient
        const { data: existingConv } = await supabase
          .from('conversations')
          .select('id')
          .eq('patient_id', selectedPatient)
          .eq('doctor_id', userProfile.id)
          .single();

        if (existingConv) {
          conversationId = existingConv.id;
        } else {
          const { data: newConv, error: convError } = await supabase
            .from('conversations')
            .insert({
              patient_id: selectedPatient,
              doctor_id: userProfile.id,
              title: 'Video Consultation'
            })
            .select('id')
            .single();

          if (convError) throw convError;
          conversationId = newConv.id;
        }
      }

      // Create consultation
      const { error } = await supabase
        .from('consultations')
        .insert({
          conversation_id: conversationId,
          scheduled_at: scheduledDateTime.toISOString(),
          duration_minutes: parseInt(duration),
          notes: notes,
          status: 'scheduled',
          cost: userType === 'doctor' ? 0 : 50.00, // Default rate
        });

      if (error) throw error;

      toast({
        title: "Consultation scheduled!",
        description: `Video consultation scheduled for ${format(scheduledDateTime, 'PPP p')}`,
      });

      setShowScheduleForm(false);
      loadConsultations();
      
      // Reset form
      setSelectedDoctor('');
      setSelectedPatient('');
      setConsultationDate('');
      setConsultationTime('');
      setNotes('');
    } catch (error: any) {
      toast({
        title: "Error scheduling consultation",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const joinConsultation = (consultation: any) => {
    setSelectedConsultation(consultation);
    setIsInCall(true);
    
    toast({
      title: "Joining consultation",
      description: "Connecting to secure video call...",
    });

    // Update consultation status
    supabase
      .from('consultations')
      .update({ 
        status: 'in_progress',
        started_at: new Date().toISOString()
      })
      .eq('id', consultation.id);
  };

  const endConsultation = () => {
    if (selectedConsultation) {
      supabase
        .from('consultations')
        .update({ 
          status: 'completed',
          ended_at: new Date().toISOString()
        })
        .eq('id', selectedConsultation.id);
    }

    setIsInCall(false);
    setSelectedConsultation(null);
    loadConsultations();
    
    toast({
      title: "Consultation ended",
      description: "Video call has been terminated",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'in_progress':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isInCall && selectedConsultation) {
    return (
      <Card className="h-[600px]">
        <CardContent className="p-0 h-full">
          <div className="relative h-full bg-gray-900 rounded-lg overflow-hidden">
            {/* Video Area */}
            <div className="h-full flex items-center justify-center">
              <div className="text-center text-white">
                <Video className="h-24 w-24 mx-auto mb-4 opacity-50" />
                <h3 className="text-2xl font-semibold mb-2">
                  Video Consultation in Progress
                </h3>
                <p className="text-gray-300 mb-4">
                  Connected with {userType === 'patient' 
                    ? selectedConsultation.conversation.doctor.full_name 
                    : selectedConsultation.conversation.patient.full_name}
                </p>
                <div className="text-sm text-gray-400">
                  Duration: {selectedConsultation.duration_minutes} minutes
                </div>
              </div>
            </div>

            {/* Control Bar */}
            <div className="absolute bottom-0 left-0 right-0 bg-black/70 p-4">
              <div className="flex justify-center space-x-4">
                <Button
                  variant={isMuted ? "destructive" : "secondary"}
                  size="lg"
                  onClick={() => setIsMuted(!isMuted)}
                  className="rounded-full w-12 h-12"
                >
                  {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                </Button>
                
                <Button
                  variant={isVideoOff ? "destructive" : "secondary"}
                  size="lg"
                  onClick={() => setIsVideoOff(!isVideoOff)}
                  className="rounded-full w-12 h-12"
                >
                  {isVideoOff ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
                </Button>

                <Button
                  variant="destructive"
                  size="lg"
                  onClick={endConsultation}
                  className="rounded-full w-12 h-12"
                >
                  <PhoneOff className="h-5 w-5" />
                </Button>

                <Button
                  variant="secondary"
                  size="lg"
                  className="rounded-full w-12 h-12"
                >
                  <Settings className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Participant Info */}
            <div className="absolute top-4 left-4 bg-black/50 text-white p-3 rounded-lg">
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4" />
                <span className="text-sm">
                  {userType === 'patient' 
                    ? selectedConsultation.conversation.doctor.full_name 
                    : selectedConsultation.conversation.patient.full_name}
                </span>
              </div>
            </div>

            {/* Time indicator */}
            <div className="absolute top-4 right-4 bg-black/50 text-white p-3 rounded-lg">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4" />
                <span className="text-sm">
                  {format(new Date(selectedConsultation.scheduled_at), 'p')}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Video Consultations</h2>
        <Button onClick={() => setShowScheduleForm(true)}>
          <Calendar className="h-4 w-4 mr-2" />
          Schedule Consultation
        </Button>
      </div>

      {/* Schedule Form Modal */}
      {showScheduleForm && (
        <Card>
          <CardHeader>
            <CardTitle>Schedule Video Consultation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {userType === 'patient' && (
              <div>
                <label className="block text-sm font-medium mb-2">Select Doctor</label>
                <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a doctor" />
                  </SelectTrigger>
                  <SelectContent>
                    {doctors.map((doctor) => (
                      <SelectItem key={doctor.id} value={doctor.id}>
                        <div>
                          <div className="font-medium">{doctor.full_name}</div>
                          <div className="text-sm text-muted-foreground">
                            {doctor.specialization} • KD {doctor.consultation_rate || '50.00'}
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {userType === 'doctor' && (
              <div>
                <label className="block text-sm font-medium mb-2">Select Patient</label>
                <Select value={selectedPatient} onValueChange={setSelectedPatient}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a patient" />
                  </SelectTrigger>
                  <SelectContent>
                    {patients.map((patient) => (
                      <SelectItem key={patient.id} value={patient.id}>
                        {patient.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Date</label>
                <Input
                  type="date"
                  value={consultationDate}
                  onChange={(e) => setConsultationDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Time</label>
                <Input
                  type="time"
                  value={consultationTime}
                  onChange={(e) => setConsultationTime(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Duration (minutes)</label>
              <Select value={duration} onValueChange={setDuration}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="45">45 minutes</SelectItem>
                  <SelectItem value="60">60 minutes</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Notes</label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Consultation notes or special instructions..."
                rows={3}
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowScheduleForm(false)}>
                Cancel
              </Button>
              <Button onClick={scheduleConsultation}>
                Schedule Consultation
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Consultations List */}
      <div className="grid gap-4">
        {isLoading ? (
          <div className="text-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p>Loading consultations...</p>
          </div>
        ) : consultations.length === 0 ? (
          <Card>
            <CardContent className="text-center p-8">
              <Video className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No consultations scheduled</h3>
              <p className="text-muted-foreground mb-4">
                Schedule your first video consultation to get started
              </p>
              <Button onClick={() => setShowScheduleForm(true)}>
                <Calendar className="h-4 w-4 mr-2" />
                Schedule Now
              </Button>
            </CardContent>
          </Card>
        ) : (
          consultations.map((consultation) => (
            <Card key={consultation.id}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold">
                        {userType === 'patient' 
                          ? `Dr. ${consultation.conversation.doctor.full_name}`
                          : consultation.conversation.patient.full_name}
                      </h3>
                      <Badge className={getStatusColor(consultation.status)}>
                        {consultation.status}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>{format(new Date(consultation.scheduled_at), 'PPP')}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>{format(new Date(consultation.scheduled_at), 'p')}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Video className="h-4 w-4" />
                        <span>{consultation.duration_minutes} min</span>
                      </div>
                      {consultation.cost && (
                        <div className="flex items-center space-x-1">
                          <DollarSign className="h-4 w-4" />
                          <span>KD {consultation.cost}</span>
                        </div>
                      )}
                    </div>

                    {userType === 'patient' && (
                      <p className="text-sm text-muted-foreground">
                        {consultation.conversation.doctor.specialization}
                      </p>
                    )}

                    {consultation.notes && (
                      <p className="text-sm text-muted-foreground">
                        {consultation.notes}
                      </p>
                    )}
                  </div>

                  <div className="flex space-x-2">
                    {consultation.status === 'scheduled' && (
                      <>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => joinConsultation(consultation)}
                        >
                          <Video className="h-4 w-4 mr-2" />
                          Join
                        </Button>
                        <Button variant="outline" size="sm">
                          <Phone className="h-4 w-4 mr-2" />
                          Call
                        </Button>
                      </>
                    )}
                    
                    {consultation.status === 'completed' && (
                      <Button variant="outline" size="sm">
                        <FileText className="h-4 w-4 mr-2" />
                        Report
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};