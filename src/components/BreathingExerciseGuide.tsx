import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Wind, 
  Play, 
  Pause, 
  RotateCcw, 
  Timer, 
  Heart,
  Zap,
  Moon,
  Sun,
  Target
} from 'lucide-react';

interface BreathingExercise {
  id: string;
  name: string;
  description: string;
  duration: number; // in minutes
  inhaleTime: number; // seconds
  holdTime: number; // seconds  
  exhaleTime: number; // seconds
  holdEmptyTime: number; // seconds
  cycles: number;
  benefits: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  icon: React.ComponentType<any>;
}

const breathingExercises: BreathingExercise[] = [
  {
    id: '478_breathing',
    name: '4-7-8 Breathing',
    description: 'Calming technique for stress relief and better sleep',
    duration: 5,
    inhaleTime: 4,
    holdTime: 7,
    exhaleTime: 8,
    holdEmptyTime: 0,
    cycles: 8,
    benefits: ['Reduces anxiety', 'Improves sleep', 'Lowers stress'],
    difficulty: 'beginner',
    icon: Moon
  },
  {
    id: 'box_breathing',
    name: 'Box Breathing',
    description: 'Equal timing technique for focus and concentration',
    duration: 10,
    inhaleTime: 4,
    holdTime: 4,
    exhaleTime: 4,
    holdEmptyTime: 4,
    cycles: 15,
    benefits: ['Improves focus', 'Reduces stress', 'Enhances performance'],
    difficulty: 'beginner',
    icon: Target
  },
  {
    id: 'energizing',
    name: 'Energizing Breath',
    description: 'Quick energizing technique to boost alertness',
    duration: 3,
    inhaleTime: 2,
    holdTime: 1,
    exhaleTime: 2,
    holdEmptyTime: 0,
    cycles: 20,
    benefits: ['Increases energy', 'Improves alertness', 'Boosts mood'],
    difficulty: 'intermediate',
    icon: Sun
  },
  {
    id: 'coherent_breathing',
    name: 'Coherent Breathing',
    description: 'Balanced breathing for heart rate variability',
    duration: 15,
    inhaleTime: 5,
    holdTime: 0,
    exhaleTime: 5,
    holdEmptyTime: 0,
    cycles: 90,
    benefits: ['Improves HRV', 'Balances nervous system', 'Enhances recovery'],
    difficulty: 'advanced',
    icon: Heart
  }
];

interface BreathingExerciseGuideProps {
  onComplete?: (exerciseId: string, duration: number) => void;
}

