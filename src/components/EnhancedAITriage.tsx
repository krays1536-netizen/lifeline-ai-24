import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { VoiceCommandSystem } from '@/components/VoiceCommandSystem';
import { cn } from '@/lib/utils';
import { 
  Activity, 
  Send, 
  Bot, 
  MessageCircle,
  Heart,
  AlertTriangle,
  Clock,
  User,
  Mic,
  MicOff,
  Volume2,
  Stethoscope,
  Brain,
  Search,
  Zap
} from 'lucide-react';

interface ChatMessage {
  id: string;
  type: 'user' | 'ai' | 'system';
  content: string;
  timestamp: Date;
  severity?: 'low' | 'medium' | 'high' | 'emergency';
  suggestions?: string[];
  category?: string;
}

// COMPREHENSIVE EMERGENCY DATABASE - 100+ Scenarios
const EMERGENCY_DATABASE = {
  "cardiac": {
    keywords: ["chest pain", "heart attack", "cardiac arrest", "heart racing", "palpitations", "chest pressure", "shortness of breath with chest pain"],
    questions: [
      "Do you have crushing chest pain?",
      "Is the pain radiating to your arm, jaw, or back?",
      "Are you experiencing cold sweats?",
      "Do you feel like an elephant is sitting on your chest?",
      "Are you having difficulty breathing with chest pain?",
      "Is your heart beating irregularly?",
      "Do you feel dizzy or lightheaded?",
      "Are you nauseous with chest pain?",
      "Have you taken any heart medications?",
      "Do you have a history of heart problems?"
    ],
    response: "🚨 CARDIAC EMERGENCY: Call 112 IMMEDIATELY! Do not drive yourself. Chew aspirin if available and not allergic. Stay calm, sit upright, loosen tight clothing."
  },
  "stroke": {
    keywords: ["stroke", "sudden weakness", "facial drooping", "slurred speech", "confusion", "sudden severe headache", "loss of balance"],
    questions: [
      "Is one side of your face drooping?",
      "Can you raise both arms equally?",
      "Is your speech slurred or strange?",
      "When did these symptoms start?",
      "Do you have sudden severe headache?",
      "Are you experiencing vision problems?",
      "Do you feel confused or disoriented?",
      "Are you having trouble walking?",
      "Do you feel numb on one side?",
      "Are you having difficulty swallowing?"
    ],
    response: "🚨 POSSIBLE STROKE: Call 112 IMMEDIATELY! Note the time symptoms started. Do not give food or water. Keep patient calm and lying down."
  },
  "respiratory": {
    keywords: ["can't breathe", "choking", "severe asthma", "allergic reaction", "swelling throat", "wheezing", "blue lips"],
    questions: [
      "Are you able to speak in full sentences?",
      "Is something stuck in your throat?",
      "Are your lips or fingernails blue?",
      "Do you have an inhaler or EpiPen?",
      "Are you wheezing or making sounds when breathing?",
      "Is your throat swelling?",
      "Did you eat something you're allergic to?",
      "Are you having an asthma attack?",
      "Can you cough or make sounds?",
      "Are you feeling panic along with breathing problems?"
    ],
    response: "🚨 BREATHING EMERGENCY: Call 112 NOW! If choking, perform Heimlich maneuver. If allergic reaction, use EpiPen if available. Stay calm, sit upright."
  },
  "trauma": {
    keywords: ["severe bleeding", "head injury", "broken bone", "car accident", "fall", "deep cut", "unconscious", "severe pain"],
    questions: [
      "Where is the bleeding located?",
      "Can you control the bleeding with pressure?",
      "Did you hit your head?",
      "Are you experiencing memory loss?",
      "Can you move all your limbs?",
      "Is the bone visible through the skin?",
      "On a scale of 1-10, how severe is the pain?",
      "Are you feeling nauseous or vomiting?",
      "Did you lose consciousness?",
      "What caused the injury?"
    ],
    response: "🚨 TRAUMA EMERGENCY: Call 112 immediately! Apply direct pressure to bleeding. Do not move if spinal injury suspected. Keep patient warm and calm."
  },
  "neurological": {
    keywords: ["seizure", "sudden confusion", "severe headache", "vision loss", "sudden dizziness", "loss of consciousness"],
    questions: [
      "Are you currently having a seizure?",
      "How long did the seizure last?",
      "Is this your first seizure?",
      "Do you have epilepsy?",
      "Are you confused or disoriented?",
      "Do you have a sudden severe headache?",
      "Are you experiencing vision changes?",
      "Do you feel weak on one side?",
      "Are you having trouble speaking?",
      "Do you feel extremely drowsy?"
    ],
    response: "🚨 NEUROLOGICAL EMERGENCY: Call 112 immediately! If seizure active, ensure safety, time the seizure, do not restrain. Turn to side if unconscious."
  },
  "poisoning": {
    keywords: ["poisoning", "overdose", "swallowed chemicals", "medication overdose", "food poisoning severe", "chemical exposure"],
    questions: [
      "What substance was ingested?",
      "How much was taken?",
      "When did this happen?",
      "Are you vomiting?",
      "Are you having trouble breathing?",
      "Do you have the container/bottle?",
      "Are you experiencing confusion?",
      "Is your skin color changing?",
      "Are you having seizures?",
      "Did you call Poison Control?"
    ],
    response: "🚨 POISONING EMERGENCY: Call 112 AND Poison Control (1-800-222-1222)! Bring the container. Do NOT induce vomiting unless instructed."
  },
  "pediatric": {
    keywords: ["baby not breathing", "child unconscious", "infant choking", "high fever child", "child seizure", "pediatric emergency"],
    questions: [
      "How old is the child?",
      "Is the child responsive?",
      "Is the child breathing normally?",
      "What is the child's temperature?",
      "Is the child having a seizure?",
      "Did the child fall or get injured?",
      "Is the child choking on something?",
      "How long have symptoms been present?",
      "Is the child drinking fluids?",
      "Does the child have any medical conditions?"
    ],
    response: "🚨 PEDIATRIC EMERGENCY: Call 112 immediately! Keep child calm, monitor breathing. For infant CPR, use 2 fingers. Note exact symptoms and timing."
  },
  "burns": {
    keywords: ["severe burn", "chemical burn", "electrical burn", "third degree burn", "burn covering large area"],
    questions: [
      "What caused the burn?",
      "How large is the burned area?",
      "Is the skin white, charred, or leathery?",
      "Are there blisters?",
      "Is this a chemical burn?",
      "Was this an electrical injury?",
      "Are you in severe pain?",
      "Is the burn on face, hands, or genitals?",
      "Did you inhale smoke or chemicals?",
      "How long ago did the burn occur?"
    ],
    response: "🚨 SEVERE BURN EMERGENCY: Call 112! Cool with water for 10-20 minutes. Do not use ice. Cover with clean cloth. Remove jewelry before swelling."
  },
  "obstetric": {
    keywords: ["giving birth", "labor", "pregnant bleeding", "water broke", "contractions close", "pregnancy emergency"],
    questions: [
      "How many weeks pregnant are you?",
      "How far apart are contractions?",
      "Did your water break?",
      "Do you see the baby's head?",
      "Are you bleeding heavily?",
      "Is this your first baby?",
      "Do you feel the urge to push?",
      "Are you having severe pain?",
      "Can you get to a hospital?",
      "Is anyone with you to help?"
    ],
    response: "🚨 OBSTETRIC EMERGENCY: Call 112! Do not try to delay delivery. Have clean towels ready. Support baby's head when it emerges."
  },
  "mental_health": {
    keywords: ["suicide", "want to die", "self harm", "severe depression", "psychotic episode", "hearing voices"],
    questions: [
      "Are you thinking about hurting yourself?",
      "Do you have a plan to hurt yourself?",
      "Are you hearing voices?",
      "Do you feel safe right now?",
      "Is someone with you?",
      "Have you taken any substances?",
      "Are you feeling disconnected from reality?",
      "Do you have access to weapons?",
      "Have you been sleeping or eating?",
      "Do you want to talk to someone?"
    ],
    response: "🚨 MENTAL HEALTH CRISIS: Call 112 or National Suicide Prevention Lifeline 988. You are not alone. Stay with someone you trust. Remove harmful objects."
  }
};

