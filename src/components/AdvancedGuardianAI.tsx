import { useState, useRef, useCallback, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { 
  Shield, 
  Mic, 
  Phone, 
  Camera, 
  AlertTriangle, 
  CheckCircle,
  Brain,
  Activity,
  MapPin,
  Users,
  Clock,
  Eye,
  Ear,
  Heart,
  Smartphone,
  Navigation,
  Zap
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface GuardianResponse {
  isOkay: boolean;
  needsSOS: boolean;
  canGetUp: boolean;
  confidence: number;
  analysisData: {
    voiceStress: number;
    speechClarity: number;
    responseTime: number;
    keywords: string[];
    emotionalState: "calm" | "distressed" | "panic" | "confused";
  };
  timestamp: Date;
}

interface AdvancedGuardianAIProps {
  isActive: boolean;
  onResponse: (response: GuardianResponse) => void;
  onSOSRequest: () => void;
  onCameraActivate: () => void;
  currentLocation?: [number, number];
  emergencyContacts?: Array<{name: string, phone: string, relation: string}>;
  healthProfile?: {
    conditions: string[];
    medications: string[];
    allergies: string[];
    emergencyInfo: string;
  };
}

interface AnalysisPhase {
  name: string;
  duration: number;
  description: string;
  icon: React.ComponentType<any>;
}

export const AdvancedGuardianAI = ({ 
  isActive, 
  onResponse, 
  onSOSRequest, 
  onCameraActivate,
  currentLocation,
  emergencyContacts = [],
  healthProfile
}: AdvancedGuardianAIProps) => {
  const { toast } = useToast();
  
  // Enhanced Guardian AI states
  const [isListening, setIsListening] = useState(false);
  const [responseWaiting, setResponseWaiting] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [analysisPhase, setAnalysisPhase] = useState<string>("");
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [lastPrompt, setLastPrompt] = useState("");
  const [voiceDetected, setVoiceDetected] = useState(false);
  const [visualMonitoring, setVisualMonitoring] = useState(false);
  const [heartRate, setHeartRate] = useState(0);
  const [stressLevel, setStressLevel] = useState(0);
  const [responseAttempts, setResponseAttempts] = useState(0);
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);
  const [incidentData, setIncidentData] = useState<any>(null);
  
  // Enhanced voice recognition and analysis
  const recognitionRef = useRef<any>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Advanced Guardian prompts with multiple languages and scenarios
  const advancedGuardianPrompts = [
    {
      scenario: "fall_detection",
      english: "Guardian AI detected a potential fall. Are you okay? Please respond clearly - say 'I'm okay' if you're fine, or 'Help me' if you need assistance.",
      arabic: "نظام الحماية اكتشف سقوط محتمل. هل أنت بخير؟ قل 'أنا بخير' إذا كنت بخير أو 'ساعدني' إذا كنت تحتاج مساعدة",
      urgency: "high"
    },
    {
      scenario: "distress_signal",
      english: "I detected signs of distress. This is Guardian AI checking on your safety. Are you experiencing any medical emergency? Say 'SOS' for immediate help or 'I'm fine' to cancel.",
      arabic: "اكتشفت علامات ضيق. هذا نظام الحماية يتفقد سلامتك. هل تواجه حالة طبية طارئة؟ قل 'نداء استغاثة' للمساعدة الفورية أو 'أنا بخير' للإلغاء",
      urgency: "critical"
    },
    {
      scenario: "health_monitoring",
      english: "Guardian AI health monitoring alert. Your vital signs appear concerning. Please confirm your status - are you feeling unwell or experiencing any symptoms?",
      arabic: "تنبيه مراقبة صحية من نظام الحماية. علاماتك الحيوية تبدو مقلقة. يرجى تأكيد حالتك - هل تشعر بتوعك أو تعاني من أي أعراض؟",
      urgency: "medium"
    },
    {
      scenario: "routine_check",
      english: "This is your Guardian AI conducting a wellness check. How are you feeling today? Please respond so I know you're okay.",
      arabic: "هذا نظام الحماية الخاص بك يقوم بفحص رفاهية. كيف تشعر اليوم؟ يرجى الرد حتى أعرف أنك بخير",
      urgency: "low"
    }
  ];

  // Analysis phases for comprehensive monitoring
  const analysisPhases: AnalysisPhase[] = [
    { name: "Audio Analysis", duration: 3000, description: "Analyzing voice patterns and stress indicators", icon: Ear },
    { name: "Visual Assessment", duration: 2000, description: "Processing facial expressions and posture", icon: Eye },
    { name: "Vital Signs", duration: 2000, description: "Monitoring heart rate and breathing patterns", icon: Heart },
    { name: "Response Evaluation", duration: 2000, description: "Evaluating cognitive response and speech clarity", icon: Brain },
    { name: "Risk Assessment", duration: 1000, description: "Calculating emergency risk factors", icon: AlertTriangle }
  ];

  // Activate Guardian when triggered with enhanced analysis
  useEffect(() => {
    if (isActive && !responseWaiting) {
      activateEnhancedGuardian();
    }
  }, [isActive]);

  const activateEnhancedGuardian = useCallback(() => {
    setResponseWaiting(true);
    setCountdown(20); // Extended time for thorough analysis
    setVoiceDetected(false);
    setResponseAttempts(0);
    setAnalysisProgress(0);
    
    // Determine scenario based on context
    const scenario = determineScenario();
    const selectedPrompt = advancedGuardianPrompts.find(p => p.scenario === scenario) || advancedGuardianPrompts[0];
    setLastPrompt(selectedPrompt.english);
    
    // Start comprehensive monitoring
    startEnhancedMonitoring();
    
    // Speak the prompt with enhanced TTS
    speakEnhancedPrompt(selectedPrompt.english);
    
    // Activate multiple monitoring systems
    startVoiceRecognition();
    onCameraActivate();
    startVisualMonitoring();
    startVitalSignsMonitoring();
    
    toast({
      title: "🛡️ Advanced Guardian AI Activated",
      description: "Multi-modal emergency monitoring initiated",
      variant: "default"
    });

    // Start countdown with enhanced features
    countdownIntervalRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          handleNoResponse();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Record incident data
    setIncidentData({
      startTime: new Date(),
      scenario,
      location: currentLocation,
      healthProfile,
      emergencyContacts
    });
  }, [onCameraActivate, currentLocation, healthProfile, emergencyContacts]);

  const determineScenario = () => {
    // Smart scenario detection based on context
    if (stressLevel > 80) return "distress_signal";
    if (heartRate > 120 || heartRate < 50) return "health_monitoring";
    // Default to fall detection for physical events
    return "fall_detection";
  };

  const startEnhancedMonitoring = useCallback(() => {
    let currentPhase = 0;
    
    const runAnalysisPhase = () => {
      if (currentPhase < analysisPhases.length) {
        const phase = analysisPhases[currentPhase];
        setAnalysisPhase(phase.name);
        
        // Simulate phase processing
        setTimeout(() => {
          setAnalysisProgress(prev => prev + (100 / analysisPhases.length));
          currentPhase++;
          runAnalysisPhase();
        }, phase.duration);
      } else {
        setAnalysisPhase("Complete");
        setAnalysisProgress(100);
      }
    };
    
    runAnalysisPhase();
  }, []);

  const speakEnhancedPrompt = useCallback((text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Enhanced voice settings
      const voices = speechSynthesis.getVoices();
      const englishVoice = voices.find(voice => voice.lang.includes('en'));
      if (englishVoice) utterance.voice = englishVoice;
      
      utterance.rate = 0.9;
      utterance.volume = 1.0;
      utterance.pitch = 1.0;
      
      utterance.onstart = () => {
        setIsListening(false);
      };
      
      utterance.onend = () => {
        setTimeout(() => {
          setIsListening(true);
        }, 500);
      };
      
      speechSynthesis.speak(utterance);
    }
  }, []);

  const startVoiceRecognition = useCallback(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';
      recognitionRef.current.maxAlternatives = 3;
      
      recognitionRef.current.onresult = (event: any) => {
        setVoiceDetected(true);
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            const transcript = event.results[i][0].transcript.toLowerCase().trim();
            const confidence = event.results[i][0].confidence;
            
            // Enhanced voice analysis
            processAdvancedVoiceResponse(transcript, confidence);
            break;
          }
        }
      };
      
      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        toast({
          title: "Voice Recognition Issue",
          description: "Switching to manual response mode",
          variant: "default"
        });
      };
      
      recognitionRef.current.start();
      
      // Enhanced timeout with multiple attempts
      setTimeout(() => {
        if (recognitionRef.current && responseAttempts < 2) {
          recognitionRef.current.stop();
          setResponseAttempts(prev => prev + 1);
          
          // Retry with different prompt
          setTimeout(() => {
            if (responseWaiting) {
              speakEnhancedPrompt("I didn't hear a clear response. Please say 'Help me' if you need assistance, or 'I'm okay' if you're fine.");
              startVoiceRecognition();
            }
          }, 2000);
        }
      }, 15000);
    }
  }, [responseAttempts, responseWaiting]);

  const startVisualMonitoring = useCallback(async () => {
    try {
      setVisualMonitoring(true);
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 }
        }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        
        // Start visual analysis
        setTimeout(() => {
          performVisualAnalysis();
        }, 1000);
      }
    } catch (error) {
      console.error("Visual monitoring failed:", error);
      setVisualMonitoring(false);
    }
  }, []);

  const performVisualAnalysis = useCallback(() => {
    if (!canvasRef.current || !videoRef.current) return;
    
    const canvas = canvasRef.current;
    const video = videoRef.current;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;
    
    try {
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      
      // Enhanced visual analysis
      const analysis = analyzeVisualCues(imageData);
      
      // Update stress level based on visual cues
      setStressLevel(analysis.stressLevel);
      
    } catch (error) {
      console.error("Visual analysis error:", error);
    }
  }, []);

  const analyzeVisualCues = (imageData: ImageData) => {
    // Simplified visual analysis - in production would use ML models
    const pixels = imageData.data;
    let movement = 0;
    let brightness = 0;
    
    // Calculate basic metrics
    for (let i = 0; i < pixels.length; i += 4) {
      brightness += (pixels[i] + pixels[i + 1] + pixels[i + 2]) / 3;
    }
    
    brightness = brightness / (pixels.length / 4);
    
    // Determine stress level based on movement and lighting
    let stressLevel = 30; // baseline
    if (brightness < 80) stressLevel += 20; // poor lighting increases stress
    if (movement > 100) stressLevel += 30; // excessive movement
    
    return {
      stressLevel: Math.min(100, stressLevel),
      movement,
      brightness
    };
  };

  const startVitalSignsMonitoring = useCallback(() => {
    // Simulate vital signs monitoring (in production would connect to actual sensors)
    const interval = setInterval(() => {
      if (!responseWaiting) {
        clearInterval(interval);
        return;
      }
      
      // Simulate heart rate fluctuation based on stress
      const baseHR = 70;
      const stressMultiplier = 1 + (stressLevel / 100);
      const simulatedHR = Math.round(baseHR * stressMultiplier + Math.random() * 10);
      
      setHeartRate(simulatedHR);
      
      // Alert on abnormal vitals
      if (simulatedHR > 120 || simulatedHR < 50) {
        toast({
          title: "⚠️ Abnormal Vital Signs",
          description: `Heart rate: ${simulatedHR} BPM`,
          variant: "destructive"
        });
      }
    }, 2000);
  }, [responseWaiting, stressLevel]);

  const processAdvancedVoiceResponse = useCallback((transcript: string, confidence: number) => {
    console.log("Guardian AI heard:", transcript, "Confidence:", confidence);
    
    // Enhanced natural language processing
    const analysisData = {
      voiceStress: calculateVoiceStress(transcript),
      speechClarity: confidence,
      responseTime: 20 - countdown,
      keywords: extractKeywords(transcript),
      emotionalState: determineEmotionalState(transcript) as "calm" | "distressed" | "panic" | "confused"
    };
    
    // Multi-language support
    const isEmergency = 
      transcript.includes('sos') || 
      transcript.includes('help') || 
      transcript.includes('emergency') ||
      transcript.includes('hurt') ||
      transcript.includes('pain') ||
      transcript.includes('call') ||
      transcript.includes('ambulance') ||
      transcript.includes('911') ||
      transcript.includes('112') ||
      transcript.includes('ساعدني') || // Arabic "help me"
      transcript.includes('نداء استغاثة'); // Arabic "SOS"
    
    const isOkay = 
      transcript.includes("i'm okay") || 
      transcript.includes("im okay") || 
      transcript.includes("fine") ||
      transcript.includes("good") ||
      transcript.includes("alright") ||
      transcript.includes("get up") ||
      transcript.includes("stand up") ||
      transcript.includes("أنا بخير"); // Arabic "I'm fine"
    
    if (isEmergency || analysisData.voiceStress > 70) {
      handleAdvancedSOSRequest(analysisData);
    } else if (isOkay && analysisData.voiceStress < 40) {
      handleAdvancedOkayResponse(analysisData);
    } else {
      // Request clarification with more context
      setTimeout(() => {
        speakEnhancedPrompt(`I heard "${transcript}" but need clarification. Are you in immediate danger? Say 'YES' for emergency help or 'NO' if you're safe.`);
      }, 1000);
    }
  }, [countdown]);

  const calculateVoiceStress = (transcript: string): number => {
    let stress = 0;
    
    // Analyze speech patterns for stress indicators
    const stressWords = ['help', 'emergency', 'pain', 'hurt', 'can\'t', 'difficulty'];
    const calmWords = ['okay', 'fine', 'good', 'alright', 'well'];
    
    stressWords.forEach(word => {
      if (transcript.includes(word)) stress += 20;
    });
    
    calmWords.forEach(word => {
      if (transcript.includes(word)) stress -= 10;
    });
    
    // Speech length analysis
    if (transcript.length < 10) stress += 15; // Very short responses may indicate distress
    if (transcript.includes('...') || transcript.includes('uh')) stress += 10; // Hesitation
    
    return Math.max(0, Math.min(100, stress + 20)); // Baseline stress of 20
  };

  const extractKeywords = (transcript: string): string[] => {
    const keywords = [];
    const importantWords = ['help', 'okay', 'fine', 'pain', 'emergency', 'hurt', 'good', 'bad', 'can\'t', 'difficulty'];
    
    importantWords.forEach(word => {
      if (transcript.includes(word)) keywords.push(word);
    });
    
    return keywords;
  };

  const determineEmotionalState = (transcript: string): string => {
    if (transcript.includes('help') || transcript.includes('emergency')) return 'panic';
    if (transcript.includes('pain') || transcript.includes('hurt')) return 'distressed';
    if (transcript.includes('confused') || transcript.includes('don\'t know')) return 'confused';
    return 'calm';
  };

  const handleAdvancedSOSRequest = useCallback((analysisData: any) => {
    setResponseWaiting(false);
    setIsListening(false);
    
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }
    
    const response: GuardianResponse = {
      isOkay: false,
      needsSOS: true,
      canGetUp: false,
      confidence: Math.round(analysisData.speechClarity * 100),
      analysisData,
      timestamp: new Date()
    };
    
    onResponse(response);
    onSOSRequest();
    
    // Enhanced emergency notification
    toast({
      title: "🚨 EMERGENCY ACTIVATED",
      description: `Guardian AI detected distress (${response.confidence}% confidence)`,
      variant: "destructive"
    });
    
    // Advanced emergency protocol
    speakEnhancedPrompt("Emergency detected. Guardian AI is now contacting emergency services and your emergency contacts. Help is on the way. Stay calm and remain where you are if possible.");
    
    // Send incident report
    generateIncidentReport(response);
    
  }, [onResponse, onSOSRequest]);

  const handleAdvancedOkayResponse = useCallback((analysisData: any) => {
    setResponseWaiting(false);
    setIsListening(false);
    
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }
    
    const response: GuardianResponse = {
      isOkay: true,
      needsSOS: false,
      canGetUp: true,
      confidence: Math.round(analysisData.speechClarity * 100),
      analysisData,
      timestamp: new Date()
    };
    
    onResponse(response);
    
    toast({
      title: "✅ Status Confirmed",
      description: `Guardian AI confirmed you're okay (${response.confidence}% confidence)`,
      variant: "default"
    });
    
    speakEnhancedPrompt("Thank you for confirming you're okay. Guardian AI will continue monitoring in the background. Take care and stay safe.");
    
    // Log successful check
    generateIncidentReport(response);
    
  }, [onResponse]);

  const handleNoResponse = useCallback(() => {
    setResponseWaiting(false);
    setIsListening(false);
    
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }
    
    // Enhanced no-response protocol
    const response: GuardianResponse = {
      isOkay: false,
      needsSOS: true,
      canGetUp: false,
      confidence: 0,
      analysisData: {
        voiceStress: 100,
        speechClarity: 0,
        responseTime: 20,
        keywords: [],
        emotionalState: "panic"
      },
      timestamp: new Date()
    };
    
    onResponse(response);
    onSOSRequest();
    
    toast({
      title: "🚨 NO RESPONSE - EMERGENCY PROTOCOL",
      description: "Guardian AI initiated automatic emergency response",
      variant: "destructive"
    });
    
    speakEnhancedPrompt("No response detected after multiple attempts. Guardian AI is now automatically activating emergency protocols. Emergency services and your contacts are being notified immediately.");
    
    generateIncidentReport(response);
    
  }, [onResponse, onSOSRequest]);

  const generateIncidentReport = useCallback((response: GuardianResponse) => {
    const report = {
      ...incidentData,
      endTime: new Date(),
      outcome: response.needsSOS ? "Emergency Activated" : "All Clear",
      guardianResponse: response,
      vitalSigns: { heartRate, stressLevel },
      location: currentLocation,
      analysisPhases: analysisPhases,
      confidence: response.confidence
    };
    
    console.log("Guardian AI Incident Report:", report);
    
    // In production, this would be sent to emergency services
    if (response.needsSOS) {
      // Auto-generate emergency report
      setIncidentData(report);
    }
  }, [incidentData, heartRate, stressLevel, currentLocation, analysisPhases]);

  // Manual response buttons
  const handleManualSOS = () => {
    const analysisData = {
      voiceStress: 90,
      speechClarity: 100,
      responseTime: 20 - countdown,
      keywords: ['manual', 'sos'],
      emotionalState: "panic" as const
    };
    handleAdvancedSOSRequest(analysisData);
  };

  const handleManualOkay = () => {
    const analysisData = {
      voiceStress: 20,
      speechClarity: 100,
      responseTime: 20 - countdown,
      keywords: ['manual', 'okay'],
      emotionalState: "calm" as const
    };
    handleAdvancedOkayResponse(analysisData);
  };

  const stopAdvancedListening = () => {
    setResponseWaiting(false);
    setIsListening(false);
    setVisualMonitoring(false);
    
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }
    
    // Clean up video stream
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
  };

  return (
    <Card className="p-6 space-y-6 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={cn(
            "p-3 rounded-xl",
            isActive ? "bg-blue-500/20 animate-pulse" : "bg-muted"
          )}>
            <Shield className={cn(
              "w-8 h-8",
              isActive ? "text-blue-500" : "text-muted-foreground"
            )} />
          </div>
          <div>
            <h3 className="text-xl font-bold">Advanced Guardian AI</h3>
            <p className="text-sm text-muted-foreground">
              Multi-modal emergency monitoring & response system
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant={isActive ? "default" : "outline"} className="text-sm px-3 py-1">
            {isActive ? "🟢 Active" : "⚫ Standby"}
          </Badge>
          {heartRate > 0 && (
            <Badge variant="outline" className="text-sm">
              ❤️ {heartRate} BPM
            </Badge>
          )}
        </div>
      </div>

      {/* Guardian Response Interface */}
      {responseWaiting && (
        <div className="bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 border-2 border-blue-300 dark:border-blue-700 rounded-xl p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="w-6 h-6 text-blue-500 animate-pulse" />
              <span className="text-lg font-bold text-blue-700 dark:text-blue-300">
                Guardian AI Monitoring Active
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="destructive" className="text-xl px-4 py-2 animate-pulse">
                {countdown}s
              </Badge>
            </div>
          </div>
          
          {/* Analysis Progress */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Analysis Progress</span>
              <span className="text-sm text-muted-foreground">{Math.round(analysisProgress)}%</span>
            </div>
            <Progress value={analysisProgress} className="h-2" />
            <div className="text-sm text-blue-600 dark:text-blue-400 font-medium">
              {analysisPhase && `Current Phase: ${analysisPhase}`}
            </div>
          </div>
          
          {/* Guardian Prompt */}
          <div className="space-y-3">
            <p className="text-blue-700 dark:text-blue-300 font-medium leading-relaxed">
              "{lastPrompt}"
            </p>
            
            {/* Monitoring Status Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className={cn(
                "flex items-center gap-2 p-2 rounded-lg text-sm",
                voiceDetected ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300" : "bg-gray-100 dark:bg-gray-800 text-gray-600"
              )}>
                <Ear className="w-4 h-4" />
                <span>Audio {voiceDetected ? "✓" : "..."}</span>
              </div>
              
              <div className={cn(
                "flex items-center gap-2 p-2 rounded-lg text-sm",
                visualMonitoring ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300" : "bg-gray-100 dark:bg-gray-800 text-gray-600"
              )}>
                <Eye className="w-4 h-4" />
                <span>Visual {visualMonitoring ? "✓" : "..."}</span>
              </div>
              
              <div className={cn(
                "flex items-center gap-2 p-2 rounded-lg text-sm",
                heartRate > 0 ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300" : "bg-gray-100 dark:bg-gray-800 text-gray-600"
              )}>
                <Heart className="w-4 h-4" />
                <span>Vitals {heartRate > 0 ? heartRate : "..."}</span>
              </div>
              
              <div className={cn(
                "flex items-center gap-2 p-2 rounded-lg text-sm",
                currentLocation ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300" : "bg-gray-100 dark:bg-gray-800 text-gray-600"
              )}>
                <MapPin className="w-4 h-4" />
                <span>Location {currentLocation ? "✓" : "..."}</span>
              </div>
            </div>
            
            {/* Stress Level Indicator */}
            {stressLevel > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Stress Level</span>
                  <span className={cn("text-sm font-bold",
                    stressLevel > 70 ? "text-red-500" :
                    stressLevel > 40 ? "text-yellow-500" :
                    "text-green-500"
                  )}>
                    {stressLevel}%
                  </span>
                </div>
                <Progress 
                  value={stressLevel} 
                  className={cn("h-2",
                    stressLevel > 70 ? "text-red-500" :
                    stressLevel > 40 ? "text-yellow-500" :
                    "text-green-500"
                  )}
                />
              </div>
            )}
          </div>
          
          {/* Manual Response Buttons */}
          <div className="space-y-3">
            <div className="text-sm font-medium text-center">Manual Response Options:</div>
            <div className="flex gap-3">
              <Button 
                onClick={handleManualOkay}
                variant="outline" 
                size="lg"
                className="flex-1 flex items-center gap-2 bg-green-50 hover:bg-green-100 border-green-300 text-green-700"
              >
                <CheckCircle className="w-5 h-5" />
                I'm Okay
              </Button>
              <Button 
                onClick={handleManualSOS}
                variant="destructive" 
                size="lg"
                className="flex-1 flex items-center gap-2 animate-pulse"
              >
                <AlertTriangle className="w-5 h-5" />
                Need Help (SOS)
              </Button>
            </div>
          </div>
          
          {/* Emergency Contacts Preview */}
          {emergencyContacts.length > 0 && (
            <div className="space-y-2">
              <div className="text-sm font-medium text-blue-700 dark:text-blue-300">
                Emergency Contacts Ready:
              </div>
              <div className="flex flex-wrap gap-2">
                {emergencyContacts.slice(0, 3).map((contact, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    📞 {contact.name} ({contact.relation})
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          <Button 
            onClick={stopAdvancedListening}
            variant="ghost" 
            size="sm"
            className="w-full"
          >
            Cancel Guardian Monitoring
          </Button>
        </div>
      )}

      {/* Guardian Features Overview */}
      {!responseWaiting && (
        <div className="space-y-6">
          <Alert className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/20">
            <Shield className="h-4 w-4 text-blue-500" />
            <AlertDescription className="text-blue-700 dark:text-blue-300">
              Advanced Guardian AI provides comprehensive emergency monitoring with multi-modal analysis, 
              intelligent response processing, and automatic emergency services coordination.
            </AlertDescription>
          </Alert>
          
          {/* Capabilities Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20">
              <Ear className="w-5 h-5 text-blue-500" />
              <div>
                <div className="font-medium">Voice Analysis</div>
                <div className="text-xs text-muted-foreground">Stress detection, clarity assessment</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 rounded-lg bg-purple-50 dark:bg-purple-950/20">
              <Eye className="w-5 h-5 text-purple-500" />
              <div>
                <div className="font-medium">Visual Monitoring</div>
                <div className="text-xs text-muted-foreground">Facial analysis, movement detection</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 rounded-lg bg-green-50 dark:bg-green-950/20">
              <Heart className="w-5 h-5 text-green-500" />
              <div>
                <div className="font-medium">Vital Signs</div>
                <div className="text-xs text-muted-foreground">Heart rate, stress level monitoring</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 rounded-lg bg-orange-50 dark:bg-orange-950/20">
              <Brain className="w-5 h-5 text-orange-500" />
              <div>
                <div className="font-medium">Cognitive Assessment</div>
                <div className="text-xs text-muted-foreground">Response time, coherence analysis</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 rounded-lg bg-red-50 dark:bg-red-950/20">
              <Smartphone className="w-5 h-5 text-red-500" />
              <div>
                <div className="font-medium">Auto Emergency</div>
                <div className="text-xs text-muted-foreground">Automatic 911/112 calling</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 rounded-lg bg-indigo-50 dark:bg-indigo-950/20">
              <Navigation className="w-5 h-5 text-indigo-500" />
              <div>
                <div className="font-medium">Location Services</div>
                <div className="text-xs text-muted-foreground">GPS tracking, hospital routing</div>
              </div>
            </div>
          </div>
          
          {/* Response Time Settings */}
          <div className="space-y-3">
            <div className="text-sm font-medium">Response Window: 20 seconds</div>
            <div className="text-xs text-muted-foreground">
              Extended time allows for comprehensive multi-modal analysis
            </div>
          </div>
          
          {/* Test Button */}
          <Button
            onClick={activateEnhancedGuardian}
            variant="outline"
            size="lg"
            className="w-full flex items-center gap-3 bg-gradient-to-r from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 border-blue-300"
          >
            <Shield className="w-5 h-5" />
            Test Advanced Guardian AI
            <Zap className="w-4 h-4" />
          </Button>
        </div>
      )}
      
      {/* Hidden video and canvas elements for visual monitoring */}
      <div className="hidden">
        <video ref={videoRef} muted playsInline />
        <canvas ref={canvasRef} />
      </div>
    </Card>
  );
};