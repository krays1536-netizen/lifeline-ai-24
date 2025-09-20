import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { RotateCcw, AlertTriangle, CheckCircle } from 'lucide-react';

interface AppDataResetProps {
  onReset: () => void;
}

export const AppDataReset: React.FC<AppDataResetProps> = ({ onReset }) => {
  const [isResetting, setIsResetting] = useState(false);

  const handleReset = async () => {
    setIsResetting(true);
    
    // Clear all localStorage data
    const keysToKeep = ['theme']; // Keep theme preference
    const allKeys = Object.keys(localStorage);
    
    allKeys.forEach(key => {
      if (!keysToKeep.includes(key)) {
        localStorage.removeItem(key);
      }
    });

    // Simulate reset process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsResetting(false);
    onReset();
  };

  return (
    <Card className="p-6 border-destructive/20 bg-destructive/5">
      <div className="flex items-center space-x-4 mb-4">
        <div className="p-2 rounded-full bg-destructive/10">
          <AlertTriangle className="w-6 h-6 text-destructive" />
        </div>
        <div>
          <h3 className="font-semibold text-destructive">Reset App Data</h3>
          <p className="text-sm text-muted-foreground">
            Clear all user data and return to initial setup
          </p>
        </div>
      </div>

      <div className="space-y-3 mb-6">
        <div className="text-sm text-muted-foreground">
          This will permanently delete:
        </div>
        <ul className="text-sm space-y-1 ml-4">
          <li>• User profile and medical history</li>
          <li>• Health monitoring records</li>
          <li>• Emergency contacts</li>
          <li>• AI scan results and history</li>
          <li>• App preferences (except theme)</li>
        </ul>
      </div>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="destructive" disabled={isResetting}>
            {isResetting ? (
              <>
                <RotateCcw className="w-4 h-4 mr-2 animate-spin" />
                Resetting...
              </>
            ) : (
              <>
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset App Data
              </>
            )}
          </Button>
        </AlertDialogTrigger>
        
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center">
              <AlertTriangle className="w-5 h-5 text-destructive mr-2" />
              Confirm App Reset
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to reset all app data? This action cannot be undone. 
              You will need to complete the sign-up process again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleReset} className="bg-destructive hover:bg-destructive/90">
              Yes, Reset Everything
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {isResetting && (
        <div className="mt-4 p-3 bg-background/50 rounded-lg">
          <div className="flex items-center space-x-2">
            <RotateCcw className="w-4 h-4 animate-spin text-primary" />
            <span className="text-sm">Clearing app data...</span>
          </div>
        </div>
      )}
    </Card>
  );
};