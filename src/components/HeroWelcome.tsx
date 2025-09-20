import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Shield, 
  Heart, 
  Brain, 
  Zap, 
  Star, 
  Activity,
  Eye,
  Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";

interface HeroWelcomeProps {
  onGetStarted: () => void;
  onExploreFeatures: () => void;
  userName?: string;
}

export const HeroWelcome = ({ onGetStarted, onExploreFeatures, userName }: HeroWelcomeProps) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeFeature, setActiveFeature] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  const features = [
    {
      icon: Shield,
      title: "24/7 Guardian AI",
      description: "Advanced AI monitoring your health continuously",
      color: "cyber-blue",
      glow: "glow-primary"
    },
    {
      icon: Heart,
      title: "Real-Time Vitals",
      description: "PPG scanning with medical-grade accuracy",
      color: "cyber-red",
      glow: "pulse-heartbeat"
    },
    {
      icon: Brain,
      title: "Neural Analysis",
      description: "AI-powered health insights and predictions",
      color: "cyber-purple",
      glow: "glow-neural"
    },
    {
      icon: Zap,
      title: "Emergency Response",
      description: "Instant emergency detection and response",
      color: "cyber-orange",
      glow: "glow-warning"
    }
  ];

  useEffect(() => {
    setIsVisible(true);
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    const featureInterval = setInterval(() => {
      setActiveFeature(prev => (prev + 1) % features.length);
    }, 3000);

    return () => {
      clearInterval(timeInterval);
      clearInterval(featureInterval);
    };
  }, []);

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-cyber-blue/5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,hsl(var(--cyber-blue)/0.1)_0%,transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,hsl(var(--cyber-purple)/0.1)_0%,transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_40%_80%,hsl(var(--cyber-pink)/0.1)_0%,transparent_50%)]" />
      </div>

      {/* Matrix Rain Effect */}
      <div className="absolute inset-0 opacity-20">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-px h-px bg-cyber-blue animate-matrix-rain"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className={cn(
        "relative z-10 flex flex-col items-center justify-center min-h-screen px-6 text-center",
        "transition-all duration-1000",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
      )}>
        
        {/* Time and Status */}
        <div className="mb-8 space-y-2">
          <div className="text-cyber-blue text-sm font-mono tracking-wider animate-glow-pulse">
            {currentTime.toLocaleTimeString()} • Kuwait City
          </div>
          <Badge className="bg-cyber-green/20 text-cyber-green border-cyber-green/30 animate-pulse">
            <div className="w-2 h-2 bg-cyber-green rounded-full mr-2 animate-pulse" />
            All Systems Online
          </Badge>
        </div>

        {/* Main Title */}
        <div className="mb-12 space-y-6">
          <h1 className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-cyber-blue via-cyber-purple to-cyber-pink bg-clip-text text-transparent animate-hologram bg-[length:200%_200%]">
            LifeLine AI
          </h1>
          
          <div className="space-y-2">
            <p className="text-2xl md:text-3xl font-light text-cyber-blue animate-neon-glow">
              {getGreeting()}{userName ? `, ${userName}` : ""}
            </p>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Your advanced AI guardian is ready to protect, monitor, and enhance your health 24/7 with cutting-edge technology
            </p>
          </div>
        </div>

        {/* Feature Showcase */}
        <div className="mb-12 w-full max-w-4xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              const isActive = index === activeFeature;
              
              return (
                <Card key={index} className={cn(
                  "relative p-6 transition-all duration-500 cursor-pointer group",
                  "bg-gradient-to-br from-card/50 to-card/20 backdrop-blur-sm",
                  "border-2 hover:scale-105",
                  isActive 
                    ? `border-${feature.color} shadow-[0_0_30px_hsl(var(--${feature.color})/0.3)]` 
                    : "border-border/50 hover:border-cyber-blue/50"
                )}>
                  <div className="text-center space-y-3">
                    <div className={cn(
                      "w-16 h-16 mx-auto rounded-full flex items-center justify-center",
                      "transition-all duration-500",
                      isActive ? `bg-${feature.color}/20 animate-glow-pulse` : "bg-muted/20"
                    )}>
                      <Icon className={cn(
                        "h-8 w-8 transition-all duration-500",
                        isActive ? `text-${feature.color} animate-float` : "text-muted-foreground"
                      )} />
                    </div>
                    
                    <h3 className={cn(
                      "font-semibold transition-colors duration-500",
                      isActive ? `text-${feature.color}` : "text-foreground"
                    )}>
                      {feature.title}
                    </h3>
                    
                    <p className="text-sm text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>

                  {/* Active indicator */}
                  {isActive && (
                    <div className="absolute inset-0 rounded-lg animate-scan-line">
                      <div className={`w-full h-px bg-gradient-to-r from-transparent via-${feature.color} to-transparent`} />
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <Button 
            onClick={onGetStarted}
            size="lg"
            className="relative overflow-hidden bg-gradient-to-r from-cyber-blue to-cyber-purple hover:from-cyber-purple hover:to-cyber-pink transition-all duration-500 text-white border-0 px-8 py-6 text-lg animate-glow-pulse group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-cyber-blue via-cyber-purple to-cyber-pink opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <span className="relative flex items-center gap-2">
              <Sparkles className="h-5 w-5 animate-spin-slow" />
              Start Guardian Protection
              <Star className="h-5 w-5 animate-pulse" />
            </span>
          </Button>
          
          <Button 
            onClick={onExploreFeatures}
            variant="outline"
            size="lg"
            className="border-2 border-cyber-blue/50 text-cyber-blue hover:bg-cyber-blue/10 hover:border-cyber-blue transition-all duration-300 px-8 py-6 text-lg group"
          >
            <span className="flex items-center gap-2">
              <Eye className="h-5 w-5 group-hover:animate-bounce" />
              Explore Features
              <Activity className="h-5 w-5 animate-pulse" />
            </span>
          </Button>
        </div>

        {/* Stats Bar */}
        <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-cyber-green rounded-full animate-pulse" />
            <span>99.9% Uptime</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-cyber-blue rounded-full animate-pulse" />
            <span>AI-Powered</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-cyber-purple rounded-full animate-pulse" />
            <span>Medical Grade</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-cyber-orange rounded-full animate-pulse" />
            <span>24/7 Monitoring</span>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
          <div className="animate-bounce">
            <div className="w-6 h-10 border-2 border-cyber-blue/50 rounded-full flex justify-center">
              <div className="w-1 h-3 bg-cyber-blue rounded-full mt-2 animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};