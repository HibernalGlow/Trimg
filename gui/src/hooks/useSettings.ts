import { useState, useCallback, useEffect } from "react";

const STORAGE_KEY = "slimg-settings";

export type SaveToMode = "source" | "custom";
export type OnOutputExists = "rename" | "skip" | "overwrite";
export type DeleteOriginalMode = "trash" | "permanent";

export interface AppSettings {
  outputDir: string;
  saveToMode: SaveToMode;
  keepFolderStructure: boolean;
  defaultQuality: number;
  effort: number;
  threads: number;
  onOutputExists: OnOutputExists;
  clearFileList: boolean;
  deleteOriginal: boolean;
  deleteOriginalMode: DeleteOriginalMode;
  overwrite: boolean;
}

const DEFAULT_SETTINGS: AppSettings = {
  outputDir: "",
  saveToMode: "source",
  keepFolderStructure: false,
  defaultQuality: 60,
  effort: 6,
  threads: 1,
  onOutputExists: "rename",
  clearFileList: false,
  deleteOriginal: false,
  deleteOriginalMode: "trash",
  overwrite: false,
};

function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw) as Partial<AppSettings>;
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

function saveSettings(settings: AppSettings): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

export function useSettings() {
  const [settings, setSettingsState] = useState<AppSettings>(loadSettings);

  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  const updateSettings = useCallback(
    (patch: Partial<AppSettings>) => {
      setSettingsState((prev) => ({ ...prev, ...patch }));
    },
    []
  );

  const resetSettings = useCallback(() => {
    setSettingsState(DEFAULT_SETTINGS);
  }, []);

  return { settings, updateSettings, resetSettings };
}
