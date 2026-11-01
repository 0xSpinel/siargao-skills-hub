import { Link } from "@tanstack/react-router";
import { Waves } from "lucide-react";
import { AccountActions } from "@/components/AccountActions";

export function CommunityNav() {
  return <nav aria-label="Community navigation" className="flex flex-wrap items-center justify-between gap-4">
    <Link to="/" className="flex items-center gap-2 font-display text-2xl font-extrabold"><Waves className="h-6 w-6" />swell do</Link>
    <div className="flex flex-wrap items-center gap-5 text-sm font-bold">
      <Link to="/" activeOptions={{ exact: true }} activeProps={{ className: "underline underline-offset-8" }}>Find tasks</Link>
      <Link to="/services" activeProps={{ className: "underline underline-offset-8" }}>Find services</Link>
      <AccountActions />
    </div>
  </nav>;
}