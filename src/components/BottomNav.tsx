"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, Home, User } from "lucide-react";

const tabs = [
  { href: "/documents", label: "내 문서", icon: FileText },
  { href: "/home", label: "홈", icon: Home },
  { href: "/profile", label: "내 정보", icon: User },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-1/2 z-50 w-full max-w-[26.875rem] -translate-x-1/2 border-t border-black-20 bg-white pb-[env(safe-area-inset-bottom)]">
      <ul className="flex h-14 items-center justify-around">
        {tabs.map(({ href, label, icon: Icon }) => {
          const isActive =
            pathname.startsWith(href) ||
            (href === "/home" && pathname.startsWith("/business"));
          return (
            <li key={href}>
              <Link
                href={href}
                className={`flex flex-col items-center gap-0.5 text-[0.625rem] ${
                  isActive ? "text-primary-100" : "text-black-60"
                }`}
              >
                <Icon size={24} strokeWidth={isActive ? 2.5 : 1.5} />
                <span>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
