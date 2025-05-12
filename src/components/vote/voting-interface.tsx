
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
import { AlertCircle, CheckCircle2, Loader2, Send, Info } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { mockVotes } from "@/lib/mock-data"; // For simulating vote submission
import { isFuture, parseISO } from 'date-fns';

interface VotingInterfaceProps {
  ballot: Ballot;
  user: User | null; // User should always be present due to ProtectedRoute
}

export function VotingInterface({ ballot, user }: VotingInterfaceProps) {
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  // Pre-fill answers if user has already voted (for future enhancement, not used in mock)
  // useEffect(() => {
  //   // Example: const existingVote = mockVotes.find(v => v.ballotId === ballot.id && v.voterId === user?.id);
  //   // if (existingVote) { ... setAnswers ... }
  // }, [ballot.id, user?.id]);

  if (!user) {
    // Should be caught by ProtectedRoute, but as a fallback
    toast({ title: "Authentication Error", description: "User not found. Please log in.", variant: "destructive" });
    router.push('/login');
    return null;
  }
  
  const handleSingleChoiceChange = (questionId: string, optionId: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: [optionId] }));
    setSubmissionError(null); // Clear error on interaction
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
    setSubmissionError(null); // Clear error on interaction
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setSubmissionError(null);

    // Validation: ensure all questions are answered
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
        // Focus on the first unanswered question (enhancement)
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
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1200)); 
    
    // In a real app, this would be an API call to save the vote.
    // For demo, add to mockVotes. This won't persist across page reloads unless mock-data is updated to handle it.
    // mockVotes.push(newVote); // This is problematic if mockVotes is not mutable or stateful. For demo, we'll assume it's logged.

    setIsLoading(false);

    const ballotIsEffectivelyActive = ballot.status === 'active' && isFuture(parseISO(ballot.endDate));

    if (user.role === 'admin') { 
      toast({
        title: "Vote Submitted Successfully! (Admin Action)",
        description: `Viewing results for "${ballot.title}".`,
        variant: "default",
        duration: 5000,
      });
      router.push(`/results/${ballot.id}`);
    } else if (user.role === 'voter') {
      if (ballotIsEffectivelyActive) {
        toast({
          title: "Vote Submitted Successfully!",
          description: `Thank you for your participation. Results for "${ballot.title}" will be available after the ballot closes.`,
          variant: "default",
          duration: 6000,
        });
        router.push('/dashboard'); 
      } else { 
        toast({
          title: "Vote Submitted Successfully!",
          description: `Thank you for your participation. Viewing results for "${ballot.title}".`,
          variant: "default",
          duration: 5000,
          action: (
            <Button variant="outline" size="sm" onClick={() => router.push(`/results/${ballot.id}`)}>
              View Results
            </Button>
          )
        });
        router.push(`/results/${ballot.id}`);
      }
    } else { 
        toast({title: "Vote Submitted!", description: "Redirecting to dashboard."});
        router.push('/dashboard');
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
          <Button type="submit" className="w-full text-xl py-7 font-semibold tracking-wide" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-3 h-6 w-6 animate-spin" /> Processing Your Vote...
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
