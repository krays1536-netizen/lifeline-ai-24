import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  Heart, 
  Activity, 
  Droplets,
  Wind,
  Zap,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Lightbulb,
  Target
} from 'lucide-react';

interface HealthData {
  heartRate: number;
  stressLevel: number;
  oxygenSat: number;
  temperature: number;
  timestamp: number;
}

interface AIHealthCoachProps {
  healthData?: HealthData;
}

interface Recommendation {
  id: string;
  type: 'critical' | 'warning' | 'info' | 'success';
  title: string;
  description: string;
  action: string;
  icon: React.ComponentType<any>;
  priority: number;
}

export const AIHealthCoach: React.FC<AIHealthCoachProps> = ({ healthData }) => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [healthScore, setHealthScore] = useState(85);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    if (healthData) {
      analyzeHealth(healthData);
    }
  }, [healthData]);

  const analyzeHealth = (data: HealthData) => {
    setIsAnalyzing(true);
    
    // Simulate AI analysis delay
    setTimeout(() => {
      const newRecommendations: Recommendation[] = [];
      let score = 100;

      // Heart Rate Analysis
      if (data.heartRate > 100) {
        newRecommendations.push({
          id: 'hr_high',
          type: 'warning',
          title: 'Elevated Heart Rate Detected',
          description: `Your heart rate of ${data.heartRate} BPM is above normal resting range (60-100 BPM).`,
          action: 'Try deep breathing exercises or rest for 10 minutes',
          icon: Heart,
          priority: 8
        });
        score -= 15;
      } else if (data.heartRate < 60) {
        newRecommendations.push({
          id: 'hr_low',
          type: 'info',
          title: 'Low Heart Rate',
          description: `Heart rate of ${data.heartRate} BPM is below average. This might be normal if you're an athlete.`,
          action: 'Monitor for symptoms like dizziness or fatigue',
          icon: Heart,
          priority: 5
        });
        score -= 5;
      } else {
        newRecommendations.push({
          id: 'hr_good',
          type: 'success',
          title: 'Optimal Heart Rate',
          description: `Your heart rate of ${data.heartRate} BPM is within healthy range.`,
          action: 'Keep maintaining your current activity level',
          icon: CheckCircle,
          priority: 2
        });
      }

      // Stress Level Analysis
      if (data.stressLevel > 70) {
        newRecommendations.push({
          id: 'stress_high',
          type: 'critical',
          title: 'High Stress Level Detected',
          description: `Stress level at ${data.stressLevel}% indicates significant stress response.`,
          action: 'Practice 4-7-8 breathing technique or meditation',
          icon: Brain,
          priority: 9
        });
        score -= 20;
      } else if (data.stressLevel > 40) {
        newRecommendations.push({
          id: 'stress_mod',
          type: 'warning',
          title: 'Moderate Stress',
          description: `Stress level at ${data.stressLevel}% suggests mild stress.`,
          action: 'Take a short break or do light stretching',
          icon: Activity,
          priority: 6
        });
        score -= 10;
      }

      // Oxygen Saturation Analysis
      if (data.oxygenSat < 95) {
        newRecommendations.push({
          id: 'o2_low',
          type: 'critical',
          title: 'Low Oxygen Saturation',
          description: `Oxygen saturation of ${data.oxygenSat}% is below normal (95-100%).`,
          action: 'Seek immediate medical attention if persistent',
          icon: Wind,
          priority: 10
        });
        score -= 25;
      } else if (data.oxygenSat < 98) {
        newRecommendations.push({
          id: 'o2_mod',
          type: 'warning',
          title: 'Oxygen Level Monitoring',
          description: `Oxygen saturation at ${data.oxygenSat}% is slightly below optimal.`,
          action: 'Ensure good ventilation and deep breathing',
          icon: Wind,
          priority: 7
        });
        score -= 8;
      }

      // Temperature Analysis
      if (data.temperature > 37.5) {
        newRecommendations.push({
          id: 'temp_high',
          type: 'warning',
          title: 'Elevated Body Temperature',
          description: `Body temperature of ${data.temperature}°C indicates possible fever.`,
          action: 'Stay hydrated and monitor symptoms',
          icon: Zap,
          priority: 8
        });
        score -= 15;
      }

      // Add positive reinforcements
      if (score > 85) {
        newRecommendations.push({
          id: 'wellness',
          type: 'success',
          title: 'Excellent Health Status',
          description: 'Your vital signs indicate good overall health.',
          action: 'Continue your healthy lifestyle habits',
          icon: Target,
          priority: 1
        });
      }

      // Add general recommendations
      newRecommendations.push({
        id: 'hydration',
        type: 'info',
        title: 'Stay Hydrated',
        description: 'Proper hydration supports all vital functions.',
        action: 'Drink water regularly throughout the day',
        icon: Droplets,
        priority: 3
      });

      // Sort by priority (higher priority first)
      newRecommendations.sort((a, b) => b.priority - a.priority);

      setRecommendations(newRecommendations);
      setHealthScore(Math.max(0, Math.min(100, score)));
      setIsAnalyzing(false);
    }, 2000);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getScoreDescription = (score: number) => {
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Good';
    if (score >= 70) return 'Fair';
    if (score >= 60) return 'Needs Attention';
    return 'Critical';
  };

  return (
    <div className="space-y-6">
      {/* AI Coach Header */}
      <Card className="p-6 border-primary/20 bg-gradient-subtle">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-full bg-primary/10">
              <Brain className="w-6 h-6 text-primary animate-pulse" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">AI Health Coach</h3>
              <p className="text-sm text-muted-foreground">
                Personalized health insights and recommendations
              </p>
            </div>
          </div>
          
          {isAnalyzing && (
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <span className="text-sm text-muted-foreground">Analyzing...</span>
            </div>
          )}
        </div>

        {/* Health Score */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Overall Health Score</span>
            <div className="text-right">
              <div className={`text-2xl font-bold ${getScoreColor(healthScore)}`}>
                {healthScore}/100
              </div>
              <div className="text-xs text-muted-foreground">
                {getScoreDescription(healthScore)}
              </div>
            </div>
          </div>
          
          <Progress 
            value={healthScore} 
            className="h-3"
          />
          
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Critical</span>
            <span>Excellent</span>
          </div>
        </div>
      </Card>

      {/* Recommendations */}
      <div className="space-y-3">
        {recommendations.map((rec) => {
          const IconComponent = rec.icon;
          return (
            <Card 
              key={rec.id}
              className={`p-4 border transition-all duration-300 hover:shadow-md ${
                rec.type === 'critical' ? 'border-red-500/20 bg-red-500/5' :
                rec.type === 'warning' ? 'border-yellow-500/20 bg-yellow-500/5' :
                rec.type === 'success' ? 'border-green-500/20 bg-green-500/5' :
                'border-primary/20 bg-primary/5'
              }`}
            >
              <div className="flex items-start space-x-3">
                <div className={`p-2 rounded-full ${
                  rec.type === 'critical' ? 'bg-red-500/10' :
                  rec.type === 'warning' ? 'bg-yellow-500/10' :
                  rec.type === 'success' ? 'bg-green-500/10' :
                  'bg-primary/10'
                }`}>
                  <IconComponent className={`w-4 h-4 ${
                    rec.type === 'critical' ? 'text-red-500' :
                    rec.type === 'warning' ? 'text-yellow-500' :
                    rec.type === 'success' ? 'text-green-500' :
                    'text-primary'
                  }`} />
                </div>
                
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-sm">{rec.title}</h4>
                    <Badge 
                      variant={
                        rec.type === 'critical' ? 'destructive' :
                        rec.type === 'warning' ? 'secondary' :
                        rec.type === 'success' ? 'default' :
                        'outline'
                      }
                      className="text-xs"
                    >
                      {rec.type.toUpperCase()}
                    </Badge>
                  </div>
                  
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {rec.description}
                  </p>
                  
                  <div className="flex items-center space-x-2 pt-2">
                    <Lightbulb className="w-3 h-3 text-yellow-500" />
                    <span className="text-xs font-medium text-foreground">
                      Recommendation: {rec.action}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <Card className="p-4 border-primary/20 bg-card/50">
        <div className="space-y-3">
          <h4 className="font-medium text-sm flex items-center space-x-2">
            <Target className="w-4 h-4 text-primary" />
            <span>Quick Health Actions</span>
          </h4>
          
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" size="sm" className="text-xs">
              <Wind className="w-3 h-3 mr-1" />
              Breathing Exercise
            </Button>
            <Button variant="outline" size="sm" className="text-xs">
              <Activity className="w-3 h-3 mr-1" />
              Quick Stretch
            </Button>
            <Button variant="outline" size="sm" className="text-xs">
              <Droplets className="w-3 h-3 mr-1" />
              Hydration Reminder
            </Button>
            <Button variant="outline" size="sm" className="text-xs">
              <Brain className="w-3 h-3 mr-1" />
              Meditation Guide
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};