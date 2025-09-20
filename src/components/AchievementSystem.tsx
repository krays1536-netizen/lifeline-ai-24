import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Trophy, 
  Star, 
  Medal, 
  Crown, 
  Shield, 
  Heart, 
  Zap, 
  Target,
  Award,
  Gem,
  CheckCircle2,
  Lock,
  TrendingUp
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  rarity: "common" | "rare" | "epic" | "legendary";
  progress: number;
  maxProgress: number;
  unlocked: boolean;
  unlockedAt?: Date;
  reward: {
    type: "xp" | "badge" | "feature";
    value: number | string;
  };
}

interface AchievementSystemProps {
  userLevel: number;
  totalXP: number;
  onAchievementUnlock?: (achievement: Achievement) => void;
}

export const AchievementSystem = ({ userLevel, totalXP, onAchievementUnlock }: AchievementSystemProps) => {
  const [achievements, setAchievements] = useState<Achievement[]>([
    {
      id: "first_scan",
      title: "First Heartbeat",
      description: "Complete your first vital signs scan",
      icon: Heart,
      color: "cyber-red",
      rarity: "common",
      progress: 1,
      maxProgress: 1,
      unlocked: true,
      unlockedAt: new Date(),
      reward: { type: "xp", value: 100 }
    },
    {
      id: "guardian_active",
      title: "Guardian Angel",
      description: "Keep Guardian AI active for 24 hours",
      icon: Shield,
      color: "cyber-blue",
      rarity: "rare",
      progress: 18,
      maxProgress: 24,
      unlocked: false,
      reward: { type: "feature", value: "Advanced Monitoring" }
    },
    {
      id: "health_streak",
      title: "Health Warrior",
      description: "Maintain healthy vitals for 7 days straight",
      icon: TrendingUp,
      color: "cyber-green",
      rarity: "epic",
      progress: 4,
      maxProgress: 7,
      unlocked: false,
      reward: { type: "xp", value: 500 }
    },
    {
      id: "emergency_hero",
      title: "Life Saver",
      description: "Successfully handle 5 emergency situations",
      icon: Medal,
      color: "cyber-orange",
      rarity: "legendary",
      progress: 2,
      maxProgress: 5,
      unlocked: false,
      reward: { type: "badge", value: "Emergency Hero" }
    },
    {
      id: "ai_master",
      title: "AI Whisperer",
      description: "Use all AI features at least once",
      icon: Crown,
      color: "cyber-purple",
      rarity: "epic",
      progress: 3,
      maxProgress: 5,
      unlocked: false,
      reward: { type: "feature", value: "AI Insights Pro" }
    },
    {
      id: "community_helper",
      title: "Community Guardian",
      description: "Help 10 community members",
      icon: Star,
      color: "cyber-yellow",
      rarity: "rare",
      progress: 0,
      maxProgress: 10,
      unlocked: false,
      reward: { type: "xp", value: 250 }
    }
  ]);

  const [selectedCategory, setSelectedCategory] = useState<"all" | "unlocked" | "locked">("all");
  const [showCelebration, setShowCelebration] = useState<Achievement | null>(null);

  const rarityConfig = {
    common: { 
      gradient: "from-gray-400 to-gray-600", 
      glow: "shadow-gray-400/20",
      border: "border-gray-400/30"
    },
    rare: { 
      gradient: "from-cyber-blue to-cyber-teal", 
      glow: "shadow-cyber-blue/30",
      border: "border-cyber-blue/40"
    },
    epic: { 
      gradient: "from-cyber-purple to-cyber-pink", 
      glow: "shadow-cyber-purple/40",
      border: "border-cyber-purple/50"
    },
    legendary: { 
      gradient: "from-cyber-orange via-cyber-yellow to-cyber-red", 
      glow: "shadow-cyber-orange/50",
      border: "border-cyber-orange/60"
    }
  };

  const nextLevelXP = (userLevel + 1) * 1000;
  const currentLevelXP = totalXP - (userLevel * 1000);
  const levelProgress = (currentLevelXP / 1000) * 100;

  const filteredAchievements = achievements.filter(achievement => {
    if (selectedCategory === "unlocked") return achievement.unlocked;
    if (selectedCategory === "locked") return !achievement.unlocked;
    return true;
  });

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalCount = achievements.length;

  useEffect(() => {
    // Check for achievement unlocks
    achievements.forEach(achievement => {
      if (!achievement.unlocked && achievement.progress >= achievement.maxProgress) {
        const updatedAchievement = {
          ...achievement,
          unlocked: true,
          unlockedAt: new Date()
        };
        
        setAchievements(prev => 
          prev.map(a => a.id === achievement.id ? updatedAchievement : a)
        );
        
        setShowCelebration(updatedAchievement);
        onAchievementUnlock?.(updatedAchievement);
        
        setTimeout(() => setShowCelebration(null), 3000);
      }
    });
  }, [achievements, onAchievementUnlock]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <Trophy className="h-8 w-8 text-cyber-yellow animate-pulse" />
          <h2 className="text-3xl font-bold bg-gradient-to-r from-cyber-yellow via-cyber-orange to-cyber-red bg-clip-text text-transparent">
            Achievements
          </h2>
          <Trophy className="h-8 w-8 text-cyber-yellow animate-pulse" />
        </div>
        
        <div className="flex items-center justify-center gap-4">
          <Badge className="bg-cyber-blue/20 text-cyber-blue border-cyber-blue/30">
            Level {userLevel}
          </Badge>
          <Badge className="bg-cyber-purple/20 text-cyber-purple border-cyber-purple/30">
            {unlockedCount}/{totalCount} Unlocked
          </Badge>
          <Badge className="bg-cyber-green/20 text-cyber-green border-cyber-green/30">
            {totalXP.toLocaleString()} XP
          </Badge>
        </div>
      </div>

      {/* Level Progress */}
      <Card className="p-6 bg-gradient-to-r from-card/50 to-card/20 backdrop-blur-sm border-cyber-blue/30">
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="font-semibold text-cyber-blue">Level Progress</span>
            <span className="text-sm text-muted-foreground">
              {currentLevelXP}/{1000} XP to Level {userLevel + 1}
            </span>
          </div>
          <Progress 
            value={levelProgress} 
            className="h-3 bg-muted/30"
          />
        </div>
      </Card>

      {/* Category Filter */}
      <div className="flex justify-center gap-2">
        {(["all", "unlocked", "locked"] as const).map(category => (
          <Button
            key={category}
            variant={selectedCategory === category ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(category)}
            className={cn(
              "capitalize transition-all duration-300",
              selectedCategory === category && "bg-cyber-blue text-white animate-glow-pulse"
            )}
          >
            {category}
          </Button>
        ))}
      </div>

      {/* Achievements Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAchievements.map((achievement, index) => {
          const Icon = achievement.icon;
          const config = rarityConfig[achievement.rarity];
          const progressPercent = (achievement.progress / achievement.maxProgress) * 100;
          
          return (
            <Card 
              key={achievement.id}
              className={cn(
                "relative p-6 transition-all duration-500 group cursor-pointer",
                "bg-gradient-to-br from-card/50 to-card/20 backdrop-blur-sm",
                "hover:scale-105 hover:rotate-1",
                achievement.unlocked 
                  ? `border-2 ${config.border} ${config.glow} shadow-lg animate-glow-pulse` 
                  : "border border-muted/30 grayscale hover:grayscale-0",
                `animate-fade-in-scale`
              )}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Rarity Indicator */}
              <div className={cn(
                "absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-bold",
                `bg-gradient-to-r ${config.gradient} text-white`,
                "animate-pulse"
              )}>
                {achievement.rarity.toUpperCase()}
              </div>

              {/* Lock/Unlock Status */}
              <div className="absolute top-2 left-2">
                {achievement.unlocked ? (
                  <CheckCircle2 className="h-5 w-5 text-cyber-green animate-bounce" />
                ) : (
                  <Lock className="h-5 w-5 text-muted-foreground" />
                )}
              </div>

              <div className="text-center space-y-4 mt-4">
                {/* Icon */}
                <div className={cn(
                  "w-16 h-16 mx-auto rounded-full flex items-center justify-center transition-all duration-500",
                  achievement.unlocked 
                    ? `bg-${achievement.color}/20 animate-float` 
                    : "bg-muted/10"
                )}>
                  <Icon className={cn(
                    "h-8 w-8 transition-all duration-500",
                    achievement.unlocked 
                      ? `text-${achievement.color} animate-pulse` 
                      : "text-muted-foreground"
                  )} />
                </div>

                {/* Title */}
                <h3 className={cn(
                  "font-bold text-lg transition-colors duration-500",
                  achievement.unlocked 
                    ? `text-${achievement.color}` 
                    : "text-muted-foreground"
                )}>
                  {achievement.title}
                </h3>

                {/* Description */}
                <p className="text-sm text-muted-foreground">
                  {achievement.description}
                </p>

                {/* Progress */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span>Progress</span>
                    <span>{achievement.progress}/{achievement.maxProgress}</span>
                  </div>
                  <Progress 
                    value={progressPercent} 
                    className={cn(
                      "h-2",
                      achievement.unlocked && "animate-pulse"
                    )}
                  />
                </div>

                {/* Reward */}
                <div className={cn(
                  "flex items-center justify-center gap-2 p-2 rounded-lg",
                  achievement.unlocked 
                    ? "bg-cyber-green/20 text-cyber-green" 
                    : "bg-muted/10 text-muted-foreground"
                )}>
                  <Award className="h-4 w-4" />
                  <span className="text-xs font-medium">
                    {achievement.reward.type === "xp" && `+${achievement.reward.value} XP`}
                    {achievement.reward.type === "badge" && `Badge: ${achievement.reward.value}`}
                    {achievement.reward.type === "feature" && `Unlock: ${achievement.reward.value}`}
                  </span>
                </div>

                {/* Unlock Date */}
                {achievement.unlocked && achievement.unlockedAt && (
                  <div className="text-xs text-cyber-blue animate-pulse">
                    Unlocked {achievement.unlockedAt.toLocaleDateString()}
                  </div>
                )}
              </div>

              {/* Celebration Effect */}
              {achievement.unlocked && (
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-scan-line" />
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Celebration Modal */}
      {showCelebration && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in-scale">
          <Card className="p-8 max-w-md mx-4 text-center space-y-6 animate-bounce-in">
            <div className="space-y-4">
              <div className="text-6xl animate-bounce">🎉</div>
              <h3 className="text-2xl font-bold text-cyber-yellow">Achievement Unlocked!</h3>
              <div className="space-y-2">
                <h4 className="text-xl font-semibold text-cyber-blue">{showCelebration.title}</h4>
                <p className="text-muted-foreground">{showCelebration.description}</p>
              </div>
              <div className="flex items-center justify-center gap-2 p-3 bg-cyber-green/20 rounded-lg">
                <Award className="h-5 w-5 text-cyber-green" />
                <span className="text-cyber-green font-medium">
                  {showCelebration.reward.type === "xp" && `+${showCelebration.reward.value} XP`}
                  {showCelebration.reward.type === "badge" && `Badge: ${showCelebration.reward.value}`}
                  {showCelebration.reward.type === "feature" && `Unlocked: ${showCelebration.reward.value}`}
                </span>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};