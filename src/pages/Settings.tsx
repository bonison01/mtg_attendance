
import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { Copy, RefreshCcw } from "lucide-react";
import { getDailyCode } from '@/utils/codeGenerator';
import { subscribeToAttendanceChanges } from '@/services/realtimeService';
import { supabase } from '@/integrations/supabase/client';
import { fetchCompanySettings, updateCompanySettings } from '@/services/companySettingsService';

const Settings = () => {
  const { toast } = useToast();
  const [companyName, setCompanyName] = useState('BioPulse Inc.');
  const [brandColor, setBrandColor] = useState('#1e3a8a');
  const [adminEmail, setAdminEmail] = useState('admin@company.com');
  const [verificationCode, setVerificationCode] = useState('');
  const [realtimeAttendance, setRealtimeAttendance] = useState(0);
  
  // Notification settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [dailyReports, setDailyReports] = useState(true);
  const [lateAlerts, setLateAlerts] = useState(true);
  
  // Attendance settings
  const [workStartTime, setWorkStartTime] = useState('09:00');
  const [workEndTime, setWorkEndTime] = useState('17:00');
  const [lateThreshold, setLateThreshold] = useState('15');
  
  // Company settings persistence
  const [isSavingCompany, setIsSavingCompany] = useState(false);

  // Initialize verification code on component mount
  useEffect(() => {
    const code = getDailyCode();
    setVerificationCode(code);
    
    // Set up realtime attendance tracking
    const channel = subscribeToAttendanceChanges((payload) => {
      // Update attendance count in real-time
      const today = new Date().toISOString().split('T')[0];
      if (payload.new && payload.new.date === today) {
        setRealtimeAttendance(prev => {
          // If it's a new record, increment the count
          if (payload.eventType === 'INSERT') {
            return prev + 1;
          }
          return prev;
        });
      }
    });
    
    // Load company settings from database
    const loadCompanySettings = async () => {
      const settings = await fetchCompanySettings();
      if (settings) {
        setCompanyName(settings.company_name);
        setBrandColor(settings.brand_color);
        
        // Store in localStorage as a fallback
        localStorage.setItem('companyName', settings.company_name);
        localStorage.setItem('brandColor', settings.brand_color);
      }
    };
    
    loadCompanySettings();
    
    // Count today's attendance records
    const fetchTodayAttendance = async () => {
      const today = new Date().toISOString().split('T')[0];
      const { count, error } = await supabase
        .from('attendance_records')
        .select('*', { count: 'exact', head: true })
        .eq('date', today);
        
      if (!error && count !== null) {
        setRealtimeAttendance(count);
      }
    };
    
    fetchTodayAttendance();
    
    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, []);
  
  const handleCopyCode = () => {
    navigator.clipboard.writeText(verificationCode);
    toast({
      title: "Code Copied",
      description: "Verification code has been copied to clipboard.",
    });
  };
  
  const handleRefreshCode = () => {
    const code = getDailyCode();
    setVerificationCode(code);
    toast({
      title: "Code Refreshed",
      description: "Verification code has been refreshed.",
    });
  };
  
  const handleSaveGeneral = async () => {
    // Save to database
    setIsSavingCompany(true);
    
    const result = await updateCompanySettings({
      company_name: companyName,
      brand_color: brandColor
    });
    
    // Also save company name to local storage for immediate UI updates
    localStorage.setItem('companyName', companyName);
    localStorage.setItem('brandColor', brandColor);
    
    setIsSavingCompany(false);
    
    toast({
      title: result.success ? "Settings Saved" : "Error",
      description: result.message,
    });
  };
  
  const handleSaveNotifications = () => {
    toast({
      title: "Notification Settings Saved",
      description: "Your notification preferences have been updated.",
    });
  };
  
  const handleSaveAttendance = () => {
    toast({
      title: "Attendance Settings Saved",
      description: "Your attendance rules have been updated.",
    });
  };
  
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Settings</h1>
      
      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid grid-cols-4 max-w-md">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="verification">Verification</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>Company Information</CardTitle>
              <CardDescription>
                Update your company details and administrator settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input
                    id="companyName"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="brandColor">Brand Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="brandColor"
                      value={brandColor}
                      onChange={(e) => setBrandColor(e.target.value)}
                    />
                    <div 
                      className="h-10 w-10 border rounded-md" 
                      style={{ backgroundColor: brandColor }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Enter a color in hex format (e.g., #006400 for dark green)
                  </p>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="adminEmail">Administrator Email</Label>
                  <Input
                    id="adminEmail"
                    type="email"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="password">Update Password</Label>
                  <Input id="password" type="password" placeholder="••••••••" />
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button 
                  onClick={handleSaveGeneral} 
                  disabled={isSavingCompany}
                >
                  {isSavingCompany ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Configure how and when you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive attendance updates via email
                    </p>
                  </div>
                  <Switch
                    checked={emailNotifications}
                    onCheckedChange={setEmailNotifications}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Daily Reports</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive a daily attendance summary report
                    </p>
                  </div>
                  <Switch
                    checked={dailyReports}
                    onCheckedChange={setDailyReports}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Late Employee Alerts</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified when employees are late
                    </p>
                  </div>
                  <Switch
                    checked={lateAlerts}
                    onCheckedChange={setLateAlerts}
                  />
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button onClick={handleSaveNotifications}>Save Preferences</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="attendance">
          <Card>
            <CardHeader>
              <CardTitle>Attendance Rules</CardTitle>
              <CardDescription>
                Configure your organization's attendance policies
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="workStartTime">Work Start Time</Label>
                    <Input
                      id="workStartTime"
                      type="time"
                      value={workStartTime}
                      onChange={(e) => setWorkStartTime(e.target.value)}
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="workEndTime">Work End Time</Label>
                    <Input
                      id="workEndTime"
                      type="time"
                      value={workEndTime}
                      onChange={(e) => setWorkEndTime(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="lateThreshold">
                    Late Threshold (minutes after start time)
                  </Label>
                  <Input
                    id="lateThreshold"
                    type="number"
                    min="0"
                    value={lateThreshold}
                    onChange={(e) => setLateThreshold(e.target.value)}
                  />
                </div>
                
                <div className="flex items-center space-x-2 pt-2">
                  <Switch id="weekend" />
                  <Label htmlFor="weekend">Count weekends as working days</Label>
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button onClick={handleSaveAttendance}>Save Rules</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="verification">
          <Card>
            <CardHeader>
              <CardTitle>Daily Verification Code</CardTitle>
              <CardDescription>
                This code changes daily and is required for employee clock in/out
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-gray-100 p-6 rounded-lg text-center">
                <p className="text-sm text-muted-foreground mb-2">Today's Verification Code</p>
                <div className="text-3xl font-mono font-bold tracking-wider mb-4">
                  {verificationCode}
                </div>
                <p className="text-xs text-muted-foreground mb-4">
                  This code will automatically change at midnight
                </p>
                <div className="flex justify-center space-x-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyCode}
                    className="flex items-center gap-2"
                  >
                    <Copy className="h-4 w-4" />
                    Copy Code
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRefreshCode}
                    className="flex items-center gap-2"
                  >
                    <RefreshCcw className="h-4 w-4" />
                    Refresh
                  </Button>
                </div>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-start">
                  <div className="bg-blue-100 rounded-full p-1 mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600">
                      <path d="M12 16v-4"></path>
                      <path d="M12 8h.01"></path>
                      <circle cx="12" cy="12" r="10"></circle>
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-blue-800">Attendance Status</h4>
                    <p className="text-xs text-blue-600 mt-1">
                      {realtimeAttendance} employees have clocked in today
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
