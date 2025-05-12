
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { mockBallots, mockUsers, mockVotes } from "@/lib/mock-data";
import { FilePlus2, Users, BarChartBig, CheckSquare, Clock, ShieldCheck, Activity, ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function AdminDashboardPage() {
  const totalBallots = mockBallots.length;
  const activeBallots = mockBallots.filter(b => b.status === 'active').length;
  const closedBallots = mockBallots.filter(b => b.status === 'closed').length;
  const draftBallots = mockBallots.filter(b => b.status === 'draft').length;
  
  // Consider only verified users for 'Registered Users' count if applicable
  const totalUsers = mockUsers.filter(u => u.isVerified).length; 
  const totalVotesCasted = mockVotes.length;

  const stats = [
    { title: "Total Ballots", value: totalBallots, icon: <CheckSquare className="h-7 w-7 text-primary" />, description: "All created ballots" },
    { title: "Active Ballots", value: activeBallots, icon: <Clock className="h-7 w-7 text-green-600" />, description: "Currently open for voting" },
    { title: "Registered Users", value: totalUsers, icon: <Users className="h-7 w-7 text-blue-600" />, description: "Verified platform users" },
    { title: "Total Votes Cast", value: totalVotesCasted, icon: <BarChartBig className="h-7 w-7 text-purple-600" />, description: "Across all closed ballots" },
  ];

  const quickActions = [
    { title: "Create New Ballot", description: "Set up a new election or poll.", href:"/admin/create-ballot", icon: <FilePlus2 className="h-8 w-8 text-accent"/>, cta: "Create Ballot" },
    { title: "Analyze Voter Data", description: "Gain insights from voting patterns.", href:"/admin/voter-analysis", icon: <BarChartBig className="h-8 w-8 text-accent"/>, cta: "Analyze Data" },
    // { title: "Manage Users", description: "Oversee user accounts and roles.", href:"#", icon: <Users className="h-8 w-8 text-accent"/>, cta: "Manage Users" },
  ]

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
        <div>
            <h1 className="text-4xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-muted-foreground mt-1">Overview of the VoteWise platform activity and status.</p>
        </div>
        <Button asChild size="lg" className="shadow-md hover:shadow-lg transition-transform hover:scale-105">
          <Link href="/admin/create-ballot">
            <FilePlus2 className="mr-2 h-5 w-5" /> Create New Ballot
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {stats.map(stat => (
          <Card key={stat.title} className="shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out transform hover:-translate-y-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-medium text-foreground">{stat.title}</CardTitle>
              {stat.icon}
            </CardHeader>
            <CardContent>
              <div className={`text-4xl font-bold text-foreground`}>{stat.value}</div>
              <p className="text-xs text-muted-foreground pt-1">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Quick Actions */}
       <Card className="shadow-lg">
        <CardHeader>
            <CardTitle className="text-2xl">Quick Actions</CardTitle>
            <CardDescription>Perform common administrative tasks efficiently.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
            {quickActions.map(action => (
                <Card key={action.title} className="hover:shadow-md transition-shadow bg-card flex flex-col">
                    <CardHeader className="flex flex-row items-start gap-4 space-y-0">
                        <div className="p-3 rounded-full bg-accent/10 text-accent">
                             {action.icon}
                        </div>
                        <div>
                            <CardTitle className="text-xl">{action.title}</CardTitle>
                            <CardDescription className="mt-1">{action.description}</CardDescription>
                        </div>
                    </CardHeader>
                    <CardFooter className="mt-auto pt-4">
                        <Button variant="default" className="w-full sm:w-auto" asChild>
                            <Link href={action.href}>{action.cta} <ArrowRight className="ml-2 h-4 w-4" /></Link>
                        </Button>
                    </CardFooter>
                </Card>
            ))}
        </CardContent>
       </Card>

      {/* System Status & Info */}
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">Platform Health</CardTitle>
             <CardDescription>Overview of the VoteWise system status.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
              <span className="text-muted-foreground flex items-center"><Activity className="mr-2 h-4 w-4 text-green-500"/> System Status:</span>
              <span className="font-semibold text-green-600">Operational</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
              <span className="text-muted-foreground">AI Analysis Module:</span>
              <span className="font-semibold text-green-600">Active & Ready</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
              <span className="text-muted-foreground">Active Ballots:</span>
              <span className="font-semibold">{activeBallots}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
              <span className="text-muted-foreground">Platform Version:</span>
              <span className="font-semibold">1.0.0 (Stable)</span>
            </div>
          </CardContent>
        </Card>
         <Card className="shadow-lg">
            <CardHeader>
                <CardTitle className="text-2xl">Recent Activity</CardTitle>
                <CardDescription>A snapshot of recent platform events (mock data).</CardDescription>
            </CardHeader>
            <CardContent>
                {mockBallots.slice(0, 3).map(ballot => (
                    <div key={ballot.id} className="flex items-center justify-between py-3 border-b last:border-none">
                        <div>
                            <p className="font-medium text-foreground">{ballot.title}</p>
                            <p className="text-xs text-muted-foreground">
                                Status: <span className={`capitalize font-semibold ${ballot.status === 'active' ? 'text-green-600' : ballot.status === 'closed' ? 'text-red-600' : 'text-gray-600'}`}>{ballot.status}</span>
                                {ballot.status === 'active' && ` (Ends: ${new Date(ballot.endDate).toLocaleDateString()})`}
                            </p>
                        </div>
                        <Button variant="outline" size="sm" asChild>
                            <Link href={ballot.status === 'active' ? `/vote/${ballot.id}` : `/results/${ballot.id}`}>
                                {ballot.status === 'active' ? "View" : "Results"}
                            </Link>
                        </Button>
                    </div>
                ))}
                {mockBallots.length === 0 && <p className="text-muted-foreground">No recent ballot activity.</p>}
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
