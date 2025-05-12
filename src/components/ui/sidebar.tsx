
"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { VariantProps, cva } from "class-variance-authority"
import { PanelLeft, PanelLeftOpen, PanelRightOpen } from "lucide-react" // Added PanelLeftOpen, PanelRightOpen for better UX

import { useIsMobile } from "@/hooks/use-mobile" // Ensure this hook exists and works
import { cn } from "@/lib/utils"
import { Button, buttonVariants } from "@/components/ui/button" // Ensure buttonVariants is exported
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetTrigger as ShadSheetTrigger } from "@/components/ui/sheet" // Added SheetTrigger
import { Skeleton } from "@/components/ui/skeleton"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const SIDEBAR_COOKIE_NAME = "sidebar_state_votewise" // Unique cookie name
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 30 // 30 days
const SIDEBAR_WIDTH = "17rem" // Slightly wider for better readability
const SIDEBAR_WIDTH_MOBILE = "18rem"
const SIDEBAR_WIDTH_ICON = "3.5rem" // Standard icon size + padding
const SIDEBAR_KEYBOARD_SHORTCUT = "b"

type SidebarContextValue = {
  state: "expanded" | "collapsed"
  open: boolean
  setOpen: (open: boolean) => void
  openMobile: boolean
  setOpenMobile: (open: boolean) => void
  isMobile: boolean
  toggleSidebar: () => void
  side: "left" | "right"
}

const SidebarContext = React.createContext<SidebarContextValue | null>(null)

function useSidebar() {
  const context = React.useContext(SidebarContext)
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider.")
  }
  return context
}

const SidebarProvider = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    defaultOpen?: boolean
    open?: boolean
    onOpenChange?: (open: boolean) => void
    side?: "left" | "right" // Added side prop to provider
  }
>(
  (
    {
      defaultOpen = true,
      open: openProp,
      onOpenChange: setOpenProp,
      className,
      style,
      children,
      side = "left", // Default side
      ...props
    },
    ref
  ) => {
    const isMobile = useIsMobile()
    const [openMobile, setOpenMobile] = React.useState(false)
    const [_open, _setOpen] = React.useState(defaultOpen)
    
    const open = openProp !== undefined ? openProp : _open;

    const setOpen = React.useCallback(
      (value: boolean | ((currentOpen: boolean) => boolean)) => {
        const newOpenState = typeof value === "function" ? value(open) : value;
        if (setOpenProp) {
          setOpenProp(newOpenState);
        } else {
          _setOpen(newOpenState);
        }
        if (typeof document !== 'undefined') {
          document.cookie = `${SIDEBAR_COOKIE_NAME}=${newOpenState}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}; SameSite=Lax`;
        }
      },
      [setOpenProp, open]
    );
    
    React.useEffect(() => {
      if (typeof document !== 'undefined') {
        const cookieValue = document.cookie
          .split("; ")
          .find((row) => row.startsWith(`${SIDEBAR_COOKIE_NAME}=`))
          ?.split("=")[1];
        if (cookieValue !== undefined && openProp === undefined) { // Only apply cookie if not controlled
          setOpen(cookieValue === "true");
        }
      }
    }, [openProp, setOpen]);


    const toggleSidebar = React.useCallback(() => {
      return isMobile
        ? setOpenMobile((current) => !current)
        : setOpen((current) => !current)
    }, [isMobile, setOpen, setOpenMobile])

    React.useEffect(() => {
      const handleKeyDown = (event: KeyboardEvent) => {
        if (
          event.key === SIDEBAR_KEYBOARD_SHORTCUT &&
          (event.metaKey || event.ctrlKey)
        ) {
          event.preventDefault()
          toggleSidebar()
        }
      }
      window.addEventListener("keydown", handleKeyDown)
      return () => window.removeEventListener("keydown", handleKeyDown)
    }, [toggleSidebar])

    const state = open ? "expanded" : "collapsed"

    const contextValue = React.useMemo<SidebarContextValue>(
      () => ({
        state,
        open,
        setOpen,
        isMobile,
        openMobile,
        setOpenMobile,
        toggleSidebar,
        side, // Provide side through context
      }),
      [state, open, setOpen, isMobile, openMobile, setOpenMobile, toggleSidebar, side]
    )

    return (
      <SidebarContext.Provider value={contextValue}>
        <TooltipProvider delayDuration={100}>
          <div
            style={
              {
                "--sidebar-width": SIDEBAR_WIDTH,
                "--sidebar-width-icon": SIDEBAR_WIDTH_ICON,
                ...style,
              } as React.CSSProperties
            }
            className={cn(
              "group/sidebar-wrapper flex min-h-svh w-full",
              className
            )}
            ref={ref}
            {...props}
          >
            {children}
          </div>
        </TooltipProvider>
      </SidebarContext.Provider>
    )
  }
)
SidebarProvider.displayName = "SidebarProvider"

