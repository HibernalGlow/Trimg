import { Button } from "@/components/ui/button";

export function AboutTab() {
  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold">Trimg</h1>
        <p className="text-muted-foreground">Image Converter</p>
        <p className="text-sm text-muted-foreground">Version 0.1.1</p>
      </div>

      <div className="border rounded-lg p-4 space-y-2">
        <h2 className="font-semibold">Supported Formats</h2>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="font-medium">Input:</span>
            <span className="text-muted-foreground"> JPEG, PNG, WebP, AVIF, JXL, GIF, BMP, TIFF</span>
          </div>
          <div>
            <span className="font-medium">Output:</span>
            <span className="text-muted-foreground"> JPEG, PNG, WebP, AVIF, JXL</span>
          </div>
        </div>
      </div>

      <div className="border rounded-lg p-4 space-y-2">
        <h2 className="font-semibold">Features</h2>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• Multi-threaded batch processing</li>
          <li>• JPEG XL, AVIF, WebP encoding</li>
          <li>• Quality and effort control</li>
          <li>• Downscaling and resizing</li>
          <li>• Drag and drop support</li>
        </ul>
      </div>

      <div className="border rounded-lg p-4 space-y-2">
        <h2 className="font-semibold">Built With</h2>
        <div className="text-sm text-muted-foreground space-y-1">
          <p>Rust + Tauri + React + TypeScript</p>
          <p>slimg-core image processing library</p>
        </div>
      </div>

      <div className="flex justify-center gap-2">
        <Button
          variant="outline"
          onClick={() => window.open("https://github.com/HibernalGlow/Trimg", "_blank")}
        >
          GitHub
        </Button>
      </div>
    </div>
  );
}
