import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  FileText, 
  QrCode, 
  Download, 
  Share, 
  Clock, 
  MapPin, 
  Heart,
  User,
  Phone,
  AlertTriangle,
  Camera,
  Languages,
  Printer,
  ExternalLink
} from "lucide-react";
import { cn } from "@/lib/utils";
import QRCode from "react-qr-code";

interface TimelineEvent {
  time: string;
  event: string;
  severity: "info" | "warning" | "critical";
  icon?: string;
  details?: string;
}

interface IncidentData {
  id: string;
  type: string;
  timestamp: Date;
  location: {
    coordinates: [number, number];
    address: string;
    city: string;
  };
  vitals: {
    heartRate: number[];
    spO2: number[];
    temperature: number[];
    timestamps: string[];
  };
  timeline: TimelineEvent[];
  mediaCapture?: {
    hasAudio: boolean;
    hasVideo: boolean;
    duration: number;
    thumbnail?: string;
  };
  riskScore: number;
  status: "active" | "resolved" | "cancelled";
  notes: string;
  userProfile: {
    name: string;
    age: string;
    bloodType: string;
    medicalNotes: string;
    emergencyContacts: Array<{
      name: string;
      phone: string;
      relationship: string;
    }>;
  };
}

interface EnhancedIncidentPackProps {
  incident: IncidentData;
  isOpen: boolean;
  onClose: () => void;
  onShare: (packId: string) => void;
}

