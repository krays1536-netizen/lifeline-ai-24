import { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { 
  AlertTriangle, 
  Zap, 
  Flame, 
  Wind, 
  Droplets, 
  Thermometer,
  Radio,
  Satellite,
  MapPin,
  Activity,
  Gauge
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DisasterEvent {
  type: "earthquake" | "fire" | "gas_leak" | "flood" | "sandstorm" | "heat_wave";
  severity: "low" | "medium" | "high" | "critical";
  location: string;
  confidence: number;
  timestamp: Date;
  guidance: string[];
  riskLevel: number;
  estimatedImpact: string;
}

interface ProductionDisasterAIProps {
  onDisasterDetected: (event: DisasterEvent) => void;
  currentLocation: { lat: number; lng: number; city: string };
}

interface EnvironmentalData {
  gas: number; // ppm
  temperature: number; // Celsius
  humidity: number; // percentage
  windSpeed: number; // km/h
  seismicActivity: number; // Richter scale
  airQuality: number; // AQI
  pressure: number; // hPa
  uvIndex: number;
}

export const ProductionDisasterAI = ({ onDisasterDetected, currentLocation }: ProductionDisasterAIProps) => {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [activeDisasters, setActiveDisasters] = useState<DisasterEvent[]>([]);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [dangerLevel, setDangerLevel] = useState<"safe" | "elevated" | "high" | "critical">("safe");
  const [riskEscalating, setRiskEscalating] = useState(false);
  
  const [environmentalData, setEnvironmentalData] = useState<EnvironmentalData>({
    gas: 395, // Realistic baseline CO2
    temperature: 35, // Kuwait typical
    humidity: 65,
    windSpeed: 12,
    seismicActivity: 0.8,
    airQuality: 85,
    pressure: 1013,
    uvIndex: 8
  });

  // Realistic thresholds for Kuwait conditions
  const safetyThresholds = {
    gas: { safe: 500, risky: 800, critical: 1200 }, // CO2 ppm
    temperature: { safe: 45, risky: 48, critical: 52 }, // Celsius
    humidity: { safe: 80, risky: 90, critical: 95 }, // percentage
    windSpeed: { safe: 30, risky: 50, critical: 80 }, // km/h
    seismicActivity: { safe: 2.5, risky: 4.0, critical: 6.0 }, // Richter
    airQuality: { safe: 100, risky: 150, critical: 200 }, // AQI
    pressure: { safe: [980, 1040], risky: [970, 1050], critical: [960, 1060] }, // hPa range
    uvIndex: { safe: 8, risky: 10, critical: 12 }
  };

  // Kuwait-specific disaster patterns with enhanced guidance
  const disasterPatterns = {
    earthquake: {
      triggers: ["seismic > 3.0", "accelerometer spike", "structural vibration"],
      guidance: [
        "🚨 IMMEDIATE: Drop, Cover, Hold On",
        "📍 Stay away from windows and heavy objects",
        "🏢 If outdoors, move away from buildings and power lines",
        "🚫 Do NOT use elevators",
        "📱 Kuwait Emergency: 112",
        "🏥 Check for injuries, provide first aid"
      ],
      estimatedImpact: "Structural damage possible, aftershocks expected"
    },
    fire: {
      triggers: ["temperature spike > 50°C", "smoke detection", "gas levels elevated"],
      guidance: [
        "🚨 EVACUATE IMMEDIATELY",
        "🔥 Stay low to avoid smoke inhalation",
        "🚪 Feel doors before opening (check for heat)",
        "📞 Call Kuwait Fire Service: 777",
        "💨 If trapped, signal for help from windows",
        "🚫 Never use elevators during fire"
      ],
      estimatedImpact: "Life-threatening situation, immediate evacuation required"
    },
    gas_leak: {
      triggers: ["gas sensor > 1000ppm", "unusual odor detection", "explosion risk"],
      guidance: [
        "🚨 EVACUATE AREA IMMEDIATELY",
        "⚡ Do NOT use electrical devices or create sparks",
        "🌪️ Ventilate area if safe to do so",
        "📞 Kuwait Gas Emergency: 1888888",
        "🚗 Move to safe distance (minimum 300m)",
        "🏥 Seek medical attention if feeling dizzy/nauseous"
      ],
      estimatedImpact: "Explosion risk high, toxic exposure possible"
    },
    heat_wave: {
      triggers: ["temperature > 48°C", "UV index > 10", "humidity patterns"],
      guidance: [
        "🏠 Stay indoors during peak hours (10 AM - 6 PM)",
        "💧 Drink water every 15-20 minutes",
        "👕 Wear light-colored, loose clothing",
        "👥 Check on elderly neighbors and relatives",
        "❄️ Use air conditioning or cooling centers",
        "🚫 Avoid strenuous outdoor activities"
      ],
      estimatedImpact: "Heat exhaustion and heat stroke risk elevated"
    },
    sandstorm: {
      triggers: ["wind speed > 40km/h", "visibility < 1km", "dust concentration high"],
      guidance: [
        "🏠 Stay indoors with windows and doors closed",
        "😷 Wear N95 masks if must go outside",
        "🚗 Avoid driving - pull over safely if caught outside",
        "❄️ Cover air conditioning units and vents",
        "💊 Have respiratory medications ready",
        "📱 Monitor weather updates frequently"
      ],
      estimatedImpact: "Respiratory hazard, transportation disruption expected"
    },
    flood: {
      triggers: ["heavy rainfall > 50mm/h", "drainage overflow", "water accumulation"],
      guidance: [
        "⛰️ Move to higher ground immediately",
        "🚫 NEVER walk in moving water (15cm can knock you down)",
        "🚗 Do not drive through flooded roads",
        "⚡ Turn off electricity if water enters building",
        "📞 Kuwait Civil Defense: 112",
        "🏥 Boil water before drinking until authorities confirm safety"
      ],
      estimatedImpact: "Infrastructure damage, contamination risk"
    }
  };

  // Simulate realistic Kuwait weather API
  const fetchKuwaitWeatherData = useCallback(async () => {
    // Simulate API response with realistic Kuwait conditions
    const baseTemp = 25 + Math.sin(Date.now() / 86400000) * 15; // Daily temp cycle
    const seasonalFactor = Math.sin((Date.now() / 31536000000) * 2 * Math.PI) * 10; // Seasonal variation
    
    const weatherData = {
      temperature: Math.max(15, Math.min(55, baseTemp + seasonalFactor + (Math.random() - 0.5) * 4)),
      humidity: Math.max(20, Math.min(95, 45 + Math.random() * 30)),
      windSpeed: Math.max(0, Math.min(70, 8 + Math.random() * 20)),
      pressure: 1013 + (Math.random() - 0.5) * 40,
      uvIndex: Math.max(0, Math.min(15, 6 + Math.random() * 6)),
      airQuality: Math.max(50, Math.min(200, 80 + Math.random() * 60))
    };

    return weatherData;
  }, []);

  // Enhanced environmental sensor simulation with realistic patterns
  const updateEnvironmentalSensors = useCallback(async () => {
    const weatherData = await fetchKuwaitWeatherData();
    
    const newData: EnvironmentalData = {
      gas: Math.max(350, Math.min(2000, environmentalData.gas + (Math.random() - 0.5) * 20)),
      temperature: weatherData.temperature,
      humidity: weatherData.humidity,
      windSpeed: weatherData.windSpeed,
      seismicActivity: Math.max(0, Math.min(7, 0.5 + Math.random() * 1.5)),
      airQuality: weatherData.airQuality,
      pressure: weatherData.pressure,
      uvIndex: weatherData.uvIndex
    };

    setEnvironmentalData(newData);
    
    // Assess overall danger level
    const dangerAssessment = assessDangerLevel(newData);
    setDangerLevel(dangerAssessment.level);
    setRiskEscalating(dangerAssessment.escalating);
    
    // Check for disaster conditions
    // await checkForDisasterConditions(newData);
    setLastUpdate(new Date());
  }, [environmentalData, fetchKuwaitWeatherData]);

  const assessDangerLevel = (data: EnvironmentalData) => {
    let riskScore = 0;
    let criticalFactors = 0;
    let escalatingFactors = [];

    // Gas levels
    if (data.gas > safetyThresholds.gas.critical) {
      riskScore += 4; criticalFactors++;
      escalatingFactors.push("Critical gas levels");
    } else if (data.gas > safetyThresholds.gas.risky) {
      riskScore += 2;
      escalatingFactors.push("Elevated gas levels");
    }

    // Temperature
    if (data.temperature > safetyThresholds.temperature.critical) {
      riskScore += 3; criticalFactors++;
      escalatingFactors.push("Extreme heat");
    } else if (data.temperature > safetyThresholds.temperature.risky) {
      riskScore += 2;
      escalatingFactors.push("High temperature");
    }

    // Wind
    if (data.windSpeed > safetyThresholds.windSpeed.critical) {
      riskScore += 4; criticalFactors++;
      escalatingFactors.push("Severe winds");
    } else if (data.windSpeed > safetyThresholds.windSpeed.risky) {
      riskScore += 2;
      escalatingFactors.push("High winds");
    }

    // Seismic
    if (data.seismicActivity > safetyThresholds.seismicActivity.critical) {
      riskScore += 5; criticalFactors++;
      escalatingFactors.push("Major seismic activity");
    } else if (data.seismicActivity > safetyThresholds.seismicActivity.risky) {
      riskScore += 3;
      escalatingFactors.push("Seismic activity detected");
    }

    let level: "safe" | "elevated" | "high" | "critical" = "safe";
    if (criticalFactors > 0 || riskScore > 8) level = "critical";
    else if (riskScore > 5) level = "high";
    else if (riskScore > 2) level = "elevated";

    return {
      level,
      escalating: escalatingFactors.length > 0,
      factors: escalatingFactors,
      score: riskScore
    };
  };

  const checkForDisasterConditions = useCallback(async (data: EnvironmentalData) => {
    const detectedEvents: DisasterEvent[] = [];

    // Enhanced earthquake detection
    if (data.seismicActivity > 3.0) {
      const severity = data.seismicActivity > 6.0 ? "critical" : 
                     data.seismicActivity > 4.5 ? "high" : "medium";
      detectedEvents.push({
        type: "earthquake",
        severity,
        location: currentLocation.city,
        confidence: Math.min(95, 75 + data.seismicActivity * 5),
        timestamp: new Date(),
        guidance: disasterPatterns.earthquake.guidance,
        riskLevel: Math.round(data.seismicActivity * 10),
        estimatedImpact: disasterPatterns.earthquake.estimatedImpact
      });
    }

    // Enhanced heat wave detection
    if (data.temperature > 47) {
      const severity = data.temperature > 52 ? "critical" : 
                     data.temperature > 49 ? "high" : "medium";
      detectedEvents.push({
        type: "heat_wave",
        severity,
        location: currentLocation.city,
        confidence: 90,
        timestamp: new Date(),
        guidance: disasterPatterns.heat_wave.guidance,
        riskLevel: Math.round((data.temperature - 40) * 2),
        estimatedImpact: disasterPatterns.heat_wave.estimatedImpact
      });
    }

    // Enhanced sandstorm detection
    if (data.windSpeed > 35 && data.airQuality > 150) {
      const severity = data.windSpeed > 60 ? "critical" : 
                     data.windSpeed > 45 ? "high" : "medium";
      detectedEvents.push({
        type: "sandstorm",
        severity,
        location: currentLocation.city,
        confidence: 85,
        timestamp: new Date(),
        guidance: disasterPatterns.sandstorm.guidance,
        riskLevel: Math.round(data.windSpeed / 5),
        estimatedImpact: disasterPatterns.sandstorm.estimatedImpact
      });
    }

    // Enhanced gas leak detection
    if (data.gas > 1000) {
      detectedEvents.push({
        type: "gas_leak",
        severity: "critical",
        location: currentLocation.city,
        confidence: 95,
        timestamp: new Date(),
        guidance: disasterPatterns.gas_leak.guidance,
        riskLevel: Math.round(data.gas / 100),
        estimatedImpact: disasterPatterns.gas_leak.estimatedImpact
      });
    }

    // Fire detection (temperature + gas combination)
    if (data.temperature > 48 && data.gas > 800) {
      detectedEvents.push({
        type: "fire",
        severity: "high",
        location: currentLocation.city,
        confidence: 88,
        timestamp: new Date(),
        guidance: disasterPatterns.fire.guidance,
        riskLevel: Math.round((data.temperature - 40) + (data.gas / 100)),
        estimatedImpact: disasterPatterns.fire.estimatedImpact
      });
    }

    if (detectedEvents.length > 0) {
      setActiveDisasters(prev => {
        const newDisasters = [...prev, ...detectedEvents];
        // Keep only last 5 disasters
        return newDisasters.slice(-5);
      });
      detectedEvents.forEach(event => onDisasterDetected(event));
    }
  }, [currentLocation, onDisasterDetected]);

  const startMonitoring = useCallback(async () => {
    setIsMonitoring(true);
    
    const interval = setInterval(updateEnvironmentalSensors, 3000);
    
    return () => clearInterval(interval);
  }, [updateEnvironmentalSensors]);

  const stopMonitoring = useCallback(() => {
    setIsMonitoring(false);
    setRiskEscalating(false);
  }, []);

  const getDisasterIcon = (type: string) => {
    const icons = {
      earthquake: Zap,
      fire: Flame,
      gas_leak: Radio,
      heat_wave: Thermometer,
      sandstorm: Wind,
      flood: Droplets
    };
    return icons[type as keyof typeof icons] || AlertTriangle;
  };

  const getSeverityColor = (severity: string) => {
    const colors = {
      low: "text-cyber-green border-cyber-green",
      medium: "text-cyber-orange border-cyber-orange",
      high: "text-cyber-red border-cyber-red",
      critical: "text-destructive border-destructive animate-pulse"
    };
    return colors[severity as keyof typeof colors] || "text-muted-foreground border-muted";
  };

  const getDangerLevelColor = (level: string) => {
    const colors = {
      safe: "border-cyber-green",
      elevated: "border-cyber-orange",
      high: "border-cyber-red",
      critical: "border-destructive animate-danger-pulse"
    };
    return colors[level as keyof typeof colors] || "border-muted";
  };

  const getSensorStatus = (value: number, thresholds: any) => {
    if (typeof thresholds.critical === 'number') {
      if (value > thresholds.critical) return { status: "critical", color: "text-destructive" };
      if (value > thresholds.risky) return { status: "risky", color: "text-cyber-orange" };
      if (value > thresholds.safe) return { status: "elevated", color: "text-cyber-yellow" };
      return { status: "safe", color: "text-cyber-green" };
    }
    return { status: "safe", color: "text-cyber-green" };
  };

  useEffect(() => {
    let cleanup: (() => void) | undefined;
    
    if (isMonitoring) {
      startMonitoring().then(cleanupFn => {
        cleanup = cleanupFn;
      });
    }
    
    return () => {
      if (cleanup) cleanup();
    };
  }, [isMonitoring, startMonitoring]);

  return (
    <div className={cn(
      "transition-all duration-500",
      riskEscalating && "animate-danger-pulse"
    )}>
      <Card className={cn(
        "p-6 border-2 transition-all duration-300",
        getDangerLevelColor(dangerLevel),
        "bg-[var(--gradient-card)]"
      )}>
        <div className="flex items-center gap-3 mb-4">
          <AlertTriangle className={cn(
            "h-6 w-6 animate-pulse",
            dangerLevel === "critical" ? "text-destructive" :
            dangerLevel === "high" ? "text-cyber-red" :
            dangerLevel === "elevated" ? "text-cyber-orange" :
            "text-cyber-green"
          )} />
          <h3 className="text-xl font-bold text-foreground">Production DisasterAI</h3>
          <Badge variant="outline" className="text-cyber-orange border-cyber-orange/50">
            Kuwait Network
          </Badge>
          {riskEscalating && (
            <Badge className="bg-cyber-red text-white animate-pulse">
              Risk Escalating
            </Badge>
          )}
        </div>

        {/* Control Panel */}
        <div className="flex gap-3 mb-6">
          <Button
            onClick={isMonitoring ? stopMonitoring : () => setIsMonitoring(true)}
            variant={isMonitoring ? "destructive" : "default"}
            className="flex-1"
          >
            <Satellite className="h-4 w-4 mr-2" />
            {isMonitoring ? "Stop Monitoring" : "Start Disaster Monitoring"}
          </Button>
        </div>

        {/* Environmental Sensors Grid */}
        {isMonitoring && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <Card className="p-3 bg-muted/20">
              <div className="text-xs text-muted-foreground">Gas Levels</div>
              <div className={cn("text-lg font-bold", getSensorStatus(environmentalData.gas, safetyThresholds.gas).color)}>
                {environmentalData.gas.toFixed(0)} ppm
              </div>
              <div className="text-xs text-muted-foreground">
                Safe: &lt;{safetyThresholds.gas.safe}
              </div>
            </Card>
            
            <Card className="p-3 bg-muted/20">
              <div className="text-xs text-muted-foreground">Temperature</div>
              <div className={cn("text-lg font-bold", getSensorStatus(environmentalData.temperature, safetyThresholds.temperature).color)}>
                {environmentalData.temperature.toFixed(1)}°C
              </div>
              <div className="text-xs text-muted-foreground">
                Safe: &lt;{safetyThresholds.temperature.safe}°C
              </div>
            </Card>
            
            <Card className="p-3 bg-muted/20">
              <div className="text-xs text-muted-foreground">Wind Speed</div>
              <div className={cn("text-lg font-bold", getSensorStatus(environmentalData.windSpeed, safetyThresholds.windSpeed).color)}>
                {environmentalData.windSpeed.toFixed(1)} km/h
              </div>
              <div className="text-xs text-muted-foreground">
                Safe: &lt;{safetyThresholds.windSpeed.safe} km/h
              </div>
            </Card>
            
            <Card className="p-3 bg-muted/20">
              <div className="text-xs text-muted-foreground">Seismic</div>
              <div className={cn("text-lg font-bold", getSensorStatus(environmentalData.seismicActivity, safetyThresholds.seismicActivity).color)}>
                {environmentalData.seismicActivity.toFixed(1)}
              </div>
              <div className="text-xs text-muted-foreground">
                Richter Scale
              </div>
            </Card>
            
            <Card className="p-3 bg-muted/20">
              <div className="text-xs text-muted-foreground">Humidity</div>
              <div className="text-lg font-bold text-cyber-blue">
                {environmentalData.humidity.toFixed(0)}%
              </div>
            </Card>
            
            <Card className="p-3 bg-muted/20">
              <div className="text-xs text-muted-foreground">Air Quality</div>
              <div className={cn("text-lg font-bold", getSensorStatus(environmentalData.airQuality, safetyThresholds.airQuality).color)}>
                {environmentalData.airQuality.toFixed(0)} AQI
              </div>
            </Card>
            
            <Card className="p-3 bg-muted/20">
              <div className="text-xs text-muted-foreground">Pressure</div>
              <div className="text-lg font-bold text-cyber-purple">
                {environmentalData.pressure.toFixed(0)} hPa
              </div>
            </Card>
            
            <Card className="p-3 bg-muted/20">
              <div className="text-xs text-muted-foreground">UV Index</div>
              <div className={cn("text-lg font-bold", getSensorStatus(environmentalData.uvIndex, safetyThresholds.uvIndex).color)}>
                {environmentalData.uvIndex.toFixed(0)}
              </div>
            </Card>
          </div>
        )}

        {/* Danger Level Indicator */}
        {isMonitoring && (
          <Card className={cn("p-4 mb-4 border-2", getDangerLevelColor(dangerLevel))}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Gauge className={cn("h-5 w-5", 
                  dangerLevel === "critical" ? "text-destructive" :
                  dangerLevel === "high" ? "text-cyber-red" :
                  dangerLevel === "elevated" ? "text-cyber-orange" :
                  "text-cyber-green"
                )} />
                <div>
                  <div className="font-bold capitalize">{dangerLevel} Risk Level</div>
                  <div className="text-sm text-muted-foreground">
                    Overall environmental assessment
                  </div>
                </div>
              </div>
              {riskEscalating && (
                <Badge className="bg-cyber-red text-white animate-pulse">
                  ⚠️ ESCALATING
                </Badge>
              )}
            </div>
          </Card>
        )}

        {/* Active Disasters */}
        {activeDisasters.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Active Disaster Alerts
            </h4>
            {activeDisasters.slice(-3).map((disaster, i) => {
              const Icon = getDisasterIcon(disaster.type);
              return (
                <Alert key={i} className={cn("border-2", getSeverityColor(disaster.severity))}>
                  <Icon className="h-4 w-4" />
                  <AlertDescription>
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className="font-medium capitalize">
                          {disaster.type.replace('_', ' ')} - {disaster.severity.toUpperCase()}
                        </span>
                        <div className="text-xs text-muted-foreground">
                          📍 {disaster.location} • {disaster.timestamp.toLocaleTimeString()}
                        </div>
                        <div className="text-xs font-medium text-cyber-orange mt-1">
                          Risk Level: {disaster.riskLevel}/10
                        </div>
                      </div>
                      <Badge variant="outline" className={getSeverityColor(disaster.severity)}>
                        {disaster.confidence}% confidence
                      </Badge>
                    </div>
                    
                    {/* Estimated Impact */}
                    <div className="text-xs mb-2 p-2 bg-muted/20 rounded">
                      <strong>Estimated Impact:</strong> {disaster.estimatedImpact}
                    </div>
                    
                    {/* Safety Guidance */}
                    <div className="text-xs space-y-1">
                      <strong>🚨 IMMEDIATE ACTIONS:</strong>
                      {disaster.guidance.slice(0, 3).map((guide, j) => (
                        <div key={j} className="ml-2">• {guide}</div>
                      ))}
                      {disaster.guidance.length > 3 && (
                        <details className="mt-2">
                          <summary className="cursor-pointer text-cyber-blue hover:underline">
                            Show all {disaster.guidance.length} safety instructions
                          </summary>
                          <div className="mt-1 space-y-1">
                            {disaster.guidance.slice(3).map((guide, j) => (
                              <div key={j} className="ml-2">• {guide}</div>
                            ))}
                          </div>
                        </details>
                      )}
                    </div>
                  </AlertDescription>
                </Alert>
              );
            })}
          </div>
        )}

        {/* Status Footer */}
        {isMonitoring && lastUpdate && (
          <div className="mt-4 text-xs text-muted-foreground text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <div className={cn("w-2 h-2 rounded-full animate-pulse",
                dangerLevel === "critical" ? "bg-destructive" :
                dangerLevel === "high" ? "bg-cyber-red" :
                dangerLevel === "elevated" ? "bg-cyber-orange" :
                "bg-cyber-green"
              )}></div>
              <span>Last update: {lastUpdate.toLocaleTimeString()}</span>
            </div>
            <div>🛰️ Connected to Kuwait Civil Defense Network • Real-time monitoring active</div>
          </div>
        )}
      </Card>
    </div>
  );
};
