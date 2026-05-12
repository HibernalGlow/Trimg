import { useCallback, useState } from "react";
import { open } from "@tauri-apps/plugin-dialog";
import { Button } from "@/components/ui/button";
import { formatBytes } from "@/lib/format";
import { basename } from "@/lib/path";
import type { ImageInfo } from "@/lib/tauri";

interface LoadedFile {
  path: string;
  info: ImageInfo;
}

interface InputTabProps {
  files: LoadedFile[];
  loading: boolean;
  onFilesAdded: (paths: string[]) => void;
  onClear: () => void;
  onConvert: () => void;
}

export function InputTab({
  files,
  loading,
  onFilesAdded,
  onClear,
  onConvert,
}: InputTabProps) {
  const [dragOver, setDragOver] = useState(false);

  const handleAddFiles = async () => {
    const selected = await open({
      multiple: true,
      filters: [
        {
          name: "Images",
          extensions: ["jpg", "jpeg", "png", "webp", "avif", "jxl", "gif", "bmp", "tiff"],
        },
      ],
    });
    if (selected) {
      const paths = Array.isArray(selected) ? selected : [selected];
      onFilesAdded(paths);
    }
  };

  const handleAddFolder = async () => {
    const selected = await open({ directory: true, multiple: false });
    if (selected) {
      // TODO: Scan directory for images
      onFilesAdded([selected as string]);
    }
  };

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const files = Array.from(e.dataTransfer.files).map((f) => f.path);
      if (files.length > 0) {
        onFilesAdded(files);
      }
    },
    [onFilesAdded]
  );

  return (
    <div className="flex flex-col h-full gap-4">
      {/* File List */}
      <div
        className={`flex-1 border rounded-lg overflow-auto ${
          dragOver ? "border-primary bg-primary/5" : "border-border"
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        {files.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            {loading ? "Loading..." : "Drop files here or click Add Files"}
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

      {/* Buttons */}
      <div className="flex gap-2">
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
        <Button onClick={onConvert} disabled={files.length === 0 || loading}>
          Convert
        </Button>
      </div>
    </div>
  );
}
