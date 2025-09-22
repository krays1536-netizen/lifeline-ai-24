import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Search, 
  Stethoscope, 
  MessageSquare, 
  Video, 
  Calendar,
  MapPin,
  Star,
  Clock,
  DollarSign,
  Users,
  Shield,
  Phone
} from "lucide-react";

interface DoctorDirectoryProps {
  userType: 'patient' | 'doctor';
  userProfile: any;
}

export const DoctorDirectory = ({ userType, userProfile }: DoctorDirectoryProps) => {
  const { toast } = useToast();
  const [doctors, setDoctors] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialization, setSelectedSpecialization] = useState('all');
  const [specializations, setSpecializations] = useState<string[]>([]);

  useEffect(() => {
    loadDoctors();
  }, []);

  const loadDoctors = async () => {
    try {
      const { data, error } = await supabase
        .from('doctors')
        .select('*')
        .eq('is_verified', true)
        .order('full_name');

      if (error) throw error;
      
      setDoctors(data || []);
      
      // Extract unique specializations
      const uniqueSpecs = [...new Set(data?.map(doc => doc.specialization) || [])];
      setSpecializations(uniqueSpecs);
      
    } catch (error: any) {
      toast({
        title: "Error loading doctors",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const startConversation = async (doctorId: string) => {
    if (userType !== 'patient') {
      toast({
        title: "Access denied",
        description: "Only patients can start conversations with doctors",
        variant: "destructive",
      });
      return;
    }

    try {
      // Check if conversation already exists
      const { data: existingConv, error: checkError } = await supabase
        .from('conversations')
        .select('id')
        .eq('patient_id', userProfile.id)
        .eq('doctor_id', doctorId)
        .single();

      if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows found
        throw checkError;
      }

      let conversationId;

      if (existingConv) {
        conversationId = existingConv.id;
      } else {
        // Create new conversation
        const { data: newConv, error: createError } = await supabase
          .from('conversations')
          .insert({
            patient_id: userProfile.id,
            doctor_id: doctorId,
            title: 'Medical Consultation'
          })
          .select('id')
          .single();

        if (createError) throw createError;
        conversationId = newConv.id;
      }

      toast({
        title: "Conversation started",
        description: "You can now message this doctor securely",
      });

      // In a real app, you would navigate to the messaging tab or open the conversation
      
    } catch (error: any) {
      toast({
        title: "Error starting conversation",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const scheduleConsultation = async (doctorId: string) => {
    if (userType !== 'patient') {
      toast({
        title: "Access denied",
        description: "Only patients can schedule consultations",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Schedule consultation",
      description: "This would open the consultation scheduling form",
    });

    // In a real app, this would open a scheduling modal or navigate to scheduling
  };

  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch = 
      doctor.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.specialization.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.bio?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSpecialization = 
      selectedSpecialization === 'all' || 
      doctor.specialization === selectedSpecialization;
    
    return matchesSearch && matchesSpecialization;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p>Loading doctors...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold">Doctor Directory</h2>
          <p className="text-muted-foreground">
            {userType === 'patient' 
              ? 'Find and connect with verified healthcare professionals'
              : 'Directory of verified medical professionals'
            }
          </p>
        </div>
        <Badge variant="outline" className="flex items-center gap-1">
          <Shield className="h-3 w-3" />
          {doctors.length} Verified Doctors
        </Badge>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, specialization, or keywords..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="sm:w-64">
              <Select value={selectedSpecialization} onValueChange={setSelectedSpecialization}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Specializations</SelectItem>
                  {specializations.map((spec) => (
                    <SelectItem key={spec} value={spec}>
                      {spec}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Doctors Grid */}
      {filteredDoctors.length === 0 ? (
        <Card>
          <CardContent className="text-center p-8">
            <Stethoscope className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No doctors found</h3>
            <p className="text-muted-foreground">
              {searchTerm || selectedSpecialization !== 'all'
                ? 'Try adjusting your search criteria'
                : 'No verified doctors available at the moment'
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredDoctors.map((doctor) => (
            <Card key={doctor.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="text-center pb-4">
                <Avatar className="w-20 h-20 mx-auto mb-3">
                  <AvatarFallback className="text-lg">
                    {doctor.full_name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-xl">{doctor.full_name}</CardTitle>
                  <p className="text-muted-foreground">{doctor.specialization}</p>
                </div>
                <div className="flex justify-center items-center space-x-4 text-sm text-muted-foreground mt-2">
                  {doctor.years_experience && (
                    <div className="flex items-center space-x-1">
                      <Clock className="h-3 w-3" />
                      <span>{doctor.years_experience} years</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-1">
                    <Shield className="h-3 w-3 text-green-600" />
                    <span>Verified</span>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {doctor.bio && (
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {doctor.bio}
                  </p>
                )}

                <div className="space-y-2">
                  {doctor.consultation_rate && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Consultation Rate:</span>
                      <div className="flex items-center space-x-1">
                        <DollarSign className="h-3 w-3" />
                        <span className="font-medium">KD {doctor.consultation_rate}</span>
                      </div>
                    </div>
                  )}

                  {doctor.languages && doctor.languages.length > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Languages:</span>
                      <span className="font-medium">
                        {doctor.languages.join(', ')}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Status:</span>
                    <Badge variant={doctor.is_available ? 'default' : 'secondary'}>
                      {doctor.is_available ? 'Available' : 'Busy'}
                    </Badge>
                  </div>
                </div>

                {/* Action buttons for patients */}
                {userType === 'patient' && (
                  <div className="flex space-x-2 pt-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => startConversation(doctor.id)}
                      disabled={!doctor.is_available}
                    >
                      <MessageSquare className="h-4 w-4 mr-1" />
                      Message
                    </Button>
                    <Button 
                      size="sm" 
                      className="flex-1"
                      onClick={() => scheduleConsultation(doctor.id)}
                      disabled={!doctor.is_available}
                    >
                      <Video className="h-4 w-4 mr-1" />
                      Consult
                    </Button>
                  </div>
                )}

                {/* Contact info for doctors */}
                {userType === 'doctor' && doctor.phone && (
                  <div className="flex items-center justify-center text-sm text-muted-foreground pt-2">
                    <Phone className="h-3 w-3 mr-1" />
                    <span>{doctor.phone}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Stats Footer */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-primary">{doctors.length}</div>
              <div className="text-sm text-muted-foreground">Verified Doctors</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {doctors.filter(d => d.is_available).length}
              </div>
              <div className="text-sm text-muted-foreground">Available Now</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">{specializations.length}</div>
              <div className="text-sm text-muted-foreground">Specializations</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">
                {Math.round(doctors.reduce((acc, d) => acc + (d.years_experience || 0), 0) / doctors.length) || 0}
              </div>
              <div className="text-sm text-muted-foreground">Avg. Experience</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};