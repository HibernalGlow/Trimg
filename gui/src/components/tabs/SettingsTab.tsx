import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { AppSettings } from "@/hooks/useSettings";

interface SettingsTabProps {
  settings: AppSettings;
  onUpdateSettings: (patch: Partial<AppSettings>) => void;
  onResetSettings: () => void;
}

const CATEGORIES = ["General", "Conversion", "Advanced"] as const;

export function SettingsTab({
  settings,
  onUpdateSettings,
  onResetSettings,
}: SettingsTabProps) {
  const [activeCategory, setActiveCategory] = useState<string>("General");

  return (
    <div className="grid grid-cols-[200px_1fr] gap-4 h-full">
      {/* Categories */}
      <div className="flex flex-col gap-1">
        {CATEGORIES.map((cat) => (
          <Button
            key={cat}
            variant={activeCategory === cat ? "secondary" : "ghost"}
            className="justify-start"
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
          </Button>
        ))}
        <div className="flex-1" />
        <Button variant="outline" onClick={onResetSettings}>
          Reset to Defaults
        </Button>
      </div>

      {/* Settings */}
      <div className="border rounded-lg p-4 overflow-auto">
        {activeCategory === "General" && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">General</h3>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Label className="w-40">Theme</Label>
                <Select defaultValue="dark">
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <label className="flex items-center gap-3">
                <Checkbox
                  checked={settings.clearFileList}
                  onCheckedChange={(c) => onUpdateSettings({ clearFileList: c === true })}
                />
                <span className="text-sm">Clear file list after conversion</span>
              </label>
            </div>
          </div>
        )}

        {activeCategory === "Conversion" && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Conversion</h3>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Label className="w-40">Default Quality</Label>
                <Slider
                  value={[settings.defaultQuality]}
                  onValueChange={([v]) => onUpdateSettings({ defaultQuality: v })}
                  min={1}
                  max={100}
                  step={1}
                  className="w-40"
                />
                <span className="text-sm font-medium tabular-nums w-8">
                  {settings.defaultQuality}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <Label className="w-40">Default Effort</Label>
                <Slider
                  value={[settings.effort]}
                  onValueChange={([v]) => onUpdateSettings({ effort: v })}
                  min={1}
                  max={10}
                  step={1}
                  className="w-40"
                />
                <span className="text-sm font-medium tabular-nums w-8">{settings.effort}</span>
              </div>

              <div className="flex items-center gap-3">
                <Label className="w-40">Default Threads</Label>
                <Slider
                  value={[settings.threads]}
                  onValueChange={([v]) => onUpdateSettings({ threads: v })}
                  min={1}
                  max={16}
                  step={1}
                  className="w-40"
                />
                <span className="text-sm font-medium tabular-nums w-8">{settings.threads}</span>
              </div>

              <div className="flex items-center gap-3">
                <Label className="w-40">If Output Exists</Label>
                <Select
                  value={settings.onOutputExists}
                  onValueChange={(v) =>
                    onUpdateSettings({ onOutputExists: v as AppSettings["onOutputExists"] })
                  }
                >
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rename">Rename</SelectItem>
                    <SelectItem value="skip">Skip</SelectItem>
                    <SelectItem value="overwrite">Overwrite</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}

        {activeCategory === "Advanced" && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Advanced</h3>

            <div className="space-y-3">
              <label className="flex items-center gap-3">
                <Checkbox
                  checked={settings.deleteOriginal}
                  onCheckedChange={(c) => onUpdateSettings({ deleteOriginal: c === true })}
                />
                <span className="text-sm">Delete original files after conversion</span>
              </label>

              {settings.deleteOriginal && (
                <div className="flex items-center gap-3 ml-6">
                  <Label className="text-sm">Mode</Label>
                  <Select
                    value={settings.deleteOriginalMode}
                    onValueChange={(v) =>
                      onUpdateSettings({ deleteOriginalMode: v as AppSettings["deleteOriginalMode"] })
                    }
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="trash">Move to Trash</SelectItem>
                      <SelectItem value="permanent">Delete Permanently</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <label className="flex items-center gap-3">
                <Checkbox
                  checked={settings.keepFolderStructure}
                  onCheckedChange={(c) => onUpdateSettings({ keepFolderStructure: c === true })}
                />
                <span className="text-sm">Keep folder structure when saving</span>
              </label>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
