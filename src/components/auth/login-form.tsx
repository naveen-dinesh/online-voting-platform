
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation"; // Removed useSearchParams as initialRole is passed as prop
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, ShieldEllipsis, Loader2, LogIn, UserCheck2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
});

type LoginFormProps = {
  initialRole?: 'voter' | 'admin';
};

export function LoginForm({ initialRole = 'voter' }: LoginFormProps) {
  const { login } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'voter' | 'admin'>(initialRole);

  // Update selectedRole if initialRole prop changes (e.g., due to query param)
  useEffect(() => {
    setSelectedRole(initialRole);
  }, [initialRole]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      const user = await login(values.email, selectedRole);
      if (user) {
        toast({
          title: "Login Successful!",
          description: `Welcome back, ${user.name || user.email}. Redirecting...`,
          variant: "default",
        });
        if (user.role === 'admin') {
          router.push("/admin/dashboard");
        } else {
          router.push("/dashboard");
        }
      } else {
        toast({
          title: "Login Failed",
          description: "Invalid email for the selected role, or user not found. Please check your credentials and try again.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "An Error Occurred",
        description: error.message || "Something went wrong during login. Please try again later.",
        variant: "destructive",
      });
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-md shadow-xl border-none md:border md:shadow-2xl">
      <CardHeader className="text-center pb-4">
        {selectedRole === 'admin' ? 
          <ShieldEllipsis className="mx-auto h-12 w-12 text-primary mb-3" strokeWidth={1.5} /> : 
          <UserCheck2 className="mx-auto h-12 w-12 text-primary mb-3" strokeWidth={1.5} />
        }
        <CardTitle className="text-3xl font-bold">
          {selectedRole === 'admin' ? 'Admin Portal' : 'Voter Access'}
        </CardTitle>
        <CardDescription className="pt-1">
          {selectedRole === 'admin' ? 'Manage elections and analyze voter data.' : 'Securely cast your vote in ongoing ballots.'}
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-2">
        <Tabs value={selectedRole} onValueChange={(value) => setSelectedRole(value as 'voter' | 'admin')} className="w-full mb-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="voter">Voter</TabsTrigger>
            <TabsTrigger value="admin">Administrator</TabsTrigger>
          </TabsList>
        </Tabs>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base">Email Address</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input 
                        type="email" 
                        placeholder={selectedRole === 'admin' ? "admin@example.com" : "voter@example.com"}
                        {...field} 
                        className="pl-12 py-6 text-base" // Increased padding and height
                        aria-describedby="email-error"
                        autoComplete="email"
                      />
                    </div>
                  </FormControl>
                  <FormMessage id="email-error" />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full py-6 text-lg font-semibold" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Authenticating...
                </>
              ) : (
                <>
                  <LogIn className="mr-2 h-5 w-5" />
                  {selectedRole === 'admin' ? 'Login as Admin' : 'Login / Register as Voter'}
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
      {/* Removed CardFooter with demo credentials */}
    </Card>
  );
}
