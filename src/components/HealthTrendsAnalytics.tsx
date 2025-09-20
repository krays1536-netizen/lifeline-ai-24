import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Heart, 
  Activity, 
  Brain, 
  TrendingUp, 
  TrendingDown, 
  Calendar,
  BarChart3,
  LineChart,
  PieChart,
  Target,
  Award,
  AlertTriangle
} from 'lucide-react';

interface HealthDataPoint {
  timestamp: number;
  heartRate: number;
  stressLevel: number;
  oxygenSat: number;
  temperature: number;
}

interface HealthInsight {
  id: string;
  type: 'positive' | 'warning' | 'info';
  title: string;
  description: string;
  trend: 'improving' | 'declining' | 'stable';
}

export const HealthTrendsAnalytics: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('7d');
  const [healthData, setHealthData] = useState<HealthDataPoint[]>([]);
  const [insights, setInsights] = useState<HealthInsight[]>([]);
  const [selectedMetric, setSelectedMetric] = useState<'heartRate' | 'stressLevel' | 'oxygenSat'>('heartRate');

  useEffect(() => {
    generateMockData();
  }, [timeRange]);

  const generateMockData = () => {
    const now = Date.now();
    const dataPoints: HealthDataPoint[] = [];
    const pointCount = timeRange === '24h' ? 24 : timeRange === '7d' ? 7 : 30;
    const interval = timeRange === '24h' ? 60 * 60 * 1000 : 24 * 60 * 60 * 1000; // 1 hour or 1 day

    // Generate realistic health data with trends
    for (let i = pointCount - 1; i >= 0; i--) {
      const timestamp = now - (i * interval);
      
      // Heart rate: 65-85 BPM with some variation
      const baseHeartRate = 72;
      const heartRateVariation = Math.sin(i * 0.3) * 8 + Math.random() * 6 - 3;
      const heartRate = Math.max(55, Math.min(95, baseHeartRate + heartRateVariation));
      
      // Stress level: 20-60% with daily patterns
      const baseStress = 35;
      const stressVariation = Math.sin(i * 0.2) * 15 + Math.random() * 10 - 5;
      const stressLevel = Math.max(15, Math.min(75, baseStress + stressVariation));
      
      // Oxygen saturation: 96-99%
      const baseOxygen = 98;
      const oxygenVariation = Math.random() * 2 - 1;
      const oxygenSat = Math.max(95, Math.min(100, baseOxygen + oxygenVariation));
      
      // Temperature: 36.1-37.2°C
      const baseTemp = 36.6;
      const tempVariation = Math.random() * 0.8 - 0.4;
      const temperature = Math.max(35.5, Math.min(38, baseTemp + tempVariation));

      dataPoints.push({
        timestamp,
        heartRate: Math.round(heartRate),
        stressLevel: Math.round(stressLevel),
        oxygenSat: Math.round(oxygenSat * 10) / 10,
        temperature: Math.round(temperature * 10) / 10
      });
    }

    setHealthData(dataPoints);
    generateInsights(dataPoints);
  };

  const generateInsights = (data: HealthDataPoint[]) => {
    const newInsights: HealthInsight[] = [];
    
    if (data.length < 2) return;

    // Heart rate analysis
    const avgHeartRate = data.reduce((sum, d) => sum + d.heartRate, 0) / data.length;
    const recentHeartRate = data.slice(-3).reduce((sum, d) => sum + d.heartRate, 0) / 3;
    const earlyHeartRate = data.slice(0, 3).reduce((sum, d) => sum + d.heartRate, 0) / 3;
    
    if (recentHeartRate < earlyHeartRate - 5) {
      newInsights.push({
        id: 'hr_improving',
        type: 'positive',
        title: 'Heart Rate Improving',
        description: `Your resting heart rate has decreased by ${Math.round(earlyHeartRate - recentHeartRate)} BPM, indicating better cardiovascular fitness.`,
        trend: 'improving'
      });
    }

    // Stress level analysis
    const avgStress = data.reduce((sum, d) => sum + d.stressLevel, 0) / data.length;
    const recentStress = data.slice(-3).reduce((sum, d) => sum + d.stressLevel, 0) / 3;
    
    if (avgStress > 50) {
      newInsights.push({
        id: 'stress_high',
        type: 'warning',
        title: 'Elevated Stress Levels',
        description: `Your average stress level is ${Math.round(avgStress)}%, which is above the recommended 40%. Consider stress management techniques.`,
        trend: 'declining'
      });
    } else if (recentStress < 35) {
      newInsights.push({
        id: 'stress_good',
        type: 'positive',
        title: 'Well-Managed Stress',
        description: `Your recent stress levels are well-controlled at ${Math.round(recentStress)}%. Keep up the good work!`,
        trend: 'stable'
      });
    }

    // Oxygen saturation analysis
    const avgOxygen = data.reduce((sum, d) => sum + d.oxygenSat, 0) / data.length;
    if (avgOxygen >= 98) {
      newInsights.push({
        id: 'oxygen_excellent',
        type: 'positive',
        title: 'Excellent Oxygen Levels',
        description: `Your average oxygen saturation of ${avgOxygen.toFixed(1)}% indicates excellent respiratory health.`,
        trend: 'stable'
      });
    }

    // Consistency analysis
    const heartRateVariance = data.reduce((sum, d) => sum + Math.pow(d.heartRate - avgHeartRate, 2), 0) / data.length;
    if (heartRateVariance < 25) {
      newInsights.push({
        id: 'consistency',
        type: 'info',
        title: 'Consistent Vital Signs',
        description: 'Your vital signs show good consistency, indicating stable health patterns.',
        trend: 'stable'
      });
    }

    setInsights(newInsights);
  };

  const renderMiniChart = (data: number[], color: string = 'hsl(var(--primary))') => {
    if (data.length < 2) return null;

    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;
    
    const points = data.map((value, index) => {
      const x = (index / (data.length - 1)) * 100;
      const y = 100 - ((value - min) / range) * 100;
      return `${x},${y}`;
    }).join(' ');

    return (
      <svg className="w-full h-16" viewBox="0 0 100 100" preserveAspectRatio="none">
        <polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth="2"
          className="animate-pulse"
        />
      </svg>
    );
  };

  const getMetricData = () => {
    switch (selectedMetric) {
      case 'heartRate':
        return {
          data: healthData.map(d => d.heartRate),
          title: 'Heart Rate',
          unit: 'BPM',
          color: 'hsl(220, 70%, 50%)',
          icon: Heart
        };
      case 'stressLevel':
        return {
          data: healthData.map(d => d.stressLevel),
          title: 'Stress Level',
          unit: '%',
          color: 'hsl(30, 70%, 50%)',
          icon: Brain
        };
      case 'oxygenSat':
        return {
          data: healthData.map(d => d.oxygenSat),
          title: 'Oxygen Saturation',
          unit: '%',
          color: 'hsl(120, 70%, 50%)',
          icon: Activity
        };
    }
  };

  const metricData = getMetricData();
  const MetricIcon = metricData.icon;

  return (
    <div className="space-y-6">
      {/* Analytics Header */}
      <Card className="p-6 border-primary/20 bg-gradient-subtle">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-full bg-primary/10">
              <BarChart3 className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Health Trends Analytics</h3>
              <p className="text-sm text-muted-foreground">
                Track your health patterns over time
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant={timeRange === '24h' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRange('24h')}
            >
              24H
            </Button>
            <Button
              variant={timeRange === '7d' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRange('7d')}
            >
              7D
            </Button>
            <Button
              variant={timeRange === '30d' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRange('30d')}
            >
              30D
            </Button>
          </div>
        </div>
      </Card>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Heart Rate Card */}
            <Card className="p-4 border-blue-500/20 bg-blue-500/5">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Heart className="w-4 h-4 text-blue-500" />
                    <span className="text-sm font-medium">Heart Rate</span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    Avg: {Math.round(healthData.reduce((sum, d) => sum + d.heartRate, 0) / healthData.length)} BPM
                  </Badge>
                </div>
                
                <div className="bg-black/20 rounded p-2">
                  {renderMiniChart(healthData.map(d => d.heartRate), 'hsl(220, 70%, 50%)')}
                </div>
                
                <div className="text-xs text-muted-foreground">
                  Range: {Math.min(...healthData.map(d => d.heartRate))} - {Math.max(...healthData.map(d => d.heartRate))} BPM
                </div>
              </div>
            </Card>

            {/* Stress Level Card */}
            <Card className="p-4 border-orange-500/20 bg-orange-500/5">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Brain className="w-4 h-4 text-orange-500" />
                    <span className="text-sm font-medium">Stress Level</span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    Avg: {Math.round(healthData.reduce((sum, d) => sum + d.stressLevel, 0) / healthData.length)}%
                  </Badge>
                </div>
                
                <div className="bg-black/20 rounded p-2">
                  {renderMiniChart(healthData.map(d => d.stressLevel), 'hsl(30, 70%, 50%)')}
                </div>
                
                <div className="text-xs text-muted-foreground">
                  Range: {Math.min(...healthData.map(d => d.stressLevel))}% - {Math.max(...healthData.map(d => d.stressLevel))}%
                </div>
              </div>
            </Card>

            {/* Oxygen Saturation Card */}
            <Card className="p-4 border-green-500/20 bg-green-500/5">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Activity className="w-4 h-4 text-green-500" />
                    <span className="text-sm font-medium">Oxygen Sat</span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    Avg: {(healthData.reduce((sum, d) => sum + d.oxygenSat, 0) / healthData.length).toFixed(1)}%
                  </Badge>
                </div>
                
                <div className="bg-black/20 rounded p-2">
                  {renderMiniChart(healthData.map(d => d.oxygenSat), 'hsl(120, 70%, 50%)')}
                </div>
                
                <div className="text-xs text-muted-foreground">
                  Range: {Math.min(...healthData.map(d => d.oxygenSat)).toFixed(1)}% - {Math.max(...healthData.map(d => d.oxygenSat)).toFixed(1)}%
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-4">
          <Card className="p-6 border-primary/20 bg-card/50">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium flex items-center space-x-2">
                  <MetricIcon className="w-4 h-4 text-primary" />
                  <span>{metricData.title} Trend</span>
                </h4>
                
                <div className="flex space-x-2">
                  <Button
                    variant={selectedMetric === 'heartRate' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedMetric('heartRate')}
                  >
                    Heart Rate
                  </Button>
                  <Button
                    variant={selectedMetric === 'stressLevel' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedMetric('stressLevel')}
                  >
                    Stress
                  </Button>
                  <Button
                    variant={selectedMetric === 'oxygenSat' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedMetric('oxygenSat')}
                  >
                    Oxygen
                  </Button>
                </div>
              </div>
              
              <div className="bg-black/20 rounded-lg p-4" style={{ height: '200px' }}>
                <svg className="w-full h-full" viewBox="0 0 400 150" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="trendGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor={metricData.color} stopOpacity="0.3" />
                      <stop offset="100%" stopColor={metricData.color} stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  
                  {/* Grid lines */}
                  {[...Array(5)].map((_, i) => (
                    <line
                      key={i}
                      x1="0"
                      y1={i * 30}
                      x2="400"
                      y2={i * 30}
                      stroke="currentColor"
                      strokeOpacity="0.1"
                    />
                  ))}
                  
                  {/* Data line and area */}
                  {metricData.data.length > 1 && (
                    <>
                      <path
                        d={`M 0 ${150 - ((metricData.data[0] - Math.min(...metricData.data)) / (Math.max(...metricData.data) - Math.min(...metricData.data))) * 120} ${metricData.data.map((value, index) => 
                          `L ${(index / (metricData.data.length - 1)) * 400} ${150 - ((value - Math.min(...metricData.data)) / (Math.max(...metricData.data) - Math.min(...metricData.data))) * 120}`
                        ).join(' ')} L 400 150 L 0 150 Z`}
                        fill="url(#trendGradient)"
                      />
                      <polyline
                        points={metricData.data.map((value, index) => {
                          const x = (index / (metricData.data.length - 1)) * 400;
                          const y = 150 - ((value - Math.min(...metricData.data)) / (Math.max(...metricData.data) - Math.min(...metricData.data))) * 120;
                          return `${x},${y}`;
                        }).join(' ')}
                        fill="none"
                        stroke={metricData.color}
                        strokeWidth="2"
                      />
                    </>
                  )}
                </svg>
              </div>
              
              <div className="grid grid-cols-3 gap-4 text-center text-sm">
                <div>
                  <div className="font-bold text-green-500">
                    {Math.min(...metricData.data)} {metricData.unit}
                  </div>
                  <div className="text-muted-foreground">Minimum</div>
                </div>
                <div>
                  <div className="font-bold text-primary">
                    {(metricData.data.reduce((sum, d) => sum + d, 0) / metricData.data.length).toFixed(1)} {metricData.unit}
                  </div>
                  <div className="text-muted-foreground">Average</div>
                </div>
                <div>
                  <div className="font-bold text-red-500">
                    {Math.max(...metricData.data)} {metricData.unit}
                  </div>
                  <div className="text-muted-foreground">Maximum</div>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Insights Tab */}
        <TabsContent value="insights" className="space-y-4">
          <div className="space-y-3">
            {insights.map((insight) => (
              <Card 
                key={insight.id}
                className={`p-4 border transition-all duration-300 ${
                  insight.type === 'positive' ? 'border-green-500/20 bg-green-500/5' :
                  insight.type === 'warning' ? 'border-yellow-500/20 bg-yellow-500/5' :
                  'border-primary/20 bg-primary/5'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className={`p-2 rounded-full ${
                    insight.type === 'positive' ? 'bg-green-500/10' :
                    insight.type === 'warning' ? 'bg-yellow-500/10' :
                    'bg-primary/10'
                  }`}>
                    {insight.type === 'positive' && <Award className="w-4 h-4 text-green-500" />}
                    {insight.type === 'warning' && <AlertTriangle className="w-4 h-4 text-yellow-500" />}
                    {insight.type === 'info' && <Target className="w-4 h-4 text-primary" />}
                  </div>
                  
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-sm">{insight.title}</h4>
                      <div className="flex items-center space-x-1">
                        {insight.trend === 'improving' && <TrendingUp className="w-3 h-3 text-green-500" />}
                        {insight.trend === 'declining' && <TrendingDown className="w-3 h-3 text-red-500" />}
                        <Badge variant="outline" className="text-xs">
                          {insight.trend}
                        </Badge>
                      </div>
                    </div>
                    
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {insight.description}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};