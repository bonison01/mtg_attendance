
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AttendanceProvider } from "./contexts/AttendanceContext";
import MainLayout from "./components/layout/MainLayout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Employees from "./pages/Employees";
import EmployeeRegistration from "./pages/EmployeeRegistration";
import ClockInOut from "./pages/ClockInOut";
import Attendance from "./pages/Attendance";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AttendanceProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <MainLayout>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<Dashboard />} />
              <Route path="/employees" element={<Employees />} />
              <Route path="/register" element={<EmployeeRegistration />} />
              <Route path="/clock" element={<ClockInOut />} />
              <Route path="/attendance" element={<Attendance />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </MainLayout>
        </BrowserRouter>
      </AttendanceProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
