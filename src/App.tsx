
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AttendanceProvider } from "./contexts/AttendanceContext";
import { AuthProvider } from "./contexts/AuthContext";
import AuthGuard from "./components/auth/AuthGuard";
import MainLayout from "./components/layout/MainLayout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Employees from "./pages/Employees";
import EmployeeRegistration from "./pages/EmployeeRegistration";
import ClockInOut from "./pages/ClockInOut";
import Attendance from "./pages/Attendance";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import PasswordReset from "./pages/PasswordReset";
import NotFound from "./pages/NotFound";
import OpenClockInDashboard from "./pages/OpenClockInDashboard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <AttendanceProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/auth" element={<Navigate replace to="/login" />} />
              <Route path="/reset-password" element={<PasswordReset />} />
              <Route path="/open-clock" element={<OpenClockInDashboard />} />
              
              <Route path="/" element={
                <MainLayout>
                  <AuthGuard>
                    <Dashboard />
                  </AuthGuard>
                </MainLayout>
              } />
              
              <Route path="/employees" element={
                <MainLayout>
                  <AuthGuard requireAdmin={true}>
                    <Employees />
                  </AuthGuard>
                </MainLayout>
              } />
              
              <Route path="/register" element={
                <MainLayout>
                  <AuthGuard requireAdmin={true}>
                    <EmployeeRegistration />
                  </AuthGuard>
                </MainLayout>
              } />
              
              <Route path="/clock" element={
                <MainLayout>
                  <AuthGuard>
                    <ClockInOut />
                  </AuthGuard>
                </MainLayout>
              } />
              
              <Route path="/attendance" element={
                <MainLayout>
                  <AuthGuard>
                    <Attendance />
                  </AuthGuard>
                </MainLayout>
              } />
              
              <Route path="/reports" element={
                <MainLayout>
                  <AuthGuard requireAdmin={true}>
                    <Reports />
                  </AuthGuard>
                </MainLayout>
              } />
              
              <Route path="/settings" element={
                <MainLayout>
                  <AuthGuard requireAdmin={true}>
                    <Settings />
                  </AuthGuard>
                </MainLayout>
              } />
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AttendanceProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
