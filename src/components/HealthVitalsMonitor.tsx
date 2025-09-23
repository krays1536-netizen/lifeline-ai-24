import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { 
  Heart, 
  Activity, 
  Thermometer, 
  Zap,
  Droplets,
  Gauge,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock
} from "lucide-react";

interface HealthVitalsMonitorProps {
  patientId: string;
  isLive?: boolean;
}

export const HealthVitalsMonitor = ({ patientId, isLive = false }: HealthVitalsMonitorProps) => {
  const { toast } = useToast();
  const [vitals, setVitals] = useState({
    heartRate: 72,
    bloodPressure: { systolic: 120, diastolic: 80 },
    temperature: 98.6,
    oxygenSaturation: 98,
    respiratoryRate: 16,
    bloodSugar: 95
  });
  const [trends, setTrends] = useState({
    heartRate: 'stable',
    bloodPressure: 'normal',
    temperature: 'normal'
  });
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    if (isLive && isMonitoring) {
      const interval = setInterval(() => {
        updateVitals();
        setLastUpdate(new Date());
      }, 5000); // Update every 5 seconds

      return () => clearInterval(interval);
    }
  }, [isLive, isMonitoring]);

  const updateVitals = () => {
    setVitals(prev => ({
      heartRate: prev.heartRate + (Math.random() - 0.5) * 4,
      bloodPressure: {
        systolic: prev.bloodPressure.systolic + (Math.random() - 0.5) * 6,
        diastolic: prev.bloodPressure.diastolic + (Math.random() - 0.5) * 4
      },
      temperature: prev.temperature + (Math.random() - 0.5) * 0.4,
      oxygenSaturation: Math.max(94, Math.min(100, prev.oxygenSaturation + (Math.random() - 0.5) * 2)),
      respiratoryRate: prev.respiratoryRate + (Math.random() - 0.5) * 2,
      bloodSugar: prev.bloodSugar + (Math.random() - 0.5) * 10
    }));
  };

  const startMonitoring = () => {
    setIsMonitoring(true);
    toast({
      title: "Monitoring started",
      description: "Real-time vital signs monitoring is now active",
    });
  };

  const stopMonitoring = () => {
    setIsMonitoring(false);
    toast({
      title: "Monitoring stopped",
      description: "Vital signs monitoring has been paused",
    });
  };

  const getVitalStatus = (type: string, value: any) => {
    switch (type) {
      case 'heartRate':
        if (value < 60 || value > 100) return 'warning';
        return 'normal';
      case 'bloodPressure':
        if (value.systolic > 140 || value.diastolic > 90) return 'warning';
        if (value.systolic < 90 || value.diastolic < 60) return 'warning';
        return 'normal';
      case 'temperature':
        if (value > 100.4 || value < 97) return 'warning';
        return 'normal';
      case 'oxygenSaturation':
        if (value < 95) return 'critical';
        if (value < 98) return 'warning';
        return 'normal';
      default:
        return 'normal';
    }
  };

  const VitalCard = ({ 
    icon: Icon, 
    title, 
    value, 
    unit, 
    status, 
    trend 
  }: {
    icon: any,
    title: string,
    value: string | number,
    unit: string,
    status: 'normal' | 'warning' | 'critical',
    trend?: string
  }) => {
    const statusColors = {
      normal: 'bg-green-50 border-green-200 text-green-700',
      warning: 'bg-yellow-50 border-yellow-200 text-yellow-700',
      critical: 'bg-red-50 border-red-200 text-red-700'
    };

    return (
      <Card className={`${statusColors[status]} border-2`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Icon className="h-5 w-5" />
              <span className="text-sm font-medium">{title}</span>
            </div>
            {status !== 'normal' && (
              <AlertTriangle className="h-4 w-4" />
            )}
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold">
              {typeof value === 'number' ? value.toFixed(1) : value}
              <span className="text-sm font-normal ml-1">{unit}</span>
            </div>
            {trend && (
              <div className="flex items-center text-xs mt-1">
                <TrendingUp className="h-3 w-3 mr-1" />
                {trend}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Control Panel */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5" />
              <span>Health Vitals Monitor</span>
            </CardTitle>
            <div className="flex items-center space-x-2">
              {isLive && (
                <Button
                  variant={isMonitoring ? "destructive" : "default"}
                  size="sm"
                  onClick={isMonitoring ? stopMonitoring : startMonitoring}
                >
                  {isMonitoring ? "Stop Monitoring" : "Start Monitoring"}
                </Button>
              )}
              <div className="flex items-center space-x-1 text-sm text-gray-500">
                <Clock className="h-4 w-4" />
                <span>Last update: {lastUpdate.toLocaleTimeString()}</span>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Vitals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <VitalCard
          icon={Heart}
          title="Heart Rate"
          value={vitals.heartRate}
          unit="BPM"
          status={getVitalStatus('heartRate', vitals.heartRate)}
          trend={trends.heartRate}
        />
        
        <VitalCard
          icon={Gauge}
          title="Blood Pressure"
          value={`${vitals.bloodPressure.systolic.toFixed(0)}/${vitals.bloodPressure.diastolic.toFixed(0)}`}
          unit="mmHg"
          status={getVitalStatus('bloodPressure', vitals.bloodPressure)}
          trend={trends.bloodPressure}
        />
        
        <VitalCard
          icon={Thermometer}
          title="Temperature"
          value={vitals.temperature}
          unit="°F"
          status={getVitalStatus('temperature', vitals.temperature)}
          trend={trends.temperature}
        />
        
        <VitalCard
          icon={Zap}
          title="Oxygen Saturation"
          value={vitals.oxygenSaturation}
          unit="%"
          status={getVitalStatus('oxygenSaturation', vitals.oxygenSaturation)}
        />
        
        <VitalCard
          icon={Activity}
          title="Respiratory Rate"
          value={vitals.respiratoryRate}
          unit="/min"
          status={getVitalStatus('respiratoryRate', vitals.respiratoryRate)}
        />
        
        <VitalCard
          icon={Droplets}
          title="Blood Sugar"
          value={vitals.bloodSugar}
          unit="mg/dL"
          status={getVitalStatus('bloodSugar', vitals.bloodSugar)}
        />
      </div>

      {/* Status Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Overall Health Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2 p-3 bg-green-50 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-green-900">Normal Readings</p>
                <p className="text-xs text-green-700">4 vitals within normal range</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 p-3 bg-yellow-50 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-sm font-medium text-yellow-900">Requires Attention</p>
                <p className="text-xs text-yellow-700">2 vitals need monitoring</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg">
              <Activity className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-blue-900">Monitoring Active</p>
                <p className="text-xs text-blue-700">Real-time updates every 5 sec</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};