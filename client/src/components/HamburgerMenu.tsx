import { Menu, Shield } from "lucide-react";
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
    <div className="absolute top-4 left-4 z-10">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="size-10 rounded-lg border border-edge bg-surface/90 backdrop-blur-md flex items-center justify-center text-blue-gray hover:text-cyan hover:border-cyan/50 hover:shadow-glow transition-all cursor-pointer outline-none"
            aria-label="Menu"
          >
            <Menu className="size-5" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          sideOffset={8}
          className="min-w-[220px] bg-surface border-edge shadow-panel animate-decloak p-0 rounded-xl"
        >
          {/* Logo branding */}
          <div className="flex items-center gap-2.5 px-4 py-3 border-b border-edge">
            <img src="/logo.png" alt="GhostMaps" className="size-7 rounded" />
            <span className="font-display text-sm font-bold text-bone tracking-wide">
              GhostMaps
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
    </div>
  );
}
