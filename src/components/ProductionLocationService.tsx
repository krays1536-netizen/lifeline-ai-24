import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { 
  MapPin, 
  Navigation, 
  Satellite,
  Signal,
  Clock,
  Shield,
  Zap,
  Globe,
  Compass,
  Target
} from 'lucide-react';

interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  altitude?: number;
  speed?: number;
  heading?: number;
  timestamp: Date;
  address: string;
  city: string;
  governorate: string;
  country: string;
  postalCode?: string;
}

interface ProductionLocationServiceProps {
  onLocationUpdate?: (location: LocationData) => void;
  onEmergencyLocation?: (location: LocationData) => void;
  emergencyMode?: boolean;
  highAccuracy?: boolean;
}

export const ProductionLocationService: React.FC<ProductionLocationServiceProps> = ({
  onLocationUpdate,
  onEmergencyLocation,
  emergencyMode = false,
  highAccuracy = true
}) => {
  const { toast } = useToast();
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [accuracy, setAccuracy] = useState(0);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [signalStrength, setSignalStrength] = useState(0);
  const [locationMethod, setLocationMethod] = useState<'gps' | 'network' | 'passive'>('gps');
  const [trackingHistory, setTrackingHistory] = useState<LocationData[]>([]);
  const [watchId, setWatchId] = useState<number | null>(null);

  // Kuwait administrative data for accurate geocoding
  const kuwaitData = {
    governorates: [
      { name: 'Capital', arabicName: 'العاصمة', cities: ['Kuwait City', 'Sharq', 'Mirqab', 'Dasman', 'Qadsia'] },
      { name: 'Hawalli', arabicName: 'حولي', cities: ['Hawalli', 'Salmiya', 'Rumaithiya', 'Bayan', 'Mishref'] },
      { name: 'Farwaniya', arabicName: 'الفروانية', cities: ['Farwaniya', 'Jleeb Al-Shuyoukh', 'Abraq Khaitan', 'Andalous'] },
      { name: 'Mubarak Al-Kabeer', arabicName: 'مبارك الكبير', cities: ['Mubarak Al-Kabeer', 'Qurain', 'Abu Fteira', 'Sabah Al-Salem'] },
      { name: 'Ahmadi', arabicName: 'الأحمدي', cities: ['Ahmadi', 'Fahaheel', 'Mahboula', 'Fintas', 'Abu Halifa'] },
      { name: 'Jahra', arabicName: 'الجهراء', cities: ['Jahra', 'Sulaibiya', 'Taima', 'Nassem', 'Oyoun'] }
    ],
    landmarks: [
      { name: 'Kuwait Towers', coords: [29.3859, 48.0011] },
      { name: 'Grand Mosque', coords: [29.3692, 47.9782] },
      { name: 'Seif Palace', coords: [29.3697, 47.9783] },
      { name: 'Avenues Mall', coords: [29.3026, 47.9307] },
      { name: 'Kuwait International Airport', coords: [29.2267, 47.9689] }
    ]
  };

  useEffect(() => {
    if (emergencyMode) {
      startEmergencyTracking();
    } else {
      startLocationTracking();
    }

    return () => {
      stopLocationTracking();
    };
  }, [emergencyMode, highAccuracy]);

  const startLocationTracking = useCallback(() => {
    if (!navigator.geolocation) {
      toast({
        title: "Location Not Supported",
        description: "GPS functionality is not available on this device",
        variant: "destructive"
      });
      return;
    }

    const options: PositionOptions = {
      enableHighAccuracy: highAccuracy,
      timeout: emergencyMode ? 5000 : 15000,
      maximumAge: emergencyMode ? 0 : 30000
    };

    setIsTracking(true);

    // Get initial position
    navigator.geolocation.getCurrentPosition(
      (position) => {
        handleLocationSuccess(position);
      },
      (error) => {
        handleLocationError(error);
      },
      options
    );

    // Start continuous tracking
    const id = navigator.geolocation.watchPosition(
      (position) => {
        handleLocationSuccess(position);
      },
      (error) => {
        handleLocationError(error);
      },
      options
    );

    setWatchId(id);
  }, [highAccuracy, emergencyMode]);

  const startEmergencyTracking = useCallback(() => {
    // Enhanced tracking for emergencies
    const emergencyOptions: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 3000,
      maximumAge: 0
    };

    setIsTracking(true);
    setLocationMethod('gps');

    // Multiple location attempts for reliability
    const attempts = [
      navigator.geolocation.getCurrentPosition,
      navigator.geolocation.getCurrentPosition,
      navigator.geolocation.getCurrentPosition
    ];

    attempts.forEach((attempt, index) => {
      setTimeout(() => {
        attempt(
          (position) => {
            handleLocationSuccess(position, true);
          },
          (error) => {
            console.error(`Emergency location attempt ${index + 1} failed:`, error);
          },
          emergencyOptions
        );
      }, index * 1000);
    });

    // Continuous emergency tracking
    const id = navigator.geolocation.watchPosition(
      (position) => {
        handleLocationSuccess(position, true);
      },
      (error) => {
        handleLocationError(error);
      },
      emergencyOptions
    );

    setWatchId(id);
  }, []);

  const handleLocationSuccess = async (position: GeolocationPosition, isEmergency = false) => {
    const { latitude, longitude, accuracy, altitude, speed, heading } = position.coords;
    const timestamp = new Date(position.timestamp);

    // Reverse geocoding for Kuwait
    const locationData = await enhancedReverseGeocode(latitude, longitude);

    const fullLocationData: LocationData = {
      latitude,
      longitude,
      accuracy: accuracy || 0,
      altitude: altitude || undefined,
      speed: speed || undefined,
      heading: heading || undefined,
      timestamp,
      address: locationData.address || 'Kuwait',
      city: locationData.city || 'Kuwait City',
      governorate: locationData.governorate || 'Capital',
      country: locationData.country || 'Kuwait',
      postalCode: locationData.postalCode
    };

    setCurrentLocation(fullLocationData);
    setAccuracy(accuracy || 0);
    setLastUpdate(timestamp);
    setSignalStrength(Math.min(100, Math.max(0, 100 - (accuracy || 100) / 10)));

    // Add to tracking history
    setTrackingHistory(prev => {
      const newHistory = [...prev, fullLocationData];
      return newHistory.slice(-50); // Keep last 50 locations
    });

    // Callbacks
    onLocationUpdate?.(fullLocationData);
    
    if (isEmergency) {
      onEmergencyLocation?.(fullLocationData);
      
      toast({
        title: "🚨 Emergency Location Acquired",
        description: `Accuracy: ${accuracy?.toFixed(0)}m - ${locationData.address}`,
        variant: "destructive"
      });
    }
  };

  const enhancedReverseGeocode = async (lat: number, lng: number): Promise<Partial<LocationData>> => {
    // Kuwait-specific geocoding
    const governorate = findGovernorate(lat, lng);
    const city = findNearestCity(lat, lng);
    
    return {
      address: `${city}, ${governorate}`,
      city,
      governorate,
      country: 'Kuwait',
      postalCode: generateKuwaitPostalCode(governorate)
    };
  };

  const findGovernorate = (lat: number, lng: number): string => {
    // Simple boundary detection for Kuwait governorates
    if (lat > 29.35 && lng < 47.95) return 'Capital';
    if (lat > 29.30 && lng > 48.00) return 'Hawalli';
    if (lat > 29.25 && lat < 29.35 && lng < 47.95) return 'Farwaniya';
    if (lat < 29.25 && lng > 48.00) return 'Ahmadi';
    if (lat > 29.20 && lng < 47.80) return 'Jahra';
    return 'Mubarak Al-Kabeer';
  };

  const findNearestCity = (lat: number, lng: number): string => {
    const cities = [
      { name: 'Kuwait City', lat: 29.3759, lng: 47.9774 },
      { name: 'Hawalli', lat: 29.3328, lng: 48.0263 },
      { name: 'Salmiya', lat: 29.3394, lng: 48.0507 },
      { name: 'Farwaniya', lat: 29.2977, lng: 47.9391 },
      { name: 'Ahmadi', lat: 29.0769, lng: 48.0837 },
      { name: 'Jahra', lat: 29.3375, lng: 47.6581 }
    ];

    let nearestCity = cities[0];
    let minDistance = calculateDistance(lat, lng, cities[0].lat, cities[0].lng);

    for (const city of cities) {
      const distance = calculateDistance(lat, lng, city.lat, city.lng);
      if (distance < minDistance) {
        minDistance = distance;
        nearestCity = city;
      }
    }

    return nearestCity.name;
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const generateKuwaitPostalCode = (governorate: string): string => {
    const codes = {
      'Capital': '10000',
      'Hawalli': '20000',
      'Farwaniya': '30000',
      'Mubarak Al-Kabeer': '40000',
      'Ahmadi': '50000',
      'Jahra': '60000'
    };
    return codes[governorate] || '10000';
  };

  const handleLocationError = (error: GeolocationPositionError) => {
    console.error('Location error:', error);
    
    let errorMessage = "Location access denied";
    switch (error.code) {
      case error.PERMISSION_DENIED:
        errorMessage = "Location permission denied. Please enable GPS.";
        break;
      case error.POSITION_UNAVAILABLE:
        errorMessage = "Location information unavailable.";
        break;
      case error.TIMEOUT:
        errorMessage = "Location request timed out.";
        break;
    }

    toast({
      title: "Location Error",
      description: errorMessage,
      variant: "destructive"
    });

    setIsTracking(false);
  };

  const stopLocationTracking = () => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
    setIsTracking(false);
  };

  const shareLocation = useCallback(() => {
    if (!currentLocation) return;

    const locationText = `My location: ${currentLocation.address}\nCoordinates: ${currentLocation.latitude.toFixed(6)}, ${currentLocation.longitude.toFixed(6)}\nAccuracy: ${currentLocation.accuracy.toFixed(0)}m\nTimestamp: ${currentLocation.timestamp.toLocaleString()}`;

    if (navigator.share) {
      navigator.share({
        title: 'My Current Location',
        text: locationText,
        url: `https://maps.google.com/maps?q=${currentLocation.latitude},${currentLocation.longitude}`
      });
    } else {
      navigator.clipboard.writeText(locationText);
      toast({
        title: "Location Copied",
        description: "Location details copied to clipboard",
        variant: "default"
      });
    }
  }, [currentLocation]);

  const openInMaps = useCallback(() => {
    if (!currentLocation) return;

    const url = `https://maps.google.com/maps?q=${currentLocation.latitude},${currentLocation.longitude}`;
    window.open(url, '_blank');
  }, [currentLocation]);

  return (
    <div className="space-y-6">
      {/* Location Status Header */}
      <Card className="p-6 border-cyber-green/30 bg-gradient-to-br from-cyber-green/5 to-cyber-blue/5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className={`
              p-3 rounded-xl transition-all duration-300
              ${isTracking 
                ? 'bg-green-500/20 animate-pulse ring-2 ring-green-500/50' 
                : 'bg-gray-500/20'
              }
            `}>
              {isTracking ? (
                <Satellite className="w-8 h-8 text-green-500" />
              ) : (
                <MapPin className="w-8 h-8 text-gray-500" />
              )}
            </div>
            <div>
              <h3 className="text-xl font-bold text-foreground">
                {emergencyMode ? "Emergency Location Tracking" : "GPS Location Service"}
              </h3>
              <p className="text-sm text-muted-foreground">
                {isTracking ? "Real-time location monitoring active" : "Location tracking inactive"}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {emergencyMode && (
              <Badge variant="destructive" className="animate-pulse">
                🚨 EMERGENCY
              </Badge>
            )}
            
            {isTracking && (
              <Badge variant="secondary" className="animate-pulse">
                <Signal className="w-3 h-3 mr-1" />
                Tracking
              </Badge>
            )}
          </div>
        </div>

        {/* Signal Strength and Accuracy */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <Signal className="w-4 h-4 text-cyber-green" />
              <span className="text-sm font-medium">Signal Strength</span>
            </div>
            <Progress value={signalStrength} className="h-2" />
            <span className="text-xs text-muted-foreground">{signalStrength.toFixed(0)}%</span>
          </div>
          
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <Target className="w-4 h-4 text-cyber-blue" />
              <span className="text-sm font-medium">Accuracy</span>
            </div>
            <Progress value={Math.max(0, 100 - accuracy / 5)} className="h-2" />
            <span className="text-xs text-muted-foreground">±{accuracy.toFixed(0)}m</span>
          </div>
        </div>

        {/* Current Location Display */}
        {currentLocation && (
          <Card className="p-4 bg-muted/20 border-cyber-green/30">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-foreground">Current Location</h4>
                {lastUpdate && (
                  <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    <span>{lastUpdate.toLocaleTimeString()}</span>
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-muted-foreground">Address</div>
                  <div className="font-medium text-foreground">{currentLocation.address}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Governorate</div>
                  <div className="font-medium text-foreground">{currentLocation.governorate}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Coordinates</div>
                  <div className="font-mono text-xs text-foreground">
                    {currentLocation.latitude.toFixed(6)}, {currentLocation.longitude.toFixed(6)}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground">Method</div>
                  <div className="font-medium text-foreground capitalize">{locationMethod}</div>
                </div>
              </div>

              {(currentLocation.speed || currentLocation.heading) && (
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {currentLocation.speed && (
                    <div>
                      <div className="text-muted-foreground">Speed</div>
                      <div className="font-medium text-foreground">
                        {(currentLocation.speed * 3.6).toFixed(1)} km/h
                      </div>
                    </div>
                  )}
                  {currentLocation.heading && (
                    <div>
                      <div className="text-muted-foreground">Heading</div>
                      <div className="font-medium text-foreground">
                        {currentLocation.heading.toFixed(0)}°
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </Card>
        )}
      </Card>

      {/* Location Controls */}
      <Card className="p-6 border-border/50 bg-card/50">
        <div className="flex flex-wrap justify-center gap-3">
          <Button
            onClick={isTracking ? stopLocationTracking : startLocationTracking}
            className={`${
              isTracking 
                ? 'bg-red-600 hover:bg-red-700 text-white' 
                : 'bg-cyber-green hover:bg-cyber-green/90 text-white'
            } px-6 py-2`}
          >
            {isTracking ? (
              <>
                <Zap className="w-4 h-4 mr-2" />
                Stop Tracking
              </>
            ) : (
              <>
                <Satellite className="w-4 h-4 mr-2" />
                Start GPS
              </>
            )}
          </Button>
          
          <Button
            onClick={shareLocation}
            disabled={!currentLocation}
            variant="outline"
            className="px-6 py-2"
          >
            <Shield className="w-4 h-4 mr-2" />
            Share Location
          </Button>
          
          <Button
            onClick={openInMaps}
            disabled={!currentLocation}
            variant="outline"
            className="px-6 py-2"
          >
            <Navigation className="w-4 h-4 mr-2" />
            Open in Maps
          </Button>
        </div>
      </Card>

      {/* Location History */}
      {trackingHistory.length > 0 && (
        <Card className="p-6 border-border/50 bg-card/50">
          <div className="space-y-4">
            <h4 className="font-semibold text-lg flex items-center space-x-2">
              <Globe className="w-5 h-5 text-cyber-purple" />
              <span>Location History</span>
              <Badge variant="outline">{trackingHistory.length}</Badge>
            </h4>
            
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {trackingHistory.slice(-10).reverse().map((location, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 rounded bg-muted/20 text-sm"
                >
                  <div>
                    <div className="font-medium">{location.address}</div>
                    <div className="text-muted-foreground text-xs">
                      Accuracy: ±{location.accuracy.toFixed(0)}m
                    </div>
                  </div>
                  <div className="text-muted-foreground text-xs">
                    {location.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};