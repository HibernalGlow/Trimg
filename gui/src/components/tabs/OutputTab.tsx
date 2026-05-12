import { useState, useEffect, useCallback } from "react";
import { open } from "@tauri-apps/plugin-dialog";
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
import type { AppSettings, SaveToMode, OnOutputExists, DeleteOriginalMode } from "@/hooks/useSettings";
import type { ProcessOptions } from "@/lib/tauri";

interface OutputTabProps {
  settings: AppSettings;
  onUpdateSettings: (patch: Partial<AppSettings>) => void;
  fileCount: number;
  onConvert: (options: ProcessOptions) => void;
  isProcessing: boolean;
}

const FORMAT_OPTIONS = [
  "JPEG XL",
  "AVIF",
  "WebP",
  "JPEG",
  "PNG",
] as const;

export function OutputTab({
  settings,
  onUpdateSettings,
  fileCount,
  onConvert,
  isProcessing,
}: OutputTabProps) {
  const [format, setFormat] = useState<string>("AVIF");
  const [quality, setQuality] = useState(70);
  const [effort, setEffort] = useState(6);
  const [lossless, setLossless] = useState(false);
  const [saveToMode, setSaveToMode] = useState<SaveToMode>(settings.saveToMode);
  const [outputDir, setOutputDir] = useState(settings.outputDir);
  const [keepFolderStructure, setKeepFolderStructure] = useState(settings.keepFolderStructure);
  const [threads, setThreads] = useState(settings.threads);
  const [onOutputExists, setOnOutputExists] = useState<OnOutputExists>(settings.onOutputExists);
  const [clearFileList, setClearFileList] = useState(settings.clearFileList);
  const [deleteOriginal, setDeleteOriginal] = useState(settings.deleteOriginal);
  const [deleteOriginalMode, setDeleteOriginalMode] = useState<DeleteOriginalMode>(settings.deleteOriginalMode);

  useEffect(() => {
    switch (format) {
      case "AVIF":
        setQuality(70);
        setEffort(6);
        break;
      case "JPEG XL":
        setQuality(80);
        setEffort(7);
        break;
      case "JPEG":
        setQuality(90);
        break;
      case "WebP":
        setQuality(90);
        setEffort(6);
        break;
      case "PNG":
        setQuality(90);
        break;
    }
  }, [format]);

  const handleChooseOutput = async () => {
    const selected = await open({ directory: true, multiple: false });
    if (selected) {
      setOutputDir(selected as string);
    }
  };

  const handleConvert = useCallback(() => {
    const formatMap: Record<string, string> = {
      "JPEG XL": "jxl",
      AVIF: "avif",
      WebP: "webp",
      JPEG: "jpeg",
      PNG: "png",
    };

    const options: ProcessOptions = {
      operation: "convert",
      format: formatMap[format] || "avif",
      quality,
      effort,
      threads,
      lossless,
      save_to_mode: saveToMode,
      output_dir: saveToMode === "custom" ? outputDir : undefined,
      keep_folder_structure: keepFolderStructure,
      on_output_exists: onOutputExists,
      clear_file_list: clearFileList,
      delete_original: deleteOriginal,
      delete_original_mode: deleteOriginalMode,
      overwrite: onOutputExists === "overwrite",
    };

    onConvert(options);
  }, [
    format,
    quality,
    effort,
    threads,
    lossless,
    saveToMode,
    outputDir,
    keepFolderStructure,
    onOutputExists,
    clearFileList,
    deleteOriginal,
    deleteOriginalMode,
    onConvert,
  ]);

  const effortLabel = format === "AVIF" ? "Speed" : format === "WebP" ? "Method" : "Effort";
  const effortMax = format === "WebP" ? 6 : format === "AVIF" ? 10 : 10;
  const showEffort = ["JPEG XL", "AVIF", "WebP"].includes(format);
  const showLossless = ["JPEG XL", "WebP"].includes(format);
  const showQuality = !lossless;

  return (
    <div className="grid grid-cols-2 gap-4">
      {/* Save To */}
      <div className="border rounded-lg p-4 space-y-3">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Save To
        </h3>
        <div className="space-y-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="saveToMode"
              checked={saveToMode === "source"}
              onChange={() => setSaveToMode("source")}
              className="h-4 w-4 accent-primary"
            />
            <span className="text-sm">Source Folder</span>
          </label>
          <div className="flex items-center gap-2">
            <input
              type="radio"
              name="saveToMode"
              checked={saveToMode === "custom"}
              onChange={() => setSaveToMode("custom")}
              className="h-4 w-4 accent-primary"
            />
            <Input
              value={outputDir}
              onChange={(e) => setOutputDir(e.target.value)}
              placeholder="Custom path..."
              className="flex-1 h-8"
              disabled={saveToMode !== "custom"}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={handleChooseOutput}
              disabled={saveToMode !== "custom"}
              className="shrink-0"
            >
              ...
            </Button>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <Checkbox
              checked={keepFolderStructure}
              onCheckedChange={(c) => setKeepFolderStructure(c === true)}
              disabled={saveToMode !== "custom"}
            />
            <span className="text-sm text-muted-foreground">Keep Folder Structure</span>
          </label>
        </div>
      </div>

      {/* Format */}
      <div className="border rounded-lg p-4 space-y-3">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Format
        </h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Label className="text-sm whitespace-nowrap">Format / Mode</Label>
            <Select value={format} onValueChange={setFormat}>
              <SelectTrigger className="flex-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FORMAT_OPTIONS.map((f) => (
                  <SelectItem key={f} value={f}>
                    {f}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {showEffort && (
            <div className="flex items-center gap-3">
              <Label className="text-sm whitespace-nowrap">{effortLabel}</Label>
              <Slider
                value={[effort]}
                onValueChange={([v]) => setEffort(v)}
                min={format === "JPEG XL" ? 1 : 0}
                max={effortMax}
                step={1}
                className="flex-1"
              />
              <span className="text-sm font-medium tabular-nums w-6 text-right">{effort}</span>
            </div>
          )}

          {showQuality && (
            <div className="flex items-center gap-3">
              <Label className="text-sm whitespace-nowrap">Quality</Label>
              <Slider
                value={[quality]}
                onValueChange={([v]) => setQuality(v)}
                min={format === "PNG" ? 1 : 0}
                max={100}
                step={1}
                className="flex-1"
              />
              <span className="text-sm font-medium tabular-nums w-8 text-right">{quality}</span>
            </div>
          )}

          {showLossless && (
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox checked={lossless} onCheckedChange={(c) => setLossless(c === true)} />
              <span className="text-sm">Lossless</span>
            </label>
          )}
        </div>
      </div>

      {/* Conversion */}
      <div className="border rounded-lg p-4 space-y-3">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Conversion
        </h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Label className="text-sm whitespace-nowrap">If Output Exists</Label>
            <Select
              value={onOutputExists}
              onValueChange={(v) => setOnOutputExists(v as OnOutputExists)}
            >
              <SelectTrigger className="flex-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rename">Rename</SelectItem>
                <SelectItem value="skip">Skip</SelectItem>
                <SelectItem value="overwrite">Overwrite</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-3">
            <Label className="text-sm whitespace-nowrap">Threads</Label>
            <Slider
              value={[threads]}
              onValueChange={([v]) => setThreads(v)}
              min={1}
              max={16}
              step={1}
              className="flex-1"
            />
            <span className="text-sm font-medium tabular-nums w-6 text-right">{threads}</span>
          </div>
        </div>
      </div>

      {/* After Conversion */}
      <div className="border rounded-lg p-4 space-y-3">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          After Conversion
        </h3>
        <div className="space-y-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <Checkbox checked={clearFileList} onCheckedChange={(c) => setClearFileList(c === true)} />
            <span className="text-sm">Clear File List</span>
          </label>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox
                checked={deleteOriginal}
                onCheckedChange={(c) => setDeleteOriginal(c === true)}
              />
              <span className="text-sm">Delete Original</span>
            </label>
            {deleteOriginal && (
              <Select
                value={deleteOriginalMode}
                onValueChange={(v) => setDeleteOriginalMode(v as DeleteOriginalMode)}
              >
                <SelectTrigger className="w-[130px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="trash">To Trash</SelectItem>
                  <SelectItem value="permanent">Permanently</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="col-span-2 flex gap-2 pt-2">
        <Button
          variant="outline"
          onClick={() => {
            setFormat("AVIF");
            setQuality(70);
            setEffort(6);
            setLossless(false);
            setSaveToMode("source");
            setKeepFolderStructure(false);
            setThreads(Math.max(navigator.hardwareConcurrency - 1, 1));
            setOnOutputExists("rename");
            setClearFileList(false);
            setDeleteOriginal(false);
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
