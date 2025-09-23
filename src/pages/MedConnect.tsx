import { useState, useEffect } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Heart, 
  MessageCircle, 
  Video, 
  FileText, 
  AlertTriangle, 
  Users,
  Shield,
  Phone,
  Calendar,
  Settings,
  LogOut,
  CreditCard,
  Activity
} from "lucide-react";

// Import components
import { MedConnectAuth } from "@/components/MedConnectAuth";
import { SecureMessaging } from "@/components/SecureMessaging";
import { VideoConsultation } from "@/components/VideoConsultation";
import { MedicalFileSharing } from "@/components/MedicalFileSharing";
import { EmergencyBroadcast } from "@/components/EmergencyBroadcast";
import { DoctorDirectory } from "@/components/DoctorDirectory";
import { MedicalIDCard } from "@/components/MedicalIDCard";
import { RealTimeVideoCall } from "@/components/RealTimeVideoCall";
import { HealthVitalsMonitor } from "@/components/HealthVitalsMonitor";

export const MedConnect = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [userType, setUserType] = useState<'patient' | 'doctor' | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [activeCall, setActiveCall] = useState<any>(null);

  useEffect(() => {
    // Check for existing session
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        await checkUserProfile(session.user.id);
      }
      setIsLoading(false);
    };

    getSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser(session.user);
          await checkUserProfile(session.user.id);
        } else {
          setUser(null);
          setUserProfile(null);
          setUserType(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const checkUserProfile = async (userId: string) => {
    try {
      // Check if user is a patient
      const { data: patientData } = await supabase
        .from('patients')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (patientData) {
        setUserProfile(patientData);
        setUserType('patient');
        return;
      }

      // Check if user is a doctor
      const { data: doctorData } = await supabase
        .from('doctors')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (doctorData) {
        setUserProfile(doctorData);
        setUserType('doctor');
        return;
      }

      // No profile found
      setUserProfile(null);
      setUserType(null);
    } catch (error) {
      console.error('Error checking user profile:', error);
    }
  };

  const handleAuthSuccess = async (userId: string) => {
    await checkUserProfile(userId);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setUserProfile(null);
    setUserType(null);
    navigate('/');
    toast({
      title: "Signed out successfully", 
      description: "You have been logged out of MedConnect",
    });
  };

  const startVideoCall = (consultation: any) => {
    setActiveCall(consultation);
  };

  const endVideoCall = () => {
    setActiveCall(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900">Loading MedConnect...</h2>
        </div>
      </div>
    );
  }

  if (!user) {
    return <MedConnectAuth onAuthSuccess={handleAuthSuccess} />;
  }

  // If there's an active video call, show the call interface
  if (activeCall) {
    return (
      <RealTimeVideoCall
        consultationId={activeCall.id}
        userType={userType!}
        otherParticipant={
          userType === 'patient' 
            ? activeCall.conversation.doctor 
            : activeCall.conversation.patient
        }
        onEndCall={endVideoCall}
      />
    );
  }

  return (
    <Routes>
      <Route path="/" element={
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
          {/* Header */}
          <header className="bg-white shadow-sm border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Heart className="h-8 w-8 text-red-500" />
                    <h1 className="text-2xl font-bold text-gray-900">MedConnect</h1>
                  </div>
                  <div className="hidden md:flex items-center space-x-2 bg-blue-50 px-3 py-1 rounded-full">
                    <Shield className="h-4 w-4 text-blue-600" />
                    <span className="text-sm text-blue-700 font-medium">Secure Platform</span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{userProfile?.full_name}</p>
                    <p className="text-xs text-gray-500 capitalize">
                      {userType} • {userType === 'doctor' ? userProfile?.specialization : 'Patient'}
                    </p>
                  </div>
                  <Button variant="outline" size="sm" onClick={signOut}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                </div>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-8 lg:w-fit lg:grid-cols-8 gap-1">
                <TabsTrigger value="dashboard" className="flex items-center space-x-2">
                  <Heart className="h-4 w-4" />
                  <span className="hidden sm:inline">Dashboard</span>
                </TabsTrigger>
                <TabsTrigger value="id-card" className="flex items-center space-x-2">
                  <CreditCard className="h-4 w-4" />
                  <span className="hidden sm:inline">ID Card</span>
                </TabsTrigger>
                <TabsTrigger value="vitals" className="flex items-center space-x-2">
                  <Activity className="h-4 w-4" />
                  <span className="hidden sm:inline">Vitals</span>
                </TabsTrigger>
                <TabsTrigger value="messaging" className="flex items-center space-x-2">
                  <MessageCircle className="h-4 w-4" />
                  <span className="hidden sm:inline">Messages</span>
                </TabsTrigger>
                <TabsTrigger value="consultations" className="flex items-center space-x-2">
                  <Video className="h-4 w-4" />
                  <span className="hidden sm:inline">Video Calls</span>
                </TabsTrigger>
                <TabsTrigger value="files" className="flex items-center space-x-2">
                  <FileText className="h-4 w-4" />
                  <span className="hidden sm:inline">Files</span>
                </TabsTrigger>
                <TabsTrigger value="emergency" className="flex items-center space-x-2">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="hidden sm:inline">Emergency</span>
                </TabsTrigger>
                <TabsTrigger value="directory" className="flex items-center space-x-2">
                  <Users className="h-4 w-4" />
                  <span className="hidden sm:inline">Directory</span>
                </TabsTrigger>
              </TabsList>

              {/* Dashboard Tab */}
              <TabsContent value="dashboard" className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                  <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-blue-900">Quick Actions</CardTitle>
                      <Heart className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <Button 
                          size="sm" 
                          className="w-full bg-blue-600 hover:bg-blue-700"
                          onClick={() => setActiveTab("consultations")}
                        >
                          <Video className="h-4 w-4 mr-2" />
                          Start Video Call
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="w-full"
                          onClick={() => setActiveTab("emergency")}
                        >
                          <AlertTriangle className="h-4 w-4 mr-2" />
                          Emergency SOS
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-green-900">Health Status</CardTitle>
                      <Activity className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-700">Good</div>
                      <p className="text-xs text-green-600">
                        All vitals normal
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-purple-900">Messages</CardTitle>
                      <MessageCircle className="h-4 w-4 text-purple-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-purple-700">3</div>
                      <p className="text-xs text-purple-600">
                        2 unread messages
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-red-900">Medical ID</CardTitle>
                      <CreditCard className="h-4 w-4 text-red-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-lg font-bold text-red-700">
                        {userType === 'patient' ? 'MID' : 'DID'}-{userProfile?.id?.slice(0, 8).toUpperCase()}
                      </div>
                      <p className="text-xs text-red-600">
                        Active & Verified
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Life-Saving Features */}
                <Card className="bg-gradient-to-r from-red-600 to-pink-600 text-white">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Shield className="h-5 w-5" />
                      <span>Life-Saving Features</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Button 
                        variant="secondary" 
                        className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                        onClick={() => setActiveTab("emergency")}
                      >
                        <AlertTriangle className="h-4 w-4 mr-2" />
                        Emergency SOS
                      </Button>
                      <Button 
                        variant="secondary"
                        className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                        onClick={() => setActiveTab("consultations")}
                      >
                        <Video className="h-4 w-4 mr-2" />
                        Instant Consult
                      </Button>
                      <Button 
                        variant="secondary"
                        className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                        onClick={() => setActiveTab("id-card")}
                      >
                        <CreditCard className="h-4 w-4 mr-2" />
                        Medical ID
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="id-card" className="space-y-6">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Medical ID Card</h2>
                  <p className="text-gray-600">Your secure medical identification with emergency information</p>
                </div>
                <div className="flex justify-center">
                  <MedicalIDCard userProfile={userProfile} userType={userType!} />
                </div>
              </TabsContent>

              <TabsContent value="vitals" className="space-y-6">
                <HealthVitalsMonitor 
                  patientId={userProfile?.id} 
                  isLive={userType === 'patient'} 
                />
              </TabsContent>

              <TabsContent value="messaging" className="space-y-6">
                <SecureMessaging userProfile={userProfile} userType={userType!} />
              </TabsContent>

              <TabsContent value="consultations" className="space-y-6">
                <VideoConsultation 
                  userType={userType!} 
                  userProfile={userProfile}
                  onStartCall={startVideoCall}
                />
              </TabsContent>

              <TabsContent value="files" className="space-y-6">
                <MedicalFileSharing userType={userType!} userProfile={userProfile} />
              </TabsContent>

              <TabsContent value="emergency" className="space-y-6">
                <EmergencyBroadcast userProfile={userProfile} />
              </TabsContent>

              <TabsContent value="directory" className="space-y-6">
                <DoctorDirectory userType={userType} userProfile={userProfile} />
              </TabsContent>
            </Tabs>
          </main>
        </div>
      } />
    </Routes>
  );
};