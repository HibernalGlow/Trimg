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
  "Lossless JPEG Transcoding",
  "JPEG Reconstruction",
  "Smallest Lossless",
] as const;

const CHROMA_SUBSAMPLING_OPTIONS = ["Default", "4:4:4", "4:2:2", "4:2:0"] as const;
const CHROMA_SUBSAMPLING_AVIF_OPTIONS = ["Default", "4:4:4", "4:2:2", "4:2:0", "4:0:0"] as const;

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
  const [intelligentEffort, setIntelligentEffort] = useState(false);
  const [jxlModular, setJxlModular] = useState(false);
  const [saveToMode, setSaveToMode] = useState<SaveToMode>(settings.saveToMode);
  const [outputDir, setOutputDir] = useState(settings.outputDir);
  const [keepFolderStructure, setKeepFolderStructure] = useState(settings.keepFolderStructure);
  const [threads, setThreads] = useState(settings.threads);
  const [onOutputExists, setOnOutputExists] = useState<OnOutputExists>(settings.onOutputExists);
  const [clearFileList, setClearFileList] = useState(settings.clearFileList);
  const [deleteOriginal, setDeleteOriginal] = useState(settings.deleteOriginal);
  const [deleteOriginalMode, setDeleteOriginalMode] = useState<DeleteOriginalMode>(settings.deleteOriginalMode);

  const [chromaSubsampling, setChromaSubsampling] = useState<string>("Default");
  const [jxlPngFallback, setJxlPngFallback] = useState(false);
  const [jxlVerify, setJxlVerify] = useState(false);
  const [jxlNormalize, setJxlNormalize] = useState(false);

  const [smallestLosslessPng, setSmallestLosslessPng] = useState(true);
  const [smallestLosslessWebp, setSmallestLosslessWebp] = useState(true);
  const [smallestLosslessJxl, setSmallestLosslessJxl] = useState(true);
  const [maxCompression, setMaxCompression] = useState(false);

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
      case "Lossless JPEG Transcoding":
        setEffort(7);
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
      "Lossless JPEG Transcoding": "jxl",
      "JPEG Reconstruction": "jxl",
      "Smallest Lossless": "png",
    };

    const options: ProcessOptions = {
      operation: "convert",
      format: formatMap[format] || "avif",
      quality,
      effort,
      threads,
      lossless: format === "Lossless JPEG Transcoding" ? true : lossless,
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
    format, quality, effort, threads, lossless, saveToMode, outputDir,
    keepFolderStructure, onOutputExists, clearFileList, deleteOriginal,
    deleteOriginalMode, onConvert,
  ]);

  const effortLabel = format === "AVIF" ? "Speed" : format === "WebP" ? "Method" : "Effort";
  const effortMax = format === "WebP" ? 6 : format === "AVIF" ? 10 : 10;
  const showEffort = ["JPEG XL", "AVIF", "WebP", "Lossless JPEG Transcoding"].includes(format);
  const showLossless = ["JPEG XL", "WebP"].includes(format);
  const showQuality = !lossless && !["Lossless JPEG Transcoding", "JPEG Reconstruction", "Smallest Lossless"].includes(format);
  const showChromaSubsampling = ["JPEG", "AVIF"].includes(format);
  const showJxlOptions = format === "JPEG XL";
  const showSmallestLossless = format === "Smallest Lossless";
  const showJxlReconstruct = format === "JPEG Reconstruction";
  const showLosslessJpeg = format === "Lossless JPEG Transcoding";

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
              className="shrink-0 px-2"
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
            <Label className="text-sm whitespace-nowrap w-24">Format / Mode</Label>
            <Select value={format} onValueChange={setFormat}>
              <SelectTrigger className="flex-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FORMAT_OPTIONS.map((f) => (
                  <SelectItem key={f} value={f}>{f}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {showEffort && (
            <div className="flex items-center gap-3">
              <Label className="text-sm whitespace-nowrap w-24">{effortLabel}</Label>
              {showJxlOptions && (
                <Checkbox
                  checked={intelligentEffort}
                  onCheckedChange={(c) => setIntelligentEffort(c === true)}
                  className="mr-2"
                />
              )}
              {showJxlOptions && <span className="text-xs text-muted-foreground mr-2">Intelligent</span>}
              <Slider
                value={[effort]}
                onValueChange={([v]) => setEffort(v)}
                min={format === "JPEG XL" || format === "Lossless JPEG Transcoding" ? 1 : 0}
                max={effortMax}
                step={1}
                className="flex-1"
                disabled={showJxlOptions && intelligentEffort}
              />
              <span className="text-sm font-medium tabular-nums w-6 text-right">{effort}</span>
            </div>
          )}

          {showQuality && (
            <div className="flex items-center gap-3">
              <Label className="text-sm whitespace-nowrap w-24">Quality</Label>
              <Slider
                value={[quality]}
                onValueChange={([v]) => setQuality(v)}
                min={format === "PNG" ? 1 : 0}
                max={format === "AVIF" || format === "JPEG XL" ? 99 : 100}
                step={1}
                className="flex-1"
              />
              <span className="text-sm font-medium tabular-nums w-8 text-right">{quality}</span>
            </div>
          )}

          {showLossless && (
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox checked={lossless} onCheckedChange={(c) => setLossless(c === true)} />
                <span className="text-sm">Lossless</span>
              </label>
              {showJxlOptions && !lossless && (
                <label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox checked={jxlModular} onCheckedChange={(c) => setJxlModular(c === true)} />
                  <span className="text-sm">Lossy Modular</span>
                </label>
              )}
            </div>
          )}

          {showChromaSubsampling && (
            <div className="flex items-center gap-3">
              <Label className="text-sm whitespace-nowrap w-24">Chroma Subsampling</Label>
              <Select value={chromaSubsampling} onValueChange={setChromaSubsampling}>
                <SelectTrigger className="flex-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(format === "AVIF" ? CHROMA_SUBSAMPLING_AVIF_OPTIONS : CHROMA_SUBSAMPLING_OPTIONS).map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {showSmallestLossless && (
            <div className="space-y-2">
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox checked={smallestLosslessPng} onCheckedChange={(c) => setSmallestLosslessPng(c === true)} />
                  <span className="text-sm">PNG (Oxipng)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox checked={smallestLosslessWebp} onCheckedChange={(c) => setSmallestLosslessWebp(c === true)} />
                  <span className="text-sm">WebP</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox checked={smallestLosslessJxl} onCheckedChange={(c) => setSmallestLosslessJxl(c === true)} />
                  <span className="text-sm">JPEG XL</span>
                </label>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox checked={maxCompression} onCheckedChange={(c) => setMaxCompression(c === true)} />
                <span className="text-sm">Max Compression</span>
              </label>
              <p className="text-xs text-muted-foreground">
                Max Bit Depth: {smallestLosslessWebp ? "8-bit" : "16-bit"}
              </p>
            </div>
          )}

          {showJxlReconstruct && (
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox checked={jxlPngFallback} onCheckedChange={(c) => setJxlPngFallback(c === true)} />
              <span className="text-sm">PNG Fallback</span>
            </label>
          )}

          {showLosslessJpeg && (
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox checked={jxlVerify} onCheckedChange={(c) => setJxlVerify(c === true)} />
                <span className="text-sm">Verify</span>
              </label>
              <div className="flex items-center gap-2">
                <Checkbox checked={jxlNormalize} onCheckedChange={(c) => setJxlNormalize(c === true)} />
                <span className="text-sm">Normalize</span>
              </div>
            </div>
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
            <Label className="text-sm whitespace-nowrap w-24">If Output Exists</Label>
            <Select value={onOutputExists} onValueChange={(v) => setOnOutputExists(v as OnOutputExists)}>
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
            <Label className="text-sm whitespace-nowrap w-24">Threads</Label>
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
              <Checkbox checked={deleteOriginal} onCheckedChange={(c) => setDeleteOriginal(c === true)} />
              <span className="text-sm">Delete Original</span>
            </label>
            {deleteOriginal && (
              <Select value={deleteOriginalMode} onValueChange={(v) => setDeleteOriginalMode(v as DeleteOriginalMode)}>
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
        <Button variant="outline" onClick={() => {
          setFormat("AVIF");
          setQuality(70);
          setEffort(6);
          setLossless(false);
          setIntelligentEffort(false);
          setJxlModular(false);
          setSaveToMode("source");
          setKeepFolderStructure(false);
          setThreads(Math.max((navigator.hardwareConcurrency || 4) - 1, 1));
          setOnOutputExists("rename");
          setClearFileList(false);
          setDeleteOriginal(false);
          setChromaSubsampling("Default");
          setJxlPngFallback(false);
          setJxlVerify(false);
          setJxlNormalize(false);
          setSmallestLosslessPng(true);
          setSmallestLosslessWebp(true);
          setSmallestLosslessJxl(true);
          setMaxCompression(false);
        }}>
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
