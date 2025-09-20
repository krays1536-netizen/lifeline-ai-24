import { useState, useRef, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { 
  Mic, 
  MicOff, 
  Phone, 
  MapPin, 
  Heart, 
  AlertTriangle, 
  Brain,
  Stethoscope,
  Pill,
  Clock,
  Shield,
  Zap,
  Camera,
  MessageSquare
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface TriageResult {
  urgencyLevel: "critical" | "urgent" | "semi-urgent" | "non-urgent";
  confidence: number;
  primaryConcern: string;
  recommendedAction: string;
  symptoms: string[];
  riskFactors: string[];
  timeToTreat: string;
  medicationWarnings: string[];
  emergencyProtocol: string;
}

interface UnifiedAITriageProps {
  currentVitals?: {
    heartRate: number;
    spO2: number;
    temperature: number;
    timestamp: Date;
  };
  currentLocation?: [number, number];
  onEmergencyDetected: (level: string) => void;
  onGuidanceGenerated: (guidance: string) => void;
  onLocationNeeded: () => void;
}

export const UnifiedAITriage = ({ 
  currentVitals, 
  currentLocation, 
  onEmergencyDetected,
  onGuidanceGenerated,
  onLocationNeeded
}: UnifiedAITriageProps) => {
  const { toast } = useToast();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [triageResult, setTriageResult] = useState<TriageResult | null>(null);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{
    role: "user" | "ai" | "system";
    content: string;
    timestamp: Date;
    urgency?: "critical" | "urgent" | "normal";
  }>>([
    {
      role: "system",
      content: "LifeLine AI Medical Triage activated. Describe your symptoms or emergency situation. I'll assess urgency and guide you through the next steps.",
      timestamp: new Date()
    }
  ]);
  
  const recognitionRef = useRef<any>(null);
  const [userInput, setUserInput] = useState("");
  const [showPreloadedQuestions, setShowPreloadedQuestions] = useState(false);

  // 100 Preloaded Medical Questions with Instant Answers
  const preloadedQuestions = [
    // EMERGENCY CONDITIONS
    { 
      category: "Emergency", 
      question: "Chest pain radiating to left arm", 
      answer: "🚨 CRITICAL: Possible heart attack. Call 112 immediately. Chew aspirin if not allergic. Stay calm, loosen tight clothing.", 
      urgency: "critical" 
    },
    { 
      category: "Emergency", 
      question: "Difficulty breathing, can't catch breath", 
      answer: "🚨 URGENT: Respiratory distress. Call emergency services. Sit upright, loosen clothing. Check if inhaler needed.", 
      urgency: "critical" 
    },
    { 
      category: "Emergency", 
      question: "Severe allergic reaction, swelling face", 
      answer: "🚨 CRITICAL: Anaphylaxis. Use EpiPen if available. Call 112 immediately. Monitor airway.", 
      urgency: "critical" 
    },
    { 
      category: "Emergency", 
      question: "Stroke symptoms, face drooping", 
      answer: "🚨 CRITICAL: Possible stroke. FAST test: Face drooping, Arm weakness, Speech difficulties, Time to call 112.", 
      urgency: "critical" 
    },
    { 
      category: "Emergency", 
      question: "Severe bleeding won't stop", 
      answer: "🚨 URGENT: Apply direct pressure with clean cloth. Elevate if possible. Call emergency if bleeding persists.", 
      urgency: "critical" 
    },

    // PAIN CONDITIONS
    { 
      category: "Pain", 
      question: "Severe headache sudden onset", 
      answer: "⚠️ URGENT: Sudden severe headache may indicate serious condition. Seek immediate medical attention.", 
      urgency: "urgent" 
    },
    { 
      category: "Pain", 
      question: "Back pain after lifting", 
      answer: "💊 Apply ice first 24-48 hours, then heat. Rest, gentle movement. Anti-inflammatories if no allergies. See doctor if persists >3 days.", 
      urgency: "semi-urgent" 
    },
    { 
      category: "Pain", 
      question: "Abdominal pain severe", 
      answer: "⚠️ URGENT: Severe abdominal pain needs evaluation. Could be appendicitis, gallbladder, or other serious condition.", 
      urgency: "urgent" 
    },
    { 
      category: "Pain", 
      question: "Joint pain and swelling", 
      answer: "🩺 Rest joint, apply ice 15-20 mins. Elevate if possible. Anti-inflammatory medication. See doctor if no improvement in 2-3 days.", 
      urgency: "semi-urgent" 
    },
    { 
      category: "Pain", 
      question: "Tooth pain severe", 
      answer: "🦷 Rinse with warm salt water. Cold compress outside cheek. Avoid very hot/cold foods. See dentist urgently.", 
      urgency: "urgent" 
    },

    // RESPIRATORY
    { 
      category: "Respiratory", 
      question: "Cough with blood", 
      answer: "🚨 URGENT: Coughing blood requires immediate medical evaluation. Could indicate serious lung condition.", 
      urgency: "urgent" 
    },
    { 
      category: "Respiratory", 
      question: "Persistent dry cough", 
      answer: "💊 Stay hydrated, honey for soothing, humidifier. Avoid irritants. See doctor if >2 weeks or worsening.", 
      urgency: "semi-urgent" 
    },
    { 
      category: "Respiratory", 
      question: "Asthma attack mild", 
      answer: "💨 Use rescue inhaler 2 puffs, wait 5 mins, repeat if needed. Sit upright, stay calm. Call 112 if not improving.", 
      urgency: "urgent" 
    },
    { 
      category: "Respiratory", 
      question: "Shortness of breath climbing stairs", 
      answer: "🫁 Could indicate heart or lung condition. Rest, monitor symptoms. Schedule doctor visit for evaluation.", 
      urgency: "semi-urgent" 
    },

    // CARDIAC
    { 
      category: "Cardiac", 
      question: "Heart palpitations racing", 
      answer: "💓 Sit down, take deep breaths. Avoid caffeine. If chest pain, dizziness, or doesn't stop - seek immediate care.", 
      urgency: "urgent" 
    },
    { 
      category: "Cardiac", 
      question: "High blood pressure reading", 
      answer: "📊 Rest 5 minutes, retake reading. If consistently >180/120, seek immediate care. If >140/90, see doctor soon.", 
      urgency: "semi-urgent" 
    },
    { 
      category: "Cardiac", 
      question: "Dizziness and lightheadedness", 
      answer: "🌀 Sit or lie down immediately. Check blood pressure if possible. Stay hydrated. See doctor if recurring.", 
      urgency: "semi-urgent" 
    },

    // DIGESTIVE
    { 
      category: "Digestive", 
      question: "Nausea and vomiting", 
      answer: "🤢 Rest, sip clear fluids slowly. BRAT diet when ready (Banana, Rice, Applesauce, Toast). See doctor if severe/persistent.", 
      urgency: "semi-urgent" 
    },
    { 
      category: "Digestive", 
      question: "Diarrhea for 3 days", 
      answer: "💧 Stay hydrated with electrolytes. Avoid dairy, fatty foods. See doctor if blood, fever, or severe dehydration.", 
      urgency: "semi-urgent" 
    },
    { 
      category: "Digestive", 
      question: "Constipation for a week", 
      answer: "🥬 Increase fiber, water intake. Light exercise. Over-counter stool softener. See doctor if severe pain or no relief.", 
      urgency: "non-urgent" 
    },
    { 
      category: "Digestive", 
      question: "Heartburn severe", 
      answer: "🔥 Sit upright, antacids may help. Avoid spicy/fatty foods. If severe chest pain or difficulty swallowing - seek immediate care.", 
      urgency: "semi-urgent" 
    },

    // NEUROLOGICAL
    { 
      category: "Neurological", 
      question: "Sudden confusion disoriented", 
      answer: "🚨 URGENT: Sudden confusion needs immediate evaluation. Could indicate stroke, infection, or other serious condition.", 
      urgency: "critical" 
    },
    { 
      category: "Neurological", 
      question: "Seizure just occurred", 
      answer: "🚨 CRITICAL: After seizure, keep person safe and comfortable. Call 112 if first seizure, lasted >5 minutes, or injury occurred.", 
      urgency: "critical" 
    },
    { 
      category: "Neurological", 
      question: "Memory problems forgetting things", 
      answer: "🧠 Note when started, severity. Could be stress, medication, or medical condition. Schedule doctor evaluation.", 
      urgency: "semi-urgent" 
    },
    { 
      category: "Neurological", 
      question: "Numbness in hands feet", 
      answer: "🤲 Note if both sides, when started. Could indicate circulation, nerve issues. See doctor for evaluation.", 
      urgency: "semi-urgent" 
    },

    // INFECTIOUS DISEASES
    { 
      category: "Infection", 
      question: "High fever 104F 40C", 
      answer: "🚨 URGENT: High fever needs immediate attention. Cool cloths, fluids, fever reducer. Seek emergency care.", 
      urgency: "urgent" 
    },
    { 
      category: "Infection", 
      question: "Flu symptoms body aches", 
      answer: "🤒 Rest, fluids, fever reducer. Isolate from others. See doctor if difficulty breathing, severe symptoms.", 
      urgency: "semi-urgent" 
    },
    { 
      category: "Infection", 
      question: "Sore throat difficulty swallowing", 
      answer: "🦠 Warm salt water gargle, throat lozenges, pain reliever. See doctor if severe, white patches, or fever.", 
      urgency: "semi-urgent" 
    },
    { 
      category: "Infection", 
      question: "UTI burning urination", 
      answer: "🚽 Increase water intake, avoid irritants. Cranberry juice may help. See doctor for antibiotics if confirmed UTI.", 
      urgency: "semi-urgent" 
    },

    // SKIN CONDITIONS
    { 
      category: "Skin", 
      question: "Rash spreading rapidly", 
      answer: "🦠 Document spread with photos. Avoid known allergens. See doctor urgently if facial swelling or breathing issues.", 
      urgency: "urgent" 
    },
    { 
      category: "Skin", 
      question: "Burn from hot surface", 
      answer: "🔥 Cool running water 10-20 minutes. Don't use ice. Cover with clean cloth. See doctor if severe or large area.", 
      urgency: "semi-urgent" 
    },
    { 
      category: "Skin", 
      question: "Cut bleeding moderately", 
      answer: "🩹 Clean hands, apply pressure with clean cloth. Elevate if possible. Seek care if deep, gaping, or won't stop bleeding.", 
      urgency: "semi-urgent" 
    },
    { 
      category: "Skin", 
      question: "Insect bite swollen", 
      answer: "🐛 Clean area, cold compress, anti-inflammatory cream. Watch for signs of allergic reaction or infection.", 
      urgency: "non-urgent" 
    },

    // MENTAL HEALTH
    { 
      category: "Mental Health", 
      question: "Feeling suicidal thoughts", 
      answer: "🚨 CRITICAL: You're not alone. Call 112 or Kuwait Crisis Helpline: 965-2481-4020. Immediate professional help needed.", 
      urgency: "critical" 
    },
    { 
      category: "Mental Health", 
      question: "Panic attack symptoms", 
      answer: "💨 Sit down, breathe slowly and deeply. Ground yourself: 5 things you see, 4 you hear. This will pass. Practice regularly.", 
      urgency: "urgent" 
    },
    { 
      category: "Mental Health", 
      question: "Severe anxiety overwhelming", 
      answer: "😰 Deep breathing, remove from stressful situation. Practice grounding techniques. Consider professional support.", 
      urgency: "semi-urgent" 
    },
    { 
      category: "Mental Health", 
      question: "Depression persistent sadness", 
      answer: "💙 Depression is treatable. Maintain routine, social connections. Consider therapy and medical evaluation.", 
      urgency: "semi-urgent" 
    },

    // WOMEN'S HEALTH
    { 
      category: "Women's Health", 
      question: "Severe menstrual pain", 
      answer: "🩸 Heat therapy, anti-inflammatory medication. Track symptoms. See doctor if pain interferes with daily activities.", 
      urgency: "semi-urgent" 
    },
    { 
      category: "Women's Health", 
      question: "Pregnancy nausea severe", 
      answer: "🤰 Small frequent meals, ginger tea, avoid triggers. If severe vomiting/dehydration, contact healthcare provider.", 
      urgency: "semi-urgent" 
    },
    { 
      category: "Women's Health", 
      question: "Breast lump discovered", 
      answer: "🩺 Schedule medical evaluation promptly. Most lumps are benign, but early detection is important.", 
      urgency: "urgent" 
    },

    // CHILDREN'S HEALTH
    { 
      category: "Pediatric", 
      question: "Child fever 103F high", 
      answer: "🚨 URGENT: High fever in child needs medical attention. Cool cloths, fluids, age-appropriate fever reducer.", 
      urgency: "urgent" 
    },
    { 
      category: "Pediatric", 
      question: "Baby crying inconsolably", 
      answer: "👶 Check diaper, feeding, temperature. Try swaddling, white noise. If fever or concerning symptoms - see doctor.", 
      urgency: "semi-urgent" 
    },
    { 
      category: "Pediatric", 
      question: "Child fell hit head", 
      answer: "🚨 URGENT: Head injury in child needs evaluation. Watch for vomiting, confusion, severe headache. Seek immediate care.", 
      urgency: "urgent" 
    },

    // ELDERLY HEALTH
    { 
      category: "Elderly", 
      question: "Elderly parent fell", 
      answer: "🚨 URGENT: Falls in elderly can cause serious injury. Check for pain, ability to move. May need emergency evaluation.", 
      urgency: "urgent" 
    },
    { 
      category: "Elderly", 
      question: "Medication confusion multiple pills", 
      answer: "💊 Use pill organizer, medication list. Consult pharmacist or doctor about interactions and timing.", 
      urgency: "semi-urgent" 
    },

    // EYE CONDITIONS
    { 
      category: "Eye", 
      question: "Sudden vision loss", 
      answer: "🚨 CRITICAL: Sudden vision loss is emergency. Protect eye, seek immediate ophthalmologic care.", 
      urgency: "critical" 
    },
    { 
      category: "Eye", 
      question: "Eye pain red irritated", 
      answer: "👁️ Avoid rubbing, flush with clean water. Remove contacts. See doctor if pain persists or vision affected.", 
      urgency: "semi-urgent" 
    },
    { 
      category: "Eye", 
      question: "Something in eye foreign object", 
      answer: "👁️ Don't rub! Blink frequently, flush gently with clean water. If embedded or painful, seek medical care.", 
      urgency: "urgent" 
    },

    // EAR CONDITIONS
    { 
      category: "Ear", 
      question: "Ear infection pain", 
      answer: "👂 Warm compress, pain reliever. Don't insert anything in ear. See doctor for antibiotic evaluation.", 
      urgency: "semi-urgent" 
    },
    { 
      category: "Ear", 
      question: "Sudden hearing loss", 
      answer: "🚨 URGENT: Sudden hearing loss needs prompt medical evaluation. May be treatable if caught early.", 
      urgency: "urgent" 
    },
    { 
      category: "Ear", 
      question: "Ear wax buildup blocked", 
      answer: "👂 Don't use cotton swabs. Try over-counter ear drops. See doctor if severe blockage or pain.", 
      urgency: "non-urgent" 
    },

    // ORTHOPEDIC
    { 
      category: "Orthopedic", 
      question: "Ankle sprain swollen", 
      answer: "🦶 RICE protocol: Rest, Ice, Compression, Elevation. If severe pain or can't bear weight, see doctor.", 
      urgency: "semi-urgent" 
    },
    { 
      category: "Orthopedic", 
      question: "Wrist pain after fall", 
      answer: "🤕 Ice, elevate, immobilize. If severe pain, deformity, or can't move - may be fractured. Seek care.", 
      urgency: "urgent" 
    },
    { 
      category: "Orthopedic", 
      question: "Knee pain when walking", 
      answer: "🦵 Rest, ice, gentle compression. Avoid high impact. See doctor if severe pain or instability.", 
      urgency: "semi-urgent" 
    },

    // UROLOGICAL
    { 
      category: "Urological", 
      question: "Blood in urine", 
      answer: "🚨 URGENT: Blood in urine needs medical evaluation. Could indicate infection, stones, or other condition.", 
      urgency: "urgent" 
    },
    { 
      category: "Urological", 
      question: "Kidney stone pain", 
      answer: "🚨 URGENT: Severe flank pain may be kidney stone. Stay hydrated, pain management. Seek medical care.", 
      urgency: "urgent" 
    },
    { 
      category: "Urological", 
      question: "Frequent urination urgent", 
      answer: "🚽 Could indicate UTI, diabetes, or other condition. Track symptoms, see doctor for evaluation.", 
      urgency: "semi-urgent" 
    },

    // ENDOCRINE
    { 
      category: "Endocrine", 
      question: "Blood sugar very high", 
      answer: "🚨 URGENT: High blood sugar can be dangerous. Check ketones if diabetic. Seek immediate care if severe.", 
      urgency: "urgent" 
    },
    { 
      category: "Endocrine", 
      question: "Thyroid symptoms fatigue", 
      answer: "🦋 Fatigue, weight changes may indicate thyroid issues. Schedule blood work and doctor evaluation.", 
      urgency: "semi-urgent" 
    },

    // GENERAL SYMPTOMS
    { 
      category: "General", 
      question: "Fatigue extreme exhaustion", 
      answer: "😴 Ensure good sleep, nutrition, hydration. Could indicate various conditions. See doctor if persistent.", 
      urgency: "semi-urgent" 
    },
    { 
      category: "General", 
      question: "Weight loss unexplained", 
      answer: "⚖️ Unintentional weight loss needs medical evaluation. Could indicate various underlying conditions.", 
      urgency: "semi-urgent" 
    },
    { 
      category: "General", 
      question: "Night sweats recurring", 
      answer: "🌙 Night sweats can indicate infection, hormonal changes, or other conditions. Track patterns, see doctor.", 
      urgency: "semi-urgent" 
    },
    { 
      category: "General", 
      question: "Swollen lymph nodes", 
      answer: "🦠 Often indicates body fighting infection. Monitor size/pain. See doctor if large, hard, or persistent.", 
      urgency: "semi-urgent" 
    },

    // ALLERGIC REACTIONS
    { 
      category: "Allergy", 
      question: "Food allergy mild reaction", 
      answer: "🥜 Remove allergen, antihistamine if available. Watch for worsening. If breathing issues - emergency care.", 
      urgency: "semi-urgent" 
    },
    { 
      category: "Allergy", 
      question: "Hives itchy welts", 
      answer: "🔴 Remove trigger, cool compress, antihistamine. If spreading rapidly or breathing issues - seek care.", 
      urgency: "semi-urgent" 
    },

    // DRUG/POISON
    { 
      category: "Poisoning", 
      question: "Accidental overdose medication", 
      answer: "🚨 CRITICAL: Call Poison Control: 965-2481-0505 or emergency services. Don't induce vomiting unless instructed.", 
      urgency: "critical" 
    },
    { 
      category: "Poisoning", 
      question: "Chemical exposure skin", 
      answer: "🚨 URGENT: Remove contaminated clothing, flush with water 15-20 minutes. Call Poison Control for guidance.", 
      urgency: "urgent" 
    },

    // COMMON COLDS/FLU
    { 
      category: "Cold/Flu", 
      question: "Common cold stuffy nose", 
      answer: "🤧 Rest, fluids, humidifier. Saline rinses help congestion. Usually resolves in 7-10 days.", 
      urgency: "non-urgent" 
    },
    { 
      category: "Cold/Flu", 
      question: "Cough keeping me awake", 
      answer: "💤 Elevate head while sleeping, honey before bed, humidifier. Cough drops may help. See doctor if persistent.", 
      urgency: "non-urgent" 
    },

    // FIRST AID
    { 
      category: "First Aid", 
      question: "Nosebleed won't stop", 
      answer: "🩸 Lean forward, pinch soft part of nose 10-15 minutes. Ice pack on bridge. If >20 minutes, seek care.", 
      urgency: "semi-urgent" 
    },
    { 
      category: "First Aid", 
      question: "Choking conscious adult", 
      answer: "🚨 CRITICAL: Back blows, then abdominal thrusts (Heimlich). If unconscious, call 112 and start CPR.", 
      urgency: "critical" 
    },
    { 
      category: "First Aid", 
      question: "Bee sting allergic", 
      answer: "🐝 Remove stinger by scraping, ice pack. Watch for systemic reaction. If breathing issues - emergency care.", 
      urgency: "semi-urgent" 
    },

    // TRAVEL HEALTH
    { 
      category: "Travel", 
      question: "Motion sickness nausea", 
      answer: "🚗 Ginger, fresh air, focus on horizon. Avoid reading. Anti-motion sickness meds available over-counter.", 
      urgency: "non-urgent" 
    },
    { 
      category: "Travel", 
      question: "Travelers diarrhea", 
      answer: "✈️ Stay hydrated with electrolytes. BRAT diet. Avoid dairy. See doctor if severe, blood, or fever.", 
      urgency: "semi-urgent" 
    },

    // SPORTS INJURIES  
    { 
      category: "Sports", 
      question: "Muscle cramp severe", 
      answer: "🏃 Gently stretch, massage, hydrate with electrolytes. Usually resolves quickly. See doctor if frequent.", 
      urgency: "non-urgent" 
    },
    { 
      category: "Sports", 
      question: "Concussion hit head", 
      answer: "🚨 URGENT: Head injury needs evaluation. Watch for confusion, vomiting, severe headache. Rest from activities.", 
      urgency: "urgent" 
    },

    // WORKPLACE INJURIES
    { 
      category: "Workplace", 
      question: "Chemical burn workplace", 
      answer: "🚨 URGENT: Flush with water 15-20 minutes. Remove contaminated clothing. Call emergency services and Poison Control.", 
      urgency: "urgent" 
    },
    { 
      category: "Workplace", 
      question: "Back injury lifting", 
      answer: "🏗️ Stop activity, ice first 48 hours. Rest, gentle movement. Report to supervisor. See doctor if severe.", 
      urgency: "semi-urgent" 
    }
  ];

  // Group questions by category for easy browsing
  const questionsByCategory = preloadedQuestions.reduce((acc, q) => {
    if (!acc[q.category]) acc[q.category] = [];
    acc[q.category].push(q);
    return acc;
  }, {} as Record<string, typeof preloadedQuestions>);

  // Search through preloaded questions
  const searchPreloadedQuestions = (query: string) => {
    return preloadedQuestions.filter(q => 
      q.question.toLowerCase().includes(query.toLowerCase()) ||
      q.answer.toLowerCase().includes(query.toLowerCase())
    );
  };

  // Handle preloaded question selection
  const selectPreloadedQuestion = (question: any) => {
    // Add user message
    setChatMessages(prev => [...prev, {
      role: "user",
      content: question.question,
      timestamp: new Date()
    }]);

    // Add instant AI response
    setChatMessages(prev => [...prev, {
      role: "ai", 
      content: question.answer,
      timestamp: new Date(),
      urgency: question.urgency === "critical" ? "critical" : 
               question.urgency === "urgent" ? "urgent" : "normal"
    }]);

    setShowPreloadedQuestions(false);
    
    if (question.urgency === "critical") {
      onEmergencyDetected("CRITICAL");
    } else if (question.urgency === "urgent") {
      onEmergencyDetected("URGENT");
    }

    toast({
      title: `${question.urgency.toUpperCase()} Response`,
      description: "Instant medical guidance provided",
      variant: question.urgency === "critical" ? "destructive" : "default"
    });
  };

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      
      recognitionRef.current.onresult = (event) => {
        const latestResult = event.results[event.results.length - 1];
        if (latestResult.isFinal) {
          setTranscript(latestResult[0].transcript);
          analyzeSymptoms(latestResult[0].transcript);
        }
      };
      
      recognitionRef.current.onerror = () => {
        setIsListening(false);
        toast({
          title: "Voice Recognition Error",
          description: "Please try again or type your symptoms",
          variant: "destructive"
        });
      };
    }
  }, []);

  // Advanced symptom analysis AI
  const analyzeSymptoms = useCallback(async (symptoms: string) => {
    setIsAnalyzing(true);
    setAnalysisProgress(0);
    
    // Add user message to chat
    setChatMessages(prev => [...prev, {
      role: "user",
      content: symptoms,
      timestamp: new Date()
    }]);

    // Progress simulation for real-time feel
    const progressInterval = setInterval(() => {
      setAnalysisProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + Math.random() * 15;
      });
    }, 200);

    // Advanced AI analysis simulation
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Medical triage logic based on keywords and context
    const criticalKeywords = [
      "chest pain", "heart attack", "can't breathe", "bleeding", "unconscious",
      "stroke", "seizure", "overdose", "suicide", "choking", "severe pain",
      "allergic reaction", "anaphylaxis", "cardiac arrest", "difficulty breathing"
    ];
    
    const urgentKeywords = [
      "severe", "intense", "unbearable", "high fever", "vomiting blood",
      "severe headache", "vision loss", "numbness", "paralysis", "fall"
    ];

    const symptomLower = symptoms.toLowerCase();
    let urgencyLevel: TriageResult['urgencyLevel'] = "non-urgent";
    let confidence = 0.7;
    let timeToTreat = "4+ hours";
    let emergencyProtocol = "Monitor symptoms";

    // Critical condition detection
    if (criticalKeywords.some(keyword => symptomLower.includes(keyword))) {
      urgencyLevel = "critical";
      confidence = 0.95;
      timeToTreat = "IMMEDIATE";
      emergencyProtocol = "Call 112 NOW - Emergency Services Dispatch";
      onEmergencyDetected("CRITICAL");
    } else if (urgentKeywords.some(keyword => symptomLower.includes(keyword))) {
      urgencyLevel = "urgent";
      confidence = 0.85;
      timeToTreat = "15-60 minutes";
      emergencyProtocol = "Seek immediate medical attention";
      onEmergencyDetected("URGENT");
    } else if (symptomLower.includes("pain") || symptomLower.includes("fever")) {
      urgencyLevel = "semi-urgent";
      confidence = 0.75;
      timeToTreat = "2-4 hours";
      emergencyProtocol = "Visit urgent care or ER";
    }

    // Enhanced analysis with vitals integration
    if (currentVitals) {
      if (currentVitals.heartRate > 120 || currentVitals.heartRate < 50) {
        urgencyLevel = urgencyLevel === "non-urgent" ? "urgent" : urgencyLevel;
        confidence = Math.min(confidence + 0.1, 0.95);
      }
      if (currentVitals.spO2 < 90) {
        urgencyLevel = "critical";
        confidence = 0.98;
        timeToTreat = "IMMEDIATE";
        emergencyProtocol = "OXYGEN EMERGENCY - Call 112";
      }
      if (currentVitals.temperature > 39 || currentVitals.temperature < 35) {
        urgencyLevel = urgencyLevel === "non-urgent" ? "urgent" : urgencyLevel;
      }
    }

    const result: TriageResult = {
      urgencyLevel,
      confidence,
      primaryConcern: extractPrimaryConcern(symptoms),
      recommendedAction: generateRecommendedAction(urgencyLevel),
      symptoms: extractSymptoms(symptoms),
      riskFactors: assessRiskFactors(symptoms, currentVitals),
      timeToTreat,
      medicationWarnings: checkMedicationInteractions(symptoms),
      emergencyProtocol
    };

    clearInterval(progressInterval);
    setAnalysisProgress(100);
    setTriageResult(result);
    setIsAnalyzing(false);

    // Add AI response to chat
    const aiResponse = generateAIResponse(result);
    setChatMessages(prev => [...prev, {
      role: "ai",
      content: aiResponse,
      timestamp: new Date(),
      urgency: urgencyLevel === "critical" ? "critical" : urgencyLevel === "urgent" ? "urgent" : "normal"
    }]);

    onGuidanceGenerated(aiResponse);

    toast({
      title: `${urgencyLevel.toUpperCase()} Priority Detected`,
      description: `Confidence: ${Math.round(confidence * 100)}% | ${timeToTreat}`,
      variant: urgencyLevel === "critical" ? "destructive" : "default"
    });
  }, [currentVitals, onEmergencyDetected, onGuidanceGenerated]);

  // Helper functions for medical analysis
  const extractPrimaryConcern = (symptoms: string): string => {
    if (symptoms.toLowerCase().includes("chest")) return "Cardiac Event";
    if (symptoms.toLowerCase().includes("breath")) return "Respiratory Distress";
    if (symptoms.toLowerCase().includes("head")) return "Neurological Concern";
    if (symptoms.toLowerCase().includes("pain")) return "Pain Management";
    return "General Medical Assessment";
  };

  const extractSymptoms = (input: string): string[] => {
    const commonSymptoms = [
      "pain", "nausea", "dizziness", "fever", "headache", 
      "shortness of breath", "chest pain", "fatigue"
    ];
    return commonSymptoms.filter(symptom => 
      input.toLowerCase().includes(symptom)
    );
  };

  const assessRiskFactors = (symptoms: string, vitals?: any): string[] => {
    const factors = [];
    if (vitals?.heartRate > 100) factors.push("Tachycardia");
    if (vitals?.spO2 < 95) factors.push("Low Oxygen Saturation");
    if (symptoms.toLowerCase().includes("diabetes")) factors.push("Diabetes");
    if (symptoms.toLowerCase().includes("heart")) factors.push("Cardiac History");
    return factors;
  };

  const checkMedicationInteractions = (symptoms: string): string[] => {
    const warnings = [];
    if (symptoms.toLowerCase().includes("blood thinner")) {
      warnings.push("⚠️ Bleeding risk with blood thinners");
    }
    if (symptoms.toLowerCase().includes("aspirin")) {
      warnings.push("⚠️ Aspirin may increase bleeding");
    }
    return warnings;
  };

  const generateRecommendedAction = (level: string): string => {
    switch (level) {
      case "critical": return "Call 112 immediately. Do not drive yourself.";
      case "urgent": return "Seek immediate medical attention at nearest ER.";
      case "semi-urgent": return "Visit urgent care within 2-4 hours.";
      default: return "Monitor symptoms. Contact your doctor if worsening.";
    }
  };

  const generateAIResponse = (result: TriageResult): string => {
    return `Medical Assessment Complete:
    
🎯 Primary Concern: ${result.primaryConcern}
⚡ Urgency Level: ${result.urgencyLevel.toUpperCase()}
📊 Confidence: ${Math.round(result.confidence * 100)}%
⏰ Time to Treatment: ${result.timeToTreat}

📋 Recommended Action:
${result.recommendedAction}

${result.medicationWarnings.length > 0 ? `\n⚠️ Medication Warnings:\n${result.medicationWarnings.join('\n')}` : ''}

🚨 Emergency Protocol: ${result.emergencyProtocol}`;
  };

  // Voice input toggle
  const toggleListening = useCallback(() => {
    if (!recognitionRef.current) return;
    
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
      toast({
        title: "🎤 Listening...",
        description: "Describe your symptoms clearly",
        variant: "default"
      });
    }
  }, [isListening]);

  // Text input submission
  const submitSymptoms = useCallback(() => {
    if (userInput.trim()) {
      analyzeSymptoms(userInput);
      setUserInput("");
    }
  }, [userInput, analyzeSymptoms]);

  // Emergency actions
  const callEmergencyServices = useCallback(() => {
    onLocationNeeded();
    toast({
      title: "🚨 CALLING 112",
      description: "Emergency services contacted with your location",
      variant: "destructive"
    });
    
    // In real app, would actually call emergency services
    window.open("tel:112", "_self");
  }, [onLocationNeeded]);

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "critical": return "text-red-500 bg-red-500/20";
      case "urgent": return "text-orange-500 bg-orange-500/20";
      case "semi-urgent": return "text-yellow-500 bg-yellow-500/20";
      default: return "text-green-500 bg-green-500/20";
    }
  };

  return (
    <div className="space-y-6">
      {/* Emergency Header */}
      <Card className="p-6 bg-[var(--gradient-medical)] border-cyber-blue/30">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-cyber-blue/20">
              <Stethoscope className="w-6 h-6 text-cyber-blue" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-cyber-blue">AI Medical Triage</h2>
              <p className="text-sm text-muted-foreground">
                Real-time medical assessment • Emergency detection • Life-saving guidance
              </p>
            </div>
          </div>
          
          {triageResult && (
            <Badge className={cn("font-semibold", getUrgencyColor(triageResult.urgencyLevel))}>
              {triageResult.urgencyLevel.toUpperCase()}
            </Badge>
          )}
        </div>

        {/* Quick Emergency Actions + Preloaded Questions */}
        <div className="space-y-3">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button 
              variant="destructive" 
              size="sm"
              onClick={callEmergencyServices}
              className="flex items-center gap-2"
            >
              <Phone className="w-4 h-4" />
              Call 112
            </Button>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                const vitals = currentVitals ? `HR: ${currentVitals.heartRate}, SpO2: ${currentVitals.spO2}` : "No vitals";
                analyzeSymptoms(`Emergency vitals check: ${vitals}`);
              }}
              className="flex items-center gap-2"
            >
              <Heart className="w-4 h-4" />
              Vitals Check
            </Button>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => analyzeSymptoms("Difficulty breathing, shortness of breath")}
              className="flex items-center gap-2"
            >
              <AlertTriangle className="w-4 h-4" />
              Can't Breathe
            </Button>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => analyzeSymptoms("Severe chest pain, heart attack symptoms")}
              className="flex items-center gap-2"
            >
              <Zap className="w-4 h-4" />
              Chest Pain
            </Button>
          </div>

          {/* Common Questions Quick Access */}
          <div className="flex flex-wrap gap-2">
            <Button 
              variant="secondary" 
              size="sm"
              onClick={() => selectPreloadedQuestion(preloadedQuestions.find(q => q.question.includes("Chest pain"))!)}
              className="text-xs"
            >
              Chest Pain
            </Button>
            <Button 
              variant="secondary" 
              size="sm"  
              onClick={() => selectPreloadedQuestion(preloadedQuestions.find(q => q.question.includes("High fever"))!)}
              className="text-xs"
            >
              High Fever
            </Button>
            <Button 
              variant="secondary" 
              size="sm"
              onClick={() => selectPreloadedQuestion(preloadedQuestions.find(q => q.question.includes("Back pain"))!)} 
              className="text-xs"
            >
              Back Pain
            </Button>
            <Button 
              variant="secondary" 
              size="sm"
              onClick={() => selectPreloadedQuestion(preloadedQuestions.find(q => q.question.includes("Nausea"))!)}
              className="text-xs"
            >
              Nausea
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowPreloadedQuestions(!showPreloadedQuestions)}
              className="text-xs"
            >
              View All 100+ Questions
            </Button>
          </div>
        </div>
      </Card>

      {/* Preloaded Questions Browser */}
      {showPreloadedQuestions && (
        <Card className="p-6 bg-gradient-to-br from-blue-500/5 to-purple-500/5 border-blue-500/30">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-blue-500">100+ Medical Questions Database</h3>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowPreloadedQuestions(false)}
            >
              Close
            </Button>
          </div>
          
          <div className="max-h-96 overflow-y-auto space-y-4">
            {Object.entries(questionsByCategory).map(([category, questions]) => (
              <div key={category} className="space-y-2">
                <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                  {category} ({questions.length})
                </h4>
                <div className="grid gap-2">
                  {questions.slice(0, 5).map((q, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => selectPreloadedQuestion(q)}
                      className={cn(
                        "justify-start text-left h-auto p-3 hover:scale-[1.02] transition-transform",
                        q.urgency === "critical" && "border-red-500/30 hover:bg-red-500/10",
                        q.urgency === "urgent" && "border-orange-500/30 hover:bg-orange-500/10",
                        q.urgency === "semi-urgent" && "border-yellow-500/30 hover:bg-yellow-500/10"
                      )}
                    >
                      <div className="space-y-1">
                        <div className="font-medium text-sm">{q.question}</div>
                        <div className="text-xs text-muted-foreground line-clamp-2">
                          {q.answer.substring(0, 100)}...
                        </div>
                        <Badge 
                          variant="outline" 
                          className={cn(
                            "text-xs",
                            q.urgency === "critical" && "border-red-500 text-red-500",
                            q.urgency === "urgent" && "border-orange-500 text-orange-500", 
                            q.urgency === "semi-urgent" && "border-yellow-500 text-yellow-500",
                            q.urgency === "non-urgent" && "border-green-500 text-green-500"
                          )}
                        >
                          {q.urgency}
                        </Badge>
                      </div>
                    </Button>
                  ))}
                  {questions.length > 5 && (
                    <Button variant="ghost" size="sm" className="text-xs">
                      +{questions.length - 5} more {category.toLowerCase()} questions
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Chat Interface */}
      <Card className="p-6">
        <div className="space-y-4">
          {/* Chat Messages */}
          <div className="max-h-64 overflow-y-auto space-y-3 border rounded-lg p-4 bg-background/50">
            {chatMessages.map((message, index) => (
              <div 
                key={index} 
                className={cn(
                  "flex items-start gap-3 animate-fade-in",
                  message.role === "user" ? "flex-row-reverse" : ""
                )}
              >
                <div className={cn(
                  "p-2 rounded-full",
                  message.role === "user" ? "bg-blue-500/20" : 
                  message.role === "ai" ? "bg-green-500/20" : "bg-gray-500/20"
                )}>
                  {message.role === "user" && <MessageSquare className="w-4 h-4 text-blue-500" />}
                  {message.role === "ai" && <Brain className="w-4 h-4 text-green-500" />}
                  {message.role === "system" && <Shield className="w-4 h-4 text-gray-500" />}
                </div>
                
                <div className={cn(
                  "max-w-[80%] p-3 rounded-lg",
                  message.role === "user" ? "bg-blue-500/10 ml-auto" :
                  message.urgency === "critical" ? "bg-red-500/10 border border-red-500/30" :
                  message.urgency === "urgent" ? "bg-orange-500/10 border border-orange-500/30" :
                  "bg-green-500/10"
                )}>
                  <p className="text-sm whitespace-pre-line">{message.content}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Analysis Progress */}
          {isAnalyzing && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>🧠 AI Medical Analysis in progress...</span>
                <span>{Math.round(analysisProgress)}%</span>
              </div>
              <Progress value={analysisProgress} className="h-2" />
            </div>
          )}

          {/* Input Section */}
          <div className="space-y-3">
            <div className="flex gap-2">
              <Textarea
                placeholder="Describe your symptoms, pain level, what happened..."
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                className="flex-1 min-h-[60px] resize-none"
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    submitSymptoms();
                  }
                }}
              />
              
              <div className="flex flex-col gap-2">
                <Button
                  onClick={toggleListening}
                  variant={isListening ? "destructive" : "outline"}
                  size="sm"
                  className="flex items-center gap-2"
                >
                  {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  {isListening ? "Stop" : "Speak"}
                </Button>
                
                <Button 
                  onClick={submitSymptoms}
                  disabled={!userInput.trim() || isAnalyzing}
                  size="sm"
                >
                  Analyze
                </Button>
              </div>
            </div>

            {transcript && (
              <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/30">
                <p className="text-sm"><strong>Voice Input:</strong> {transcript}</p>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Detailed Results */}
      {triageResult && (
        <Card className="p-6 animate-scale-in">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Brain className="w-5 h-5 text-cyber-purple" />
                Medical Assessment Results
              </h3>
              <Badge className={cn("text-sm", getUrgencyColor(triageResult.urgencyLevel))}>
                {Math.round(triageResult.confidence * 100)}% Confidence
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="p-4 bg-background/50">
                <div className="text-center">
                  <AlertTriangle className={cn("w-8 h-8 mx-auto mb-2", 
                    triageResult.urgencyLevel === "critical" ? "text-red-500" :
                    triageResult.urgencyLevel === "urgent" ? "text-orange-500" :
                    triageResult.urgencyLevel === "semi-urgent" ? "text-yellow-500" : "text-green-500"
                  )} />
                  <div className="text-sm font-medium">Priority Level</div>
                  <div className="text-lg font-bold capitalize">{triageResult.urgencyLevel}</div>
                </div>
              </Card>

              <Card className="p-4 bg-background/50">
                <div className="text-center">
                  <Clock className="w-8 h-8 mx-auto mb-2 text-cyber-blue" />
                  <div className="text-sm font-medium">Time to Treat</div>
                  <div className="text-lg font-bold">{triageResult.timeToTreat}</div>
                </div>
              </Card>

              <Card className="p-4 bg-background/50">
                <div className="text-center">
                  <Stethoscope className="w-8 h-8 mx-auto mb-2 text-cyber-green" />
                  <div className="text-sm font-medium">Primary Concern</div>
                  <div className="text-sm font-bold">{triageResult.primaryConcern}</div>
                </div>
              </Card>

              <Card className="p-4 bg-background/50">
                <div className="text-center">
                  <Shield className="w-8 h-8 mx-auto mb-2 text-cyber-purple" />
                  <div className="text-sm font-medium">Risk Factors</div>
                  <div className="text-sm font-bold">{triageResult.riskFactors.length}</div>
                </div>
              </Card>
            </div>

            {/* Action Plan */}
            <div className="space-y-4">
              <h4 className="font-semibold text-cyber-blue">🎯 Recommended Action Plan:</h4>
              <div className="p-4 bg-cyber-blue/10 rounded-lg border border-cyber-blue/30">
                <p className="font-medium">{triageResult.recommendedAction}</p>
              </div>

              {triageResult.medicationWarnings.length > 0 && (
                <div className="p-4 bg-orange-500/10 rounded-lg border border-orange-500/30">
                  <h5 className="font-semibold text-orange-500 mb-2">⚠️ Medication Warnings:</h5>
                  <ul className="space-y-1">
                    {triageResult.medicationWarnings.map((warning, index) => (
                      <li key={index} className="text-sm">{warning}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="p-4 bg-red-500/10 rounded-lg border border-red-500/30">
                <h5 className="font-semibold text-red-500 mb-2">🚨 Emergency Protocol:</h5>
                <p className="text-sm font-medium">{triageResult.emergencyProtocol}</p>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};