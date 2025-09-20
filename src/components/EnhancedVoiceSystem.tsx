import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX,
  Brain,
  Zap,
  Heart,
  Phone,
  Navigation,
  Activity,
  Languages,
  CheckCircle,
  Waves,
  Headphones
} from 'lucide-react';

interface VoiceAnalysis {
  pitch: number;
  tone: 'calm' | 'stressed' | 'distressed' | 'panicked';
  speed: number;
  clarity: number;
  emotion: string;
  confidence: number;
}

interface VoiceCommand {
  id: string;
  trigger: string[];
  action: string;
  description: string;
  category: 'emergency' | 'health' | 'navigation' | 'general';
  response: string;
  priority: number;
}

interface EnhancedVoiceSystemProps {
  onCommand?: (action: string, data?: any) => void;
  enabled?: boolean;
  emergencyMode?: boolean;
}

const enhancedCommands: VoiceCommand[] = [
  // Emergency Commands (Highest Priority)
  {
    id: 'emergency_critical',
    trigger: ['help me', 'emergency', 'call help', 'i need help now', 'save me'],
    action: 'TRIGGER_SOS',
    description: 'Activate emergency SOS',
    category: 'emergency',
    response: 'Emergency activated. Contacting help immediately. Stay calm.',
    priority: 10
  },
  {
    id: 'medical_emergency',
    trigger: ['chest pain', 'heart attack', 'can\'t breathe', 'stroke', 'bleeding'],
    action: 'MEDICAL_EMERGENCY',
    description: 'Medical emergency detected',
    category: 'emergency',
    response: 'Medical emergency detected. Calling ambulance. Do not move.',
    priority: 10
  },
  {
    id: 'fall_detected',
    trigger: ['i fell', 'fell down', 'can\'t get up', 'injured', 'hurt'],
    action: 'FALL_EMERGENCY',
    description: 'Fall or injury emergency',
    category: 'emergency',
    response: 'Fall detected. Activating emergency protocol. Help is coming.',
    priority: 9
  },
  
  // Health Commands
  {
    id: 'vitals_check',
    trigger: ['check vitals', 'health status', 'scan heart', 'measure pulse'],
    action: 'START_HEALTH_SCAN',
    description: 'Comprehensive health scan',
    category: 'health',
    response: 'Starting comprehensive health scan. Please remain still.',
    priority: 7
  },
  {
    id: 'stress_analysis',
    trigger: ['check stress', 'analyze stress', 'feeling anxious'],
    action: 'STRESS_ANALYSIS',
    description: 'Stress level analysis',
    category: 'health',
    response: 'Analyzing stress levels. Please take deep breaths.',
    priority: 6
  },
  
  // Navigation Commands
  {
    id: 'find_hospital',
    trigger: ['find hospital', 'nearest hospital', 'medical center', 'emergency room'],
    action: 'FIND_HOSPITAL',
    description: 'Find nearest medical facility',
    category: 'navigation',
    response: 'Finding the nearest hospital. Preparing directions.',
    priority: 8
  },
  {
    id: 'share_location',
    trigger: ['share location', 'send location', 'where am i'],
    action: 'SHARE_LOCATION',
    description: 'Share current location',
    category: 'navigation',
    response: 'Sharing your location with emergency contacts.',
    priority: 7
  }
];

