
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm, Controller } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Trash2, CalendarIcon, Loader2, Save, ListChecks, HelpCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Ballot } from "@/types";
import { addBallot } from "@/lib/mock-data"; // Updated import
import { useAuth } from "@/contexts/auth-context";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";


const optionSchema = z.object({
  text: z.string().min(1, "Option text cannot be empty.").max(150, "Option text too long."),
});

const questionSchema = z.object({
  text: z.string().min(5, "Question text must be at least 5 characters.").max(300, "Question text too long."),
  type: z.enum(["single-choice", "multiple-choice"], { required_error: "Question type is required."}),
  options: z.array(optionSchema).min(2, "Each question must have at least two options.").max(10, "Maximum of 10 options per question."),
});

const ballotFormSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters.").max(100, "Title is too long."),
  description: z.string().min(10, "Description must be at least 10 characters.").max(500, "Description is too long."),
  startDate: z.date({ required_error: "Start date is required." }),
  endDate: z.date({ required_error: "End date is required." }),
  questions: z.array(questionSchema).min(1, "A ballot must have at least one question.").max(15, "Maximum of 15 questions per ballot."),
}).refine(data => data.endDate > data.startDate, {
  message: "End date must be after start date.",
  path: ["endDate"],
});

type BallotFormValues = z.infer<typeof ballotFormSchema>;

