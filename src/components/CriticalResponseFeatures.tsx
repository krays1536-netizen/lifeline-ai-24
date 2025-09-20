import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { 
  Shield, 
  Heart, 
  Zap, 
  Users, 
  Phone,
  MapPin,
  Clock,
  AlertTriangle,
  CheckCircle,
  Radio,
  Ambulance,
  Activity
} from 'lucide-react';

interface EmergencyProtocol {
  id: string;
  name: string;
  description: string;
  priority: 'critical' | 'high' | 'medium';
  estimatedTime: string;
  icon: React.ReactNode;
  isActive: boolean;
}

interface ResponseTeam {
  id: string;
  type: 'ems' | 'fire' | 'police' | 'medical';
  name: string;
  eta: number;
  distance: number;
  status: 'dispatched' | 'enroute' | 'arrived';
}

interface CriticalResponseFeaturesProps {
  onEmergencyTrigger?: (type: string) => void;
  userLocation?: {
    latitude: number;
    longitude: number;
    accuracy: number;
    city: string;
    address: string;
  } | null;
  riskScore?: number;
}

export const CriticalResponseFeatures = ({ 
  onEmergencyTrigger,
  userLocation,
  riskScore = 0 
}: CriticalResponseFeaturesProps) => {
  const { toast } = useToast();
  
  const [emergencyMode, setEmergencyMode] = useState(false);
  const [responseTime, setResponseTime] = useState(0);
  const [activeProtocols, setActiveProtocols] = useState<string[]>([]);
  const [responseTeams] = useState<ResponseTeam[]>([
    {
      id: '1',
      type: 'ems',
      name: 'Kuwait EMS Unit 7',
      eta: 4,
      distance: 2.1,
      status: 'dispatched'
    },
    {
      id: '2',
      type: 'medical',
      name: 'Al-Sabah Hospital',
      eta: 6,
      distance: 3.2,
      status: 'enroute'
    },
    {
      id: '3',
      type: 'fire',
      name: 'Fire Station 12',
      eta: 8,
      distance: 4.5,
      status: 'dispatched'
    }
  ]);

  const emergencyProtocols: EmergencyProtocol[] = [
    {
      id: 'cpr',
      name: 'Quantum CPR Protocol',
      description: 'AI-guided cardiac arrest response with AR overlay',
      priority: 'critical',
      estimatedTime: 'Real-time AI guidance',
      icon: <Heart className="h-5 w-5" />,
      isActive: activeProtocols.includes('cpr')
    },
    {
      id: 'trauma',
      name: 'Smart Trauma Response',
      description: 'AI-powered bleeding control & stabilization',
      priority: 'critical',
      estimatedTime: 'Instant AI analysis',
      icon: <Zap className="h-5 w-5" />,
      isActive: activeProtocols.includes('trauma')
    },
    {
      id: 'medical',
      name: 'Neural Medical Emergency',
      description: 'AI vital monitoring & predictive assessment',
      priority: 'high',
      estimatedTime: 'Continuous AI monitoring',
      icon: <Activity className="h-5 w-5" />,
      isActive: activeProtocols.includes('medical')
    },
    {
      id: 'evacuation',
      name: 'AI Emergency Evacuation',
      description: 'Smart extraction & transport coordination',
      priority: 'high',
      estimatedTime: 'AI-optimized routes',
      icon: <Users className="h-5 w-5" />,
      isActive: activeProtocols.includes('evacuation')
    }
  ];

  // Emergency timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (emergencyMode) {
      interval = setInterval(() => {
        setResponseTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [emergencyMode]);

  const activateEmergencyMode = () => {
    setEmergencyMode(true);
    setResponseTime(0);
    setActiveProtocols(['cpr', 'trauma']);
    
    // Trigger parent emergency handler
    onEmergencyTrigger?.('Critical Response System');
    
    toast({
      title: "🚨 CRITICAL RESPONSE ACTIVATED",
      description: "All emergency protocols are now active",
      variant: "destructive"
    });
  };

  const toggleProtocol = (protocolId: string) => {
    setActiveProtocols(prev => 
      prev.includes(protocolId) 
        ? prev.filter(id => id !== protocolId)
        : [...prev, protocolId]
    );
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'destructive';
      case 'high': return 'secondary';
      case 'medium': return 'default';
      default: return 'outline';
    }
  };

  const getTeamIcon = (type: string) => {
    switch (type) {
      case 'ems': return <Ambulance className="h-4 w-4" />;
      case 'medical': return <Heart className="h-4 w-4" />;
      case 'fire': return <Zap className="h-4 w-4" />;
      case 'police': return <Shield className="h-4 w-4" />;
      default: return <Users className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'dispatched': return 'text-yellow-500';
      case 'enroute': return 'text-blue-500';
      case 'arrived': return 'text-green-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Emergency Response Header */}
      <Card className={`gradient-border ${emergencyMode ? 'border-red-500 bg-red-50/50' : ''}`}>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${emergencyMode ? 'bg-red-500' : 'bg-primary'}`}>
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="font-bold">Emergency Response System</div>
                <div className="text-sm text-muted-foreground">
                  {emergencyMode ? 'AI COORDINATOR ACTIVE' : 'Smart Standby Mode'}
                </div>
              </div>
            </div>
            {emergencyMode && (
              <Badge variant="destructive" className="text-lg px-3 py-1">
                <Clock className="h-4 w-4 mr-1" />
                {formatTime(responseTime)}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!emergencyMode ? (
            <Button
              onClick={activateEmergencyMode}
              className="w-full h-16 text-lg font-bold bg-red-600 hover:bg-red-700"
            >
              <AlertTriangle className="h-6 w-6 mr-2" />
              ACTIVATE AI EMERGENCY COORDINATOR
            </Button>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-red-100 rounded-lg border border-red-200">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                  <span className="font-semibold text-red-700">Emergency protocols active</span>
                </div>
                <Button variant="outline" size="sm">
                  <Phone className="h-4 w-4 mr-1" />
                  Call 112
                </Button>
              </div>
              
              <div className="grid grid-cols-3 gap-3 text-center">
                 <div className="p-3 bg-background rounded-lg">
                   <div className="text-2xl font-bold text-primary">{activeProtocols.length}</div>
                   <div className="text-xs text-muted-foreground">AI Protocols</div>
                 </div>
                 <div className="p-3 bg-background rounded-lg">
                   <div className="text-2xl font-bold text-blue-500">{responseTeams.length}</div>
                   <div className="text-xs text-muted-foreground">Smart Teams</div>
                 </div>
                 <div className="p-3 bg-background rounded-lg">
                   <div className="text-2xl font-bold text-green-500">4</div>
                   <div className="text-xs text-muted-foreground">Min AI ETA</div>
                 </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Emergency Protocols */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Quantum Medical Protocols
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {emergencyProtocols.map((protocol) => (
              <Card key={protocol.id} className={`cursor-pointer transition-colors ${
                protocol.isActive ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
              }`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        protocol.isActive ? 'bg-primary text-primary-foreground' : 'bg-muted'
                      }`}>
                        {protocol.icon}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">{protocol.name}</h4>
                          <Badge variant={getPriorityColor(protocol.priority)}>
                            {protocol.priority}
                          </Badge>
                          {protocol.isActive && (
                            <Badge variant="default" className="bg-green-500">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Active
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{protocol.description}</p>
                        <p className="text-xs text-muted-foreground mt-1">{protocol.estimatedTime}</p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant={protocol.isActive ? "default" : "outline"}
                      onClick={() => toggleProtocol(protocol.id)}
                    >
                      {protocol.isActive ? "Active" : "Activate"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Response Teams */}
      {emergencyMode && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Radio className="h-5 w-5" />
              Response Teams
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {responseTeams.map((team) => (
                <div key={team.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-background rounded-lg">
                      {getTeamIcon(team.type)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{team.name}</h4>
                        <Badge variant="outline" className={getStatusColor(team.status)}>
                          {team.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          ETA: {team.eta} min
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {team.distance} km away
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{team.eta} min</div>
                    <Progress value={(10 - team.eta) * 10} className="w-16 h-2" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Critical Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            <Button variant="destructive" className="h-16 flex-col gap-1">
              <Phone className="h-5 w-5" />
              <span className="text-sm">Call 112</span>
            </Button>
            <Button variant="outline" className="h-16 flex-col gap-1">
              <MapPin className="h-5 w-5" />
              <span className="text-sm">Share Location</span>
            </Button>
            <Button variant="outline" className="h-16 flex-col gap-1">
              <Users className="h-5 w-5" />
              <span className="text-sm">Alert Family</span>
            </Button>
            <Button variant="outline" className="h-16 flex-col gap-1">
              <Radio className="h-5 w-5" />
              <span className="text-sm">Emergency Radio</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};