
import { RegisterForm } from "@/components/auth/register-form";
import type { Metadata } from 'next';
import Image from "next/image";

export const metadata: Metadata = {
  title: 'Register | VoteWise',
  description: 'Create your VoteWise account to participate in secure online voting.',
};

export default function RegisterPage() {
  return (
    <div className="container flex min-h-[calc(100vh-10rem)] items-center justify-center py-12 px-4">
      <div className="grid md:grid-cols-2 gap-8 md:gap-16 items-center max-w-4xl w-full">
         <div className="hidden md:flex flex-col items-center justify-center space-y-4 p-8 bg-gradient-to-br from-accent to-primary rounded-xl shadow-2xl text-primary-foreground">
            <Image 
                src="https://picsum.photos/400/300?grayscale" // Grayscale for a slightly different feel from login
                alt="Community members joining together"
                width={400}
                height={300}
                className="rounded-lg mb-6 shadow-lg opacity-90"
                data-ai-hint="community joining"
            />
          <h2 className="text-3xl font-bold text-center">Join VoteWise Today</h2>
          <p className="text-center text-primary-foreground/90">
            Register to make your voice heard and participate in transparent decision-making.
          </p>
        </div>
        <RegisterForm />
      </div>
    </div>
  );
}
