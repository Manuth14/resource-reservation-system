"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Boxes,
  CalendarCheck,
  CalendarDays,
  LayoutDashboard,
  LogOut,
  Menu,
  Tags,
  Waves,
  X,
} from "lucide-react";
import { logout } from "@/actions/auth.actions";

type Props = { userName: string; role: string };

const workspace = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/resources", label: "Resources", icon: Boxes },
  { href: "/reservations", label: "Reservations", icon: CalendarCheck },
  { href: "/calendar", label: "Calendar", icon: CalendarDays },
];
const admin = [
  { href: "/admin/resource-types", label: "Resource types", icon: Tags },
  { href: "/admin/usage", label: "Usage", icon: BarChart3 },
];

export default function Sidebar({ userName, role }: Props) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const isAdmin = role === "ADMIN";

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  // Close the mobile drawer on navigation and on Escape
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const NavLink = ({ href, label, icon: Icon }: (typeof workspace)[number]) => (
    <Link
      href={href}
      aria-current={isActive(href) ? "page" : undefined}
      className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
        isActive(href)
          ? "bg-brand-tint text-brand-deep"
          : "text-muted hover:bg-paper hover:text-ink"
      }`}
    >
      <Icon size={18} aria-hidden />
      {label}
    </Link>
  );

  const Brand = () => (
    <div className="flex items-center gap-2.5 px-1">
      <span className="grid size-9 place-items-center rounded-xl bg-brand text-ink">
        <Waves size={20} aria-hidden />
      </span>
      <span className="font-display text-[15px] font-semibold leading-tight">Reservations</span>
    </div>
  );

  const content = (
    <>
      <nav className="flex flex-col gap-1" aria-label="Main">
        <p className="mb-1 px-3 text-xs font-semibold text-muted">Workspace</p>
        {workspace.map((l) => (
          <NavLink key={l.href} {...l} />
        ))}
      </nav>

      {isAdmin && (
        <nav className="mt-6 flex flex-col gap-1 border-t border-line pt-4" aria-label="Admin">
          <p className="mb-1 px-3 text-xs font-semibold text-muted">Administration</p>
          {admin.map((l) => (
            <NavLink key={l.href} {...l} />
          ))}
        </nav>
      )}

      <div className="mt-auto pt-6">
        <div className="rounded-xl border border-line p-3">
          <div className="flex items-center gap-3">
            <span className="grid size-9 place-items-center rounded-full bg-ink text-sm font-bold text-white">
              {userName.slice(0, 1)}
            </span>
            <div className="min-w-0 text-sm leading-tight">
              <p className="truncate font-bold">{userName}</p>
              <p className="mt-0.5 text-xs text-muted">{isAdmin ? "Administrator" : "Member"}</p>
            </div>
          </div>
          <form action={logout} className="mt-3">
            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-line px-3 py-1.5 text-xs font-semibold text-muted transition-colors hover:border-ink hover:text-ink"
            >
              <LogOut size={14} aria-hidden />
              Switch user
            </button>
          </form>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile top bar */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-line bg-surface px-4 py-3 lg:hidden">
        <Brand />
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          aria-expanded={open}
          className="grid size-10 place-items-center rounded-lg border border-line"
        >
          <Menu size={20} aria-hidden />
        </button>
      </header>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-ink/40"
          />
          <aside className="absolute inset-y-0 left-0 flex w-72 max-w-[85%] flex-col bg-surface px-4 py-5 shadow-xl">
            <div className="mb-6 flex items-center justify-between">
              <Brand />
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="grid size-9 place-items-center rounded-lg hover:bg-paper"
              >
                <X size={18} aria-hidden />
              </button>
            </div>
            {content}
          </aside>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col overflow-y-auto border-r border-line bg-surface px-4 py-5 lg:flex">
        <div className="mb-8">
          <Brand />
        </div>
        {content}
      </aside>
    </>
  );
}
