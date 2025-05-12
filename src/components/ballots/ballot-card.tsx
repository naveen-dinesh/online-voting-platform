
"use client";

import type { Ballot } from "@/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CalendarDays, CheckSquare, ListChecks, BarChart3, Clock, Edit3, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format, parseISO, isPast, isFuture } from 'date-fns';

interface BallotCardProps {
  ballot: Ballot;
  userRole: 'voter' | 'admin' | null;
}

export function BallotCard({ ballot, userRole }: BallotCardProps) {
  const formatDate = (dateString: string) => format(parseISO(dateString), "MMM d, yyyy 'at' h:mm a");

  const getStatusInfo = (status: Ballot['status'], startDate: string, endDate: string): { text: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ReactNode } => {
    const now = new Date();
    const start = parseISO(startDate);
    const end = parseISO(endDate);

    if (status === 'draft') {
      return { text: 'Draft', variant: 'outline', icon: <Edit3 className="mr-1.5 h-3.5 w-3.5" /> };
    }
    if (status === 'active') {
      if (isPast(end)) { // Should ideally be 'closed' but handle data inconsistency
        return { text: 'Ended', variant: 'secondary', icon: <Clock className="mr-1.5 h-3.5 w-3.5" /> };
      }
      if (isFuture(start)) {
        return { text: 'Upcoming', variant: 'default', icon: <Clock className="mr-1.5 h-3.5 w-3.5" /> };
      }
      return { text: 'Active', variant: 'default', icon: <CheckSquare className="mr-1.5 h-3.5 w-3.5 text-green-500" /> };
    }
    if (status === 'closed') {
      return { text: 'Closed', variant: 'secondary', icon: <Clock className="mr-1.5 h-3.5 w-3.5" /> };
    }
    return { text: 'Unknown', variant: 'outline', icon: <Info className="mr-1.5 h-3.5 w-3.5" /> };
  };
  
  const statusInfo = getStatusInfo(ballot.status, ballot.startDate, ballot.endDate);
  const canVote = ballot.status === 'active' && isFuture(parseISO(ballot.endDate)) && isPast(parseISO(ballot.startDate)) && userRole === 'voter';

  return (
    <Card className="flex flex-col h-full shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out bg-card rounded-lg overflow-hidden">
      <CardHeader className="p-5">
        <div className="flex justify-between items-start mb-2">
          <CardTitle className="text-xl font-semibold leading-tight text-foreground pr-2 line-clamp-2">{ballot.title}</CardTitle>
          <Badge variant={statusInfo.variant} className="capitalize whitespace-nowrap text-xs px-2.5 py-1 flex items-center">
            {statusInfo.icon}
            {statusInfo.text}
          </Badge>
        </div>
        <CardDescription className="text-sm text-muted-foreground line-clamp-3 h-[3.75rem]"> {/* Fixed height for 3 lines */}
          {ballot.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow p-5 space-y-3">
        <div className="text-xs text-muted-foreground space-y-1.5">
          <div className="flex items-center">
            <CalendarDays className="mr-2 h-4 w-4 text-accent" />
            <span>Starts: {formatDate(ballot.startDate)}</span>
          </div>
          <div className="flex items-center">
            <Clock className="mr-2 h-4 w-4 text-accent" />
            <span>Ends: {formatDate(ballot.endDate)}</span>
          </div>
          <div className="flex items-center">
            <ListChecks className="mr-2 h-4 w-4 text-accent" />
            <span>{ballot.questions.length} Question{ballot.questions.length === 1 ? '' : 's'}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row justify-end gap-3 p-5 border-t bg-muted/30">
        {canVote && (
          <Button asChild className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground" size="sm">
            <Link href={`/vote/${ballot.id}`} aria-label={`Vote on ${ballot.title}`}>
              <CheckSquare className="mr-2 h-4 w-4" /> Vote Now
            </Link>
          </Button>
        )}
         <Button asChild variant="outline" className="w-full sm:w-auto border-primary/50 text-primary hover:bg-primary/10 hover:text-primary" size="sm">
            <Link href={`/results/${ballot.id}`} aria-label={`View results for ${ballot.title}`}>
              <BarChart3 className="mr-2 h-4 w-4" /> View Results
            </Link>
          </Button>
      </CardFooter>
    </Card>
  );
}
