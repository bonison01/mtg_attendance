
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAttendance } from '@/contexts/AttendanceContext';
import { Fingerprint, UserPlus, Check } from 'lucide-react';

const EmployeeRegistration = () => {
  const navigate = useNavigate();
  const { addEmployee, registerFingerprint } = useAttendance();
  const [currentStep, setCurrentStep] = useState<'details' | 'fingerprint'>('details');
  const [enrollmentStage, setEnrollmentStage] = useState(0);
  const [isEnrolling, setIsEnrolling] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    position: '',
    department: '',
    email: '',
    phoneNumber: '',
    imageUrl: '',
  });
  
  const departments = ['Engineering', 'Product', 'Design', 'Marketing', 'Human Resources', 'Finance', 'Operations'];
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  
  const handleSelectChange = (field: string) => (value: string) => {
    setFormData({ ...formData, [field]: value });
  };
  
  const handleDetailsSubmit = () => {
    setCurrentStep('fingerprint');
  };
  
  const handleFingerprintEnroll = () => {
    setIsEnrolling(true);
    
    // Simulate fingerprint enrollment process
    setTimeout(() => {
      setEnrollmentStage(1);
      setTimeout(() => {
        setEnrollmentStage(2);
        setTimeout(() => {
          setEnrollmentStage(3);
          setIsEnrolling(false);
          
          // Create a unique fingerprint ID (in a real app, this would be secure biometric data)
          const fingerprintId = `fp_${Date.now()}`;
          
          // Register the new employee with fingerprint
          const newEmployee = {
            ...formData,
            joinDate: new Date().toISOString().split('T')[0],
            fingerprint: fingerprintId
          };
          
          addEmployee(newEmployee);
          
          // Navigate to employees page after successful registration
          setTimeout(() => navigate('/employees'), 1500);
        }, 2000);
      }, 2000);
    }, 2000);
  };
  
  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Register New Employee</h1>
      
      <Tabs 
        defaultValue={currentStep} 
        value={currentStep} 
        className="space-y-4"
        onValueChange={(value) => setCurrentStep(value as 'details' | 'fingerprint')}
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="details" disabled={currentStep === 'fingerprint'}>
            1. Employee Details
          </TabsTrigger>
          <TabsTrigger value="fingerprint" disabled={currentStep === 'details'}>
            2. Fingerprint Enrollment
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>
                Enter the details of the new employee
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="John Doe"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="john.doe@company.com"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <Input
                    id="phoneNumber"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    placeholder="(555) 123-4567"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="position">Position</Label>
                  <Input
                    id="position"
                    name="position"
                    value={formData.position}
                    onChange={handleChange}
                    placeholder="Software Engineer"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Select
                    value={formData.department}
                    onValueChange={handleSelectChange('department')}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept} value={dept}>
                          {dept}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="imageUrl">Profile Image URL (Optional)</Label>
                  <Input
                    id="imageUrl"
                    name="imageUrl"
                    value={formData.imageUrl}
                    onChange={handleChange}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                className="ml-auto" 
                onClick={handleDetailsSubmit}
                disabled={!formData.name || !formData.position || !formData.department || !formData.email}
              >
                Next: Fingerprint Enrollment
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="fingerprint">
          <Card>
            <CardHeader>
              <CardTitle>Fingerprint Enrollment</CardTitle>
              <CardDescription>
                Register employee's fingerprint for attendance tracking
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center py-8">
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold mb-2">{formData.name}</h3>
                <p className="text-muted-foreground">{formData.position} • {formData.department}</p>
              </div>
              
              <div className="my-6 relative">
                <div className={`fingerprint-scanner ${isEnrolling ? 'animate-pulse' : ''}`}>
                  <Fingerprint className="fingerprint-image text-white" />
                </div>
                
                {enrollmentStage > 0 && (
                  <div className="absolute -right-2 -top-2 bg-green-500 text-white rounded-full p-1">
                    <Check className="h-4 w-4" />
                  </div>
                )}
              </div>
              
              <div className="w-full max-w-xs">
                <div className="text-center mb-6">
                  {enrollmentStage === 0 && !isEnrolling && (
                    <p>Click start to begin fingerprint enrollment</p>
                  )}
                  
                  {isEnrolling && enrollmentStage === 0 && (
                    <p className="animate-pulse">Place finger on the scanner</p>
                  )}
                  
                  {enrollmentStage === 1 && (
                    <p className="animate-pulse">Scanning... keep finger on scanner</p>
                  )}
                  
                  {enrollmentStage === 2 && (
                    <p className="animate-pulse">Processing...</p>
                  )}
                  
                  {enrollmentStage === 3 && (
                    <p className="text-green-600 font-medium">Enrollment successful!</p>
                  )}
                </div>
                
                <progress 
                  className="w-full [&::-webkit-progress-bar]:rounded-full [&::-webkit-progress-value]:rounded-full [&::-webkit-progress-bar]:bg-secondary [&::-webkit-progress-value]:bg-primary h-2"
                  value={enrollmentStage * 33.3} 
                  max="100"
                ></progress>
                
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>Start</span>
                  <span>Processing</span>
                  <span>Complete</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button 
                variant="outline" 
                onClick={() => setCurrentStep('details')}
                disabled={isEnrolling || enrollmentStage > 0}
              >
                Back
              </Button>
              {enrollmentStage < 3 ? (
                <Button 
                  onClick={handleFingerprintEnroll}
                  disabled={isEnrolling}
                  className="gap-2"
                >
                  <UserPlus className="h-4 w-4" />
                  {enrollmentStage === 0 ? 'Start Enrollment' : 'Retry'}
                </Button>
              ) : (
                <Button 
                  onClick={() => navigate('/employees')}
                  className="gap-2"
                >
                  <Check className="h-4 w-4" />
                  Complete Registration
                </Button>
              )}
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EmployeeRegistration;
