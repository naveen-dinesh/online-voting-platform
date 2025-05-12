"use client";

import Link from 'next/link';
import { Vote, LogIn, LogOut, UserCircle, LayoutDashboard, ShieldEllipsis, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function SiteHeader() {
  const { user, logout, isAdmin, isVoter } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/'); // Redirect to homepage after logout
  };

  const getUserInitials = (name?: string, email?: string) => {
    if (name) {
      const parts = name.trim().split(' ');
      if (parts.length > 1 && parts[0] && parts[parts.length - 1]) {
        return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
      }
      if (parts[0] && parts[0].length >=2) {
        return parts[0].substring(0, 2).toUpperCase();
      }
       if (parts[0] && parts[0].length === 1) {
        return parts[0][0].toUpperCase();
      }
    }
    if (email) {
      const emailPrefix = email.split('@')[0];
      return emailPrefix.substring(0, 2).toUpperCase();
    }
    return 'VW'; // VoteWise initials
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-20 items-center"> {/* Removed justify-between */}
        <Link href="/" className="flex items-center space-x-2 group">
          <Vote className="h-8 w-8 text-primary transition-transform group-hover:scale-110" />
          <span className="font-bold sm:inline-block text-2xl tracking-tight">
            VoteWise
          </span>
        </Link>
        
        {/* Future navigation links can go here */}
        {/* <nav className="flex items-center space-x-4 ml-4"> </nav> */} 

        <div className="flex items-center space-x-3 ml-auto"> {/* Added ml-auto */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0">
                  <Avatar className="h-10 w-10 border-2 border-primary/50">
                    <AvatarImage src={`https://avatar.vercel.sh/${user.email}.png?text=${getUserInitials(user.name, user.email)}`} alt={user.name || user.email || 'User Avatar'} />
                    <AvatarFallback className="bg-primary/20 text-primary font-semibold">
                      {getUserInitials(user.name, user.email)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1 py-1">
                    <p className="text-md font-semibold leading-none">{user.name || 'Valued User'}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground capitalize pt-1">
                      Role: {user.role}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {isVoter && (
                   <DropdownMenuItem onClick={() => router.push('/dashboard')} className="cursor-pointer">
                    <LayoutDashboard className="mr-2 h-4 w-4 text-accent" />
                    <span>Voter Dashboard</span>
                  </DropdownMenuItem>
                )}
                {isAdmin && (
                  <DropdownMenuItem onClick={() => router.push('/admin/dashboard')} className="cursor-pointer">
                    <ShieldEllipsis className="mr-2 h-4 w-4 text-accent" />
                    <span>Admin Panel</span>
                  </DropdownMenuItem>
                )}
                {/* <DropdownMenuItem onClick={() => router.push('/settings')} className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4 text-accent" />
                  <span>Account Settings</span>
                </DropdownMenuItem> */}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button onClick={() => router.push('/login')} variant="default" size="lg">
                 Login / Register
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

