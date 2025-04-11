
import React, { useState } from "react";
import { useNavigate, Link, useLocation, Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { Fingerprint, LogIn, UserPlus, ExternalLink } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Checkbox } from "@/components/ui/checkbox";

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState('login');
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  if (user) {
    return <Navigate to="/" replace />;
  }

  const from = (location.state as any)?.from?.pathname || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (activeTab === 'login') {
        await signIn(email, password);
        navigate(from, { replace: true });
      } else {
        await signUp(email, password, isAdmin);
        setActiveTab('login');
      }
    } catch (error) {
      console.error('Authentication error:', error);
      toast({
        title: "Authentication Error",
        description: "Please check your credentials and try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-grow flex items-center justify-center bg-gray-100 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center mb-2">
              <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
                <Fingerprint className="h-7 w-7 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl">BioPulse</CardTitle>
            <CardDescription>
              Enter your credentials to access the attendance system
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Tabs defaultValue="login" value={activeTab} onValueChange={setActiveTab}>
              <div className="px-6">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login">Login</TabsTrigger>
                  <TabsTrigger value="register">Register</TabsTrigger>
                </TabsList>
              </div>

              <form onSubmit={handleSubmit}>
                <TabsContent value="login" className="p-0">
                  <CardContent className="space-y-4 pt-6">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="your.email@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="password">Password</Label>
                        <Link 
                          to="/reset-password" 
                          className="text-sm text-blue-600 hover:text-blue-800"
                        >
                          Forgot password?
                        </Link>
                      </div>
                      <Input
                        id="password"
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>
                  </CardContent>
                  <CardFooter className="flex flex-col">
                    <Button 
                      type="submit" 
                      className="w-full mb-4"
                    >
                      <span className="flex items-center">
                        <LogIn className="mr-2 h-4 w-4" />
                        Login
                      </span>
                    </Button>
                    <p className="text-xs text-center text-muted-foreground">
                      By logging in, you agree to our Terms of Service and Privacy Policy
                    </p>
                  </CardFooter>
                </TabsContent>

                <TabsContent value="register" className="p-0">
                  <CardContent className="space-y-4 pt-6">
                    <div className="space-y-2">
                      <Label htmlFor="register-email">Email</Label>
                      <Input
                        id="register-email"
                        type="email"
                        placeholder="your.email@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-password">Password</Label>
                      <Input
                        id="register-password"
                        type="password"
                        placeholder="Create a password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                      <p className="text-xs text-muted-foreground">
                        Password must be at least 6 characters long
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="is-admin" checked={isAdmin} onCheckedChange={() => setIsAdmin(!isAdmin)} />
                      <label
                        htmlFor="is-admin"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Register as Administrator
                      </label>
                    </div>
                  </CardContent>
                  <CardFooter className="flex flex-col">
                    <Button
                      type="submit"
                      className="w-full mb-4"
                    >
                      <span className="flex items-center">
                        <UserPlus className="mr-2 h-4 w-4" />
                        Create Account
                      </span>
                    </Button>
                    <p className="text-xs text-center text-muted-foreground">
                      By creating an account, you agree to our Terms of Service and Privacy Policy
                    </p>
                  </CardFooter>
                </TabsContent>
              </form>
            </Tabs>
          </CardContent>
          <CardFooter className="border-t px-6 py-4 flex flex-col gap-3">
            <div className="text-xs text-center w-full text-muted-foreground">
              <p>Demo credentials: admin@company.com / password</p>
            </div>
            <div className="w-full flex justify-center pt-2">
              <Link to="/open-clock" className="text-sm text-primary hover:text-primary/80">
                Employee Clock-In Dashboard →
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
      
      {/* New Admin Footer */}
      <footer className="bg-brand-800 text-white p-4">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <Fingerprint className="h-5 w-5 mr-2" />
              <span className="font-semibold">BioPulse Admin Panel</span>
            </div>
            <div className="flex items-center space-x-6">
              <Link to="/auth" className="text-sm text-white/80 hover:text-white flex items-center">
                <LogIn className="h-4 w-4 mr-1" />
                Admin Login
              </Link>
              <a href="mailto:support@biopulse.com" className="text-sm text-white/80 hover:text-white">
                Support
              </a>
              <a href="https://biopulse.com/docs" target="_blank" rel="noopener noreferrer" className="text-sm text-white/80 hover:text-white flex items-center">
                Documentation
                <ExternalLink className="h-3 w-3 ml-1" />
              </a>
            </div>
          </div>
          <div className="text-center mt-4 text-xs text-white/60">
            &copy; {new Date().getFullYear()} BioPulse Inc. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Auth;