export const EnhancedVoiceSystem: React.FC<EnhancedVoiceSystemProps> = ({ 
  onCommand,
  enabled = true,
  emergencyMode = false
}) => {
  const { toast } = useToast();
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [lastCommand, setLastCommand] = useState<VoiceCommand | null>(null);
  const [language, setLanguage] = useState<'en' | 'ar'>('en');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceAnalysis, setVoiceAnalysis] = useState<VoiceAnalysis | null>(null);
  const [audioLevel, setAudioLevel] = useState(0);
  const [useElevenLabs, setUseElevenLabs] = useState(true);
  const [voiceQuality, setVoiceQuality] = useState<'premium' | 'standard'>('premium');
  
  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const microphoneRef = useRef<MediaStreamAudioSourceNode | null>(null);

  useEffect(() => {
    initializeSpeechRecognition();
    initializeAudioAnalysis();
    
    return () => {
      cleanupAudioAnalysis();
    };
  }, [language]);

  const initializeSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      setIsSupported(true);
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = language === 'en' ? 'en-US' : 'ar-KW';
      recognitionRef.current.maxAlternatives = 3;

      recognitionRef.current.onstart = () => {
        setIsListening(true);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
        if (emergencyMode) {
          // Auto-restart in emergency mode
          setTimeout(() => startListening(), 1000);
        }
      };

      recognitionRef.current.onresult = (event: any) => {
        processVoiceInput(event);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        toast({
          title: "Voice Recognition Error",
          description: "Please try again or check microphone permissions",
          variant: "destructive"
        });
      };
    }
  };

  const initializeAudioAnalysis = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      microphoneRef.current = audioContextRef.current.createMediaStreamSource(stream);
      
      microphoneRef.current.connect(analyserRef.current);
      analyserRef.current.fftSize = 256;
      
      startAudioAnalysis();
    } catch (error) {
      console.error('Audio analysis initialization failed:', error);
    }
  };

  const startAudioAnalysis = () => {
    if (!analyserRef.current) return;
    
    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    const analyze = () => {
      if (!analyserRef.current) return;
      
      analyserRef.current.getByteFrequencyData(dataArray);
      const average = dataArray.reduce((sum, value) => sum + value, 0) / bufferLength;
      setAudioLevel(average);
      
      // Advanced voice analysis
      if (average > 30) {
        analyzeVoiceCharacteristics(dataArray);
      }
      
      requestAnimationFrame(analyze);
    };
    
    analyze();
  };

  const analyzeVoiceCharacteristics = (frequencyData: Uint8Array) => {
    const lowFreq = frequencyData.slice(0, 32).reduce((sum, val) => sum + val, 0) / 32;
    const midFreq = frequencyData.slice(32, 96).reduce((sum, val) => sum + val, 0) / 64;
    const highFreq = frequencyData.slice(96).reduce((sum, val) => sum + val, 0) / (frequencyData.length - 96);
    
    const pitch = (highFreq / (lowFreq + 1)) * 100;
    const clarity = midFreq / 255;
    const speed = pitch > 150 ? 'fast' : pitch < 80 ? 'slow' : 'normal';
    
    let tone: VoiceAnalysis['tone'] = 'calm';
    let emotion = 'neutral';
    
    if (pitch > 180 && clarity < 0.4) {
      tone = 'panicked';
      emotion = 'extreme distress';
    } else if (pitch > 150) {
      tone = 'stressed';
      emotion = 'anxiety';
    } else if (pitch > 120) {
      tone = 'distressed';
      emotion = 'concern';
    }
    
    const analysis: VoiceAnalysis = {
      pitch,
      tone,
      speed: pitch,
      clarity,
      emotion,
      confidence: clarity
    };
    
    setVoiceAnalysis(analysis);
    
    // Emergency detection based on voice analysis
    if (tone === 'panicked' || (tone === 'distressed' && clarity < 0.3)) {
      handleVoiceEmergencyDetection();
    }
  };

  const handleVoiceEmergencyDetection = () => {
    toast({
      title: "🚨 Distress Detected in Voice",
      description: "Activating emergency monitoring",
      variant: "destructive"
    });
    
    onCommand?.('VOICE_DISTRESS_DETECTED', { analysis: voiceAnalysis });
  };

  const processVoiceInput = (event: any) => {
    let finalTranscript = '';
    let interimTranscript = '';
    let confidence = 0;

    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript;
      const resultConfidence = event.results[i][0].confidence;

      if (event.results[i].isFinal) {
        finalTranscript += transcript;
        confidence = resultConfidence;
      } else {
        interimTranscript += transcript;
      }
    }

    setTranscript(finalTranscript || interimTranscript);

    if (finalTranscript) {
      processCommand(finalTranscript.toLowerCase().trim(), confidence);
    }
  };

  const processCommand = async (text: string, confidence: number) => {
    console.log('Processing voice command:', text, 'Confidence:', confidence);
    
    // Find best matching command
    const matches = enhancedCommands
      .map(cmd => ({
        command: cmd,
        score: calculateMatchScore(text, cmd.trigger)
      }))
      .filter(match => match.score > 0.6)
      .sort((a, b) => b.command.priority - a.command.priority || b.score - a.score);

    if (matches.length > 0 && confidence > 0.5) {
      const bestMatch = matches[0].command;
      setLastCommand(bestMatch);
      
      // Speak response with enhanced voice
      await speakEnhancedResponse(bestMatch.response);
      
      // Execute command
      onCommand?.(bestMatch.action, { 
        text, 
        confidence, 
        command: bestMatch,
        voiceAnalysis 
      });

      toast({
        title: "Voice Command Executed",
        description: bestMatch.description,
        variant: bestMatch.category === 'emergency' ? 'destructive' : 'default'
      });
    } else {
      // Fuzzy emergency detection
      const emergencyWords = ['help', 'emergency', 'pain', 'hurt', 'sick', 'fall', 'accident'];
      const hasEmergencyContext = emergencyWords.some(word => text.includes(word));
      
      if (hasEmergencyContext && confidence > 0.3) {
        await speakEnhancedResponse("Emergency context detected. Activating safety protocols.");
        onCommand?.('EMERGENCY_CONTEXT', { text, confidence });
      }
    }
  };

  const calculateMatchScore = (text: string, triggers: string[]): number => {
    let maxScore = 0;
    
    for (const trigger of triggers) {
      if (text.includes(trigger)) {
        maxScore = Math.max(maxScore, 1.0);
      } else {
        // Fuzzy matching
        const words = trigger.split(' ');
        const matchedWords = words.filter(word => text.includes(word));
        const score = matchedWords.length / words.length;
        maxScore = Math.max(maxScore, score);
      }
    }
    
    return maxScore;
  };

  const speakEnhancedResponse = async (text: string) => {
    if (isSpeaking) return;
    
    setIsSpeaking(true);
    
    try {
      if (useElevenLabs && voiceQuality === 'premium') {
        await speakWithElevenLabs(text);
      } else {
        await speakWithBrowserAPI(text);
      }
    } catch (error) {
      console.error('Speech synthesis error:', error);
      await speakWithBrowserAPI(text); // Fallback
    } finally {
      setIsSpeaking(false);
    }
  };

  const speakWithElevenLabs = async (text: string) => {
    // Note: In production, this would use the actual ElevenLabs API
    // For now, we'll simulate the premium voice experience
    await speakWithBrowserAPI(text);
  };

  const speakWithBrowserAPI = (text: string): Promise<void> => {
    return new Promise((resolve) => {
      if (!('speechSynthesis' in window)) {
        resolve();
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language === 'en' ? 'en-US' : 'ar';
      utterance.rate = emergencyMode ? 1.1 : 0.9;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      
      // Select best available voice
      const voices = speechSynthesis.getVoices();
      const preferredVoice = voices.find(voice => 
        voice.name.includes('Google') || 
        voice.name.includes('Microsoft') ||
        voice.name.includes('Natural')
      );
      
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }
      
      utterance.onend = () => resolve();
      utterance.onerror = () => resolve();
      
      speechSynthesis.speak(utterance);
    });
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

  const cleanupAudioAnalysis = () => {
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
  };

  if (!isSupported) {
    return (
      <Card className="p-6 border-yellow-500/20 bg-yellow-500/5">
        <div className="text-center space-y-4">
          <VolumeX className="w-12 h-12 text-yellow-500 mx-auto" />
          <div>
            <h3 className="text-lg font-semibold text-yellow-600">Voice Commands Unavailable</h3>
            <p className="text-sm text-muted-foreground">
              This browser doesn't support voice recognition
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Voice Control Header */}
      <Card className="p-6 border-cyber-blue/30 bg-gradient-to-br from-cyber-blue/5 to-cyber-purple/5">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className={`
              relative p-3 rounded-xl transition-all duration-300
              ${isListening 
                ? 'bg-red-500/20 animate-pulse ring-2 ring-red-500/50' 
                : 'bg-cyber-blue/20'
              }
            `}>
              {isListening ? (
                <div className="relative">
                  <Mic className="w-8 h-8 text-red-500" />
                  <div className="absolute inset-0 animate-ping">
                    <Waves className="w-8 h-8 text-red-500/30" />
                  </div>
                </div>
              ) : (
                <MicOff className="w-8 h-8 text-cyber-blue" />
              )}
            </div>
            <div>
              <h3 className="text-xl font-bold text-foreground">Enhanced Voice AI</h3>
              <p className="text-sm text-muted-foreground">
                {emergencyMode ? "Emergency Mode Active" : "Advanced voice recognition with emotion analysis"}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleLanguage}
              className="flex items-center space-x-2"
            >
              <Languages className="w-4 h-4" />
              <span>{language.toUpperCase()}</span>
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setVoiceQuality(voiceQuality === 'premium' ? 'standard' : 'premium')}
              className="flex items-center space-x-2"
            >
              <Headphones className="w-4 h-4" />
              <span>{voiceQuality}</span>
            </Button>
            
            {isSpeaking && (
              <Badge variant="secondary" className="animate-pulse">
                <Volume2 className="w-3 h-3 mr-1" />
                Speaking
              </Badge>
            )}
            
            {emergencyMode && (
              <Badge variant="destructive" className="animate-pulse">
                🚨 EMERGENCY
              </Badge>
            )}
          </div>
        </div>

        {/* Audio Level Indicator */}
        <div className="mb-4">
          <div className="flex items-center space-x-3">
            <Activity className="w-4 h-4 text-cyber-blue" />
            <div className="flex-1">
              <Progress value={audioLevel} className="h-2" />
            </div>
            <span className="text-xs text-muted-foreground w-12">
              {audioLevel.toFixed(0)}%
            </span>
          </div>
        </div>

        {/* Voice Analysis */}
        {isListening && voiceAnalysis && (
          <Card className="p-4 bg-muted/20 mb-4 border-cyber-purple/30">
            <div className="flex items-center space-x-2 mb-3">
              <Brain className="w-4 h-4 text-cyber-purple" />
              <span className="text-sm font-medium">Real-time Voice Analysis</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div>
                <div className="text-muted-foreground">Tone</div>
                <div className={`font-medium ${
                  voiceAnalysis.tone === 'panicked' ? 'text-red-500' :
                  voiceAnalysis.tone === 'distressed' ? 'text-orange-500' :
                  voiceAnalysis.tone === 'stressed' ? 'text-yellow-500' :
                  'text-green-500'
                }`}>
                  {voiceAnalysis.tone}
                </div>
              </div>
              <div>
                <div className="text-muted-foreground">Emotion</div>
                <div className="font-medium text-cyber-blue">
                  {voiceAnalysis.emotion}
                </div>
              </div>
              <div>
                <div className="text-muted-foreground">Clarity</div>
                <div className={`font-medium ${
                  voiceAnalysis.clarity > 0.7 ? 'text-green-500' :
                  voiceAnalysis.clarity > 0.4 ? 'text-yellow-500' :
                  'text-red-500'
                }`}>
                  {(voiceAnalysis.clarity * 100).toFixed(0)}%
                </div>
              </div>
              <div>
                <div className="text-muted-foreground">Pitch</div>
                <div className="font-medium text-cyber-green">
                  {voiceAnalysis.pitch.toFixed(0)}Hz
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Listening Status */}
        {isListening && (
          <Card className="p-4 bg-red-500/5 border border-red-500/20 mb-4">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
              <span className="text-sm font-medium text-red-500">
                Active Listening - AI Processing
              </span>
            </div>
            
            {transcript && (
              <div className="text-sm text-foreground bg-background/50 p-2 rounded">
                "{transcript}"
              </div>
            )}
          </Card>
        )}

        {/* Last Command */}
        {lastCommand && (
          <Card className="p-4 bg-green-500/5 border border-green-500/20 mb-4">
            <div className="flex items-center space-x-2 mb-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-sm font-medium text-green-500">
                Command Executed: {lastCommand.description}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              {lastCommand.response}
            </p>
          </Card>
        )}
      </Card>

      {/* Voice Controls */}
      <Card className="p-6 border-border/50 bg-card/50">
        <div className="flex justify-center space-x-4">
          <Button
            onClick={isListening ? stopListening : startListening}
            disabled={!enabled}
            className={`${
              isListening 
                ? 'bg-red-600 hover:bg-red-700 text-white' 
                : 'bg-cyber-blue hover:bg-cyber-blue/90 text-white'
            } px-8 py-3 text-lg font-semibold transition-all duration-300`}
            size="lg"
          >
            {isListening ? (
              <>
                <MicOff className="w-5 h-5 mr-3" />
                Stop Listening
              </>
            ) : (
              <>
                <Mic className="w-5 h-5 mr-3" />
                Start Voice AI
              </>
            )}
          </Button>
          
          <Button
            onClick={() => speakEnhancedResponse("LifeLine voice assistant is ready. Say 'help me' for emergency assistance.")}
            variant="outline"
            size="lg"
            className="px-6"
          >
            <Volume2 className="w-5 h-5 mr-2" />
            Test Voice
          </Button>
        </div>
      </Card>

      {/* Available Commands */}
      <Card className="p-6 border-border/50 bg-card/50">
        <div className="space-y-4">
          <h4 className="font-semibold text-lg flex items-center space-x-2">
            <Zap className="w-5 h-5 text-cyber-purple" />
            <span>Voice Commands</span>
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {enhancedCommands.slice(0, 8).map(cmd => {
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
                  className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 ${
                    cmd.category === 'emergency' 
                      ? 'bg-red-500/5 border border-red-500/20 hover:bg-red-500/10' 
                      : 'bg-cyber-blue/5 border border-cyber-blue/20 hover:bg-cyber-blue/10'
                  }`}
                >
                  <IconComponent className={`w-4 h-4 ${
                    cmd.category === 'emergency' ? 'text-red-500' : 'text-cyber-blue'
                  }`} />
                  <div className="flex-1">
                    <div className="font-medium text-sm">"{cmd.trigger[0]}"</div>
                    <div className="text-muted-foreground text-xs">{cmd.description}</div>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${
                      cmd.category === 'emergency' ? 'border-red-500/50 text-red-500' : ''
                    }`}
                  >
                    Priority {cmd.priority}
                  </Badge>
                </div>
              );
            })}
          </div>
        </div>
      </Card>
    </div>
  );
};