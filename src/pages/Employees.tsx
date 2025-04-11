
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAttendance } from '@/contexts/AttendanceContext';
import { UserPlus, Search, MoreHorizontal, Edit, Trash2, AlertTriangle } from 'lucide-react';

const Employees = () => {
  const navigate = useNavigate();
  const { employees, removeEmployee } = useAttendance();
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<string | null>(null);
  
  // Filter employees based on search
  const filteredEmployees = employees.filter(employee => {
    const searchLower = searchTerm.toLowerCase();
    return (
      employee.name.toLowerCase().includes(searchLower) ||
      employee.position.toLowerCase().includes(searchLower) ||
      employee.department.toLowerCase().includes(searchLower) ||
      employee.email.toLowerCase().includes(searchLower)
    );
  });
  
  const handleDeleteClick = (id: string) => {
    setEmployeeToDelete(id);
    setDeleteDialogOpen(true);
  };
  
  const confirmDelete = () => {
    if (employeeToDelete) {
      removeEmployee(employeeToDelete);
      setDeleteDialogOpen(false);
      setEmployeeToDelete(null);
    }
  };
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Employees</h1>
        <Button onClick={() => navigate('/register')} className="gap-2">
          <UserPlus className="h-4 w-4" />
          Register New Employee
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Employee Directory</CardTitle>
          <CardDescription>
            Manage your organization's employees and their attendance records
          </CardDescription>
          
          <div className="flex items-center py-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search employees..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[250px]">Employee</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Joined Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEmployees.length > 0 ? (
                filteredEmployees.map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
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
                        <span>{employee.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{employee.position}</TableCell>
                    <TableCell>{employee.department}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{employee.email}</div>
                        <div className="text-muted-foreground">{employee.phoneNumber}</div>
                      </div>
                    </TableCell>
                    <TableCell>{employee.joinDate}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem 
                            onClick={() => navigate(`/employee/${employee.id}`)}
                            className="cursor-pointer"
                          >
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => console.log('Edit employee:', employee.id)}
                            className="cursor-pointer"
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => handleDeleteClick(employee.id)}
                            className="cursor-pointer text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    {searchTerm ? (
                      <div>
                        <p>No employees found matching "{searchTerm}"</p>
                        <p className="text-sm mt-1">Try different search criteria</p>
                      </div>
                    ) : (
                      <div>
                        <p>No employees registered yet</p>
                        <p className="text-sm mt-1">Register employees to start tracking attendance</p>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Confirm Deletion
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this employee? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Employees;
