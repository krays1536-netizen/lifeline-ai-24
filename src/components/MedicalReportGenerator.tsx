import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  FileText, 
  Download, 
  Share, 
  QrCode, 
  Clock, 
  MapPin, 
  Heart, 
  AlertTriangle,
  User,
  Phone,
  Shield,
  Activity,
  Zap,
  Camera,
  Mic
} from "lucide-react";

interface PatientData {
  personalInfo: {
    name: string;
    age: number;
    bloodType: string;
    allergies: string[];
    conditions: string[];
  };
  emergencyContacts: {
    name: string;
    relation: string;
    phone: string;
  }[];
  currentVitals: {
    heartRate: number;
    spO2: number;
    temperature: number;
    timestamp: Date;
  };
  location: {
    latitude: number;
    longitude: number;
    address: string;
  } | null;
  incidentData?: {
    type: string;
    timestamp: Date;
    riskScore: number;
    timeline: Array<{
      time: string;
      event: string;
      severity: 'info' | 'warning' | 'critical';
    }>;
    witnessFootage?: boolean;
    audioRecording?: boolean;
  };
}

interface MedicalReportGeneratorProps {
  patientData: PatientData;
  onReportGenerated?: (reportUrl: string, reportData: any) => void;
}

export const MedicalReportGenerator = ({ 
  patientData, 
  onReportGenerated 
}: MedicalReportGeneratorProps) => {
  const { toast } = useToast();
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedReports, setGeneratedReports] = useState<{
    json: string | null;
    pdf: string | null;
    qrCode: string | null;
  }>({
    json: null,
    pdf: null,
    qrCode: null
  });

  const generateMedicalReport = useCallback(async () => {
    setIsGenerating(true);
    
    try {
      // Create comprehensive medical report data
      const reportData = {
        reportId: `LLA-${Date.now()}`,
        generatedAt: new Date().toISOString(),
        reportType: "Emergency Medical Report",
        version: "2.0",
        
        // Patient Information
        patient: {
          id: `PAT-${Date.now()}`,
          name: patientData.personalInfo.name,
          age: patientData.personalInfo.age,
          bloodType: patientData.personalInfo.bloodType,
          knownAllergies: patientData.personalInfo.allergies,
          medicalConditions: patientData.personalInfo.conditions,
          reportGenerationTime: new Date().toLocaleString()
        },
        
        // Emergency Contacts
        emergencyContacts: patientData.emergencyContacts.map(contact => ({
          name: contact.name,
          relationship: contact.relation,
          phoneNumber: contact.phone,
          contactPriority: "Primary"
        })),
        
        // Current Vital Signs
        vitals: {
          heartRate: {
            value: patientData.currentVitals.heartRate,
            unit: "BPM",
            status: patientData.currentVitals.heartRate > 100 ? "Elevated" : 
                    patientData.currentVitals.heartRate < 60 ? "Low" : "Normal",
            timestamp: patientData.currentVitals.timestamp.toISOString()
          },
          oxygenSaturation: {
            value: patientData.currentVitals.spO2,
            unit: "%",
            status: patientData.currentVitals.spO2 < 95 ? "Low" : "Normal",
            timestamp: patientData.currentVitals.timestamp.toISOString()
          },
          bodyTemperature: {
            value: patientData.currentVitals.temperature,
            unit: "°C",
            status: patientData.currentVitals.temperature > 37.5 ? "Fever" : 
                    patientData.currentVitals.temperature < 36 ? "Low" : "Normal",
            timestamp: patientData.currentVitals.timestamp.toISOString()
          },
          overallVitalStatus: getOverallVitalStatus()
        },
        
        // Location Data
        location: patientData.location ? {
          coordinates: {
            latitude: patientData.location.latitude,
            longitude: patientData.location.longitude
          },
          address: patientData.location.address,
          googleMapsLink: `https://maps.google.com/?q=${patientData.location.latitude},${patientData.location.longitude}`,
          emergencyServiceAccess: "GPS coordinates provided for precise location"
        } : null,
        
        // Incident Information
        incident: patientData.incidentData ? {
          type: patientData.incidentData.type,
          occurredAt: patientData.incidentData.timestamp.toISOString(),
          riskScore: patientData.incidentData.riskScore,
          severity: patientData.incidentData.riskScore >= 7 ? "High" : 
                    patientData.incidentData.riskScore >= 4 ? "Medium" : "Low",
          timeline: patientData.incidentData.timeline,
          mediaEvidence: {
            witnessFootage: patientData.incidentData.witnessFootage || false,
            audioRecording: patientData.incidentData.audioRecording || false,
            evidenceNote: "Digital evidence secured for medical review"
          }
        } : null,
        
        // AI Guardian System Status
        guardianSystem: {
          status: "Active",
          aiRiskAssessment: {
            currentRiskLevel: patientData.incidentData?.riskScore || 1,
            riskFactors: generateRiskFactors(),
            recommendations: generateRecommendations()
          },
          systemCapabilities: [
            "Real-time vital monitoring",
            "Fall detection algorithm",
            "Emergency witness cam with pre-buffer",
            "GPS location tracking",
            "AI-powered medical triage",
            "Automatic emergency contact notification",
            "Voice command emergency activation"
          ]
        },
        
        // Medical Recommendations
        medicalGuidance: {
          immediateActions: getImmediateActions(),
          hospitalRecommendation: getHospitalRecommendation(),
          followUpCare: [
            "Monitor vital signs every 15 minutes",
            "Maintain calm and stable positioning",
            "Document any changes in condition",
            "Ensure continuous communication with emergency services"
          ]
        },
        
        // System Metadata
        metadata: {
          generatedBy: "LifeLine AI Guardian System v2.0",
          reportFormat: "Medical Emergency Assessment",
          confidentiality: "CONFIDENTIAL - Medical Information",
          dataRetention: "Report valid for 24 hours",
          emergencyServices: {
            kuwaitEmergency: "112",
            recommendation: "Share this report with emergency responders"
          }
        }
      };

      // Generate JSON report
      const jsonReport = JSON.stringify(reportData, null, 2);
      const jsonBlob = new Blob([jsonReport], { type: 'application/json' });
      const jsonUrl = URL.createObjectURL(jsonBlob);
      
      // Generate PDF content (as HTML that can be printed/saved as PDF)
      const pdfContent = generatePDFContent(reportData);
      const pdfBlob = new Blob([pdfContent], { type: 'text/html' });
      const pdfUrl = URL.createObjectURL(pdfBlob);
      
      // Generate QR code data
      const qrData = {
        reportId: reportData.reportId,
        patientName: reportData.patient.name,
        emergencyContact: patientData.emergencyContacts[0]?.phone || "N/A",
        location: patientData.location?.address || "Location not available",
        vitals: `HR:${patientData.currentVitals.heartRate} SpO2:${patientData.currentVitals.spO2}% T:${patientData.currentVitals.temperature}°C`,
        accessUrl: `${window.location.origin}/medical-report/${reportData.reportId}`
      };
      
      setGeneratedReports({
        json: jsonUrl,
        pdf: pdfUrl,
        qrCode: JSON.stringify(qrData)
      });
      
      onReportGenerated?.(jsonUrl, reportData);
      
      toast({
        title: "📋 Medical Report Generated",
        description: "Comprehensive medical report ready for download",
        variant: "default"
      });
      
    } catch (error) {
      toast({
        title: "Report Generation Failed",
        description: "Unable to generate medical report",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  }, [patientData, onReportGenerated, toast]);

  const getOverallVitalStatus = () => {
    const { heartRate, spO2, temperature } = patientData.currentVitals;
    
    if (heartRate > 100 || spO2 < 95 || temperature > 37.5) {
      return "ABNORMAL - Requires immediate attention";
    }
    if (heartRate > 90 || spO2 < 97 || temperature > 37) {
      return "ELEVATED - Monitor closely";
    }
    return "NORMAL - Within acceptable ranges";
  };

  const generateRiskFactors = () => {
    const factors = [];
    const { heartRate, spO2, temperature } = patientData.currentVitals;
    
    if (heartRate > 100) factors.push("Elevated heart rate (tachycardia)");
    if (heartRate < 60) factors.push("Low heart rate (bradycardia)");
    if (spO2 < 95) factors.push("Low oxygen saturation");
    if (temperature > 37.5) factors.push("Fever present");
    if (patientData.personalInfo.allergies.length > 0) factors.push("Known allergies present");
    if (patientData.personalInfo.conditions.length > 0) factors.push("Pre-existing medical conditions");
    
    return factors.length > 0 ? factors : ["No immediate risk factors identified"];
  };

  const generateRecommendations = () => {
    const riskScore = patientData.incidentData?.riskScore || 1;
    
    if (riskScore >= 7) {
      return [
        "IMMEDIATE MEDICAL ATTENTION REQUIRED",
        "Call emergency services (112) immediately",
        "Prepare for emergency transport",
        "Monitor airway, breathing, circulation"
      ];
    } else if (riskScore >= 4) {
      return [
        "Seek medical evaluation within 2-4 hours",
        "Monitor vital signs closely",
        "Have emergency contacts ready",
        "Document any symptom changes"
      ];
    } else {
      return [
        "Monitor symptoms and vital signs",
        "Stay hydrated and rest",
        "Contact healthcare provider if symptoms worsen",
        "Follow up with primary care physician"
      ];
    }
  };

  const getImmediateActions = () => {
    const actions = ["Ensure patient safety and comfort"];
    
    if (patientData.incidentData?.type.includes("Fall")) {
      actions.push("Do not move patient unless necessary");
      actions.push("Check for head, neck, or spinal injuries");
    }
    
    actions.push("Monitor consciousness and responsiveness");
    actions.push("Keep patient warm and calm");
    actions.push("Document time and circumstances");
    
    return actions;
  };

  const getHospitalRecommendation = () => {
    const riskScore = patientData.incidentData?.riskScore || 1;
    
    if (riskScore >= 7) {
      return "IMMEDIATE TRANSPORT TO NEAREST EMERGENCY DEPARTMENT";
    } else if (riskScore >= 4) {
      return "Recommend urgent medical evaluation - consider emergency department or urgent care";
    } else {
      return "Consider routine medical evaluation if symptoms persist or worsen";
    }
  };

  const generatePDFContent = (reportData: any) => {
    return `
<!DOCTYPE html>
<html>
<head>
    <title>LifeLine AI Medical Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; }
        .section { margin: 20px 0; }
        .vital-sign { display: inline-block; margin: 10px; padding: 10px; border: 1px solid #ccc; }
        .emergency { color: red; font-weight: bold; }
        .normal { color: green; }
        .elevated { color: orange; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
    </style>
</head>
<body>
    <div class="header">
        <h1>LifeLine AI Guardian System</h1>
        <h2>Emergency Medical Report</h2>
        <p>Report ID: ${reportData.reportId}</p>
        <p>Generated: ${new Date().toLocaleString()}</p>
    </div>
    
    <div class="section">
        <h3>Patient Information</h3>
        <p><strong>Name:</strong> ${reportData.patient.name}</p>
        <p><strong>Age:</strong> ${reportData.patient.age}</p>
        <p><strong>Blood Type:</strong> ${reportData.patient.bloodType}</p>
        <p><strong>Allergies:</strong> ${reportData.patient.knownAllergies.join(', ') || 'None reported'}</p>
        <p><strong>Medical Conditions:</strong> ${reportData.patient.medicalConditions.join(', ') || 'None reported'}</p>
    </div>
    
    <div class="section">
        <h3>Current Vital Signs</h3>
        <div class="vital-sign">
            <strong>Heart Rate:</strong> ${reportData.vitals.heartRate.value} ${reportData.vitals.heartRate.unit}
            <br><span class="${reportData.vitals.heartRate.status.toLowerCase()}">${reportData.vitals.heartRate.status}</span>
        </div>
        <div class="vital-sign">
            <strong>Oxygen Saturation:</strong> ${reportData.vitals.oxygenSaturation.value}${reportData.vitals.oxygenSaturation.unit}
            <br><span class="${reportData.vitals.oxygenSaturation.status.toLowerCase()}">${reportData.vitals.oxygenSaturation.status}</span>
        </div>
        <div class="vital-sign">
            <strong>Temperature:</strong> ${reportData.vitals.bodyTemperature.value}${reportData.vitals.bodyTemperature.unit}
            <br><span class="${reportData.vitals.bodyTemperature.status.toLowerCase()}">${reportData.vitals.bodyTemperature.status}</span>
        </div>
        <p><strong>Overall Status:</strong> <span class="${reportData.vitals.overallVitalStatus.includes('ABNORMAL') ? 'emergency' : reportData.vitals.overallVitalStatus.includes('ELEVATED') ? 'elevated' : 'normal'}">${reportData.vitals.overallVitalStatus}</span></p>
    </div>
    
    ${reportData.location ? `
    <div class="section">
        <h3>Location Information</h3>
        <p><strong>Address:</strong> ${reportData.location.address}</p>
        <p><strong>Coordinates:</strong> ${reportData.location.coordinates.latitude}, ${reportData.location.coordinates.longitude}</p>
        <p><strong>Google Maps:</strong> <a href="${reportData.location.googleMapsLink}">View Location</a></p>
    </div>
    ` : ''}
    
    <div class="section">
        <h3>Emergency Contacts</h3>
        <table>
            <tr><th>Name</th><th>Relationship</th><th>Phone</th></tr>
            ${reportData.emergencyContacts.map((contact: any) => `
            <tr><td>${contact.name}</td><td>${contact.relationship}</td><td>${contact.phoneNumber}</td></tr>
            `).join('')}
        </table>
    </div>
    
    <div class="section">
        <h3>Medical Recommendations</h3>
        <p><strong>Hospital Recommendation:</strong> ${reportData.medicalGuidance.hospitalRecommendation}</p>
        <h4>Immediate Actions:</h4>
        <ul>
            ${reportData.medicalGuidance.immediateActions.map((action: string) => `<li>${action}</li>`).join('')}
        </ul>
    </div>
    
    <div class="section">
        <h3>AI Guardian System Status</h3>
        <p><strong>Status:</strong> ${reportData.guardianSystem.status}</p>
        <p><strong>Risk Level:</strong> ${reportData.guardianSystem.aiRiskAssessment.currentRiskLevel}/10</p>
        <h4>Risk Factors:</h4>
        <ul>
            ${reportData.guardianSystem.aiRiskAssessment.riskFactors.map((factor: string) => `<li>${factor}</li>`).join('')}
        </ul>
    </div>
    
    <div class="section">
        <p><em>This report was generated by the LifeLine AI Guardian System. For emergencies, call 112.</em></p>
        <p><em>Report is confidential medical information. Valid for 24 hours.</em></p>
    </div>
</body>
</html>
    `;
  };

  const downloadReport = (type: 'json' | 'pdf') => {
    const url = generatedReports[type];
    if (!url) return;
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `LifeLine-Medical-Report-${Date.now()}.${type === 'pdf' ? 'html' : 'json'}`;
    link.click();
    
    toast({
      title: `📁 ${type.toUpperCase()} Downloaded`,
      description: `Medical report saved as ${type.toUpperCase()} file`,
      variant: "default"
    });
  };

  const shareReport = () => {
    if (generatedReports.qrCode) {
      navigator.clipboard.writeText(generatedReports.qrCode);
      toast({
        title: "🔗 Report Data Copied",
        description: "Medical report QR data copied to clipboard",
        variant: "default"
      });
    }
  };

  return (
    <Card className="border-primary/20 bg-gradient-subtle">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <FileText className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="text-xl font-bold">Medical Report Generator</h3>
            <p className="text-sm text-muted-foreground">
              Generate comprehensive medical reports for doctors
            </p>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Patient Summary */}
        <div className="grid grid-cols-2 gap-4 p-4 bg-card rounded-lg border">
          <div>
            <h4 className="font-medium text-primary mb-2">Patient</h4>
            <p className="text-sm">{patientData.personalInfo.name}, {patientData.personalInfo.age}</p>
            <p className="text-sm text-muted-foreground">Blood Type: {patientData.personalInfo.bloodType}</p>
          </div>
          <div>
            <h4 className="font-medium text-primary mb-2">Current Vitals</h4>
            <div className="text-sm space-y-1">
              <div className="flex items-center gap-2">
                <Heart className="w-3 h-3 text-red-500" />
                <span>{patientData.currentVitals.heartRate} BPM</span>
              </div>
              <div className="flex items-center gap-2">
                <Activity className="w-3 h-3 text-blue-500" />
                <span>{patientData.currentVitals.spO2}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Generate Report */}
        <div className="text-center space-y-4">
          <Button
            onClick={generateMedicalReport}
            disabled={isGenerating}
            className="w-full h-16 text-lg font-bold bg-primary hover:bg-primary/90"
          >
            {isGenerating ? (
              <>
                <Clock className="w-5 h-5 mr-2 animate-spin" />
                Generating Medical Report...
              </>
            ) : (
              <>
                <FileText className="w-5 h-5 mr-2" />
                Generate Complete Medical Report
              </>
            )}
          </Button>
          
          <p className="text-sm text-muted-foreground">
            Creates JSON & PDF reports with full medical data, vitals, location, and AI analysis
          </p>
        </div>

        {/* Download Options */}
        {generatedReports.json && (
          <div className="space-y-4">
            <h4 className="font-semibold flex items-center gap-2">
              <Download className="w-4 h-4" />
              Download Medical Reports
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Button
                onClick={() => downloadReport('json')}
                variant="outline"
                className="h-20 flex flex-col items-center gap-2"
              >
                <FileText className="w-6 h-6 text-blue-500" />
                <div className="text-center">
                  <div className="font-medium">JSON Report</div>
                  <div className="text-xs text-muted-foreground">Machine readable</div>
                </div>
              </Button>
              
              <Button
                onClick={() => downloadReport('pdf')}
                variant="outline"
                className="h-20 flex flex-col items-center gap-2"
              >
                <FileText className="w-6 h-6 text-red-500" />
                <div className="text-center">
                  <div className="font-medium">PDF Report</div>
                  <div className="text-xs text-muted-foreground">Print friendly</div>
                </div>
              </Button>
              
              <Button
                onClick={shareReport}
                variant="outline"
                className="h-20 flex flex-col items-center gap-2"
              >
                <QrCode className="w-6 h-6 text-green-500" />
                <div className="text-center">
                  <div className="font-medium">Share Data</div>
                  <div className="text-xs text-muted-foreground">QR code data</div>
                </div>
              </Button>
            </div>
            
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 text-green-700 font-medium mb-1">
                <Shield className="w-4 h-4" />
                Report Generated Successfully
              </div>
              <p className="text-sm text-green-600">
                Comprehensive medical report with AI analysis, vitals, location data, and emergency contacts ready for healthcare providers.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};