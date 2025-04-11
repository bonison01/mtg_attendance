
import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Download, FileBarChart, FileText, FileClock, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { subscribeToAttendanceChanges } from '@/services/realtimeService';
import { useToast } from "@/components/ui/use-toast";

const Reports = () => {
  const [weeklyData, setWeeklyData] = useState([
    { day: 'Monday', present: 42, late: 5, absent: 3, leave: 2 },
    { day: 'Tuesday', present: 45, late: 3, absent: 2, leave: 2 },
    { day: 'Wednesday', present: 40, late: 7, absent: 4, leave: 1 },
    { day: 'Thursday', present: 44, late: 4, absent: 2, leave: 2 },
    { day: 'Friday', present: 38, late: 6, absent: 5, leave: 3 },
  ]);
  
  const [departmentData, setDepartmentData] = useState([
    { department: 'Engineering', attendance: 96 },
    { department: 'Product', attendance: 94 },
    { department: 'Design', attendance: 98 },
    { department: 'Marketing', attendance: 92 },
    { department: 'HR', attendance: 97 },
  ]);

  const [realtimeStats, setRealtimeStats] = useState({
    present: 0,
    late: 0,
    absent: 0,
    leave: 0
  });

  const [lastRefreshed, setLastRefreshed] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  
  const reportTypes = [
    {
      id: 'daily',
      name: 'Daily Attendance Report',
      description: 'Summary of employee attendance for a specific day',
      icon: FileClock,
    },
    {
      id: 'weekly',
      name: 'Weekly Attendance Report',
      description: 'Weekly attendance patterns and trends',
      icon: FileBarChart,
    },
    {
      id: 'monthly',
      name: 'Monthly Summary Report',
      description: 'Monthly attendance statistics and analysis',
      icon: FileText,
    },
  ];

  // Load initial data and set up real-time subscriptions
  useEffect(() => {
    fetchAttendanceData();
    fetchDepartmentData();

    // Set up real-time attendance updates
    const channel = subscribeToAttendanceChanges((payload) => {
      if (payload.new) {
        // Update attendance stats in real-time
        setRealtimeStats(prev => {
          const newStats = { ...prev };
          
          if (payload.eventType === 'INSERT') {
            // Increment the appropriate stat counter
            newStats[payload.new.status] = (newStats[payload.new.status] || 0) + 1;
          } else if (payload.eventType === 'UPDATE' && payload.old.status !== payload.new.status) {
            // Decrement old status and increment new status
            newStats[payload.old.status] = Math.max(0, (newStats[payload.old.status] || 0) - 1);
            newStats[payload.new.status] = (newStats[payload.new.status] || 0) + 1;
          }
          
          return newStats;
        });
        
        // Update the last refreshed timestamp
        setLastRefreshed(new Date());
      }
    });
    
    // Clean up the subscription when component unmounts
    return () => {
      if (channel) {
        channel.unsubscribe();
      }
    };
  }, []);

  // Fetch attendance data from Supabase
  const fetchAttendanceData = async () => {
    setLoading(true);
    try {
      // In a real implementation, this would fetch data from Supabase
      // For now, we'll simulate an API delay
      setTimeout(() => {
        // Update with some simulated real data
        const today = new Date();
        const dayOfWeek = today.getDay();
        
        // Update today's data with the real-time stats
        const updatedWeeklyData = [...weeklyData];
        if (dayOfWeek >= 1 && dayOfWeek <= 5) {
          updatedWeeklyData[dayOfWeek - 1] = {
            day: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'][dayOfWeek - 1],
            present: realtimeStats.present || updatedWeeklyData[dayOfWeek - 1].present,
            late: realtimeStats.late || updatedWeeklyData[dayOfWeek - 1].late,
            absent: realtimeStats.absent || updatedWeeklyData[dayOfWeek - 1].absent,
            leave: realtimeStats.leave || updatedWeeklyData[dayOfWeek - 1].leave
          };
        }
        
        setWeeklyData(updatedWeeklyData);
        setLoading(false);
        setLastRefreshed(new Date());
      }, 1000);
    } catch (error) {
      console.error('Error fetching attendance data:', error);
      setLoading(false);
    }
  };

  // Fetch department data from Supabase
  const fetchDepartmentData = async () => {
    try {
      // In a real implementation, this would fetch from Supabase
      // For now, we'll use our mock data
      // No implementation needed for the demo
    } catch (error) {
      console.error('Error fetching department data:', error);
    }
  };

  const handleRefresh = () => {
    fetchAttendanceData();
    fetchDepartmentData();
    toast({
      title: "Data Refreshed",
      description: "Report data has been updated with the latest information."
    });
  };
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Attendance Reports</h1>
        <div className="flex items-center gap-2">
          <p className="text-sm text-muted-foreground">
            Last updated: {lastRefreshed.toLocaleTimeString()}
          </p>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-1"
            onClick={handleRefresh}
            disabled={loading}
          >
            <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="generate">Generate Reports</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <div className="grid gap-6">
            <Card>
              <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <CardTitle>Weekly Attendance Trend</CardTitle>
                  <CardDescription>
                    Attendance statistics for the current week
                  </CardDescription>
                </div>
                <div className="bg-blue-50 px-3 py-1 rounded-full text-xs font-medium text-blue-700 mt-2 md:mt-0">
                  Live Data
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={weeklyData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="present" stackId="a" fill="#10b981" name="Present" />
                      <Bar dataKey="late" stackId="a" fill="#f59e0b" name="Late" />
                      <Bar dataKey="absent" stackId="a" fill="#ef4444" name="Absent" />
                      <Bar dataKey="leave" stackId="a" fill="#3b82f6" name="Leave" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <CardTitle>Department Attendance Rate</CardTitle>
                  <CardDescription>
                    Average attendance rate by department (%)
                  </CardDescription>
                </div>
                <div className="bg-blue-50 px-3 py-1 rounded-full text-xs font-medium text-blue-700 mt-2 md:mt-0">
                  Live Data
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={departmentData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="department" />
                      <YAxis domain={[80, 100]} />
                      <Tooltip />
                      <Bar dataKey="attendance" fill="#1e3a8a" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="generate">
          <div className="grid gap-6 md:grid-cols-3">
            {reportTypes.map((report) => (
              <Card key={report.id} className="flex flex-col">
                <CardHeader>
                  <report.icon className="h-8 w-8 mb-2 text-brand-800" />
                  <CardTitle>{report.name}</CardTitle>
                  <CardDescription>{report.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="text-sm">
                    <p className="mb-4">
                      Generate a comprehensive {report.name.toLowerCase()} with detailed metrics
                      and visual analytics.
                    </p>
                    <p className="text-muted-foreground">
                      Available formats: PDF, Excel, CSV
                    </p>
                  </div>
                </CardContent>
                <div className="p-6 pt-0 mt-auto">
                  <Button className="w-full gap-2">
                    <Download className="h-4 w-4" />
                    Generate Report
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Reports;
