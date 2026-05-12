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
import { Input } from "@/components/ui/input";
import type { AppSettings } from "@/hooks/useSettings";
import type { ProcessOptions } from "@/lib/tauri";

interface ModifyTabProps {
  settings: AppSettings;
  onUpdateSettings: (patch: Partial<AppSettings>) => void;
  fileCount: number;
  onConvert: (options: ProcessOptions) => void;
  isProcessing: boolean;
}

const DOWNSCALE_MODES = [
  "Resolution",
  "Megapixels",
  "Percent",
  "Shortest Side",
  "Longest Side",
] as const;

const METADATA_OPTIONS = [
  "Encoder - Wipe",
  "Encoder - Preserve",
] as const;

export function ModifyTab({
  settings,
  onUpdateSettings,
  fileCount,
  onConvert,
  isProcessing,
}: ModifyTabProps) {
  const [downscaleEnabled, setDownscaleEnabled] = useState(false);
  const [downscaleMode, setDownscaleMode] = useState<string>("Resolution");
  const [maxWidth, setMaxWidth] = useState(2000);
  const [maxHeight, setMaxHeight] = useState(2000);
  const [percent, setPercent] = useState(80);
  const [megapixels, setMegapixels] = useState(2);
  const [shortestSide, setShortestSide] = useState(1080);
  const [longestSide, setLongestSide] = useState(1920);
  const [keepTimestamps, setKeepTimestamps] = useState(false);
  const [metadata, setMetadata] = useState<string>("Encoder - Wipe");

  const handleConvert = () => {
    const options: ProcessOptions = {
      operation: "resize",
      quality: settings.defaultQuality,
      effort: settings.effort,
      threads: settings.threads,
      keep_timestamps: keepTimestamps,
      overwrite: false,
    };

    if (downscaleEnabled) {
      switch (downscaleMode) {
        case "Resolution":
          options.width = maxWidth;
          options.height = maxHeight;
          options.resize_mode = "fit";
          break;
        case "Percent":
          // Calculate from percent
          break;
        case "Megapixels":
          // Calculate from megapixels
          break;
        case "Shortest Side":
          options.width = shortestSide;
          options.resize_mode = "width";
          break;
        case "Longest Side":
          options.width = longestSide;
          options.resize_mode = "width";
          break;
      }
    }

    onConvert(options);
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      {/* Downscaling */}
      <div className="border rounded-lg p-4 space-y-3">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Downscaling
        </h3>
        <div className="space-y-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <Checkbox
              checked={downscaleEnabled}
              onCheckedChange={(c) => setDownscaleEnabled(c === true)}
            />
            <span className="text-sm font-medium">Downscale</span>
          </label>

          <div className="flex items-center gap-3">
            <Label className="text-sm whitespace-nowrap">Scale to</Label>
            <Select
              value={downscaleMode}
              onValueChange={setDownscaleMode}
              disabled={!downscaleEnabled}
            >
              <SelectTrigger className="flex-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DOWNSCALE_MODES.map((m) => (
                  <SelectItem key={m} value={m}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {downscaleMode === "Resolution" && (
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <Checkbox checked={true} />
                <Label className="text-sm">Max Width</Label>
                <Input
                  type="number"
                  value={maxWidth}
                  onChange={(e) => setMaxWidth(Number(e.target.value))}
                  className="flex-1 h-8"
                  disabled={!downscaleEnabled}
                />
                <span className="text-sm text-muted-foreground">px</span>
              </div>
              <div className="flex items-center gap-3">
                <Checkbox checked={true} />
                <Label className="text-sm">Max Height</Label>
                <Input
                  type="number"
                  value={maxHeight}
                  onChange={(e) => setMaxHeight(Number(e.target.value))}
                  className="flex-1 h-8"
                  disabled={!downscaleEnabled}
                />
                <span className="text-sm text-muted-foreground">px</span>
              </div>
            </div>
          )}

          {downscaleMode === "Percent" && (
            <div className="flex items-center gap-3">
              <Label className="text-sm">Percent</Label>
              <Slider
                value={[percent]}
                onValueChange={([v]) => setPercent(v)}
                min={1}
                max={99}
                step={1}
                className="flex-1"
                disabled={!downscaleEnabled}
              />
              <span className="text-sm font-medium tabular-nums w-8 text-right">{percent}%</span>
            </div>
          )}

          {downscaleMode === "Megapixels" && (
            <div className="flex items-center gap-3">
              <Label className="text-sm">Megapixels</Label>
              <Input
                type="number"
                value={megapixels}
                onChange={(e) => setMegapixels(Number(e.target.value))}
                step={0.1}
                className="flex-1 h-8"
                disabled={!downscaleEnabled}
              />
              <span className="text-sm text-muted-foreground">MP</span>
            </div>
          )}

          {downscaleMode === "Shortest Side" && (
            <div className="flex items-center gap-3">
              <Label className="text-sm">Max Size</Label>
              <Input
                type="number"
                value={shortestSide}
                onChange={(e) => setShortestSide(Number(e.target.value))}
                className="flex-1 h-8"
                disabled={!downscaleEnabled}
              />
              <span className="text-sm text-muted-foreground">px</span>
            </div>
          )}

          {downscaleMode === "Longest Side" && (
            <div className="flex items-center gap-3">
              <Label className="text-sm">Max Size</Label>
              <Input
                type="number"
                value={longestSide}
                onChange={(e) => setLongestSide(Number(e.target.value))}
                className="flex-1 h-8"
                disabled={!downscaleEnabled}
              />
              <span className="text-sm text-muted-foreground">px</span>
            </div>
          )}
        </div>
      </div>

      {/* Misc */}
      <div className="border rounded-lg p-4 space-y-3">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Misc.
        </h3>
        <div className="space-y-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <Checkbox
              checked={keepTimestamps}
              onCheckedChange={(c) => setKeepTimestamps(c === true)}
            />
            <span className="text-sm">Preserve Time Attributes</span>
          </label>

          <div className="flex items-center gap-3">
            <Label className="text-sm">Metadata</Label>
            <Select value={metadata} onValueChange={setMetadata}>
              <SelectTrigger className="flex-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {METADATA_OPTIONS.map((m) => (
                  <SelectItem key={m} value={m}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="col-span-2 flex gap-2 pt-2">
        <Button
          variant="outline"
          onClick={() => {
            setDownscaleEnabled(false);
            setDownscaleMode("Resolution");
            setMaxWidth(2000);
            setMaxHeight(2000);
            setPercent(80);
            setMegapixels(2);
            setShortestSide(1080);
            setLongestSide(1920);
            setKeepTimestamps(false);
            setMetadata("Encoder - Wipe");
          }}
        >
          Reset to Defaults
        </Button>
        <div className="flex-1" />
        <Button onClick={handleConvert} disabled={fileCount === 0 || isProcessing}>
          {isProcessing ? "Converting..." : `Convert${fileCount > 0 ? ` (${fileCount})` : ""}`}
        </Button>
      </div>
    </div>
  );
}
