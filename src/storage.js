import { useState, useEffect } from "react";
let storageFailed = false;
export const hasStorageError = () => storageFailed;
export function useSaved(key, initial) {
  const [value, setValue] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("forward:" + key)) ?? initial;
    } catch {
      return initial;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem("forward:" + key, JSON.stringify(value));
    } catch {
      storageFailed = true;
      window.dispatchEvent(new Event("forward-storage-error"));
    }
  }, [key, value]);
  return [value, setValue];
}
export function pageSnapshot(site, page) {
  const prefix = "forward:" + site.id + "/" + page.id,
    saved = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key === prefix || key.startsWith(prefix + ":")) {
      try {
        saved[key.slice(8)] = JSON.parse(localStorage.getItem(key));
      } catch {}
    }
  }
  return {
    workspace: site.name,
    page: page.title,
    sample: true,
    exportedAt: new Date().toISOString(),
    initialData: page,
    savedState: saved,
  };
}
