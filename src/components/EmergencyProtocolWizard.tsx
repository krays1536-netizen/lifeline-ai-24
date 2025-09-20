import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  AlertTriangle, 
  Phone, 
  MapPin, 
  Clock, 
  Heart, 
  Stethoscope,
  UserCheck,
  Navigation,
  ShieldAlert,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react';

interface EmergencyStep {
  id: string;
  title: string;
  description: string;
  action: string;
  duration: number; // seconds
  icon: React.ComponentType<any>;
  critical: boolean;
}

interface EmergencyScenario {
  id: string;
  name: string;
  steps: EmergencyStep[];
  estimatedTime: number;
}

const emergencyScenarios: EmergencyScenario[] = [
  {
    id: 'cardiac_event',
    name: 'Cardiac Event',
    estimatedTime: 300, // 5 minutes
    steps: [
      {
        id: 'assess_consciousness',
        title: 'Check Consciousness',
        description: 'Tap shoulders and shout "Are you okay?"',
        action: 'If no response, continue to next step',
        duration: 10,
        icon: UserCheck,
        critical: true
      },
      {
        id: 'call_emergency',
        title: 'Call Emergency Services',
        description: 'Dial 112 (Kuwait Emergency) immediately',
        action: 'Stay on the line and follow dispatcher instructions',
        duration: 30,
        icon: Phone,
        critical: true
      },
      {
        id: 'check_pulse',
        title: 'Check Pulse',
        description: 'Feel for pulse on neck (carotid artery) for 10 seconds',
        action: 'If no pulse found, prepare for CPR',
        duration: 15,
        icon: Heart,
        critical: true
      },
      {
        id: 'cpr_position',
        title: 'Position for CPR',
        description: 'Place person on firm surface, tilt head back, lift chin',
        action: 'Position hands on center of chest, between nipples',
        duration: 20,
        icon: Stethoscope,
        critical: true
      },
      {
        id: 'chest_compressions',
        title: 'Chest Compressions',
        description: 'Push hard and fast 2 inches deep, 100-120 per minute',
        action: 'Count: 1-2-3... up to 30 compressions',
        duration: 120,
        icon: Heart,
        critical: true
      }
    ]
  },
  {
    id: 'severe_bleeding',
    name: 'Severe Bleeding',
    estimatedTime: 180, // 3 minutes
    steps: [
      {
        id: 'safety_check',
        title: 'Ensure Safety',
        description: 'Check the area for hazards before approaching',
        action: 'Make sure you and the victim are safe',
        duration: 10,
        icon: ShieldAlert,
        critical: true
      },
      {
        id: 'call_help',
        title: 'Call for Help',
        description: 'Call 112 immediately for severe bleeding',
        action: 'Give your exact location',
        duration: 20,
        icon: Phone,
        critical: true
      },
      {
        id: 'direct_pressure',
        title: 'Apply Direct Pressure',
        description: 'Press firmly on wound with clean cloth or bandage',
        action: 'Do not remove cloth if it becomes soaked with blood',
        duration: 60,
        icon: Heart,
        critical: true
      }
    ]
  }
];

interface EmergencyProtocolWizardProps {
  scenario?: string;
  autoStart?: boolean;
}

