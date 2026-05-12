import { Button } from "@/components/ui/button";
import type { BatchProgress } from "@/lib/tauri";

interface ProgressDlgProps {
  progress: number;
  items: BatchProgress[];
  onCancel: () => void;
}

export function ProgressDlg({ progress, items, onCancel }: ProgressDlgProps) {
  const completed = items.filter((i) => i.status === "completed").length;
  const errors = items.filter((i) => i.status === "error").length;
  const total = items.length;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background border rounded-lg p-6 w-96 space-y-4">
        <h2 className="text-lg font-semibold">Converting...</h2>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progress</span>
            <span>
              {completed}/{total}
              {errors > 0 && <span className="text-destructive ml-2">({errors} errors)</span>}
            </span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {items.length > 0 && (
          <div className="max-h-32 overflow-auto text-sm">
            {items.slice(-5).map((item, index) => (
              <div
                key={index}
                className={`truncate ${
                  item.status === "error"
                    ? "text-destructive"
                    : item.status === "completed"
                    ? "text-muted-foreground"
                    : ""
                }`}
              >
                {item.status === "processing" && "⏳ "}
                {item.status === "completed" && "✓ "}
                {item.status === "error" && "✗ "}
                {item.file_path.split(/[/\\]/).pop()}
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-end">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
