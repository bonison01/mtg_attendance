
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AttendanceProvider } from "./contexts/AttendanceContext";
import { AuthProvider } from "./contexts/AuthContext";
import AuthGuard from "./components/auth/AuthGuard";
import MainLayout from "./components/layout/MainLayout";
import Auth from "./pages/Auth";
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
      <AuthProvider>
        <AttendanceProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <MainLayout>
              <Routes>
                <Route path="/auth" element={<Auth />} />
                <Route path="/login" element={<Auth />} />
                
                <Route path="/" element={
                  <AuthGuard>
                    <Dashboard />
                  </AuthGuard>
                } />
                
                <Route path="/employees" element={
                  <AuthGuard requireAdmin={true}>
                    <Employees />
                  </AuthGuard>
                } />
                
                <Route path="/register" element={
                  <AuthGuard requireAdmin={true}>
                    <EmployeeRegistration />
                  </AuthGuard>
                } />
                
                <Route path="/clock" element={
                  <AuthGuard>
                    <ClockInOut />
                  </AuthGuard>
                } />
                
                <Route path="/attendance" element={
                  <AuthGuard>
                    <Attendance />
                  </AuthGuard>
                } />
                
                <Route path="/reports" element={
                  <AuthGuard requireAdmin={true}>
                    <Reports />
                  </AuthGuard>
                } />
                
                <Route path="/settings" element={
                  <AuthGuard requireAdmin={true}>
                    <Settings />
                  </AuthGuard>
                } />
                
                <Route path="*" element={<NotFound />} />
              </Routes>
            </MainLayout>
          </BrowserRouter>
        </AttendanceProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
