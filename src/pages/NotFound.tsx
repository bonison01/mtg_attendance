
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="text-center max-w-md">
        <div className="flex justify-center mb-6">
          <div className="h-20 w-20 rounded-full bg-red-100 flex items-center justify-center">
            <AlertCircle className="h-10 w-10 text-red-600" />
          </div>
        </div>
        <h1 className="text-4xl font-bold mb-2">404</h1>
        <h2 className="text-xl font-semibold mb-4">Page Not Found</h2>
        <p className="text-muted-foreground mb-6">
          The page you are looking for might have been removed, had its name
          changed, or is temporarily unavailable.
        </p>
        <Link to="/">
          <Button>Return to Dashboard</Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
