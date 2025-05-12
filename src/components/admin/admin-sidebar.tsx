
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, FilePlus2, BarChartBig, Users, Settings, Vote, Home, LogOut } from "lucide-react"

import { cn } from "@/lib/utils"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarSeparator,
  useSidebar, // if needed for advanced control
} from "@/components/ui/sidebar" 
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"

const navItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/create-ballot", label: "Create Ballot", icon: FilePlus2 },
  { href: "/admin/voter-analysis", label: "Voter Analysis", icon: BarChartBig },
  // { href: "/admin/manage-users", label: "Manage Users", icon: Users }, // Example for future
  // { href: "/admin/manage-ballots", label: "Manage Ballots", icon: ListChecks }, // Example
];

const secondaryNavItems = [
    // { href: "/admin/settings", label: "Platform Settings", icon: Settings },
    { href: "/", label: "Back to Main Site", icon: Home },
];

export function AdminSidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuth();
  const { state: sidebarState } = useSidebar(); // Get sidebar state ('expanded' or 'collapsed')

  const getUserInitials = (name?: string, email?: string) => {
    if (name) {
      const parts = name.trim().split(' ');
      if (parts.length > 1 && parts[0] && parts[parts.length - 1]) return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
      if (parts[0] && parts[0].length >= 2) return parts[0].substring(0, 2).toUpperCase();
      if (parts[0]) return parts[0][0].toUpperCase();
    }
    if (email) return email.substring(0, 2).toUpperCase();
    return 'VW';
  };


  return (
    <Sidebar collapsible="icon" variant="sidebar" className="border-r bg-sidebar text-sidebar-foreground shadow-md">
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        <Link href="/admin/dashboard" className="flex items-center gap-2.5 group">
          <Vote className="w-9 h-9 text-sidebar-primary transition-transform group-hover:rotate-[15deg] group-hover:scale-110" />
          <div className="overflow-hidden transition-all duration-300 ease-in-out group-data-[collapsible=icon]:w-0 group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:hidden">
            <h1 className="text-2xl font-bold tracking-tight text-sidebar-primary">
              VoteWise
            </h1>
            <p className="text-xs text-sidebar-foreground/70 -mt-0.5">Admin Panel</p>
          </div>
        </Link>
      </SidebarHeader>
      
      <SidebarContent className="flex-1 p-2 space-y-1">
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <Link href={item.href} legacyBehavior passHref>
                <SidebarMenuButton
                  asChild // Important for Link integration
                  isActive={pathname === item.href || (item.href !== "/admin/dashboard" && pathname.startsWith(item.href))}
                  tooltip={{ children: item.label, side: "right", className: "bg-sidebar-primary text-sidebar-primary-foreground" }}
                  className="justify-start text-base h-11"
                  variant={pathname.startsWith(item.href) ? "default" : "ghost"} // Shadcn button variants
                >
                  <a> {/* Content of the button */}
                    <item.icon className="h-5 w-5 shrink-0" />
                    <span className="group-data-[collapsible=icon]:hidden truncate">{item.label}</span>
                  </a>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>

        <SidebarSeparator className="my-4" />
        
        <SidebarMenu>
             {secondaryNavItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <Link href={item.href} legacyBehavior passHref>
                <SidebarMenuButton
                  asChild
                  tooltip={{ children: item.label, side: "right", className: "bg-sidebar-primary text-sidebar-primary-foreground" }}
                  className="justify-start text-sm h-10"
                  variant="ghost"
                >
                  <a>
                    <item.icon className="h-5 w-5 shrink-0" />
                    <span className="group-data-[collapsible=icon]:hidden truncate">{item.label}</span>
                  </a>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
            <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={logout}
                  tooltip={{ children: "Logout", side: "right", className: "bg-destructive text-destructive-foreground" }}
                  className="justify-start text-sm h-10 text-destructive hover:bg-destructive/10 hover:text-destructive"
                  variant="ghost"
                >
                    <LogOut className="h-5 w-5 shrink-0" />
                    <span className="group-data-[collapsible=icon]:hidden truncate">Logout</span>
                </SidebarMenuButton>
            </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
      
      <SidebarFooter className="p-3 border-t border-sidebar-border">
          {user && (
            <div className={cn(
                "flex items-center gap-3 transition-opacity duration-300",
                sidebarState === 'collapsed' ? "opacity-0 pointer-events-none h-0" : "opacity-100 h-auto py-2"
                )}
            >
                <Avatar className="h-10 w-10 border-2 border-sidebar-primary/50">
                    <AvatarImage src={`https://avatar.vercel.sh/${user.email}.png?text=${getUserInitials(user.name, user.email)}`} alt={user.name || user.email || 'User'} />
                    <AvatarFallback className="bg-sidebar-primary/20 text-sidebar-primary font-semibold">
                        {getUserInitials(user.name, user.email)}
                    </AvatarFallback>
                </Avatar>
                <div className="overflow-hidden">
                    <p className="font-semibold text-sm truncate text-sidebar-foreground">{user.name || user.email}</p>
                    <p className="text-xs text-sidebar-foreground/70 capitalize truncate">{user.role}</p>
                </div>
            </div>
          )}
           {sidebarState === 'collapsed' && user && ( // Show only avatar when collapsed
             <div className="flex justify-center py-2">
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                             <Avatar className="h-10 w-10 border-2 border-sidebar-primary/50">
                                <AvatarImage src={`https://avatar.vercel.sh/${user.email}.png?text=${getUserInitials(user.name, user.email)}`} alt={user.name || user.email || 'User'} />
                                <AvatarFallback className="bg-sidebar-primary/20 text-sidebar-primary font-semibold">
                                    {getUserInitials(user.name, user.email)}
                                </AvatarFallback>
                            </Avatar>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="bg-sidebar-primary text-sidebar-primary-foreground">
                            <p>{user.name || user.email}</p>
                            <p className="text-xs capitalize">{user.role}</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
             </div>
           )}
      </SidebarFooter>
    </Sidebar>
  )
}
