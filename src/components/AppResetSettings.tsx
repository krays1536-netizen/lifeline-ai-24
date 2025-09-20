import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, RotateCcw, Trash2, Download, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AppResetSettingsProps {
  onReset: () => void;
}

export const AppResetSettings = ({ onReset }: AppResetSettingsProps) => {
  const { toast } = useToast();
  const [showConfirm, setShowConfirm] = useState(false);

  const exportData = () => {
    try {
      const userData = {
        profile: localStorage.getItem('lifeline_user_profile'),
        settings: localStorage.getItem('lifeline_settings'),
        vitals: localStorage.getItem('lifeline_vitals_history'),
        incidents: localStorage.getItem('lifeline_incidents'),
        timestamp: new Date().toISOString()
      };

      const dataStr = JSON.stringify(userData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      
      const link = document.createElement('a');
      link.href = URL.createObjectURL(dataBlob);
      link.download = `lifeline-backup-${new Date().toISOString().split('T')[0]}.json`;
      link.click();

      toast({
        title: "Data Exported",
        description: "Your LifeLine AI data has been exported successfully",
        variant: "default"
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Unable to export data. Please try again.",
        variant: "destructive"
      });
    }
  };

  const resetAllData = () => {
    // Clear all LifeLine AI data from localStorage
    const keysToRemove = [
      'lifeline_user_profile',
      'lifeline_settings',
      'lifeline_vitals_history',
      'lifeline_incidents',
      'lifeline_neural_data',
      'lifeline_ppg_data',
      'lifeline_location_data'
    ];

    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
    });

    toast({
      title: "App Data Reset",
      description: "All LifeLine AI data has been cleared. Restarting app...",
      variant: "default"
    });

    // Reset app state
    setTimeout(() => {
      onReset();
      window.location.reload();
    }, 2000);
  };

  return (
    <Card className="w-full max-w-md mx-auto p-6">
      <div className="space-y-6">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Settings className="w-6 h-6 text-muted-foreground" />
            <h3 className="text-lg font-semibold">App Settings</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Manage your LifeLine AI data and settings
          </p>
        </div>

        {/* Export Data */}
        <div className="space-y-3">
          <h4 className="font-medium">Data Management</h4>
          <Button 
            onClick={exportData} 
            variant="outline" 
            className="w-full flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export My Data
          </Button>
          <p className="text-xs text-muted-foreground">
            Export your profile, vitals, and emergency data as a backup file
          </p>
        </div>

        {/* Reset Section */}
        <div className="space-y-3">
          <h4 className="font-medium text-destructive">Danger Zone</h4>
          
          {!showConfirm ? (
            <Button 
              onClick={() => setShowConfirm(true)} 
              variant="destructive" 
              className="w-full flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Reset App Data
            </Button>
          ) : (
            <div className="space-y-3">
              <Alert className="border-destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Warning:</strong> This will permanently delete:
                  <ul className="list-disc list-inside mt-2 text-sm">
                    <li>Your profile and emergency contacts</li>
                    <li>All vitals and health data</li>
                    <li>Emergency incidents and QR codes</li>
                    <li>All app settings and preferences</li>
                  </ul>
                </AlertDescription>
              </Alert>
              
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  onClick={() => setShowConfirm(false)} 
                  variant="outline"
                  size="sm"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={resetAllData} 
                  variant="destructive"
                  size="sm"
                  className="flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" />
                  Delete All
                </Button>
              </div>
            </div>
          )}
          
          <p className="text-xs text-muted-foreground">
            This will remove all your data and return the app to first-time setup
          </p>
        </div>

        {/* App Info */}
        <div className="pt-4 border-t text-center">
          <div className="text-xs text-muted-foreground space-y-1">
            <div>LifeLine AI Guardian v2.0</div>
            <div>Emergency Response System</div>
            <div>Made with ❤️ for saving lives</div>
          </div>
        </div>
      </div>
    </Card>
  );
};