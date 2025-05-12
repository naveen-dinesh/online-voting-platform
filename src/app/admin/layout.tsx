
"use client";

import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { ProtectedRoute } from "@/components/protected-route";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <SidebarProvider defaultOpen={true} open> {/* Keep sidebar open by default on desktop */}
        <div className="flex min-h-[calc(100vh-theme(spacing.20))]"> {/* Adjust min-height considering header */}
          <AdminSidebar />
          <SidebarInset className="flex flex-col"> {/* Use SidebarInset for main content area */}
            <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur md:px-6">
                <SidebarTrigger className="md:hidden" /> {/* Mobile trigger */}
                <h1 className="text-xl font-semibold">Admin Panel</h1>
            </header>
            <ScrollArea className="flex-1">
                <main className="p-4 md:p-6 lg:p-8">
                    {children}
                </main>
            </ScrollArea>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </ProtectedRoute>
  );
}
