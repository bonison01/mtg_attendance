
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

  // Load initial data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      try {
        // Fetch employees
        const { data: employeesData, error: employeesError } = await supabase
          .from('employees')
          .select('*');
          
        if (employeesError) throw employeesError;
        setEmployees(employeesData);
        
        // Fetch attendance records
        const { data: attendanceData, error: attendanceError } = await supabase
          .from('attendance_records')
          .select('*');
          
        if (attendanceError) throw attendanceError;
        setAttendanceRecords(attendanceData);
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

  // Set up real-time listeners
  useEffect(() => {
    const employeeChannel = subscribeToEmployeeChanges((payload) => {
      const { eventType, new: newRecord, old: oldRecord } = payload;
      
      if (eventType === 'INSERT') {
        setEmployees(prev => [...prev, newRecord as Employee]);
      } else if (eventType === 'UPDATE') {
        setEmployees(prev => prev.map(emp => 
          emp.id === newRecord.id ? { ...emp, ...newRecord } : emp
        ));
      } else if (eventType === 'DELETE') {
        setEmployees(prev => prev.filter(emp => emp.id !== oldRecord.id));
      }
    });
    
    const attendanceChannel = subscribeToAttendanceChanges((payload) => {
      const { eventType, new: newRecord, old: oldRecord } = payload;
      
      if (eventType === 'INSERT') {
        setAttendanceRecords(prev => [...prev, newRecord as AttendanceRecord]);
      } else if (eventType === 'UPDATE') {
        setAttendanceRecords(prev => prev.map(record => 
          record.id === newRecord.id ? { ...record, ...newRecord } : record
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
      const { data, error } = await supabase
        .from('employees')
        .insert(employee)
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
      const { error } = await supabase
        .from('employees')
        .update(employee)
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
      
      // Check if there's already a record for today
      const { data: existingRecords, error: fetchError } = await supabase
        .from('attendance_records')
        .select('*')
        .eq('employee_id', employeeId)
        .eq('date', today);
        
      if (fetchError) throw fetchError;
      
      if (existingRecords && existingRecords.length > 0) {
        // Update existing record
        const { error } = await supabase
          .from('attendance_records')
          .update({ 
            time_in: now,
            status: new Date().getHours() >= 9 ? 'late' : 'present'
          })
          .eq('id', existingRecords[0].id);
          
        if (error) throw error;
      } else {
        // Create new record
        const { error } = await supabase
          .from('attendance_records')
          .insert({
            employee_id: employeeId,
            date: today,
            time_in: now,
            status: new Date().getHours() >= 9 ? 'late' : 'present'
          });
          
        if (error) throw error;
      }
      
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
      
      // Find today's record
      const { data, error: fetchError } = await supabase
        .from('attendance_records')
        .select('*')
        .eq('employee_id', employeeId)
        .eq('date', today)
        .maybeSingle();
        
      if (fetchError) throw fetchError;
      
      if (!data) {
        throw new Error('No clock-in record found for today');
      }
      
      // Update with clock-out time
      const { error } = await supabase
        .from('attendance_records')
        .update({ time_out: now })
        .eq('id', data.id);
        
      if (error) throw error;
      
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
      // First, find the employee by email
      const { data: employee, error: employeeError } = await supabase
        .from('employees')
        .select('*')
        .eq('email', email)
        .single();
        
      if (employeeError) throw employeeError;
      
      // Check if date of birth matches
      const employeeDOB = employee.date_of_birth ? new Date(employee.date_of_birth).toISOString().split('T')[0] : null;
      const inputDOB = new Date(dateOfBirth).toISOString().split('T')[0];
      
      if (!employeeDOB || employeeDOB !== inputDOB) {
        toast({
          variant: 'destructive',
          title: 'Verification Failed',
          description: 'Date of birth does not match our records',
        });
        return false;
      }
      
      // If verification passes, send password recovery email
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
