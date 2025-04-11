
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Employee, AttendanceRecord } from '../lib/types';
import { mockEmployees, mockAttendance } from '../lib/mockData';
import { toast } from "@/components/ui/use-toast";

interface AttendanceContextType {
  employees: Employee[];
  attendanceRecords: AttendanceRecord[];
  addEmployee: (employee: Omit<Employee, 'id'>) => void;
  updateEmployee: (employee: Employee) => void;
  removeEmployee: (id: string) => void;
  registerFingerprint: (employeeId: string, fingerprintData: string) => void;
  clockIn: (employeeId: string) => void;
  clockOut: (employeeId: string) => void;
  getEmployeeById: (id: string) => Employee | undefined;
  getAttendanceByEmployeeId: (id: string) => AttendanceRecord[];
  getTodayAttendance: (id: string) => AttendanceRecord | undefined;
}

const AttendanceContext = createContext<AttendanceContextType | undefined>(undefined);

export const AttendanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);

  // Initialize with mock data
  useEffect(() => {
    setEmployees(mockEmployees);
    setAttendanceRecords(mockAttendance);
  }, []);

  // Get today's date in YYYY-MM-DD format
  const todayStr = new Date().toISOString().split('T')[0];

  const addEmployee = (employee: Omit<Employee, 'id'>) => {
    const newId = `emp_${Date.now()}`;
    const newEmployee = {
      ...employee,
      id: newId,
    };
    setEmployees([...employees, newEmployee]);
    toast({
      title: "Employee Added",
      description: `${employee.name} has been successfully added.`,
    });
  };

  const updateEmployee = (employee: Employee) => {
    setEmployees(employees.map(e => e.id === employee.id ? employee : e));
    toast({
      title: "Employee Updated",
      description: `${employee.name}'s information has been updated.`,
    });
  };

  const removeEmployee = (id: string) => {
    const employee = employees.find(e => e.id === id);
    setEmployees(employees.filter(e => e.id !== id));
    if (employee) {
      toast({
        title: "Employee Removed",
        description: `${employee.name} has been removed from the system.`,
        variant: "destructive",
      });
    }
  };

  const registerFingerprint = (employeeId: string, fingerprintData: string) => {
    setEmployees(employees.map(emp => 
      emp.id === employeeId ? { ...emp, fingerprint: fingerprintData } : emp
    ));
    const employee = employees.find(e => e.id === employeeId);
    if (employee) {
      toast({
        title: "Fingerprint Enrolled",
        description: `${employee.name}'s fingerprint has been successfully registered.`,
      });
    }
  };

  const getEmployeeById = (id: string) => {
    return employees.find(e => e.id === id);
  };

  const getAttendanceByEmployeeId = (id: string) => {
    return attendanceRecords.filter(record => record.employeeId === id);
  };

  const getTodayAttendance = (id: string) => {
    return attendanceRecords.find(record => record.employeeId === id && record.date === todayStr);
  };

  const clockIn = (employeeId: string) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', { hour12: false });
    const employee = employees.find(e => e.id === employeeId);
    
    // Check if employee exists and has registered fingerprint
    if (!employee) {
      toast({
        title: "Error",
        description: "Employee not found.",
        variant: "destructive",
      });
      return;
    }
    
    if (!employee.fingerprint) {
      toast({
        title: "Fingerprint Required",
        description: "Please register your fingerprint first.",
        variant: "destructive",
      });
      return;
    }

    // Check if already clocked in today
    const existingRecord = attendanceRecords.find(
      r => r.employeeId === employeeId && r.date === todayStr
    );

    if (existingRecord && existingRecord.timeIn) {
      toast({
        title: "Already Clocked In",
        description: `${employee.name} has already clocked in at ${existingRecord.timeIn}`,
        variant: "destructive",
      });
      return;
    }

    // Calculate if late (after 9:00)
    const isLate = now.getHours() >= 9 && (now.getHours() > 9 || now.getMinutes() > 0);
    
    if (existingRecord) {
      // Update existing record
      setAttendanceRecords(attendanceRecords.map(record => 
        record.id === existingRecord.id 
        ? { ...record, timeIn: timeStr, status: isLate ? 'late' : 'present' }
        : record
      ));
    } else {
      // Create new record
      const newRecord: AttendanceRecord = {
        id: `att_${Date.now()}`,
        employeeId,
        date: todayStr,
        timeIn: timeStr,
        status: isLate ? 'late' : 'present',
        note: isLate ? 'Late arrival' : '',
      };
      setAttendanceRecords([...attendanceRecords, newRecord]);
    }

    toast({
      title: isLate ? "Late Check-In" : "Check-In Successful",
      description: `${employee.name} clocked in at ${timeStr}`,
      variant: isLate ? "default" : "default",
    });
  };

  const clockOut = (employeeId: string) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', { hour12: false });
    const employee = employees.find(e => e.id === employeeId);
    
    if (!employee) {
      toast({
        title: "Error",
        description: "Employee not found.",
        variant: "destructive",
      });
      return;
    }
    
    if (!employee.fingerprint) {
      toast({
        title: "Fingerprint Required",
        description: "Please register your fingerprint first.",
        variant: "destructive",
      });
      return;
    }

    // Find today's record
    const existingRecord = attendanceRecords.find(
      r => r.employeeId === employeeId && r.date === todayStr
    );

    if (!existingRecord || !existingRecord.timeIn) {
      toast({
        title: "Error",
        description: "You must clock in before clocking out.",
        variant: "destructive",
      });
      return;
    }

    if (existingRecord.timeOut) {
      toast({
        title: "Already Clocked Out",
        description: `${employee.name} has already clocked out at ${existingRecord.timeOut}`,
        variant: "destructive",
      });
      return;
    }

    // Update record with clock-out time
    setAttendanceRecords(attendanceRecords.map(record => 
      record.id === existingRecord.id 
      ? { ...record, timeOut: timeStr }
      : record
    ));

    toast({
      title: "Check-Out Successful",
      description: `${employee.name} clocked out at ${timeStr}`,
    });
  };

  const value = {
    employees,
    attendanceRecords,
    addEmployee,
    updateEmployee,
    removeEmployee,
    registerFingerprint,
    clockIn,
    clockOut,
    getEmployeeById,
    getAttendanceByEmployeeId,
    getTodayAttendance
  };

  return (
    <AttendanceContext.Provider value={value}>
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
