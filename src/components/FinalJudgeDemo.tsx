import { useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Zap, Play, CheckCircle, Heart, Brain, Phone, QrCode, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FinalJudgeDemoProps {
  onDemoComplete: () => void;
}

export const FinalJudgeDemo = ({ onDemoComplete }: FinalJudgeDemoProps) => {
  const { toast } = useToast();
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState("");
  const [progress, setProgress] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);

  const demoSteps = [
    { 
      name: "Fall Detection", 
      icon: AlertTriangle, 
      duration: 3000, 
      message: "🚨 FALL DETECTED - Auto-triggering emergency response" 
    },
    { 
      name: "PPG Heart Scan", 
      icon: Heart, 
      duration: 4000, 
      message: "📱 PPG Scanner: 72 BPM • 98% SpO2 • 36.6°C" 
    },
    { 
      name: "Neural AI Analysis", 
      icon: Brain, 
      duration: 3000, 
      message: "🧠 Neural AI: Critical stress detected • 95% confidence" 
    },
    { 
      name: "SOS Activation", 
      icon: Phone, 
      duration: 2000, 
      message: "📞 Emergency services contacted • Mom notified" 
    },
    { 
      name: "QR Generation", 
      icon: QrCode, 
      duration: 2000, 
      message: "🔗 Emergency QR code generated and shared" 
    }
  ];

  const runJudgeDemo = useCallback(async () => {
    setIsRunning(true);
    setProgress(0);
    setCompletedSteps([]);
    setCurrentStep("Initializing LifeLine AI Guardian...");

    toast({
      title: "🏆 Judge Demo Starting",
      description: "Full emergency response flow in 30 seconds",
      variant: "default"
    });

    // Initial setup
    await new Promise(resolve => setTimeout(resolve, 1000));

    for (let i = 0; i < demoSteps.length; i++) {
      const step = demoSteps[i];
      setCurrentStep(step.name);
      
      // Show step message
      toast({
        title: step.name,
        description: step.message,
        variant: i === 0 ? "destructive" : "default"
      });

      // Animate progress for this step
      const stepProgress = ((i + 1) / demoSteps.length) * 100;
      let currentProgress = (i / demoSteps.length) * 100;
      
      const progressInterval = setInterval(() => {
        currentProgress += 2;
        setProgress(Math.min(stepProgress, currentProgress));
      }, step.duration / 50);

      await new Promise(resolve => setTimeout(resolve, step.duration));
      clearInterval(progressInterval);
      
      setProgress(stepProgress);
      setCompletedSteps(prev => [...prev, step.name]);
    }

    // Demo complete
    setCurrentStep("Emergency Response Complete!");
    setProgress(100);

    toast({
      title: "🎯 Demo Complete!",
      description: "Full LifeLine AI flow demonstrated successfully",
      variant: "default"
    });

    // Final celebration
    setTimeout(() => {
      setIsRunning(false);
      onDemoComplete();
    }, 2000);

  }, [onDemoComplete, toast]);

  return (
    <Card className="w-full max-w-lg mx-auto p-6 bg-gradient-to-br from-purple-500/10 to-blue-500/10 border-2">
      <div className="text-center space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center justify-center gap-2">
            <Zap className="w-8 h-8 text-yellow-500 animate-pulse" />
            <h2 className="text-2xl font-bold bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent">
              Judge Demo Mode
            </h2>
          </div>
          <Badge variant="outline" className="bg-yellow-500/10 text-yellow-700 border-yellow-500/20">
            Complete Emergency Flow • 30 Seconds
          </Badge>
        </div>

        {!isRunning ? (
          /* Demo Start Button */
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Demonstrate the complete LifeLine AI emergency response system
            </p>
            
            {/* Feature Preview */}
            <div className="grid grid-cols-5 gap-2 mb-4">
              {demoSteps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <div key={index} className="text-center p-2">
                    <Icon className="w-6 h-6 mx-auto mb-1 text-muted-foreground" />
                    <div className="text-xs text-muted-foreground">{step.name}</div>
                  </div>
                );
              })}
            </div>

            <Button 
              onClick={runJudgeDemo} 
              size="lg"
              className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold"
            >
              <Play className="w-6 h-6 mr-2" />
              Start Judge Demo
            </Button>
          </div>
        ) : (
          /* Demo Running */
          <div className="space-y-6">
            {/* Current Step */}
            <div className="space-y-3">
              <div className="text-xl font-semibold text-center">
                {currentStep}
              </div>
              
              {/* Progress */}
              <Progress value={progress} className="h-4" />
              <div className="text-sm text-muted-foreground">
                {Math.round(progress)}% Complete
              </div>
            </div>

            {/* Step Status */}
            <div className="space-y-2">
              {demoSteps.map((step, index) => {
                const Icon = step.icon;
                const isCompleted = completedSteps.includes(step.name);
                const isCurrent = currentStep === step.name;
                
                return (
                  <div 
                    key={index} 
                    className={`flex items-center gap-3 p-2 rounded-lg transition-all ${
                      isCompleted ? 'bg-green-500/10 text-green-700' :
                      isCurrent ? 'bg-blue-500/10 text-blue-700' :
                      'text-muted-foreground'
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <Icon className={`w-5 h-5 ${isCurrent ? 'animate-pulse' : ''}`} />
                    )}
                    <span className="font-medium">{step.name}</span>
                    {isCompleted && (
                      <Badge variant="outline" className="ml-auto bg-green-500/10 text-green-700 border-green-500/20">
                        ✓
                      </Badge>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Demo Stats */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t">
              <div className="text-center">
                <div className="text-lg font-bold text-blue-500">5</div>
                <div className="text-xs text-muted-foreground">Systems</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-green-500">30</div>
                <div className="text-xs text-muted-foreground">Seconds</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-purple-500">100%</div>
                <div className="text-xs text-muted-foreground">Automated</div>
              </div>
            </div>
          </div>
        )}

        {/* Demo Description */}
        <div className="text-xs text-muted-foreground bg-muted/20 p-3 rounded-lg">
          <strong>Demo Flow:</strong> Fall Detection → PPG Vitals → Neural AI Stress → Emergency SOS → QR Emergency Profile
        </div>
      </div>
    </Card>
  );
};