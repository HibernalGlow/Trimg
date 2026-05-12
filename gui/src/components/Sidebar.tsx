import {
  ArrowRightLeft,
  Crop,
  Expand,
  Maximize2,
  Settings,
  Zap,
  Eye,
  EyeOff,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type Feature = "convert" | "optimize" | "resize" | "crop" | "extend";

interface FeatureItem {
  id: Feature;
  label: string;
  icon: LucideIcon;
}

const features: FeatureItem[] = [
  { id: "convert", label: "Convert", icon: ArrowRightLeft },
  { id: "optimize", label: "Optimize", icon: Zap },
  { id: "resize", label: "Resize", icon: Maximize2 },
  { id: "crop", label: "Crop", icon: Crop },
  { id: "extend", label: "Extend", icon: Expand },
];

interface SidebarProps {
  active: Feature;
  showThumbnails: boolean;
  onSelect: (feature: Feature) => void;
  onSettingsClick: () => void;
  onToggleThumbnails: () => void;
}

export function Sidebar({
  active,
  showThumbnails,
  onSelect,
  onSettingsClick,
  onToggleThumbnails,
}: SidebarProps) {
  return (
    <aside className="flex h-screen w-50 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
      <div className="flex h-14 items-center px-4 border-b border-sidebar-border">
        <span className="text-lg font-semibold tracking-tight">slimg</span>
      </div>

      <nav className="flex-1 space-y-1 p-2">
        {features.map((item) => (
          <button
            key={item.id}
            onClick={() => onSelect(item.id)}
            className={cn(
              "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
              active === item.id
                ? "bg-sidebar-primary text-sidebar-primary-foreground"
                : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            )}
          >
            <item.icon className="h-5 w-5 shrink-0" />
            {item.label}
          </button>
        ))}
      </nav>

      <div className="border-t border-sidebar-border p-2 space-y-1">
        <button
          onClick={onToggleThumbnails}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        >
          {showThumbnails ? (
            <Eye className="h-5 w-5 shrink-0" />
          ) : (
            <EyeOff className="h-5 w-5 shrink-0" />
          )}
          {showThumbnails ? "Show Images" : "Hide Images"}
        </button>
        <button
          onClick={onSettingsClick}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        >
          <Settings className="h-5 w-5 shrink-0" />
          Settings
        </button>
      </div>
    </aside>
  );
}
