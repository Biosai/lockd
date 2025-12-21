import Link from "next/link";
import { Github, Twitter } from "lucide-react";
import { Logo } from "@/components/ui/logo";

export function Footer() {
  return (
    <footer className="border-t border-border/40 bg-background">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="flex flex-col items-center justify-between gap-8 md:flex-row">
          {/* Logo & Description */}
          <div className="flex flex-col items-center gap-4 md:items-start">
            <Link href="/">
              <Logo size="sm" />
            </Link>
            <p className="text-center text-sm text-muted-foreground md:text-left">
              The trustless way to send crypto to anyone.
            </p>
          </div>

          {/* Links */}
          <div className="flex flex-wrap items-center justify-center gap-8">
            <Link
              href="/#how-it-works"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              How it Works
            </Link>
            <Link
              href="/#use-cases"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Use Cases
            </Link>
            <Link
              href="/app"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Launch App
            </Link>
          </div>

          {/* Social Links */}
          <div className="flex items-center gap-4">
            <Link
              href="https://github.com/your-username/lokd"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              <Github className="h-5 w-5" />
            </Link>
            <Link
              href="https://twitter.com/lokdxyz"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              <Twitter className="h-5 w-5" />
            </Link>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-border/40 pt-8 md:flex-row">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Lokd. Open source under MIT License.
          </p>
          <div className="flex items-center gap-4">
            <span className="text-xs text-muted-foreground">
              Built on Arbitrum & Ethereum
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
