import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Info, 
  Lightbulb, 
  Eye, 
  Activity, 
  Heart, 
  Smartphone,
  ChevronRight,
  ChevronLeft,
  Play
} from 'lucide-react';

interface HowItWorksModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const steps = [
  {
    title: "Light Emission",
    description: "Camera flash or green LED shines light through your fingertip",
    icon: Lightbulb,
    animation: "pulse",
    details: "The camera's flash or LED emits bright light that penetrates your skin and reaches the blood vessels underneath."
  },
  {
    title: "Light Absorption", 
    description: "Blood absorbs light differently as your heart pumps",
    icon: Activity,
    animation: "bounce",
    details: "Oxygenated blood absorbs more light than deoxygenated blood. As your heart beats, blood volume changes create variations in light absorption."
  },
  {
    title: "Light Detection",
    description: "Camera sensor measures the reflected light changes",
    icon: Eye,
    animation: "ping",
    details: "Your phone's camera sensor acts as a photodetector, capturing subtle changes in light intensity reflected from your fingertip."
  },
  {
    title: "Blood Volume Tracking",
    description: "AI creates waveform patterns from blood flow variations",
    icon: Activity,
    animation: "pulse",
    details: "Advanced algorithms analyze the light intensity changes to create a photoplethysmogram (PPG) - a waveform showing blood volume changes."
  },
  {
    title: "Heart Rate Calculation",
    description: "BPM detected from waveform peaks and valleys",
    icon: Heart,
    animation: "bounce",
    details: "By counting the peaks in the PPG waveform over time, we calculate your beats per minute (BPM) with medical-grade accuracy."
  }
];

export const HowItWorksModal: React.FC<HowItWorksModalProps> = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const step = steps[currentStep];
  const IconComponent = step.icon;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-background/95 backdrop-blur-sm border border-primary/20">
        <DialogHeader>
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-full bg-primary/10">
              <Info className="w-6 h-6 text-primary" />
            </div>
            <DialogTitle className="text-xl font-bold text-foreground">
              How PPG Technology Works
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Progress Indicator */}
          <div className="flex items-center justify-between">
            <div className="flex space-x-2">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index <= currentStep 
                      ? 'bg-primary shadow-glow' 
                      : 'bg-muted'
                  }`}
                />
              ))}
            </div>
            <Badge variant="outline" className="text-xs">
              {currentStep + 1} / {steps.length}
            </Badge>
          </div>

          {/* Current Step */}
          <Card className="p-8 border-primary/20 bg-gradient-subtle">
            <div className="text-center space-y-6">
              {/* Animated Icon */}
              <div className="relative mx-auto w-24 h-24">
                <div className={`absolute inset-0 rounded-full bg-primary/10 animate-${step.animation}`} />
                <div className="relative flex items-center justify-center w-full h-full">
                  <IconComponent className="w-12 h-12 text-primary" />
                </div>
                
                {/* Light rays animation for Light Emission */}
                {currentStep === 0 && (
                  <div className="absolute inset-0">
                    {[...Array(8)].map((_, i) => (
                      <div
                        key={i}
                        className="absolute w-1 h-8 bg-gradient-to-t from-primary/60 to-transparent animate-pulse"
                        style={{
                          transform: `rotate(${i * 45}deg)`,
                          transformOrigin: 'bottom center',
                          bottom: '50%',
                          left: '50%',
                          marginLeft: '-2px',
                          animationDelay: `${i * 0.2}s`
                        }}
                      />
                    ))}
                  </div>
                )}

                {/* Waveform animation for Blood Volume Tracking */}
                {currentStep === 3 && (
                  <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 w-32 h-8">
                    <svg className="w-full h-full">
                      <path
                        d="M0,20 Q8,10 16,20 T32,20 Q40,10 48,20 T64,20 Q72,10 80,20 T96,20 Q104,10 112,20 T128,20"
                        stroke="hsl(var(--primary))"
                        strokeWidth="2"
                        fill="none"
                        className="animate-pulse"
                      />
                    </svg>
                  </div>
                )}

                {/* Heartbeat animation for Heart Rate Calculation */}
                {currentStep === 4 && (
                  <div className="absolute -top-4 -right-4">
                    <div className="w-8 h-8 bg-red-500/20 rounded-full animate-ping" />
                    <Heart className="absolute top-1.5 left-1.5 w-5 h-5 text-red-500 animate-pulse" />
                  </div>
                )}
              </div>

              {/* Step Content */}
              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-foreground">
                  {step.title}
                </h3>
                <p className="text-lg text-muted-foreground">
                  {step.description}
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-md mx-auto">
                  {step.details}
                </p>
              </div>

              {/* Demo Visual */}
              <div className="bg-black/20 rounded-lg p-4 max-w-sm mx-auto">
                <div className="flex items-center justify-center space-x-4">
                  <Smartphone className="w-8 h-8 text-muted-foreground" />
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-primary to-transparent" />
                  <div className="w-8 h-8 rounded-full border-2 border-primary/50 flex items-center justify-center">
                    <div className="w-4 h-4 bg-primary/30 rounded-full animate-pulse" />
                  </div>
                </div>
                <div className="text-xs text-center mt-2 text-muted-foreground">
                  Phone Camera + Fingertip = Heart Rate
                </div>
              </div>
            </div>
          </Card>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 0}
              className="flex items-center space-x-2"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </Button>

            {currentStep === steps.length - 1 ? (
              <Button onClick={onClose} className="flex items-center space-x-2">
                <Play className="w-4 h-4" />
                <span>Start Monitoring</span>
              </Button>
            ) : (
              <Button onClick={nextStep} className="flex items-center space-x-2">
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </Button>
            )}
          </div>

          {/* Trust & Accuracy Notice */}
          <Card className="p-4 border-primary/20 bg-primary/5">
            <div className="text-center space-y-2">
              <Badge variant="secondary" className="bg-primary/10 text-primary">
                Medical-Grade Technology
              </Badge>
              <p className="text-sm text-muted-foreground">
                PPG (Photoplethysmography) is a proven medical technique used in hospitals 
                and fitness devices worldwide. Your privacy is protected - all analysis 
                happens locally on your device.
              </p>
            </div>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};