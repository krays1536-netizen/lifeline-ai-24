import { useState, useRef, useCallback, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, Mic, Phone, Camera, AlertTriangle, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface GuardianResponse {
  isOkay: boolean;
  needsSOS: boolean;
  canGetUp: boolean;
  timestamp: Date;
}

interface ExhibitionGuardianAIProps {
  isActive: boolean;
  onResponse: (response: GuardianResponse) => void;
  onSOSRequest: () => void;
  onCameraActivate: () => void;
}

export const ExhibitionGuardianAI = ({ 
  isActive, 
  onResponse, 
  onSOSRequest, 
  onCameraActivate 
}: ExhibitionGuardianAIProps) => {
  const { toast } = useToast();
  
  // Guardian AI states
  const [isListening, setIsListening] = useState(false);
  const [responseWaiting, setResponseWaiting] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [lastPrompt, setLastPrompt] = useState("");
  const [voiceDetected, setVoiceDetected] = useState(false);
  
  // Voice recognition
  const recognitionRef = useRef<any>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Guardian voice prompts
  const guardianPrompts = [
    "Are you okay? Do you need emergency assistance or can you get up by yourself?",
    "I detected something concerning. Are you hurt? Say 'SOS' for emergency or 'I'm okay' to cancel.",
    "Guardian AI here. Please respond: Do you need help or are you able to continue safely?"
  ];

  // Activate Guardian when triggered
  useEffect(() => {
    if (isActive && !responseWaiting) {
      activateGuardian();
    }
  }, [isActive]);

  const activateGuardian = useCallback(() => {
    setResponseWaiting(true);
    setCountdown(15);
    setVoiceDetected(false);
    
    // Select random prompt
    const prompt = guardianPrompts[Math.floor(Math.random() * guardianPrompts.length)];
    setLastPrompt(prompt);
    
    // Speak the prompt
    speakPrompt(prompt);
    
    // Start voice recognition
    startVoiceRecognition();
    
    // Activate camera for visual monitoring
    onCameraActivate();
    
    toast({
      title: "🛡️ Guardian AI Active",
      description: "Listening for your response...",
      variant: "default"
    });

    // Start countdown
    countdownIntervalRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          // No response - assume emergency
          handleNoResponse();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [onCameraActivate]);

  const speakPrompt = useCallback((text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.volume = 1.0;
    utterance.pitch = 1.0;
    
    utterance.onend = () => {
      setIsListening(true);
    };
    
    speechSynthesis.speak(utterance);
  }, []);

  const startVoiceRecognition = useCallback(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';
      
      recognitionRef.current.onresult = (event: any) => {
        setVoiceDetected(true);
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            const transcript = event.results[i][0].transcript.toLowerCase().trim();
            processVoiceResponse(transcript);
            break;
          }
        }
      };
      
      recognitionRef.current.onerror = () => {
        toast({
          title: "Voice Recognition Error",
          description: "Using manual response buttons",
          variant: "default"
        });
      };
      
      recognitionRef.current.start();
      
      // Stop recognition after timeout
      setTimeout(() => {
        if (recognitionRef.current) {
          recognitionRef.current.stop();
        }
      }, 12000);
    }
  }, []);

  const processVoiceResponse = useCallback((transcript: string) => {
    console.log("Guardian AI heard:", transcript);
    
    // Analyze response
    const isEmergency = transcript.includes('sos') || 
                       transcript.includes('help') || 
                       transcript.includes('emergency') ||
                       transcript.includes('hurt') ||
                       transcript.includes('call') ||
                       transcript.includes('ambulance');
    
    const isOkay = transcript.includes("i'm okay") || 
                   transcript.includes("im okay") || 
                   transcript.includes("fine") ||
                   transcript.includes("good") ||
                   transcript.includes("get up") ||
                   transcript.includes("stand up");
    
    if (isEmergency) {
      handleSOSRequest();
    } else if (isOkay) {
      handleOkayResponse();
    } else {
      // Unclear response - ask for clarification
      setTimeout(() => {
        speakPrompt("I didn't understand. Please say 'SOS' for emergency or 'I'm okay' if you're fine.");
      }, 1000);
    }
  }, []);

  const handleSOSRequest = useCallback(() => {
    setResponseWaiting(false);
    setIsListening(false);
    
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }
    
    const response: GuardianResponse = {
      isOkay: false,
      needsSOS: true,
      canGetUp: false,
      timestamp: new Date()
    };
    
    onResponse(response);
    onSOSRequest();
    
    toast({
      title: "🚨 SOS ACTIVATED",
      description: "Emergency services being contacted",
      variant: "destructive"
    });
    
    speakPrompt("SOS activated. Emergency services are being contacted. Help is on the way.");
  }, [onResponse, onSOSRequest]);

  const handleOkayResponse = useCallback(() => {
    setResponseWaiting(false);
    setIsListening(false);
    
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }
    
    const response: GuardianResponse = {
      isOkay: true,
      needsSOS: false,
      canGetUp: true,
      timestamp: new Date()
    };
    
    onResponse(response);
    
    toast({
      title: "✅ All Clear",
      description: "Guardian AI standing down",
      variant: "default"
    });
    
    speakPrompt("Good to hear you're okay. Guardian AI standing down. Stay safe.");
  }, [onResponse]);

  const handleNoResponse = useCallback(() => {
    setResponseWaiting(false);
    setIsListening(false);
    
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }
    
    // No response assumes emergency
    const response: GuardianResponse = {
      isOkay: false,
      needsSOS: true,
      canGetUp: false,
      timestamp: new Date()
    };
    
    onResponse(response);
    onSOSRequest();
    
    toast({
      title: "🚨 NO RESPONSE - SOS AUTO-ACTIVATED",
      description: "Guardian AI initiated emergency protocol",
      variant: "destructive"
    });
    
    speakPrompt("No response detected. Guardian AI is activating emergency protocols. Help is being summoned.");
  }, [onResponse, onSOSRequest]);

  // Manual response buttons
  const handleManualSOS = () => {
    handleSOSRequest();
  };

  const handleManualOkay = () => {
    handleOkayResponse();
  };

  const stopListening = () => {
    setResponseWaiting(false);
    setIsListening(false);
    
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }
  };

  return (
    <Card className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={cn(
            "p-2 rounded-lg",
            isActive ? "bg-blue-500/20" : "bg-muted"
          )}>
            <Shield className={cn(
              "w-6 h-6",
              isActive ? "text-blue-500" : "text-muted-foreground"
            )} />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Guardian AI</h3>
            <p className="text-sm text-muted-foreground">
              AI-powered emergency response assistant
            </p>
          </div>
        </div>
        
        <Badge variant={isActive ? "default" : "outline"}>
          {isActive ? "Active" : "Standby"}
        </Badge>
      </div>

      {/* Guardian Response Interface */}
      {responseWaiting && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mic className="w-5 h-5 text-blue-500 animate-pulse" />
              <span className="font-semibold text-blue-700 dark:text-blue-300">
                Guardian AI Speaking
              </span>
            </div>
            <Badge variant="destructive" className="text-lg px-3 py-1">
              {countdown}s
            </Badge>
          </div>
          
          <div className="space-y-2">
            <p className="text-sm text-blue-600 dark:text-blue-400 italic">
              "{lastPrompt}"
            </p>
            
            <div className="flex items-center gap-2 text-sm">
              <div className={cn(
                "w-2 h-2 rounded-full",
                voiceDetected ? "bg-green-500 animate-pulse" : "bg-gray-400"
              )} />
              <span>{voiceDetected ? "Voice detected - Processing..." : "Listening for response..."}</span>
            </div>
            
            <div className="flex items-center gap-2 text-sm">
              <Camera className="w-4 h-4" />
              <span>Visual monitoring active</span>
            </div>
          </div>
          
          {/* Manual Response Buttons */}
          <div className="flex gap-2 pt-2">
            <Button 
              onClick={handleManualOkay}
              variant="outline" 
              size="sm"
              className="flex-1 flex items-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              I'm Okay
            </Button>
            <Button 
              onClick={handleManualSOS}
              variant="destructive" 
              size="sm"
              className="flex-1 flex items-center gap-2"
            >
              <AlertTriangle className="w-4 h-4" />
              Need SOS
            </Button>
          </div>
          
          <Button 
            onClick={stopListening}
            variant="ghost" 
            size="sm"
            className="w-full"
          >
            Cancel Guardian
          </Button>
        </div>
      )}

      {/* Guardian Features */}
      {!responseWaiting && (
        <div className="space-y-4">
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              Guardian AI monitors for falls, distress signals, and emergency situations. 
              When activated, it will ask for your status and respond accordingly.
            </AlertDescription>
          </Alert>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="flex items-center gap-2 text-sm">
              <Mic className="w-4 h-4 text-blue-500" />
              <span>Voice recognition</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Camera className="w-4 h-4 text-blue-500" />
              <span>Visual monitoring</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Phone className="w-4 h-4 text-blue-500" />
              <span>Auto-SOS activation</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <AlertTriangle className="w-4 h-4 text-blue-500" />
              <span>15s response window</span>
            </div>
          </div>
          
          {/* Test Button */}
          <Button
            onClick={activateGuardian}
            variant="outline"
            size="sm"
            className="w-full flex items-center gap-2"
          >
            <Shield className="w-4 h-4" />
            Test Guardian AI
          </Button>
        </div>
      )}
    </Card>
  );
};