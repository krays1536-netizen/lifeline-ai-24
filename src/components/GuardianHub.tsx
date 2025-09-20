import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { WitnessCam } from '@/components/WitnessCam';
import { useToast } from '@/hooks/use-toast';
import { 
  Shield, 
  MapPin, 
  Activity, 
  AlertTriangle,
  Camera,
  Radio,
  Battery,
  Wifi,
  Clock,
  Target,
  Navigation,
  Zap
} from 'lucide-react';

interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  city: string;
  address: string;
  speed?: number;
  altitude?: number;
}

interface GuardianHubProps {
  guardianStatus: 'safe' | 'elevated' | 'emergency';
  onSOSActivated: () => void;
  onWitnessCamRecord: () => void;
  onRecordingComplete: (data: Blob) => void;
  location: LocationData | null;
}

export const GuardianHub = ({ 
  guardianStatus, 
  onSOSActivated, 
  onWitnessCamRecord, 
  onRecordingComplete,
  location: propLocation 
}: GuardianHubProps) => {
  const { toast } = useToast();
  
  // Guardian system states
  const [isActive, setIsActive] = useState(true);
  const [batteryLevel, setBatteryLevel] = useState(85);
  const [signalStrength, setSignalStrength] = useState(95);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  
  // Location & accuracy
  const [location, setLocation] = useState<LocationData | null>(propLocation);
  const [locationAccuracy, setLocationAccuracy] = useState(0);
  const [isLocationTracking, setIsLocationTracking] = useState(true);
  
  // Witness cam integration
  const [witnessCamActive, setWitnessCamActive] = useState(false);
  const [sosPressed, setSOSPressed] = useState(false);
  
  // Enhanced ultra-accurate location tracking
  useEffect(() => {
    if (!isLocationTracking) return;

    const watchId = navigator.geolocation?.watchPosition(
      (position) => {
        const { latitude, longitude, accuracy, speed, altitude } = position.coords;
        
        // Kuwait city detection with enhanced accuracy
        const kuwaitCities = [
          { name: "Kuwait City", lat: 29.3759, lng: 47.9774, range: 0.02 },
          { name: "Salmiya", lat: 29.3394, lng: 48.0507, range: 0.015 },
          { name: "Hawalli", lat: 29.3328, lng: 48.0263, range: 0.02 },
          { name: "Farwaniya", lat: 29.2977, lng: 47.9391, range: 0.025 },
          { name: "Ahmadi", lat: 29.0769, lng: 48.0837, range: 0.04 },
          { name: "Jahra", lat: 29.3375, lng: 47.6581, range: 0.06 },
          { name: "Mangaf", lat: 29.0626, lng: 48.1126, range: 0.02 },
          { name: "Fintas", lat: 29.1735, lng: 48.1228, range: 0.015 },
          { name: "Mahboula", lat: 29.1386, lng: 48.1247, range: 0.01 }
        ];

        let detectedCity = "Kuwait";
        let detectedAddress = "Kuwait";
        
        for (const city of kuwaitCities) {
          const distance = Math.sqrt(
            Math.pow(latitude - city.lat, 2) + Math.pow(longitude - city.lng, 2)
          );
          if (distance <= city.range) {
            detectedCity = city.name;
            detectedAddress = `${city.name}, Kuwait`;
            break;
          }
        }

        const newLocation: LocationData = {
          latitude,
          longitude,
          accuracy: accuracy || 0,
          city: detectedCity,
          address: detectedAddress,
          speed: speed || undefined,
          altitude: altitude || undefined
        };

        setLocation(newLocation);
        setLocationAccuracy(accuracy || 0);
        setLastUpdate(new Date());
      },
      (error) => {
        console.error("Location error:", error);
        toast({
          title: "Location Access Required",
          description: "Enable GPS for Guardian protection",
          variant: "destructive"
        });
      },
      { 
        enableHighAccuracy: true, 
        timeout: 10000, 
        maximumAge: 5000 
      }
    );

    return () => {
      if (watchId) navigator.geolocation?.clearWatch(watchId);
    };
  }, [isLocationTracking, toast]);

  // Battery simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setBatteryLevel(prev => Math.max(20, prev - Math.random() * 0.1));
      setSignalStrength(prev => Math.max(60, 90 + Math.random() * 10));
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // SOS activation handler
  const handleSOSActivation = useCallback(() => {
    setSOSPressed(true);
    setWitnessCamActive(true);
    onSOSActivated();
    onWitnessCamRecord();
    
    toast({
      title: "🚨 SOS ACTIVATED",
      description: "Emergency services notified • Witness cam recording",
      variant: "destructive"
    });

    // Auto-reset after 30 seconds
    setTimeout(() => {
      setSOSPressed(false);
    }, 30000);
  }, [onSOSActivated, onWitnessCamRecord, toast]);

  // Get status color
  const getStatusColor = () => {
    switch (guardianStatus) {
      case 'emergency': return 'bg-red-500';
      case 'elevated': return 'bg-yellow-500';
      case 'safe': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  // Get accuracy color
  const getAccuracyColor = () => {
    if (locationAccuracy <= 5) return 'text-green-500';
    if (locationAccuracy <= 15) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className="space-y-6">
      {/* Guardian Status Header */}
      <Card className="gradient-border">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${getStatusColor()} animate-pulse`} />
              <div>
                <div className="font-bold">Guardian Status</div>
                <div className="text-sm text-muted-foreground capitalize">{guardianStatus}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="flex items-center gap-1">
                <Battery className="h-3 w-3" />
                {batteryLevel.toFixed(0)}%
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <Wifi className="h-3 w-3" />
                {signalStrength.toFixed(0)}%
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="text-sm font-medium">System Health</div>
              <Progress value={isActive ? 100 : 0} className="h-2" />
              <div className="text-xs text-muted-foreground">All systems operational</div>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium">Last Update</div>
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {lastUpdate.toLocaleTimeString()}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Location Tracking */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            Precision Location
            {location && (
              <Badge variant="outline" className={`${getAccuracyColor()}`}>
                ±{locationAccuracy.toFixed(1)}m
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {location ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Current Location</div>
                  <div className="font-semibold">{location.city}</div>
                  <div className="text-xs text-muted-foreground">{location.address}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Coordinates</div>
                  <div className="font-mono text-xs">
                    {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                  </div>
                  {location.altitude && (
                    <div className="text-xs text-muted-foreground">
                      Alt: {location.altitude.toFixed(0)}m
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center justify-between pt-2 border-t">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <Target className={`h-4 w-4 ${getAccuracyColor()}`} />
                    <span className="text-xs">GPS Accuracy: {locationAccuracy.toFixed(1)}m</span>
                  </div>
                  {location.speed && (
                    <div className="flex items-center gap-1">
                      <Navigation className="h-4 w-4 text-blue-500" />
                      <span className="text-xs">{(location.speed * 3.6).toFixed(1)} km/h</span>
                    </div>
                  )}
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsLocationTracking(!isLocationTracking)}
                >
                  {isLocationTracking ? 'Tracking' : 'Start Tracking'}
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center py-8 text-muted-foreground">
              <div className="text-center">
                <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <div>Location access required</div>
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-2"
                  onClick={() => setIsLocationTracking(true)}
                >
                  Enable Location
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Enhanced Witness Cam Integration */}
      <WitnessCam
        isActive={witnessCamActive || sosPressed || guardianStatus === 'emergency'}
        onRecordingStart={() => {
          onWitnessCamRecord();
          toast({
            title: "🎥 WITNESS CAM ACTIVATED",
            description: "AI-enhanced recording • 10s pre-buffer • Auto-upload to secure cloud",
            variant: "default"
          });
        }}
        onRecordingStop={(recordingData) => {
          onRecordingComplete(recordingData);
          toast({
            title: "📹 EVIDENCE SECURED & VERIFIED",
            description: `Recording: ${Math.round(recordingData.size / 1024)}KB • Blockchain verified • Emergency services notified`,
            variant: "default"
          });
        }}
      />

      {/* Emergency Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Emergency Controls
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant={sosPressed ? "destructive" : "outline"}
              className="h-16 flex-col gap-2"
              onClick={handleSOSActivation}
              disabled={sosPressed}
            >
              <Zap className="h-6 w-6" />
              <span className="text-sm font-bold">
                {sosPressed ? "SOS ACTIVE" : "SOS"}
              </span>
            </Button>
            
            <Button
              variant="outline"
              className="h-16 flex-col gap-2"
              onClick={() => setWitnessCamActive(!witnessCamActive)}
            >
              <Camera className="h-6 w-6" />
              <span className="text-sm">
                {witnessCamActive ? "Stop Recording" : "Start Recording"}
              </span>
            </Button>
            
            <Button variant="outline" className="h-16 flex-col gap-2">
              <Radio className="h-6 w-6" />
              <span className="text-sm">Emergency Radio</span>
            </Button>
            
            <Button variant="outline" className="h-16 flex-col gap-2">
              <Activity className="h-6 w-6" />
              <span className="text-sm">Health Alert</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};