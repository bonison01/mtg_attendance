
import { Employee, AttendanceRecord, Department, User } from './types';

export const mockEmployees: Employee[] = [
  {
    id: '1',
    name: 'John Doe',
    position: 'Software Engineer',
    department: 'Engineering',
    imageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    fingerprint: 'fp_001',
    email: 'john.doe@company.com',
    phoneNumber: '(555) 123-4567',
    joinDate: '2022-01-15'
  },
  {
    id: '2',
    name: 'Jane Smith',
    position: 'Product Manager',
    department: 'Product',
    imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    fingerprint: 'fp_002',
    email: 'jane.smith@company.com',
    phoneNumber: '(555) 234-5678',
    joinDate: '2021-11-05'
  },
  {
    id: '3',
    name: 'Michael Johnson',
    position: 'UI/UX Designer',
    department: 'Design',
    imageUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    fingerprint: 'fp_003',
    email: 'michael.johnson@company.com',
    phoneNumber: '(555) 345-6789',
    joinDate: '2022-03-22'
  },
  {
    id: '4',
    name: 'Emily Davis',
    position: 'Marketing Specialist',
    department: 'Marketing',
    imageUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    fingerprint: 'fp_004',
    email: 'emily.davis@company.com',
    phoneNumber: '(555) 456-7890',
    joinDate: '2022-02-10'
  },
  {
    id: '5',
    name: 'Robert Wilson',
    position: 'HR Manager',
    department: 'Human Resources',
    imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    fingerprint: 'fp_005',
    email: 'robert.wilson@company.com',
    phoneNumber: '(555) 567-8901',
    joinDate: '2021-09-15'
  }
];

// Helper to generate today's date in YYYY-MM-DD format
const todayStr = new Date().toISOString().split('T')[0];

export const mockAttendance: AttendanceRecord[] = [
  {
    id: 'a1',
    employeeId: '1',
    date: todayStr,
    timeIn: '08:55:23',
    timeOut: '17:05:47',
    status: 'present',
    note: ''
  },
  {
    id: 'a2',
    employeeId: '2',
    date: todayStr,
    timeIn: '09:10:05',
    timeOut: '17:30:22',
    status: 'present',
    note: ''
  },
  {
    id: 'a3',
    employeeId: '3',
    date: todayStr,
    timeIn: '09:25:11',
    status: 'late',
    note: 'Traffic delay'
  },
  {
    id: 'a4',
    employeeId: '4',
    date: todayStr,
    status: 'leave',
    note: 'Approved vacation'
  },
  {
    id: 'a5',
    employeeId: '5',
    date: todayStr,
    timeIn: '08:45:30',
    timeOut: '17:15:43',
    status: 'present',
    note: ''
  }
];

export const mockDepartments: Department[] = [
  { id: 'd1', name: 'Engineering', managerId: '1' },
  { id: 'd2', name: 'Product', managerId: '2' },
  { id: 'd3', name: 'Design' },
  { id: 'd4', name: 'Marketing' },
  { id: 'd5', name: 'Human Resources', managerId: '5' },
];

export const mockUsers: User[] = [
  { id: 'u1', name: 'Admin User', email: 'admin@company.com', role: 'admin' },
  { id: 'u2', name: 'HR Manager', email: 'hr@company.com', role: 'hr' },
];
