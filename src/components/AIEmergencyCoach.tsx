import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Brain, 
  Heart, 
  Zap, 
  Phone, 
  MapPin, 
  Shield, 
  Activity,
  AlertTriangle,
  Timer,
  Users,
  Video,
  Mic,
  Camera,
  Navigation,
  Stethoscope,
  Thermometer
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface EmergencyScenario {
  id: string;
  type: 'cardiac' | 'trauma' | 'respiratory' | 'neurological' | 'poisoning' | 'burns' | 'pediatric';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  immediateActions: string[];
  timeline: { time: string; action: string; critical?: boolean }[];
  warnings: string[];
  supplies: string[];
}

interface AIEmergencyCoachProps {
  emergencyType?: string;
  vitals?: {
    heartRate: number;
    spO2: number;
    temperature: number;
  };
  location?: {
    latitude: number;
    longitude: number;
    address: string;
  };
  onCallEmergency?: () => void;
  onActivateWitnessCam?: () => void;
}

export const AIEmergencyCoach = ({
  emergencyType,
  vitals,
  location,
  onCallEmergency,
  onActivateWitnessCam
}: AIEmergencyCoachProps) => {
  const { toast } = useToast();
  const [activeScenario, setActiveScenario] = useState<EmergencyScenario | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [emergencyTimer, setEmergencyTimer] = useState(0);
  const [isEmergencyActive, setIsEmergencyActive] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [aiAnalysis, setAiAnalysis] = useState<string>("");

  // Comprehensive emergency scenarios database
  const emergencyScenarios: EmergencyScenario[] = [
    {
      id: 'cardiac_arrest',
      type: 'cardiac',
      severity: 'critical',
      title: 'Cardiac Arrest Protocol',
      description: 'Person is unresponsive and not breathing normally',
      immediateActions: [
        'Call 112 IMMEDIATELY',
        'Check for responsiveness by tapping shoulders',
        'Check for normal breathing (look, listen, feel)',
        'Begin CPR if no pulse within 10 seconds',
        'Push hard and fast in center of chest'
      ],
      timeline: [
        { time: '0:00', action: 'Check responsiveness', critical: true },
        { time: '0:10', action: 'Call 112', critical: true },
        { time: '0:30', action: 'Begin chest compressions', critical: true },
        { time: '2:00', action: 'Continue CPR until help arrives' },
        { time: '5:00', action: 'Switch with another person if available' }
      ],
      warnings: [
        'Do not stop CPR unless person starts breathing',
        'Push at least 2 inches deep',
        'Allow complete chest recoil between compressions',
        'Minimize interruptions'
      ],
      supplies: ['AED if available', 'Clean cloth for barrier']
    },
    {
      id: 'severe_bleeding',
      type: 'trauma',
      severity: 'critical',
      title: 'Severe Bleeding Control',
      description: 'Heavy bleeding that needs immediate control',
      immediateActions: [
        'Apply direct pressure with clean cloth',
        'Elevate wounded area above heart if possible',
        'Apply pressure to pressure points',
        'Call 112 immediately',
        'Do not remove objects embedded in wound'
      ],
      timeline: [
        { time: '0:00', action: 'Apply direct pressure', critical: true },
        { time: '0:15', action: 'Call 112', critical: true },
        { time: '1:00', action: 'Elevate if no spinal injury' },
        { time: '3:00', action: 'Apply pressure bandage' },
        { time: '5:00', action: 'Monitor for shock' }
      ],
      warnings: [
        'Do not remove embedded objects',
        'Watch for signs of shock',
        'Keep pressure constant',
        'Do not peek under bandages'
      ],
      supplies: ['Clean cloths', 'Pressure bandages', 'Gloves if available']
    },
    {
      id: 'choking_adult',
      type: 'respiratory',
      severity: 'critical',
      title: 'Adult Choking Emergency',
      description: 'Adult conscious and choking on foreign object',
      immediateActions: [
        'Ask "Are you choking?" and look for the choking sign',
        'If conscious, perform Heimlich maneuver',
        'Stand behind victim, wrap arms around waist',
        'Make fist above navel, thrust upward',
        'Continue until object dislodged or unconscious'
      ],
      timeline: [
        { time: '0:00', action: 'Confirm choking', critical: true },
        { time: '0:10', action: 'Position for Heimlich', critical: true },
        { time: '0:20', action: 'Perform abdominal thrusts', critical: true },
        { time: '1:00', action: 'Continue thrusts' },
        { time: '2:00', action: 'Call 112 if not resolved' }
      ],
      warnings: [
        'Do not hit back if adult is coughing effectively',
        'If unconscious, begin CPR',
        'Check mouth for visible objects',
        'Do not perform on pregnant women'
      ],
      supplies: ['Clear the area of obstacles']
    },
    {
      id: 'stroke_symptoms',
      type: 'neurological',
      severity: 'critical',
      title: 'Stroke Recognition & Response',
      description: 'Signs of stroke requiring immediate medical attention',
      immediateActions: [
        'Perform FAST test: Face, Arms, Speech, Time',
        'Call 112 immediately if any signs present',
        'Note time symptoms started',
        'Keep person calm and lying down',
        'Do not give food or water'
      ],
      timeline: [
        { time: '0:00', action: 'FAST assessment', critical: true },
        { time: '0:30', action: 'Call 112', critical: true },
        { time: '1:00', action: 'Position comfortably' },
        { time: '2:00', action: 'Monitor breathing' },
        { time: '5:00', action: 'Prepare for paramedics' }
      ],
      warnings: [
        'Time is critical - every minute counts',
        'Do not give medications',
        'Monitor for loss of consciousness',
        'Keep airway clear'
      ],
      supplies: ['Pillow for comfort', 'Blanket to keep warm']
    }
  ];

  // AI Analysis based on symptoms and vitals
  const performAIAnalysis = useCallback(() => {
    let analysis = "🤖 AI Emergency Analysis:\n\n";
    
    if (vitals) {
      analysis += `Vital Signs Assessment:\n`;
      analysis += `• Heart Rate: ${vitals.heartRate} BPM ${vitals.heartRate > 100 ? '(Elevated)' : vitals.heartRate < 60 ? '(Low)' : '(Normal)'}\n`;
      analysis += `• SpO2: ${vitals.spO2}% ${vitals.spO2 < 95 ? '(Critical - Oxygen needed)' : '(Normal)'}\n`;
      analysis += `• Temperature: ${vitals.temperature}°F ${vitals.temperature > 100.4 ? '(Fever present)' : '(Normal)'}\n\n`;
    }

    if (emergencyType) {
      const scenario = emergencyScenarios.find(s => s.type === emergencyType.toLowerCase());
      if (scenario) {
        analysis += `Emergency Type: ${scenario.title}\n`;
        analysis += `Severity: ${scenario.severity.toUpperCase()}\n`;
        analysis += `Recommended Actions: ${scenario.immediateActions.slice(0, 3).join(', ')}\n\n`;
      }
    }

    analysis += `🚨 Priority Actions:\n`;
    analysis += `1. Call 112 if not already done\n`;
    analysis += `2. Follow step-by-step emergency protocol\n`;
    analysis += `3. Monitor patient continuously\n`;
    analysis += `4. Prepare for emergency services arrival`;

    setAiAnalysis(analysis);
  }, [emergencyType, vitals]);

  // Start emergency protocol
  const startEmergencyProtocol = useCallback((scenario: EmergencyScenario) => {
    setActiveScenario(scenario);
    setIsEmergencyActive(true);
    setCurrentStep(0);
    setCompletedSteps([]);
    
    // Start emergency timer
    const startTime = Date.now();
    const timer = setInterval(() => {
      setEmergencyTimer(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    toast({
      title: `🚨 ${scenario.title} ACTIVATED`,
      description: "Following step-by-step emergency protocol",
      variant: "destructive"
    });

    // Auto-activate emergency features
    onCallEmergency?.();
    onActivateWitnessCam?.();

    return () => clearInterval(timer);
  }, [onCallEmergency, onActivateWitnessCam, toast]);

  // Complete current step
  const completeStep = useCallback((stepIndex: number) => {
    setCompletedSteps(prev => [...prev, stepIndex]);
    if (stepIndex < (activeScenario?.timeline.length || 0) - 1) {
      setCurrentStep(stepIndex + 1);
    }
    
    toast({
      title: "✅ Step Completed",
      description: `Moving to next action in emergency protocol`,
    });
  }, [activeScenario, toast]);

  // Initialize AI analysis
  useEffect(() => {
    performAIAnalysis();
  }, [performAIAnalysis]);

  // Format timer display
  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Emergency Status Header */}
      {isEmergencyActive && (
        <Card className="border-2 border-red-500 bg-red-500/10 animate-pulse">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <AlertTriangle className="w-6 h-6 text-red-400" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping" />
                </div>
                <div>
                  <h3 className="font-bold text-red-300">
                    🚨 EMERGENCY PROTOCOL ACTIVE
                  </h3>
                  <p className="text-sm text-red-400">
                    {activeScenario?.title} - Step {currentStep + 1} of {activeScenario?.timeline.length}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Badge variant="destructive" className="text-lg px-3 py-1">
                  <Timer className="w-4 h-4 mr-1" />
                  {formatTimer(emergencyTimer)}
                </Badge>
                <Progress 
                  value={(completedSteps.length / (activeScenario?.timeline.length || 1)) * 100}
                  className="w-32 h-2"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="scenarios" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="scenarios">Emergency Scenarios</TabsTrigger>
          <TabsTrigger value="active">Active Protocol</TabsTrigger>
          <TabsTrigger value="analysis">AI Analysis</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
        </TabsList>

        {/* Emergency Scenarios */}
        <TabsContent value="scenarios" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {emergencyScenarios.map((scenario) => (
              <Card 
                key={scenario.id}
                className={cn(
                  "cursor-pointer transition-all duration-300 hover:shadow-lg",
                  scenario.severity === 'critical' && "border-red-500/50 bg-red-500/5",
                  scenario.severity === 'high' && "border-orange-500/50 bg-orange-500/5",
                  scenario.severity === 'medium' && "border-yellow-500/50 bg-yellow-500/5"
                )}
                onClick={() => startEmergencyProtocol(scenario)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{scenario.title}</CardTitle>
                    <Badge 
                      variant={scenario.severity === 'critical' ? 'destructive' : 'secondary'}
                      className="capitalize"
                    >
                      {scenario.severity}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">
                    {scenario.description}
                  </p>
                  <div className="text-xs">
                    <strong>First Actions:</strong>
                    <ul className="list-disc list-inside mt-1 space-y-1">
                      {scenario.immediateActions.slice(0, 2).map((action, index) => (
                        <li key={index}>{action}</li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Active Protocol */}
        <TabsContent value="active" className="space-y-4">
          {activeScenario ? (
            <div className="space-y-4">
              {/* Current Step */}
              <Card className="border-2 border-blue-500 bg-blue-500/10">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Current Step: {activeScenario.timeline[currentStep]?.action}</span>
                    <Badge variant="outline">
                      Step {currentStep + 1} of {activeScenario.timeline.length}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-lg mb-2">
                        {activeScenario.timeline[currentStep]?.action}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Time: {activeScenario.timeline[currentStep]?.time}
                      </p>
                    </div>
                    <Button 
                      onClick={() => completeStep(currentStep)}
                      disabled={completedSteps.includes(currentStep)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {completedSteps.includes(currentStep) ? '✅ Done' : 'Complete Step'}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Timeline */}
              <Card>
                <CardHeader>
                  <CardTitle>Emergency Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-64">
                    <div className="space-y-3">
                      {activeScenario.timeline.map((step, index) => (
                        <div 
                          key={index}
                          className={cn(
                            "flex items-center gap-3 p-3 rounded-lg border",
                            completedSteps.includes(index) && "bg-green-500/10 border-green-500/50",
                            index === currentStep && "bg-blue-500/10 border-blue-500/50",
                            step.critical && "border-red-500/50"
                          )}
                        >
                          <div className={cn(
                            "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                            completedSteps.includes(index) ? "bg-green-500 text-white" :
                            index === currentStep ? "bg-blue-500 text-white" :
                            "bg-gray-500 text-white"
                          )}>
                            {completedSteps.includes(index) ? '✓' : index + 1}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{step.time}</span>
                              {step.critical && (
                                <Badge variant="destructive" className="text-xs">CRITICAL</Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">{step.action}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Emergency Controls */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Button 
                  onClick={onCallEmergency}
                  className="bg-red-600 hover:bg-red-700"
                >
                  <Phone className="w-4 h-4 mr-2" />
                  Call 112
                </Button>
                <Button 
                  onClick={onActivateWitnessCam}
                  variant="outline"
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Witness Cam
                </Button>
                <Button variant="outline">
                  <MapPin className="w-4 h-4 mr-2" />
                  Share Location
                </Button>
                <Button variant="outline">
                  <Users className="w-4 h-4 mr-2" />
                  Alert Contacts
                </Button>
              </div>
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Shield className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-bold mb-2">No Active Emergency Protocol</h3>
                <p className="text-muted-foreground">
                  Select an emergency scenario to begin step-by-step guidance
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* AI Analysis */}
        <TabsContent value="analysis" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-purple-400" />
                AI Emergency Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="whitespace-pre-wrap text-sm bg-black/50 p-4 rounded-lg">
                {aiAnalysis}
              </pre>
            </CardContent>
          </Card>

          {/* Vital Signs Impact */}
          {vitals && (
            <Card>
              <CardHeader>
                <CardTitle>Vital Signs Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <Heart className="w-8 h-8 mx-auto mb-2 text-red-400" />
                    <div className="text-2xl font-bold">{vitals.heartRate}</div>
                    <div className="text-sm text-muted-foreground">BPM</div>
                  </div>
                  <div className="text-center">
                    <Activity className="w-8 h-8 mx-auto mb-2 text-blue-400" />
                    <div className="text-2xl font-bold">{vitals.spO2}%</div>
                    <div className="text-sm text-muted-foreground">SpO2</div>
                  </div>
                  <div className="text-center">
                    <Thermometer className="w-8 h-8 mx-auto mb-2 text-orange-400" />
                    <div className="text-2xl font-bold">{vitals.temperature}°F</div>
                    <div className="text-sm text-muted-foreground">Temp</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Resources */}
        <TabsContent value="resources" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Emergency Contacts</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button className="w-full justify-start" variant="outline">
                  <Phone className="w-4 h-4 mr-2" />
                  112 - Emergency Services
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Phone className="w-4 h-4 mr-2" />
                  Poison Control: 1-800-222-1222
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Phone className="w-4 h-4 mr-2" />
                  Crisis Hotline: 988
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button className="w-full justify-start" variant="outline">
                  <Video className="w-4 h-4 mr-2" />
                  Video Call Doctor
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Navigation className="w-4 h-4 mr-2" />
                  Find Nearest Hospital
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Stethoscope className="w-4 h-4 mr-2" />
                  Medical ID Card
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};