
"use client";

import { BallotList } from "@/components/ballots/ballot-list";
import { ProtectedRoute } from "@/components/protected-route";
import { mockBallots } from "@/lib/mock-data"; 
import { useAuth } from "@/contexts/auth-context";
import { Loader2, Vote } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const { user, loading } = useAuth();

  // Filter ballots: active ones for voting, also show closed ones (results viewable from card)
  // Sort ballots: active first, then by end date (most recent first for closed)
  const displayBallots = mockBallots
    .filter(b => b.status === 'active' || b.status === 'closed')
    .sort((a, b) => {
      if (a.status === 'active' && b.status !== 'active') return -1;
      if (a.status !== 'active' && b.status === 'active') return 1;
      // If both same status, sort by end date descending for 'closed', or start date descending for 'active'
      if (a.status === 'closed') {
        return new Date(b.endDate).getTime() - new Date(a.endDate).getTime();
      }
      return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
    });

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-8rem)] w-full items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-3 text-lg">Loading Dashboard...</p>
      </div>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['voter', 'admin']}> {/* Admin can also see voter dashboard */}
      <div className="container mx-auto py-8 px-4">
        <div className="mb-10 p-6 md:p-8 rounded-xl shadow-lg bg-gradient-to-r from-primary via-primary/90 to-accent text-primary-foreground">
          <h1 className="text-3xl md:text-4xl font-bold">Welcome, {user?.name || user?.email}!</h1>
          <p className="mt-3 text-lg md:text-xl opacity-90">
            Your voice matters. Participate in ongoing ballots or review past outcomes.
          </p>
        </div>
        
        <div className="mb-10 relative aspect-[16/6] md:aspect-[16/5] w-full rounded-xl overflow-hidden shadow-2xl group">
            <Image 
              src="https://picsum.photos/1600/600" 
              alt="Diverse community engaging in voting" 
              layout="fill"
              objectFit="cover"
              data-ai-hint="voting community diversity"
              className="opacity-80 group-hover:opacity-90 transition-opacity duration-300 transform group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent flex flex-col items-center justify-end p-6 md:p-10 text-center">
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-3">Shape The Future</h2>
              <p className="text-md md:text-lg text-white/90 max-w-2xl">
                Every vote contributes to our collective direction. Explore available ballots and make your mark.
              </p>
            </div>
        </div>

        <BallotList 
          ballots={displayBallots} 
          userRole={user?.role || null} 
          listTitle="Ballots Overview" 
        />

        {displayBallots.length === 0 && (
          <div className="text-center py-12">
            <Vote className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-2xl font-semibold mb-2">No Ballots Yet</h3>
            <p className="text-muted-foreground mb-6">
              There are currently no active or past ballots to display. Check back soon!
            </p>
            {user?.role === 'admin' && (
              <Button asChild>
                <Link href="/admin/create-ballot">Create a New Ballot</Link>
              </Button>
            )}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