export const BreathingExerciseGuide: React.FC<BreathingExerciseGuideProps> = ({ onComplete }) => {
  const [selectedExercise, setSelectedExercise] = useState<BreathingExercise>(breathingExercises[0]);
  const [isActive, setIsActive] = useState(false);
  const [currentCycle, setCurrentCycle] = useState(0);
  const [currentPhase, setCurrentPhase] = useState<'inhale' | 'hold' | 'exhale' | 'holdEmpty'>('inhale');
  const [phaseTimer, setPhaseTimer] = useState(0);
  const [totalElapsed, setTotalElapsed] = useState(0);
  const [breathingRate, setBreathingRate] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isActive) {
      interval = setInterval(() => {
        setPhaseTimer(prev => prev + 1);
        setTotalElapsed(prev => prev + 1);
        
        // Calculate breathing rate (breaths per minute)
        const cyclesCompleted = currentCycle + (getPhaseProgress() / 100);
        const minutesElapsed = totalElapsed / 60;
        setBreathingRate(Math.round((cyclesCompleted / minutesElapsed) * 60) || 0);
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, currentCycle, totalElapsed]);

  useEffect(() => {
    if (isActive) {
      checkPhaseTransition();
    }
  }, [phaseTimer, isActive]);

  const checkPhaseTransition = () => {
    const { inhaleTime, holdTime, exhaleTime, holdEmptyTime } = selectedExercise;
    
    switch (currentPhase) {
      case 'inhale':
        if (phaseTimer >= inhaleTime) {
          setCurrentPhase(holdTime > 0 ? 'hold' : 'exhale');
          setPhaseTimer(0);
        }
        break;
      case 'hold':
        if (phaseTimer >= holdTime) {
          setCurrentPhase('exhale');
          setPhaseTimer(0);
        }
        break;
      case 'exhale':
        if (phaseTimer >= exhaleTime) {
          if (holdEmptyTime > 0) {
            setCurrentPhase('holdEmpty');
            setPhaseTimer(0);
          } else {
            completeCurrentCycle();
          }
        }
        break;
      case 'holdEmpty':
        if (phaseTimer >= holdEmptyTime) {
          completeCurrentCycle();
        }
        break;
    }
  };

  const completeCurrentCycle = () => {
    const newCycle = currentCycle + 1;
    
    if (newCycle >= selectedExercise.cycles) {
      completeExercise();
    } else {
      setCurrentCycle(newCycle);
      setCurrentPhase('inhale');
      setPhaseTimer(0);
    }
  };

  const completeExercise = () => {
    setIsActive(false);
    onComplete?.(selectedExercise.id, totalElapsed);
  };

  const startExercise = () => {
    setIsActive(true);
    setCurrentCycle(0);
    setCurrentPhase('inhale');
    setPhaseTimer(0);
    setTotalElapsed(0);
    setBreathingRate(0);
  };

  const pauseExercise = () => {
    setIsActive(false);
  };

  const resetExercise = () => {
    setIsActive(false);
    setCurrentCycle(0);
    setCurrentPhase('inhale');
    setPhaseTimer(0);
    setTotalElapsed(0);
    setBreathingRate(0);
  };

  const getCurrentPhaseTime = () => {
    switch (currentPhase) {
      case 'inhale': return selectedExercise.inhaleTime;
      case 'hold': return selectedExercise.holdTime;
      case 'exhale': return selectedExercise.exhaleTime;
      case 'holdEmpty': return selectedExercise.holdEmptyTime;
    }
  };

  const getPhaseProgress = () => {
    return (phaseTimer / getCurrentPhaseTime()) * 100;
  };

  const getOverallProgress = () => {
    return ((currentCycle + (getPhaseProgress() / 100)) / selectedExercise.cycles) * 100;
  };

  const getPhaseInstruction = () => {
    switch (currentPhase) {
      case 'inhale': return 'Breathe in slowly...';
      case 'hold': return 'Hold your breath...';
      case 'exhale': return 'Breathe out slowly...';
      case 'holdEmpty': return 'Hold empty...';
    }
  };

  const getPhaseColor = () => {
    switch (currentPhase) {
      case 'inhale': return 'text-blue-500 border-blue-500/20 bg-blue-500/10';
      case 'hold': return 'text-yellow-500 border-yellow-500/20 bg-yellow-500/10';
      case 'exhale': return 'text-green-500 border-green-500/20 bg-green-500/10';
      case 'holdEmpty': return 'text-purple-500 border-purple-500/20 bg-purple-500/10';
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getDifficultyColor = (difficulty: BreathingExercise['difficulty']) => {
    switch (difficulty) {
      case 'beginner': return 'border-green-500/50 text-green-500 bg-green-500/10';
      case 'intermediate': return 'border-yellow-500/50 text-yellow-500 bg-yellow-500/10';
      case 'advanced': return 'border-red-500/50 text-red-500 bg-red-500/10';
    }
  };

  return (
    <div className="space-y-6">
      {/* Exercise Selection */}
      {!isActive && (
        <Card className="p-6 border-primary/20 bg-gradient-subtle">
          <div className="space-y-4">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 rounded-full bg-primary/10">
                <Wind className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Breathing Exercises</h3>
                <p className="text-sm text-muted-foreground">
                  Guided breathing techniques for wellness and stress relief
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {breathingExercises.map((exercise) => {
                const IconComponent = exercise.icon;
                return (
                  <div
                    key={exercise.id}
                    onClick={() => setSelectedExercise(exercise)}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-300 hover:shadow-md ${
                      selectedExercise.id === exercise.id 
                        ? 'border-primary bg-primary/5' 
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="p-2 rounded-full bg-primary/10">
                        <IconComponent className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-sm">{exercise.name}</h4>
                          <Badge className={`text-xs ${getDifficultyColor(exercise.difficulty)}`}>
                            {exercise.difficulty}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {exercise.description}
                        </p>
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                          <span className="flex items-center space-x-1">
                            <Timer className="w-3 h-3" />
                            <span>{exercise.duration}m</span>
                          </span>
                          <span>{exercise.cycles} cycles</span>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {exercise.benefits.slice(0, 2).map((benefit, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs px-2 py-0.5">
                              {benefit}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>
      )}

      {/* Active Exercise Interface */}
      {isActive && (
        <div className="space-y-6">
          {/* Exercise Header */}
          <Card className="p-6 border-primary/20 bg-gradient-subtle">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <selectedExercise.icon className="w-6 h-6 text-primary" />
                <div>
                  <h3 className="text-lg font-semibold">{selectedExercise.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    Cycle {currentCycle + 1} of {selectedExercise.cycles}
                  </p>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-2xl font-mono font-bold text-primary">
                  {formatTime(totalElapsed)}
                </div>
                <div className="text-xs text-muted-foreground">
                  {breathingRate} BPM
                </div>
              </div>
            </div>

            <Progress value={getOverallProgress()} className="h-2" />
          </Card>

          {/* Breathing Circle */}
          <Card className={`p-8 border-2 transition-all duration-1000 ${getPhaseColor()}`}>
            <div className="text-center space-y-6">
              <div className="relative mx-auto w-40 h-40">
                {/* Breathing Circle */}
                <div 
                  className={`absolute inset-0 rounded-full border-4 transition-all duration-1000 ${
                    currentPhase === 'inhale' ? 'scale-110' : 
                    currentPhase === 'exhale' ? 'scale-90' : 'scale-100'
                  } ${
                    currentPhase === 'inhale' ? 'border-blue-500' :
                    currentPhase === 'hold' ? 'border-yellow-500' :
                    currentPhase === 'exhale' ? 'border-green-500' :
                    'border-purple-500'
                  }`}
                  style={{
                    background: `conic-gradient(from 0deg, transparent ${100 - getPhaseProgress()}%, currentColor 0%)`
                  }}
                />
                
                {/* Center Content */}
                <div className="absolute inset-4 rounded-full bg-background/50 backdrop-blur-sm flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-3xl font-bold">
                      {getCurrentPhaseTime() - phaseTimer}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      seconds
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-xl font-bold capitalize">
                  {getPhaseInstruction()}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {currentPhase === 'inhale' && 'Expand your lungs slowly and deeply'}
                  {currentPhase === 'hold' && 'Keep the breath steady and calm'}
                  {currentPhase === 'exhale' && 'Release the air slowly and completely'}
                  {currentPhase === 'holdEmpty' && 'Rest before the next breath'}
                </p>
              </div>

              {/* Breathing Pattern */}
              <div className="flex justify-center space-x-4 text-sm">
                <div className={`px-3 py-1 rounded ${currentPhase === 'inhale' ? 'bg-blue-500/20 text-blue-600' : 'text-muted-foreground'}`}>
                  In: {selectedExercise.inhaleTime}s
                </div>
                {selectedExercise.holdTime > 0 && (
                  <div className={`px-3 py-1 rounded ${currentPhase === 'hold' ? 'bg-yellow-500/20 text-yellow-600' : 'text-muted-foreground'}`}>
                    Hold: {selectedExercise.holdTime}s
                  </div>
                )}
                <div className={`px-3 py-1 rounded ${currentPhase === 'exhale' ? 'bg-green-500/20 text-green-600' : 'text-muted-foreground'}`}>
                  Out: {selectedExercise.exhaleTime}s
                </div>
                {selectedExercise.holdEmptyTime > 0 && (
                  <div className={`px-3 py-1 rounded ${currentPhase === 'holdEmpty' ? 'bg-purple-500/20 text-purple-600' : 'text-muted-foreground'}`}>
                    Hold: {selectedExercise.holdEmptyTime}s
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Controls */}
      <Card className="p-4 border-border/50 bg-card/50">
        <div className="flex justify-center space-x-3">
          {!isActive && (
            <Button onClick={startExercise} size="lg" className="flex items-center space-x-2">
              <Play className="w-4 h-4" />
              <span>Start Exercise</span>
            </Button>
          )}
          
          {isActive && (
            <>
              <Button variant="outline" onClick={pauseExercise} size="lg">
                <Pause className="w-4 h-4 mr-2" />
                Pause
              </Button>
              <Button variant="outline" onClick={resetExercise} size="lg">
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>
            </>
          )}
        </div>
      </Card>

      {/* Exercise Benefits */}
      {!isActive && (
        <Card className="p-4 border-border/50 bg-card/50">
          <div className="space-y-3">
            <h4 className="font-medium text-sm flex items-center space-x-2">
              <Zap className="w-4 h-4 text-primary" />
              <span>{selectedExercise.name} Benefits</span>
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {selectedExercise.benefits.map((benefit, index) => (
                <div key={index} className="flex items-center space-x-2 text-xs">
                  <div className="w-2 h-2 bg-primary rounded-full" />
                  <span>{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};