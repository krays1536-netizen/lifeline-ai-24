import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { 
  Heart, 
  Activity, 
  Thermometer, 
  Droplets, 
  Brain, 
  Eye, 
  RotateCcw,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Settings,
  Zap
} from "lucide-react";
import { cn } from "@/lib/utils";

interface HealthVisualizationProps {
  vitals: {
    heartRate: number;
    spO2: number;
    temperature: number;
    bloodPressure: { systolic: number; diastolic: number };
    respiratoryRate: number;
    hvr: number; // Heart Rate Variability
  };
  onVitalSelect?: (vital: string) => void;
}

export const InteractiveHealthVisualization = ({ vitals, onVitalSelect }: HealthVisualizationProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [selectedVital, setSelectedVital] = useState<string>("heartRate");
  const [zoom, setZoom] = useState([100]);
  const [rotationX, setRotationX] = useState([0]);
  const [rotationY, setRotationY] = useState([0]);
  const [animationSpeed, setAnimationSpeed] = useState([1]);
  const [showWaveforms, setShowWaveforms] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);

  // 3D Heart Animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let time = 0;

    const animate = () => {
      if (!isPlaying) return;

      time += 0.05 * animationSpeed[0];
      
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Set up 3D-like effect
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const scale = zoom[0] / 100;

      // Create gradient
      const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 200 * scale);
      gradient.addColorStop(0, 'hsl(0, 90%, 60%)');
      gradient.addColorStop(0.5, 'hsl(0, 70%, 50%)');
      gradient.addColorStop(1, 'hsl(0, 50%, 30%)');

      // Heart beating animation
      const heartBeat = Math.sin(time * (vitals.heartRate / 60) * 8) * 0.2 + 1;
      const heartScale = scale * heartBeat;

      // Draw 3D heart shape
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate((rotationX[0] * Math.PI) / 180);
      ctx.scale(heartScale, heartScale);

      // Heart shape path
      ctx.beginPath();
      ctx.fillStyle = gradient;
      
      // Draw heart using bezier curves
      const heartPath = new Path2D();
      heartPath.moveTo(0, -30);
      heartPath.bezierCurveTo(-50, -80, -150, -40, -75, 10);
      heartPath.bezierCurveTo(-75, 40, 0, 75, 0, 75);
      heartPath.bezierCurveTo(0, 75, 75, 40, 75, 10);
      heartPath.bezierCurveTo(150, -40, 50, -80, 0, -30);
      
      ctx.fill(heartPath);

      // Add glow effect
      ctx.shadowColor = 'hsl(0, 90%, 60%)';
      ctx.shadowBlur = 20;
      ctx.fill(heartPath);

      ctx.restore();

      // Draw vital signs overlay
      if (showWaveforms) {
        drawVitalWaveforms(ctx, time);
      }

      // Draw vital indicators
      drawVitalIndicators(ctx, centerX, centerY, scale);

      if (isPlaying) {
        animationId = requestAnimationFrame(animate);
      }
    };

    animate();

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [isPlaying, vitals, zoom, rotationX, rotationY, animationSpeed, showWaveforms]);

  const drawVitalWaveforms = (ctx: CanvasRenderingContext2D, time: number) => {
    const width = ctx.canvas.width;
    const height = ctx.canvas.height;

    // ECG-like waveform for heart rate
    ctx.strokeStyle = 'hsl(195, 100%, 55%)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    for (let x = 0; x < width; x += 2) {
      const normalizedX = (x / width) * 4 * Math.PI;
      const heartWave = Math.sin(normalizedX + time * (vitals.heartRate / 60) * 4) * 20;
      const ecgSpike = x % (width / 4) < 5 ? Math.sin(normalizedX * 10) * 40 : 0;
      const y = height * 0.8 + heartWave + ecgSpike;
      
      if (x === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.stroke();

    // SpO2 waveform
    ctx.strokeStyle = 'hsl(142, 90%, 55%)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    
    for (let x = 0; x < width; x += 3) {
      const normalizedX = (x / width) * 2 * Math.PI;
      const spO2Wave = Math.sin(normalizedX + time * 2) * (vitals.spO2 / 100) * 15;
      const y = height * 0.15 + spO2Wave;
      
      if (x === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.stroke();
  };

  const drawVitalIndicators = (ctx: CanvasRenderingContext2D, centerX: number, centerY: number, scale: number) => {
    const indicators = [
      { 
        vital: 'HR', 
        value: vitals.heartRate, 
        unit: 'bpm', 
        color: 'hsl(0, 90%, 60%)', 
        x: centerX - 150 * scale, 
        y: centerY - 100 * scale 
      },
      { 
        vital: 'SpO₂', 
        value: vitals.spO2, 
        unit: '%', 
        color: 'hsl(142, 90%, 55%)', 
        x: centerX + 150 * scale, 
        y: centerY - 100 * scale 
      },
      { 
        vital: 'Temp', 
        value: vitals.temperature, 
        unit: '°C', 
        color: 'hsl(25, 100%, 65%)', 
        x: centerX - 150 * scale, 
        y: centerY + 100 * scale 
      },
      { 
        vital: 'BP', 
        value: `${vitals.bloodPressure.systolic}/${vitals.bloodPressure.diastolic}`, 
        unit: 'mmHg', 
        color: 'hsl(270, 95%, 65%)', 
        x: centerX + 150 * scale, 
        y: centerY + 100 * scale 
      }
    ];

    indicators.forEach(indicator => {
      // Draw indicator background
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(indicator.x - 40, indicator.y - 20, 80, 40);

      // Draw indicator border
      ctx.strokeStyle = indicator.color;
      ctx.lineWidth = 2;
      ctx.strokeRect(indicator.x - 40, indicator.y - 20, 80, 40);

      // Draw vital name
      ctx.fillStyle = indicator.color;
      ctx.font = '12px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(indicator.vital, indicator.x, indicator.y - 5);

      // Draw value
      ctx.font = 'bold 14px monospace';
      ctx.fillText(`${indicator.value}`, indicator.x, indicator.y + 8);

      // Draw unit
      ctx.font = '10px monospace';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.fillText(indicator.unit, indicator.x, indicator.y + 18);
    });
  };

  const vitalOptions = [
    { key: "heartRate", label: "Heart Rate", icon: Heart, color: "cyber-red" },
    { key: "spO2", label: "Oxygen Sat", icon: Activity, color: "cyber-green" },
    { key: "temperature", label: "Temperature", icon: Thermometer, color: "cyber-orange" },
    { key: "bloodPressure", label: "Blood Pressure", icon: Droplets, color: "cyber-purple" },
    { key: "respiratoryRate", label: "Respiratory", icon: Brain, color: "cyber-blue" },
    { key: "hvr", label: "HRV", icon: Zap, color: "cyber-yellow" }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Eye className="h-6 w-6 text-cyber-blue animate-pulse" />
          <h2 className="text-2xl font-bold bg-gradient-to-r from-cyber-blue via-cyber-purple to-cyber-pink bg-clip-text text-transparent">
            3D Health Visualization
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsPlaying(!isPlaying)}
            className="border-cyber-blue/50 text-cyber-blue hover:bg-cyber-blue/10"
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsMuted(!isMuted)}
            className="border-cyber-blue/50 text-cyber-blue hover:bg-cyber-blue/10"
          >
            {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setFullscreen(!fullscreen)}
            className="border-cyber-blue/50 text-cyber-blue hover:bg-cyber-blue/10"
          >
            <Maximize className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Main Visualization */}
      <div className={cn(
        "relative",
        fullscreen ? "fixed inset-0 z-50 bg-background" : ""
      )}>
        <Card className={cn(
          "relative overflow-hidden transition-all duration-500",
          "bg-gradient-to-br from-background via-background to-cyber-blue/5",
          "border-2 border-cyber-blue/30 hover:border-cyber-blue/50",
          fullscreen ? "h-full rounded-none border-0" : "h-96 md:h-[500px]"
        )}>
          <canvas
            ref={canvasRef}
            width={800}
            height={500}
            className="w-full h-full object-contain"
          />

          {/* Overlay Controls */}
          <div className="absolute top-4 left-4 space-y-2">
            <Badge className="bg-black/50 text-cyber-green border-cyber-green/30 backdrop-blur-sm">
              <div className="w-2 h-2 bg-cyber-green rounded-full mr-2 animate-pulse" />
              Real-time
            </Badge>
            
            <Badge className="bg-black/50 text-cyber-blue border-cyber-blue/30 backdrop-blur-sm">
              {vitals.heartRate} BPM
            </Badge>
          </div>

          {/* Vital Selection */}
          <div className="absolute top-4 right-4">
            <div className="grid grid-cols-2 gap-2">
              {vitalOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <Button
                    key={option.key}
                    variant={selectedVital === option.key ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      setSelectedVital(option.key);
                      onVitalSelect?.(option.key);
                    }}
                    className={cn(
                      "transition-all duration-300",
                      selectedVital === option.key 
                        ? `bg-${option.color}/20 text-${option.color} border-${option.color}/50 animate-glow-pulse`
                        : "bg-black/30 backdrop-blur-sm border-white/20 hover:border-white/40"
                    )}
                  >
                    <Icon className="h-3 w-3 mr-1" />
                    {option.label}
                  </Button>
                );
              })}
            </div>
          </div>
        </Card>
      </div>

      {/* Controls Panel */}
      <Card className="p-6 bg-gradient-to-br from-card/50 to-card/20 backdrop-blur-sm border-cyber-blue/30">
        <div className="space-y-6">
          <div className="flex items-center gap-2 mb-4">
            <Settings className="h-5 w-5 text-cyber-blue" />
            <h3 className="font-semibold">Visualization Controls</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Zoom Control */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Eye className="h-4 w-4 text-cyber-blue" />
                Zoom: {zoom[0]}%
              </label>
              <Slider
                value={zoom}
                onValueChange={setZoom}
                min={50}
                max={200}
                step={10}
                className="w-full"
              />
            </div>

            {/* Rotation X */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <RotateCcw className="h-4 w-4 text-cyber-purple" />
                Rotation X: {rotationX[0]}°
              </label>
              <Slider
                value={rotationX}
                onValueChange={setRotationX}
                min={-180}
                max={180}
                step={5}
                className="w-full"
              />
            </div>

            {/* Rotation Y */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <RotateCcw className="h-4 w-4 text-cyber-green" />
                Rotation Y: {rotationY[0]}°
              </label>
              <Slider
                value={rotationY}
                onValueChange={setRotationY}
                min={-180}
                max={180}
                step={5}
                className="w-full"
              />
            </div>

            {/* Animation Speed */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Zap className="h-4 w-4 text-cyber-yellow" />
                Speed: {animationSpeed[0]}x
              </label>
              <Slider
                value={animationSpeed}
                onValueChange={setAnimationSpeed}
                min={0.1}
                max={3}
                step={0.1}
                className="w-full"
              />
            </div>
          </div>

          {/* Additional Controls */}
          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowWaveforms(!showWaveforms)}
              className={cn(
                "transition-all duration-300",
                showWaveforms 
                  ? "bg-cyber-blue/20 text-cyber-blue border-cyber-blue/50" 
                  : "border-muted/50"
              )}
            >
              <Activity className="h-4 w-4 mr-2" />
              {showWaveforms ? "Hide" : "Show"} Waveforms
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setZoom([100]);
                setRotationX([0]);
                setRotationY([0]);
                setAnimationSpeed([1]);
              }}
              className="border-muted/50 hover:border-cyber-orange/50 hover:text-cyber-orange"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset View
            </Button>
          </div>
        </div>
      </Card>

      {/* Vital Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Heart Rate", value: vitals.heartRate, unit: "bpm", color: "cyber-red", icon: Heart },
          { label: "SpO₂", value: vitals.spO2, unit: "%", color: "cyber-green", icon: Activity },
          { label: "Temperature", value: vitals.temperature, unit: "°C", color: "cyber-orange", icon: Thermometer },
          { label: "Blood Pressure", value: `${vitals.bloodPressure.systolic}/${vitals.bloodPressure.diastolic}`, unit: "mmHg", color: "cyber-purple", icon: Droplets }
        ].map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card 
              key={stat.label}
              className={cn(
                "p-4 text-center transition-all duration-500 cursor-pointer hover:scale-105",
                "bg-gradient-to-br from-card/50 to-card/20 backdrop-blur-sm",
                `border border-${stat.color}/30 hover:border-${stat.color}/60`,
                `hover:shadow-[0_0_20px_hsl(var(--${stat.color})/0.3)]`,
                "animate-fade-in-scale"
              )}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="space-y-2">
                <div className={cn(
                  "w-12 h-12 mx-auto rounded-full flex items-center justify-center",
                  `bg-${stat.color}/20 animate-pulse`
                )}>
                  <Icon className={cn("h-6 w-6", `text-${stat.color}`)} />
                </div>
                <div className={cn("text-2xl font-bold", `text-${stat.color}`)}>
                  {stat.value}
                </div>
                <div className="text-xs text-muted-foreground">
                  {stat.unit}
                </div>
                <div className="text-xs font-medium">
                  {stat.label}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};