const Sidebar = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    // side prop is now handled by SidebarProvider
    variant?: "sidebar" | "floating" | "inset"
    collapsible?: "offcanvas" | "icon" | "none"
  }
>(
  (
    {
      variant = "sidebar",
      collapsible = "icon", // Default to icon collapsible
      className,
      children,
      ...props
    },
    ref
  ) => {
    const { isMobile, state, openMobile, setOpenMobile, side } = useSidebar()

    if (collapsible === "none") { // Non-collapsible sidebar
      return (
        <div
          className={cn(
            "flex h-full w-[--sidebar-width] flex-col bg-sidebar text-sidebar-foreground",
            side === "left" ? "border-r border-sidebar-border" : "border-l border-sidebar-border",
            className
          )}
          ref={ref}
          {...props}
        >
          {children}
        </div>
      )
    }

    // Mobile sidebar (uses ShadCN Sheet)
    if (isMobile) {
      return (
        <Sheet open={openMobile} onOpenChange={setOpenMobile}>
          {/* Trigger is usually placed in header, not part of Sidebar component itself */}
          <SheetContent
            side={side} // Use side from context
            data-sidebar="sidebar"
            data-mobile="true"
            className="w-[--sidebar-width-mobile] bg-sidebar p-0 text-sidebar-foreground shadow-xl [&>button]:hidden" // No default close button
            {...props} // Spread props here for SheetContent
          >
            <div className="flex h-full w-full flex-col">{children}</div>
          </SheetContent>
        </Sheet>
      )
    }

    // Desktop sidebar
    return (
      <aside // Use aside for semantic HTML
        ref={ref}
        className={cn("group peer hidden md:block text-sidebar-foreground transition-all duration-300 ease-in-out", className)}
        data-state={state}
        data-collapsible={state === "collapsed" ? collapsible : ""}
        data-variant={variant}
        data-side={side}
        {...props}
      >
        {/* Spacer div for layout pushing */}
        <div
          className={cn(
            "relative h-svh bg-transparent transition-[width] duration-300 ease-in-out",
            "w-[--sidebar-width]", // Default width for expanded
            collapsible === "icon" && state === "collapsed" && "w-[--sidebar-width-icon]",
            collapsible === "offcanvas" && state === "collapsed" && "w-0",
            variant === "floating" && state === "collapsed" && "w-[calc(var(--sidebar-width-icon)_+_theme(spacing.4))]",
            variant === "inset" && state === "collapsed" && "w-[calc(var(--sidebar-width-icon)_+_theme(spacing.4))]"
          )}
        />
        {/* Actual sidebar content container */}
        <div
          className={cn(
            "fixed inset-y-0 z-40 flex h-svh flex-col transition-[width,transform] duration-300 ease-in-out",
            "bg-sidebar", // Common background
            side === "left" ? "left-0 border-r border-sidebar-border" : "right-0 border-l border-sidebar-border",
            
            // Widths based on state and collapsible type
            "w-[--sidebar-width]", // Expanded
            collapsible === "icon" && state === "collapsed" && "w-[--sidebar-width-icon]",
            collapsible === "offcanvas" && state === "collapsed" && 
              (side === "left" ? "-translate-x-full" : "translate-x-full"),

            // Variants specific styling
            variant === "floating" && "m-2 h-[calc(100svh-theme(spacing.4))] rounded-lg shadow-xl",
            variant === "floating" && state === "collapsed" && collapsible === "icon" && "w-[calc(var(--sidebar-width-icon)_+_theme(spacing.4))]",
            
            variant === "inset" && "border-0", // Inset usually doesn't have its own border
            variant === "inset" && state === "collapsed" && collapsible === "icon" && "w-[calc(var(--sidebar-width-icon)_+_theme(spacing.4))]"
          )}
        >
          {children}
        </div>
      </aside>
    )
  }
)
Sidebar.displayName = "Sidebar"


const SidebarTrigger = React.forwardRef<
  React.ElementRef<typeof Button>,
  React.ComponentProps<typeof Button> & { srText?: string }
