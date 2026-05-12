import { useState, useCallback, useEffect } from "react";
import type { ProcessOptions, SaveToMode, OnOutputExists, DeleteOriginalMode } from "@/lib/tauri";
import { FormatSelect } from "./FormatSelect";
import { QualitySlider } from "./QualitySlider";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const DEFAULT_FORMAT = "avif";
const DEFAULT_EFFORT = 6;
const DEFAULT_THREADS = 1;

interface ConvertOptionsProps {
  defaultQuality: number;
  defaultEffort: number;
  defaultThreads: number;
  saveToMode: SaveToMode;
  outputDir: string;
  keepFolderStructure: boolean;
  onOutputExists: OnOutputExists;
  clearFileList: boolean;
  deleteOriginal: boolean;
  deleteOriginalMode: DeleteOriginalMode;
  onChange: (options: Partial<ProcessOptions>) => void;
}

export function ConvertOptions({
  defaultQuality,
  defaultEffort,
  defaultThreads,
  saveToMode,
  outputDir,
  keepFolderStructure,
  onOutputExists,
  clearFileList,
  deleteOriginal,
  deleteOriginalMode,
  onChange,
}: ConvertOptionsProps) {
  const [format, setFormat] = useState(DEFAULT_FORMAT);
  const [quality, setQuality] = useState(defaultQuality);
  const [effort, setEffort] = useState(defaultEffort);
  const [threads, setThreads] = useState(defaultThreads);
  const [currentSaveToMode, setCurrentSaveToMode] = useState<SaveToMode>(saveToMode);
  const [currentOutputDir, setCurrentOutputDir] = useState(outputDir);
  const [currentKeepFolderStructure, setCurrentKeepFolderStructure] = useState(keepFolderStructure);
  const [currentOnOutputExists, setCurrentOnOutputExists] = useState<OnOutputExists>(onOutputExists);
  const [currentClearFileList, setCurrentClearFileList] = useState(clearFileList);
  const [currentDeleteOriginal, setCurrentDeleteOriginal] = useState(deleteOriginal);
  const [currentDeleteOriginalMode, setCurrentDeleteOriginalMode] = useState<DeleteOriginalMode>(deleteOriginalMode);

  const emitChange = useCallback(() => {
    onChange({
      operation: "convert",
      format,
      quality,
      effort,
      threads,
      output_dir: currentOutputDir || undefined,
      save_to_mode: currentSaveToMode,
      keep_folder_structure: currentKeepFolderStructure,
      on_output_exists: currentOnOutputExists,
      clear_file_list: currentClearFileList,
      delete_original: currentDeleteOriginal,
      delete_original_mode: currentDeleteOriginal,
    });
  }, [
    onChange,
    format,
    quality,
    effort,
    threads,
    currentOutputDir,
    currentSaveToMode,
    currentKeepFolderStructure,
    currentOnOutputExists,
    currentClearFileList,
    currentDeleteOriginal,
    currentDeleteOriginalMode,
  ]);

  useEffect(() => {
    emitChange();
  }, [emitChange]);

  return (
    <div className="space-y-5">
      {/* Format */}
      <FormatSelect value={format} onChange={(v) => { setFormat(v); emitChange(); }} />

      {/* Speed */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="speed">Speed</Label>
          <span className="text-sm font-medium tabular-nums">{effort}</span>
        </div>
        <Slider
          id="speed"
          value={[effort]}
          onValueChange={([value]) => { setEffort(value); emitChange(); }}
          min={1}
          max={10}
          step={1}
        />
      </div>

      {/* Quality */}
      <QualitySlider value={quality} onChange={(v) => { setQuality(v); emitChange(); }} />

      {/* Threads */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="threads">Threads</Label>
          <span className="text-sm font-medium tabular-nums">{threads}</span>
        </div>
        <Slider
          id="threads"
          value={[threads]}
          onValueChange={([value]) => { setThreads(value); emitChange(); }}
          min={1}
          max={16}
          step={1}
        />
      </div>

      {/* Save To */}
      <div className="space-y-3">
        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Save To
        </Label>
        <div className="space-y-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="saveToMode"
              value="source"
              checked={currentSaveToMode === "source"}
              onChange={() => { setCurrentSaveToMode("source"); emitChange(); }}
              className="h-4 w-4 accent-primary"
            />
            <span className="text-sm">Source Folder</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="saveToMode"
              value="custom"
              checked={currentSaveToMode === "custom"}
              onChange={() => { setCurrentSaveToMode("custom"); emitChange(); }}
              className="h-4 w-4 accent-primary"
            />
            <span className="text-sm">Custom</span>
          </label>
          {currentSaveToMode === "custom" && (
            <input
              type="text"
              value={currentOutputDir}
              onChange={(e) => { setCurrentOutputDir(e.target.value); emitChange(); }}
              placeholder="Enter custom path..."
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            />
          )}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={currentKeepFolderStructure}
              onChange={(e) => { setCurrentKeepFolderStructure(e.target.checked); emitChange(); }}
              className="h-4 w-4 rounded border accent-primary"
            />
            <span className="text-sm text-muted-foreground">Keep Folder Structure</span>
          </label>
        </div>
      </div>

      {/* Conversion */}
      <div className="space-y-3">
        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Conversion
        </Label>
        <div className="flex items-center gap-3">
          <Label htmlFor="output-exists" className="text-sm whitespace-nowrap">If Output Exists</Label>
          <Select
            value={currentOnOutputExists}
            onValueChange={(v) => { setCurrentOnOutputExists(v as OnOutputExists); emitChange(); }}
          >
            <SelectTrigger id="output-exists" className="w-full">
              <SelectValue placeholder="Select action" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="rename">Rename</SelectItem>
              <SelectItem value="skip">Skip</SelectItem>
              <SelectItem value="overwrite">Overwrite</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* After Conversion */}
      <div className="space-y-3">
        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          After Conversion
        </Label>
        <div className="space-y-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={currentClearFileList}
              onChange={(e) => { setCurrentClearFileList(e.target.checked); emitChange(); }}
              className="h-4 w-4 rounded border accent-primary"
            />
            <span className="text-sm">Clear File List</span>
          </label>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer flex-shrink-0">
              <input
                type="checkbox"
                checked={currentDeleteOriginal}
                onChange={(e) => { setCurrentDeleteOriginal(e.target.checked); emitChange(); }}
                className="h-4 w-4 rounded border accent-primary"
              />
              <span className="text-sm whitespace-nowrap">Delete Original</span>
            </label>
            {currentDeleteOriginal && (
              <Select
                value={currentDeleteOriginalMode}
                onValueChange={(v) => { setCurrentDeleteOriginalMode(v as DeleteOriginalMode); emitChange(); }}
              >
                <SelectTrigger className="w-[130px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="trash">To Trash</SelectItem>
                  <SelectItem value="permanent">Permanent</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
