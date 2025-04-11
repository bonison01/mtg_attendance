
import React, { useState } from 'react';
import { 
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { 
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAttendance } from '@/contexts/AttendanceContext';
import { Fingerprint, LogIn, LogOut, Check, AlertCircle } from 'lucide-react';

const ClockInOut = () => {
  const { employees, clockIn, clockOut, getTodayAttendance } = useAttendance();
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>("");
  const [isScanning, setIsScanning] = useState(false);
  const [scanSuccess, setScanSuccess] = useState<boolean | null>(null);
  const [action, setAction] = useState<'in' | 'out'>('in');
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleSelectEmployee = (id: string) => {
    setSelectedEmployeeId(id);
    setScanSuccess(null);
  };

  const initiateFingerprint = (clockAction: 'in' | 'out') => {
    setAction(clockAction);
    setIsScanning(true);
    setScanSuccess(null);

    // Simulate fingerprint scan (would connect to a real scanner in production)
    setTimeout(() => {
      setIsScanning(false);
      
      // Check if employee exists and has a registered fingerprint
      const employee = employees.find(emp => emp.id === selectedEmployeeId);
      
      if (employee && employee.fingerprint) {
        setScanSuccess(true);
        
        // Perform clock in/out action
        if (clockAction === 'in') {
          clockIn(selectedEmployeeId);
        } else {
          clockOut(selectedEmployeeId);
        }

        // Open success dialog
        setDialogOpen(true);
      } else {
        setScanSuccess(false);
      }
    }, 2500);
  };

  const getAttendanceStatus = (employeeId: string) => {
    if (!employeeId) return null;
    return getTodayAttendance(employeeId);
  };

  const todayAttendance = selectedEmployeeId ? getAttendanceStatus(selectedEmployeeId) : null;
  const selectedEmployee = employees.find(emp => emp.id === selectedEmployeeId);

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Clock In/Out</h1>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Employee Verification</CardTitle>
          <CardDescription>
            Select an employee and verify fingerprint to clock in or out
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="employee">Employee</Label>
              <Select onValueChange={handleSelectEmployee} value={selectedEmployeeId}>
                <SelectTrigger id="employee">
                  <SelectValue placeholder="Select an employee" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((employee) => (
                    <SelectItem key={employee.id} value={employee.id}>
                      {employee.name} - {employee.position}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {selectedEmployeeId && (
              <div className="pt-4">
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <div className="mb-4">
                      <h3 className="font-medium text-lg">
                        {selectedEmployee?.name}
                      </h3>
                      <p className="text-muted-foreground">
                        {selectedEmployee?.position} • {selectedEmployee?.department}
                      </p>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-2">
                        <Button 
                          onClick={() => initiateFingerprint('in')} 
                          className="flex gap-2"
                          disabled={isScanning || (todayAttendance?.timeIn !== undefined)}
                        >
                          <LogIn className="h-4 w-4" />
                          Clock In
                        </Button>
                        <Button 
                          onClick={() => initiateFingerprint('out')} 
                          className="flex gap-2" 
                          variant="outline"
                          disabled={isScanning || !todayAttendance?.timeIn || todayAttendance?.timeOut !== undefined}
                        >
                          <LogOut className="h-4 w-4" />
                          Clock Out
                        </Button>
                      </div>
                      
                      {todayAttendance && (
                        <div className="border rounded-md p-3 bg-muted/50">
                          <h4 className="text-sm font-medium mb-2">Today's Status</h4>
                          <div className="grid grid-cols-2 gap-y-2 text-sm">
                            <div>Clock In:</div>
                            <div>{todayAttendance.timeIn || 'Not clocked in'}</div>
                            <div>Clock Out:</div>
                            <div>{todayAttendance.timeOut || 'Not clocked out'}</div>
                            <div>Status:</div>
                            <div>
                              <span className={`status-badge ${
                                todayAttendance.status === 'present' ? 'status-present' : 
                                todayAttendance.status === 'late' ? 'status-late' : 
                                todayAttendance.status === 'absent' ? 'status-absent' : 
                                'status-leave'
                              }`}>
                                {todayAttendance.status.charAt(0).toUpperCase() + todayAttendance.status.slice(1)}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-center justify-center">
                    <div className={`fingerprint-scanner ${isScanning ? 'animate-pulse' : ''}`}>
                      <Fingerprint 
                        className={`fingerprint-image text-white ${
                          scanSuccess === true ? 'text-green-400' : 
                          scanSuccess === false ? 'text-red-400' : ''
                        }`} 
                      />
                    </div>
                    <div className="text-center mt-4">
                      {isScanning ? (
                        <p className="text-sm text-muted-foreground animate-pulse">
                          Scanning fingerprint...
                        </p>
                      ) : scanSuccess === true ? (
                        <p className="text-sm text-green-600 font-medium">
                          Fingerprint verification successful
                        </p>
                      ) : scanSuccess === false ? (
                        <p className="text-sm text-red-600 font-medium">
                          Fingerprint verification failed
                        </p>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          Place finger on the scanner
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {scanSuccess ? (
                <>
                  <Check className="h-5 w-5 text-green-500" />
                  Success!
                </>
              ) : (
                <>
                  <AlertCircle className="h-5 w-5 text-red-500" />
                  Failed
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              {scanSuccess ? (
                action === 'in' ? (
                  <>
                    <p>Clock in recorded successfully.</p>
                    <p className="font-medium mt-2">Time: {new Date().toLocaleTimeString()}</p>
                  </>
                ) : (
                  <>
                    <p>Clock out recorded successfully.</p>
                    <p className="font-medium mt-2">Time: {new Date().toLocaleTimeString()}</p>
                  </>
                )
              ) : (
                <p>Failed to verify fingerprint. Please try again.</p>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setDialogOpen(false)}>OK</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClockInOut;
