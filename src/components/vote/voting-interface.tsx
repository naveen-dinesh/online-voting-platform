
"use client";

import type { Ballot, User, Vote } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useState, FormEvent, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { AlertCircle, CheckCircle2, Loader2, Send, Info, VoteIcon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { mockVotes, addVote, mockUsers } from "@/lib/mock-data"; 
import { isFuture, parseISO } from 'date-fns';
import Link from "next/link";

interface VotingInterfaceProps {
  ballot: Ballot;
  user: User | null; 
}

export function VotingInterface({ ballot, user }: VotingInterfaceProps) {
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const { toast } = useToast();
  const router = useRouter();
  const [hasVoted, setHasVoted] = useState<boolean>(false);
  const [checkingVoteStatus, setCheckingVoteStatus] = useState<boolean>(true);

  useEffect(() => {
    if (user && ballot) {
      setCheckingVoteStatus(true);
      // Check if the user has already voted using the potentially localStorage-loaded mockVotes
      const existingVote = mockVotes.find(v => v.ballotId === ballot.id && v.voterId === user.id);
      setHasVoted(!!existingVote);
      setCheckingVoteStatus(false);
    }
  }, [ballot, user]);


  if (!user) {
    toast({ title: "Authentication Error", description: "User not found. Please log in.", variant: "destructive" });
    router.push('/login');
    return null;
  }

  if (checkingVoteStatus) {
    return (
      <div className="flex flex-col h-[calc(50vh)] w-full items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="ml-3 text-lg mt-3">Checking your voting status...</p>
      </div>
    );
  }

  if (hasVoted) { 
    const canViewResults = ballot.status === 'closed' || (ballot.status === 'active' && !isFuture(parseISO(ballot.endDate)));
    return (
      <Card className="w-full max-w-2xl mx-auto shadow-xl my-8 border-accent/30">
        <CardHeader className="bg-accent/5 p-6 rounded-t-lg">
            <div className="flex items-center space-x-3">
                <VoteIcon className="h-8 w-8 text-accent" />
                <CardTitle className="text-2xl md:text-3xl font-bold text-accent">Vote Already Submitted</CardTitle>
            </div>
        </CardHeader>
        <CardContent className="p-6 text-center">
          <p className="text-lg text-foreground mb-6">
            You have already cast your vote for "{ballot.title}". Thank you for your participation!
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild variant="outline">
              <Link href="/dashboard">Return to Dashboard</Link>
            </Button>
            {canViewResults && (
              <Button asChild>
                <Link href={`/results/${ballot.id}`}>View Results</Link>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }
  
  const handleSingleChoiceChange = (questionId: string, optionId: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: [optionId] }));
    setSubmissionError(null); 
  };

  const handleMultipleChoiceChange = (questionId: string, optionId: string, checked: boolean | 'indeterminate') => {
    setAnswers(prev => {
      const currentOptions = prev[questionId] || [];
      if (checked === true) {
        return { ...prev, [questionId]: [...currentOptions, optionId] };
      } else {
        return { ...prev, [questionId]: currentOptions.filter(id => id !== optionId) };
      }
    });
    setSubmissionError(null);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setSubmissionError(null);

    for (const question of ballot.questions) {
      if (!answers[question.id] || answers[question.id].length === 0) {
        const errorMessage = `Please answer all questions. Question "${question.text}" is unanswered.`;
        setSubmissionError(errorMessage);
        setIsLoading(false);
        toast({
          title: "Incomplete Ballot",
          description: `Please answer: "${question.text}".`,
          variant: "destructive",
        });
        const firstUnansweredFieldset = document.getElementById(`fieldset-${question.id}`);
        if (firstUnansweredFieldset) firstUnansweredFieldset.focus();
        return;
      }
    }
    
    const newVote: Vote = {
      id: `vote-${Date.now()}-${user.id.slice(0,5)}`,
      ballotId: ballot.id,
      voterId: user.id,
      answers: Object.entries(answers).map(([questionId, selectedOptionIds]) => ({
        questionId,
        selectedOptionIds,
      })),
      submittedAt: new Date().toISOString(),
    };

    console.log("Submitting vote:", newVote);
    await new Promise(resolve => setTimeout(resolve, 1200)); 
    
    try {
      addVote(newVote); 
      setHasVoted(true); 

      const ballotIsEffectivelyActive = ballot.status === 'active' && isFuture(parseISO(ballot.endDate));
      const currentUser = mockUsers.find(u => u.id === user.id);

      let toastTitle = "Vote Submitted Successfully!";
      let toastDescription = `Thank you for your participation in "${ballot.title}".`;
      let redirectPath = "/dashboard";

      if (currentUser?.role === 'voter') {
        if (ballotIsEffectivelyActive) {
          toastDescription += " Results will be available after the ballot closes.";
        } else {
          toastDescription += " Viewing results.";
          redirectPath = `/results/${ballot.id}`;
        }
      } else if (currentUser?.role === 'admin') {
        // For admins, always redirect to results if vote is successful (first time)
        toastTitle = "Vote Submitted (Admin)";
        toastDescription = `Viewing results for "${ballot.title}".`;
        redirectPath = `/results/${ballot.id}`;
      }


      toast({
        title: toastTitle,
        description: toastDescription,
        variant: "default",
        duration: 5000,
        action: (redirectPath.startsWith('/results') ? 
          <Button variant="outline" size="sm" onClick={() => router.push(redirectPath)}>
            View Results
          </Button> : undefined
        )
      });
      router.push(redirectPath);

    } catch (e: any) {
      if (e.message === "ALREADY_VOTED") {
        setHasVoted(true); // Ensure UI reflects this state
        toast({
          title: "Already Voted",
          description: "Your vote has already been recorded for this ballot.",
          variant: "destructive"
        });
      } else {
        console.error("Submission error:", e);
        setSubmissionError(e.message || "An unexpected error occurred during submission.");
        toast({
          title: "Submission Error",
          description: e.message || "Failed to submit your vote. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto shadow-xl my-8 border-primary/20 transform transition-all hover:shadow-2xl">
      <CardHeader className="bg-gradient-to-br from-primary/5 via-background to-background p-6 rounded-t-lg">
        <div className="flex items-center space-x-3 mb-2">
            <Send className="h-8 w-8 text-primary" />
            <CardTitle className="text-3xl md:text-4xl font-bold text-primary">{ballot.title}</CardTitle>
        </div>
        <CardDescription className="text-base text-muted-foreground leading-relaxed">{ballot.description}</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="p-6 space-y-10">
          {ballot.questions.map((question, index) => (
            <fieldset key={question.id} id={`fieldset-${question.id}`} className="border-t-2 border-accent/30 pt-8 rounded-md" tabIndex={-1}>
              <legend className="text-xl md:text-2xl font-semibold mb-5 text-foreground px-2">
                Question {index + 1}: <span className="font-normal">{question.text}</span>
              </legend>
              {question.type === 'single-choice' ? (
                <RadioGroup
                  onValueChange={(value) => handleSingleChoiceChange(question.id, value)}
                  value={answers[question.id]?.[0] || ""}
                  aria-label={question.text}
                  className="space-y-3"
                >
                  {question.options.map(option => (
                    <Label 
                      key={option.id} 
                      htmlFor={`${question.id}-${option.id}`}
                      className="flex items-center space-x-3 p-4 rounded-lg border-2 border-muted hover:border-accent transition-all duration-200 cursor-pointer has-[:checked]:bg-accent/10 has-[:checked]:border-accent has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring has-[:focus-visible]:ring-offset-2"
                    >
                      <RadioGroupItem value={option.id} id={`${question.id}-${option.id}`} className="h-5 w-5 border-2"/>
                      <span className="text-base font-medium text-foreground flex-1">{option.text}</span>
                    </Label>
                  ))}
                </RadioGroup>
              ) : (
                <div className="space-y-3">
                  {question.options.map(option => (
                    <Label 
                      key={option.id} 
                      htmlFor={`${question.id}-${option.id}`}
                      className="flex items-center space-x-3 p-4 rounded-lg border-2 border-muted hover:border-accent transition-all duration-200 cursor-pointer has-[:checked]:bg-accent/10 has-[:checked]:border-accent has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring has-[:focus-visible]:ring-offset-2"
                    >
                      <Checkbox
                        id={`${question.id}-${option.id}`}
                        checked={(answers[question.id] || []).includes(option.id)}
                        onCheckedChange={(checked) => handleMultipleChoiceChange(question.id, option.id, checked)}
                        aria-label={option.text}
                        className="h-5 w-5 border-2"
                      />
                      <span className="text-base font-medium text-foreground flex-1">{option.text}</span>
                    </Label>
                  ))}
                </div>
              )}
            </fieldset>
          ))}
          {submissionError && (
            <Alert variant="destructive" className="mt-8">
              <AlertCircle className="h-5 w-5" />
              <AlertTitle className="text-lg">Submission Error</AlertTitle>
              <AlertDescription>{submissionError}</AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter className="p-6 border-t mt-6">
          <Button 
            type="submit" 
            className="w-full text-xl py-7 font-semibold tracking-wide" 
            disabled={isLoading || hasVoted} 
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-3 h-6 w-6 animate-spin" /> Processing Your Vote...
              </>
            ) : hasVoted ? (
              <>
                <CheckCircle2 className="mr-3 h-6 w-6" /> Vote Submitted
              </>
            ) : (
              <>
                <CheckCircle2 className="mr-3 h-6 w-6" /> Cast My Vote Securely
              </>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