>(({ className, onClick, srText = "Toggle Sidebar", ...props }, ref) => {
  const { toggleSidebar, open, isMobile, side } = useSidebar();
  const Icon = isMobile 
    ? (side === "left" ? PanelLeftOpen : PanelRightOpen) // Show appropriate icon for mobile sheet trigger
    : (open ? PanelLeftOpen : PanelRightOpen); // For desktop, toggle between open/close icons

  const CompToRender = isMobile ? ShadSheetTrigger : Button;

  return (
    <CompToRender
      ref={ref}
      data-sidebar="trigger"
      variant="ghost"
      size="icon"
      className={cn("h-8 w-8 shrink-0", className)} // Standard size
      onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(event);
        toggleSidebar();
      }}
      {...props}
    >
      <Icon className="h-5 w-5" />
      <span className="sr-only">{srText}</span>
    </CompToRender>
  );
});
SidebarTrigger.displayName = "SidebarTrigger";


const SidebarInset = React.forwardRef<
  HTMLElement, // Use HTMLElement for main
  React.HTMLAttributes<HTMLElement> // Use HTMLAttributes for main
>(({ className, ...props }, ref) => {
  const { state, side } = useSidebar();
  return (
    <main
      ref={ref}
      className={cn(
        "relative flex min-h-svh flex-1 flex-col bg-background transition-[margin-left,margin-right] duration-300 ease-in-out",
        // Adjust margin based on sidebar state and side for non-inset variants
        "md:peer-data-[variant=sidebar]:peer-data-[state=expanded]:" + (side === 'left' ? 'ml-[--sidebar-width]' : 'mr-[--sidebar-width]'),
        "md:peer-data-[variant=sidebar]:peer-data-[state=collapsed]:peer-data-[collapsible=icon]:" + (side === 'left' ? 'ml-[--sidebar-width-icon]' : 'mr-[--sidebar-width-icon]'),
        
        // Specific inset styling (often involves padding or different bg)
        "peer-data-[variant=inset]:bg-transparent", // Inset typically doesn't push, content flows around/under
        // "md:peer-data-[variant=inset]:p-2", // Example: inset might have padding
        
        className
      )}
      {...props}
    />
  )
})
SidebarInset.displayName = "SidebarInset"

const SidebarInput = React.forwardRef<
  React.ElementRef<typeof Input>,
  React.ComponentProps<typeof Input>
>(({ className, ...props }, ref) => {
  return (
    <Input
      ref={ref}
      data-sidebar="input"
      className={cn(
        "h-9 w-full bg-sidebar-background text-sidebar-foreground shadow-none ring-offset-sidebar-background focus-visible:ring-2 focus-visible:ring-sidebar-ring",
        "group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:my-1 group-data-[collapsible=icon]:h-7 group-data-[collapsible=icon]:w-7 group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:text-transparent group-data-[collapsible=icon]:focus:w-full group-data-[collapsible=icon]:focus:p-2 group-data-[collapsible=icon]:focus:text-sidebar-foreground",
        className
      )}
      {...props}
    />
  )
})
SidebarInput.displayName = "SidebarInput"

const SidebarHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      data-sidebar="header"
      className={cn("flex flex-col gap-2 p-3", className)} // Adjusted padding
      {...props}
    />
  )
})
SidebarHeader.displayName = "SidebarHeader"

const SidebarFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      data-sidebar="footer"
      className={cn("mt-auto flex flex-col gap-2 p-3", className)} // Adjusted padding, mt-auto
      {...props}
    />
  )
})
SidebarFooter.displayName = "SidebarFooter"

const SidebarSeparator = React.forwardRef<
  React.ElementRef<typeof Separator>,
  React.ComponentProps<typeof Separator>
>(({ className, ...props }, ref) => {
  return (
    <Separator
      ref={ref}
      data-sidebar="separator"
      className={cn("mx-2 my-1 w-auto bg-sidebar-border", className)}
      {...props}
    />
  )
})
SidebarSeparator.displayName = "SidebarSeparator"

const SidebarContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      data-sidebar="content"
      className={cn(
        "flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto overflow-x-hidden p-1", // Adjusted padding and gap
        "group-data-[collapsible=icon]:overflow-hidden",
        className
      )}
      {...props}
    />
  )
})
SidebarContent.displayName = "SidebarContent"

const SidebarGroup = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      data-sidebar="group"
      className={cn("relative flex w-full min-w-0 flex-col p-1", className)} // Adjusted padding
      {...props}
    />
  )
})
SidebarGroup.displayName = "SidebarGroup"

