
"use client";
import { LoginForm } from "@/components/auth/login-form";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import Image from "next/image";

function LoginPageContent() {
  const searchParams = useSearchParams();
  const roleParam = searchParams.get('role');
  const initialRole = roleParam === 'admin' ? 'admin' : 'voter';

  return (
    <div className="container flex min-h-[calc(100vh-10rem)] items-center justify-center py-12 px-4">
      <div className="grid md:grid-cols-2 gap-8 md:gap-16 items-center max-w-4xl w-full">
        <div className="hidden md:flex flex-col items-center justify-center space-y-4 p-8 bg-gradient-to-br from-primary to-accent rounded-xl shadow-2xl text-primary-foreground">
            <Image 
                src="https://picsum.photos/400/300"
                alt="Abstract representation of secure voting"
                width={400}
                height={300}
                className="rounded-lg mb-6 shadow-lg opacity-90"
                data-ai-hint="secure voting abstract"
            />
          <h2 className="text-3xl font-bold text-center">Welcome to VoteWise</h2>
          <p className="text-center text-primary-foreground/90">
            Securely cast your vote or manage elections with ease and confidence.
          </p>
        </div>
        <LoginForm initialRole={initialRole} />
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    // Using Suspense to wait for searchParams to be available
    <Suspense fallback={
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-3 text-lg">Loading Login...</p>
      </div>
    }>
      <LoginPageContent />
    </Suspense>
  );
}
