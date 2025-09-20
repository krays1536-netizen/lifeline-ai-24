import { useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Zap, Play, CheckCircle, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ExhibitionJudgeDemoProps {
  onDemoComplete: () => void;
}

const demoSteps = [
  {
    title: "🛡️ Fall Detected",
    description: "3G impact + orientation flip + stillness detected",
    duration: 3000,
    status: "Fall detection algorithms activated"
  },
  {
    title: "⌚ Watch Vibrates",
    description: "Smart watch alerts user with vibration pattern",
    duration: 2000,
    status: "Physical alert system engaged"
  },
  {
    title: "🤖 Guardian AI Speaks",
    description: "'Are you okay? Do you need SOS or can you get up?'",
    duration: 4000,
    status: "Voice recognition listening for response"
  },
  {
    title: "🎥 Witness Cam Activated",
    description: "Camera starts recording with 10s pre-buffer",
    duration: 2000,
    status: "Evidence collection system active"
  },
  {
    title: "🚨 SOS System Triggered",
    description: "No response - Emergency protocols activated",
    duration: 3000,
    status: "Alert dispatched to emergency contacts"
  },
  {
    title: "📱 SMS to Family",
    description: "Location + QR code sent to emergency contacts",
    duration: 2000,
    status: "Family notification system deployed"
  },
  {
    title: "📊 Incident Pack Generated",
    description: "Complete emergency profile with vitals ready",
    duration: 3000,
    status: "Medical data package compiled"
  },
  {
    title: "🏥 QR Code Generated",
    description: "First responders can scan for instant medical info",
    duration: 2000,
    status: "Emergency responder access enabled"
  },
  {
    title: "✅ Demo Complete!",
    description: "Full Lifeline AI emergency response demonstrated",
    duration: 1000,
    status: "Judge evaluation ready"
  }
];

export const ExhibitionJudgeDemo = ({ onDemoComplete }: ExhibitionJudgeDemoProps) => {
  const { toast } = useToast();
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const runJudgeDemo = useCallback(async () => {
    setIsRunning(true);
    setCurrentStep(0);
    setProgress(0);
    setCompletedSteps([]);
    
    toast({
      title: "🏆 Judge Demo Started",
      description: "30-second Lifeline AI demonstration",
      variant: "default"
    });
    
    // Execute each step with realistic timing
    for (let i = 0; i < demoSteps.length; i++) {
      const step = demoSteps[i];
      setCurrentStep(i);
      
      // Update progress smoothly during step
      const stepProgress = ((i + 1) / demoSteps.length) * 100;
      let currentProgress = (i / demoSteps.length) * 100;
      
      const progressInterval = setInterval(() => {
        currentProgress += (stepProgress - (i / demoSteps.length) * 100) / (step.duration / 100);
        if (currentProgress >= stepProgress) {
          currentProgress = stepProgress;
          clearInterval(progressInterval);
        }
        setProgress(currentProgress);
      }, 100);
      
      // Show step notification
      if (i < demoSteps.length - 1) {
        toast({
          title: step.title,
          description: step.description,
          variant: i === 4 ? "destructive" : "default" // SOS step is destructive
        });
      }
      
      await new Promise(resolve => setTimeout(resolve, step.duration));
      
      // Mark step as completed
      setCompletedSteps(prev => [...prev, i]);
      clearInterval(progressInterval);
    }
    
    setIsRunning(false);
    onDemoComplete();
    
    // Final success toast
    toast({
      title: "🎯 Judge Demo Complete!",
      description: "Lifeline AI emergency response flow demonstrated successfully",
      variant: "default"
    });
  }, [onDemoComplete]);

  return (
    <Card className="w-full max-w-2xl mx-auto p-6 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
      <div className="text-center space-y-6">
        {/* Header */}
        <div className="flex items-center justify-center gap-3">
          <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full">
            <Zap className="w-8 h-8 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Judge Demo Mode
            </h3>
            <p className="text-sm text-muted-foreground">
              Complete Lifeline AI Emergency Response Flow
            </p>
          </div>
        </div>
        
        <Badge variant="outline" className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-lg px-4 py-2">
          ⏱️ 30 Second Demonstration
        </Badge>
        
        {!isRunning ? (
          <>
            {/* Demo Preview */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold">Demo Flow Preview</h4>
              <div className="grid gap-2 text-left">
                {demoSteps.slice(0, -1).map((step, index) => (
                  <div key={index} className="flex items-center gap-3 p-2 rounded-lg bg-white/50 dark:bg-gray-800/50">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">{step.title}</div>
                      <div className="text-xs text-muted-foreground">{step.description}</div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                ))}
              </div>
            </div>
            
            <Button 
              onClick={runJudgeDemo} 
              size="lg"
              className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-lg py-6"
            >
              <Play className="w-6 h-6 mr-3" />
              Start Judge Demo
            </Button>
          </>
        ) : (
          <>
            {/* Running Demo Display */}
            <div className="space-y-6">
              {/* Current Step Highlight */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border-2 border-blue-200 dark:border-blue-800">
                <div className="text-2xl mb-2">{demoSteps[currentStep]?.title}</div>
                <div className="text-lg text-muted-foreground mb-3">
                  {demoSteps[currentStep]?.description}
                </div>
                <Badge variant="secondary" className="text-sm">
                  {demoSteps[currentStep]?.status}
                </Badge>
              </div>
              
              {/* Progress */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-lg font-semibold">
                  <span>Demo Progress</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-4" />
                <div className="text-sm text-muted-foreground">
                  Step {currentStep + 1} of {demoSteps.length}
                </div>
              </div>
              
              {/* Completed Steps */}
              <div className="space-y-2">
                <h5 className="text-sm font-medium text-muted-foreground">Completed Steps:</h5>
                <div className="grid gap-1">
                  {completedSteps.map((stepIndex) => (
                    <div key={stepIndex} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-green-700 dark:text-green-300">
                        {demoSteps[stepIndex]?.title}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
        
        {/* Demo Summary */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 rounded-lg p-4">
          <div className="text-sm text-center text-muted-foreground space-y-1">
            <p><strong>Demonstrates:</strong></p>
            <p>Fall Detection → Watch Vibration → Guardian AI → Camera → SOS → SMS → QR Code</p>
            <p><strong>Judge Evaluation Ready</strong> ⭐</p>
          </div>
        </div>
      </div>
    </Card>
  );
};