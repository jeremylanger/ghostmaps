import { Shield } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAppStore } from "../store";
import AuthButton from "./AuthButton";

export default function HamburgerMenu() {
  const setShowPrivacy = useAppStore((s) => s.setShowPrivacy);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="shrink-0 size-12 rounded-l-xl flex items-center justify-center transition-all cursor-pointer outline-none hover:brightness-125"
          aria-label="Menu"
        >
          <img src="/favicon.png" alt="Ghost Maps" className="size-6" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        sideOffset={8}
        className="min-w-[220px] bg-surface border-edge shadow-panel animate-decloak p-0 rounded-xl"
      >
        {/* Logo branding */}
        <div className="flex items-center gap-2.5 px-4 py-3 border-b border-edge">
          <img src="/logo.png" alt="Ghost Maps" className="size-7 rounded" />
          <span className="font-display text-sm font-bold text-bone tracking-wide">
            Ghost Maps
          </span>
        </div>

        <div className="px-3 py-2">
          <AuthButton />
        </div>

        <DropdownMenuSeparator className="bg-edge" />

        <DropdownMenuItem
          className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-bone cursor-pointer focus:bg-surface-raised focus:text-cyan"
          onSelect={() => setShowPrivacy(true)}
        >
          <Shield className="size-4 text-cyan" />
          Privacy
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
