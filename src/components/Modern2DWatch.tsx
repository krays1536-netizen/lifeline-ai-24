import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { 
  Watch, 
  Heart, 
  Activity, 
  Thermometer, 
  Battery,
  Bluetooth,
  Wifi,
  Play,
  Pause,
  RotateCcw,
  Settings,
  Zap,
  Timer,
  Calendar,
  Clock,
  AlertTriangle,
  MapPin,
  Users
} from 'lucide-react';

interface VitalSigns {
  heartRate: number;
  bloodOxygen: number;
  temperature: number;
  steps: number;
  calories: number;
  distance: number;
}

interface WatchFeature {
  id: string;
  name: string;
  icon: React.ReactNode;
  value: string | number;
  unit: string;
  status: 'normal' | 'elevated' | 'critical';
  trend: 'up' | 'down' | 'stable';
}

export const Modern2DWatch = () => {
  const { toast } = useToast();
  
  // Watch state
  const [isConnected, setIsConnected] = useState(true);
  const [batteryLevel, setBatteryLevel] = useState(78);
  const [isCharging, setIsCharging] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'syncing' | 'synced' | 'error'>('synced');
  
  // Vital signs
  const [vitals, setVitals] = useState<VitalSigns>({
    heartRate: 72,
    bloodOxygen: 98,
    temperature: 36.5,
    steps: 8247,
    calories: 387,
    distance: 5.8
  });

  // Watch features
  const [features] = useState<WatchFeature[]>([
    {
      id: 'hr',
      name: 'Neural Heart Rate',
      icon: <Heart className="h-4 w-4" />,
      value: vitals.heartRate,
      unit: 'BPM',
      status: vitals.heartRate > 100 ? 'elevated' : 'normal',
      trend: 'stable'
    },
    {
      id: 'spo2',
      name: 'Smart Blood Oxygen',
      icon: <Activity className="h-4 w-4" />,
      value: vitals.bloodOxygen,
      unit: '%',
      status: vitals.bloodOxygen < 95 ? 'critical' : 'normal',
      trend: 'stable'
    },
    {
      id: 'temp',
      name: 'Thermal Analysis',
      icon: <Thermometer className="h-4 w-4" />,
      value: vitals.temperature,
      unit: '°C',
      status: vitals.temperature > 37.5 ? 'elevated' : 'normal',
      trend: 'down'
    },
    {
      id: 'steps',
      name: 'Motion Intelligence',
      icon: <Timer className="h-4 w-4" />,
      value: vitals.steps.toLocaleString(),
      unit: 'steps',
      status: 'normal',
      trend: 'up'
    }
  ]);

  // Simulate real-time data updates
  useEffect(() => {
    const interval = setInterval(() => {
      setVitals(prev => ({
        ...prev,
        heartRate: Math.max(60, Math.min(120, prev.heartRate + (Math.random() - 0.5) * 4)),
        bloodOxygen: Math.max(90, Math.min(100, prev.bloodOxygen + (Math.random() - 0.5) * 2)),
        temperature: Math.max(35, Math.min(39, prev.temperature + (Math.random() - 0.5) * 0.2)),
        steps: prev.steps + Math.floor(Math.random() * 5),
        calories: prev.calories + Math.floor(Math.random() * 3),
        distance: prev.distance + Math.random() * 0.1
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Battery simulation
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isCharging) {
        setBatteryLevel(prev => Math.max(0, prev - 0.1));
      } else {
        setBatteryLevel(prev => Math.min(100, prev + 2));
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [isCharging]);

  const startSync = () => {
    setSyncStatus('syncing');
    setTimeout(() => {
      setSyncStatus('synced');
      toast({
        title: "Sync Complete",
        description: "All health data updated successfully",
      });
    }, 3000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critical': return 'text-red-500';
      case 'elevated': return 'text-yellow-500';
      case 'normal': return 'text-green-500';
      default: return 'text-gray-500';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return '↗️';
      case 'down': return '↘️';
      case 'stable': return '→';
      default: return '→';
    }
  };

  const getBatteryColor = () => {
    if (batteryLevel > 50) return 'bg-green-500';
    if (batteryLevel > 20) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-6">
      {/* Watch Display */}
      <Card className="gradient-border">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-16 h-20 bg-gray-900 rounded-xl border-2 border-gray-700 flex items-center justify-center">
                  <div className="w-12 h-16 bg-gray-800 rounded-lg border border-gray-600 relative overflow-hidden">
                    {/* Watch Face */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-900 to-gray-900">
                      <div className="flex flex-col items-center justify-center h-full text-white text-xs">
                        <div className="text-lg font-bold">{vitals.heartRate}</div>
                        <div className="text-xs opacity-75">BPM</div>
                        <div className="text-xs mt-1">{new Date().toLocaleTimeString().slice(0, 5)}</div>
                      </div>
                    </div>
                    
                    {/* Status indicators */}
                    <div className="absolute top-1 left-1">
                      <div className={`w-1 h-1 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`} />
                    </div>
                    <div className="absolute top-1 right-1">
                      <div className={`w-1 h-1 rounded-full ${getBatteryColor()}`} />
                    </div>
                  </div>
                </div>
                {/* Watch band */}
                <div className="absolute -top-2 -bottom-2 left-1/2 transform -translate-x-1/2 w-6 bg-gray-700 rounded-full -z-10" />
              </div>
              
              <div>
                <div className="font-bold">LifeLine SmartWatch Pro</div>
                <div className="text-sm text-muted-foreground">
                  {isConnected ? 'AI-Enhanced • Connected' : 'Disconnected'}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="flex items-center gap-1">
                <Battery className="h-3 w-3" />
                {batteryLevel.toFixed(0)}%
              </Badge>
              <Badge variant={isConnected ? "default" : "secondary"}>
                {isConnected ? <Bluetooth className="h-3 w-3" /> : <Wifi className="h-3 w-3" />}
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Battery Status */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Battery className="h-4 w-4" />
                <span className="text-sm">Battery</span>
              </div>
              <div className="flex items-center gap-2">
                <Progress value={batteryLevel} className="w-20 h-2" />
                <span className="text-xs text-muted-foreground">{batteryLevel.toFixed(0)}%</span>
              </div>
            </div>
            
            {/* Sync Status */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  syncStatus === 'synced' ? 'bg-green-500' : 
                  syncStatus === 'syncing' ? 'bg-yellow-500 animate-pulse' : 'bg-red-500'
                }`} />
                <span className="text-sm capitalize">{syncStatus}</span>
              </div>
              <Button size="sm" variant="outline" onClick={startSync} disabled={syncStatus === 'syncing'}>
                <RotateCcw className={`h-3 w-3 ${syncStatus === 'syncing' ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Health Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Quantum Health Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {features.map((feature) => (
              <Card key={feature.id} className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`p-1 rounded ${getStatusColor(feature.status)}`}>
                      {feature.icon}
                    </div>
                    <span className="text-sm font-medium">{feature.name}</span>
                  </div>
                  <span className="text-xs">{getTrendIcon(feature.trend)}</span>
                </div>
                <div className="text-2xl font-bold">{feature.value}</div>
                <div className="text-xs text-muted-foreground">{feature.unit}</div>
                <Badge 
                  variant={feature.status === 'normal' ? 'default' : 'destructive'} 
                  className="mt-2"
                >
                  {feature.status}
                </Badge>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Daily Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Daily Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-blue-500">{vitals.steps.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Steps</div>
              <Progress value={Math.min(100, (vitals.steps / 10000) * 100)} className="mt-2" />
              <div className="text-xs text-muted-foreground mt-1">Goal: 10,000</div>
            </div>
            
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-orange-500">{vitals.calories}</div>
              <div className="text-sm text-muted-foreground">Calories</div>
              <Progress value={Math.min(100, (vitals.calories / 500) * 100)} className="mt-2" />
              <div className="text-xs text-muted-foreground mt-1">Goal: 500</div>
            </div>
            
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-green-500">{vitals.distance.toFixed(1)}</div>
              <div className="text-sm text-muted-foreground">KM</div>
              <Progress value={Math.min(100, (vitals.distance / 8) * 100)} className="mt-2" />
              <div className="text-xs text-muted-foreground mt-1">Goal: 8 km</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Advanced Watch Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Quantum Watch Controls</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-3">
            <Button variant="outline" className="h-16 flex-col gap-1">
              <Play className="h-5 w-5" />
              <span className="text-xs">AI Workout</span>
            </Button>
            
            <Button variant="outline" className="h-16 flex-col gap-1">
              <Heart className="h-5 w-5" />
              <span className="text-xs">Neural Scan</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-16 flex-col gap-1"
              onClick={() => setIsCharging(!isCharging)}
            >
              <Zap className="h-5 w-5" />
              <span className="text-xs">{isCharging ? 'Fast Charge' : 'Wireless'}</span>
            </Button>
            
            <Button variant="outline" className="h-16 flex-col gap-1">
              <Settings className="h-5 w-5" />
              <span className="text-xs">AI Settings</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};