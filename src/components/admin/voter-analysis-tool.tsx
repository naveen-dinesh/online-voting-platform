
"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Lightbulb, FileText, ListChecks, SearchCheck, Info, Wand2 } from "lucide-react";
import { analyzeVoterTrends } from "@/ai/flows/analyze-voter-trends";
import type { AnalyzeVoterTrendsInput, AnalyzeVoterTrendsOutput } from "@/ai/flows/analyze-voter-trends";
import { mockAnonymizedVoterData } from "@/lib/mock-data";
import { ScrollArea } from "@/components/ui/scroll-area";

const analysisFormSchema = z.object({
  anonymizedVoterData: z.string()
    .min(10, "Please provide valid JSON data for analysis.")
    .refine((data) => {
      try {
        JSON.parse(data);
        return true;
      } catch (e) {
        return false;
      }
    }, "Data must be in valid JSON format."),
});

type AnalysisFormValues = z.infer<typeof analysisFormSchema>;

export function VoterAnalysisTool() {
  const [analysisResult, setAnalysisResult] = useState<AnalyzeVoterTrendsOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<AnalysisFormValues>({
    resolver: zodResolver(analysisFormSchema),
    defaultValues: {
      anonymizedVoterData: "", 
    },
  });
  
  // Pre-fill form with mock data for demonstration, runs only once on mount
  useEffect(() => {
    form.setValue("anonymizedVoterData", mockAnonymizedVoterData);
  }, [form]);


  async function onSubmit(values: AnalysisFormValues) {
    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);

    try {
      const input: AnalyzeVoterTrendsInput = {
        anonymizedVoterData: values.anonymizedVoterData,
      };
      const result = await analyzeVoterTrends(input);
      setAnalysisResult(result);
    } catch (e: any) {
      console.error("Analysis error:", e);
      let errorMessage = "Failed to analyze data. An unexpected error occurred. Please ensure the data is valid JSON and try again.";
      if (e instanceof SyntaxError) { // This check is implicitly handled by Zod refine, but good for direct calls
        errorMessage = "Invalid JSON format. Please check your data structure.";
      } else if (e.message) {
        errorMessage = `An error occurred: ${e.message}`;
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <Card className="shadow-xl border-primary/10">
        <CardHeader className="pb-4">
            <div className="flex items-center space-x-3">
                 <Wand2 className="h-8 w-8 text-accent" />
                <CardTitle className="text-2xl">AI Analysis Configuration</CardTitle>
            </div>
          <CardDescription>
            Input anonymized and aggregated voter data (in JSON format) below. The AI will identify trends, potential biases, and provide recommendations.
            <br /> Note: The AI model uses a built-in tool to simulate filtering for verified voter data.
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent>
              <FormField
                control={form.control}
                name="anonymizedVoterData"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg font-semibold">Anonymized Voter Data (JSON)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder='Paste your JSON data here. An example is pre-filled for demonstration.'
                        {...field}
                        rows={12}
                        className="font-mono text-sm leading-relaxed bg-muted/30 border-input focus:border-accent"
                        aria-describedby="voter-data-description"
                      />
                    </FormControl>
                    <FormDescription id="voter-data-description" className="flex items-center gap-1.5">
                      <Info className="h-4 w-4 text-muted-foreground"/>
                      Ensure this data is aggregated and does not contain any personally identifiable information.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isLoading} size="lg" className="text-base py-6 px-8 shadow-md hover:shadow-lg">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Analyzing Data...
                  </>
                ) : (
                  <>
                    <SearchCheck className="mr-2 h-5 w-5" /> Initiate AI Analysis
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>

      {error && (
        <Alert variant="destructive" className="shadow-md">
          <Lightbulb className="h-5 w-5" />
          <AlertTitle className="text-lg">Analysis Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {analysisResult && (
        <Card className="shadow-xl mt-8 border-accent/20">
          <CardHeader className="bg-accent/5 p-5 rounded-t-lg">
             <div className="flex items-center space-x-3">
                <FileText className="h-8 w-8 text-accent" />
                <CardTitle className="text-2xl text-accent">AI Analysis Results</CardTitle>
            </div>
            <CardDescription>Below are the insights generated by the AI model based on the provided data.</CardDescription>
          </CardHeader>
          <CardContent className="p-5 space-y-6">
            <div className="bg-muted/40 p-4 rounded-md">
              <h3 className="text-xl font-semibold mb-2 flex items-center text-foreground">
                <FileText className="mr-2 h-5 w-5 text-primary" />
                Summary of Findings
              </h3>
              <ScrollArea className="h-auto max-h-48 w-full">
                <p className="text-foreground/80 leading-relaxed whitespace-pre-wrap">{analysisResult.summary}</p>
              </ScrollArea>
            </div>
            <div className="bg-muted/40 p-4 rounded-md">
              <h3 className="text-xl font-semibold mb-3 flex items-center text-foreground">
                <ListChecks className="mr-2 h-5 w-5 text-primary" />
                Key Insights
              </h3>
              <ScrollArea className="h-auto max-h-60 w-full">
                <ul className="space-y-2">
                    {analysisResult.keyInsights.map((insight, index) => (
                    <li key={index} className="flex items-start p-2.5 rounded-md border border-border bg-background/50">
                        <Lightbulb className="h-4 w-4 text-accent mr-2.5 mt-1 shrink-0" />
                        <span className="text-foreground/80">{insight}</span>
                    </li>
                    ))}
                </ul>
              </ScrollArea>
            </div>
            <div className="bg-muted/40 p-4 rounded-md">
              <h3 className="text-xl font-semibold mb-2 flex items-center text-foreground">
                <Wand2 className="mr-2 h-5 w-5 text-primary" />
                Actionable Recommendations
              </h3>
              <ScrollArea className="h-auto max-h-48 w-full">
                 <p className="text-foreground/80 leading-relaxed whitespace-pre-wrap">{analysisResult.recommendations}</p>
              </ScrollArea>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
