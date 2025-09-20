import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Brain, Mic, MicOff, Activity, Heart, AlertTriangle, CheckCircle } from 'lucide-react';

interface TriageResult {
  severity: 'low' | 'medium' | 'high' | 'emergency';
  symptoms: string[];
  recommendations: string[];
  confidence: number;
  nextSteps: string;
  urgency: number;
}

interface VoiceCommand {
  command: string;
  timestamp: Date;
  confidence: number;
}

export const AITriageVoice = () => {
  const { toast } = useToast();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [triageResult, setTriageResult] = useState<TriageResult | null>(null);
  const [voiceCommands, setVoiceCommands] = useState<VoiceCommand[]>([]);
  const [recognition, setRecognition] = useState<any>(null);
  const [analysisProgress, setAnalysisProgress] = useState(0);

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = 'en-US';
      
      recognitionInstance.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcriptPart = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcriptPart;
          } else {
            interimTranscript += transcriptPart;
          }
        }
        
        setTranscript(finalTranscript + interimTranscript);
        
        if (finalTranscript) {
          processVoiceInput(finalTranscript);
        }
      };
      
      recognitionInstance.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };
      
      recognitionInstance.onend = () => {
        setIsListening(false);
      };
      
      setRecognition(recognitionInstance);
    }
  }, []);

  const startListening = useCallback(() => {
    if (recognition) {
      setIsListening(true);
      setTranscript('');
      recognition.start();
      
      toast({
        title: "AI Triage Listening",
        description: "Describe your symptoms or emergency situation",
      });
    }
  }, [recognition, toast]);

  const stopListening = useCallback(() => {
    if (recognition) {
      recognition.stop();
      setIsListening(false);
      
      if (transcript.trim()) {
        analyzeSymptoms(transcript);
      }
    }
  }, [recognition, transcript]);

  const processVoiceInput = useCallback((input: string) => {
    const command: VoiceCommand = {
      command: input,
      timestamp: new Date(),
      confidence: 0.9
    };
    
    setVoiceCommands(prev => [command, ...prev.slice(0, 4)]);
    
    // Check for emergency keywords
    const emergencyWords = ['emergency', 'help', 'pain', 'bleeding', 'unconscious', 'heart attack', 'stroke', 'choking'];
    const isEmergency = emergencyWords.some(word => 
      input.toLowerCase().includes(word)
    );
    
    if (isEmergency) {
      toast({
        title: "Emergency Detected",
        description: "Prioritizing your case for immediate triage",
        variant: "destructive"
      });
    }
  }, [toast]);

  const analyzeSymptoms = useCallback(async (symptoms: string) => {
    setIsAnalyzing(true);
    setAnalysisProgress(0);
    
    // Simulate AI analysis with progress
    const progressInterval = setInterval(() => {
      setAnalysisProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
    
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock AI triage analysis
    const result = generateTriageResult(symptoms);
    setTriageResult(result);
    setIsAnalyzing(false);
    
    toast({
      title: "AI Triage Complete",
      description: `${result.severity.toUpperCase()} priority • ${result.confidence}% confidence`,
      variant: result.severity === 'emergency' ? 'destructive' : 'default'
    });
  }, [toast]);

  const generateTriageResult = (symptoms: string): TriageResult => {
    const lowerSymptoms = symptoms.toLowerCase();
    
    // Emergency keywords
    if (lowerSymptoms.includes('chest pain') || lowerSymptoms.includes('heart attack') || 
        lowerSymptoms.includes('unconscious') || lowerSymptoms.includes('bleeding') ||
        lowerSymptoms.includes('stroke') || lowerSymptoms.includes('choking')) {
      return {
        severity: 'emergency',
        symptoms: ['Chest pain', 'Difficulty breathing', 'Severe distress'],
        recommendations: ['Call 112 immediately', 'Do not drive yourself', 'Stay calm and sit down'],
        confidence: 92,
        nextSteps: 'Emergency services have been notified. Stay on the line.',
        urgency: 95
      };
    }
    
    // High priority
    if (lowerSymptoms.includes('severe pain') || lowerSymptoms.includes('fever') || 
        lowerSymptoms.includes('vomiting') || lowerSymptoms.includes('dizzy')) {
      return {
        severity: 'high',
        symptoms: ['Severe pain', 'High fever', 'Nausea'],
        recommendations: ['Seek medical attention within 2 hours', 'Take temperature', 'Stay hydrated'],
        confidence: 85,
        nextSteps: 'Contact your doctor or visit urgent care.',
        urgency: 75
      };
    }
    
    // Medium priority
    if (lowerSymptoms.includes('headache') || lowerSymptoms.includes('cough') || 
        lowerSymptoms.includes('tired') || lowerSymptoms.includes('sore')) {
      return {
        severity: 'medium',
        symptoms: ['Headache', 'Fatigue', 'Mild discomfort'],
        recommendations: ['Rest and monitor symptoms', 'Stay hydrated', 'Consider over-the-counter medication'],
        confidence: 78,
        nextSteps: 'Schedule appointment with primary care if symptoms persist.',
        urgency: 45
      };
    }
    
    // Low priority (default)
    return {
      severity: 'low',
      symptoms: ['Mild symptoms', 'General discomfort'],
      recommendations: ['Rest and self-care', 'Monitor symptoms', 'Maintain good hygiene'],
      confidence: 70,
      nextSteps: 'Continue monitoring. Contact doctor if symptoms worsen.',
      urgency: 20
    };
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'emergency': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'default';
      default: return 'default';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'emergency': return <AlertTriangle className="h-5 w-5 text-destructive" />;
      case 'high': return <Heart className="h-5 w-5 text-destructive" />;
      case 'medium': return <Activity className="h-5 w-5 text-warning" />;
      case 'low': return <CheckCircle className="h-5 w-5 text-success" />;
      default: return <Brain className="h-5 w-5" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card className="gradient-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-6 w-6 text-primary" />
            AI Medical Triage
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-center">
            <Button
              size="lg"
              variant={isListening ? "destructive" : "default"}
              onClick={isListening ? stopListening : startListening}
              className="w-full h-16 text-lg"
              disabled={isAnalyzing}
            >
              {isListening ? (
                <>
                  <MicOff className="h-6 w-6 mr-2" />
                  Stop Recording
                </>
              ) : (
                <>
                  <Mic className="h-6 w-6 mr-2" />
                  Start Voice Triage
                </>
              )}
            </Button>
          </div>

          {isListening && (
            <div className="text-center p-4 bg-primary/10 rounded-lg">
              <div className="animate-pulse text-primary font-medium">
                🎤 Listening... Describe your symptoms
              </div>
              <div className="text-sm text-muted-foreground mt-2">
                Speak clearly about how you're feeling
              </div>
            </div>
          )}

          {transcript && (
            <Card className="bg-muted">
              <CardContent className="p-4">
                <h4 className="font-medium mb-2">Voice Input:</h4>
                <p className="text-sm">{transcript}</p>
              </CardContent>
            </Card>
          )}

          {isAnalyzing && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">AI Analysis Progress</span>
                <span className="text-sm text-muted-foreground">{analysisProgress}%</span>
              </div>
              <Progress value={analysisProgress} className="w-full" />
              <p className="text-xs text-muted-foreground">
                Analyzing symptoms and medical patterns...
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {triageResult && (
        <Card className="gradient-border">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getSeverityIcon(triageResult.severity)}
                Triage Result
              </div>
              <Badge variant={getSeverityColor(triageResult.severity)}>
                {triageResult.severity.toUpperCase()}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">Confidence Score</h4>
                <div className="flex items-center gap-2">
                  <Progress value={triageResult.confidence} className="flex-1" />
                  <span className="text-sm font-medium">{triageResult.confidence}%</span>
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2">Urgency Level</h4>
                <div className="flex items-center gap-2">
                  <Progress value={triageResult.urgency} className="flex-1" />
                  <span className="text-sm font-medium">{triageResult.urgency}%</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">Identified Symptoms</h4>
              <div className="flex flex-wrap gap-1">
                {triageResult.symptoms.map((symptom, index) => (
                  <Badge key={index} variant="outline">
                    {symptom}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">Recommendations</h4>
              <ul className="space-y-1">
                {triageResult.recommendations.map((rec, index) => (
                  <li key={index} className="text-sm flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                    {rec}
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-4 bg-primary/10 rounded-lg">
              <h4 className="font-medium mb-1">Next Steps</h4>
              <p className="text-sm">{triageResult.nextSteps}</p>
            </div>

            {triageResult.severity === 'emergency' && (
              <Button className="w-full" variant="destructive" size="lg">
                <AlertTriangle className="h-5 w-5 mr-2" />
                Call Emergency Services (112)
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {voiceCommands.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Recent Voice Commands</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {voiceCommands.slice(0, 3).map((cmd, index) => (
                <div key={index} className="text-xs p-2 bg-muted rounded">
                  <div className="font-medium">{cmd.command}</div>
                  <div className="text-muted-foreground">
                    {cmd.timestamp.toLocaleTimeString()} • {(cmd.confidence * 100).toFixed(0)}% confidence
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};