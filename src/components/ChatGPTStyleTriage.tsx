import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
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
  MicOff
} from 'lucide-react';

interface ChatMessage {
  id: string;
  type: 'user' | 'ai' | 'system';
  content: string;
  timestamp: Date;
  severity?: 'low' | 'medium' | 'high' | 'emergency';
  suggestions?: string[];
}

const HEALTH_SUGGESTIONS = [
  "I have a headache", "Feeling dizzy", "Chest pain", "Shortness of breath",
  "Nausea", "Fever", "Back pain", "Joint pain", "Fatigue", "Cough",
  "Stomach pain", "Difficulty sleeping", "Anxiety", "High blood pressure",
  "Diabetes symptoms", "Skin rash", "Sore throat", "Muscle pain"
];

export const ChatGPTStyleTriage = () => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'system',
      content: 'Hello! I\'m your AI Health Assistant with voice recognition. I can help assess your symptoms and provide medical guidance. Describe your symptoms by typing or speaking.',
      timestamp: new Date(),
      suggestions: HEALTH_SUGGESTIONS.slice(0, 6)
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [currentSuggestions, setCurrentSuggestions] = useState(HEALTH_SUGGESTIONS.slice(0, 6));
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateResponse = useCallback(async (userMessage: string) => {
    setIsTyping(true);
    
    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const lowerMessage = userMessage.toLowerCase();
    let response = '';
    let severity: 'low' | 'medium' | 'high' | 'emergency' = 'low';
    let suggestions: string[] = [];

    // Emergency detection
    if (lowerMessage.includes('chest pain') || lowerMessage.includes('heart attack') || 
        lowerMessage.includes('unconscious') || lowerMessage.includes('can\'t breathe') ||
        lowerMessage.includes('stroke') || lowerMessage.includes('choking') ||
        lowerMessage.includes('severe bleeding')) {
      severity = 'emergency';
      response = '🚨 This sounds like a medical emergency. Please call 112 immediately or go to the nearest emergency room. Do not drive yourself. ';
      response += 'While waiting for help: Stay calm, sit down if possible, and follow any specific instructions from emergency services.';
      suggestions = ['Call 112 now', 'Go to nearest hospital', 'Contact family member'];
    }
    // High priority symptoms
    else if (lowerMessage.includes('severe pain') || lowerMessage.includes('high fever') || 
             lowerMessage.includes('vomiting blood') || lowerMessage.includes('difficulty breathing') ||
             lowerMessage.includes('severe headache') || lowerMessage.includes('dizzy')) {
      severity = 'high';
      response = '⚠️ Your symptoms require prompt medical attention. I recommend seeing a doctor within the next 2-4 hours. ';
      response += 'Please monitor your symptoms closely and seek immediate care if they worsen.';
      suggestions = ['Book urgent appointment', 'Visit walk-in clinic', 'Monitor symptoms closely'];
    }
    // Medium priority
    else if (lowerMessage.includes('pain') || lowerMessage.includes('fever') || 
             lowerMessage.includes('nausea') || lowerMessage.includes('headache') ||
             lowerMessage.includes('tired') || lowerMessage.includes('cough')) {
      severity = 'medium';
      response = '💊 Your symptoms suggest you should consider seeing a healthcare provider within the next day or two. ';
      response += 'In the meantime, rest, stay hydrated, and monitor how you feel.';
      suggestions = ['Schedule doctor appointment', 'Rest and hydrate', 'Take over-the-counter medication'];
    }
    // General health queries
    else {
      response = '💚 Based on what you\'ve described, this seems like a minor concern. Consider basic self-care measures. ';
      response += 'If symptoms persist or worsen, please consult with a healthcare professional.';
      suggestions = ['Monitor symptoms', 'Stay hydrated', 'Get adequate rest'];
    }

    const aiMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'ai',
      content: response,
      timestamp: new Date(),
      severity,
      suggestions
    };

    setMessages(prev => [...prev, aiMessage]);
    setIsTyping(false);

    // Update suggestions based on the conversation
    const remainingSuggestions = HEALTH_SUGGESTIONS.filter(s => 
      !s.toLowerCase().includes(lowerMessage.split(' ')[0])
    );
    setCurrentSuggestions(remainingSuggestions.slice(0, 6));

    // Show alert for high severity
    if (severity === 'emergency') {
      toast({
        title: "🚨 Emergency Detected",
        description: "Immediate medical attention required",
        variant: "destructive"
      });
    } else if (severity === 'high') {
      toast({
        title: "⚠️ High Priority",
        description: "Prompt medical attention recommended",
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
        title: "🎤 Voice Input Active",
        description: "Speak your symptoms clearly",
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

    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: messageToSend,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');

    // Generate AI response
    await generateResponse(messageToSend);
  }, [inputMessage, generateResponse]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  }, [sendMessage]);

  const getSeverityColor = (severity?: 'low' | 'medium' | 'high' | 'emergency') => {
    switch (severity) {
      case 'emergency': return 'text-red-500 border-red-500';
      case 'high': return 'text-orange-500 border-orange-500';
      case 'medium': return 'text-yellow-500 border-yellow-500';
      default: return 'text-green-500 border-green-500';
    }
  };

  return (
    <Card className="h-[600px] flex flex-col bg-black text-white rounded-lg border border-white/10 overflow-hidden">
      {/* Header */}
      <CardHeader className="bg-gradient-to-r from-gray-900 to-gray-800 px-4 py-3 border-b border-gray-700">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-red-500 animate-pulse" />
            <h3 className="font-semibold text-white">LifeLine AI Triage</h3>
            <Badge variant="secondary" className="bg-red-600 text-white border-none">MEDICAL AI</Badge>
          </div>
          <Badge variant="outline" className="text-white border-white/30">
            Text-Based Assistance
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex flex-col h-full p-0 bg-black">
        <ScrollArea className="flex-1 px-4">
          <div className="space-y-4 pb-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                {message.type !== 'user' && (
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center">
                      {message.type === 'ai' ? (
                        <Bot className="h-4 w-4 text-white" />
                      ) : (
                        <MessageCircle className="h-4 w-4 text-white" />
                      )}
                    </div>
                  </div>
                )}
                
                <div className={`max-w-[80%] ${message.type === 'user' ? 'order-1' : ''}`}>
                  <div className={`rounded-lg p-3 ${
                    message.type === 'user' 
                      ? 'bg-gray-700 text-white ml-auto' 
                      : 'bg-gray-800 text-white'
                  } ${message.severity ? getSeverityColor(message.severity) : ''}`}>
                    <p className="text-sm">{message.content}</p>
                    
                    {message.suggestions && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {message.suggestions.map((suggestion, index) => (
                          <Button
                            key={index}
                            size="sm"
                            variant="outline"
                            className="text-xs bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
                            onClick={() => sendMessage(suggestion)}
                          >
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
                <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <div className="bg-gray-800 rounded-lg p-3">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Quick Suggestions */}
        <div className="px-4 py-2 border-t border-gray-700">
          <div className="flex flex-wrap gap-1 mb-2">
            {currentSuggestions.slice(0, 4).map((suggestion, index) => (
              <Button
                key={index}
                size="sm"
                variant="outline"
                className="text-xs bg-gray-800 border-gray-600 text-white hover:bg-gray-700"
                onClick={() => sendMessage(suggestion)}
              >
                {suggestion}
              </Button>
            ))}
          </div>
        </div>

        {/* Input Area with Voice */}
        <div className="flex gap-2 p-4 border-t border-gray-700 bg-gray-900">
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Describe your symptoms or tap mic to speak..."
            className="flex-1 bg-gray-800 border-gray-600 text-white placeholder-gray-400"
            disabled={isTyping}
          />
          <Button 
            onClick={startVoiceRecognition}
            disabled={isTyping}
            className={`${isListening ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-600 hover:bg-gray-700'} text-white`}
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
  );
};