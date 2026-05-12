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

interface SettingsTabProps {
  settings: AppSettings;
  onUpdateSettings: (patch: Partial<AppSettings>) => void;
  onResetSettings: () => void;
}

const CATEGORIES = ["General", "Conversion", "ExifTool", "Advanced"] as const;

export function SettingsTab({
  settings,
  onUpdateSettings,
  onResetSettings,
}: SettingsTabProps) {
  const [activeCategory, setActiveCategory] = useState<string>("General");

  const [disableDownscalingStartup, setDisableDownscalingStartup] = useState(false);
  const [disableDeleteStartup, setDisableDeleteStartup] = useState(false);
  const [noSorting, setNoSorting] = useState(false);
  const [qualitySnap, setQualitySnap] = useState(false);
  const [playSoundOnFinish, setPlaySoundOnFinish] = useState(false);
  const [playSoundVolume, setPlaySoundVolume] = useState(50);

  const [jxlLossyModular, setJxlLossyModular] = useState(false);
  const [jxlAutoLosslessJpeg, setJxlAutoLosslessJpeg] = useState(true);
  const [jpgEncoder, setJpgEncoder] = useState<string>("JPEGLI");
  const [disableProgressiveJpegli, setDisableProgressiveJpegli] = useState(false);
  const [avifBitDepth, setAvifBitDepth] = useState<string>("Auto");
  const [avifEncoder, setAvifEncoder] = useState<string>("AOM AV1");
  const [avifAomIqTune, setAvifAomIqTune] = useState(false);
  const [keepIfLarger, setKeepIfLarger] = useState(false);
  const [copyIfLarger, setCopyIfLarger] = useState(false);

  const [exiftoolWipe, setExiftoolWipe] = useState("-all=");
  const [exiftoolPreserve, setExiftoolPreserve] =("-all= -TagsFromFile @ -all:all -ICC_Profile");
  const [exiftoolUnsafeWipe, setExiftoolUnsafeWipe] =("-all= -unsafe all");
  const [exiftoolCustom, setExiftoolCustom] = useState("");

  const [ramOptimizer, setRamOptimizer] = useState<string>("Default");
  const [jxlEffort10, setJxlEffort10] = useState(false);
  const [customResampling, setCustomResampling] = useState(false);
  const [customEncoderArgs, setCustomEncoderArgs] = useState("");
  const [processingOrder, setProcessingOrder] = useState<string>("Default");
  const [logging, setLogging] = useState<string>("Default");

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
              <div className="space-y-1">
                <Label className="text-sm font-medium">Disable on Startup</Label>
                <div className="flex flex-col gap-1 ml-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <Checkbox checked={disableDownscalingStartup} onCheckedChange={(c) => setDisableDownscalingStartup(c === true)} />
                    <span className="text-sm text-muted-foreground">Downscaling</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <Checkbox checked={disableDeleteStartup} onCheckedChange={(c) => setDisableDeleteStartup(c === true)} />
                    <span className="text-sm text-muted-foreground">Delete Original</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Label className="w-32">Theme</Label>
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

              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox checked={noSorting} onCheckedChange={(c) => setNoSorting(c === true)} />
                <span className="text-sm">Input - Disable Sorting</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox checked={qualitySnap} onCheckedChange={(c) => setQualitySnap(c === true)} />
                <span className="text-sm">Quality Slider - Snap to Individual Values</span>
              </label>

              <div className="space-y-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox checked={playSoundOnFinish} onCheckedChange={(c) => setPlaySoundOnFinish(c === true)} />
                  <span className="text-sm">Play Sound When Conversion Finishes</span>
                </label>
                {playSoundOnFinish && (
                  <div className="flex items-center gap-3 ml-6">
                    <Label className="text-sm">Volume</Label>
                    <Slider value={[playSoundVolume]} onValueChange={([v]) => setPlaySoundVolume(v)} min={0} max={100} step={1} className="w-32" />
                    <span className="text-sm text-muted-foreground">{playSoundVolume}%</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeCategory === "Conversion" && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Conversion</h3>

            <div className="space-y-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox checked={jxlLossyModular} onCheckedChange={(c) => setJxlLossyModular(c === true)} />
                <span className="text-sm">JPEG XL - Allow Lossy Modular</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox checked={jxlAutoLosslessJpeg} onCheckedChange={(c) => setJxlAutoLosslessJpeg(c === true)} />
                <span className="text-sm">JPEG XL - Automatic Lossless JPEG Transcoding</span>
              </label>

              <div className="flex items-center gap-3">
                <Label className="w-40">JPEG Encoder</Label>
                <Select value={jpgEncoder} onValueChange={setJpgEncoder}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="JPEGLI">JPEGLI</SelectItem>
                    <SelectItem value="libjpeg">libjpeg</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox checked={disableProgressiveJpegli} onCheckedChange={(c) => setDisableProgressiveJpegli(c === true)} />
                <span className="text-sm">JPEGLI - Disable Progressive Scan</span>
              </label>

              <div className="flex items-center gap-3">
                <Label className="w-40">AVIF - Bit Depth</Label>
                <Select value={avifBitDepth} onValueChange={setAvifBitDepth}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Auto">Auto</SelectItem>
                    <SelectItem value="12">12</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="8">8</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-3">
                <Label className="w-40">AVIF Encoder</Label>
                <Select value={avifEncoder} onValueChange={setAvifEncoder}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AOM AV1">AOM AV1</SelectItem>
                    <SelectItem value="SVT-AV1-PSY">SVT-AV1-PSY</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {avifEncoder === "AOM AV1" && (
                <label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox checked={avifAomIqTune} onCheckedChange={(c) => setAvifAomIqTune(c === true)} />
                  <span className="text-sm">AOM AV1 - Use IQ Tune</span>
                </label>
              )}

              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox checked={keepIfLarger} onCheckedChange={(c) => setKeepIfLarger(c === true)} />
                <span className="text-sm">Do Not Delete Original When Result is Larger</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox checked={copyIfLarger} onCheckedChange={(c) => setCopyIfLarger(c === true)} />
                <span className="text-sm">Copy Original When Result is Larger</span>
              </label>
            </div>
          </div>
        )}

        {activeCategory === "ExifTool" && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">ExifTool</h3>

            <div className="space-y-3">
              <div className="space-y-2">
                <Label className="text-sm">Wipe</Label>
                <Input value={exiftoolWipe} onChange={(e) => setExiftoolWipe(e.target.value)} className="font-mono text-xs" />
              </div>

              <div className="space-y-2">
                <Label className="text-sm">Preserve</Label>
                <Input value={exiftoolPreserve} onChange={(e) => setExiftoolPreserve(e.target.value)} className="font-mono text-xs" />
              </div>

              <div className="space-y-2">
                <Label className="text-sm">Unsafe Wipe</Label>
                <Input value={exiftoolUnsafeWipe} onChange={(e) => setExiftoolUnsafeWipe(e.target.value)} className="font-mono text-xs" />
              </div>

              <div className="space-y-2">
                <Label className="text-sm">Custom</Label>
                <Input value={exiftoolCustom} onChange={(e) => setExiftoolCustom(e.target.value)} placeholder="Custom ExifTool args..." className="font-mono text-xs" />
              </div>

              <Button variant="outline" size="sm" onClick={() => {
                setExiftoolWipe("-all=");
                setExiftoolPreserve("-all= -TagsFromFile @ -all:all -ICC_Profile");
                setExiftoolUnsafeWipe("-all= -unsafe all");
                setExiftoolCustom("");
              }}>
                Reset
              </Button>
            </div>
          </div>
        )}

        {activeCategory === "Advanced" && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Advanced</h3>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Label className="w-40">RAM Optimizer</Label>
                <Select value={ramOptimizer} onValueChange={setRamOptimizer}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Default">Default</SelectItem>
                    <SelectItem value="Aggressive">Aggressive</SelectItem>
                    <SelectItem value="Disabled">Disabled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox checked={jxlEffort10} onCheckedChange={(c) => setJxlEffort10(c === true)} />
                <span className="text-sm">JPEG XL - Enable Effort 10 (very slow)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox checked={customResampling} onCheckedChange={(c) => setCustomResampling(c === true)} />
                <span className="text-sm">Enable Custom Resampling</span>
              </label>

              <div className="space-y-2">
                <Label className="text-sm">Custom Encoder Args</Label>
                <Input value={customEncoderArgs} onChange={(e) => setCustomEncoderArgs(e.target.value)} placeholder="e.g. --avif_full_range" className="font-mono text-xs" />
              </div>

              <div className="flex items-center gap-3">
                <Label className="w-40">Processing Order</Label>
                <Select value={processingOrder} onValueChange={setProcessingOrder}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Default">Default</SelectItem>
                    <SelectItem value="Reverse">Reverse</SelectItem>
                    <SelectItem value="Random">Random</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-3">
                <Label className="w-40">Logging</Label>
                <Select value={logging} onValueChange={setLogging}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Default">Default</SelectItem>
                    <SelectItem value="Verbose">Verbose</SelectItem>
                    <SelectItem value="Debug">Debug</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
