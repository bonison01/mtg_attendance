
import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useAttendance } from '@/contexts/AttendanceContext';
import { format } from "date-fns";
import { Search, Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AttendanceRecord } from '@/lib/types';

// Create a new type that extends the AttendanceRecord for absent employees
interface AbsentRecord {
  id: string;
  employeeId: string;
  date: string;
  status: 'absent';
  note: string;
}

// Union type for all records we'll display
type DisplayRecord = AttendanceRecord | AbsentRecord;

const Attendance = () => {
  const { employees, attendanceRecords } = useAttendance();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  const departments = ['all', ...new Set(employees.map(e => e.department))];
  const statuses = ['all', 'present', 'late', 'absent', 'leave'];
  
  // Format selected date as YYYY-MM-DD for filtering
  const formattedDate = selectedDate ? 
    format(selectedDate, 'yyyy-MM-dd') : 
    new Date().toISOString().split('T')[0];
  
  // Filter attendance records
  const filteredRecords = attendanceRecords.filter(record => {
    // Filter by date
    if (record.date !== formattedDate) return false;
    
    // Get employee for this record
    const employee = employees.find(e => e.id === record.employeeId);
    if (!employee) return false;
    
    // Filter by department
    if (departmentFilter !== 'all' && employee.department !== departmentFilter) return false;
    
    // Filter by status
    if (statusFilter !== 'all' && record.status !== statusFilter) return false;
    
    // Filter by search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      if (!employee.name.toLowerCase().includes(searchLower) && 
          !employee.position.toLowerCase().includes(searchLower)) {
        return false;
      }
    }
    
    return true;
  });
  
  // Create a list of all employees that don't have an attendance record for the selected date
  const absentEmployees = employees.filter(employee => {
    // Skip if department filter is active and employee is not in that department
    if (departmentFilter !== 'all' && employee.department !== departmentFilter) return false;
    
    // Skip if status filter is active and it's not specifically filtering for absent
    if (statusFilter !== 'all' && statusFilter !== 'absent') return false;
    
    // Skip if search term is active and employee doesn't match
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      if (!employee.name.toLowerCase().includes(searchLower) && 
          !employee.position.toLowerCase().includes(searchLower)) {
        return false;
      }
    }
    
    // Check if employee has a record for this date
    return !attendanceRecords.some(
      record => record.employeeId === employee.id && record.date === formattedDate
    );
  });
  
  // Create records for absent employees
  const absentRecords: AbsentRecord[] = absentEmployees.map(employee => ({
    id: `absent_${employee.id}_${formattedDate}`,
    employeeId: employee.id,
    date: formattedDate,
    status: 'absent' as const,
    note: 'No record'
  }));
  
  // Combine filtered records with absent records if we're showing all or specifically absent
  const displayRecords: DisplayRecord[] = statusFilter === 'all' || statusFilter === 'absent'
    ? [...filteredRecords, ...absentRecords]
    : filteredRecords;
  
  // Sort by employee name
  displayRecords.sort((a, b) => {
    const empA = employees.find(e => e.id === a.employeeId)?.name || '';
    const empB = employees.find(e => e.id === b.employeeId)?.name || '';
    return empA.localeCompare(empB);
  });
  
  // Get status counts
  const presentCount = displayRecords.filter(record => record.status === 'present').length;
  const lateCount = displayRecords.filter(record => record.status === 'late').length;
  const absentCount = displayRecords.filter(record => record.status === 'absent').length;
  const leaveCount = displayRecords.filter(record => record.status === 'leave').length;
  
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Attendance Records</h1>
      
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card>
          <CardContent className="p-4 flex justify-between items-center">
            <div>
              <p className="text-sm text-muted-foreground">Present</p>
              <p className="text-2xl font-bold text-green-600">{presentCount}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
              <span className="text-green-600 text-sm font-medium">
                {((presentCount / employees.length) * 100).toFixed(0)}%
              </span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex justify-between items-center">
            <div>
              <p className="text-sm text-muted-foreground">Late</p>
              <p className="text-2xl font-bold text-yellow-600">{lateCount}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center">
              <span className="text-yellow-600 text-sm font-medium">
                {((lateCount / employees.length) * 100).toFixed(0)}%
              </span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex justify-between items-center">
            <div>
              <p className="text-sm text-muted-foreground">Absent</p>
              <p className="text-2xl font-bold text-red-600">{absentCount}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
              <span className="text-red-600 text-sm font-medium">
                {((absentCount / employees.length) * 100).toFixed(0)}%
              </span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex justify-between items-center">
            <div>
              <p className="text-sm text-muted-foreground">On Leave</p>
              <p className="text-2xl font-bold text-blue-600">{leaveCount}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-blue-600 text-sm font-medium">
                {((leaveCount / employees.length) * 100).toFixed(0)}%
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Daily Attendance</CardTitle>
          <CardDescription>
            View and manage employee attendance records
          </CardDescription>
          
          <div className="flex flex-col gap-4 md:flex-row md:items-end">
            <div className="flex-1 space-y-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search employees..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:flex gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full md:w-auto justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              
              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept === 'all' ? 'All Departments' : dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status === 'all' ? 'All Statuses' : status.charAt(0).toUpperCase() + status.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Button variant="outline" onClick={() => {
                setSearchTerm('');
                setDepartmentFilter('all');
                setStatusFilter('all');
              }}>
                Reset
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[250px]">Employee</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Clock In</TableHead>
                <TableHead>Clock Out</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayRecords.length > 0 ? (
                displayRecords.map((record) => {
                  const employee = employees.find(e => e.id === record.employeeId);
                  if (!employee) return null;
                  
                  return (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                            {employee.imageUrl ? (
                              <img 
                                src={employee.imageUrl} 
                                alt={employee.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-sm font-medium text-gray-600">
                                {employee.name.charAt(0)}
                              </span>
                            )}
                          </div>
                          <div>
                            <div>{employee.name}</div>
                            <div className="text-xs text-muted-foreground">{employee.position}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{employee.department}</TableCell>
                      <TableCell>
                        <span className={`status-badge ${
                          record.status === 'present' ? 'status-present' : 
                          record.status === 'late' ? 'status-late' : 
                          record.status === 'absent' ? 'status-absent' : 
                          'status-leave'
                        }`}>
                          {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                        </span>
                      </TableCell>
                      <TableCell>{'timeIn' in record ? record.timeIn || '—' : '—'}</TableCell>
                      <TableCell>{'timeOut' in record ? record.timeOut || '—' : '—'}</TableCell>
                      <TableCell>{record.note || '—'}</TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    No attendance records found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Attendance;
