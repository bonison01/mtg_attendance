import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Employee, AttendanceRecord } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Fingerprint, 
  LogIn, 
  LogOut, 
  Search, 
  Camera, 
  Hash, 
  Check, 
  X,
  Loader2
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { validateCode, recordAttendance, getVerificationRequirements } from '@/services/codeService';
import { getDailyCode } from '@/utils/codeGenerator';
import { fetchCompanySettings } from '@/services/companySettingsService';

const OpenClockInDashboard = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [verificationDialogOpen, setVerificationDialogOpen] = useState(false);
  const [currentEmployeeId, setCurrentEmployeeId] = useState<string | null>(null);
  const [clockInMode, setClockInMode] = useState<boolean>(true);
  const [verificationTab, setVerificationTab] = useState<string>('selfie');
  const [verificationCode, setVerificationCode] = useState<string>('');
  const [dailyCode, setDailyCode] = useState<string>('');
  const [isCapturing, setIsCapturing] = useState<boolean>(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [fingerprintScanning, setFingerprintScanning] = useState<boolean>(false);
  const [verificationSuccess, setVerificationSuccess] = useState<boolean | null>(null);
  const [verifyingInput, setVerifyingInput] = useState<boolean>(false);
  const [verificationRequirements, setVerificationRequirements] = useState({
    requireCode: true,
    requireSelfie: false,
    requireFingerprint: false
  });
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const requirements = await getVerificationRequirements();
        setVerificationRequirements(requirements);
        
        if (requirements.requireSelfie) {
          setVerificationTab('selfie');
        } else if (requirements.requireFingerprint) {
          setVerificationTab('fingerprint');
        } else if (requirements.requireCode) {
          setVerificationTab('code');
        }
        
        const { data: employeeData, error: employeeError } = await supabase
          .from('employees')
          .select('*');
          
        if (employeeError) throw employeeError;
        
        const mappedEmployees: Employee[] = employeeData.map((emp: any) => ({
          id: emp.id,
          name: emp.name,
          email: emp.email,
          phoneNumber: emp.phone_number || '',
          position: emp.position,
          department: emp.department || '',
          joinDate: emp.join_date,
          imageUrl: emp.image_url || '',
          fingerprint: emp.fingerprint || null,
          date_of_birth: emp.date_of_birth || null
        }));
        
        setEmployees(mappedEmployees);
        
        const today = new Date().toISOString().split('T')[0];
        const { data: attendanceData, error: attendanceError } = await supabase
          .from('attendance_records')
          .select('*')
          .eq('date', today);
        
        if (attendanceError) throw attendanceError;
        
        const mappedAttendance: AttendanceRecord[] = attendanceData.map((record: any) => ({
          id: record.id,
          employeeId: record.employee_id,
          date: record.date,
          timeIn: record.time_in || undefined,
          timeOut: record.time_out || undefined,
          status: record.status,
          note: record.note || ''
        }));
        
        setAttendanceRecords(mappedAttendance);

        setDailyCode(getDailyCode());
        
      } catch (error: any) {
        toast.error("Error loading data", {
          description: error.message
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();

    const channel = supabase
      .channel('public:attendance_records')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'attendance_records' 
      }, (payload) => {
        if (payload.eventType === 'INSERT') {
          const newRecord = payload.new;
          const mappedRecord: AttendanceRecord = {
            id: newRecord.id,
            employeeId: newRecord.employee_id,
            date: newRecord.date,
            timeIn: newRecord.time_in || undefined,
            timeOut: newRecord.time_out || undefined,
            status: newRecord.status,
            note: newRecord.note || ''
          };
          setAttendanceRecords(prev => [...prev, mappedRecord]);
        } else if (payload.eventType === 'UPDATE') {
          const updatedRecord = payload.new;
          setAttendanceRecords(prev => prev.map(record => 
            record.id === updatedRecord.id ? {
              ...record,
              timeIn: updatedRecord.time_in || undefined,
              timeOut: updatedRecord.time_out || undefined,
              status: updatedRecord.status,
              note: updatedRecord.note || ''
            } : record
          ));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      stopCamera();
    };
  }, []);

  const getTodayAttendance = (employeeId: string): AttendanceRecord | undefined => {
    return attendanceRecords.find(record => record.employeeId === employeeId);
  };

  const initiateClockAction = (employeeId: string, isClockIn: boolean) => {
    setCurrentEmployeeId(employeeId);
    setClockInMode(isClockIn);
    setVerificationDialogOpen(true);
    setVerificationSuccess(null);
    setVerificationCode('');
    setCapturedImage(null);
    
    if (verificationRequirements.requireSelfie) {
      setVerificationTab('selfie');
    } else if (verificationRequirements.requireFingerprint) {
      setVerificationTab('fingerprint');
    } else {
      setVerificationTab('code');
    }
  };

  const startCamera = async () => {
    setIsCapturing(true);
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      } else {
        throw new Error("Camera access not available");
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      toast.error("Camera Access Failed", {
        description: "Could not access your camera. Please check permissions."
      });
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
    
    canvasRef.current.width = videoRef.current.videoWidth;
    canvasRef.current.height = videoRef.current.videoHeight;
    
    context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
    
    const dataUrl = canvasRef.current.toDataURL('image/jpeg');
    setCapturedImage(dataUrl);
    stopCamera();
    
    simulateVerification();
  };

  const simulateFingerprint = () => {
    setFingerprintScanning(true);
    setVerificationSuccess(null);
    
    setTimeout(() => {
      setFingerprintScanning(false);
      simulateVerification();
    }, 2000);
  };
  
  const verifyCode = () => {
    setVerifyingInput(true);
    setVerificationSuccess(null);
    
    setTimeout(() => {
      setVerifyingInput(false);
      const isCodeValid = validateCode(verificationCode);
      setVerificationSuccess(isCodeValid);
      
      if (!isCodeValid) {
        toast.error("Incorrect Code", {
          description: "The verification code entered is incorrect."
        });
      }
    }, 1000);
  };
  
  const simulateVerification = () => {
    setVerifyingInput(true);
    
    setTimeout(() => {
      setVerifyingInput(false);
      setVerificationSuccess(true);
    }, 1500);
  };

  const completeVerification = async () => {
    if (!verificationSuccess || !currentEmployeeId) return;
    
    try {
      const verificationMethod = verificationTab as 'selfie' | 'fingerprint' | 'code';
      const action = clockInMode ? 'in' : 'out';
      
      const result = await recordAttendance(currentEmployeeId, action, verificationMethod);
      
      if (result.success) {
        toast.success(clockInMode ? "Clock In Successful" : "Clock Out Successful", {
          description: result.message
        });
        setVerificationDialogOpen(false);
      } else {
        toast.error(clockInMode ? "Clock In Failed" : "Clock Out Failed", {
          description: result.message
        });
      }
    } catch (error: any) {
      console.error("Error completing verification:", error);
      toast.error("Verification Failed", {
        description: error.message || "An unexpected error occurred"
      });
    }
  };

  const filteredEmployees = employees.filter(employee =>
    employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getAttendanceBadgeColor = (status: string) => {
    switch(status) {
      case 'present': return 'bg-green-500';
      case 'late': return 'bg-amber-500';
      case 'absent': return 'bg-red-500';
      case 'holiday': return 'bg-purple-500';
      case 'leave': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
        <div className="flex items-center space-x-3">
          <div className="bg-primary rounded-full p-2">
            <Fingerprint className="h-8 w-8 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Employee Clock-In</h1>
            <p className="text-muted-foreground">Public access dashboard</p>
          </div>
        </div>
        <div className="relative w-full md:w-[300px]">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search employees..."
            className="w-full pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredEmployees.length > 0 ? (
          filteredEmployees.map(employee => {
            const attendanceRecord = getTodayAttendance(employee.id);
            return (
              <Card key={employee.id} className="overflow-hidden">
                <CardHeader className="p-0">
                  <div className="bg-muted">
                    <AspectRatio ratio={16/9}>
                      {employee.imageUrl ? (
                        <img 
                          src={employee.imageUrl} 
                          alt={employee.name} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-secondary">
                          <Avatar className="h-20 w-20">
                            <AvatarFallback className="text-2xl">
                              {getInitials(employee.name)}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                      )}
                    </AspectRatio>
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-4">
                  <div className="mb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-lg truncate">{employee.name}</h3>
                        <p className="text-sm text-muted-foreground truncate">
                          {employee.position} • {employee.department}
                        </p>
                      </div>
                      {attendanceRecord && (
                        <Badge className={getAttendanceBadgeColor(attendanceRecord.status)}>
                          {attendanceRecord.status.charAt(0).toUpperCase() + attendanceRecord.status.slice(1)}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    {attendanceRecord ? (
                      <>
                        <div className="grid grid-cols-2 text-sm">
                          <span className="text-muted-foreground">Clock in:</span>
                          <span>{attendanceRecord.timeIn || 'Not clocked in'}</span>
                          <span className="text-muted-foreground">Clock out:</span>
                          <span>{attendanceRecord.timeOut || 'Not clocked out'}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <Button 
                            disabled={!!attendanceRecord.timeIn} 
                            onClick={() => initiateClockAction(employee.id, true)}
                            className="flex items-center gap-1"
                          >
                            <LogIn className="h-4 w-4" />
                            Clock In
                          </Button>
                          <Button
                            variant="outline"
                            disabled={!attendanceRecord.timeIn || !!attendanceRecord.timeOut}
                            onClick={() => initiateClockAction(employee.id, false)}
                            className="flex items-center gap-1"
                          >
                            <LogOut className="h-4 w-4" />
                            Clock Out
                          </Button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center justify-center py-2">
                          <p className="text-sm text-muted-foreground">No attendance record</p>
                        </div>
                        <Button 
                          onClick={() => initiateClockAction(employee.id, true)} 
                          className="w-full flex items-center justify-center gap-1"
                        >
                          <LogIn className="h-4 w-4" />
                          Clock In
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center py-8">
            <div className="rounded-full bg-muted p-3 mb-3">
              <Search className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium">No employees found</h3>
            <p className="text-muted-foreground text-sm">Try adjusting your search terms</p>
          </div>
        )}
      </div>

      <Dialog open={verificationDialogOpen} onOpenChange={setVerificationDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Verify Your Identity</DialogTitle>
            <DialogDescription>
              {clockInMode ? 'Complete verification to clock in' : 'Complete verification to clock out'}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <Tabs value={verificationTab} onValueChange={setVerificationTab}>
              <TabsList className="grid grid-cols-3 w-full">
                <TabsTrigger 
                  value="selfie" 
                  className="flex items-center gap-1" 
                  disabled={!verificationRequirements.requireSelfie && (verificationRequirements.requireCode || verificationRequirements.requireFingerprint)}
                >
                  <Camera className="h-4 w-4" />
                  Selfie
                </TabsTrigger>
                <TabsTrigger 
                  value="fingerprint" 
                  className="flex items-center gap-1"
                  disabled={!verificationRequirements.requireFingerprint && (verificationRequirements.requireCode || verificationRequirements.requireSelfie)}
                >
                  <Fingerprint className="h-4 w-4" />
                  Fingerprint
                </TabsTrigger>
                <TabsTrigger 
                  value="code" 
                  className="flex items-center gap-1"
                  disabled={!verificationRequirements.requireCode && (verificationRequirements.requireSelfie || verificationRequirements.requireFingerprint)}
                >
                  <Hash className="h-4 w-4" />
                  Daily Code
                </TabsTrigger>
              </TabsList>

              <div className="mt-4 p-4 border rounded-md">
                <TabsContent value="selfie" className="space-y-4">
                  {!isCapturing && !capturedImage ? (
                    <div className="flex flex-col items-center justify-center space-y-4">
                      <div className="rounded-full bg-muted p-6">
                        <Camera className="h-10 w-10 text-muted-foreground" />
                      </div>
                      <Button onClick={startCamera}>Start Camera</Button>
                    </div>
                  ) : capturedImage ? (
                    <div className="flex flex-col items-center space-y-3">
                      <div className="relative w-full max-w-sm mx-auto">
                        <img 
                          src={capturedImage} 
                          alt="Captured selfie" 
                          className="w-full rounded-md border"
                        />
                        {verifyingInput && (
                          <div className="absolute inset-0 bg-black/30 flex items-center justify-center rounded-md">
                            <Loader2 className="h-8 w-8 text-white animate-spin" />
                          </div>
                        )}
                        {verificationSuccess === true && (
                          <div className="absolute inset-0 bg-green-500/30 flex items-center justify-center rounded-md">
                            <Check className="h-16 w-16 text-white" />
                          </div>
                        )}
                        {verificationSuccess === false && (
                          <div className="absolute inset-0 bg-red-500/30 flex items-center justify-center rounded-md">
                            <X className="h-16 w-16 text-white" />
                          </div>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          onClick={() => {
                            setCapturedImage(null);
                            setVerificationSuccess(null);
                          }}
                          disabled={verifyingInput}
                        >
                          Retake
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center space-y-3">
                      <div className="relative w-full max-w-sm mx-auto h-[240px] bg-black rounded-md overflow-hidden">
                        <video 
                          ref={videoRef} 
                          className="w-full h-full object-cover"
                          autoPlay
                        />
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" onClick={stopCamera}>Cancel</Button>
                        <Button onClick={takePicture}>Take Picture</Button>
                      </div>
                    </div>
                  )}
                  <canvas ref={canvasRef} style={{ display: 'none' }} />
                </TabsContent>

                <TabsContent value="fingerprint" className="space-y-4">
                  <div className="flex flex-col items-center justify-center space-y-4">
                    <div className={`relative rounded-full bg-muted p-8 ${fingerprintScanning ? 'animate-pulse' : ''}`}>
                      <Fingerprint className={`h-16 w-16 ${
                        verificationSuccess === true ? 'text-green-500' :
                        verificationSuccess === false ? 'text-red-500' :
                        'text-muted-foreground'
                      }`} />
                      {verifyingInput && (
                        <div className="absolute inset-0 bg-black/10 rounded-full flex items-center justify-center">
                          <Loader2 className="h-8 w-8 text-primary animate-spin" />
                        </div>
                      )}
                    </div>
                    <p className="text-center text-sm text-muted-foreground">
                      {fingerprintScanning ? 'Scanning fingerprint...' :
                       verificationSuccess === true ? 'Fingerprint verified!' :
                       verificationSuccess === false ? 'Fingerprint verification failed' :
                       'Press the button to scan your fingerprint'}
                    </p>
                    {verificationSuccess !== true && (
                      <Button 
                        onClick={simulateFingerprint} 
                        disabled={fingerprintScanning || verifyingInput}
                      >
                        {fingerprintScanning ? 
                         <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : 
                         <Fingerprint className="h-4 w-4 mr-2" />}
                        Scan Fingerprint
                      </Button>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="code" className="space-y-4">
                  <div className="flex flex-col items-center justify-center space-y-4">
                    <div className="rounded-full bg-muted p-6">
                      <Hash className="h-10 w-10 text-muted-foreground" />
                    </div>
                    <p className="text-center text-sm">
                      Enter today's verification code:
                    </p>
                    <div className="w-full max-w-xs">
                      <Input 
                        type="text"
                        placeholder="Enter 4-digit code"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                        maxLength={6}
                        className="text-center text-lg"
                      />
                    </div>
                    <div className="relative">
                      <Button 
                        onClick={verifyCode} 
                        disabled={verificationCode.length !== 6 || verifyingInput || verificationSuccess === true}
                      >
                        {verifyingInput ? 
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : 
                          <Hash className="h-4 w-4 mr-2" />}
                        Verify Code
                      </Button>
                      {verificationSuccess === true && (
                        <Check className="text-green-500 h-6 w-6 absolute -right-8 top-2" />
                      )}
                      {verificationSuccess === false && (
                        <X className="text-red-500 h-6 w-6 absolute -right-8 top-2" />
                      )}
                    </div>
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </div>

          <DialogFooter className="sm:justify-between">
            <Button 
              variant="outline" 
              onClick={() => {
                setVerificationDialogOpen(false);
                stopCamera();
              }}
            >
              Cancel
            </Button>
            <Button 
              disabled={!verificationSuccess}
              onClick={completeVerification}
            >
              {clockInMode ? 'Complete Clock In' : 'Complete Clock Out'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="mt-16 border-t pt-6 text-center">
        <div className="flex flex-col items-center justify-center space-y-2">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Company Name. All rights reserved.
          </p>
          <a 
            href="/login" 
            className="text-xs text-primary hover:underline"
          >
            Admin Login
          </a>
        </div>
      </div>
    </div>
  );
};

export default OpenClockInDashboard;
