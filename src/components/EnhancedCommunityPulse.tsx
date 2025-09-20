import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { 
  Users, 
  Heart, 
  MapPin, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  Zap,
  Shield,
  TrendingUp,
  Activity,
  Globe,
  UserCheck
} from 'lucide-react';

interface CommunityMember {
  id: string;
  name: string;
  distance: number;
  status: 'available' | 'busy' | 'emergency';
  lastActive: Date;
  helpCount: number;
  rating: number;
  certifications: string[];
  avatar?: string;
}

interface EmergencyEvent {
  id: string;
  type: 'medical' | 'accident' | 'fire' | 'crime' | 'natural';
  location: { lat: number; lng: number; address: string };
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
  responders: number;
  status: 'active' | 'resolved' | 'escalated';
  description: string;
}

interface CommunityStats {
  totalMembers: number;
  activeNow: number;
  responseTime: number;
  successRate: number;
  emergenciesHandled: number;
}

export const EnhancedCommunityPulse = () => {
  const { toast } = useToast();
  const [communityMembers, setCommunityMembers] = useState<CommunityMember[]>([
    {
      id: '1',
      name: 'Dr. Fatima Al-Zahra',
      distance: 0.8,
      status: 'available',
      lastActive: new Date(Date.now() - 5 * 60 * 1000),
      helpCount: 127,
      rating: 4.9,
      certifications: ['First Aid', 'CPR', 'Medical Professional'],
      avatar: '/placeholder.svg'
    },
    {
      id: '2',
      name: 'Ahmed Al-Mansouri',
      distance: 1.2,
      status: 'available',
      lastActive: new Date(Date.now() - 15 * 60 * 1000),
      helpCount: 45,
      rating: 4.7,
      certifications: ['First Aid', 'EMT'],
      avatar: '/placeholder.svg'
    },
    {
      id: '3',
      name: 'Noor Al-Sabah',
      distance: 2.1,
      status: 'busy',
      lastActive: new Date(Date.now() - 30 * 60 * 1000),
      helpCount: 89,
      rating: 4.8,
      certifications: ['First Aid', 'Lifeguard'],
      avatar: '/placeholder.svg'
    }
  ]);

  const [recentEvents, setRecentEvents] = useState<EmergencyEvent[]>([
    {
      id: '1',
      type: 'medical',
      location: { lat: 29.3759, lng: 47.9774, address: 'Kuwait City Center' },
      severity: 'high',
      timestamp: new Date(Date.now() - 10 * 60 * 1000),
      responders: 3,
      status: 'active',
      description: 'Cardiac emergency requiring immediate assistance'
    },
    {
      id: '2',
      type: 'accident',
      location: { lat: 29.3328, lng: 48.0263, address: 'Gulf Road, Salmiya' },
      severity: 'medium',
      timestamp: new Date(Date.now() - 45 * 60 * 1000),
      responders: 2,
      status: 'resolved',
      description: 'Minor traffic accident, first aid provided'
    }
  ]);

  const [communityStats, setCommunityStats] = useState<CommunityStats>({
    totalMembers: 2847,
    activeNow: 156,
    responseTime: 4.2,
    successRate: 94,
    emergenciesHandled: 1023
  });

  const [isVolunteer, setIsVolunteer] = useState(false);
  const [volunteerStatus, setVolunteerStatus] = useState<'available' | 'busy' | 'off-duty'>('off-duty');

  const toggleVolunteerStatus = () => {
    if (!isVolunteer) {
      setIsVolunteer(true);
      setVolunteerStatus('available');
      toast({
        title: "Welcome to Community Response",
        description: "You're now part of Kuwait's emergency response network",
      });
    } else {
      const newStatus = volunteerStatus === 'available' ? 'busy' : 'available';
      setVolunteerStatus(newStatus);
      toast({
        title: `Status Updated`,
        description: `You are now ${newStatus} for emergency response`,
      });
    }
  };

  const requestCommunityHelp = (type: EmergencyEvent['type'], severity: EmergencyEvent['severity']) => {
    const newEvent: EmergencyEvent = {
      id: Date.now().toString(),
      type,
      location: { lat: 29.3759, lng: 47.9774, address: 'Your Location' },
      severity,
      timestamp: new Date(),
      responders: 0,
      status: 'active',
      description: `${type} emergency requiring community assistance`
    };

    setRecentEvents(prev => [newEvent, ...prev.slice(0, 4)]);
    
    // Simulate community response
    setTimeout(() => {
      const availableMembers = communityMembers.filter(m => m.status === 'available');
      const respondingMembers = Math.min(3, availableMembers.length);
      
      setRecentEvents(prev => prev.map(event => 
        event.id === newEvent.id 
          ? { ...event, responders: respondingMembers }
          : event
      ));

      toast({
        title: "Community Activated",
        description: `${respondingMembers} nearby responders are heading to your location`,
      });
    }, 2000);

    toast({
      title: "Community Help Requested",
      description: `Broadcasting ${severity} ${type} alert to nearby community members`,
      variant: severity === 'critical' ? 'destructive' : 'default'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'default';
      case 'busy': return 'secondary';
      case 'emergency': return 'destructive';
      default: return 'outline';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'default';
      default: return 'default';
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'medical': return <Heart className="h-4 w-4" />;
      case 'accident': return <AlertTriangle className="h-4 w-4" />;
      case 'fire': return <Zap className="h-4 w-4" />;
      case 'crime': return <Shield className="h-4 w-4" />;
      case 'natural': return <Globe className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Community Stats */}
      <Card className="gradient-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" />
            Community Response Network
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{communityStats.totalMembers.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Total Members</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-success">{communityStats.activeNow}</div>
              <div className="text-sm text-muted-foreground">Active Now</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{communityStats.responseTime}m</div>
              <div className="text-sm text-muted-foreground">Avg Response</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-success">{communityStats.successRate}%</div>
              <div className="text-sm text-muted-foreground">Success Rate</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Volunteer Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UserCheck className="h-5 w-5" />
              Volunteer Status
            </div>
            <Badge variant={getStatusColor(volunteerStatus)}>
              {isVolunteer ? volunteerStatus : 'Not Active'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Join Kuwait's community emergency response network and help save lives
            </p>
            <Button 
              onClick={toggleVolunteerStatus}
              className="w-full"
              variant={isVolunteer ? 'outline' : 'default'}
            >
              {isVolunteer ? (
                <>
                  <Activity className="h-4 w-4 mr-2" />
                  {volunteerStatus === 'available' ? 'Set Busy' : 'Set Available'}
                </>
              ) : (
                <>
                  <Heart className="h-4 w-4 mr-2" />
                  Become a Community Responder
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Nearby Responders */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Nearby Responders
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {communityMembers.map((member) => (
              <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={member.avatar} />
                    <AvatarFallback>
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{member.name}</span>
                      <Badge variant={getStatusColor(member.status)} className="text-xs">
                        {member.status}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {member.distance}km away • {member.helpCount} helps • ⭐ {member.rating}
                    </div>
                    <div className="flex gap-1 mt-1">
                      {member.certifications.map((cert, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {cert}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Emergency Request Buttons */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Request Community Help
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2">
            <Button 
              onClick={() => requestCommunityHelp('medical', 'critical')}
              variant="destructive"
              className="h-12"
            >
              <Heart className="h-4 w-4 mr-2" />
              Medical Emergency
            </Button>
            <Button 
              onClick={() => requestCommunityHelp('accident', 'high')}
              variant="destructive"
              className="h-12"
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              Accident
            </Button>
            <Button 
              onClick={() => requestCommunityHelp('crime', 'high')}
              variant="secondary"
              className="h-12"
            >
              <Shield className="h-4 w-4 mr-2" />
              Safety Concern
            </Button>
            <Button 
              onClick={() => requestCommunityHelp('fire', 'critical')}
              variant="destructive"
              className="h-12"
            >
              <Zap className="h-4 w-4 mr-2" />
              Fire Emergency
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Community Events */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Recent Community Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentEvents.map((event) => (
              <div key={event.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                    {getEventIcon(event.type)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium capitalize">{event.type} Emergency</span>
                      <Badge variant={getSeverityColor(event.severity)}>
                        {event.severity}
                      </Badge>
                      {event.status === 'resolved' && (
                        <CheckCircle className="h-4 w-4 text-success" />
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <MapPin className="h-3 w-3 inline mr-1" />
                      {event.location.address}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      <Clock className="h-3 w-3 inline mr-1" />
                      {event.timestamp.toLocaleTimeString()} • {event.responders} responders
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};