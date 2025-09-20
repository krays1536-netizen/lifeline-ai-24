import React, { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX,
  Zap,
  Heart,
  Phone,
  Navigation,
  Activity,
  Brain,
  Languages,
  CheckCircle
} from 'lucide-react';

interface VoiceCommand {
  id: string;
  trigger: string[];
  action: string;
  description: string;
  category: 'emergency' | 'health' | 'navigation' | 'general';
  response: string;
}

const voiceCommands: VoiceCommand[] = [
  // Emergency Commands
  {
    id: 'emergency_sos',
    trigger: ['emergency', 'help me', 'call help', 'sos now'],
    action: 'TRIGGER_SOS',
    description: 'Activate emergency SOS',
    category: 'emergency',
    response: 'Activating emergency SOS. Contacting trusted contacts now.'
  },
  {
    id: 'call_ambulance',
    trigger: ['call ambulance', 'need ambulance', 'medical emergency'],
    action: 'CALL_EMERGENCY',
    description: 'Call emergency services',
    category: 'emergency',
    response: 'Calling Kuwait emergency services at 112.'
  },
  
  // Health Commands
  {
    id: 'check_heart_rate',
    trigger: ['check heart rate', 'scan heart', 'measure pulse'],
    action: 'START_HEART_SCAN',
    description: 'Start heart rate monitoring',
    category: 'health',
    response: 'Starting heart rate scan. Please place your finger on the camera.'
  },
  {
    id: 'stress_analysis',
    trigger: ['check stress', 'analyze stress', 'stress level'],
    action: 'START_STRESS_SCAN',
    description: 'Analyze stress levels',
    category: 'health',
    response: 'Starting stress analysis. Please look at the camera.'
  },
  {
    id: 'health_status',
    trigger: ['health status', 'how am i', 'vital signs'],
    action: 'SHOW_HEALTH_DASHBOARD',
    description: 'Show current health status',
    category: 'health',
    response: 'Displaying your current health dashboard.'
  },
  
  // Navigation Commands
  {
    id: 'find_hospital',
    trigger: ['find hospital', 'nearest hospital', 'medical center'],
    action: 'FIND_HOSPITAL',
    description: 'Find nearest hospital',
    category: 'navigation',
    response: 'Finding the nearest hospital in Kuwait.'
  },
  {
    id: 'share_location',
    trigger: ['share location', 'send location', 'where am i'],
    action: 'SHARE_LOCATION',
    description: 'Share current location',
    category: 'navigation',
    response: 'Sharing your current location with trusted contacts.'
  }
];

interface VoiceCommandSystemProps {
  onCommand?: (action: string, data?: any) => void;
  enabled?: boolean;
}

