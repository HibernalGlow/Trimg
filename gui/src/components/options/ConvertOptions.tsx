import { useState, useCallback, useEffect } from "react";
import type { ProcessOptions } from "@/lib/tauri";
import { FormatSelect } from "./FormatSelect";
import { QualitySlider } from "./QualitySlider";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";

const DEFAULT_FORMAT = "avif";
const DEFAULT_THREADS = 1;

interface ConvertOptionsProps {
  defaultQuality: number;
  defaultThreads: number;
  onChange: (options: Partial<ProcessOptions>) => void;
}

export function ConvertOptions({ defaultQuality, defaultThreads, onChange }: ConvertOptionsProps) {
  const [format, setFormat] = useState(DEFAULT_FORMAT);
  const [quality, setQuality] = useState(defaultQuality);
  const [threads, setThreads] = useState(defaultThreads);

  const emitChange = useCallback(
    (fmt: string, q: number, t: number) => {
      onChange({ operation: "convert", format: fmt, quality: q, threads: t });
    },
    [onChange]
  );

  useEffect(() => {
    emitChange(format, quality, threads);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- emit initial values on mount only
  }, []);

  const handleFormatChange = (value: string) => {
    setFormat(value);
    emitChange(value, quality, threads);
  };

  const handleQualityChange = (value: number) => {
    setQuality(value);
    emitChange(format, value, threads);
  };

  const handleThreadsChange = (value: number) => {
    setThreads(value);
    emitChange(format, quality, value);
  };

  return (
    <div className="space-y-4">
      <FormatSelect value={format} onChange={handleFormatChange} />
      <QualitySlider value={quality} onChange={handleQualityChange} />
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="threads">Threads</Label>
          <span className="text-sm font-medium tabular-nums">{threads}</span>
        </div>
        <Slider
          id="threads"
          value={[threads]}
          onValueChange={([value]) => handleThreadsChange(value)}
          min={1}
          max={16}
          step={1}
        />
      </div>
    </div>
  );
}
