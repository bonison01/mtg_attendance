
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
import { subscribeToAttendanceChanges, getCurrentDayAttendanceStats } from '@/services/realtimeService';
import { useToast } from "@/components/ui/use-toast";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { calculateSalaryDeduction, getEmployeeSchedule } from '@/services/codeService';
import { AttendanceRecord } from '@/lib/types';

const Reports = () => {
  const [weeklyData, setWeeklyData] = useState([
    { day: 'Monday', present: 0, late: 0, absent: 0, leave: 0, holiday: 0 },
    { day: 'Tuesday', present: 0, late: 0, absent: 0, leave: 0, holiday: 0 },
    { day: 'Wednesday', present: 0, late: 0, absent: 0, leave: 0, holiday: 0 },
    { day: 'Thursday', present: 0, late: 0, absent: 0, leave: 0, holiday: 0 },
    { day: 'Friday', present: 0, late: 0, absent: 0, leave: 0, holiday: 0 },
  ]);
  
  const [departmentData, setDepartmentData] = useState([]);
  const [realtimeStats, setRealtimeStats] = useState({
    present: 0,
    late: 0,
    absent: 0,
    leave: 0,
    holiday: 0
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

    // Get real-time stats for today initially
    getCurrentDayAttendanceStats().then(stats => {
      setRealtimeStats(stats);
    });

    // Set up real-time attendance updates
    const channel = subscribeToAttendanceChanges((payload) => {
      if (payload.new) {
        // Update the stats/data when attendance changes
        getCurrentDayAttendanceStats().then(stats => {
          setRealtimeStats(stats);
        });
        
        // Update the last refreshed timestamp
        setLastRefreshed(new Date());
        
        // Refresh appropriate data based on what changed
        fetchAttendanceData();
        if (payload.new.date && payload.new.date.startsWith(selectedMonth)) {
          fetchMonthlyReportData(selectedMonth);
        }
      }
    });
    
    // Clean up the subscription when component unmounts
    return () => {
      if (channel) {
        supabase.removeChannel(channel);
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
      // Get start and end dates for the current week
      const now = new Date();
      const day = now.getDay(); // 0 is Sunday, 1 is Monday, etc.
      const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
      const monday = new Date(now.setDate(diff));
      const weekStart = monday.toISOString().split('T')[0];
      
      const weekEnd = new Date(monday);
      weekEnd.setDate(monday.getDate() + 4); // Friday
      const weekEndStr = weekEnd.toISOString().split('T')[0];
      
      // Get attendance records for the current week
      const { data: records, error } = await supabase
        .from('attendance_records')
        .select('*')
        .gte('date', weekStart)
        .lte('date', weekEndStr);
        
      if (error) {
        console.error("Error fetching weekly attendance data:", error);
        setLoading(false);
        return;
      }
      
      // Get total employee count
      const { count: totalEmployees, error: countError } = await supabase
        .from('employees')
        .select('*', { count: 'exact', head: true });
        
      if (countError) {
        console.error("Error fetching employee count:", countError);
      }
      
      // Process records by day of week
      const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
      const weeklyStats = daysOfWeek.map((day, index) => {
        const date = new Date(monday);
        date.setDate(monday.getDate() + index);
        const dateStr = date.toISOString().split('T')[0];
        
        // Filter records for this day
        const dayRecords = records?.filter(record => record.date === dateStr) || [];
        
        // Count by status
        const present = dayRecords.filter(record => record.status === 'present').length;
        const late = dayRecords.filter(record => record.status === 'late').length;
        const leave = dayRecords.filter(record => record.status === 'leave').length;
        const holiday = dayRecords.filter(record => record.status === 'holiday').length;
        
        // Calculate absent (total employees minus those accounted for)
        const absent = totalEmployees ? totalEmployees - (present + late + leave + holiday) : 0;
        
        return {
          day,
          present,
          late,
          absent: absent > 0 ? absent : 0,
          leave,
          holiday
        };
      });
      
      setWeeklyData(weeklyStats);
      setLoading(false);
      setLastRefreshed(new Date());
    } catch (error) {
      console.error('Error in fetchAttendanceData:', error);
      setLoading(false);
    }
  };

  // Fetch department data from Supabase
  const fetchDepartmentData = async () => {
    try {
      // Get all unique departments
      const { data: employeesData, error: deptError } = await supabase
        .from('employees')
        .select('department');
        
      if (deptError) {
        console.error("Error fetching departments:", deptError);
        return;
      }
      
      // Get unique departments
      const departments = [...new Set(employeesData.map(emp => emp.department))];
      
      // For each department, calculate attendance rate
      const departmentStats = [];
      for (const dept of departments) {
        // Get employees in this department
        const { data: deptEmployees, error: empError } = await supabase
          .from('employees')
          .select('id')
          .eq('department', dept);
          
        if (empError) {
          console.error(`Error fetching employees for ${dept}:`, empError);
          continue;
        }
        
        const employeeIds = deptEmployees.map(emp => emp.id);
        const totalInDept = employeeIds.length;
        
        if (totalInDept === 0) continue;
        
        // Get today's date
        const today = new Date().toISOString().split('T')[0];
        
        // Get attendance for today for this department
        const { data: attendance, error: attError } = await supabase
          .from('attendance_records')
          .select('*')
          .eq('date', today)
          .in('employee_id', employeeIds);
          
        if (attError) {
          console.error(`Error fetching attendance for ${dept}:`, attError);
          continue;
        }
        
        // Count present and late (both considered "attended")
        const attended = attendance?.filter(record => 
          record.status === 'present' || record.status === 'late'
        ).length || 0;
        
        // Calculate attendance rate
        const attendanceRate = totalInDept > 0 ? (attended / totalInDept) * 100 : 0;
        
        departmentStats.push({
          department: dept,
          attendance: Math.round(attendanceRate)
        });
      }
      
      setDepartmentData(departmentStats);
    } catch (error) {
      console.error('Error in fetchDepartmentData:', error);
    }
  };
  
  // Fetch monthly report data
  const fetchMonthlyReportData = async (month) => {
    try {
      setLoading(true);
      
      const [year, monthNum] = month.split('-').map(Number);
      const daysInMonth = new Date(year, monthNum, 0).getDate();
      
      // Get total number of employees
      const { count: totalEmployees, error: countError } = await supabase
        .from('employees')
        .select('*', { count: 'exact', head: true });
        
      if (countError) {
        console.error("Error fetching employee count:", countError);
        setLoading(false);
        return;
      }
      
      // Fetch attendance records for the entire month
      const monthStart = `${year}-${String(monthNum).padStart(2, '0')}-01`;
      const monthEnd = `${year}-${String(monthNum).padStart(2, '0')}-${String(daysInMonth).padStart(2, '0')}`;
      
      const { data: records, error: recError } = await supabase
        .from('attendance_records')
        .select('*')
        .gte('date', monthStart)
        .lte('date', monthEnd);
        
      if (recError) {
        console.error("Error fetching monthly attendance records:", recError);
        setLoading(false);
        return;
      }
      
      // Process records by day
      const monthlyData = [];
      for (let day = 1; day <= daysInMonth; day++) {
        const date = `${year}-${String(monthNum).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        
        // Filter records for this day
        const dayRecords = records?.filter(record => record.date === date) || [];
        
        // Count by status
        const present = dayRecords.filter(record => record.status === 'present').length;
        const late = dayRecords.filter(record => record.status === 'late').length;
        const leave = dayRecords.filter(record => record.status === 'leave').length;
        const holiday = dayRecords.filter(record => record.status === 'holiday').length;
        
        // Calculate absent (total employees minus those accounted for)
        const absent = totalEmployees ? totalEmployees - (present + late + leave + holiday) : 0;
        
        // Calculate estimated deductions
        // Assuming Rs 250 for late and Rs 500 for absent
        const deductions = (late * 250) + (absent * 500);
        
        monthlyData.push({
          date,
          day: String(day).padStart(2, '0'),
          present,
          late,
          absent: absent > 0 ? absent : 0,
          leave,
          holiday,
          total: totalEmployees || 0,
          deductions
        });
      }
      
      setMonthlyReportData(monthlyData);
      setLoading(false);
    } catch (error) {
      console.error('Error in fetchMonthlyReportData:', error);
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchAttendanceData();
    fetchDepartmentData();
    fetchMonthlyReportData(selectedMonth);
    getCurrentDayAttendanceStats().then(stats => {
      setRealtimeStats(stats);
    });
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
      
      let filename = '';
      let csvContent = '';
      
      if (reportType === 'monthly') {
        // Format filename with the selected month
        filename = `monthly_attendance_report_${selectedMonth}.csv`;
        
        // Create CSV header
        csvContent = 'Date,Present,Late,Absent,Leave,Holiday,Total,Deductions (Rs)\n';
        
        // Add data rows
        monthlyReportData.forEach(day => {
          csvContent += `${day.date},${day.present},${day.late},${day.absent},${day.leave},${day.holiday || 0},${day.total},${day.deductions}\n`;
        });
      } else if (reportType === 'salary') {
        // Format filename with the selected month
        filename = `salary_deductions_report_${selectedMonth}.csv`;
        
        // Create CSV header
        csvContent = 'Employee ID,Employee Name,Department,Total Days Late,Total Days Absent,Late Deductions (Rs),Absence Deductions (Rs),Total Deductions (Rs)\n';
        
        // Get all employees
        const { data: employees, error: empError } = await supabase
          .from('employees')
          .select('*');
          
        if (empError) {
          console.error("Error fetching employees:", empError);
          throw new Error("Failed to fetch employee data");
        }
        
        // Get attendance records for the month
        const [year, monthNum] = selectedMonth.split('-').map(Number);
        const monthStart = `${year}-${String(monthNum).padStart(2, '0')}-01`;
        const daysInMonth = new Date(year, monthNum, 0).getDate();
        const monthEnd = `${year}-${String(monthNum).padStart(2, '0')}-${String(daysInMonth).padStart(2, '0')}`;
        
        for (const emp of employees) {
          // Get attendance records for this employee for the month
          const { data: records, error } = await supabase
            .from('attendance_records')
            .select('*')
            .eq('employee_id', emp.id)
            .gte('date', monthStart)
            .lte('date', monthEnd);
            
          if (error) {
            console.error(`Error fetching records for employee ${emp.id}:`, error);
            continue;
          }
          
          // Count days late and absent
          const daysLate = records?.filter(record => record.status === 'late').length || 0;
          const daysAbsent = records?.filter(record => record.status === 'absent').length || 0;
          
          // Calculate deductions
          const lateDeductions = daysLate * 250;
          const absenceDeductions = daysAbsent * 500;
          const totalDeductions = lateDeductions + absenceDeductions;
          
          csvContent += `${emp.id},${emp.name},${emp.department},${daysLate},${daysAbsent},${lateDeductions},${absenceDeductions},${totalDeductions}\n`;
        }
      } else {
        // Format filename with current date for daily or weekly reports
        const today = new Date().toISOString().split('T')[0];
        filename = `${reportType}_attendance_report_${today}.csv`;
        
        // Create CSV header and data based on report type
        if (reportType === 'daily') {
          csvContent = 'Employee ID,Employee Name,Department,Clock In,Clock Out,Status,Late Deduction (Rs)\n';
          
          // Get today's attendance records with employee details
          const { data: records, error } = await supabase
            .from('attendance_records')
            .select(`
              id,
              employee_id,
              date,
              time_in,
              time_out,
              status,
              employees (name, department)
            `)
            .eq('date', today);
            
          if (error) {
            console.error("Error fetching daily records:", error);
            throw new Error("Failed to fetch attendance data");
          }
          
          records?.forEach(record => {
            const deduction = record.status === 'late' ? 250 : record.status === 'absent' ? 500 : 0;
            csvContent += `${record.employee_id},${record.employees?.name || 'Unknown'},${record.employees?.department || 'Unknown'},${record.time_in || ''},${record.time_out || ''},${record.status},${deduction}\n`;
          });
        } else if (reportType === 'weekly') {
          csvContent = 'Day,Present,Late,Absent,Leave,Holiday,Total\n';
          
          weeklyData.forEach(day => {
            const total = day.present + day.late + day.absent + day.leave + day.holiday;
            csvContent += `${day.day},${day.present},${day.late},${day.absent},${day.leave},${day.holiday || 0},${total}\n`;
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
