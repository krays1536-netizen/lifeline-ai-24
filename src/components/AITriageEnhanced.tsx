import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Mic, 
  Send, 
  Brain, 
  Heart,
  Stethoscope,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Phone,
  FileText
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TriageMessage {
  id: string;
  type: "user" | "ai" | "quick-action";
  content: string;
  timestamp: Date;
  severity?: "low" | "medium" | "high" | "critical";
  actions?: Array<{
    label: string;
    action: string;
    urgent?: boolean;
  }>;
  vitals?: {
    heartRate?: number;
    spO2?: number;
    temperature?: number;
  };
}

interface QuickSymptom {
  id: string;
  label: string;
  icon: string;
  category: "cardiac" | "respiratory" | "neurological" | "trauma" | "general";
  urgency: "low" | "medium" | "high" | "critical";
  followUpQuestions?: string[];
}

interface AITriageEnhancedProps {
  onEmergencyDetected: (level: "low" | "medium" | "high" | "critical") => void;
  onGuidanceGenerated: (guidance: string[]) => void;
  currentVitals?: {
    heartRate: number;
    spO2: number;
    temperature: number;
  };
}

export const AITriageEnhanced = ({ 
  onEmergencyDetected, 
  onGuidanceGenerated,
  currentVitals 
}: AITriageEnhancedProps) => {
  const [messages, setMessages] = useState<TriageMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentSeverity, setCurrentSeverity] = useState<"low" | "medium" | "high" | "critical">("low");
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [triagePhase, setTriagePhase] = useState<"initial" | "assessment" | "guidance" | "emergency">("initial");
  const [incidentLog, setIncidentLog] = useState<string[]>([]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const quickSymptoms: QuickSymptom[] = [
    {
      id: "chest_pain",
      label: "Chest Pain",
      icon: "💔",
      category: "cardiac",
      urgency: "critical",
      followUpQuestions: [
        "Is the pain crushing or squeezing?",
        "Does it radiate to your arm, jaw, or back?",
        "Are you having trouble breathing?"
      ]
    },
    {
      id: "difficulty_breathing",
      label: "Difficulty Breathing",
      icon: "🫁",
      category: "respiratory",
      urgency: "high",
      followUpQuestions: [
        "When did the breathing difficulty start?",
        "Are you wheezing or coughing?",
        "Do you have a history of asthma?"
      ]
    },
    {
      id: "severe_bleeding",
      label: "Severe Bleeding",
      icon: "🩸",
      category: "trauma",
      urgency: "critical",
      followUpQuestions: [
        "Where is the bleeding located?",
        "Can you apply direct pressure?",
        "How much blood have you lost?"
      ]
    },
    {
      id: "dizziness",
      label: "Dizziness/Fainting",
      icon: "😵",
      category: "neurological",
      urgency: "medium",
      followUpQuestions: [
        "Did you lose consciousness?",
        "Do you have a headache?",
        "When did you last eat or drink?"
      ]
    },
    {
      id: "severe_headache",
      label: "Severe Headache",
      icon: "🤕",
      category: "neurological",
      urgency: "high",
      followUpQuestions: [
        "Is this the worst headache of your life?",
        "Do you have vision changes?",
        "Are you sensitive to light?"
      ]
    },
    {
      id: "nausea_vomiting",
      label: "Nausea/Vomiting",
      icon: "🤢",
      category: "general",
      urgency: "low",
      followUpQuestions: [
        "How long have you been vomiting?",
        "Are you keeping fluids down?",
        "Do you have stomach pain?"
      ]
    },
    {
      id: "allergic_reaction",
      label: "Allergic Reaction",
      icon: "🚨",
      category: "general",
      urgency: "high",
      followUpQuestions: [
        "Are you having trouble breathing?",
        "Do you have swelling in face/throat?",
        "Do you have an EpiPen?"
      ]
    },
    {
      id: "stroke_symptoms",
      label: "Stroke Symptoms",
      icon: "🧠",
      category: "neurological",
      urgency: "critical",
      followUpQuestions: [
        "Can you smile normally?",
        "Can you raise both arms?",
        "Is your speech slurred?"
      ]
    }
  ];

  const aiResponseDatabase = {
    chest_pain: {
      assessment: "Chest pain can indicate a serious cardiac emergency. I'm analyzing your symptoms with high priority.",
      immediateActions: [
        "Sit or lie down in a comfortable position",
        "Loosen tight clothing",
        "If you have prescribed nitroglycerin, take it",
        "Chew an aspirin if not allergic (325mg)",
        "Stay calm and avoid physical activity"
      ],
      escalation: "critical",
      callEmergency: true
    },
    difficulty_breathing: {
      assessment: "Breathing difficulties require immediate attention. Let me guide you through some steps.",
      immediateActions: [
        "Sit upright in a comfortable position",
        "Loosen any tight clothing around chest/neck",
        "Take slow, deep breaths through your nose",
        "If you have a rescue inhaler, use it",
        "Stay calm and avoid talking unnecessarily"
      ],
      escalation: "high",
      callEmergency: true
    },
    severe_bleeding: {
      assessment: "Severe bleeding is a medical emergency. Follow these critical steps immediately.",
      immediateActions: [
        "Apply direct pressure to the wound with clean cloth",
        "Elevate the injured area above heart level if possible",
        "Do NOT remove objects embedded in the wound",
        "Apply additional bandages over soaked ones",
        "Monitor for signs of shock"
      ],
      escalation: "critical",
      callEmergency: true
    },
    dizziness: {
      assessment: "Dizziness can have various causes. Let me help assess the severity.",
      immediateActions: [
        "Sit or lie down immediately",
        "Keep your head elevated",
        "Drink small sips of water if not nauseous",
        "Avoid sudden movements",
        "Focus on a fixed point to reduce spinning sensation"
      ],
      escalation: "medium",
      callEmergency: false
    },
    severe_headache: {
      assessment: "A severe headache, especially if sudden or worst ever, needs immediate evaluation.",
      immediateActions: [
        "Rest in a quiet, dark room",
        "Apply cold compress to forehead",
        "Stay hydrated",
        "Avoid bright lights and loud sounds",
        "Document when the headache started"
      ],
      escalation: "high",
      callEmergency: true
    },
    nausea_vomiting: {
      assessment: "Persistent nausea and vomiting can lead to dehydration. Let me assess your condition.",
      immediateActions: [
        "Rest and avoid solid foods temporarily",
        "Take small sips of clear fluids",
        "Try ginger tea or crackers if tolerated",
        "Sit upright for 30 minutes after eating/drinking",
        "Monitor for signs of dehydration"
      ],
      escalation: "low",
      callEmergency: false
    },
    allergic_reaction: {
      assessment: "Allergic reactions can escalate quickly. I'm prioritizing your assessment.",
      immediateActions: [
        "Remove or avoid the allergen if known",
        "Use EpiPen immediately if you have one",
        "Take antihistamine if no breathing difficulty",
        "Loosen tight clothing",
        "Monitor for worsening symptoms"
      ],
      escalation: "high",
      callEmergency: true
    },
    stroke_symptoms: {
      assessment: "Stroke symptoms require IMMEDIATE emergency care. Every minute counts for brain tissue.",
      immediateActions: [
        "Call 112 (Kuwait Emergency) IMMEDIATELY",
        "Note the exact time symptoms started",
        "Sit or lie down safely",
        "Do NOT give food, water, or medications",
        "Stay with someone if possible"
      ],
      escalation: "critical",
      callEmergency: true
    }
  };

  useEffect(() => {
    // Initialize with welcome message
    if (messages.length === 0) {
      const welcomeMessage: TriageMessage = {
        id: "welcome",
        type: "ai",
        content: "👋 Hello! I'm your AI Medical Triage Assistant. I'm here to help assess your symptoms and provide immediate guidance.\n\n🚨 **Important**: This is AI assistance, not a substitute for professional medical care.\n\nWhat's your main concern today? You can tap a quick symptom below or describe it in your own words.",
        timestamp: new Date(),
        severity: "low"
      };
      setMessages([welcomeMessage]);
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      
      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputValue(transcript);
        setIsListening(false);
      };
      
      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  const handleQuickSymptom = (symptom: QuickSymptom) => {
    setSelectedSymptoms(prev => [...prev, symptom.id]);
    setTriagePhase("assessment");
    
    // Add user message
    const userMessage: TriageMessage = {
      id: `user-${Date.now()}`,
      type: "user",
      content: `${symptom.icon} ${symptom.label}`,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIncidentLog(prev => [...prev, `Symptom reported: ${symptom.label} at ${new Date().toLocaleTimeString()}`]);
    
    // Simulate AI processing
    setIsAnalyzing(true);
    setTimeout(() => {
      processSymptom(symptom);
      setIsAnalyzing(false);
    }, 1500);
  };

  const processSymptom = (symptom: QuickSymptom) => {
    const response = aiResponseDatabase[symptom.id as keyof typeof aiResponseDatabase];
    if (!response) return;
    
    // Update severity
    const newSeverity = response.escalation as "low" | "medium" | "high" | "critical";
    setCurrentSeverity(newSeverity);
    onEmergencyDetected(newSeverity);
    
    // Create AI response message
    const aiMessage: TriageMessage = {
      id: `ai-${Date.now()}`,
      type: "ai",
      content: response.assessment,
      timestamp: new Date(),
      severity: newSeverity,
      actions: response.immediateActions.map(action => ({
        label: action,
        action: "follow_instruction",
        urgent: response.callEmergency
      })),
      vitals: currentVitals
    };
    
    setMessages(prev => [...prev, aiMessage]);
    onGuidanceGenerated(response.immediateActions);
    setIncidentLog(prev => [...prev, `AI assessment: ${newSeverity} priority at ${new Date().toLocaleTimeString()}`]);
    
    // If critical, show emergency actions
    if (response.callEmergency) {
      setTimeout(() => {
        const emergencyMessage: TriageMessage = {
          id: `emergency-${Date.now()}`,
          type: "ai",
          content: `🚨 **EMERGENCY PROTOCOLS ACTIVATED**\n\n📞 **CALL 112 (Kuwait Emergency) NOW**\n🏥 **Or call 777 for Ambulance**\n\nI'm logging all our conversation for the medical team. Stay on the line with emergency services.`,
          timestamp: new Date(),
          severity: "critical",
          actions: [
            { label: "📞 Call 112 Now", action: "call_emergency", urgent: true },
            { label: "📞 Call 777 (Ambulance)", action: "call_ambulance", urgent: true },
            { label: "🚨 Activate SOS", action: "trigger_sos", urgent: true }
          ]
        };
        setMessages(prev => [...prev, emergencyMessage]);
        setTriagePhase("emergency");
      }, 2000);
    } else {
      // Continue assessment with follow-up questions
      setTimeout(() => {
        if (symptom.followUpQuestions) {
          const followUpMessage: TriageMessage = {
            id: `followup-${Date.now()}`,
            type: "ai",
            content: `To better assist you, please answer these questions:\n\n${symptom.followUpQuestions.map((q, i) => `${i + 1}. ${q}`).join('\n')}`,
            timestamp: new Date(),
            severity: newSeverity
          };
          setMessages(prev => [...prev, followUpMessage]);
        }
      }, 3000);
    }
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;
    
    const userMessage: TriageMessage = {
      id: `user-${Date.now()}`,
      type: "user", 
      content: inputValue,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIncidentLog(prev => [...prev, `User input: "${inputValue}" at ${new Date().toLocaleTimeString()}`]);
    setInputValue("");
    
    // Simple AI response simulation
    setIsAnalyzing(true);
    setTimeout(() => {
      const aiResponse: TriageMessage = {
        id: `ai-${Date.now()}`,
        type: "ai",
        content: `I understand you mentioned: "${userMessage.content}"\n\nLet me analyze this with your current vitals:\n${currentVitals ? `💓 Heart Rate: ${currentVitals.heartRate} BPM\n🫁 SpO₂: ${currentVitals.spO2}%\n🌡️ Temperature: ${currentVitals.temperature}°C\n\n` : ''}Based on this information, I recommend monitoring your symptoms closely. If they worsen or you develop new symptoms, please seek immediate medical attention.`,
        timestamp: new Date(),
        severity: "medium",
        vitals: currentVitals
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsAnalyzing(false);
    }, 2000);
  };

  const startListening = () => {
    if (recognitionRef.current) {
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  const getSeverityColor = (severity?: string) => {
    switch (severity) {
      case "critical": return "border-cyber-red bg-cyber-red/10";
      case "high": return "border-cyber-orange bg-cyber-orange/10"; 
      case "medium": return "border-cyber-blue bg-cyber-blue/10";
      case "low": return "border-cyber-green bg-cyber-green/10";
      default: return "border-muted bg-muted/10";
    }
  };

  const getSeverityIcon = (severity?: string) => {
    switch (severity) {
      case "critical": return <AlertTriangle className="h-4 w-4 text-cyber-red" />;
      case "high": return <Activity className="h-4 w-4 text-cyber-orange" />;
      case "medium": return <Heart className="h-4 w-4 text-cyber-blue" />;
      case "low": return <CheckCircle className="h-4 w-4 text-cyber-green" />;
      default: return <Brain className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <Card className="p-6 bg-[var(--gradient-card)] border-2 border-cyber-purple/40 font-poppins">
      <div className="flex items-center gap-3 mb-4">
        <Stethoscope className="h-6 w-6 text-cyber-purple animate-pulse" />
        <h3 className="text-xl font-bold text-foreground">AI Medical Triage</h3>
        <Badge variant="outline" className="text-cyber-purple border-cyber-purple/50">
          Enhanced Assessment
        </Badge>
        {currentSeverity !== "low" && (
          <Badge className={cn("animate-pulse",
            currentSeverity === "critical" ? "bg-cyber-red" :
            currentSeverity === "high" ? "bg-cyber-orange" :
            "bg-cyber-blue"
          )}>
            {currentSeverity.toUpperCase()} PRIORITY
          </Badge>
        )}
      </div>

      {/* Current Vitals Display */}
      {currentVitals && (
        <Card className="p-3 mb-4 bg-muted/20">
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <Heart className="h-3 w-3 text-cyber-red" />
              <span>{currentVitals.heartRate} BPM</span>
            </div>
            <div className="flex items-center gap-1">
              <Activity className="h-3 w-3 text-cyber-blue" />
              <span>{currentVitals.spO2}%</span>
            </div>
            <div className="flex items-center gap-1">
              <span>🌡️</span>
              <span>{currentVitals.temperature.toFixed(1)}°C</span>
            </div>
          </div>
        </Card>
      )}

      {/* Quick Symptoms */}
      {triagePhase === "initial" && (
        <div className="mb-4">
          <h4 className="text-sm font-medium mb-2">Quick Symptom Selection:</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {quickSymptoms.map((symptom) => (
              <Button
                key={symptom.id}
                onClick={() => handleQuickSymptom(symptom)}
                variant="outline"
                className={cn(
                  "flex flex-col items-center p-3 h-auto text-xs",
                  symptom.urgency === "critical" ? "border-cyber-red hover:bg-cyber-red/10" :
                  symptom.urgency === "high" ? "border-cyber-orange hover:bg-cyber-orange/10" :
                  symptom.urgency === "medium" ? "border-cyber-blue hover:bg-cyber-blue/10" :
                  "border-cyber-green hover:bg-cyber-green/10",
                  selectedSymptoms.includes(symptom.id) && "bg-muted/50"
                )}
                disabled={selectedSymptoms.includes(symptom.id)}
              >
                <span className="text-lg mb-1">{symptom.icon}</span>
                <span className="text-center leading-tight">{symptom.label}</span>
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Chat Messages */}
      <Card className="mb-4 bg-muted/10">
        <ScrollArea className="h-96 p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex",
                  message.type === "user" ? "justify-end" : "justify-start"
                )}
              >
                <div
                  className={cn(
                    "max-w-[80%] p-3 rounded-lg border-2",
                    message.type === "user" 
                      ? "bg-cyber-blue/10 border-cyber-blue/30" 
                      : getSeverityColor(message.severity)
                  )}
                >
                  <div className="flex items-start gap-2 mb-2">
                    {message.type === "ai" && getSeverityIcon(message.severity)}
                    <div className="flex-1">
                      <div className="text-xs text-muted-foreground mb-1 flex items-center gap-2">
                        {message.type === "user" ? "You" : "AI Triage Assistant"}
                        <span>{message.timestamp.toLocaleTimeString()}</span>
                      </div>
                      <div className="text-sm whitespace-pre-line">{message.content}</div>
                    </div>
                  </div>
                  
                  {/* Vitals Display */}
                  {message.vitals && (
                    <div className="mt-2 p-2 bg-muted/30 rounded text-xs">
                      <div className="font-medium mb-1">📊 Vitals at time of assessment:</div>
                      <div className="grid grid-cols-3 gap-2">
                        <span>💓 {message.vitals.heartRate} BPM</span>
                        <span>🫁 {message.vitals.spO2}%</span>
                        <span>🌡️ {message.vitals.temperature?.toFixed(1)}°C</span>
                      </div>
                    </div>
                  )}
                  
                  {/* Action Buttons */}
                  {message.actions && (
                    <div className="mt-3 space-y-1">
                      {message.actions.map((action, i) => (
                        <div key={i} className={cn(
                          "text-xs p-2 rounded border-l-2",
                          action.urgent ? "border-cyber-red bg-cyber-red/5" : "border-cyber-blue bg-cyber-blue/5"
                        )}>
                          {action.urgent && "🚨 "}{action.label}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {isAnalyzing && (
              <div className="flex justify-start">
                <div className="bg-muted/20 border-2 border-muted/30 p-3 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Brain className="h-4 w-4 text-cyber-purple animate-pulse" />
                    <span className="text-sm">AI is analyzing your symptoms...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div ref={messagesEndRef} />
        </ScrollArea>
      </Card>

      {/* Input Area */}
      <div className="flex gap-2">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Describe your symptoms in detail..."
          onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
          className="flex-1"
        />
        <Button
          onClick={startListening}
          variant="outline"
          size="sm"
          disabled={isListening}
          className={cn(isListening && "bg-cyber-red/20 border-cyber-red")}
        >
          <Mic className={cn("h-4 w-4", isListening && "animate-pulse")} />
        </Button>
        <Button onClick={handleSendMessage} size="sm">
          <Send className="h-4 w-4" />
        </Button>
      </div>

      {/* Incident Log */}
      {incidentLog.length > 0 && (
        <Card className="mt-4 p-3 bg-muted/10">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="h-4 w-4 text-cyber-blue" />
            <span className="text-sm font-medium">Incident Log (Auto-saved to pack)</span>
          </div>
          <div className="text-xs space-y-1 max-h-20 overflow-y-auto">
            {incidentLog.slice(-5).map((log, i) => (
              <div key={i} className="text-muted-foreground">• {log}</div>
            ))}
          </div>
        </Card>
      )}

      {/* Emergency Actions */}
      {triagePhase === "emergency" && (
        <Card className="mt-4 p-4 border-2 border-cyber-red bg-cyber-red/10">
          <div className="text-center">
            <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-cyber-red animate-pulse" />
            <div className="text-lg font-bold text-cyber-red mb-2">EMERGENCY PROTOCOLS ACTIVE</div>
            <div className="space-y-2">
              <Button 
                onClick={() => window.open("tel:112")} 
                className="w-full bg-cyber-red text-white font-bold"
              >
                <Phone className="h-4 w-4 mr-2" />
                📞 CALL 112 (Kuwait Emergency)
              </Button>
              <Button 
                onClick={() => window.open("tel:777")} 
                variant="outline" 
                className="w-full border-cyber-red text-cyber-red"
              >
                <Phone className="h-4 w-4 mr-2" />
                🚑 CALL 777 (Ambulance)
              </Button>
            </div>
          </div>
        </Card>
      )}
    </Card>
  );
};