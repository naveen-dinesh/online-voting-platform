
"use client";

import { useParams } from 'next/navigation';
import { ProtectedRoute } from "@/components/protected-route";
import { ResultsCharts } from "@/components/results/results-charts";
import { mockBallots, getMockResults } from "@/lib/mock-data";
import { AlertTriangle, Loader2, BarChartHorizontalBig, Frown, Info } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import type { ResultData, Ballot } from "@/types"; 
import { useAuth } from "@/contexts/auth-context";
import { isFuture, parseISO } from 'date-fns';

export default function ResultsPage() {
  const routeParams = useParams<{ ballotId: string }>();
  const ballotId = routeParams?.ballotId;
  const { user, loading: authLoading } = useAuth();

  const [ballot, setBallot] = useState<Ballot | undefined>(undefined);
  const [results, setResults] = useState<ResultData[] | null>(null);
  const [localLoading, setLocalLoading] = useState(true);

  useEffect(() => {
    // Don't proceed if auth is still loading
    if (authLoading) {
      // Set localLoading to true if auth is loading, to show combined loading state
      setLocalLoading(true); 
      return;
    }
    // If auth is done, but no ballotId, stop local loading (error will be caught by !ballotId check later)
    if (!ballotId) {
        setLocalLoading(false);
        return;
    }

    setLocalLoading(true); // Start local loading for ballot/results fetch
    const foundBallot = mockBallots.find(b => b.id === ballotId);
    setBallot(foundBallot);
    if (foundBallot) {
      const fetchedResults = getMockResults(ballotId);
      setResults(fetchedResults);
    } else {
      setResults(null); 
    }
    // Simulate API delay
    setTimeout(() => setLocalLoading(false), 500); 
  }, [ballotId, authLoading]);


  if (authLoading || localLoading) {
    return (
      <div className="flex flex-col h-[calc(100vh-8rem)] w-full items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-3 text-lg mt-4">Loading Results...</p>
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
              The ballot for which you are trying to view results (ID: {ballotId || 'N/A'}) could not be found.
            </AlertDescription>
        </Alert>
        <Button asChild className="mt-6">
            <Link href="/dashboard">Return to Dashboard</Link>
        </Button>
      </div>
    );
  }

  // Voter restriction: cannot see results for active ballots that haven't ended yet
  if (user && user.role === 'voter' && ballot.status === 'active' && isFuture(parseISO(ballot.endDate))) {
    return (
      <ProtectedRoute allowedRoles={['voter']}>
        <div className="container mx-auto py-12 text-center flex flex-col items-center">
          <Alert variant="default" className="max-w-lg w-full shadow-md border-primary/20 bg-primary/5">
            <Info className="h-5 w-5 text-primary" />
            <AlertTitle className="text-xl text-primary">Results Not Yet Available</AlertTitle>
            <AlertDescription className="mt-1 text-foreground/80">
              Results for "{ballot.title}" are not available to voters while the ballot is still active.
              Please check back after the voting period has ended on {new Date(ballot.endDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}.
            </AlertDescription>
          </Alert>
          <Button asChild className="mt-6">
            <Link href="/dashboard">Return to Dashboard</Link>
          </Button>
        </div>
      </ProtectedRoute>
    );
  }
  

  if (!results || results.length === 0) {
     return (
      <div className="container mx-auto py-12 text-center flex flex-col items-center">
        <Alert className="max-w-lg w-full shadow-md bg-card border-blue-500 text-blue-700 [&>svg]:text-blue-500">
            <Frown className="h-5 w-5" />
            <AlertTitle className="text-xl text-blue-700">No Results Yet</AlertTitle>
            <AlertDescription className="mt-1 text-blue-600">
              There are no results to display for "{ballot.title}" yet. 
              {ballot.status === 'active' ? " Voting might still be in progress or no votes have been cast." : " No votes were recorded for this ballot."}
            </AlertDescription>
        </Alert>
        <Button asChild className="mt-6">
            <Link href="/dashboard">Return to Dashboard</Link>
        </Button>
      </div>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['voter', 'admin']}> {/* Both voters and admins can see results (with above voter restriction) */}
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8 p-6 rounded-xl shadow-lg bg-gradient-to-r from-accent via-accent/90 to-primary/80 text-accent-foreground">
            <div className="flex items-center space-x-3">
                <BarChartHorizontalBig className="h-10 w-10" />
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold">Voting Results</h1>
                    <p className="text-lg opacity-90">Detailed breakdown for "{ballot.title}"</p>
                </div>
            </div>
        </div>
        <ResultsCharts results={results} ballotTitle={ballot.title} />
      </div>
    </ProtectedRoute>
  );
}
