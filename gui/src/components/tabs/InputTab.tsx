import { useEffect, useState, useCallback } from "react";
import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";
import { open } from "@tauri-apps/plugin-dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { formatBytes } from "@/lib/format";
import { basename } from "@/lib/path";
import { api, type ImageInfo } from "@/lib/tauri";

interface LoadedFile {
  path: string;
  info: ImageInfo;
}

interface InputTabProps {
  files: LoadedFile[];
  loading: boolean;
  showThumbnails: boolean;
  onShowThumbnailsChange: (value: boolean) => void;
  onFilesAdded: (paths: string[]) => void;
  onClear: () => void;
  onConvert: () => void;
}

const SUPPORTED_EXTENSIONS = ["jpg", "jpeg", "png", "webp", "avif", "jxl", "gif", "bmp", "tiff", "qoi"];

function isSupportedImage(path: string): boolean {
  const ext = path.split(".").pop()?.toLowerCase() ?? "";
  return SUPPORTED_EXTENSIONS.includes(ext);
}

async function resolveDroppedPaths(paths: string[]): Promise<string[]> {
  const results: string[] = [];
  for (const path of paths) {
    try {
      const scanned = await api.scanDirectory(path);
      results.push(...scanned);
    } catch {
      if (isSupportedImage(path)) {
        results.push(path);
      }
    }
  }
  return results;
}

export function InputTab({
  files,
  loading,
  showThumbnails,
  onShowThumbnailsChange,
  onFilesAdded,
  onClear,
  onConvert,
}: InputTabProps) {
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    const webview = getCurrentWebviewWindow();

    const unlistenPromise = webview.onDragDropEvent(async (event) => {
      const { type } = event.payload;

      if (type === "enter" || type === "over") {
        setDragOver(true);
      } else if (type === "drop") {
        setDragOver(false);
        const resolved = await resolveDroppedPaths(event.payload.paths);
        if (resolved.length > 0) {
          onFilesAdded(resolved);
        }
      } else if (type === "leave") {
        setDragOver(false);
      }
    });

    return () => {
      unlistenPromise.then((unlisten) => unlisten());
    };
  }, [onFilesAdded]);

  const handleAddFiles = useCallback(async () => {
    const selected = await open({
      multiple: true,
      filters: [
        {
          name: "Images",
          extensions: SUPPORTED_EXTENSIONS,
        },
      ],
    });
    if (selected) {
      const paths = Array.isArray(selected) ? selected : [selected];
      onFilesAdded(paths);
    }
  }, [onFilesAdded]);

  const handleAddFolder = useCallback(async () => {
    const selected = await open({ directory: true, multiple: false });
    if (selected) {
      const files = await api.scanDirectory(selected);
      if (files.length > 0) {
        onFilesAdded(files);
      }
    }
  }, [onFilesAdded]);

  return (
    <div className="flex flex-col h-full gap-4">
      <div
        className={`flex-1 border-2 border-dashed rounded-lg overflow-auto transition-colors ${
          dragOver ? "border-primary bg-primary/5" : "border-muted-foreground/25"
        }`}
      >
        {files.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-4">
            <p className="text-lg font-medium">
              {loading ? "Loading..." : "Drop files or folders here"}
            </p>
            <p className="text-sm">
              Supports JPG, PNG, WebP, AVIF, JXL, GIF, BMP, TIFF
            </p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-muted/50 sticky top-0">
              <tr>
                <th className="text-left p-2">Name</th>
                <th className="text-left p-2 w-20">Format</th>
                <th className="text-left p-2 w-24">Size</th>
                <th className="text-left p-2 w-24">Resolution</th>
              </tr>
            </thead>
            <tbody>
              {files.map((file, index) => (
                <tr key={index} className="border-t hover:bg-muted/30">
                  <td className="p-2 truncate max-w-[300px]" title={file.path}>
                    {basename(file.path)}
                  </td>
                  <td className="p-2 uppercase">{file.info.format}</td>
                  <td className="p-2">{formatBytes(file.info.size_bytes)}</td>
                  <td className="p-2">
                    {file.info.width}x{file.info.height}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="flex gap-2 items-center">
        <Button variant="outline" onClick={handleAddFiles} disabled={loading}>
          Add Files
        </Button>
        <Button variant="outline" onClick={handleAddFolder} disabled={loading}>
          Add Folder
        </Button>
        <Button variant="outline" onClick={onClear} disabled={files.length === 0}>
          Clear List
        </Button>
        <div className="flex-1" />
        <label className="flex items-center gap-2 cursor-pointer text-sm text-muted-foreground">
          <Checkbox
            checked={showThumbnails}
            onCheckedChange={(c) => onShowThumbnailsChange(c === true)}
          />
          Show Thumbnails
        </label>
        <Button onClick={onConvert} disabled={files.length === 0 || loading}>
          Convert
        </Button>
      </div>
    </div>
  );
}
