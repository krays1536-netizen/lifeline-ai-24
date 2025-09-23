import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Users, 
  Heart, 
  MapPin, 
  Shield, 
  Zap,
  Activity,
  Radio,
  Waves,
  UserPlus,
  MessageCircle,
  Phone,
  Video,
  Stethoscope,
  AlertTriangle,
  CheckCircle,
  Timer,
  Navigation,
  Radar
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface CommunityMember {
  id: string;
  name: string;
  avatar?: string;
  role: 'guardian' | 'doctor' | 'paramedic' | 'nurse' | 'volunteer';
  status: 'online' | 'busy' | 'emergency' | 'offline';
  location: {
    latitude: number;
    longitude: number;
    address: string;
    distance: number; // in km
  };
  specialties?: string[];
  responseTime: number; // in minutes
  rating: number;
  isVerified: boolean;
  lastSeen: Date;
  emergencySkills: string[];
}

interface EmergencyAlert {
  id: string;
  type: 'medical' | 'accident' | 'fire' | 'crime' | 'natural_disaster';
  severity: 'low' | 'medium' | 'high' | 'critical';
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  timestamp: Date;
  description: string;
  requesterName: string;
  respondersNeeded: number;
  currentResponders: CommunityMember[];
  skills_needed: string[];
}

interface UltimateCommunityPulseProps {
  userLocation?: {
    latitude: number;
    longitude: number;
    address: string;
  };
  onJoinEmergency?: (alertId: string) => void;
  onStartCommunityChat?: () => void;
}

