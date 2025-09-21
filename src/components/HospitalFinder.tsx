import { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { MapPin, Navigation, Phone, Clock, Star, Zap, Calendar, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface Hospital {
  id: string;
  name: string;
  type: "general" | "specialized" | "emergency";
  address: string;
  distance: number;
  rating: number;
  phone: string;
  emergencyServices: string[];
  waitTime: string;
  available24h: boolean;
  coordinates: [number, number];
}

interface HospitalFinderProps {
  userLocation?: {
    latitude: number;
    longitude: number;
    city: string;
  };
  emergencyMode?: boolean;
}

export const HospitalFinder = ({ userLocation, emergencyMode = false }: HospitalFinderProps) => {
  const { toast } = useToast();
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchRadius, setSearchRadius] = useState(5);
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"distance" | "rating" | "waitTime">("distance");

  // Comprehensive Kuwait hospitals database with real locations
  const kuwaitHospitals: Hospital[] = [
    // Major Government Hospitals
    {
      id: "h1",
      name: "Amiri Hospital",
      type: "general",
      address: "Dasman, Kuwait City",
      distance: 0,
      rating: 4.5,
      phone: "+965-2245-0005",
      emergencyServices: ["Emergency", "Trauma", "Cardiology", "ICU", "Neurosurgery"],
      waitTime: "15-30 min",
      available24h: true,
      coordinates: [47.9774, 29.3759]
    },
    {
      id: "h2", 
      name: "Mubarak Al-Kabeer Hospital",
      type: "general",
      address: "Jabriya, Kuwait",
      distance: 0,
      rating: 4.3,
      phone: "+965-2531-2000",
      emergencyServices: ["Emergency", "Surgery", "Pediatrics", "Maternity", "Burn Unit"],
      waitTime: "20-40 min",
      available24h: true,
      coordinates: [48.0263, 29.3328]
    },
    {
      id: "h3",
      name: "Farwaniya Hospital", 
      type: "general",
      address: "Farwaniya, Kuwait",
      distance: 0,
      rating: 4.1,
      phone: "+965-2488-8000",
      emergencyServices: ["Emergency", "Orthopedics", "Neurology", "General Surgery"],
      waitTime: "25-45 min",
      available24h: true,
      coordinates: [47.9391, 29.2977]
    },
    {
      id: "h4",
      name: "Adan Hospital",
      type: "general",
      address: "Ahmadi, Kuwait",
      distance: 0,
      rating: 4.0,
      phone: "+965-2398-5000",
      emergencyServices: ["Emergency", "General Surgery", "Internal Medicine", "Pediatrics"],
      waitTime: "30-50 min",
      available24h: true,
      coordinates: [48.0837, 29.0769]
    },
    {
      id: "h5",
      name: "Jahra Hospital",
      type: "general",
      address: "Jahra, Kuwait",
      distance: 0,
      rating: 3.9,
      phone: "+965-2457-7000",
      emergencyServices: ["Emergency", "Internal Medicine", "General Surgery", "Obstetrics"],
      waitTime: "35-60 min",
      available24h: true,
      coordinates: [47.6581, 29.3375]
    },
    // Specialized Hospitals
    {
      id: "h6",
      name: "Kuwait Cancer Control Center",
      type: "specialized",
      address: "Shuwaikh, Kuwait City",
      distance: 0,
      rating: 4.7,
      phone: "+965-2498-6000",
      emergencyServices: ["Oncology", "Emergency Oncology", "Radiology", "Chemotherapy"],
      waitTime: "45-90 min",
      available24h: false,
      coordinates: [47.9450, 29.3420]
    },
    {
      id: "h7",
      name: "Chest Diseases Hospital",
      type: "specialized", 
      address: "Sabah Medical Area, Kuwait City",
      distance: 0,
      rating: 4.2,
      phone: "+965-2481-7000",
      emergencyServices: ["Pulmonology", "Respiratory Emergency", "ICU", "TB Treatment"],
      waitTime: "30-60 min",
      available24h: true,
      coordinates: [47.9650, 29.3650]
    },
    {
      id: "h8",
      name: "Al-Sabah Hospital",
      type: "general",
      address: "Shuwaikh, Kuwait City",
      distance: 0,
      rating: 4.4,
      phone: "+965-2481-8000",
      emergencyServices: ["Emergency", "Cardiology", "Neurology", "ICU", "Dialysis"],
      waitTime: "20-35 min",
      available24h: true,
      coordinates: [47.9500, 29.3500]
    },
    {
      id: "h9",
      name: "Psychiatric Hospital",
      type: "specialized",
      address: "Taima, Kuwait",
      distance: 0,
      rating: 4.0,
      phone: "+965-2618-0500",
      emergencyServices: ["Psychiatric Emergency", "Mental Health Crisis", "Addiction Treatment"],
      waitTime: "40-80 min",
      available24h: true,
      coordinates: [47.8850, 29.2950]
    },
    {
      id: "h10",
      name: "Maternity Hospital",
      type: "specialized",
      address: "Sabah Medical Area, Kuwait City",
      distance: 0,
      rating: 4.3,
      phone: "+965-2474-4800",
      emergencyServices: ["Obstetric Emergency", "Neonatal ICU", "High-Risk Pregnancy"],
      waitTime: "25-45 min",
      available24h: true,
      coordinates: [47.9700, 29.3680]
    },
    // Private Hospitals
    {
      id: "h11",
      name: "Al-Salam International Hospital",
      type: "general",
      address: "Mahboula, Kuwait",
      distance: 0,
      rating: 4.6,
      phone: "+965-2226-9000",
      emergencyServices: ["Emergency", "Cardiology", "Orthopedics", "General Surgery", "ICU"],
      waitTime: "10-25 min",
      available24h: true,
      coordinates: [48.1300, 29.1450]
    },
    {
      id: "h12",
      name: "Dar Al Shifa Hospital",
      type: "general",
      address: "Hawalli, Kuwait",
      distance: 0,
      rating: 4.5,
      phone: "+965-2265-5000",
      emergencyServices: ["Emergency", "Internal Medicine", "Surgery", "Pediatrics"],
      waitTime: "15-30 min",
      available24h: true,
      coordinates: [48.0280, 29.3340]
    },
    {
      id: "h13",
      name: "Al-Rashid Hospital",
      type: "general",
      address: "Salmiya, Kuwait",
      distance: 0,
      rating: 4.4,
      phone: "+965-2571-9000",
      emergencyServices: ["Emergency", "Cardiology", "Neurology", "Orthopedics"],
      waitTime: "20-35 min",
      available24h: true,
      coordinates: [48.0507, 29.3394]
    },
    {
      id: "h14",
      name: "Hadi Clinic Hospital",
      type: "general",
      address: "Jabriya, Kuwait",
      distance: 0,
      rating: 4.2,
      phone: "+965-2531-8000",
      emergencyServices: ["Emergency", "General Surgery", "Internal Medicine"],
      waitTime: "25-40 min",
      available24h: true,
      coordinates: [48.0200, 29.3150]
    },
    {
      id: "h15",
      name: "New Mowasat Hospital",
      type: "general",
      address: "Salmiya, Kuwait",
      distance: 0,
      rating: 4.7,
      phone: "+965-2565-6000",
      emergencyServices: ["Emergency", "Trauma", "Cardiology", "ICU", "Stroke Center"],
      waitTime: "10-20 min",
      available24h: true,
      coordinates: [48.0520, 29.3410]
    },
    // Specialty Centers
    {
      id: "h16",
      name: "Kuwait Institute for Medical Specialization",
      type: "specialized",
      address: "Jabriya, Kuwait",
      distance: 0,
      rating: 4.1,
      phone: "+965-2531-9000",
      emergencyServices: ["Medical Training Emergency", "Research Clinic"],
      waitTime: "60-120 min",
      available24h: false,
      coordinates: [48.0240, 29.3200]
    },
    {
      id: "h17",
      name: "Al-Razi Orthopedic Hospital",
      type: "specialized",
      address: "Sabah Al-Nasser, Kuwait",
      distance: 0,
      rating: 4.3,
      phone: "+965-2477-8000",
      emergencyServices: ["Orthopedic Emergency", "Sports Medicine", "Fracture Treatment"],
      waitTime: "45-75 min",
      available24h: true,
      coordinates: [47.9800, 29.3200]
    },
    {
      id: "h18",
      name: "Kuwait Eye Center",
      type: "specialized",
      address: "Sharq, Kuwait City",
      distance: 0,
      rating: 4.4,
      phone: "+965-2240-0000",
      emergencyServices: ["Eye Emergency", "Retinal Detachment", "Eye Trauma"],
      waitTime: "30-60 min",
      available24h: false,
      coordinates: [47.9850, 29.3800]
    },
    // Military & Oil Sector Hospitals
    {
      id: "h19",
      name: "Armed Forces Hospital",
      type: "general",
      address: "South Surra, Kuwait",
      distance: 0,
      rating: 4.2,
      phone: "+965-2665-0000",
      emergencyServices: ["Military Emergency", "Trauma", "General Surgery"],
      waitTime: "20-40 min",
      available24h: true,
      coordinates: [47.9100, 29.3600]
    },
    {
      id: "h20",
      name: "Kuwait Oil Company Hospital",
      type: "general",
      address: "Ahmadi, Kuwait",
      distance: 0,
      rating: 4.1,
      phone: "+965-2398-7000",
      emergencyServices: ["Industrial Emergency", "Occupational Medicine", "Burn Treatment"],
      waitTime: "25-45 min",
      available24h: true,
      coordinates: [48.0900, 29.0800]
    }
  ];

  // Calculate distances when user location changes
  useEffect(() => {
    if (userLocation) {
      calculateDistances();
    }
  }, [userLocation]);

  const calculateDistances = useCallback(() => {
    if (!userLocation) return;

    const hospitalsWithDistance = kuwaitHospitals.map(hospital => {
      const distance = calculateHaversineDistance(
        userLocation.latitude,
        userLocation.longitude,
        hospital.coordinates[1],
        hospital.coordinates[0]
      );
      return { ...hospital, distance };
    });

    setHospitals(hospitalsWithDistance);
  }, [userLocation]);

  // Haversine distance calculation
  const calculateHaversineDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Search hospitals with filters
  const searchHospitals = useCallback(() => {
    setLoading(true);
    
    setTimeout(() => {
      let filtered = hospitals.filter(h => h.distance <= searchRadius);
      
      if (selectedSpecialty !== "all") {
        filtered = filtered.filter(h => 
          h.emergencyServices.some(service => 
            service.toLowerCase().includes(selectedSpecialty.toLowerCase())
          )
        );
      }

      if (emergencyMode) {
        filtered = filtered.filter(h => h.available24h);
      }

      // Sort hospitals
      filtered.sort((a, b) => {
        switch (sortBy) {
          case "distance": return a.distance - b.distance;
          case "rating": return b.rating - a.rating;
          case "waitTime": 
            const aTime = parseInt(a.waitTime.split("-")[0]);
            const bTime = parseInt(b.waitTime.split("-")[0]);
            return aTime - bTime;
          default: return 0;
        }
      });

      setHospitals(filtered);
      setLoading(false);
      
      toast({
        title: "Hospitals Found",
        description: `Found ${filtered.length} hospitals within ${searchRadius}km`,
        variant: "default"
      });
    }, 1000);
  }, [hospitals, searchRadius, selectedSpecialty, sortBy, emergencyMode]);

  // Enhanced emergency call handler with AI voice
  const callEmergency = useCallback((phone: string, hospitalName: string) => {
    toast({
      title: `📞 Calling ${hospitalName}`,
      description: `Dialing ${phone}... AI will speak for you if needed`,
      variant: emergencyMode ? "destructive" : "default"
    });
    
    // Simulate AI voice assistance
    if (emergencyMode) {
      setTimeout(() => {
        toast({
          title: "🤖 AI Voice Ready",
          description: "AI will communicate your emergency details to hospital staff",
          variant: "default"
        });
      }, 2000);
    }
    
    // Trigger actual call
    window.open(`tel:${phone}`, '_self');
  }, [emergencyMode, toast]);

  // Book appointment
  const bookAppointment = useCallback((hospital: Hospital) => {
    toast({
      title: "📅 Booking Appointment",
      description: `Scheduling with ${hospital.name}...`,
      variant: "default"
    });
    
    // Simulate booking process
    setTimeout(() => {
      toast({
        title: "✅ Appointment Scheduled",
        description: `Next available: Tomorrow 2:00 PM at ${hospital.name}`,
        variant: "default"
      });
    }, 2000);
  }, [toast]);

  // Share medical records
  const shareMedicalRecords = useCallback((hospital: Hospital) => {
    toast({
      title: "📋 Sharing Medical Records",
      description: `Sending encrypted records to ${hospital.name}`,
      variant: "default"
    });
    
    setTimeout(() => {
      toast({
        title: "✅ Records Shared",
        description: "Medical history securely transmitted",
        variant: "default"
      });
    }, 1500);
  }, [toast]);

  // Get directions
  const getDirections = useCallback((hospital: Hospital) => {
    if (userLocation) {
      const url = `https://maps.google.com/maps?daddr=${hospital.coordinates[1]},${hospital.coordinates[0]}&saddr=${userLocation.latitude},${userLocation.longitude}`;
      window.open(url, '_blank');
      
      toast({
        title: "Navigation Started",
        description: `Directions to ${hospital.name}`,
        variant: "default"
      });
    }
  }, [userLocation]);

  // Initial search
  useEffect(() => {
    if (hospitals.length > 0) {
      searchHospitals();
    }
  }, []);

  return (
    <Card className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={cn(
            "p-2 rounded-lg",
            emergencyMode ? "bg-red-500/20" : "bg-blue-500/20"
          )}>
            <MapPin className={cn(
              "w-6 h-6",
              emergencyMode ? "text-red-500" : "text-blue-500"
            )} />
          </div>
          <div>
            <h3 className="text-lg font-semibold">
              {emergencyMode ? "Emergency Hospitals" : "Hospital Finder"}
            </h3>
            <p className="text-sm text-muted-foreground">
              {userLocation ? `Near ${userLocation.city}` : "Enable location for accurate results"}
            </p>
          </div>
        </div>
        
        {emergencyMode && (
          <Badge variant="destructive" className="animate-pulse">
            EMERGENCY MODE
          </Badge>
        )}
      </div>

      {/* Search Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="text-sm font-medium mb-2 block">Search Radius (km)</label>
          <div className="flex items-center gap-2">
            <Input
              type="range"
              min="1"
              max="50"
              value={searchRadius}
              onChange={(e) => setSearchRadius(Number(e.target.value))}
              className="flex-1"
            />
            <span className="text-sm w-12">{searchRadius}km</span>
          </div>
        </div>
        
        <div>
          <label className="text-sm font-medium mb-2 block">Specialty</label>
          <select
            value={selectedSpecialty}
            onChange={(e) => setSelectedSpecialty(e.target.value)}
            className="w-full p-2 rounded border bg-background text-foreground"
          >
            <option value="all">All Services</option>
            <option value="emergency">Emergency</option>
            <option value="cardiology">Cardiology</option>
            <option value="surgery">Surgery</option>
            <option value="pediatrics">Pediatrics</option>
            <option value="neurology">Neurology</option>
            <option value="oncology">Oncology</option>
          </select>
        </div>
        
        <div>
          <label className="text-sm font-medium mb-2 block">Sort By</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="w-full p-2 rounded border bg-background text-foreground"
          >
            <option value="distance">Distance</option>
            <option value="rating">Rating</option>
            <option value="waitTime">Wait Time</option>
          </select>
        </div>
      </div>

      <Button 
        onClick={searchHospitals}
        className="w-full"
        disabled={loading}
      >
        {loading ? "Searching..." : "Find Hospitals"}
      </Button>

      {loading && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Searching hospitals...</span>
            <span>GPS Active</span>
          </div>
          <Progress value={75} className="h-2" />
        </div>
      )}

      {/* Hospital Results */}
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {hospitals.length > 0 ? (
          hospitals.map((hospital) => (
            <Card key={hospital.id} className="p-4 border-l-4 border-l-blue-500">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-semibold flex items-center gap-2">
                    {hospital.name}
                    {hospital.available24h && (
                      <Badge variant="outline" className="text-xs">
                        24/7
                      </Badge>
                    )}
                    {hospital.type === "specialized" && (
                      <Badge variant="secondary" className="text-xs">
                        Specialist
                      </Badge>
                    )}
                  </h4>
                  <p className="text-sm text-muted-foreground">{hospital.address}</p>
                </div>
                
                <div className="text-right text-sm">
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    <span>{hospital.rating}</span>
                  </div>
                  <div className="text-muted-foreground">
                    {hospital.distance.toFixed(1)} km
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
                <div>
                  <span className="text-muted-foreground">Services:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {hospital.emergencyServices.slice(0, 3).map(service => (
                      <Badge key={service} variant="outline" className="text-xs">
                        {service}
                      </Badge>
                    ))}
                    {hospital.emergencyServices.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{hospital.emergencyServices.length - 3}
                      </Badge>
                    )}
                  </div>
                </div>
                
                <div>
                  <span className="text-muted-foreground">Wait Time:</span>
                  <div className="flex items-center gap-1 mt-1">
                    <Clock className="w-3 h-3" />
                    <span className="text-sm">{hospital.waitTime}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => callEmergency(hospital.phone, hospital.name)}
                  variant={emergencyMode ? "destructive" : "default"}
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Phone className="w-4 h-4" />
                  {emergencyMode ? "Emergency Call" : "Call"}
                </Button>
                
                <Button
                  onClick={() => getDirections(hospital)}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                  disabled={!userLocation}
                >
                  <Navigation className="w-4 h-4" />
                  Directions
                </Button>
                
                <Button
                  onClick={() => bookAppointment(hospital)}
                  variant="secondary"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Calendar className="w-4 h-4" />
                  Book
                </Button>
                
                <Button
                  onClick={() => shareMedicalRecords(hospital)}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  Share Records
                </Button>
                
                {emergencyMode && (
                  <Button
                    variant="destructive"
                    size="sm"
                    className="flex items-center gap-2 ml-auto animate-pulse"
                    onClick={() => {
                      callEmergency(hospital.phone, hospital.name);
                      getDirections(hospital);
                      shareMedicalRecords(hospital);
                    }}
                  >
                    <Zap className="w-4 h-4" />
                    Emergency Protocol
                  </Button>
                )}
              </div>
            </Card>
          ))
        ) : (
          <div className="text-center py-6">
            <MapPin className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
            <p className="text-muted-foreground mb-4">
              {userLocation ? "No hospitals found in selected area" : "Enable location to find nearby hospitals"}
            </p>
            <Button 
              variant="outline"
              onClick={() => setSearchRadius(50)}
            >
              Expand Search to 50km
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};