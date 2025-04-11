import React, { createContext, useContext, useEffect, useState } from 'react';
import { Employee, AttendanceRecord } from '@/lib/types';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { subscribeToAttendanceChanges, subscribeToEmployeeChanges, unsubscribeFromChannel } from '@/services/realtimeService';

type AttendanceContextType = {
  employees: Employee[];
  attendanceRecords: AttendanceRecord[];
  addEmployee: (employee: Omit<Employee, 'id'>) => Promise<string | undefined>;
  removeEmployee: (id: string) => Promise<void>;
  updateEmployee: (id: string, employee: Partial<Employee>) => Promise<void>;
  clockIn: (employeeId: string) => Promise<void>;
  clockOut: (employeeId: string) => Promise<void>;
  getTodayAttendance: (employeeId: string) => AttendanceRecord | null;
  resetPassword: (email: string, dateOfBirth: string) => Promise<boolean>;
  loading: boolean;
};

const AttendanceContext = createContext<AttendanceContextType | undefined>(undefined);

export const AttendanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      try {
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
        
        const { data: attendanceData, error: attendanceError } = await supabase
          .from('attendance_records')
          .select('*');
        
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
        toast({
          variant: 'destructive',
          title: 'Error loading data',
          description: error.message,
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [toast]);

  useEffect(() => {
    const employeeChannel = subscribeToEmployeeChanges((payload) => {
      const { eventType, new: newRecord, old: oldRecord } = payload;
      
      if (eventType === 'INSERT') {
        const newEmployee: Employee = {
          id: newRecord.id,
          name: newRecord.name,
          email: newRecord.email,
          phoneNumber: newRecord.phone_number || '',
          position: newRecord.position,
          department: newRecord.department || '',
          joinDate: newRecord.join_date,
          imageUrl: newRecord.image_url || '',
          fingerprint: newRecord.fingerprint || null,
          date_of_birth: newRecord.date_of_birth || null
        };
        setEmployees(prev => [...prev, newEmployee]);
      } else if (eventType === 'UPDATE') {
        setEmployees(prev => prev.map(emp => 
          emp.id === newRecord.id ? {
            ...emp,
            name: newRecord.name,
            email: newRecord.email,
            phoneNumber: newRecord.phone_number || '',
            position: newRecord.position,
            department: newRecord.department || '',
            joinDate: newRecord.join_date,
            imageUrl: newRecord.image_url || '',
            fingerprint: newRecord.fingerprint || null,
            date_of_birth: newRecord.date_of_birth || null
          } : emp
        ));
      } else if (eventType === 'DELETE') {
        setEmployees(prev => prev.filter(emp => emp.id !== oldRecord.id));
      }
    });
    
    const attendanceChannel = subscribeToAttendanceChanges((payload) => {
      const { eventType, new: newRecord, old: oldRecord } = payload;
      
      if (eventType === 'INSERT') {
        const newAttendance: AttendanceRecord = {
          id: newRecord.id,
          employeeId: newRecord.employee_id,
          date: newRecord.date,
          timeIn: newRecord.time_in || undefined,
          timeOut: newRecord.time_out || undefined,
          status: newRecord.status,
          note: newRecord.note || ''
        };
        setAttendanceRecords(prev => [...prev, newAttendance]);
      } else if (eventType === 'UPDATE') {
        setAttendanceRecords(prev => prev.map(record => 
          record.id === newRecord.id ? {
            ...record,
            employeeId: newRecord.employee_id,
            date: newRecord.date,
            timeIn: newRecord.time_in || undefined,
            timeOut: newRecord.time_out || undefined,
            status: newRecord.status,
            note: newRecord.note || ''
          } : record
        ));
      } else if (eventType === 'DELETE') {
        setAttendanceRecords(prev => prev.filter(record => record.id !== oldRecord.id));
      }
    });
    
    return () => {
      unsubscribeFromChannel(employeeChannel);
      unsubscribeFromChannel(attendanceChannel);
    };
  }, []);

  const addEmployee = async (employee: Omit<Employee, 'id'>): Promise<string | undefined> => {
    try {
      const employeeData = {
        name: employee.name,
        email: employee.email,
        phone_number: employee.phoneNumber,
        position: employee.position,
        department: employee.department,
        join_date: employee.joinDate,
        date_of_birth: employee.date_of_birth,
        image_url: employee.imageUrl
      };
      
      const { data, error } = await supabase
        .from('employees')
        .insert(employeeData)
        .select()
        .single();
        
      if (error) throw error;
      
      toast({
        title: 'Employee added',
        description: `${employee.name} has been successfully registered.`,
      });
      
      return data?.id;
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Failed to add employee',
        description: error.message,
      });
      return undefined;
    }
  };

  const removeEmployee = async (id: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('employees')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      toast({
        title: 'Employee removed',
        description: 'Employee has been successfully removed.',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Failed to remove employee',
        description: error.message,
      });
    }
  };

  const updateEmployee = async (id: string, employee: Partial<Employee>): Promise<void> => {
    try {
      const updateData: any = {};
      
      if (employee.name) updateData.name = employee.name;
      if (employee.email) updateData.email = employee.email;
      if (employee.phoneNumber) updateData.phone_number = employee.phoneNumber;
      if (employee.position) updateData.position = employee.position;
      if (employee.department) updateData.department = employee.department;
      if (employee.joinDate) updateData.join_date = employee.joinDate;
      if (employee.imageUrl) updateData.image_url = employee.imageUrl;
      if (employee.date_of_birth) updateData.date_of_birth = employee.date_of_birth;
      
      const { error } = await supabase
        .from('employees')
        .update(updateData)
        .eq('id', id);
        
      if (error) throw error;
      
      toast({
        title: 'Employee updated',
        description: 'Employee information has been updated.',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Failed to update employee',
        description: error.message,
      });
    }
  };

  const clockIn = async (employeeId: string): Promise<void> => {
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
      
      toast({
        title: 'Clock In',
        description: `Clocked in at ${now}`,
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Clock In Failed',
        description: error.message,
      });
    }
  };

  const clockOut = async (employeeId: string): Promise<void> => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const now = new Date().toLocaleTimeString();
      
      const { data, error: findError } = await supabase
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
        .eq('id', data.id);
      
      if (updateError) throw updateError;
      
      toast({
        title: 'Clock Out',
        description: `Clocked out at ${now}`,
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Clock Out Failed',
        description: error.message,
      });
    }
  };

  const getTodayAttendance = (employeeId: string): AttendanceRecord | null => {
    const today = new Date().toISOString().split('T')[0];
    const record = attendanceRecords.find(
      (record) => record.employeeId === employeeId && record.date === today
    );
    return record || null;
  };

  const resetPassword = async (email: string, dateOfBirth: string): Promise<boolean> => {
    try {
      const { data: employee, error: employeeError } = await supabase
        .from('employees')
        .select('*')
        .eq('email', email)
        .single();
        
      if (employeeError) {
        toast({
          variant: 'destructive',
          title: 'Verification Failed',
          description: 'Email not found in our records',
        });
        return false;
      }
      
      const employeeDob = employee.date_of_birth ? new Date(employee.date_of_birth).toISOString().split('T')[0] : null;
      const providedDob = new Date(dateOfBirth).toISOString().split('T')[0];
      
      if (employeeDob !== providedDob) {
        toast({
          variant: 'destructive',
          title: 'Verification Failed',
          description: 'Date of birth does not match our records',
        });
        return false;
      }
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/reset-password',
      });
      
      if (error) throw error;
      
      toast({
        title: 'Password Reset Email Sent',
        description: 'Check your email for the password reset link',
      });
      
      return true;
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Password Reset Failed',
        description: error.message,
      });
      return false;
    }
  };

  return (
    <AttendanceContext.Provider
      value={{
        employees,
        attendanceRecords,
        addEmployee,
        removeEmployee,
        updateEmployee,
        clockIn,
        clockOut,
        getTodayAttendance,
        resetPassword,
        loading,
      }}
    >
      {children}
    </AttendanceContext.Provider>
  );
};

export const useAttendance = () => {
  const context = useContext(AttendanceContext);
  if (context === undefined) {
    throw new Error('useAttendance must be used within an AttendanceProvider');
  }
  return context;
};