export const UltimateCommunityPulse = ({
  userLocation,
  onJoinEmergency,
  onStartCommunityChat
}: UltimateCommunityPulseProps) => {
  const { toast } = useToast();
  const [communityMembers, setCommunityMembers] = useState<CommunityMember[]>([]);
  const [emergencyAlerts, setEmergencyAlerts] = useState<EmergencyAlert[]>([]);
  const [isRescuerMode, setIsRescuerMode] = useState(false);
  const [responseRadius, setResponseRadius] = useState(5); // km
  const [networkStatus, setNetworkStatus] = useState<'connected' | 'syncing' | 'offline'>('connected');
  const [personalStats, setPersonalStats] = useState({
    emergenciesResponded: 12,
    livesImpacted: 8,
    communityRating: 4.8,
    responseTime: 3.2
  });

  // Initialize community data
  useEffect(() => {
    const initializeCommunity = () => {
      // Generate mock community members
      const mockMembers: CommunityMember[] = [
        {
          id: '1',
          name: 'Dr. Sarah Ahmed',
          role: 'doctor',
          status: 'online',
          location: {
            latitude: 29.3759 + (Math.random() - 0.5) * 0.1,
            longitude: 47.9774 + (Math.random() - 0.5) * 0.1,
            address: 'Kuwait City Medical District',
            distance: 2.3
          },
          specialties: ['Emergency Medicine', 'Cardiology'],
          responseTime: 4,
          rating: 4.9,
          isVerified: true,
          lastSeen: new Date(),
          emergencySkills: ['CPR', 'Advanced Life Support', 'Trauma Care']
        },
        {
          id: '2',
          name: 'Mohammed Al-Rashid',
          role: 'paramedic',
          status: 'emergency',
          location: {
            latitude: 29.3759 + (Math.random() - 0.5) * 0.1,
            longitude: 47.9774 + (Math.random() - 0.5) * 0.1,
            address: 'Salmiya Emergency Center',
            distance: 1.8
          },
          responseTime: 2,
          rating: 4.7,
          isVerified: true,
          lastSeen: new Date(),
          emergencySkills: ['Emergency Response', 'CPR', 'First Aid', 'Ambulance Operations']
        },
        {
          id: '3',
          name: 'Fatima Hassan',
          role: 'nurse',
          status: 'online',
          location: {
            latitude: 29.3759 + (Math.random() - 0.5) * 0.1,
            longitude: 47.9774 + (Math.random() - 0.5) * 0.1,
            address: 'Hawalli Health Center',
            distance: 3.1
          },
          specialties: ['Pediatric Care', 'Emergency Nursing'],
          responseTime: 6,
          rating: 4.8,
          isVerified: true,
          lastSeen: new Date(),
          emergencySkills: ['First Aid', 'CPR', 'Pediatric Care']
        },
        {
          id: '4',
          name: 'Omar Al-Sabah',
          role: 'volunteer',
          status: 'online',
          location: {
            latitude: 29.3759 + (Math.random() - 0.5) * 0.1,
            longitude: 47.9774 + (Math.random() - 0.5) * 0.1,
            address: 'Jahra Community Center',
            distance: 4.2
          },
          responseTime: 8,
          rating: 4.5,
          isVerified: true,
          lastSeen: new Date(),
          emergencySkills: ['First Aid', 'CPR', 'Community Response']
        },
        {
          id: '5',
          name: 'Lisa Thompson',
          role: 'guardian',
          status: 'online',
          location: {
            latitude: 29.3759 + (Math.random() - 0.5) * 0.1,
            longitude: 47.9774 + (Math.random() - 0.5) * 0.1,
            address: 'Ahmadi Residential Area',
            distance: 5.8
          },
          responseTime: 12,
          rating: 4.3,
          isVerified: false,
          lastSeen: new Date(),
          emergencySkills: ['Basic First Aid', 'Community Support']
        }
      ];

      // Generate mock emergency alerts
      const mockAlerts: EmergencyAlert[] = [
        {
          id: 'alert1',
          type: 'medical',
          severity: 'critical',
          location: {
            latitude: 29.3759,
            longitude: 47.9774,
            address: 'Kuwait City Center, Block 3'
          },
          timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
          description: 'Cardiac emergency - elderly male, chest pain, conscious but in distress',
          requesterName: 'Ahmad Al-Khaldi',
          respondersNeeded: 2,
          currentResponders: [mockMembers[1]], // Paramedic already responding
          skills_needed: ['CPR', 'Advanced Life Support', 'Emergency Medicine']
        },
        {
          id: 'alert2',
          type: 'accident',
          severity: 'high',
          location: {
            latitude: 29.3328,
            longitude: 48.0263,
            address: 'Gulf Road, near Hawalli Roundabout'
          },
          timestamp: new Date(Date.now() - 12 * 60 * 1000), // 12 minutes ago
          description: 'Vehicle accident, 2 cars involved, minor injuries, first aid needed',
          requesterName: 'Traffic Police Unit 7',
          respondersNeeded: 3,
          currentResponders: [],
          skills_needed: ['First Aid', 'Trauma Care', 'Traffic Management']
        }
      ];

      setCommunityMembers(mockMembers);
      setEmergencyAlerts(mockAlerts);
    };

    initializeCommunity();
  }, []);

  // Join emergency response
  const joinEmergencyResponse = useCallback((alertId: string) => {
    setEmergencyAlerts(prev => prev.map(alert => {
      if (alert.id === alertId) {
        const updatedAlert = {
          ...alert,
          currentResponders: [...alert.currentResponders, {
            id: 'user',
            name: 'You',
            role: 'guardian' as const,
            status: 'emergency' as const,
            location: userLocation ? {
              ...userLocation,
              distance: 0
            } : {
              latitude: 29.3759,
              longitude: 47.9774,
              address: 'Your Location',
              distance: 0
            },
            responseTime: 5,
            rating: 4.0,
            isVerified: true,
            lastSeen: new Date(),
            emergencySkills: ['First Aid', 'CPR']
          }]
        };
        return updatedAlert;
      }
      return alert;
    }));

    toast({
      title: "🚨 Emergency Response Activated",
      description: "You've joined the emergency response team. Navigation started.",
      variant: "destructive"
    });

    onJoinEmergency?.(alertId);
  }, [userLocation, onJoinEmergency, toast]);

  // Toggle rescuer mode
  const toggleRescuerMode = useCallback(() => {
    setIsRescuerMode(prev => {
      const newMode = !prev;
      toast({
        title: newMode ? "🛡️ Rescuer Mode Activated" : "📱 Standard Mode",
        description: newMode 
          ? "You're now available for emergency responses" 
          : "You're no longer available for emergencies",
      });
      return newMode;
    });
  }, [toast]);

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'text-green-400 border-green-500';
      case 'emergency': return 'text-red-400 border-red-500 animate-pulse';
      case 'busy': return 'text-yellow-400 border-yellow-500';
      default: return 'text-gray-400 border-gray-500';
    }
  };

  // Get role badge color
  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'doctor': return 'bg-blue-600';
      case 'paramedic': return 'bg-red-600';
      case 'nurse': return 'bg-green-600';
      case 'volunteer': return 'bg-purple-600';
      default: return 'bg-gray-600';
    }
  };

  // Get severity color
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'border-red-500 bg-red-500/10 text-red-300';
      case 'high': return 'border-orange-500 bg-orange-500/10 text-orange-300';
      case 'medium': return 'border-yellow-500 bg-yellow-500/10 text-yellow-300';
      default: return 'border-green-500 bg-green-500/10 text-green-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Community Status Header */}
      <Card className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 border-blue-500/30">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Radar className={cn(
                  "w-10 h-10",
                  networkStatus === 'connected' ? "text-green-400" : "text-yellow-400"
                )} />
                {networkStatus === 'connected' && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full animate-ping" />
                )}
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Community Rescue Network</h3>
                <p className="text-blue-200">
                  {communityMembers.filter(m => m.status === 'online').length} rescuers online • 
                  {emergencyAlerts.length} active alerts
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Badge 
                variant={networkStatus === 'connected' ? 'default' : 'secondary'}
                className="flex items-center gap-2"
              >
                <Waves className="w-4 h-4" />
                {networkStatus}
              </Badge>
              <Button
                onClick={toggleRescuerMode}
                variant={isRescuerMode ? 'destructive' : 'outline'}
                className={cn(
                  "transition-all duration-300",
                  isRescuerMode && "animate-pulse"
                )}
              >
                <Shield className="w-4 h-4 mr-2" />
                {isRescuerMode ? 'Rescuer ON' : 'Join Network'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="alerts" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="alerts">Emergency Alerts</TabsTrigger>
          <TabsTrigger value="community">Nearby Helpers</TabsTrigger>
          <TabsTrigger value="stats">My Impact</TabsTrigger>
          <TabsTrigger value="network">Network Map</TabsTrigger>
        </TabsList>

        {/* Emergency Alerts */}
        <TabsContent value="alerts" className="space-y-4">
          {emergencyAlerts.length > 0 ? (
            <div className="space-y-4">
              {emergencyAlerts.map((alert) => (
                <Card 
                  key={alert.id}
                  className={cn("border-2", getSeverityColor(alert.severity))}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <AlertTriangle className={cn(
                          "w-6 h-6",
                          alert.severity === 'critical' && "animate-pulse"
                        )} />
                        <div>
                          <CardTitle className="text-lg capitalize">
                            {alert.type} Emergency
                          </CardTitle>
                          <p className="text-sm opacity-80">
                            {alert.location.address} • {Math.floor((Date.now() - alert.timestamp.getTime()) / 60000)} min ago
                          </p>
                        </div>
                      </div>
                      <Badge 
                        variant={alert.severity === 'critical' ? 'destructive' : 'secondary'}
                        className="capitalize animate-pulse"
                      >
                        {alert.severity}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm">{alert.description}</p>
                    
                    {/* Skills Needed */}
                    <div>
                      <p className="text-xs font-medium mb-2">Skills Needed:</p>
                      <div className="flex flex-wrap gap-1">
                        {alert.skills_needed.map((skill, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Current Responders */}
                    <div>
                      <p className="text-xs font-medium mb-2">
                        Responders ({alert.currentResponders.length}/{alert.respondersNeeded}):
                      </p>
                      <div className="flex items-center gap-2">
                        {alert.currentResponders.map((responder, index) => (
                          <div key={index} className="flex items-center gap-1">
                            <Avatar className="w-6 h-6">
                              <AvatarFallback className="text-xs">
                                {responder.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-xs">{responder.name}</span>
                          </div>
                        ))}
                        {alert.currentResponders.length < alert.respondersNeeded && (
                          <div className="text-xs text-muted-foreground">
                            +{alert.respondersNeeded - alert.currentResponders.length} needed
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <Button 
                        onClick={() => joinEmergencyResponse(alert.id)}
                        className="bg-red-600 hover:bg-red-700 flex-1"
                        disabled={alert.currentResponders.some(r => r.id === 'user')}
                      >
                        {alert.currentResponders.some(r => r.id === 'user') ? (
                          <>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Responding
                          </>
                        ) : (
                          <>
                            <Zap className="w-4 h-4 mr-2" />
                            Respond Now
                          </>
                        )}
                      </Button>
                      <Button variant="outline" size="sm">
                        <Navigation className="w-4 h-4 mr-2" />
                        Directions
                      </Button>
                      <Button variant="outline" size="sm">
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Chat
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-400" />
                <h3 className="text-xl font-bold mb-2">All Clear in Your Area</h3>
                <p className="text-muted-foreground">
                  No active emergencies. The community is safe.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Community Members */}
        <TabsContent value="community" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Nearby Helpers ({communityMembers.length})</h3>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Response radius:</span>
              <Badge variant="outline">{responseRadius} km</Badge>
            </div>
          </div>

          <ScrollArea className="h-96">
            <div className="space-y-3">
              {communityMembers.map((member) => (
                <Card key={member.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={member.avatar} />
                          <AvatarFallback>
                            {member.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className={cn(
                          "absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-background",
                          getStatusColor(member.status).split(' ')[0]
                        )} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{member.name}</span>
                          {member.isVerified && (
                            <CheckCircle className="w-4 h-4 text-green-400" />
                          )}
                          <Badge 
                            className={cn("text-xs capitalize", getRoleBadgeColor(member.role))}
                          >
                            {member.role}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="w-3 h-3" />
                          <span>{member.location.distance.toFixed(1)} km away</span>
                          <Timer className="w-3 h-3 ml-2" />
                          <span>{member.responseTime} min ETA</span>
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          <Heart className="w-3 h-3 text-yellow-400" />
                          <span className="text-xs">{member.rating}/5.0</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <MessageCircle className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Video className="w-4 h-4" />
                      </Button>
                      {member.role === 'doctor' && (
                        <Button size="sm" variant="outline">
                          <Stethoscope className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  {/* Skills */}
                  <div className="mt-3">
                    <div className="flex flex-wrap gap-1">
                      {member.emergencySkills.map((skill, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Personal Stats */}
        <TabsContent value="stats" className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <Zap className="w-8 h-8 mx-auto mb-2 text-orange-400" />
                <div className="text-2xl font-bold">{personalStats.emergenciesResponded}</div>
                <div className="text-sm text-muted-foreground">Emergencies</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <Heart className="w-8 h-8 mx-auto mb-2 text-red-400" />
                <div className="text-2xl font-bold">{personalStats.livesImpacted}</div>
                <div className="text-sm text-muted-foreground">Lives Helped</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <Users className="w-8 h-8 mx-auto mb-2 text-blue-400" />
                <div className="text-2xl font-bold">{personalStats.communityRating}</div>
                <div className="text-sm text-muted-foreground">Community Rating</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <Timer className="w-8 h-8 mx-auto mb-2 text-green-400" />
                <div className="text-2xl font-bold">{personalStats.responseTime}</div>
                <div className="text-sm text-muted-foreground">Avg Response (min)</div>
              </CardContent>
            </Card>
          </div>

          {/* Achievement Progress */}
          <Card>
            <CardHeader>
              <CardTitle>Community Achievements</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>First Responder (Respond to 20 emergencies)</span>
                  <span>{personalStats.emergenciesResponded}/20</span>
                </div>
                <Progress value={(personalStats.emergenciesResponded / 20) * 100} />
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Life Saver (Help 15 people)</span>
                  <span>{personalStats.livesImpacted}/15</span>
                </div>
                <Progress value={(personalStats.livesImpacted / 15) * 100} />
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Speed Demon (Sub-3 min response)</span>
                  <span>{personalStats.responseTime < 3 ? '✓' : '✗'}</span>
                </div>
                <Progress value={personalStats.responseTime < 3 ? 100 : (3 - personalStats.responseTime) / 3 * 100} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Network Map */}
        <TabsContent value="network" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Community Network Coverage</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-video bg-gray-900 rounded-lg p-4 relative overflow-hidden">
                {/* Simulated Map */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-green-900/20" />
                
                {/* Network Nodes */}
                {communityMembers.map((member, index) => (
                  <div
                    key={member.id}
                    className={cn(
                      "absolute w-3 h-3 rounded-full border-2 border-white",
                      member.status === 'online' && "bg-green-400 animate-pulse",
                      member.status === 'emergency' && "bg-red-400 animate-ping",
                      member.status === 'busy' && "bg-yellow-400",
                      member.status === 'offline' && "bg-gray-400"
                    )}
                    style={{
                      left: `${20 + (index * 15) % 60}%`,
                      top: `${20 + (index * 12) % 60}%`
                    }}
                  />
                ))}
                
                {/* Emergency Alerts */}
                {emergencyAlerts.map((alert, index) => (
                  <div
                    key={alert.id}
                    className="absolute"
                    style={{
                      left: `${40 + (index * 20) % 40}%`,
                      top: `${30 + (index * 15) % 40}%`
                    }}
                  >
                    <div className="relative">
                      <AlertTriangle className="w-6 h-6 text-red-400 animate-bounce" />
                      <div className="absolute -inset-2 border-2 border-red-400 rounded-full animate-ping" />
                    </div>
                  </div>
                ))}
                
                <div className="absolute bottom-4 left-4 text-white text-sm">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full" />
                      <span>Available</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-red-400 rounded-full" />
                      <span>Emergency</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-400" />
                      <span>Active Alert</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Network Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <Radio className="w-6 h-6 mx-auto mb-2 text-green-400" />
                <div className="font-bold">98.2%</div>
                <div className="text-sm text-muted-foreground">Coverage</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <Users className="w-6 h-6 mx-auto mb-2 text-blue-400" />
                <div className="font-bold">847</div>
                <div className="text-sm text-muted-foreground">Total Members</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <Timer className="w-6 h-6 mx-auto mb-2 text-orange-400" />
                <div className="font-bold">2.8min</div>
                <div className="text-sm text-muted-foreground">Avg Response</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <Shield className="w-6 h-6 mx-auto mb-2 text-purple-400" />
                <div className="font-bold">99.7%</div>
                <div className="text-sm text-muted-foreground">Success Rate</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};