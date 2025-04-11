
export interface Employee {
  id: string;
  name: string;
  position: string;
  department: string;
  imageUrl?: string;
  fingerprint?: string; // In a real app this would be secure biometric data
  email: string;
  phoneNumber: string;
  joinDate: string;
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  date: string;
  timeIn?: string;
  timeOut?: string;
  status: 'present' | 'absent' | 'late' | 'leave';
  note?: string;
}

export interface Department {
  id: string;
  name: string;
  managerId?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'hr';
}
