import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { 
  Users, 
  Share2, 
  Heart, 
  Phone, 
  MessageCircle, 
  Video,
  Link,
  QrCode,
  Stethoscope,
  UserPlus,
  AlertTriangle,
  CheckCircle,
  Copy,
  MapPin
} from 'lucide-react';

interface CareContact {
  id: string;
  name: string;
  type: 'doctor' | 'family' | 'emergency';
  phone: string;
  email?: string;
  specialty?: string;
  relationship?: string;
  isOnline: boolean;
  permissions: string[];
}

interface ShareableLink {
  id: string;
  type: 'health-profile' | 'emergency-info' | 'real-time-location';
  url: string;
  expiresAt: Date;
  permissions: string[];
}

export const ImprovedCareNetwork = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('contacts');
  
  const [careContacts] = useState<CareContact[]>([
    {
      id: '1',
      name: 'Dr. Ahmad Al-Rashid',
      type: 'doctor',
      phone: '+965-2222-1111',
      email: 'dr.ahmad@kuwaitmedical.com',
      specialty: 'Cardiology',
      isOnline: true,
      permissions: ['health_data', 'emergency_alerts', 'appointments']
    },
    {
      id: '2',
      name: 'Sarah (Mother)',
      type: 'family',
      phone: '+965-9999-1234',
      relationship: 'Mother',
      isOnline: true,
      permissions: ['emergency_alerts', 'location_sharing', 'health_updates']
    },
    {
      id: '3',
      name: 'Emergency Contact',
      type: 'emergency',
      phone: '112',
      relationship: 'Emergency Services',
      isOnline: true,
      permissions: ['emergency_alerts', 'location_sharing', 'full_access']
    }
  ]);

  const [shareableLinks, setShareableLinks] = useState<ShareableLink[]>([]);
  const [newContact, setNewContact] = useState({
    name: '',
    phone: '',
    type: 'family' as const,
    relationship: ''
  });

  const generateShareableLink = (type: ShareableLink['type']) => {
    const baseUrl = window.location.origin;
    const linkId = Math.random().toString(36).substring(2, 15);
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // 24 hour expiry

    const newLink: ShareableLink = {
      id: linkId,
      type,
      url: `${baseUrl}/share/${linkId}`,
      expiresAt,
      permissions: type === 'emergency-info' ? ['full_access'] : ['view_only']
    };

    setShareableLinks(prev => [newLink, ...prev]);
    
    toast({
      title: "Shareable Link Created",
      description: `${type.replace('-', ' ')} link generated and copied to clipboard`,
    });

    // Copy to clipboard
    navigator.clipboard.writeText(newLink.url);
    
    return newLink;
  };

  const sendEmergencyAlert = () => {
    const emergencyMessage = `🚨 EMERGENCY ALERT
Location: Kuwait City, Kuwait
Time: ${new Date().toLocaleString()}
Status: Medical Emergency Detected
Live Link: ${window.location.origin}/emergency/live-123

This is an automated alert from LifeLine Guardian.`;

    // Simulate sending to all contacts
    careContacts.forEach((contact, index) => {
      setTimeout(() => {
        toast({
          title: `Alert Sent to ${contact.name}`,
          description: `Emergency notification with live location sent`,
        });
      }, index * 300);
    });

    toast({
      title: "🚨 Emergency Alert Broadcast",
      description: `Alert sent to ${careContacts.length} contacts with live location`,
      variant: "destructive"
    });
  };

  const getContactIcon = (type: string) => {
    switch (type) {
      case 'doctor': return <Stethoscope className="h-4 w-4 text-blue-500" />;
      case 'family': return <Heart className="h-4 w-4 text-red-500" />;
      case 'emergency': return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      default: return <Users className="h-4 w-4" />;
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to Clipboard",
      description: "Link copied successfully",
    });
  };

  return (
    <div className="space-y-6">
      <Card className="gradient-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" />
            Care Network Hub
            <Badge variant="secondary" className="ml-auto">
              <CheckCircle className="h-3 w-3 mr-1" />
              Connected
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="contacts">Contacts</TabsTrigger>
              <TabsTrigger value="sharing">Share Links</TabsTrigger>
              <TabsTrigger value="emergency">Emergency</TabsTrigger>
            </TabsList>

            <TabsContent value="contacts" className="space-y-4">
              <div className="grid gap-3">
                {careContacts.map((contact) => (
                  <Card key={contact.id} className="hover:shadow-md transition-all">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="text-xs">
                              {contact.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium text-sm">{contact.name}</h3>
                              {contact.isOnline && (
                                <div className="h-2 w-2 bg-green-500 rounded-full" />
                              )}
                            </div>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              {getContactIcon(contact.type)}
                              <span>{contact.specialty || contact.relationship || contact.type}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                            <Phone className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                            <MessageCircle className="h-3 w-3" />
                          </Button>
                          {contact.type === 'doctor' && (
                            <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                              <Video className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Button className="w-full" variant="outline">
                <UserPlus className="h-4 w-4 mr-2" />
                Add New Contact
              </Button>
            </TabsContent>

            <TabsContent value="sharing" className="space-y-4">
              <div className="grid grid-cols-1 gap-3">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Health Profile</h3>
                        <p className="text-sm text-muted-foreground">Share medical info with doctors</p>
                      </div>
                      <Button 
                        size="sm" 
                        onClick={() => generateShareableLink('health-profile')}
                      >
                        <Share2 className="h-4 w-4 mr-1" />
                        Generate
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Emergency Info</h3>
                        <p className="text-sm text-muted-foreground">Share with family & first responders</p>
                      </div>
                      <Button 
                        size="sm" 
                        onClick={() => generateShareableLink('emergency-info')}
                      >
                        <QrCode className="h-4 w-4 mr-1" />
                        Generate
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Live Location</h3>
                        <p className="text-sm text-muted-foreground">Real-time location tracking</p>
                      </div>
                      <Button 
                        size="sm" 
                        onClick={() => generateShareableLink('real-time-location')}
                      >
                        <MapPin className="h-4 w-4 mr-1" />
                        Generate
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {shareableLinks.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-medium">Generated Links</h4>
                  {shareableLinks.slice(0, 3).map((link) => (
                    <Card key={link.id}>
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm capitalize">
                              {link.type.replace('-', ' ')}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {link.url}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Expires: {link.expiresAt.toLocaleString()}
                            </p>
                          </div>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => copyToClipboard(link.url)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="emergency" className="space-y-4">
              <Card className="border-destructive">
                <CardContent className="p-4">
                  <div className="text-center space-y-3">
                    <AlertTriangle className="h-12 w-12 text-destructive mx-auto" />
                    <h3 className="font-bold text-lg">Emergency Broadcast</h3>
                    <p className="text-sm text-muted-foreground">
                      Instantly alert all contacts with your location and health status
                    </p>
                    <Button 
                      onClick={sendEmergencyAlert}
                      variant="destructive" 
                      size="lg"
                      className="w-full"
                    >
                      <AlertTriangle className="h-5 w-5 mr-2" />
                      Send Emergency Alert
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Emergency Features</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                    <MapPin className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium text-sm">Live Location Sharing</p>
                      <p className="text-xs text-muted-foreground">Real-time GPS tracking</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                    <Heart className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium text-sm">Vital Signs Broadcast</p>
                      <p className="text-xs text-muted-foreground">Heart rate, temperature, etc.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                    <Phone className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium text-sm">Auto-Call Emergency</p>
                      <p className="text-xs text-muted-foreground">Calls 112 automatically</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};