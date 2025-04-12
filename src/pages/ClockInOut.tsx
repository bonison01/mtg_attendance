
import React, { useState, useRef } from 'react';
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
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAttendance } from '@/contexts/AttendanceContext';
import { Fingerprint, LogIn, LogOut, Check, AlertCircle, Camera, Hash, Loader2 } from 'lucide-react';
import { validateCode, validateFingerprint, validateSelfie, getVerificationRequirements } from '@/services/codeService';
import { toast } from 'sonner';

const ClockInOut = () => {
  const { employees, clockIn, clockOut, getTodayAttendance } = useAttendance();
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>("");
  const [isScanning, setIsScanning] = useState(false);
  const [scanSuccess, setScanSuccess] = useState<boolean | null>(null);
  const [action, setAction] = useState<'in' | 'out'>('in');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [verificationTab, setVerificationTab] = useState<string>('fingerprint');
  const [verificationRequirements, setVerificationRequirements] = useState({
    requireCode: true,
    requireSelfie: false,
    requireFingerprint: false
  });
  const [verificationCode, setVerificationCode] = useState<string>('');
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  
  // Refs for camera handling
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleSelectEmployee = (id: string) => {
    setSelectedEmployeeId(id);
    setScanSuccess(null);
  };

  const initiateVerification = async (clockAction: 'in' | 'out') => {
    setAction(clockAction);
    setScanSuccess(null);
    
    try {
      // Get verification requirements
      const requirements = await getVerificationRequirements();
      setVerificationRequirements(requirements);
      
      // Set default verification tab based on requirements
      if (requirements.requireFingerprint) {
        setVerificationTab('fingerprint');
      } else if (requirements.requireSelfie) {
        setVerificationTab('selfie');
      } else {
        setVerificationTab('code');
      }
      
      // Open dialog for verification
      setDialogOpen(true);
    } catch (error) {
      console.error('Error fetching verification requirements:', error);
      // Fallback to fingerprint as default
      setVerificationTab('fingerprint');
      setDialogOpen(true);
    }
  };

  const initiateFingerprint = () => {
    setIsScanning(true);
    setScanSuccess(null);

    // Simulate fingerprint scan (would connect to a real scanner in production)
    setTimeout(async () => {
      setIsScanning(false);
      
      // Check if employee exists
      const employee = employees.find(emp => emp.id === selectedEmployeeId);
      
      if (employee) {
        const isValid = await validateFingerprint(selectedEmployeeId);
        setScanSuccess(isValid);
        
        if (isValid) {
          // Perform clock in/out action
          if (action === 'in') {
            await clockIn(selectedEmployeeId, 'fingerprint');
          } else {
            await clockOut(selectedEmployeeId, 'fingerprint');
          }
        } else {
          toast.error('Fingerprint verification failed');
        }
      } else {
        setScanSuccess(false);
        toast.error('Employee not found');
      }
    }, 2500);
  };

  const verifyCode = async () => {
    setIsVerifyingCode(true);
    setScanSuccess(null);
    
    setTimeout(() => {
      setIsVerifyingCode(false);
      const isCodeValid = validateCode(verificationCode);
      setScanSuccess(isCodeValid);
      
      if (isCodeValid) {
        handleSuccessfulVerification('code');
      } else {
        toast.error('Verification code is incorrect');
      }
    }, 1500);
  };
  
  const startCamera = async () => {
    setIsCapturing(true);
    setCapturedImage(null);
    
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      toast.error("Could not access camera. Please check permissions.");
      setIsCapturing(false);
    }
  };
  
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      const tracks = stream.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCapturing(false);
  };
  
  const takePicture = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const context = canvasRef.current.getContext('2d');
    if (!context) return;
    
    // Set canvas dimensions to match the video
    canvasRef.current.width = videoRef.current.videoWidth;
    canvasRef.current.height = videoRef.current.videoHeight;
    
    // Draw the video frame to the canvas
    context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
    
    // Get the data URL representing the canvas content
    const dataUrl = canvasRef.current.toDataURL('image/jpeg');
    setCapturedImage(dataUrl);
    
    // Stop the camera stream
    stopCamera();
    
    // Verify the selfie
    verifySelfie(dataUrl);
  };
  
  const verifySelfie = async (selfieImage: string) => {
    setIsScanning(true);
    setScanSuccess(null);
    
    try {
      const isValid = await validateSelfie(selectedEmployeeId, selfieImage);
      setScanSuccess(isValid);
      
      if (isValid) {
        handleSuccessfulVerification('selfie');
      } else {
        toast.error('Facial verification failed');
      }
    } catch (error) {
      console.error('Error verifying selfie:', error);
      setScanSuccess(false);
      toast.error('Selfie verification failed');
    } finally {
      setIsScanning(false);
    }
  };

  const handleSuccessfulVerification = async (method: 'selfie' | 'fingerprint' | 'code') => {
    try {
      if (action === 'in') {
        await clockIn(selectedEmployeeId, method);
      } else {
        await clockOut(selectedEmployeeId, method);
      }
      
      toast.success(action === 'in' ? 'Clocked in successfully' : 'Clocked out successfully');
    } catch (error) {
      console.error('Error during clock action:', error);
      toast.error('Failed to record attendance');
    }
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
            Select an employee and verify identity to clock in or out
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
                          onClick={() => initiateVerification('in')} 
                          className="flex gap-2"
                          disabled={isScanning || (todayAttendance?.timeIn !== undefined)}
                        >
                          <LogIn className="h-4 w-4" />
                          Clock In
                        </Button>
                        <Button 
                          onClick={() => initiateVerification('out')} 
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
                          Verification successful
                        </p>
                      ) : scanSuccess === false ? (
                        <p className="text-sm text-red-600 font-medium">
                          Verification failed
                        </p>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          Select verification method
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
            <DialogTitle>Identity Verification</DialogTitle>
            <DialogDescription>
              {action === 'in' ? 
                'Verify your identity to clock in' : 
                'Verify your identity to clock out'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <Tabs value={verificationTab} onValueChange={setVerificationTab}>
              <TabsList className="grid grid-cols-3">
                <TabsTrigger value="fingerprint" disabled={!verificationRequirements.requireFingerprint && (verificationRequirements.requireCode || verificationRequirements.requireSelfie)}>
                  <div className="flex items-center gap-2">
                    <Fingerprint className="h-4 w-4" />
                    <span>Fingerprint</span>
                  </div>
                </TabsTrigger>
                <TabsTrigger value="selfie" disabled={!verificationRequirements.requireSelfie && (verificationRequirements.requireCode || verificationRequirements.requireFingerprint)}>
                  <div className="flex items-center gap-2">
                    <Camera className="h-4 w-4" />
                    <span>Selfie</span>
                  </div>
                </TabsTrigger>
                <TabsTrigger value="code" disabled={!verificationRequirements.requireCode && (verificationRequirements.requireSelfie || verificationRequirements.requireFingerprint)}>
                  <div className="flex items-center gap-2">
                    <Hash className="h-4 w-4" />
                    <span>Code</span>
                  </div>
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="fingerprint" className="mt-4 flex flex-col items-center">
                <div className={`relative h-40 w-40 rounded-full bg-muted/50 flex items-center justify-center mb-4 ${isScanning ? 'animate-pulse' : ''}`}>
                  <Fingerprint className={`h-20 w-20 ${
                    scanSuccess === true ? 'text-green-500' :
                    scanSuccess === false ? 'text-red-500' :
                    'text-muted-foreground'
                  }`} />
                  {isScanning && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Loader2 className="h-10 w-10 text-primary animate-spin" />
                    </div>
                  )}
                </div>
                <p className="mb-4 text-center text-sm text-muted-foreground">
                  {isScanning ? 'Scanning fingerprint...' :
                   scanSuccess === true ? 'Fingerprint verified!' :
                   scanSuccess === false ? 'Fingerprint verification failed' :
                   'Place your finger on the scanner'}
                </p>
                <Button 
                  onClick={initiateFingerprint} 
                  disabled={isScanning || scanSuccess === true}
                  className="w-40"
                >
                  {isScanning ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Fingerprint className="h-4 w-4 mr-2" />
                  )}
                  Scan Fingerprint
                </Button>
              </TabsContent>
              
              <TabsContent value="selfie" className="mt-4">
                <div className="flex flex-col items-center">
                  {!isCapturing && !capturedImage ? (
                    <>
                      <div className="rounded-full bg-muted/50 p-6 mb-4">
                        <Camera className="h-12 w-12 text-muted-foreground" />
                      </div>
                      <p className="mb-4 text-center text-sm text-muted-foreground">
                        Take a selfie for facial verification
                      </p>
                      <Button onClick={startCamera}>Start Camera</Button>
                    </>
                  ) : isCapturing ? (
                    <div className="space-y-4">
                      <div className="relative aspect-video w-full max-w-md mx-auto border rounded-md overflow-hidden">
                        <video 
                          ref={videoRef} 
                          className="w-full h-full object-cover" 
                          autoPlay 
                          playsInline
                        />
                      </div>
                      <div className="flex justify-center gap-4">
                        <Button variant="outline" onClick={stopCamera}>Cancel</Button>
                        <Button onClick={takePicture}>
                          <Camera className="h-4 w-4 mr-2" />
                          Take Photo
                        </Button>
                      </div>
                    </div>
                  ) : capturedImage ? (
                    <div className="space-y-4">
                      <div className="relative aspect-video w-full max-w-md mx-auto border rounded-md overflow-hidden">
                        <img 
                          src={capturedImage} 
                          alt="Captured selfie" 
                          className="w-full h-full object-cover"
                        />
                        {isScanning && (
                          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                            <Loader2 className="h-10 w-10 text-white animate-spin" />
                          </div>
                        )}
                        {scanSuccess === true && (
                          <div className="absolute inset-0 bg-green-500/30 flex items-center justify-center">
                            <Check className="h-16 w-16 text-white" />
                          </div>
                        )}
                        {scanSuccess === false && (
                          <div className="absolute inset-0 bg-red-500/30 flex items-center justify-center">
                            <AlertCircle className="h-16 w-16 text-white" />
                          </div>
                        )}
                      </div>
                      <div className="flex justify-center gap-4">
                        {scanSuccess === null && (
                          <Button 
                            variant="outline" 
                            onClick={() => {
                              setCapturedImage(null);
                              setScanSuccess(null);
                            }}
                          >
                            Retake
                          </Button>
                        )}
                      </div>
                    </div>
                  ) : null}
                </div>
                <canvas ref={canvasRef} style={{ display: 'none' }} />
              </TabsContent>
              
              <TabsContent value="code" className="mt-4">
                <div className="flex flex-col items-center">
                  <div className="rounded-full bg-muted/50 p-6 mb-4">
                    <Hash className="h-12 w-12 text-muted-foreground" />
                  </div>
                  <p className="mb-4 text-center text-sm text-muted-foreground">
                    Enter today's verification code
                  </p>
                  <div className="w-full max-w-xs mb-4">
                    <Input 
                      type="text" 
                      placeholder="Enter 6-digit code"
                      value={verificationCode}
                      onChange={e => setVerificationCode(e.target.value)}
                      maxLength={6}
                      className="text-center text-lg tracking-widest"
                    />
                  </div>
                  <Button 
                    onClick={verifyCode} 
                    disabled={verificationCode.length < 6 || isVerifyingCode || scanSuccess === true}
                  >
                    {isVerifyingCode ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Check className="h-4 w-4 mr-2" />
                    )}
                    Verify Code
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setDialogOpen(false);
                stopCamera();
                setScanSuccess(null);
                setCapturedImage(null);
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={() => {
                setDialogOpen(false);
                stopCamera();
              }}
              disabled={scanSuccess !== true}
            >
              {action === 'in' ? 'Complete Clock In' : 'Complete Clock Out'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClockInOut;
