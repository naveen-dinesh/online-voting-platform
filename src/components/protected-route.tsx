
"use client";

import { useAuth } from "@/contexts/auth-context";
import { useRouter, usePathname } from "next/navigation"; // Added usePathname
import React, { useEffect, ReactNode } from "react";
import { Loader2, ShieldAlert } from "lucide-react"; // Added ShieldAlert for unauthorized access
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: Array<'voter' | 'admin'>;
}

export function ProtectedRoute({ children, allowedRoles = ['voter', 'admin'] }: ProtectedRouteProps) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname(); // Get current path

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // If not logged in, redirect to login, preserving intended destination
        toastAndRedirect("/login", `Please log in to access ${pathname}.`, "Login Required");
      } else if (!user.isVerified) {
        // If user is not verified (for future implementation, currently mock users are auto-verified)
        toastAndRedirect("/login?error=unverified", "Your account is not verified. Please verify your email.", "Account Not Verified");
      } else if (!allowedRoles.includes(user.role)) {
        // If user role is not allowed for this route
        const message = `You do not have permission to access this page with role: ${user.role}.`;
        toastAndRedirect(user.role === 'admin' ? "/admin/dashboard" : "/dashboard", message, "Access Denied", true);
      }
    }
  }, [user, loading, router, allowedRoles, pathname]);

  // Helper for toast (optional) and redirection
  const toastAndRedirect = (path: string, description: string, title: string, isAccessDenied: boolean = false) => {
    // In a real app, you might use a toast notification library here
    console.warn(`${title}: ${description} Redirecting to ${path}.`);
    if (isAccessDenied && path === pathname) { // Prevent redirect loop if already on their default dashboard
        return;
    }
    router.replace(path);
  };


  if (loading) {
    return (
      <div className="flex flex-col h-screen w-full items-center justify-center bg-background text-foreground p-4">
        <Loader2 className="h-16 w-16 animate-spin text-primary mb-6" />
        <p className="text-xl font-semibold">Securing your session...</p>
        <p className="text-muted-foreground">Please wait while we verify your access.</p>
      </div>
    );
  }

  if (!user || (user && (!user.isVerified || !allowedRoles.includes(user.role)))) {
     // This state typically means redirection is in progress or user is unauthorized.
     // A more graceful UI can be shown here for the brief moment before redirect completes.
     // Or, if redirection failed or is stuck, provide options.
    return (
      <div className="flex flex-col h-screen w-full items-center justify-center bg-background text-foreground p-6">
        <ShieldAlert className="h-16 w-16 text-destructive mb-6" />
        <Alert variant="destructive" className="max-w-lg text-center">
          <AlertTitle className="text-2xl font-bold">Access Restricted</AlertTitle>
          <AlertDescription className="text-base mt-2">
            {!user ? "You must be logged in to view this page." :
             !user.isVerified ? "Your account requires verification." :
             "You do not have the necessary permissions to access this area."}
          </AlertDescription>
        </Alert>
        <div className="mt-8 flex gap-4">
            <Button onClick={() => router.replace(!user ? `/login?redirect=${pathname}` : (user.role === 'admin' ? '/admin/dashboard' : '/dashboard'))} variant="default" size="lg">
                {!user ? "Go to Login" : "Go to My Dashboard"}
            </Button>
            {user && <Button onClick={() => logout()} variant="outline" size="lg">Logout</Button>}
        </div>

      </div>
    );
  }

  return <>{children}</>;
}
