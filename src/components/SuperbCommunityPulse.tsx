import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { 
  Users, 
  MapPin, 
  Heart, 
  Shield, 
  AlertTriangle,
  Clock,
  Star,
  Zap,
  Activity,
  CheckCircle,
  Radio,
  Wifi
} from 'lucide-react';

interface CommunityHelper {
  id: string;
  name: string;
  type: 'medical' | 'first-aid' | 'citizen';
  distance: number;
  rating: number;
  responseTime: number;
  isAvailable: boolean;
  specialty?: string;
  lastActive: Date;
}

interface EmergencyEvent {
  id: string;
  type: 'medical' | 'accident' | 'fire' | 'crime';
  location: string;
  distance: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  respondersCount: number;
  timestamp: Date;
  status: 'active' | 'resolved' | 'escalated';
}

interface CommunityStats {
  totalHelpers: number;
  activeHelpers: number;
  avgResponseTime: number;
  emergenciesThisWeek: number;
  successRate: number;
}

export const SuperbCommunityPulse = () => {
  const { toast } = useToast();
  const [userStatus, setUserStatus] = useState<'available' | 'busy' | 'offline'>('offline');
  const [communityStats] = useState<CommunityStats>({
    totalHelpers: 847,
    activeHelpers: 234,
    avgResponseTime: 3.2,
    emergenciesThisWeek: 12,
    successRate: 94.7
  });

  const [nearbyHelpers] = useState<CommunityHelper[]>([
    {
      id: '1',
      name: 'Dr. Fatima Al-Zahra',
      type: 'medical',
      distance: 0.8,
      rating: 4.9,
      responseTime: 2.1,
      isAvailable: true,
      specialty: 'Emergency Medicine',
      lastActive: new Date(Date.now() - 5 * 60 * 1000)
    },
    {
      id: '2',
      name: 'Ahmad (Paramedic)',
      type: 'first-aid',
      distance: 1.2,
      rating: 4.8,
      responseTime: 1.8,
      isAvailable: true,
      specialty: 'Advanced Life Support',
      lastActive: new Date(Date.now() - 2 * 60 * 1000)
    },
    {
      id: '3',
      name: 'Sara Al-Mutairi',
      type: 'first-aid',
      distance: 0.5,
      rating: 4.7,
      responseTime: 1.5,
      isAvailable: true,
      specialty: 'CPR Certified',
      lastActive: new Date(Date.now() - 1 * 60 * 1000)
    },
    {
      id: '4',
      name: 'Omar (Guardian)',
      type: 'citizen',
      distance: 2.1,
      rating: 4.6,
      responseTime: 3.2,
      isAvailable: false,
      lastActive: new Date(Date.now() - 15 * 60 * 1000)
    }
  ]);

  const [recentEvents] = useState<EmergencyEvent[]>([
    {
      id: '1',
      type: 'medical',
      location: 'Salmiya Marina',
      distance: 2.3,
      severity: 'high',
      respondersCount: 3,
      timestamp: new Date(Date.now() - 10 * 60 * 1000),
      status: 'active'
    },
    {
      id: '2',
      type: 'accident',
      location: 'Kuwait City Center',
      distance: 5.1,
      severity: 'medium',
      respondersCount: 2,
      timestamp: new Date(Date.now() - 25 * 60 * 1000),
      status: 'resolved'
    },
    {
      id: '3',
      type: 'medical',
      location: 'Hawalli Hospital Area',
      distance: 3.8,
      severity: 'critical',
      respondersCount: 5,
      timestamp: new Date(Date.now() - 45 * 60 * 1000),
      status: 'escalated'
    }
  ]);

  const toggleStatus = () => {
    const newStatus = userStatus === 'available' ? 'offline' : 'available';
    setUserStatus(newStatus);
    
    toast({
      title: newStatus === 'available' ? "🟢 You're Now Available" : "⚫ You're Now Offline",
      description: newStatus === 'available' 
        ? "You'll receive emergency alerts in your area" 
        : "You won't receive emergency notifications",
    });
  };

  const joinEmergencyResponse = (eventId: string) => {
    toast({
      title: "🚀 Joining Emergency Response",
      description: "Your location has been shared with incident command",
      variant: "default"
    });
  };

  const getHelperIcon = (type: string) => {
    switch (type) {
      case 'medical': return <Heart className="h-4 w-4 text-red-500" />;
      case 'first-aid': return <Shield className="h-4 w-4 text-blue-500" />;
      case 'citizen': return <Users className="h-4 w-4 text-green-500" />;
      default: return <Users className="h-4 w-4" />;
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'medical': return <Heart className="h-4 w-4 text-red-500" />;
      case 'accident': return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'fire': return <Zap className="h-4 w-4 text-red-600" />;
      case 'crime': return <Shield className="h-4 w-4 text-purple-500" />;
      default: return <Activity className="h-4 w-4" />;
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'destructive';
      case 'resolved': return 'default';
      case 'escalated': return 'secondary';
      default: return 'default';
    }
  };

  return (
    <div className="space-y-6">
      {/* Community Status Card */}
      <Card className="gradient-border">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Radio className="h-6 w-6 text-primary" />
              Community Pulse
            </div>
            <Button 
              size="sm" 
              variant={userStatus === 'available' ? "default" : "outline"}
              onClick={toggleStatus}
              className="flex items-center gap-2"
            >
              <div className={`h-2 w-2 rounded-full ${
                userStatus === 'available' ? 'bg-green-500' : 'bg-gray-400'
              }`} />
              {userStatus === 'available' ? 'Available' : 'Offline'}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{communityStats.activeHelpers}</div>
              <div className="text-xs text-muted-foreground">Active Helpers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500">{communityStats.avgResponseTime}min</div>
              <div className="text-xs text-muted-foreground">Avg Response</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-500">{communityStats.emergenciesThisWeek}</div>
              <div className="text-xs text-muted-foreground">This Week</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-500">{communityStats.successRate}%</div>
              <div className="text-xs text-muted-foreground">Success Rate</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Nearby Helpers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Users className="h-5 w-5" />
            Nearby Helpers
            <Badge variant="secondary">{nearbyHelpers.filter(h => h.isAvailable).length} Available</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {nearbyHelpers.slice(0, 4).map((helper) => (
              <div key={helper.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="text-xs">
                      {helper.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-sm">{helper.name}</h4>
                      {helper.isAvailable && (
                        <div className="h-2 w-2 bg-green-500 rounded-full" />
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      {getHelperIcon(helper.type)}
                      <span>{helper.specialty || helper.type}</span>
                      <span>•</span>
                      <MapPin className="h-3 w-3" />
                      <span>{helper.distance}km away</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <Star className="h-3 w-3 text-yellow-500" />
                      <span>{helper.rating}</span>
                      <span>•</span>
                      <Clock className="h-3 w-3" />
                      <span>{helper.responseTime}min avg</span>
                    </div>
                  </div>
                </div>
                <Badge variant={helper.isAvailable ? "default" : "outline"}>
                  {helper.isAvailable ? "Available" : "Busy"}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Emergency Events */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Activity className="h-5 w-5" />
            Recent Emergency Events
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentEvents.map((event) => (
              <Card key={event.id} className="border-l-4 border-l-primary">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getEventIcon(event.type)}
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-sm capitalize">{event.type} Emergency</h4>
                          <Badge variant={getSeverityColor(event.severity)}>
                            {event.severity}
                          </Badge>
                          <Badge variant={getStatusColor(event.status)}>
                            {event.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                          <MapPin className="h-3 w-3" />
                          <span>{event.location}</span>
                          <span>•</span>
                          <span>{event.distance}km away</span>
                          <span>•</span>
                          <Clock className="h-3 w-3" />
                          <span>{Math.round((Date.now() - event.timestamp.getTime()) / 60000)}min ago</span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {event.respondersCount} responders on scene
                        </div>
                      </div>
                    </div>
                    {event.status === 'active' && userStatus === 'available' && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => joinEmergencyResponse(event.id)}
                      >
                        Join Response
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Doctor Status Sharing */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Share with Healthcare Providers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-red-500" />
                  <span className="font-medium">LifeLine AI Status</span>
                </div>
                <Badge variant="default">Real-time</Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Share your real-time health status, location, and emergency alerts with your healthcare team
              </p>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm" className="bg-green-50 border-green-200 hover:bg-green-100">
                  <Users className="h-4 w-4 mr-1 text-green-600" />
                  ✓ Add Doctor
                </Button>
                <Button variant="outline" size="sm" className="bg-blue-50 border-blue-200 hover:bg-blue-100">
                  <MapPin className="h-4 w-4 mr-1 text-blue-600" />
                  ✓ Share Location
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="text-sm font-medium">Connected Healthcare Providers</div>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 bg-background rounded border">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span className="text-sm">Dr. Sarah Al-Rashid</span>
                  </div>
                  <Badge variant="outline" className="text-xs">Active</Badge>
                </div>
                <div className="flex items-center justify-between p-2 bg-background rounded border">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span className="text-sm">Kuwait Hospital</span>
                  </div>
                  <Badge variant="outline" className="text-xs">Monitoring</Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      {userStatus === 'available' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="h-16 flex-col gap-1">
                <Heart className="h-5 w-5" />
                <span className="text-xs">Medical Alert</span>
              </Button>
              <Button variant="outline" className="h-16 flex-col gap-1">
                <AlertTriangle className="h-5 w-5" />
                <span className="text-xs">Report Incident</span>
              </Button>
              <Button variant="outline" className="h-16 flex-col gap-1">
                <MapPin className="h-5 w-5" />
                <span className="text-xs">Share Location</span>
              </Button>
              <Button variant="outline" className="h-16 flex-col gap-1">
                <Radio className="h-5 w-5" />
                <span className="text-xs">Emergency Radio</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};