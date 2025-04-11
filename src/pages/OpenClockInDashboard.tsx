
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Employee, AttendanceRecord } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Fingerprint, LogIn, LogOut, Search, Check, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { AspectRatio } from '@/components/ui/aspect-ratio';

const OpenClockInDashboard = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch employees
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
        
        // Fetch today's attendance records
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
      } catch (error: any) {
        toast.error("Error loading data", {
          description: error.message
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();

    // Set up realtime subscriptions for attendance records
    const channel = supabase
      .channel('public:attendance_records')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'attendance_records' 
      }, (payload) => {
        // Handle real-time updates to attendance records
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
    };
  }, []);

  const getTodayAttendance = (employeeId: string): AttendanceRecord | undefined => {
    return attendanceRecords.find(record => record.employeeId === employeeId);
  };

  const clockIn = async (employeeId: string) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const now = new Date().toLocaleTimeString();
      
      const attendanceData = {
        employee_id: employeeId,
        date: today,
        time_in: now,
        status: new Date().getHours() >= 9 ? 'late' : 'present',
        note: ''
      };
      
      const { data, error } = await supabase
        .from('attendance_records')
        .insert(attendanceData)
        .select()
        .single();
      
      if (error) throw error;
      
      toast.success("Clock In Successful", {
        description: `Clocked in at ${now}`
      });
    } catch (error: any) {
      toast.error("Clock In Failed", {
        description: error.message
      });
    }
  };

  const clockOut = async (employeeId: string) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const now = new Date().toLocaleTimeString();
      
      const { data: record, error: findError } = await supabase
        .from('attendance_records')
        .select('*')
        .eq('employee_id', employeeId)
        .eq('date', today)
        .is('time_out', null)
        .single();
      
      if (findError) {
        throw new Error('No clock-in record found for today');
      }
      
      const { error: updateError } = await supabase
        .from('attendance_records')
        .update({ time_out: now })
        .eq('id', record.id);
      
      if (updateError) throw updateError;
      
      toast.success("Clock Out Successful", {
        description: `Clocked out at ${now}`
      });
    } catch (error: any) {
      toast.error("Clock Out Failed", {
        description: error.message
      });
    }
  };

  const filteredEmployees = employees.filter(employee =>
    employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
                        <Badge className={
                          attendanceRecord.status === 'present' ? 'bg-green-500' : 
                          attendanceRecord.status === 'late' ? 'bg-amber-500' : 
                          attendanceRecord.status === 'absent' ? 'bg-red-500' : 'bg-blue-500'
                        }>
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
                            onClick={() => clockIn(employee.id)}
                            className="flex items-center gap-1"
                          >
                            <LogIn className="h-4 w-4" />
                            Clock In
                          </Button>
                          <Button
                            variant="outline"
                            disabled={!attendanceRecord.timeIn || !!attendanceRecord.timeOut}
                            onClick={() => clockOut(employee.id)}
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
                          onClick={() => clockIn(employee.id)} 
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
    </div>
  );
};

export default OpenClockInDashboard;