export const EmergencyProtocolWizard: React.FC<EmergencyProtocolWizardProps> = ({ 
  scenario = 'cardiac_event',
  autoStart = false 
}) => {
  const [currentScenario, setCurrentScenario] = useState<EmergencyScenario>(
    emergencyScenarios.find(s => s.id === scenario) || emergencyScenarios[0]
  );
  const [currentStep, setCurrentStep] = useState(0);
  const [isActive, setIsActive] = useState(autoStart);
  const [stepTimer, setStepTimer] = useState(0);
  const [totalElapsed, setTotalElapsed] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isActive && currentStep < currentScenario.steps.length) {
      interval = setInterval(() => {
        setStepTimer(prev => prev + 1);
        setTotalElapsed(prev => prev + 1);
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, currentStep, currentScenario.steps.length]);

  const startProtocol = () => {
    setIsActive(true);
    setCurrentStep(0);
    setStepTimer(0);
    setTotalElapsed(0);
  };

  const pauseProtocol = () => {
    setIsActive(false);
  };

  const nextStep = () => {
    if (currentStep < currentScenario.steps.length - 1) {
      setCurrentStep(prev => prev + 1);
      setStepTimer(0);
    } else {
      setIsActive(false);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
      setStepTimer(0);
    }
  };

  const resetProtocol = () => {
    setIsActive(false);
    setCurrentStep(0);
    setStepTimer(0);
    setTotalElapsed(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const isProtocolComplete = currentStep >= currentScenario.steps.length;
  const currentStepData = currentScenario.steps[currentStep];
  const progressPercentage = ((currentStep + 1) / currentScenario.steps.length) * 100;

  return (
    <div className="space-y-6">
      {/* Protocol Header */}
      <Card className="p-6 border-red-500/20 bg-gradient-to-r from-red-500/5 to-orange-500/5">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-full bg-red-500/10">
                <AlertTriangle className="w-6 h-6 text-red-500 animate-pulse" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-red-600">Emergency Protocol</h3>
                <p className="text-sm text-muted-foreground">
                  {currentScenario.name} Response Guide
                </p>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-2xl font-mono font-bold text-red-500">
                {formatTime(totalElapsed)}
              </div>
              <div className="text-xs text-muted-foreground">
                Est. {Math.floor(currentScenario.estimatedTime / 60)}:{(currentScenario.estimatedTime % 60).toString().padStart(2, '0')}
              </div>
            </div>
          </div>

          {/* Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Protocol Progress</span>
              <span>Step {Math.min(currentStep + 1, currentScenario.steps.length)} of {currentScenario.steps.length}</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
        </div>
      </Card>

      {/* Current Step */}
      {!isProtocolComplete && currentStepData && (
        <Card className={`p-6 border-2 transition-all duration-300 ${
          currentStepData.critical 
            ? 'border-red-500/50 bg-red-500/5 animate-pulse' 
            : 'border-primary/20 bg-primary/5'
        }`}>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`p-3 rounded-full ${
                  currentStepData.critical ? 'bg-red-500/10' : 'bg-primary/10'
                }`}>
                  <currentStepData.icon className={`w-6 h-6 ${
                    currentStepData.critical ? 'text-red-500' : 'text-primary'
                  }`} />
                </div>
                <div>
                  <h4 className="text-xl font-bold">{currentStepData.title}</h4>
                  {currentStepData.critical && (
                    <Badge variant="destructive" className="mt-1">
                      CRITICAL STEP
                    </Badge>
                  )}
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-lg font-mono font-bold">
                  {formatTime(stepTimer)}
                </div>
                <div className="text-xs text-muted-foreground">
                  Target: {formatTime(currentStepData.duration)}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="p-4 bg-background/30 rounded-lg">
                <h5 className="font-medium text-sm mb-2">What to do:</h5>
                <p className="text-sm leading-relaxed">
                  {currentStepData.description}
                </p>
              </div>
              
              <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                <h5 className="font-medium text-sm mb-2">Action required:</h5>
                <p className="text-sm font-medium">
                  {currentStepData.action}
                </p>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Protocol Complete */}
      {isProtocolComplete && (
        <Card className="p-6 border-green-500/20 bg-green-500/5">
          <div className="text-center space-y-4">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
            <h3 className="text-xl font-bold text-green-600">Protocol Completed</h3>
            <p className="text-sm text-muted-foreground">
              Emergency protocol completed in {formatTime(totalElapsed)}
            </p>
            <div className="space-y-2">
              <Badge variant="outline" className="border-green-500/50 text-green-600">
                Professional help should be arriving soon
              </Badge>
              <p className="text-xs text-muted-foreground">
                Continue monitoring the situation until emergency services arrive
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Controls */}
      <Card className="p-4 border-border/50 bg-card/50">
        <div className="flex justify-center space-x-3">
          {!isActive && !isProtocolComplete && (
            <Button 
              onClick={startProtocol}
              className="bg-red-600 hover:bg-red-700 text-white"
              size="lg"
            >
              <Play className="w-4 h-4 mr-2" />
              Start Emergency Protocol
            </Button>
          )}
          
          {isActive && !isProtocolComplete && (
            <>
              <Button variant="outline" onClick={pauseProtocol} size="lg">
                <Pause className="w-4 h-4 mr-2" />
                Pause
              </Button>
              
              <Button variant="outline" onClick={prevStep} disabled={currentStep === 0}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>
              
              <Button onClick={nextStep} className="bg-red-600 hover:bg-red-700 text-white">
                <ArrowRight className="w-4 h-4 mr-2" />
                {currentStep === currentScenario.steps.length - 1 ? 'Complete' : 'Next Step'}
              </Button>
            </>
          )}
          
          {!isActive && isProtocolComplete && (
            <Button variant="outline" onClick={resetProtocol} size="lg">
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset Protocol
            </Button>
          )}
        </div>
      </Card>

      {/* Emergency Contacts Quick Access */}
      <Card className="p-4 border-red-500/20 bg-red-500/5">
        <div className="space-y-3">
          <h4 className="font-medium text-sm flex items-center space-x-2">
            <Phone className="w-4 h-4 text-red-500" />
            <span>Kuwait Emergency Numbers</span>
          </h4>
          
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" size="sm" className="border-red-500/20 hover:bg-red-500/10">
              <Phone className="w-3 h-3 mr-1" />
              112 - Emergency
            </Button>
            <Button variant="outline" size="sm" className="border-red-500/20 hover:bg-red-500/10">
              <MapPin className="w-3 h-3 mr-1" />
              Location Services
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};