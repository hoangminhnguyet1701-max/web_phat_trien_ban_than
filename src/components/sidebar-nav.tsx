"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { LayoutDashboard, Compass, UserRound } from "lucide-react";

export function SidebarNav() {
  const pathname = usePathname();
  const [hash, setHash] = useState("");
  useEffect(() => {
    const update = () => setHash(window.location.hash);
    update();
    window.addEventListener("hashchange", update);
    window.addEventListener("popstate", update);
    return () => {
      window.removeEventListener("hashchange", update);
      window.removeEventListener("popstate", update);
    };
  }, [pathname]);
  const journeys =
    pathname.startsWith("/challenges") ||
    (pathname === "/dashboard" && hash === "#hanh-trinh");
  return (
    <nav aria-label="Điều hướng chính">
      <Link
        href="/dashboard"
        aria-current={
          pathname === "/dashboard" && !journeys ? "page" : undefined
        }
        onClick={() => setHash("")}
      >
        <LayoutDashboard size={20} /> Tổng quan
      </Link>
      <Link
        href="/dashboard#hanh-trinh"
        aria-current={journeys ? "page" : undefined}
        onClick={() => setHash("#hanh-trinh")}
      >
        <Compass size={20} /> Hành trình của tôi
      </Link>
      <Link
        href="/profile"
        aria-current={pathname === "/profile" ? "page" : undefined}
      >
        <UserRound size={20} /> Hồ sơ cá nhân
      </Link>
    </nav>
  );
}
