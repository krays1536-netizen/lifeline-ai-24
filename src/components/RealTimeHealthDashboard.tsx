import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Heart, 
  Activity, 
  Thermometer, 
  Wind, 
  Brain, 
  Zap,
  TrendingUp,
  TrendingDown,
  Minus,
  Wifi,
  WifiOff
} from 'lucide-react';

interface VitalSign {
  value: number;
  unit: string;
  status: 'normal' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'stable';
  lastUpdate: number;
}

interface HealthDashboardData {
  heartRate: VitalSign;
  oxygenSat: VitalSign;
  temperature: VitalSign;
  stressLevel: VitalSign;
  bloodPressure: VitalSign;
  respiratoryRate: VitalSign;
}

export const RealTimeHealthDashboard: React.FC = () => {
  const [isConnected, setIsConnected] = useState(true);
  const [lastSync, setLastSync] = useState(Date.now());
  const [healthData, setHealthData] = useState<HealthDashboardData>({
    heartRate: {
      value: 72,
      unit: 'BPM',
      status: 'normal',
      trend: 'stable',
      lastUpdate: Date.now()
    },
    oxygenSat: {
      value: 98,
      unit: '%',
      status: 'normal',
      trend: 'stable',
      lastUpdate: Date.now()
    },
    temperature: {
      value: 36.8,
      unit: '°C',
      status: 'normal',
      trend: 'stable',
      lastUpdate: Date.now()
    },
    stressLevel: {
      value: 35,
      unit: '%',
      status: 'normal',
      trend: 'down',
      lastUpdate: Date.now()
    },
    bloodPressure: {
      value: 120,
      unit: '/80',
      status: 'normal',
      trend: 'stable',
      lastUpdate: Date.now()
    },
    respiratoryRate: {
      value: 16,
      unit: '/min',
      status: 'normal',
      trend: 'stable',
      lastUpdate: Date.now()
    }
  });

  useEffect(() => {
    // Simulate real-time data updates
    const interval = setInterval(() => {
      setHealthData(prev => ({
        ...prev,
        heartRate: {
          ...prev.heartRate,
          value: Math.max(60, Math.min(100, prev.heartRate.value + (Math.random() - 0.5) * 4)),
          trend: Math.random() > 0.6 ? (Math.random() > 0.5 ? 'up' : 'down') : 'stable',
          lastUpdate: Date.now()
        },
        oxygenSat: {
          ...prev.oxygenSat,
          value: Math.max(95, Math.min(100, prev.oxygenSat.value + (Math.random() - 0.5) * 0.5)),
          lastUpdate: Date.now()
        },
        stressLevel: {
          ...prev.stressLevel,
          value: Math.max(0, Math.min(100, prev.stressLevel.value + (Math.random() - 0.5) * 8)),
          trend: Math.random() > 0.7 ? (Math.random() > 0.5 ? 'up' : 'down') : 'stable',
          lastUpdate: Date.now()
        }
      }));
      setLastSync(Date.now());
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: VitalSign['status']) => {
    switch (status) {
      case 'critical': return 'text-red-500 border-red-500/20 bg-red-500/5';
      case 'warning': return 'text-yellow-500 border-yellow-500/20 bg-yellow-500/5';
      case 'normal': return 'text-green-500 border-green-500/20 bg-green-500/5';
      default: return 'text-muted-foreground border-border bg-card';
    }
  };

  const getTrendIcon = (trend: VitalSign['trend']) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-3 h-3 text-green-500" />;
      case 'down': return <TrendingDown className="w-3 h-3 text-red-500" />;
      case 'stable': return <Minus className="w-3 h-3 text-muted-foreground" />;
    }
  };

  const formatTimeSince = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    return `${Math.floor(minutes / 60)}h ago`;
  };

  const VitalCard: React.FC<{
    title: string;
    icon: React.ComponentType<any>;
    vital: VitalSign;
    showProgress?: boolean;
  }> = ({ title, icon: IconComponent, vital, showProgress = false }) => (
    <Card className={`p-4 border transition-all duration-300 ${getStatusColor(vital.status)}`}>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <IconComponent className="w-4 h-4" />
            <span className="text-sm font-medium">{title}</span>
          </div>
          {getTrendIcon(vital.trend)}
        </div>
        
        <div className="space-y-1">
          <div className="text-2xl font-bold">
            {typeof vital.value === 'number' ? vital.value.toFixed(1) : vital.value}
            <span className="text-sm font-normal text-muted-foreground ml-1">
              {vital.unit}
            </span>
          </div>
          
          {showProgress && (
            <Progress 
              value={vital.value} 
              className="h-1"
              max={100}
            />
          )}
          
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <Badge variant="outline" className={`text-xs ${
              vital.status === 'critical' ? 'border-red-500/50 text-red-500' :
              vital.status === 'warning' ? 'border-yellow-500/50 text-yellow-500' :
              'border-green-500/50 text-green-500'
            }`}>
              {vital.status.toUpperCase()}
            </Badge>
            <span>{formatTimeSince(vital.lastUpdate)}</span>
          </div>
        </div>
      </div>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Dashboard Header */}
      <Card className="p-6 border-primary/20 bg-gradient-subtle">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-lg font-semibold">Real-Time Health Monitor</h3>
            <p className="text-sm text-muted-foreground">
              Live vital signs monitoring and analysis
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              {isConnected ? (
                <Wifi className="w-4 h-4 text-green-500" />
              ) : (
                <WifiOff className="w-4 h-4 text-red-500" />
              )}
              <span className="text-xs text-muted-foreground">
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
            
            <div className="text-xs text-muted-foreground">
              Last sync: {formatTimeSince(lastSync)}
            </div>
          </div>
        </div>
      </Card>

      {/* Primary Vitals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <VitalCard
          title="Heart Rate"
          icon={Heart}
          vital={healthData.heartRate}
        />
        <VitalCard
          title="Blood Oxygen"
          icon={Wind}
          vital={healthData.oxygenSat}
        />
        <VitalCard
          title="Body Temperature"
          icon={Thermometer}
          vital={healthData.temperature}
        />
      </div>

      {/* Secondary Vitals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <VitalCard
          title="Stress Level"
          icon={Brain}
          vital={healthData.stressLevel}
          showProgress={true}
        />
        <VitalCard
          title="Blood Pressure"
          icon={Activity}
          vital={healthData.bloodPressure}
        />
        <VitalCard
          title="Respiratory Rate"
          icon={Zap}
          vital={healthData.respiratoryRate}
        />
      </div>

      {/* Live Feed Indicator */}
      <Card className="p-4 border-primary/20 bg-card/50">
        <div className="flex items-center justify-center space-x-3">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm font-medium">Live Monitoring Active</span>
          </div>
          
          <div className="w-px h-4 bg-border" />
          
          <div className="text-xs text-muted-foreground">
            Updates every 3 seconds
          </div>
        </div>
      </Card>
    </div>
  );
};