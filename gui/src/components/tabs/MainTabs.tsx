import { useState } from "react";
import { InputTab } from "./InputTab";
import { OutputTab } from "./OutputTab";
import { ModifyTab } from "./ModifyTab";
import { SettingsTab } from "./SettingsTab";
import { AboutTab } from "./AboutTab";
import { useSettings } from "@/hooks/useSettings";
import { useBatchProcess } from "@/hooks/useBatchProcess";
import { api, type ImageInfo, type ProcessOptions } from "@/lib/tauri";
import { ProgressDlg } from "./ProgressDlg";

interface LoadedFile {
  path: string;
  info: ImageInfo;
}

export function MainTabs() {
  const [activeTab, setActiveTab] = useState(0);
  const [files, setFiles] = useState<LoadedFile[]>([]);
  const [loading, setLoading] = useState(false);
  const { settings, updateSettings, resetSettings } = useSettings();
  const {
    batchItems,
    isProcessing,
    progress,
    processBatch,
    reset: resetBatch,
  } = useBatchProcess();

  const tabs = ["Input", "Output", "Modify", "Settings", "About"];

  const handleFilesAdded = async (paths: string[]) => {
    setLoading(true);
    try {
      const loaded: LoadedFile[] = [];
      for (const path of paths) {
        try {
          const info = await api.loadImage(path);
          loaded.push({ path, info });
        } catch (e) {
          console.error("Failed to load:", path, e);
        }
      }
      setFiles((prev) => [...prev, ...loaded]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearFiles = () => {
    setFiles([]);
  };

  const handleConvert = async (options: ProcessOptions) => {
    if (files.length === 0) return;
    await processBatch(
      files.map((f) => f.path),
      options
    );
    if (options.clear_file_list) {
      handleClearFiles();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Tab Bar */}
      <div className="flex border-b bg-background">
        {tabs.map((tab, index) => (
          <button
            key={tab}
            onClick={() => setActiveTab(index)}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === index
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-auto p-4">
        {activeTab === 0 && (
          <InputTab
            files={files}
            loading={loading}
            onFilesAdded={handleFilesAdded}
            onClear={handleClearFiles}
            onConvert={() => setActiveTab(1)}
          />
        )}
        {activeTab === 1 && (
          <OutputTab
            settings={settings}
            onUpdateSettings={updateSettings}
            fileCount={files.length}
            onConvert={handleConvert}
            isProcessing={isProcessing}
          />
        )}
        {activeTab === 2 && (
          <ModifyTab
            settings={settings}
            onUpdateSettings={updateSettings}
            fileCount={files.length}
            onConvert={handleConvert}
            isProcessing={isProcessing}
          />
        )}
        {activeTab === 3 && (
          <SettingsTab
            settings={settings}
            onUpdateSettings={updateSettings}
            onResetSettings={resetSettings}
          />
        )}
        {activeTab === 4 && <AboutTab />}
      </div>

      {/* Progress Dialog */}
      {isProcessing && (
        <ProgressDlg
          progress={progress}
          items={batchItems}
          onCancel={() => {}}
        />
      )}
    </div>
  );
}