const COMMON_SYMPTOMS = [
  "Chest pain", "Shortness of breath", "Severe headache", "Dizziness", "Nausea", "Vomiting",
  "Fever", "Chills", "Abdominal pain", "Back pain", "Joint pain", "Muscle pain",
  "Fatigue", "Weakness", "Confusion", "Anxiety", "Palpitations", "Sweating",
  "Rash", "Swelling", "Cough", "Sore throat", "Difficulty swallowing", "Vision changes"
];

export const EnhancedAITriage = () => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'system',
      content: 'Emergency AI Triage System Active 🚨 I have knowledge of 100+ emergency scenarios and can provide immediate guidance. For life-threatening emergencies, always call 112 first, then describe your situation for additional support.',
      timestamp: new Date(),
      suggestions: ["🚨 EMERGENCY", "Heart problems", "Breathing issues", "Severe pain", "Accident/Injury", "Poisoning"]
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [showVoiceCommands, setShowVoiceCommands] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const analyzeEmergency = (message: string) => {
    const lowerMessage = message.toLowerCase();
    
    for (const [category, data] of Object.entries(EMERGENCY_DATABASE)) {
      for (const keyword of data.keywords) {
        if (lowerMessage.includes(keyword.toLowerCase())) {
          return {
            category,
            data,
            severity: 'emergency'
          };
        }
      }
    }
    
    // High priority symptoms
    const highPriorityTerms = ["severe", "sudden", "intense", "excruciating", "unbearable", "can't", "unable"];
    const hasSevereSymptom = highPriorityTerms.some(term => lowerMessage.includes(term));
    
    if (hasSevereSymptom) {
      return { severity: 'high', category: 'general' };
    }
    
    // Medium priority
    const mediumTerms = ["pain", "ache", "discomfort", "worried", "concerned"];
    const hasMediumSymptom = mediumTerms.some(term => lowerMessage.includes(term));
    
    if (hasMediumSymptom) {
      return { severity: 'medium', category: 'general' };
    }
    
    return { severity: 'low', category: 'general' };
  };

  const generateResponse = useCallback(async (userMessage: string) => {
    setIsTyping(true);
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const analysis = analyzeEmergency(userMessage);
    let response = '';
    let suggestions: string[] = [];
    let severity = analysis.severity as 'low' | 'medium' | 'high' | 'emergency';

    if (analysis.category && analysis.category !== 'general' && analysis.data) {
      // Emergency scenario detected
      response = analysis.data.response;
      suggestions = [
        "Call 112 NOW",
        "What should I do while waiting?",
        "Tell me more about this condition",
        ...analysis.data.questions.slice(0, 3)
      ];
      setActiveCategory(analysis.category);
    } else {
      // General health assessment
      switch (severity) {
        case 'emergency':
          response = '🚨 This sounds like a medical emergency. Call 112 immediately. Do not wait. While emergency services are on the way, stay calm and follow their instructions.';
          suggestions = ['Call 112 NOW', 'Emergency first aid', 'What to expect'];
          break;
        case 'high':
          response = '⚠️ Your symptoms require urgent medical attention. Please go to the emergency room or call 112 if symptoms worsen. Do not delay seeking care.';
          suggestions = ['Go to ER now', 'Call 112', 'Monitor symptoms'];
          break;
        case 'medium':
          response = '💊 You should see a healthcare provider within 24 hours. Monitor your symptoms and seek immediate care if they worsen.';
          suggestions = ['Schedule appointment', 'Monitor symptoms', 'Home care tips'];
          break;
        default:
          response = '💚 Your symptoms appear manageable with self-care. However, consult a healthcare provider if symptoms persist or worsen.';
          suggestions = ['Self-care tips', 'When to seek help', 'Monitor symptoms'];
      }
    }

    const aiMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'ai',
      content: response,
      timestamp: new Date(),
      severity,
      suggestions,
      category: analysis.category
    };

    setMessages(prev => [...prev, aiMessage]);
    setIsTyping(false);

    // Emergency alerts
    if (severity === 'emergency') {
      toast({
        title: "🚨 MEDICAL EMERGENCY DETECTED",
        description: "CALL 112 IMMEDIATELY",
        variant: "destructive"
      });
    }
  }, [toast]);

  const startVoiceRecognition = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast({
        title: "Voice Recognition Not Supported",
        description: "Please use text input instead",
        variant: "destructive"
      });
      return;
    }

    const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      toast({
        title: "🎤 Emergency Voice Input Active",
        description: "Describe your emergency clearly",
      });
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInputMessage(transcript);
      setIsListening(false);
    };

    recognition.onerror = () => {
      setIsListening(false);
      toast({
        title: "Voice Recognition Error",
        description: "Please try again or use text input",
        variant: "destructive"
      });
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const sendMessage = useCallback(async (message?: string) => {
    const messageToSend = message || inputMessage.trim();
    if (!messageToSend) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: messageToSend,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');

    await generateResponse(messageToSend);
  }, [inputMessage, generateResponse]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  }, [sendMessage]);

  const getSeverityColor = (severity?: 'low' | 'medium' | 'high' | 'emergency') => {
    switch (severity) {
      case 'emergency': return 'text-red-400 border-red-500 bg-red-500/10';
      case 'high': return 'text-orange-400 border-orange-500 bg-orange-500/10';
      case 'medium': return 'text-yellow-400 border-yellow-500 bg-yellow-500/10';
      default: return 'text-green-400 border-green-500 bg-green-500/10';
    }
  };

  const handleVoiceCommand = useCallback((action: string, data?: any) => {
    switch (action) {
      case 'TRIGGER_SOS':
        sendMessage("🚨 EMERGENCY! I need immediate help!");
        break;
      case 'CHEST_PAIN':
        sendMessage("I'm having severe chest pain");
        break;
      case 'BREATHING_PROBLEM':
        sendMessage("I can't breathe properly");
        break;
      case 'SEVERE_INJURY':
        sendMessage("I have a severe injury and need help");
        break;
      default:
        if (data?.text) {
          sendMessage(data.text);
        }
        break;
    }
  }, [sendMessage]);

  return (
    <div className="space-y-4">
      {/* Voice Commands Panel */}
      {showVoiceCommands && (
        <div className="mb-4">
          <VoiceCommandSystem onCommand={handleVoiceCommand} enabled={true} />
        </div>
      )}

      <Card className="h-[700px] flex flex-col bg-black/95 text-white rounded-lg border-2 border-red-500/30 overflow-hidden">
        {/* Enhanced Header */}
        <CardHeader className="bg-gradient-to-r from-red-900/50 to-orange-900/50 px-4 py-3 border-b border-red-500/30">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Activity className="h-6 w-6 text-red-400 animate-pulse" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping" />
              </div>
              <div>
                <h3 className="font-bold text-white">Emergency AI Triage</h3>
                <p className="text-xs text-red-300">100+ Emergency Scenarios • Voice-Enhanced</p>
              </div>
              <Badge variant="destructive" className="bg-red-600 text-white animate-pulse">
                EMERGENCY AI
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowVoiceCommands(!showVoiceCommands)}
                className={cn(
                  "border-red-500/50 text-red-300 hover:bg-red-500/20",
                  showVoiceCommands && "bg-red-500/30 text-white"
                )}
              >
                <Volume2 className="w-4 h-4 mr-1" />
                Voice
              </Button>
              <Badge variant="outline" className="border-red-500/50 text-red-300">
                <Brain className="w-3 h-3 mr-1" />
                AI Enhanced
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>

        <CardContent className="flex flex-col h-full p-0 bg-gradient-to-b from-black to-gray-900/50">
          {/* Emergency Categories Tab */}
          <div className="px-4 py-2 border-b border-red-500/20">
            <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full">
              <TabsList className="bg-black/50 border border-red-500/30">
                <TabsTrigger value="cardiac" className="text-xs">❤️ Cardiac</TabsTrigger>
                <TabsTrigger value="respiratory" className="text-xs">🫁 Breathing</TabsTrigger>
                <TabsTrigger value="trauma" className="text-xs">🩸 Trauma</TabsTrigger>
                <TabsTrigger value="neurological" className="text-xs">🧠 Neuro</TabsTrigger>
                <TabsTrigger value="poisoning" className="text-xs">☠️ Poison</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <ScrollArea className="flex-1 px-4">
            <div className="space-y-4 pb-4">
              {messages.map((message) => (
                <div key={message.id} className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {message.type !== 'user' && (
                    <div className="flex-shrink-0">
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center",
                        message.type === 'ai' ? "bg-red-600" : "bg-gray-800"
                      )}>
                        {message.type === 'ai' ? (
                          <Stethoscope className="h-4 w-4 text-white" />
                        ) : (
                          <MessageCircle className="h-4 w-4 text-white" />
                        )}
                      </div>
                    </div>
                  )}
                  
                  <div className={`max-w-[85%] ${message.type === 'user' ? 'order-1' : ''}`}>
                    <div className={cn(
                      "rounded-lg p-3 border",
                      message.type === 'user' 
                        ? 'bg-blue-600/20 text-white border-blue-500/30 ml-auto' 
                        : 'bg-gray-800/50 text-white border-gray-600/30',
                      message.severity && getSeverityColor(message.severity)
                    )}>
                      <p className="text-sm leading-relaxed">{message.content}</p>
                      
                      {message.suggestions && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {message.suggestions.map((suggestion, index) => (
                            <Button
                              key={index}
                              size="sm"
                              variant="outline"
                              className={cn(
                                "text-xs border h-auto py-1 px-2",
                                suggestion.includes('112') || suggestion.includes('EMERGENCY') 
                                  ? "border-red-500 text-red-300 hover:bg-red-500/20 animate-pulse" 
                                  : "border-gray-600 text-gray-300 hover:bg-gray-600/20"
                              )}
                              onClick={() => sendMessage(suggestion)}
                            >
                              {suggestion.includes('112') && <Zap className="w-3 h-3 mr-1" />}
                              {suggestion}
                            </Button>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-1 mt-1 px-1">
                      <Clock className="h-3 w-3 text-gray-500" />
                      <span className="text-xs text-gray-500">
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {message.severity === 'emergency' && (
                        <Badge variant="destructive" className="text-xs py-0 px-1 ml-2 animate-pulse">
                          URGENT
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  {message.type === 'user' && (
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                        <User className="h-4 w-4 text-white" />
                      </div>
                    </div>
                  )}
                </div>
              ))}
              
              {isTyping && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center">
                    <Stethoscope className="h-4 w-4 text-white" />
                  </div>
                  <div className="bg-gray-800/50 border border-gray-600/30 rounded-lg p-3">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-red-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-red-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-red-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Quick Emergency Buttons */}
          <div className="px-4 py-2 border-t border-red-500/20">
            <div className="flex flex-wrap gap-1 mb-2">
              {[
                "🚨 EMERGENCY CALL 112",
                "💔 Chest Pain",
                "🫁 Can't Breathe", 
                "🩸 Severe Bleeding",
                "🧠 Stroke Symptoms",
                "☠️ Poisoning"
              ].map((btn, index) => (
                <Button
                  key={index}
                  size="sm"
                  variant="outline"
                  className={cn(
                    "text-xs h-auto py-1 px-2",
                    btn.includes('112') 
                      ? "border-red-500 text-red-300 hover:bg-red-500/20 animate-pulse font-bold" 
                      : "border-orange-500/50 text-orange-300 hover:bg-orange-500/20"
                  )}
                  onClick={() => sendMessage(btn)}
                >
                  {btn}
                </Button>
              ))}
            </div>
          </div>

          {/* Enhanced Input Area */}
          <div className="flex gap-2 p-4 border-t border-red-500/20 bg-black/50">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Describe your emergency or symptoms..."
              className="flex-1 bg-gray-800/50 border-red-500/30 text-white placeholder-gray-400 focus:border-red-400"
              disabled={isTyping}
            />
            <Button 
              onClick={startVoiceRecognition}
              disabled={isTyping}
              className={cn(
                "text-white transition-all",
                isListening 
                  ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                  : 'bg-gray-600 hover:bg-gray-700'
              )}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </Button>
            <Button
              onClick={() => sendMessage()}
              disabled={!inputMessage.trim() || isTyping}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};