import { useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Zap, Play, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface JudgeDemoModeProps {
  onDemoComplete: () => void;
}

export const JudgeDemoMode = ({ onDemoComplete }: JudgeDemoModeProps) => {
  const { toast } = useToast();
  const [demoProgress, setDemoProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState("");
  const [isRunning, setIsRunning] = useState(false);

  const runJudgeDemo = useCallback(async () => {
    setIsRunning(true);
    setDemoProgress(0);
    
    const steps = [
      "Simulating Fall Detection...",
      "Running PPG Heart Rate Scan...", 
      "Performing Neural AI Stress Analysis...",
      "Activating SOS System...",
      "Generating Emergency QR Code...",
      "Demo Complete!"
    ];
    
    for (let i = 0; i < steps.length; i++) {
      setCurrentStep(steps[i]);
      setDemoProgress((i + 1) / steps.length * 100);
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (i === steps.length - 1) {
        onDemoComplete();
        toast({
          title: "Judge Demo Complete!",
          description: "Full Lifeline AI flow demonstrated in 10 seconds",
          variant: "default"
        });
      }
    }
    
    setIsRunning(false);
  }, [onDemoComplete, toast]);

  return (
    <Card className="w-full max-w-md mx-auto p-6 bg-gradient-to-br from-cyber-purple/20 to-cyber-blue/20">
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2">
          <Zap className="w-6 h-6 text-cyber-yellow animate-pulse" />
          <h3 className="text-lg font-semibold">Judge Demo Mode</h3>
        </div>
        
        <Badge variant="outline" className="bg-cyber-yellow/10">
          Complete Flow in 10 Seconds
        </Badge>
        
        {isRunning ? (
          <div className="space-y-4">
            <div className="text-lg font-medium">{currentStep}</div>
            <Progress value={demoProgress} className="h-3" />
            <div className="text-sm text-muted-foreground">
              {Math.round(demoProgress)}% Complete
            </div>
          </div>
        ) : (
          <Button 
            onClick={runJudgeDemo} 
            size="lg"
            className="w-full bg-gradient-to-r from-cyber-blue to-cyber-purple"
          >
            <Play className="w-5 h-5 mr-2" />
            Run Judge Demo
          </Button>
        )}
        
        <div className="text-xs text-muted-foreground">
          Demonstrates: Fall Detection → PPG → Neural AI → SOS → QR Generation
        </div>
      </div>
    </Card>
  );
};