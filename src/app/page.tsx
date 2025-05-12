
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, CheckCircle, Edit, FileText, BarChartBig, Users, ShieldCheck, Lightbulb, Users2, BarChart2, Zap } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function HomePage() {
  const features = [
    {
      icon: <FileText className="h-12 w-12 text-accent" strokeWidth={1.5}/>,
      title: "Effortless Ballot Creation",
      description: "Administrators can easily design and deploy comprehensive ballots with various question types and options.",
      dataAiHint: "document checklist"
    },
    {
      icon: <ShieldCheck className="h-12 w-12 text-accent" strokeWidth={1.5}/>,
      title: "Secure Voter Authentication",
      description: "Robust (mock) email verification and role-based access control ensure that only eligible voters participate securely.",
      dataAiHint: "security login"
    },
    {
      icon: <BarChartBig className="h-12 w-12 text-accent" strokeWidth={1.5}/>,
      title: "Real-Time Result Visualization",
      description: "Instantly view and analyze voting outcomes with clear, insightful charts and graphical representations.",
      dataAiHint: "data analytics"
    },
    {
      icon: <Zap className="h-12 w-12 text-accent" strokeWidth={1.5}/>, // Changed from Lightbulb for more "AI" feel
      title: "AI-Powered Trend Analysis",
      description: "Leverage AI to gain deep insights into voter trends and potential biases from anonymized data.",
      dataAiHint: "artificial intelligence brain"
    },
    {
      icon: <Users2 className="h-12 w-12 text-accent" strokeWidth={1.5}/>, // Changed from CheckCircle for better "Accessibility" representation
      title: "Accessibility Focused",
      description: "Designed to be inclusive, enabling participation for all users by adhering to accessibility standards.",
      dataAiHint: "inclusive community"
    },
    {
      icon: <CheckCircle className="h-12 w-12 text-accent" strokeWidth={1.5}/>,
      title: "Transparent & Auditable",
      description: "Maintain trust with a system designed for transparency (mock data for now, real system implies audit trails).",
      dataAiHint: "checkmark approved"
    }
  ];

  return (
    <div className="flex flex-col items-center">
      {/* Hero Section */}
      <section className="w-full py-24 md:py-32 lg:py-40 bg-gradient-to-br from-primary via-primary/90 to-accent/70 text-primary-foreground">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6">
            Empower Your Decisions with VoteWise
          </h1>
          <p className="mt-4 text-lg md:text-xl lg:text-2xl max-w-3xl mx-auto text-primary-foreground/90 mb-10">
            The secure, transparent, and accessible online voting platform designed for modern organizations and communities.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <Button asChild size="lg" className="bg-background text-primary hover:bg-background/80 shadow-lg px-8 py-7 text-lg transition-transform hover:scale-105">
              <Link href="/dashboard">Cast Your Vote <ArrowRight className="ml-2 h-5 w-5" /></Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-primary-foreground/50 text-primary-foreground hover:bg-primary-foreground/10 shadow-lg px-8 py-7 text-lg transition-transform hover:scale-105">
              <Link href="/login?role=admin">Admin Portal</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="w-full py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-foreground">
            Core Features of VoteWise
          </h2>
          <p className="text-center text-muted-foreground text-lg mb-16 max-w-2xl mx-auto">
            Discover the powerful tools that make VoteWise the ideal solution for your voting needs.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => (
              <Card key={feature.title} className="shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out transform hover:-translate-y-1 bg-card flex flex-col">
                <CardHeader className="items-center p-6">
                  {feature.icon}
                  <CardTitle className="mt-5 text-2xl text-center text-card-foreground">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow p-6 pt-0">
                  <CardDescription className="text-center text-card-foreground/80 text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
      
      {/* Image Banner Section */}
      <section className="w-full py-16 md:py-24 bg-secondary/30">
        <div className="container mx-auto px-4 md:px-6">
          <div className="relative aspect-[16/7] w-full max-w-5xl mx-auto rounded-xl overflow-hidden shadow-2xl">
            <Image 
              src="https://picsum.photos/1280/560" 
              alt="Diverse group of people collaborating and making decisions" 
              layout="fill"
              objectFit="cover"
              data-ai-hint="collaboration decision making"
              className="opacity-90"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent flex items-end justify-center p-8 md:p-12">
              <h3 className="text-3xl md:text-4xl font-semibold text-white text-center leading-tight">
                Modernizing Democracy, One Secure Vote at a Time.
              </h3>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="w-full py-20 md:py-28 bg-background">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-foreground">
            Ready to Experience Fair and Efficient Voting?
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-10">
            Join countless organizations leveraging VoteWise for transparent, secure, and accessible elections. Get started today and transform your decision-making process.
          </p>
          <Button asChild size="lg" className="px-10 py-7 text-lg shadow-md hover:shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105">
            <Link href="/login">Get Started with VoteWise</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