export const EnhancedIncidentPack = ({ 
  incident, 
  isOpen, 
  onClose, 
  onShare 
}: EnhancedIncidentPackProps) => {
  const [language, setLanguage] = useState<"en" | "ar">("en");
  const [qrUrl, setQrUrl] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  // Generate shareable URL for incident pack
  useEffect(() => {
    if (incident) {
      // In a real app, this would be a proper backend URL
      const baseUrl = window.location.origin;
      const incidentUrl = `${baseUrl}/incident/${incident.id}?lang=${language}`;
      setQrUrl(incidentUrl);
    }
  }, [incident, language]);

  // Auto-generate timeline with realistic events
  useEffect(() => {
    if (incident && incident.timeline.length < 5) {
      const enhancedTimeline: TimelineEvent[] = [
        {
          time: incident.timestamp.toLocaleTimeString(),
          event: language === "ar" ? "تم اكتشاف حالة الطوارئ" : "Emergency detected",
          severity: "critical",
          icon: "🚨",
          details: language === "ar" ? `نوع الحادث: ${incident.type}` : `Incident type: ${incident.type}`
        },
        {
          time: new Date(incident.timestamp.getTime() + 1000).toLocaleTimeString(),
          event: language === "ar" ? "معدل ضربات القلب غير طبيعي" : "Heart rate abnormal",
          severity: "warning",
          icon: "💓",
          details: `${incident.vitals.heartRate[0] || 0} BPM`
        },
        {
          time: new Date(incident.timestamp.getTime() + 2000).toLocaleTimeString(),
          event: language === "ar" ? "تم إرسال SOS إلى جهات الاتصال" : "SOS sent to trusted contacts",
          severity: "info",
          icon: "📱",
          details: `${incident.userProfile.emergencyContacts.length} contacts notified`
        },
        {
          time: new Date(incident.timestamp.getTime() + 15000).toLocaleTimeString(),
          event: language === "ar" ? "تم تفعيل وضع الطيار الآلي للحارس" : "Guardian Autopilot activated",
          severity: "info",
          icon: "🤖",
          details: language === "ar" ? "نظام الذكي الاصطناعي يراقب الوضع" : "AI system monitoring situation"
        },
        {
          time: new Date(incident.timestamp.getTime() + 30000).toLocaleTimeString(),
          event: language === "ar" ? "تم إنشاء حزمة الحادث" : "Incident pack generated",
          severity: "info",
          icon: "📋",
          details: language === "ar" ? "QR رمز جاهز للمشاركة" : "QR code ready for sharing"
        }
      ];
      
      // Update incident timeline (in real app, this would be done in state management)
      incident.timeline = enhancedTimeline;
    }
  }, [incident, language]);

  const generatePrintableCard = () => {
    setIsGenerating(true);
    
    // Simulate PDF generation
    setTimeout(() => {
      const printContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>LifeLine AI - Emergency Card</title>
          <meta charset="utf-8">
          <style>
            @page { size: A6; margin: 0.5cm; }
            body { font-family: 'Arial', sans-serif; margin: 0; padding: 10px; }
            .card { border: 2px solid #e11d48; border-radius: 8px; padding: 15px; height: 100%; }
            .header { text-align: center; color: #e11d48; margin-bottom: 15px; }
            .qr-section { text-align: center; margin: 15px 0; }
            .contact-info { font-size: 12px; line-height: 1.4; }
            .emergency-numbers { background: #fef2f2; padding: 8px; border-radius: 4px; margin-top: 10px; }
            .arabic { direction: rtl; text-align: right; }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="header">
              <h2>🫀 LifeLine AI</h2>
              <p>${language === "ar" ? "بطاقة الطوارئ الشخصية" : "Personal Emergency Card"}</p>
            </div>
            
            <div class="qr-section">
              <div style="display: inline-block; padding: 10px; background: white; border: 1px solid #ddd;">
                ${qrUrl ? `QR Code: ${qrUrl}` : "QR Code Here"}
              </div>
            </div>
            
            <div class="contact-info ${language === "ar" ? "arabic" : ""}">
              <p><strong>${language === "ar" ? "الاسم:" : "Name:"}</strong> ${incident.userProfile.name}</p>
              <p><strong>${language === "ar" ? "العمر:" : "Age:"}</strong> ${incident.userProfile.age}</p>
              <p><strong>${language === "ar" ? "فصيلة الدم:" : "Blood Type:"}</strong> ${incident.userProfile.bloodType}</p>
              
              ${incident.userProfile.medicalNotes ? 
                `<p><strong>${language === "ar" ? "ملاحظات طبية:" : "Medical Notes:"}</strong> ${incident.userProfile.medicalNotes}</p>` 
                : ""}
            </div>
            
            <div class="emergency-numbers">
              <h4>${language === "ar" ? "أرقام الطوارئ - الكويت" : "Kuwait Emergency Numbers"}</h4>
              <p>🚑 ${language === "ar" ? "الإسعاف:" : "Ambulance:"} 777</p>
              <p>🚔 ${language === "ar" ? "الشرطة:" : "Police:"} 112</p>
              <p>🚒 ${language === "ar" ? "الإطفاء:" : "Fire:"} 777</p>
            </div>
          </div>
        </body>
        </html>
      `;
      
      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write(printContent);
        printWindow.document.close();
        printWindow.print();
      }
      
      setIsGenerating(false);
    }, 1000);
  };

  const shareIncidentPack = () => {
    if (navigator.share) {
      navigator.share({
        title: "LifeLine AI - Emergency Incident",
        text: `Emergency incident ${incident.id} - ${incident.type}`,
        url: qrUrl
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(qrUrl);
    }
    onShare(incident.id);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical": return "text-cyber-red";
      case "warning": return "text-cyber-orange";
      case "info": return "text-cyber-blue";
      default: return "text-muted-foreground";
    }
  };

  const getSeverityBg = (severity: string) => {
    switch (severity) {
      case "critical": return "bg-cyber-red/10 border-cyber-red/30";
      case "warning": return "bg-cyber-orange/10 border-cyber-orange/30";
      case "info": return "bg-cyber-blue/10 border-cyber-blue/30";
      default: return "bg-muted/10 border-muted/30";
    }
  };

  if (!isOpen || !incident) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-[var(--gradient-card)] border-2 border-cyber-blue/40">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <FileText className="h-6 w-6 text-cyber-blue" />
              <div>
                <h2 className="text-2xl font-bold text-foreground">
                  {language === "ar" ? "حزمة الحادث" : "Emergency Incident Pack"}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {language === "ar" ? `رقم الحادث: ${incident.id}` : `Incident ID: ${incident.id}`}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Language Toggle */}
              <Button
                onClick={() => setLanguage(lang => lang === "en" ? "ar" : "en")}
                variant="outline"
                size="sm"
              >
                <Languages className="h-4 w-4 mr-2" />
                {language === "ar" ? "EN" : "عربي"}
              </Button>
              
              <Button onClick={onClose} variant="outline" size="sm">
                ✕
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Incident Overview */}
              <Card className="p-4 bg-muted/20">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-cyber-red" />
                  {language === "ar" ? "نظرة عامة على الحادث" : "Incident Overview"}
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">
                      {language === "ar" ? "النوع:" : "Type:"}
                    </span>
                    <div className="font-medium capitalize">{incident.type.replace('_', ' ')}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">
                      {language === "ar" ? "الوقت:" : "Time:"}
                    </span>
                    <div className="font-medium">{incident.timestamp.toLocaleString()}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">
                      {language === "ar" ? "الموقع:" : "Location:"}
                    </span>
                    <div className="font-medium flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {incident.location.city}
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">
                      {language === "ar" ? "مستوى المخاطر:" : "Risk Score:"}
                    </span>
                    <div className={cn("font-medium", incident.riskScore > 7 ? "text-cyber-red" : "text-cyber-orange")}>
                      {incident.riskScore.toFixed(1)}/10
                    </div>
                  </div>
                </div>
              </Card>

              {/* Timeline */}
              <Card className="p-4 bg-muted/20">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-cyber-blue" />
                  {language === "ar" ? "الجدول الزمني للأحداث" : "Event Timeline"}
                </h3>
                <div className="space-y-3">
                  {incident.timeline.map((event, i) => (
                    <div key={i} className={cn("p-3 rounded-lg border", getSeverityBg(event.severity))}>
                      <div className="flex items-start gap-3">
                        <div className="text-lg">{event.icon}</div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <div className={cn("font-medium", getSeverityColor(event.severity))}>
                              {event.event}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {event.time}
                            </div>
                          </div>
                          {event.details && (
                            <div className="text-sm text-muted-foreground">
                              {event.details}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Vital Signs */}
              <Card className="p-4 bg-muted/20">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Heart className="h-4 w-4 text-cyber-red" />
                  {language === "ar" ? "العلامات الحيوية" : "Vital Signs"}
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-cyber-red">
                      {incident.vitals.heartRate[incident.vitals.heartRate.length - 1] || 0}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {language === "ar" ? "ضربة/دقيقة" : "BPM"}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-cyber-blue">
                      {incident.vitals.spO2[incident.vitals.spO2.length - 1] || 0}%
                    </div>
                    <div className="text-xs text-muted-foreground">SpO₂</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-cyber-orange">
                      {incident.vitals.temperature[incident.vitals.temperature.length - 1]?.toFixed(1) || 0}°C
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {language === "ar" ? "درجة الحرارة" : "Temperature"}
                    </div>
                  </div>
                </div>
              </Card>

              {/* Evidence Capture */}
              {incident.mediaCapture && (
                <Card className="p-4 bg-muted/20">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Camera className="h-4 w-4 text-cyber-purple" />
                    {language === "ar" ? "الأدلة المرفقة" : "Evidence Capture"}
                  </h3>
                  <div className="flex items-center gap-4">
                    {incident.mediaCapture.thumbnail && (
                      <div className="w-20 h-16 bg-muted/40 rounded border flex items-center justify-center">
                        <Camera className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                    <div>
                      <div className="text-sm font-medium">
                        {language === "ar" ? "تسجيل فيديو وصوت" : "Video + Audio Recording"}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {language === "ar" ? `المدة: ${incident.mediaCapture.duration}ث` : `Duration: ${incident.mediaCapture.duration}s`}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {language === "ar" ? "مشفر محلياً" : "Encrypted locally"}
                      </div>
                    </div>
                  </div>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* QR Code */}
              <Card className="p-4 bg-muted/20">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <QrCode className="h-4 w-4 text-cyber-green" />
                  {language === "ar" ? "رمز QR للمشاركة" : "Shareable QR Code"}
                </h3>
                <div className="text-center">
                  <div className="p-4 bg-white rounded-lg inline-block">
                    <QRCode value={qrUrl} size={120} />
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">
                    {language === "ar" ? "امسح للوصول المباشر" : "Scan for instant access"}
                  </div>
                </div>
              </Card>

              {/* User Profile */}
              <Card className="p-4 bg-muted/20">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <User className="h-4 w-4 text-cyber-blue" />
                  {language === "ar" ? "الملف الشخصي" : "User Profile"}
                </h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">
                      {language === "ar" ? "الاسم:" : "Name:"}
                    </span>
                    <div className="font-medium">{incident.userProfile.name}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">
                      {language === "ar" ? "العمر:" : "Age:"}
                    </span>
                    <div className="font-medium">{incident.userProfile.age}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">
                      {language === "ar" ? "فصيلة الدم:" : "Blood Type:"}
                    </span>
                    <div className="font-medium">{incident.userProfile.bloodType}</div>
                  </div>
                  {incident.userProfile.medicalNotes && (
                    <div>
                      <span className="text-muted-foreground">
                        {language === "ar" ? "ملاحظات طبية:" : "Medical Notes:"}
                      </span>
                      <div className="text-xs bg-muted/40 p-2 rounded mt-1">
                        {incident.userProfile.medicalNotes}
                      </div>
                    </div>
                  )}
                </div>
              </Card>

              {/* Emergency Contacts */}
              <Card className="p-4 bg-muted/20">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Phone className="h-4 w-4 text-cyber-green" />
                  {language === "ar" ? "جهات الاتصال الطارئة" : "Emergency Contacts"}
                </h3>
                <div className="space-y-2">
                  {incident.userProfile.emergencyContacts.map((contact, i) => (
                    <div key={i} className="text-xs bg-muted/40 p-2 rounded">
                      <div className="font-medium">{contact.name}</div>
                      <div className="text-muted-foreground">{contact.relationship}</div>
                      <div className="text-cyber-blue">{contact.phone}</div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Actions */}
              <div className="space-y-2">
                <Button onClick={shareIncidentPack} className="w-full bg-[var(--gradient-primary)]">
                  <Share className="h-4 w-4 mr-2" />
                  {language === "ar" ? "مشاركة الحزمة" : "Share Pack"}
                </Button>
                
                <Button 
                  onClick={generatePrintableCard} 
                  variant="outline" 
                  className="w-full"
                  disabled={isGenerating}
                >
                  <Printer className="h-4 w-4 mr-2" />
                  {isGenerating 
                    ? (language === "ar" ? "جاري الإنشاء..." : "Generating...")
                    : (language === "ar" ? "طباعة البطاقة (A6)" : "Print Card (A6)")
                  }
                </Button>
                
                <Button 
                  onClick={() => window.open(qrUrl, '_blank')} 
                  variant="outline" 
                  className="w-full"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  {language === "ar" ? "عرض مباشر" : "Live View"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};