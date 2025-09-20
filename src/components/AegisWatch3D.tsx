import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { 
  Heart, 
  Activity, 
  Thermometer, 
  Zap, 
  Shield, 
  Brain,
  Mic,
  Camera,
  Wifi,
  Battery,
  Settings,
  MapPin,
  PhoneCall
} from "lucide-react";

interface AegisWatch3DProps {
  vitals: {
    heartRate: number;
    spO2: number;
    temperature: number;
    motionStatus: string;
  };
  riskScore: number;
  isEmergencyActive: boolean;
  onFeatureToggle: (feature: string, enabled: boolean) => void;
}

export const AegisWatch3D = ({ vitals, riskScore, isEmergencyActive, onFeatureToggle }: AegisWatch3DProps) => {
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [isInteracting, setIsInteracting] = useState(false);
  const [activeFeatures, setActiveFeatures] = useState({
    heartRate: true,
    neural: false,
    environmental: false,
    voice: false,
    camera: false,
    emergency: true
  });

  // Auto-rotate when not interacting
  useEffect(() => {
    if (!isInteracting) {
      const interval = setInterval(() => {
        setRotation(prev => ({
          x: prev.x,
          y: (prev.y + 0.5) % 360
        }));
      }, 50);
      return () => clearInterval(interval);
    }
  }, [isInteracting]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsInteracting(true);
    const startX = e.clientX;
    const startY = e.clientY;
    const startRotation = { ...rotation };

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;
      
      setRotation({
        x: Math.max(-60, Math.min(60, startRotation.x - deltaY * 0.5)),
        y: (startRotation.y + deltaX * 0.5) % 360
      });
    };

    const handleMouseUp = () => {
      setIsInteracting(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6">
      {/* Watch Hub Header */}
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-cyber-blue to-cyber-purple bg-clip-text text-transparent mb-2">
          AEGIS WATCH HUB
        </h1>
        <p className="text-muted-foreground">Advanced Life Guardian System</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* 3D Watch Display */}
        <Card className="p-6 bg-gradient-to-br from-card to-card/50 border-cyber-blue/30">
          <div className="text-center mb-4">
            <h3 className="text-lg font-semibold text-cyber-blue">3D Watch Interface</h3>
            <p className="text-xs text-muted-foreground">Click and drag to rotate</p>
          </div>
          
          <div 
            className="relative h-80 w-80 mx-auto cursor-grab active:cursor-grabbing"
            onMouseDown={handleMouseDown}
            style={{ perspective: '1000px' }}
          >
            {/* Watch Body */}
            <div 
              className="absolute inset-0 transition-transform duration-100"
              style={{
                transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
                transformStyle: 'preserve-3d'
              }}
            >
              {/* Watch Face */}
              <div className="absolute inset-4 bg-black rounded-full border-4 border-muted shadow-2xl"
                   style={{ transform: 'translateZ(20px)' }}>
                
                {/* Screen Content */}
                <div className="relative w-full h-full rounded-full overflow-hidden bg-gradient-to-br from-background to-card">
                  {/* Digital Display */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
                    <div className="text-2xl font-bold text-cyber-blue mb-2">
                      {new Date().toLocaleTimeString('en-US', { 
                        hour12: false, 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </div>
                    
                    {/* Live Vitals Ring */}
                    <div className="relative w-32 h-32 mb-2">
                      <svg className="absolute inset-0 w-full h-full -rotate-90">
                        <circle cx="64" cy="64" r="60" fill="none" stroke="hsl(var(--muted))" strokeWidth="2" />
                        <circle
                          cx="64" cy="64" r="60" fill="none" stroke="hsl(var(--cyber-red))" strokeWidth="3"
                          strokeDasharray={`${(vitals.heartRate / 200) * 377} 377`}
                          className="transition-all duration-1000"
                        />
                        <circle cx="64" cy="64" r="50" fill="none" stroke="hsl(var(--muted))" strokeWidth="2" />
                        <circle
                          cx="64" cy="64" r="50" fill="none" stroke="hsl(var(--cyber-blue))" strokeWidth="3"
                          strokeDasharray={`${(vitals.spO2 / 100) * 314} 314`}
                          className="transition-all duration-1000"
                        />
                      </svg>
                      
                      {/* Center Values */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <div className="text-lg font-bold text-cyber-red">{Math.round(vitals.heartRate)}</div>
                        <div className="text-xs text-cyber-blue">{Math.round(vitals.spO2)}%</div>
                      </div>
                    </div>
                    
                    {/* Status Indicator */}
                    <div className={cn(
                      "text-xs font-semibold px-2 py-1 rounded-full",
                      riskScore >= 6 ? "bg-cyber-red/20 text-cyber-red" :
                      riskScore >= 3 ? "bg-cyber-orange/20 text-cyber-orange" :
                      "bg-cyber-green/20 text-cyber-green"
                    )}>
                      {riskScore >= 6 ? "HIGH RISK" : riskScore >= 3 ? "MODERATE" : "SAFE"}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Watch Band */}
              <div className="absolute top-1/2 -left-8 w-8 h-16 bg-muted rounded-l-lg"
                   style={{ transform: 'translateY(-50%) translateZ(10px)' }} />
              <div className="absolute top-1/2 -right-8 w-8 h-16 bg-muted rounded-r-lg"
                   style={{ transform: 'translateY(-50%) translateZ(10px)' }} />
            </div>
          </div>
        </Card>

        {/* Control Panel */}
        <div className="space-y-4">
          <Card className="p-4">
            <h3 className="font-semibold mb-3">System Status</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Battery className="w-4 h-4 text-cyber-green" />
                  <span>Battery</span>
                </div>
                <Progress value={87} className="h-2" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Wifi className="w-4 h-4 text-cyber-blue" />
                  <span>Connection</span>
                </div>
                <Progress value={95} className="h-2" />
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};