import type { Feature } from "@/components/Sidebar";
import type { ProcessOptions, ImageInfo, SaveToMode, OnOutputExists, DeleteOriginalMode } from "@/lib/tauri";
import { ConvertOptions } from "@/components/options/ConvertOptions";
import { OptimizeOptions } from "@/components/options/OptimizeOptions";
import { ResizeOptions } from "@/components/options/ResizeOptions";
import { CropOptions } from "@/components/options/CropOptions";
import { ExtendOptions } from "@/components/options/ExtendOptions";

interface OptionsPanelProps {
  feature: Feature;
  imageInfo?: ImageInfo;
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

export function OptionsPanel({
  feature,
  imageInfo,
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
}: OptionsPanelProps) {
  switch (feature) {
    case "convert":
      return (
        <ConvertOptions
          defaultQuality={defaultQuality}
          defaultEffort={defaultEffort}
          defaultThreads={defaultThreads}
          saveToMode={saveToMode}
          outputDir={outputDir}
          keepFolderStructure={keepFolderStructure}
          onOutputExists={onOutputExists}
          clearFileList={clearFileList}
          deleteOriginal={deleteOriginal}
          deleteOriginalMode={deleteOriginalMode}
          onChange={onChange}
        />
      );
    case "optimize":
      return <OptimizeOptions defaultQuality={defaultQuality} onChange={onChange} />;
    case "resize":
      return <ResizeOptions defaultQuality={defaultQuality} onChange={onChange} imageInfo={imageInfo} />;
    case "crop":
      return <CropOptions defaultQuality={defaultQuality} onChange={onChange} />;
    case "extend":
      return <ExtendOptions defaultQuality={defaultQuality} onChange={onChange} />;
  }
}
