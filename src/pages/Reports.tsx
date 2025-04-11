
import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, LineChart, Line 
} from 'recharts';
import { 
  Download, FileBarChart, FileText, FileClock, RefreshCw, 
  Calendar, Clock, AlertCircle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { subscribeToAttendanceChanges } from '@/services/realtimeService';
import { useToast } from "@/components/ui/use-toast";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { calculateSalaryDeduction, getEmployeeSchedule } from '@/services/codeService';

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
  const [monthlyReportData, setMonthlyReportData] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [selectedReport, setSelectedReport] = useState('attendance');
  const [downloadingReport, setDownloadingReport] = useState(false);
  
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
    fetchMonthlyReportData(selectedMonth);

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
        
        // Refresh appropriate data based on what changed
        fetchAttendanceData();
        fetchDepartmentData();
        fetchMonthlyReportData(selectedMonth);
      }
    });
    
    // Clean up the subscription when component unmounts
    return () => {
      if (channel) {
        channel.unsubscribe();
      }
    };
  }, []);

  // Effect to fetch new data when month changes
  useEffect(() => {
    fetchMonthlyReportData(selectedMonth);
  }, [selectedMonth]);

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
      // For now, we'll use our mock data with some random variation
      const updatedData = departmentData.map(dept => ({
        ...dept,
        attendance: Math.min(100, Math.max(85, dept.attendance + (Math.random() * 6 - 3)))
      }));
      
      setDepartmentData(updatedData);
    } catch (error) {
      console.error('Error fetching department data:', error);
    }
  };
  
  // Fetch monthly report data
  const fetchMonthlyReportData = async (month) => {
    try {
      setLoading(true);
      
      // In a real implementation, we would fetch from Supabase
      // For demonstration, we'll generate mock data
      const [year, monthNum] = month.split('-').map(Number);
      const daysInMonth = new Date(year, monthNum, 0).getDate();
      
      // Generate attendance data for each day of the month
      const mockData = [];
      for (let day = 1; day <= daysInMonth; day++) {
        const date = `${year}-${String(monthNum).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const isWeekend = new Date(date).getDay() === 0 || new Date(date).getDay() === 6;
        
        // Add some variation for demonstration
        const presentCount = isWeekend ? Math.floor(Math.random() * 10) : 35 + Math.floor(Math.random() * 15);
        const lateCount = isWeekend ? Math.floor(Math.random() * 3) : 2 + Math.floor(Math.random() * 8);
        const absentCount = isWeekend ? 50 - presentCount - lateCount : 5 + Math.floor(Math.random() * 5);
        const leaveCount = Math.floor(Math.random() * 3);
        
        mockData.push({
          date,
          day: String(day).padStart(2, '0'),
          present: presentCount,
          late: lateCount,
          absent: absentCount,
          leave: leaveCount,
          total: presentCount + lateCount + absentCount + leaveCount,
          deductions: (lateCount * 250) + (absentCount * 500)
        });
      }
      
      setMonthlyReportData(mockData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching monthly report data:', error);
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchAttendanceData();
    fetchDepartmentData();
    fetchMonthlyReportData(selectedMonth);
    toast({
      title: "Data Refreshed",
      description: "Report data has been updated with the latest information."
    });
  };
  
  // Generate and download report
  const handleDownloadReport = async (reportType) => {
    try {
      setDownloadingReport(true);
      toast({
        title: "Generating Report",
        description: "Please wait while we generate your report..."
      });
      
      // Simulate report generation delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      let filename = '';
      let csvContent = '';
      
      if (reportType === 'monthly') {
        // Format filename with the selected month
        filename = `monthly_attendance_report_${selectedMonth}.csv`;
        
        // Create CSV header
        csvContent = 'Date,Present,Late,Absent,Leave,Total,Deductions (Rs)\n';
        
        // Add data rows
        monthlyReportData.forEach(day => {
          csvContent += `${day.date},${day.present},${day.late},${day.absent},${day.leave},${day.total},${day.deductions}\n`;
        });
      } else if (reportType === 'salary') {
        // Format filename with the selected month
        filename = `salary_deductions_report_${selectedMonth}.csv`;
        
        // Create CSV header
        csvContent = 'Employee ID,Employee Name,Department,Total Days Late,Total Days Absent,Late Deductions (Rs),Absence Deductions (Rs),Total Deductions (Rs)\n';
        
        // Generate mock employee salary deductions
        const employees = [
          { id: '001', name: 'John Smith', department: 'Engineering' },
          { id: '002', name: 'Emma Johnson', department: 'Design' },
          { id: '003', name: 'Michael Brown', department: 'Marketing' },
          { id: '004', name: 'Sophia Wilson', department: 'HR' },
          { id: '005', name: 'James Davis', department: 'Product' }
        ];
        
        employees.forEach(emp => {
          const daysLate = Math.floor(Math.random() * 6); // 0-5 days late
          const daysAbsent = Math.floor(Math.random() * 3); // 0-2 days absent
          const lateDeductions = daysLate * 250;
          const absenceDeductions = daysAbsent * 500;
          const totalDeductions = lateDeductions + absenceDeductions;
          
          csvContent += `${emp.id},${emp.name},${emp.department},${daysLate},${daysAbsent},${lateDeductions},${absenceDeductions},${totalDeductions}\n`;
        });
      } else {
        // Format filename with current date for daily or weekly reports
        const today = new Date();
        const dateStr = today.toISOString().split('T')[0];
        filename = `${reportType}_attendance_report_${dateStr}.csv`;
        
        // Create CSV header and data based on report type
        if (reportType === 'daily') {
          csvContent = 'Employee ID,Employee Name,Department,Clock In,Clock Out,Status,Late Deduction (Rs)\n';
          
          // Mock data
          const mockEmployees = [
            { id: '001', name: 'John Smith', dept: 'Engineering', clockIn: '09:15', clockOut: '18:05', status: 'present', deduction: 0 },
            { id: '002', name: 'Emma Johnson', dept: 'Design', clockIn: '09:30', clockOut: '18:00', status: 'late', deduction: 250 },
            { id: '003', name: 'Michael Brown', dept: 'Marketing', clockIn: '08:55', clockOut: '17:45', status: 'present', deduction: 0 },
            { id: '004', name: 'Sophia Wilson', dept: 'HR', clockIn: '', clockOut: '', status: 'absent', deduction: 500 },
            { id: '005', name: 'James Davis', dept: 'Product', clockIn: '09:05', clockOut: '18:10', status: 'present', deduction: 0 }
          ];
          
          mockEmployees.forEach(emp => {
            csvContent += `${emp.id},${emp.name},${emp.dept},${emp.clockIn},${emp.clockOut},${emp.status},${emp.deduction}\n`;
          });
        } else if (reportType === 'weekly') {
          csvContent = 'Day,Present,Late,Absent,Leave,Total\n';
          
          weeklyData.forEach(day => {
            const total = day.present + day.late + day.absent + day.leave;
            csvContent += `${day.day},${day.present},${day.late},${day.absent},${day.leave},${total}\n`;
          });
        }
      }
      
      // Create and trigger download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Report Downloaded",
        description: `Your ${reportType} report has been downloaded successfully.`
      });
    } catch (error) {
      console.error('Error downloading report:', error);
      toast({
        variant: 'destructive',
        title: "Download Failed",
        description: "There was an error generating your report. Please try again."
      });
    } finally {
      setDownloadingReport(false);
    }
  };
  
  // Available months for selection (past 12 months)
  const getAvailableMonths = () => {
    const months = [];
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    
    for (let i = 0; i < 12; i++) {
      let month = currentMonth - i;
      let year = currentYear;
      
      if (month < 0) {
        month += 12;
        year -= 1;
      }
      
      const monthStr = `${year}-${String(month + 1).padStart(2, '0')}`;
      const monthName = new Date(year, month, 1).toLocaleString('default', { month: 'long' });
      months.push({ value: monthStr, label: `${monthName} ${year}` });
    }
    
    return months;
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
          <TabsTrigger value="monthly">Monthly Reports</TabsTrigger>
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
        
        <TabsContent value="monthly">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Attendance Report</CardTitle>
              <CardDescription>
                View and download detailed monthly attendance reports with salary deductions
              </CardDescription>
              <div className="flex flex-col sm:flex-row gap-4 mt-4">
                <div className="w-full sm:w-64">
                  <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select month" />
                    </SelectTrigger>
                    <SelectContent>
                      {getAvailableMonths().map((month) => (
                        <SelectItem key={month.value} value={month.value}>
                          {month.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-full sm:w-64">
                  <Select value={selectedReport} onValueChange={setSelectedReport}>
                    <SelectTrigger>
                      <SelectValue placeholder="Report type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="attendance">Attendance Report</SelectItem>
                      <SelectItem value="deductions">Salary Deductions</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  {selectedReport === 'attendance' ? (
                    <BarChart
                      data={monthlyReportData}
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
                  ) : (
                    <LineChart
                      data={monthlyReportData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="deductions" stroke="#ef4444" name="Salary Deductions (Rs)" />
                    </LineChart>
                  )}
                </ResponsiveContainer>
              </div>
              
              <div className="mt-6">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Present</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Late</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Absent</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Leave</th>
                        {selectedReport === 'deductions' && (
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deductions (Rs)</th>
                        )}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {monthlyReportData.slice(0, 7).map((day) => (
                        <tr key={day.date}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{day.date}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{day.present}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{day.late}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{day.absent}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{day.leave}</td>
                          {selectedReport === 'deductions' && (
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">{day.deductions}</td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="text-sm text-gray-500 mt-2">Showing first 7 days. Download the report for complete data.</p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-4">
              <Button 
                variant="outline" 
                onClick={() => handleDownloadReport('monthly')}
                disabled={downloadingReport}
              >
                <Download className="h-4 w-4 mr-2" />
                Download Attendance Report
              </Button>
              <Button 
                onClick={() => handleDownloadReport('salary')}
                disabled={downloadingReport}
              >
                <Download className="h-4 w-4 mr-2" />
                Download Salary Deductions
              </Button>
            </CardFooter>
          </Card>
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
                  <Button 
                    className="w-full gap-2"
                    onClick={() => handleDownloadReport(report.id)}
                    disabled={downloadingReport}
                  >
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
