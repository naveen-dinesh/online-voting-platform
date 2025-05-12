
export function SiteFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="py-8 md:px-8 md:py-10 border-t bg-muted/50">
      <div className="container flex flex-col items-center justify-between gap-6 md:h-24 md:flex-row">
        <div className="text-center md:text-left">
          <p className="text-sm font-medium text-foreground">
            &copy; {currentYear} VoteWise Platform
          </p>
          <p className="text-xs text-muted-foreground">
            Secure and accessible online voting for modern democracy.
          </p>
        </div>
        <nav className="flex gap-4 items-center">
           {/* Placeholder for future links like Privacy Policy, Terms of Service */}
          {/* <a
            href="#" 
            className="text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            Privacy Policy
          </a> */}
          <a
            href="#" // Replace with actual accessibility statement link
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-muted-foreground underline-offset-4 hover:text-primary hover:underline transition-colors"
            aria-label="Accessibility Statement (opens in a new tab)"
          >
            Accessibility Statement
          </a>
        </nav>
      </div>
    </footer>
  );
}
