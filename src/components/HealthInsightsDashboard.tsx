import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Brain, 
  TrendingUp, 
  TrendingDown, 
  Heart, 
  Activity, 
  Zap, 
  Shield, 
  AlertTriangle,
  CheckCircle2,
  Clock,
  Target,
  Sparkles,
  Eye,
  Lightbulb
} from "lucide-react";
import { cn } from "@/lib/utils";

interface HealthMetric {
  name: string;
  value: number;
  unit: string;
  trend: "up" | "down" | "stable";
  change: number;
  status: "excellent" | "good" | "normal" | "attention" | "warning";
  insights: string[];
  recommendations: string[];
}

interface AIInsight {
  id: string;
  title: string;
  description: string;
  type: "prediction" | "recommendation" | "pattern" | "alert";
  confidence: number;
  priority: "low" | "medium" | "high" | "critical";
  icon: React.ElementType;
  color: string;
  timestamp: Date;
}

interface HealthInsightsDashboardProps {
  healthData: {
    heartRate: number;
    spO2: number;
    temperature: number;
    bloodPressure: { systolic: number; diastolic: number };
    sleepScore: number;
    stressLevel: number;
    activityLevel: number;
  };
  onInsightAction?: (insight: AIInsight) => void;
}

export const HealthInsightsDashboard = ({ healthData, onInsightAction }: HealthInsightsDashboardProps) => {
  const [selectedPeriod, setSelectedPeriod] = useState<"day" | "week" | "month">("day");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showDetailedView, setShowDetailedView] = useState(false);

  const healthMetrics: HealthMetric[] = [
    {
      name: "Heart Rate",
      value: healthData.heartRate,
      unit: "bpm",
      trend: healthData.heartRate > 75 ? "up" : "stable",
      change: 2.3,
      status: healthData.heartRate > 100 ? "warning" : "good",
      insights: [
        "Your resting heart rate is within normal range",
        "Heart rate variability shows good cardiovascular health",
        "Peak performance zone: 140-170 bpm"
      ],
      recommendations: [
        "Continue regular cardio exercises",
        "Monitor during high stress periods",
        "Consider heart rate training zones"
      ]
    },
    {
      name: "Oxygen Saturation",
      value: healthData.spO2,
      unit: "%",
      trend: "stable",
      change: 0.1,
      status: healthData.spO2 >= 95 ? "excellent" : "attention",
      insights: [
        "Oxygen levels are optimal",
        "Good respiratory function detected",
        "No signs of hypoxemia"
      ],
      recommendations: [
        "Maintain regular breathing exercises",
        "Continue current activity level",
        "Monitor during illness"
      ]
    },
    {
      name: "Sleep Score",
      value: healthData.sleepScore,
      unit: "/100",
      trend: "up",
      change: 5.2,
      status: healthData.sleepScore >= 80 ? "excellent" : "normal",
      insights: [
        "Sleep quality has improved this week",
        "Deep sleep phases are adequate",
        "REM sleep patterns are healthy"
      ],
      recommendations: [
        "Maintain consistent sleep schedule",
        "Optimize bedroom environment",
        "Limit screen time before bed"
      ]
    },
    {
      name: "Stress Level",
      value: healthData.stressLevel,
      unit: "/10",
      trend: healthData.stressLevel > 5 ? "up" : "down",
      change: -1.2,
      status: healthData.stressLevel <= 3 ? "excellent" : healthData.stressLevel <= 6 ? "good" : "attention",
      insights: [
        "Stress levels are manageable",
        "Good recovery between stressful events",
        "Cortisol patterns appear normal"
      ],
      recommendations: [
        "Practice mindfulness meditation",
        "Regular physical exercise",
        "Consider stress management techniques"
      ]
    }
  ];

  const aiInsights: AIInsight[] = [
    {
      id: "pattern_1",
      title: "Sleep Pattern Optimization",
      description: "AI detected your sleep quality improves 23% when you exercise 4-6 hours before bedtime",
      type: "pattern",
      confidence: 89,
      priority: "medium",
      icon: Brain,
      color: "cyber-purple",
      timestamp: new Date()
    },
    {
      id: "prediction_1",
      title: "Heart Rate Prediction",
      description: "Based on current trends, your resting heart rate may decrease by 3-5 bpm over the next month",
      type: "prediction",
      confidence: 76,
      priority: "low",
      icon: Heart,
      color: "cyber-red",
      timestamp: new Date()
    },
    {
      id: "recommendation_1",
      title: "Hydration Alert",
      description: "Your heart rate variability suggests mild dehydration. Consider increasing water intake",
      type: "recommendation",
      confidence: 82,
      priority: "medium",
      icon: Zap,
      color: "cyber-blue",
      timestamp: new Date()
    },
    {
      id: "alert_1",
      title: "Stress Spike Detected",
      description: "Unusual stress pattern detected at 2:30 PM daily. Consider scheduling breaks",
      type: "alert",
      confidence: 94,
      priority: "high",
      icon: AlertTriangle,
      color: "cyber-orange",
      timestamp: new Date()
    }
  ];

  const overallHealthScore = Math.round(
    (healthMetrics.reduce((sum, metric) => {
      const statusScores = { excellent: 100, good: 80, normal: 60, attention: 40, warning: 20 };
      return sum + statusScores[metric.status];
    }, 0) / healthMetrics.length)
  );

  const getStatusColor = (status: string) => {
    const colors = {
      excellent: "cyber-green",
      good: "cyber-blue",
      normal: "cyber-yellow",
      attention: "cyber-orange",
      warning: "cyber-red"
    };
    return colors[status as keyof typeof colors] || "cyber-blue";
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: "cyber-blue",
      medium: "cyber-yellow",
      high: "cyber-orange",
      critical: "cyber-red"
    };
    return colors[priority as keyof typeof colors] || "cyber-blue";
  };

  const runAIAnalysis = () => {
    setIsAnalyzing(true);
    setTimeout(() => setIsAnalyzing(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <Brain className="h-8 w-8 text-cyber-purple animate-pulse" />
          <h2 className="text-3xl font-bold bg-gradient-to-r from-cyber-purple via-cyber-blue to-cyber-teal bg-clip-text text-transparent">
            AI Health Insights
          </h2>
          <Sparkles className="h-8 w-8 text-cyber-purple animate-spin-slow" />
        </div>
        
        <div className="flex items-center justify-center gap-4">
          <Badge className={cn(
            "text-lg px-4 py-2 animate-glow-pulse",
            overallHealthScore >= 80 ? "bg-cyber-green/20 text-cyber-green border-cyber-green/30" :
            overallHealthScore >= 60 ? "bg-cyber-blue/20 text-cyber-blue border-cyber-blue/30" :
            "bg-cyber-orange/20 text-cyber-orange border-cyber-orange/30"
          )}>
            Health Score: {overallHealthScore}/100
          </Badge>
          
          <Button 
            onClick={runAIAnalysis}
            disabled={isAnalyzing}
            className="bg-gradient-to-r from-cyber-purple to-cyber-blue hover:from-cyber-blue hover:to-cyber-purple transition-all duration-500 animate-glow-pulse"
          >
            {isAnalyzing ? (
              <>
                <Brain className="h-4 w-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Brain className="h-4 w-4 mr-2" />
                Run AI Analysis
              </>
            )}
          </Button>
        </div>
      </div>

      <Tabs value={selectedPeriod} onValueChange={(v) => setSelectedPeriod(v as any)} className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-card/50 backdrop-blur-sm">
          <TabsTrigger value="day" className="data-[state=active]:bg-cyber-blue data-[state=active]:text-white">
            Today
          </TabsTrigger>
          <TabsTrigger value="week" className="data-[state=active]:bg-cyber-blue data-[state=active]:text-white">
            This Week
          </TabsTrigger>
          <TabsTrigger value="month" className="data-[state=active]:bg-cyber-blue data-[state=active]:text-white">
            This Month
          </TabsTrigger>
        </TabsList>

        <TabsContent value={selectedPeriod} className="space-y-6 mt-6">
          {/* Health Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {healthMetrics.map((metric, index) => {
              const TrendIcon = metric.trend === "up" ? TrendingUp : metric.trend === "down" ? TrendingDown : Activity;
              const statusColor = getStatusColor(metric.status);
              
              return (
                <Card 
                  key={metric.name}
                  className={cn(
                    "p-6 transition-all duration-500 cursor-pointer group hover:scale-105",
                    "bg-gradient-to-br from-card/50 to-card/20 backdrop-blur-sm",
                    `border-2 border-${statusColor}/30 hover:border-${statusColor}/60`,
                    `hover:shadow-[0_0_30px_hsl(var(--${statusColor})/0.3)]`,
                    "animate-fade-in-scale"
                  )}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-foreground">{metric.name}</h3>
                      <Badge className={cn(
                        `bg-${statusColor}/20 text-${statusColor} border-${statusColor}/30`,
                        "animate-pulse"
                      )}>
                        {metric.status}
                      </Badge>
                    </div>

                    {/* Value */}
                    <div className="space-y-2">
                      <div className="flex items-baseline gap-2">
                        <span className={cn(
                          "text-3xl font-bold",
                          `text-${statusColor}`
                        )}>
                          {metric.value}
                        </span>
                        <span className="text-sm text-muted-foreground">{metric.unit}</span>
                        <div className={cn(
                          "flex items-center gap-1 ml-auto",
                          metric.trend === "up" ? "text-cyber-green" : 
                          metric.trend === "down" ? "text-cyber-red" : "text-muted-foreground"
                        )}>
                          <TrendIcon className="h-4 w-4" />
                          <span className="text-xs">{Math.abs(metric.change)}%</span>
                        </div>
                      </div>
                    </div>

                    {/* Quick Insights */}
                    <div className="space-y-2">
                      <div className="text-xs text-muted-foreground">
                        {metric.insights[0]}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start text-cyber-blue hover:bg-cyber-blue/10"
                        onClick={() => setShowDetailedView(true)}
                      >
                        <Eye className="h-3 w-3 mr-2" />
                        View Details
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* AI Insights */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Lightbulb className="h-6 w-6 text-cyber-yellow animate-pulse" />
              <h3 className="text-xl font-semibold">AI-Generated Insights</h3>
              <Badge className="bg-cyber-blue/20 text-cyber-blue border-cyber-blue/30">
                {aiInsights.length} Active
              </Badge>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {aiInsights.map((insight, index) => {
                const Icon = insight.icon;
                const priorityColor = getPriorityColor(insight.priority);
                
                return (
                  <Card 
                    key={insight.id}
                    className={cn(
                      "p-4 transition-all duration-500 cursor-pointer group hover:scale-102",
                      "bg-gradient-to-br from-card/50 to-card/20 backdrop-blur-sm",
                      `border border-${priorityColor}/30 hover:border-${priorityColor}/60`,
                      "animate-slide-up"
                    )}
                    style={{ animationDelay: `${index * 150}ms` }}
                    onClick={() => onInsightAction?.(insight)}
                  >
                    <div className="space-y-3">
                      {/* Header */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "p-2 rounded-full",
                            `bg-${insight.color}/20`
                          )}>
                            <Icon className={cn("h-5 w-5", `text-${insight.color}`)} />
                          </div>
                          <div>
                            <h4 className="font-semibold text-foreground">{insight.title}</h4>
                            <Badge className={cn(
                              "text-xs capitalize",
                              `bg-${priorityColor}/20 text-${priorityColor} border-${priorityColor}/30`
                            )}>
                              {insight.priority} • {insight.confidence}% confidence
                            </Badge>
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          <Clock className="h-3 w-3 inline mr-1" />
                          {insight.timestamp.toLocaleTimeString()}
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-sm text-muted-foreground">
                        {insight.description}
                      </p>

                      {/* Action */}
                      <Button
                        variant="ghost"
                        size="sm"
                        className={cn(
                          "w-full justify-start",
                          `text-${insight.color} hover:bg-${insight.color}/10`
                        )}
                      >
                        <Target className="h-3 w-3 mr-2" />
                        Take Action
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Health Progress */}
          <Card className="p-6 bg-gradient-to-br from-card/50 to-card/20 backdrop-blur-sm border-cyber-blue/30">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold">Overall Health Progress</h3>
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-cyber-green" />
                  <span className="text-cyber-green font-semibold">Protected</span>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Health Score</span>
                  <span className="text-sm text-muted-foreground">{overallHealthScore}/100</span>
                </div>
                <Progress 
                  value={overallHealthScore} 
                  className="h-3 bg-muted/30 animate-pulse"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Previous: 78</span>
                  <span className="text-cyber-green">+{overallHealthScore - 78} improvement</span>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Analysis Loading Overlay */}
      {isAnalyzing && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <Card className="p-8 text-center space-y-4 animate-bounce-in">
            <Brain className="h-16 w-16 mx-auto text-cyber-purple animate-spin" />
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-cyber-purple">AI Analysis in Progress</h3>
              <p className="text-muted-foreground">Processing your health data with advanced AI...</p>
            </div>
            <div className="space-y-2">
              {["Analyzing patterns...", "Generating insights...", "Creating recommendations..."].map((text, i) => (
                <div key={i} className="text-sm text-cyber-blue animate-pulse" style={{ animationDelay: `${i * 1000}ms` }}>
                  {text}
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};