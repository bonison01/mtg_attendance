
import React from 'react';
import { 
  Card, CardContent, CardDescription, CardHeader, CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAttendance } from '@/contexts/AttendanceContext';
import { 
  Users, UserCheck, UserX, Clock, CalendarCheck, Briefcase 
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

const Dashboard = () => {
  const { employees, attendanceRecords } = useAttendance();
  const today = new Date().toISOString().split('T')[0];
  
  // Calculate statistics
  const todayRecords = attendanceRecords.filter(record => record.date === today);
  const presentCount = todayRecords.filter(record => record.status === 'present').length;
  const lateCount = todayRecords.filter(record => record.status === 'late').length;
  const absentCount = employees.length - (presentCount + lateCount);
  const leaveCount = todayRecords.filter(record => record.status === 'leave').length;
  
  // Data for pie chart
  const pieData = [
    { name: 'Present', value: presentCount, color: '#10b981' },
    { name: 'Late', value: lateCount, color: '#f59e0b' },
    { name: 'Absent', value: absentCount, color: '#ef4444' },
    { name: 'On Leave', value: leaveCount, color: '#3b82f6' },
  ];
  
  // Data for department chart
  const departments = [...new Set(employees.map(emp => emp.department))];
  const departmentData = departments.map(dept => {
    const count = employees.filter(emp => emp.department === dept).length;
    return { name: dept, count };
  });

  // Recent attendance
  const recentAttendance = [...todayRecords]
    .sort((a, b) => {
      if (!a.timeIn) return 1;
      if (!b.timeIn) return -1;
      return b.timeIn.localeCompare(a.timeIn);
    })
    .slice(0, 5);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Employees</p>
              <h2 className="text-3xl font-bold">{employees.length}</h2>
            </div>
            <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Present Today</p>
              <h2 className="text-3xl font-bold">{presentCount + lateCount}</h2>
            </div>
            <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center">
              <UserCheck className="h-6 w-6 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Absent Today</p>
              <h2 className="text-3xl font-bold">{absentCount}</h2>
            </div>
            <div className="h-12 w-12 rounded-lg bg-red-100 flex items-center justify-center">
              <UserX className="h-6 w-6 text-red-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">On Leave</p>
              <h2 className="text-3xl font-bold">{leaveCount}</h2>
            </div>
            <div className="h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center">
              <Briefcase className="h-6 w-6 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card className="col-span-2">
              <CardHeader>
                <CardTitle>Today's Attendance Summary</CardTitle>
                <CardDescription>
                  {new Date().toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={80}
                        outerRadius={120}
                        paddingAngle={2}
                        dataKey="value"
                        label={({ name, percent }) => 
                          `${name}: ${(percent * 100).toFixed(0)}%`
                        }
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value} employees`, '']} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Last check-ins today</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentAttendance.length > 0 ? (
                    recentAttendance.map(record => {
                      const employee = employees.find(emp => emp.id === record.employeeId);
                      if (!employee) return null;
                      
                      return (
                        <div key={record.id} className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                            {employee.imageUrl ? (
                              <img src={employee.imageUrl} alt={employee.name} className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-lg font-bold text-gray-600">
                                {employee.name.charAt(0)}
                              </span>
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{employee.name}</p>
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Clock className="h-3 w-3 mr-1" />
                              {record.timeIn || 'Not checked in'} 
                              <span className={`ml-2 status-badge ${record.status === 'present' ? 'status-present' : record.status === 'late' ? 'status-late' : record.status === 'absent' ? 'status-absent' : 'status-leave'}`}>
                                {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="py-10 text-center text-muted-foreground">
                      <CalendarCheck className="mx-auto h-12 w-12 mb-2 opacity-20" />
                      <p>No activity recorded today</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Employee Distribution by Department</CardTitle>
              <CardDescription>Number of employees in each department</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={departmentData}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#1e3a8a" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Attendance Analytics</CardTitle>
              <CardDescription>Advanced analytics coming soon</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="py-10 text-center text-muted-foreground">
                <p>More detailed analytics will be implemented in the next version.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle>Attendance Reports</CardTitle>
              <CardDescription>Downloadable reports coming soon</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="py-10 text-center text-muted-foreground">
                <p>Downloadable reports will be implemented in the next version.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
