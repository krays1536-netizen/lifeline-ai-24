import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Hand, 
  Camera, 
  Flashlight, 
  Volume2, 
  Sun, 
  Target,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

interface MonitoringGuidanceProps {
  isVisible: boolean;
}

const guidanceTips = [
  {
    icon: Hand,
    title: "Stay Still",
    description: "Keep your finger completely steady on the camera lens",
    type: "essential" as const
  },
  {
    icon: Camera,
    title: "Cover Camera Lens",
    description: "Place fingertip directly over the back camera lens",
    type: "essential" as const
  },
  {
    icon: Flashlight,
    title: "Cover Flash",
    description: "Ensure the flash is also covered by your fingertip",
    type: "essential" as const
  },
  {
    icon: Sun,
    title: "Avoid Bright Light",
    description: "Move away from direct sunlight or bright lamps",
    type: "recommended" as const
  },
  {
    icon: Volume2,
    title: "Stay Quiet",
    description: "Don't talk during the 2-minute scan for best results",
    type: "recommended" as const
  },
  {
    icon: Target,
    title: "Apply Gentle Pressure",
    description: "Light pressure - don't press too hard or too soft",
    type: "recommended" as const
  }
];

export const MonitoringGuidance: React.FC<MonitoringGuidanceProps> = ({ isVisible }) => {
  if (!isVisible) return null;

  return (
    <Card className="p-6 border-primary/20 bg-gradient-subtle animate-fade-in">
      <div className="space-y-4">
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center space-x-2">
            <Target className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">
              Tips for Accurate Reading
            </h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Follow these guidelines for the most accurate heart rate measurement
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {guidanceTips.map((tip, index) => {
            const IconComponent = tip.icon;
            return (
              <div
                key={index}
                className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-300 ${
                  tip.type === 'essential' 
                    ? 'bg-red-500/5 border border-red-500/20' 
                    : 'bg-primary/5 border border-primary/20'
                }`}
              >
                <div className={`p-2 rounded-full ${
                  tip.type === 'essential' 
                    ? 'bg-red-500/10' 
                    : 'bg-primary/10'
                }`}>
                  <IconComponent className={`w-4 h-4 ${
                    tip.type === 'essential' 
                      ? 'text-red-500' 
                      : 'text-primary'
                  }`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-foreground">
                      {tip.title}
                    </span>
                    {tip.type === 'essential' && (
                      <Badge variant="destructive" className="text-xs px-1.5 py-0.5">
                        Required
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {tip.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 p-4 bg-primary/5 rounded-lg border border-primary/20">
          <div className="flex items-start space-x-3">
            <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-foreground">
                Why 2 Minutes?
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Medical-grade accuracy requires continuous monitoring to eliminate 
                movement artifacts and calculate a stable average. Professional PPG 
                devices use similar timeframes for reliable measurements.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4 p-4 bg-yellow-500/5 rounded-lg border border-yellow-500/20">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-foreground">
                Not Medical Advice
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                This technology provides wellness information only. For medical 
                concerns, always consult healthcare professionals. Emergency situations 
                require immediate medical attention.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};