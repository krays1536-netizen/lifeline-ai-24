import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { 
  UserPlus, 
  Heart, 
  Stethoscope, 
  Users, 
  Phone, 
  MessageCircle, 
  Share2, 
  MapPin,
  Clock,
  CheckCircle,
  AlertCircle,
  Video
} from 'lucide-react';

interface CareContact {
  id: string;
  name: string;
  type: 'doctor' | 'family' | 'friend' | 'caregiver';
  phone: string;
  email?: string;
  specialty?: string;
  relationship?: string;
  lastContact: Date;
  isOnline: boolean;
  avatar?: string;
  permissions: string[];
}

interface EmergencyAlert {
  id: string;
  type: 'medical' | 'fall' | 'panic' | 'check-in';
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
  status: 'sent' | 'delivered' | 'read' | 'responded';
  recipients: string[];
}

export const CareNetworkHub = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('network');
  const [careContacts, setCareContacts] = useState<CareContact[]>([
    {
      id: '1',
      name: 'Dr. Ahmad Al-Rashid',
      type: 'doctor',
      phone: '+965-2222-1111',
      email: 'dr.ahmad@kuwaitmedical.com',
      specialty: 'Cardiology',
      lastContact: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      isOnline: true,
      permissions: ['health_data', 'emergency_alerts', 'appointments'],
      avatar: '/placeholder.svg'
    },
    {
      id: '2',
      name: 'Sarah (Mother)',
      type: 'family',
      phone: '+965-9999-1234',
      relationship: 'Mother',
      lastContact: new Date(Date.now() - 5 * 60 * 60 * 1000),
      isOnline: true,
      permissions: ['emergency_alerts', 'location_sharing', 'health_updates'],
      avatar: '/placeholder.svg'
    },
    {
      id: '3',
      name: 'Omar (Brother)',
      type: 'family',
      phone: '+965-9888-5678',
      relationship: 'Brother',
      lastContact: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      isOnline: false,
      permissions: ['emergency_alerts', 'location_sharing'],
      avatar: '/placeholder.svg'
    }
  ]);

  const [emergencyAlerts, setEmergencyAlerts] = useState<EmergencyAlert[]>([
    {
      id: '1',
      type: 'fall',
      severity: 'high',
      timestamp: new Date(Date.now() - 10 * 60 * 1000),
      status: 'responded',
      recipients: ['1', '2']
    },
    {
      id: '2',
      type: 'check-in',
      severity: 'low',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      status: 'read',
      recipients: ['2', '3']
    }
  ]);

  const [newContact, setNewContact] = useState({
    name: '',
    phone: '',
    type: 'family' as const,
    relationship: ''
  });

  const addCareContact = () => {
    if (!newContact.name || !newContact.phone) {
      toast({
        title: "Required Fields",
        description: "Please fill in name and phone number",
        variant: "destructive"
      });
      return;
    }

    const contact: CareContact = {
      id: Date.now().toString(),
      name: newContact.name,
      type: newContact.type,
      phone: newContact.phone,
      relationship: newContact.relationship,
      lastContact: new Date(),
      isOnline: false,
      permissions: ['emergency_alerts']
    };

    setCareContacts(prev => [contact, ...prev]);
    setNewContact({ name: '', phone: '', type: 'family', relationship: '' });
    
    toast({
      title: "Contact Added",
      description: `${newContact.name} has been added to your care network`,
    });
  };

  const sendEmergencyAlert = (type: EmergencyAlert['type'], severity: EmergencyAlert['severity']) => {
    const alert: EmergencyAlert = {
      id: Date.now().toString(),
      type,
      severity,
      timestamp: new Date(),
      status: 'sent',
      recipients: careContacts.map(c => c.id)
    };

    setEmergencyAlerts(prev => [alert, ...prev]);
    
    // Simulate sending to contacts
    careContacts.forEach((contact, index) => {
      setTimeout(() => {
        toast({
          title: `Alert Sent to ${contact.name}`,
          description: `${type.toUpperCase()} alert delivered via SMS and app notification`,
        });
      }, index * 500);
    });

    toast({
      title: "Emergency Alert Sent",
      description: `${severity.toUpperCase()} ${type} alert sent to ${careContacts.length} contacts`,
      variant: severity === 'critical' ? 'destructive' : 'default'
    });
  };

  const getContactIcon = (type: string) => {
    switch (type) {
      case 'doctor': return <Stethoscope className="h-4 w-4" />;
      case 'family': return <Heart className="h-4 w-4" />;
      case 'friend': return <Users className="h-4 w-4" />;
      case 'caregiver': return <UserPlus className="h-4 w-4" />;
      default: return <Users className="h-4 w-4" />;
    }
  };

  const getAlertColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'default';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'responded': return <CheckCircle className="h-4 w-4 text-success" />;
      case 'read': return <CheckCircle className="h-4 w-4 text-primary" />;
      case 'delivered': return <CheckCircle className="h-4 w-4 text-muted-foreground" />;
      case 'sent': return <Clock className="h-4 w-4 text-muted-foreground" />;
      default: return <AlertCircle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card className="gradient-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" />
            Care Network Hub
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="network">Network</TabsTrigger>
              <TabsTrigger value="alerts">Alerts</TabsTrigger>
              <TabsTrigger value="add">Add Contact</TabsTrigger>
            </TabsList>

            <TabsContent value="network" className="space-y-4">
              <div className="grid gap-4">
                {careContacts.map((contact) => (
                  <Card key={contact.id} className="transition-all hover:shadow-md">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={contact.avatar} />
                            <AvatarFallback>
                              {contact.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium">{contact.name}</h3>
                              {contact.isOnline && (
                                <div className="h-2 w-2 bg-success rounded-full" />
                              )}
                            </div>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              {getContactIcon(contact.type)}
                              <span>{contact.specialty || contact.relationship || contact.type}</span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Last contact: {contact.lastContact.toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Phone className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <MessageCircle className="h-4 w-4" />
                          </Button>
                          {contact.type === 'doctor' && (
                            <Button size="sm" variant="outline">
                              <Video className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-1">
                        {contact.permissions.map((permission) => (
                          <Badge key={permission} variant="secondary" className="text-xs">
                            {permission.replace('_', ' ')}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Button 
                  onClick={() => sendEmergencyAlert('panic', 'critical')}
                  variant="destructive"
                  className="h-12"
                >
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Emergency SOS
                </Button>
                <Button 
                  onClick={() => sendEmergencyAlert('check-in', 'low')}
                  variant="outline"
                  className="h-12"
                >
                  <Heart className="h-4 w-4 mr-2" />
                  Send Check-in
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="alerts" className="space-y-4">
              <div className="space-y-3">
                {emergencyAlerts.map((alert) => (
                  <Card key={alert.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Badge variant={getAlertColor(alert.severity)}>
                            {alert.type}
                          </Badge>
                          <div>
                            <p className="font-medium capitalize">
                              {alert.type.replace('-', ' ')} Alert
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {alert.timestamp.toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(alert.status)}
                          <span className="text-sm capitalize">{alert.status}</span>
                        </div>
                      </div>
                      <div className="mt-2 text-sm text-muted-foreground">
                        Sent to {alert.recipients.length} contacts
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="add" className="space-y-4">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={newContact.name}
                      onChange={(e) => setNewContact(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Full name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={newContact.phone}
                      onChange={(e) => setNewContact(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="+965-XXXX-XXXX"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="type">Type</Label>
                    <select
                      id="type"
                      value={newContact.type}
                      onChange={(e) => setNewContact(prev => ({ ...prev, type: e.target.value as any }))}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="family">Family</option>
                      <option value="doctor">Doctor</option>
                      <option value="friend">Friend</option>
                      <option value="caregiver">Caregiver</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="relationship">Relationship/Specialty</Label>
                    <Input
                      id="relationship"
                      value={newContact.relationship}
                      onChange={(e) => setNewContact(prev => ({ ...prev, relationship: e.target.value }))}
                      placeholder="e.g., Mother, Cardiologist"
                    />
                  </div>
                </div>

                <Button onClick={addCareContact} className="w-full">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add to Care Network
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};