const SidebarGroupLabel = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "div"
  return (
    <Comp
      ref={ref}
      data-sidebar="group-label"
      className={cn(
        "flex h-8 shrink-0 items-center rounded-md px-2 text-xs font-semibold tracking-wide text-sidebar-foreground/60 outline-none transition-opacity duration-200 ease-linear focus-visible:ring-2 focus-visible:ring-sidebar-ring",
        "group-data-[collapsible=icon]:pointer-events-none group-data-[collapsible=icon]:opacity-0", // Fade out label when collapsed
        className
      )}
      {...props}
    />
  )
})
SidebarGroupLabel.displayName = "SidebarGroupLabel"

const SidebarGroupAction = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button"
  return (
    <Comp
      ref={ref}
      data-sidebar="group-action"
      className={cn(
        "absolute right-2 top-1.5 flex aspect-square w-6 items-center justify-center rounded-md p-0 text-sidebar-foreground/70 outline-none ring-sidebar-ring transition-opacity hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0",
        "after:absolute after:-inset-1.5 after:md:hidden", // Larger hit area on mobile
        "group-data-[collapsible=icon]:hidden", // Hide action when collapsed
        className
      )}
      {...props}
    />
  )
})
SidebarGroupAction.displayName = "SidebarGroupAction"


const SidebarMenu = React.forwardRef<
  HTMLUListElement,
  React.HTMLAttributes<HTMLUListElement> // Use HTMLAttributes for ul
>(({ className, ...props }, ref) => (
  <ul
    ref={ref}
    data-sidebar="menu"
    className={cn("flex w-full min-w-0 flex-col gap-0.5", className)} // Small gap between items
    {...props}
  />
))
SidebarMenu.displayName = "SidebarMenu"

const SidebarMenuItem = React.forwardRef<
  HTMLLIElement,
  React.HTMLAttributes<HTMLLIElement> // Use HTMLAttributes for li
>(({ className, ...props }, ref) => (
  <li
    ref={ref}
    data-sidebar="menu-item"
    className={cn("group/menu-item relative", className)}
    {...props}
  />
))
SidebarMenuItem.displayName = "SidebarMenuItem"

