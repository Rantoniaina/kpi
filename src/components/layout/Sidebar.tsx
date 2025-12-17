import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { ChangelogDialog } from "@/components/ui/changelog-dialog";
import { APP_VERSION } from "@/lib/constants";

interface NavItem {
  label: string;
  href: string;
  icon: string;
}

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/", icon: "📊" },
  { label: "Developers", href: "/developers", icon: "👥" },
  { label: "Tickets", href: "/tickets", icon: "🎫" },
  { label: "Bugs", href: "/bugs", icon: "🐛" },
  { label: "Reports", href: "/reports", icon: "📈" },
  { label: "Settings", href: "/settings", icon: "⚙️" },
];

export function Sidebar() {
  const [showChangelog, setShowChangelog] = useState(false);

  return (
    <>
      <aside className="flex h-screen w-64 flex-col border-r border-border bg-card">
        {/* Logo */}
        <div className="flex h-16 items-center gap-2 border-b border-border px-6">
          <span className="text-2xl">🎯</span>
          <span className="text-xl font-bold tracking-tight">KPI Tool</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-4">
          {navItems.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )
              }
            >
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="border-t border-border p-4">
          <button
            onClick={() => setShowChangelog(true)}
            className="text-xs text-muted-foreground hover:text-foreground hover:underline cursor-pointer transition-colors"
          >
            KPI Tool v{APP_VERSION}
          </button>
        </div>
      </aside>

      {/* Changelog Dialog */}
      <ChangelogDialog open={showChangelog} onOpenChange={setShowChangelog} />
    </>
  );
}

