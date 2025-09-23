import { AegisWatch3D } from "@/components/AegisWatch3D";
import { UltraAdvancedTriage } from "@/components/UltraAdvancedTriage";
import { FinalNeuroAI } from "@/components/FinalNeuroAI";
import { FinalProductionPPG } from "@/components/FinalProductionPPG";
import { ProductionDisasterAI } from "@/components/ProductionDisasterAI";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, Brain, Heart, Stethoscope, Zap } from "lucide-react";
import { useEffect, useState } from "react";

const Index = () => {
  const mockVitals = {
    heartRate: 72,
    spO2: 98,
    temperature: 36.8,
    motionStatus: "Active"
  };

  // Geolocation for components needing current location
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number; city: string }>({ lat: 29.3759, lng: 47.9774, city: "Kuwait City" });
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setCurrentLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude, city: "Kuwait City" }),
        () => {}
      );
    }
  }, []);

  // Handlers for required callbacks
  const handleTriageEmergencyDetected = (payload: any) => console.log("Emergency detected", payload);
  const handleTriageGuidanceGenerated = (guidance: string[]) => console.log("Guidance", guidance);
  const handleTriageLocationNeeded = () => console.log("Location requested");
  const handleNeuroComplete = (result: any) => console.log("Neural AI result", result);
  const handlePPGComplete = (result: any) => console.log("PPG result", result);
  const handleDisasterDetected = (data: any) => console.log("Disaster detected", data);

  return (
    <div className="min-h-screen bg-background font-poppins">
      {/* Header */}
      <div className="p-6 border-b border-border bg-gradient-to-r from-cyber-blue/10 to-cyber-purple/10">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyber-blue to-cyber-purple bg-clip-text text-transparent mb-2">
            LifeLine AI: AEGIS System
          </h1>
          <p className="text-muted-foreground mb-4">
            Advanced Emergency Intelligence & Guardian System - Production Demo
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-8 rounded-xl shadow-lg transform transition hover:scale-105">
              Get Started
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => window.location.href = '/medconnect'}
              className="border-2 border-green-500 text-green-600 hover:bg-green-50 font-semibold py-3 px-8 rounded-xl shadow-lg transform transition hover:scale-105"
            >
              🚀 MedConnect (2-min setup)
            </Button>
          </div>

          {/* MedConnect Quick Access Banner */}
          <Card className="max-w-4xl mx-auto mt-6 bg-gradient-to-r from-blue-50 to-green-50 border-blue-200">
            <div className="p-6 text-center">
              <div className="flex justify-center mb-4">
                <div className="bg-gradient-to-r from-blue-500 to-green-500 p-3 rounded-full">
                  <Heart className="h-8 w-8 text-white" />
                </div>
              </div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent mb-3">
                🏥 Professional Healthcare in 2 Minutes
              </h2>
              <p className="text-gray-700 mb-4">
                Get instant access to video consultations with doctors, medical ID cards, and emergency features. 
                No email required - just your phone number and accept terms!
              </p>
              <div className="flex flex-wrap justify-center gap-2 mb-4">
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">✅ Video Consultations</span>
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">✅ Medical ID Cards</span>
                <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm">✅ Emergency SOS</span>
                <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">✅ HIPAA Compliant</span>
              </div>
              <Button 
                onClick={() => window.location.href = '/medconnect'}
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white font-bold px-8 py-3"
              >
                🚀 Start MedConnect Now →
              </Button>
              <p className="text-xs text-gray-500 mt-2">No email • Just phone & terms • Instant access</p>
            </div>
          </Card>
        </div>
      </div>

      {/* Main Interface */}
      <div className="max-w-7xl mx-auto p-6">
        <Tabs defaultValue="watch" className="w-full">
          <TabsList className="grid w-full grid-cols-5 bg-card">
            <TabsTrigger value="watch" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              AEGIS Watch
            </TabsTrigger>
            <TabsTrigger value="triage" className="flex items-center gap-2">
              <Stethoscope className="h-4 w-4" />
              AI Triage
            </TabsTrigger>
            <TabsTrigger value="neural" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              Neural AI
            </TabsTrigger>
            <TabsTrigger value="ppg" className="flex items-center gap-2">
              <Heart className="h-4 w-4" />
              PPG Scanner
            </TabsTrigger>
            <TabsTrigger value="disaster" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Disaster AI
            </TabsTrigger>
          </TabsList>

          <TabsContent value="watch" className="mt-6">
            <AegisWatch3D
              vitals={mockVitals}
              riskScore={2}
              isEmergencyActive={false}
              onFeatureToggle={(feature, enabled) => console.log(feature, enabled)}
            />
          </TabsContent>

          <TabsContent value="triage" className="mt-6">
            <UltraAdvancedTriage 
              onEmergencyDetected={handleTriageEmergencyDetected}
              onGuidanceGenerated={handleTriageGuidanceGenerated}
              onLocationNeeded={handleTriageLocationNeeded}
            />
          </TabsContent>

          <TabsContent value="neural" className="mt-6">
            <FinalNeuroAI onAnalysisComplete={handleNeuroComplete} />
          </TabsContent>

          <TabsContent value="ppg" className="mt-6">
            <FinalProductionPPG onReadingComplete={handlePPGComplete} />
          </TabsContent>

          <TabsContent value="disaster" className="mt-6">
            <ProductionDisasterAI onDisasterDetected={handleDisasterDetected} currentLocation={currentLocation} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;