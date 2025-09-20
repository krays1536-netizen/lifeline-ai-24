import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Brain, CheckCircle, AlertTriangle } from "lucide-react";
import { ProductionNeuroAI } from "@/components/ProductionNeuroAI";
import { AdvancedNeuralAI } from "@/components/AdvancedNeuralAI";
import { useToast } from "@/hooks/use-toast";

export const NeuralAnalysisDemo = () => {
  const { toast } = useToast();
  const [selectedComponent, setSelectedComponent] = useState<"production" | "advanced">("production");
  const [testResults, setTestResults] = useState<{
    stressDetections: number;
    conditionDetections: number;
    emergencyTriggers: number;
  }>({
    stressDetections: 0,
    conditionDetections: 0,
    emergencyTriggers: 0
  });

  const handleStressDetected = (level: string) => {
    setTestResults(prev => ({
      ...prev,
      stressDetections: prev.stressDetections + 1
    }));
    
    toast({
      title: `Stress Level: ${level.toUpperCase()}`,
      description: "Neural AI detected stress level change",
      variant: level === "critical" ? "destructive" : "default"
    });
  };

  const handleConditionDetected = (condition: string, confidence: number) => {
    setTestResults(prev => ({
      ...prev,
      conditionDetections: prev.conditionDetections + 1
    }));
    
    toast({
      title: "Condition Detected",
      description: `${condition} (${confidence}% confidence)`,
      variant: confidence > 80 ? "destructive" : "default"
    });
  };

  const handleEmergencyTrigger = () => {
    setTestResults(prev => ({
      ...prev,
      emergencyTriggers: prev.emergencyTriggers + 1
    }));
    
    toast({
      title: "🚨 Emergency Triggered",
      description: "Critical condition detected by Neural AI",
      variant: "destructive"
    });
  };

  const resetTestResults = () => {
    setTestResults({
      stressDetections: 0,
      conditionDetections: 0,
      emergencyTriggers: 0
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-4">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Brain className="w-6 h-6 text-cyber-purple" />
            <h2 className="text-xl font-semibold">Neural Analysis Demo</h2>
          </div>
          <p className="text-muted-foreground">
            Test both neural analysis components for reliability
          </p>
        </div>
      </Card>

      {/* Component Selector */}
      <Card className="p-4">
        <h3 className="font-semibold mb-3">Select Neural Component</h3>
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant={selectedComponent === "production" ? "default" : "outline"}
            onClick={() => setSelectedComponent("production")}
          >
            Production NeuroAI
          </Button>
          <Button
            variant={selectedComponent === "advanced" ? "default" : "outline"}
            onClick={() => setSelectedComponent("advanced")}
          >
            Advanced NeuroAI
          </Button>
        </div>
      </Card>

      {/* Test Results */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold">Test Results</h3>
          <Button variant="outline" size="sm" onClick={resetTestResults}>
            Reset
          </Button>
        </div>
        
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="space-y-1">
            <div className="text-2xl font-bold text-cyber-blue">
              {testResults.stressDetections}
            </div>
            <div className="text-sm text-muted-foreground">
              Stress Detections
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-bold text-cyber-yellow">
              {testResults.conditionDetections}
            </div>
            <div className="text-sm text-muted-foreground">
              Condition Detections
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-bold text-cyber-red">
              {testResults.emergencyTriggers}
            </div>
            <div className="text-sm text-muted-foreground">
              Emergency Triggers
            </div>
          </div>
        </div>

        {/* Status */}
        <div className="mt-4">
          {testResults.stressDetections > 0 || testResults.conditionDetections > 0 ? (
            <Alert className="border-green-500 bg-green-500/10">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Neural analysis is working correctly! Detected {testResults.stressDetections + testResults.conditionDetections} events.
              </AlertDescription>
            </Alert>
          ) : (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Start neural analysis to test functionality. Both components include fallback simulation modes.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </Card>

      {/* Neural Component */}
      <div>
        {selectedComponent === "production" ? (
          <ProductionNeuroAI
            onStressDetected={handleStressDetected}
            onConditionDetected={handleConditionDetected}
          />
        ) : (
          <AdvancedNeuralAI
            onStressDetected={handleStressDetected}
            onConditionDetected={handleConditionDetected}
            onEmergencyTrigger={handleEmergencyTrigger}
          />
        )}
      </div>

      {/* Instructions */}
      <Card className="p-4 bg-muted/20">
        <h3 className="font-semibold mb-2">Testing Instructions</h3>
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>• Click "Start NeuroAI Scan" or "Start Neural Analysis" to begin</p>
          <p>• If camera/microphone permissions are denied, components will use simulation mode</p>
          <p>• Both components have robust error handling and fallback mechanisms</p>
          <p>• Watch for stress detections, condition alerts, and emergency triggers</p>
          <p>• Production component focuses on reliability, Advanced component has more features</p>
        </div>
      </Card>
    </div>
  );
};