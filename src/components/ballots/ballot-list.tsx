
"use client";

import type { Ballot, User } from "@/types";
import { BallotCard } from "./ballot-card";
import { Info, LayoutGrid } from "lucide-react";

interface BallotListProps {
  ballots: Ballot[];
  userRole: User['role'] | null;
  listTitle?: string;
}

export function BallotList({ ballots, userRole, listTitle = "Available Ballots" }: BallotListProps) {
  if (!ballots || ballots.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-10 my-8 border-2 border-dashed rounded-lg shadow-sm bg-card">
        <Info className="h-16 w-16 text-muted-foreground mb-6" strokeWidth={1.5}/>
        <h3 className="text-2xl font-semibold mb-3 text-foreground">No Ballots Available</h3>
        <p className="text-muted-foreground max-w-md">
          There are currently no ballots to display. Please check back later or contact an administrator if you expect to see ballots here.
        </p>
      </div>
    );
  }

  return (
    <div className="py-6">
      {listTitle && (
        <div className="flex items-center mb-8 pb-3 border-b-2 border-primary/20">
          <LayoutGrid className="h-7 w-7 text-primary mr-3" />
          <h2 className="text-3xl font-bold text-foreground">{listTitle}</h2>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
        {ballots.map((ballot) => (
          <BallotCard key={ballot.id} ballot={ballot} userRole={userRole} />
        ))}
      </div>
    </div>
  );
}