const sidebarMenuButtonVariants = cva(
  "peer/menu-button flex w-full items-center gap-2.5 overflow-hidden rounded-md px-2.5 py-2 text-left text-sm outline-none ring-offset-sidebar-background ring-sidebar-ring transition-all duration-200 ease-in-out hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent/90 active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-60 group-has-[[data-sidebar=menu-action]]/menu-item:pr-8 aria-disabled:pointer-events-none aria-disabled:opacity-60 data-[active=true]:bg-sidebar-primary data-[active=true]:font-semibold data-[active=true]:text-sidebar-primary-foreground data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground group-data-[collapsible=icon]:h-9 group-data-[collapsible=icon]:w-9 group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:!p-0 [&>span:last-child]:truncate group-data-[collapsible=icon]:[&>span:last-child]:hidden [&>svg]:size-5 [&>svg]:shrink-0",
  {
    variants: {
      variant: { // Renamed from ShadCN's button variants to avoid conflict if used together
        default: "", // Default is primary-like active, ghost-like inactive
        ghost: "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground",
      },
      size: { // Sidebar specific sizes
        default: "h-10 text-sm", // Standard size
        sm: "h-9 text-xs",
        lg: "h-12 text-base group-data-[collapsible=icon]:h-10 group-data-[collapsible=icon]:w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)


const SidebarMenuButton = React.forwardRef<
  HTMLButtonElement, // Assuming it's a button, or could be Slot for Link
  React.ButtonHTMLAttributes<HTMLButtonElement> & { // Use ButtonHTMLAttributes
    asChild?: boolean
    isActive?: boolean
    tooltip?: string | Omit<React.ComponentProps<typeof TooltipContent>, "children"> & { children: React.ReactNode } // Allow full TooltipContent props
  } & VariantProps<typeof sidebarMenuButtonVariants>
>(
  (
    {
      asChild = false,
      isActive = false,
      variant = "default", // Use sidebarMenuButtonVariants
      size = "default",    // Use sidebarMenuButtonVariants
      tooltip,
      className,
      children, // Explicitly include children
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";
    const { isMobile, state: sidebarState } = useSidebar(); // Renamed 'state' to 'sidebarState' to avoid conflict

    const buttonElement = (
      <Comp
        ref={ref}
        data-sidebar="menu-button"
        data-size={size} // Keep custom data attributes if needed
        data-active={isActive}
        className={cn(sidebarMenuButtonVariants({ variant, size, className }))} // Pass className here
        {...props}
      >
        {children}
      </Comp>
    );

    if (!tooltip || (sidebarState === "expanded" && !isMobile)) { // Show tooltip only when collapsed or on mobile if configured
      return buttonElement;
    }

    const tooltipContentProps = typeof tooltip === "string" ? { children: tooltip } : tooltip;

    return (
      <Tooltip>
        <TooltipTrigger asChild>{buttonElement}</TooltipTrigger>
        <TooltipContent
          side="right"
          align="center"
          alignOffset={4} // Slight offset
          {...tooltipContentProps} // Spread all tooltip content props
        />
      </Tooltip>
    );
  }
);
SidebarMenuButton.displayName = "SidebarMenuButton";

const SidebarMenuAction = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    asChild?: boolean
    showOnHover?: boolean
  }
>(({ className, asChild = false, showOnHover = true, ...props }, ref) => { // showOnHover default true
  const Comp = asChild ? Slot : "button"
  return (
    <Comp
      ref={ref}
      data-sidebar="menu-action"
      className={cn(
        "absolute right-1.5 top-1/2 -translate-y-1/2 flex aspect-square w-6 items-center justify-center rounded-md p-0 text-sidebar-foreground/70 outline-none ring-sidebar-ring transition-opacity hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 peer-hover/menu-button:text-sidebar-accent-foreground [&>svg]:size-4 [&>svg]:shrink-0",
        "after:absolute after:-inset-1.5 after:md:hidden",
        "group-data-[collapsible=icon]:hidden",
        showOnHover && "opacity-0 group-focus-within/menu-item:opacity-100 group-hover/menu-item:opacity-100 data-[state=open]:opacity-100 peer-data-[active=true]/menu-button:opacity-100",
        className
      )}
      {...props}
    />
  )
})
SidebarMenuAction.displayName = "SidebarMenuAction"

const SidebarMenuBadge = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-sidebar="menu-badge"
    className={cn(
      "absolute right-2 top-1/2 -translate-y-1/2 flex h-5 min-w-5 items-center justify-center rounded-full bg-sidebar-primary px-1.5 text-xs font-medium tabular-nums text-sidebar-primary-foreground select-none pointer-events-none",
      "group-data-[collapsible=icon]:hidden", // Hide badge when collapsed
      className
    )}
    {...props}
  />
))
SidebarMenuBadge.displayName = "SidebarMenuBadge"


const SidebarMenuSkeleton = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    showIcon?: boolean;
    count?: number; // Number of skeleton items to render
  }
>(({ className, showIcon = true, count = 3, ...props }, ref) => {
  return (
    <div ref={ref} className={cn("space-y-1 p-1", className)} {...props}>
      {Array.from({ length: count }).map((_, index) => {
        const width = `${Math.floor(Math.random() * 30) + 60}%`; // Random width 60-90%
        return (
          <div
            key={index}
            data-sidebar="menu-skeleton-item"
            className="flex h-10 animate-pulse items-center gap-2.5 rounded-md bg-sidebar-foreground/5 px-2.5"
          >
            {showIcon && (
              <Skeleton
                className="size-5 shrink-0 rounded-sm bg-sidebar-foreground/10"
                data-sidebar="menu-skeleton-icon"
              />
            )}
            <Skeleton
              className="h-4 flex-1 rounded-sm bg-sidebar-foreground/10"
              data-sidebar="menu-skeleton-text"
              style={{ maxWidth: width }}
            />
          </div>
        );
      })}
    </div>
  );
});
SidebarMenuSkeleton.displayName = "SidebarMenuSkeleton";


export {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  // SidebarGroupContent, // This component was not defined in the provided code, remove if not used.
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  sidebarMenuButtonVariants, // Export variants
  SidebarMenuItem,
  SidebarMenuSkeleton,
  // SidebarMenuSub, // These were not fully defined/used, comment out if not needed
  // SidebarMenuSubButton,
  // SidebarMenuSubItem,
  SidebarProvider,
  // SidebarRail, // This was not fully defined/used
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
}

// Note: Some sub-components like SidebarGroupContent, SidebarMenuSub*, SidebarRail were either missing 
// or not fully implemented in the provided user code. They are commented out or removed if not essential.
// Ensure all exported components are properly defined and used.
