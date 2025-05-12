
"use client";

import { useParams } from 'next/navigation';
import { ProtectedRoute } from "@/components/protected-route";
import { VotingInterface } from "@/components/vote/voting-interface";
import { mockBallots } from "@/lib/mock-data";
import { useAuth } from "@/contexts/auth-context";
import { AlertTriangle, Loader2, Frown } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import React from "react"; // Import React for React.use

export default function VotePage() {
  const routeParams = useParams<{ ballotId: string }>();
  // It's good practice to ensure routeParams is not null or undefined if that's possible,
  // though useParams in app router usually returns an object.
  const ballotId = routeParams?.ballotId;

  const { user, loading: authLoading } = useAuth();
  // In a real app, fetch ballot data from a backend API
  const ballot = ballotId ? mockBallots.find(b => b.id === ballotId) : undefined;

  if (authLoading) {
     return (
      <div className="flex flex-col h-[calc(100vh-8rem)] w-full items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-3 text-lg mt-4">Loading Voting Session...</p>
      </div>
    );
  }
  
  if (!ballot) {
    return (
      <div className="container mx-auto py-12 text-center flex flex-col items-center">
        <Alert variant="destructive" className="max-w-lg w-full shadow-md">
            <AlertTriangle className="h-5 w-5" />
            <AlertTitle className="text-xl">Ballot Not Found</AlertTitle>
            <AlertDescription className="mt-1">
              The ballot you are trying to access (ID: {ballotId || 'N/A'}) could not be found. It might have been removed or the ID is incorrect.
            </AlertDescription>
        </Alert>
        <Button asChild className="mt-6">
            <Link href="/dashboard">Return to Dashboard</Link>
        </Button>
      </div>
    );
  }

  if (ballot.status !== 'active' || new Date(ballot.endDate) < new Date() || new Date(ballot.startDate) > new Date()) {
     let reason = "This ballot is not currently active for voting.";
     if (ballot.status === 'closed' || new Date(ballot.endDate) < new Date()) reason = "This ballot has ended.";
     if (ballot.status === 'draft') reason = "This ballot is still in draft status.";
     if (new Date(ballot.startDate) > new Date()) reason = "This ballot has not started yet.";

    return (
      <div className="container mx-auto py-12 text-center flex flex-col items-center">
        <Alert className="max-w-lg w-full shadow-md bg-card border-yellow-500 text-yellow-700 [&>svg]:text-yellow-500">
            <Frown className="h-5 w-5" />
            <AlertTitle className="text-xl text-yellow-700">Voting Not Available</AlertTitle>
            <AlertDescription className="mt-1 text-yellow-600">
              {reason}
            </AlertDescription>
        </Alert>
         <Button asChild className="mt-6">
            <Link href={ballot.status === 'closed' ? `/results/${ballot.id}` : "/dashboard"}>
                {ballot.status === 'closed' ? "View Results" : "Return to Dashboard"}
            </Link>
        </Button>
      </div>
    );
  }


  return (
    <ProtectedRoute allowedRoles={['voter']}>
      <div className="container mx-auto py-8 px-4">
        <VotingInterface ballot={ballot} user={user} />
      </div>
    </ProtectedRoute>
  );
}

