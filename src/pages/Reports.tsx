
import React from 'react';
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
import { Download, FileBarChart, FileText, FileClock } from 'lucide-react';

const Reports = () => {
  // Sample report data
  const weeklyData = [
    { day: 'Monday', present: 42, late: 5, absent: 3, leave: 2 },
    { day: 'Tuesday', present: 45, late: 3, absent: 2, leave: 2 },
    { day: 'Wednesday', present: 40, late: 7, absent: 4, leave: 1 },
    { day: 'Thursday', present: 44, late: 4, absent: 2, leave: 2 },
    { day: 'Friday', present: 38, late: 6, absent: 5, leave: 3 },
  ];
  
  const departmentData = [
    { department: 'Engineering', attendance: 96 },
    { department: 'Product', attendance: 94 },
    { department: 'Design', attendance: 98 },
    { department: 'Marketing', attendance: 92 },
    { department: 'HR', attendance: 97 },
  ];
  
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
  
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Attendance Reports</h1>
      
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="generate">Generate Reports</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Weekly Attendance Trend</CardTitle>
                <CardDescription>
                  Attendance statistics for the current week
                </CardDescription>
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
              <CardHeader>
                <CardTitle>Department Attendance Rate</CardTitle>
                <CardDescription>
                  Average attendance rate by department (%)
                </CardDescription>
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
