
export interface Employee {
  id: string;
  name: string;
  position: string;
  department: string;
  imageUrl?: string;
  fingerprint?: string; // Stored fingerprint data/hash
  last_selfie_url?: string; // URL to the last stored selfie image
  email: string;
  phoneNumber: string;
  joinDate: string;
  date_of_birth?: string; // Added for password reset verification
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  date: string;
  timeIn?: string;
  timeOut?: string;
  status: 'present' | 'absent' | 'late' | 'leave' | 'holiday';
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
