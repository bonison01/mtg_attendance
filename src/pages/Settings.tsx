
import React, { useState } from 'react';
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

const Settings = () => {
  const { toast } = useToast();
  const [companyName, setCompanyName] = useState('BioPulse Inc.');
  const [adminEmail, setAdminEmail] = useState('admin@company.com');
  
  // Notification settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [dailyReports, setDailyReports] = useState(true);
  const [lateAlerts, setLateAlerts] = useState(true);
  
  // Attendance settings
  const [workStartTime, setWorkStartTime] = useState('09:00');
  const [workEndTime, setWorkEndTime] = useState('17:00');
  const [lateThreshold, setLateThreshold] = useState('15');
  
  const handleSaveGeneral = () => {
    toast({
      title: "Settings Saved",
      description: "Your general settings have been updated.",
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
        <TabsList className="grid grid-cols-3 max-w-md">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
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
                <Button onClick={handleSaveGeneral}>Save Changes</Button>
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
      </Tabs>
    </div>
  );
};

export default Settings;