export function BallotCreationForm() {
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<BallotFormValues>({
    resolver: zodResolver(ballotFormSchema),
    defaultValues: {
      title: "",
      description: "",
      startDate: undefined,
      endDate: undefined,
      questions: [{ text: "", type: "single-choice", options: [{ text: "" }, { text: "" }] }],
    },
  });

  const { fields: questionFields, append: appendQuestion, remove: removeQuestion } = useFieldArray({
    control: form.control,
    name: "questions",
  });

  async function onSubmit(values: BallotFormValues) {
    setIsLoading(true);
    
    // Simulate API call & ballot creation
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Determine ballot status based on dates
    const now = new Date();
    let status: Ballot['status'] = 'draft'; // Default to draft
    if (values.startDate <= now && values.endDate >= now) {
      status = 'active';
    } else if (values.endDate < now) {
      status = 'closed';
    }
    // If startDate is in the future, it will remain 'draft' or could be 'upcoming' if we add that status.
    // For simplicity, new ballots are 'draft' if not immediately active.
    // However, if dates make it active, set to 'active'.

    const newBallot: Ballot = {
        id: `ballot-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        ...values,
        startDate: values.startDate.toISOString(),
        endDate: values.endDate.toISOString(),
        questions: values.questions.map((q, qIdx) => ({
            ...q,
            id: `q${qIdx+1}-${Date.now()}`,
            options: q.options.map((opt, oIdx) => ({
                ...opt,
                id: `q${qIdx+1}o${oIdx+1}-${Date.now()}`
            }))
        })),
        createdBy: user?.id || 'admin-unknown',
        createdAt: new Date().toISOString(),
        status: status,
    };
    
    addBallot(newBallot); // Use the imported function to add and save to localStorage
    console.log("New ballot created and saved to localStorage (mock):", newBallot);

    setIsLoading(false);
    toast({
      title: "Ballot Created Successfully!",
      description: `"${values.title}" has been saved with status: ${status}.`,
      variant: "default",
      duration: 5000,
    });
    router.push("/admin/dashboard"); 
  }

  return (
    <Card className="shadow-xl border-primary/10">
      <CardHeader className="pb-4">
        <div className="flex items-center space-x-3">
            <ListChecks className="h-8 w-8 text-accent" />
            <CardTitle className="text-2xl">Ballot Details</CardTitle>
        </div>
        <CardDescription>Fill in the information below to set up a new ballot. All fields are required.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Basic Ballot Info */}
            <div className="space-y-6 p-6 border rounded-lg bg-muted/20">
                <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel className="text-lg font-semibold">Ballot Title</FormLabel>
                    <FormControl><Input placeholder="e.g., Annual Board Election 2024" {...field} className="py-5 text-base" /></FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel className="text-lg font-semibold">Description</FormLabel>
                    <FormControl><Textarea placeholder="Provide a clear and concise overview of this ballot's purpose." {...field} rows={4} className="text-base" /></FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                    <FormItem className="flex flex-col">
                        <FormLabel className="text-lg font-semibold">Voting Start Date & Time</FormLabel>
                        <Popover>
                        <PopoverTrigger asChild>
                            <FormControl>
                            <Button
                                variant={"outline"}
                                className={cn(
                                "w-full justify-start text-left font-normal py-5 text-base",
                                !field.value && "text-muted-foreground"
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {field.value ? format(field.value, "PPP HH:mm") : <span>Pick a date and time</span>}
                            </Button>
                            </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={(date) => {
                                    // When a date is picked, preserve existing time or default to 00:00
                                    const newDate = date ? new Date(date) : undefined;
                                    if (newDate) {
                                        const hours = field.value?.getHours() ?? 0;
                                        const minutes = field.value?.getMinutes() ?? 0;
                                        newDate.setHours(hours, minutes, 0, 0);
                                    }
                                    field.onChange(newDate);
                                }}
                                disabled={(date) => date < new Date(new Date().setDate(new Date().getDate() -1)) } // Allow today
                                initialFocus
                            />
                            {/* Optional: Add Time Picker here if needed */}
                            <div className="p-2 border-t">
                                <Input 
                                    type="time"
                                    className="w-full"
                                    value={field.value ? format(field.value, "HH:mm") : ""}
                                    onChange={(e) => {
                                        const timeParts = e.target.value.split(':');
                                        const hours = parseInt(timeParts[0], 10);
                                        const minutes = parseInt(timeParts[1], 10);
                                        const newDateWithTime = field.value ? new Date(field.value) : new Date();
                                        if (!isNaN(hours) && !isNaN(minutes)) {
                                            newDateWithTime.setHours(hours, minutes, 0, 0);
                                            field.onChange(newDateWithTime);
                                        }
                                    }}
                                />
                            </div>
                        </PopoverContent>
                        </Popover>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="endDate"
                    render={({ field }) => (
                    <FormItem className="flex flex-col">
                        <FormLabel className="text-lg font-semibold">Voting End Date & Time</FormLabel>
                        <Popover>
                        <PopoverTrigger asChild>
                            <FormControl>
                            <Button
                                variant={"outline"}
                                className={cn(
                                "w-full justify-start text-left font-normal py-5 text-base",
                                !field.value && "text-muted-foreground"
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {field.value ? format(field.value, "PPP HH:mm") : <span>Pick a date and time</span>}
                            </Button>
                            </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={(date) => {
                                     const newDate = date ? new Date(date) : undefined;
                                    if (newDate) {
                                        const hours = field.value?.getHours() ?? 23;
                                        const minutes = field.value?.getMinutes() ?? 59;
                                        newDate.setHours(hours, minutes, 59, 999);
                                    }
                                    field.onChange(newDate);
                                }}
                                disabled={(date) => date < (form.getValues("startDate") || new Date(new Date().setDate(new Date().getDate())))} // Allow same day as start or future
                                initialFocus
                            />
                             <div className="p-2 border-t">
                                <Input 
                                    type="time"
                                    className="w-full"
                                    value={field.value ? format(field.value, "HH:mm") : ""}
                                     onChange={(e) => {
                                        const timeParts = e.target.value.split(':');
                                        const hours = parseInt(timeParts[0], 10);
                                        const minutes = parseInt(timeParts[1], 10);
                                        const newDateWithTime = field.value ? new Date(field.value) : new Date();
                                         if (!isNaN(hours) && !isNaN(minutes)) {
                                            newDateWithTime.setHours(hours, minutes, 59, 999); // Ensure seconds are set to 59 for end time
                                            field.onChange(newDateWithTime);
                                        }
                                    }}
                                />
                            </div>
                        </PopoverContent>
                        </Popover>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                </div>
            </div>


            {/* Questions Section */}
            <div className="space-y-8">
              <div className="flex justify-between items-center border-b pb-3">
                <h3 className="text-2xl font-semibold text-foreground">Questions</h3>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => appendQuestion({ text: "", type: "single-choice", options: [{ text: "" }, { text: "" }] })}
                    className="shadow-sm"
                >
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Question
                </Button>
              </div>
              {questionFields.map((questionItem, questionIndex) => (
                <Card key={questionItem.id} className="p-5 bg-card shadow-md border">
                  <div className="flex justify-between items-center mb-5">
                    <h4 className="text-xl font-medium text-primary">Question {questionIndex + 1}</h4>
                    {questionFields.length > 1 && (
                       <Button type="button" variant="ghost" size="icon" onClick={() => removeQuestion(questionIndex)} aria-label="Remove question" className="text-destructive hover:bg-destructive/10">
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    )}
                  </div>
                  <div className="space-y-4">
                    <FormField
                        control={form.control}
                        name={`questions.${questionIndex}.text`}
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel className="font-semibold">Question Text</FormLabel>
                            <FormControl><Textarea placeholder="e.g., Who should be the next project lead?" {...field} className="text-base" /></FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name={`questions.${questionIndex}.type`}
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel className="font-semibold">Question Type</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                                <SelectTrigger className="py-5 text-base">
                                <SelectValue placeholder="Select question type" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="single-choice">Single Choice (Radio Buttons)</SelectItem>
                                <SelectItem value="multiple-choice">Multiple Choice (Checkboxes)</SelectItem>
                            </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <OptionsArray questionIndex={questionIndex} control={form.control} form={form} />
                  </div>
                </Card>
              ))}
               {form.formState.errors.questions && typeof form.formState.errors.questions !== 'string' && !form.formState.errors.questions.message && (
                <FormMessage>{form.formState.errors.questions.root?.message || "Please ensure all questions are correctly filled."}</FormMessage>
               )}
                {typeof form.formState.errors.questions === 'string' && <FormMessage>{form.formState.errors.questions}</FormMessage>}


            </div>
            <CardFooter className="px-0 pt-8">
                <Button type="submit" size="lg" className="w-full md:w-auto py-7 text-lg shadow-md hover:shadow-lg" disabled={isLoading}>
                {isLoading ? (
                    <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Saving Ballot...
                    </>
                ) : (
                    <>
                    <Save className="mr-2 h-5 w-5" /> Create and Save Ballot
                    </>
                )}
                </Button>
            </CardFooter>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

// Helper component for managing options array within a question
function OptionsArray({ questionIndex, control, form }: { questionIndex: number; control: any, form: any }) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `questions.${questionIndex}.options`,
  });

  return (
    <div className="space-y-4 pt-3">
      <div className="flex justify-between items-center">
        <FormLabel className="font-semibold flex items-center">
            Answer Options
             <TooltipProvider delayDuration={100}>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button type="button" variant="ghost" size="icon" className="h-6 w-6 ml-1 text-muted-foreground hover:text-accent">
                            <HelpCircle className="h-4 w-4" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs bg-foreground text-background">
                        <p>Define the choices voters can select for this question. At least two options are required.</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        </FormLabel>
        <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => append({ text: "" })}
            className="shadow-sm"
        >
            <PlusCircle className="mr-1.5 h-4 w-4" /> Add Option
        </Button>
      </div>
      {fields.map((optionItem, optionIndex) => (
        <FormField
          key={optionItem.id}
          control={control}
          name={`questions.${questionIndex}.options.${optionIndex}.text`}
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center gap-3">
                <FormControl>
                  <Input placeholder={`Option ${optionIndex + 1} text`} {...field} className="py-5 text-base" />
                </FormControl>
                {fields.length > 2 && (
                  <Button type="button" variant="ghost" size="icon" onClick={() => remove(optionIndex)} aria-label="Remove option" className="text-destructive hover:bg-destructive/10">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
      ))}
      {/* Display root error for options array if exists */}
      {form.formState.errors.questions?.[questionIndex]?.options?.root && (
        <FormMessage>{form.formState.errors.questions[questionIndex].options.root.message}</FormMessage>
      )}
       {fields.length < 2 && (
         <p className="text-sm text-destructive">Must have at least two options.</p>
       )}
    </div>
  );
}

