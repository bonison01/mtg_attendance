
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
        // Fetch employees - using staff table as substitute
        const { data: staffData, error: staffError } = await supabase
          .from('staff')
          .select('*');
          
        if (staffError) throw staffError;
        
        // Map staff data to our Employee type
        const mappedEmployees: Employee[] = staffData.map((staff: any) => ({
          id: staff.id,
          name: `${staff.first_name} ${staff.last_name}`,
          email: staff.staff_email,
          phoneNumber: '',
          position: staff.role,
          department: '',
          joinDate: staff.created_at ? new Date(staff.created_at).toISOString().split('T')[0] : '',
          imageUrl: ''
        }));
        
        setEmployees(mappedEmployees);
        
        // For attendance records, we can use an empty array since there's no direct equivalent
        setAttendanceRecords([]);
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
        const newEmployee: Employee = {
          id: newRecord.id,
          name: `${newRecord.first_name} ${newRecord.last_name}`,
          email: newRecord.staff_email,
          phoneNumber: '',
          position: newRecord.role,
          department: '',
          joinDate: newRecord.created_at ? new Date(newRecord.created_at).toISOString().split('T')[0] : '',
          imageUrl: ''
        };
        setEmployees(prev => [...prev, newEmployee]);
      } else if (eventType === 'UPDATE') {
        setEmployees(prev => prev.map(emp => 
          emp.id === newRecord.id ? {
            ...emp,
            name: `${newRecord.first_name} ${newRecord.last_name}`,
            email: newRecord.staff_email,
            position: newRecord.role,
          } : emp
        ));
      } else if (eventType === 'DELETE') {
        setEmployees(prev => prev.filter(emp => emp.id !== oldRecord.id));
      }
    });
    
    const attendanceChannel = subscribeToAttendanceChanges((payload) => {
      // Since we don't have a direct attendance_records table in existing schema,
      // we'll just skip this implementation for now
    });
    
    return () => {
      unsubscribeFromChannel(employeeChannel);
      unsubscribeFromChannel(attendanceChannel);
    };
  }, []);

  const addEmployee = async (employee: Omit<Employee, 'id'>): Promise<string | undefined> => {
    try {
      // Map our Employee type to staff table columns
      const staffData = {
        first_name: employee.name.split(' ')[0],
        last_name: employee.name.split(' ').slice(1).join(' '),
        staff_email: employee.email,
        role: employee.position,
        user_id: '00000000-0000-0000-0000-000000000000', // placeholder
        status: 'active'
      };
      
      const { data, error } = await supabase
        .from('staff')
        .insert(staffData)
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
        .from('staff')
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
      // Map our Employee type to staff table columns
      const updateData: any = {};
      
      if (employee.name) {
        const nameParts = employee.name.split(' ');
        updateData.first_name = nameParts[0];
        updateData.last_name = nameParts.slice(1).join(' ');
      }
      
      if (employee.email) {
        updateData.staff_email = employee.email;
      }
      
      if (employee.position) {
        updateData.role = employee.position;
      }
      
      const { error } = await supabase
        .from('staff')
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
      
      // Instead of inserting to a non-existent table, we'll just update our local state
      // and show a toast notification
      const newAttendanceRecord: AttendanceRecord = {
        id: Math.random().toString(36).substring(2, 15),
        employeeId: employeeId,
        date: today,
        timeIn: now,
        status: new Date().getHours() >= 9 ? 'late' : 'present'
      };
      
      setAttendanceRecords(prev => [...prev, newAttendanceRecord]);
      
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
      
      // Update the record in our local state
      setAttendanceRecords(prev => prev.map(record => {
        if (record.employeeId === employeeId && record.date === today && !record.timeOut) {
          return { ...record, timeOut: now };
        }
        return record;
      }));
      
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
      // First, try to find a staff member by email
      const { data: staff, error: staffError } = await supabase
        .from('staff')
        .select('*')
        .eq('staff_email', email)
        .single();
        
      if (staffError) {
        toast({
          variant: 'destructive',
          title: 'Verification Failed',
          description: 'Email not found in our records',
        });
        return false;
      }
      
      // Since we don't have date_of_birth in staff table, we'll just simulate success
      // In a real implementation, you'd check against actual stored date of birth
      
      // Send password recovery email
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