export const VoiceCommandSystem: React.FC<VoiceCommandSystemProps> = ({ 
  onCommand,
  enabled = true 
}) => {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [confidence, setConfidence] = useState(0);
  const [lastCommand, setLastCommand] = useState<VoiceCommand | null>(null);
  const [language, setLanguage] = useState<'en' | 'ar'>('en');
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  const recognitionRef = useRef<any>(null);
  const synthesisRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    // Check if speech recognition is supported
    const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      setIsSupported(true);
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = language === 'en' ? 'en-US' : 'ar-KW';

      recognitionRef.current.onstart = () => {
        setIsListening(true);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current.onresult = (event: any) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          const confidence = event.results[i][0].confidence;

          if (event.results[i].isFinal) {
            finalTranscript += transcript;
            setConfidence(confidence);
          } else {
            interimTranscript += transcript;
          }
        }

        setTranscript(finalTranscript || interimTranscript);

        if (finalTranscript) {
          processCommand(finalTranscript.toLowerCase(), confidence);
        }
      };
    }

    // Initialize speech synthesis
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      synthesisRef.current = window.speechSynthesis;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [language]);

  const processCommand = (text: string, confidence: number) => {
    console.log('Processing command:', text, 'Confidence:', confidence);
    
    // Find matching command
    const matchedCommand = voiceCommands.find(cmd => 
      cmd.trigger.some(trigger => 
        text.includes(trigger.toLowerCase())
      )
    );

    if (matchedCommand && confidence > 0.7) {
      setLastCommand(matchedCommand);
      
      // Speak response
      speakResponse(matchedCommand.response);
      
      // Execute command
      onCommand?.(matchedCommand.action, { text, confidence, command: matchedCommand });
    }
  };

  const speakResponse = (text: string) => {
    if (synthesisRef.current && !isSpeaking) {
      setIsSpeaking(true);
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language === 'en' ? 'en-US' : 'ar';
      utterance.rate = 0.9;
      utterance.pitch = 1;
      
      utterance.onend = () => {
        setIsSpeaking(false);
      };
      
      synthesisRef.current.speak(utterance);
    }
  };

  const startListening = () => {
    if (recognitionRef.current && enabled) {
      setTranscript('');
      setLastCommand(null);
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  const toggleLanguage = () => {
    const newLang = language === 'en' ? 'ar' : 'en';
    setLanguage(newLang);
    
    if (recognitionRef.current) {
      recognitionRef.current.lang = newLang === 'en' ? 'en-US' : 'ar-KW';
    }
  };

  if (!isSupported) {
    return (
      <Card className="p-4 border-yellow-500/20 bg-yellow-500/5">
        <div className="text-center space-y-2">
          <VolumeX className="w-8 h-8 text-yellow-500 mx-auto" />
          <p className="text-sm text-muted-foreground">
            Voice commands not supported in this browser
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Voice Control Header */}
      <Card className="p-6 border-primary/20 bg-gradient-subtle">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-full ${isListening ? 'bg-red-500/10 animate-pulse' : 'bg-primary/10'}`}>
              {isListening ? (
                <Mic className="w-6 h-6 text-red-500" />
              ) : (
                <MicOff className="w-6 h-6 text-primary" />
              )}
            </div>
            <div>
              <h3 className="text-lg font-semibold">Voice Commands</h3>
              <p className="text-sm text-muted-foreground">
                Say "Hey LifeLine" + command
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleLanguage}
              className="flex items-center space-x-1"
            >
              <Languages className="w-4 h-4" />
              <span>{language.toUpperCase()}</span>
            </Button>
            
            {isSpeaking && (
              <Badge variant="secondary" className="animate-pulse">
                <Volume2 className="w-3 h-3 mr-1" />
                Speaking
              </Badge>
            )}
          </div>
        </div>

        {/* Listening Status */}
        <div className="space-y-3">
          {isListening && (
            <div className="p-3 bg-red-500/5 border border-red-500/20 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <span className="text-sm font-medium text-red-500">Listening...</span>
              </div>
              
              {transcript && (
                <div className="text-sm text-muted-foreground">
                  "{transcript}"
                  {confidence > 0 && (
                    <Badge variant="outline" className="ml-2 text-xs">
                      {Math.round(confidence * 100)}% confident
                    </Badge>
                  )}
                </div>
              )}
            </div>
          )}

          {lastCommand && (
            <div className="p-3 bg-green-500/5 border border-green-500/20 rounded-lg">
              <div className="flex items-center space-x-2 mb-1">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-sm font-medium text-green-500">
                  Command Recognized: {lastCommand.description}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                {lastCommand.response}
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Voice Controls */}
      <Card className="p-4 border-border/50 bg-card/50">
        <div className="flex justify-center space-x-3">
          <Button
            onClick={isListening ? stopListening : startListening}
            disabled={!enabled}
            className={`${
              isListening 
                ? 'bg-red-600 hover:bg-red-700 text-white' 
                : 'bg-primary hover:bg-primary/90'
            }`}
            size="lg"
          >
            {isListening ? (
              <>
                <MicOff className="w-4 h-4 mr-2" />
                Stop Listening
              </>
            ) : (
              <>
                <Mic className="w-4 h-4 mr-2" />
                Start Voice Control
              </>
            )}
          </Button>
        </div>
      </Card>

      {/* Available Commands */}
      <Card className="p-4 border-border/50 bg-card/50">
        <div className="space-y-4">
          <h4 className="font-medium text-sm">Available Commands</h4>
          
          <div className="grid grid-cols-1 gap-2">
            {voiceCommands.map(cmd => {
              const getCategoryIcon = () => {
                switch (cmd.category) {
                  case 'emergency': return Phone;
                  case 'health': return Heart;
                  case 'navigation': return Navigation;
                  default: return Activity;
                }
              };
              
              const IconComponent = getCategoryIcon();
              
              return (
                <div
                  key={cmd.id}
                  className={`flex items-center space-x-3 p-2 rounded text-xs ${
                    cmd.category === 'emergency' 
                      ? 'bg-red-500/5 border border-red-500/20' 
                      : 'bg-primary/5 border border-primary/20'
                  }`}
                >
                  <IconComponent className={`w-3 h-3 ${
                    cmd.category === 'emergency' ? 'text-red-500' : 'text-primary'
                  }`} />
                  <div className="flex-1">
                    <div className="font-medium">"{cmd.trigger[0]}"</div>
                    <div className="text-muted-foreground">{cmd.description}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Card>
    </div>
  );
};