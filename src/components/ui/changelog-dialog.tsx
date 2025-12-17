import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { APP_VERSION } from "@/lib/constants";

interface ChangelogEntry {
  version: string;
  date?: string;
  added?: string[];
  changed?: string[];
  fixed?: string[];
  removed?: string[];
  content?: string; // Raw markdown content for unreleased
}

interface ChangelogDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Parse CHANGELOG.md content into structured entries
 */
function parseChangelog(content: string): ChangelogEntry[] {
  const entries: ChangelogEntry[] = [];
  const lines = content.split("\n");
  
  let currentEntry: ChangelogEntry | null = null;
  let currentSection: keyof ChangelogEntry | null = null;
  let inUnreleased = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Version header: ## [version] or ## [Unreleased]
    if (line.startsWith("## [")) {
      if (currentEntry) {
        entries.push(currentEntry);
      }
      
      const versionMatch = line.match(/## \[([^\]]+)\]/);
      if (versionMatch) {
        const version = versionMatch[1];
        inUnreleased = version === "Unreleased";
        currentEntry = {
          version,
          content: inUnreleased ? "" : undefined,
        };
        currentSection = null;
      }
    }
    // Date: - YYYY-MM-DD
    else if (line.startsWith("- ") && currentEntry && !currentEntry.date) {
      currentEntry.date = line.substring(2);
    }
    // Section header: ### Added, ### Changed, etc.
    else if (line.startsWith("### ")) {
      const section = line.substring(4).toLowerCase();
      if (section === "added" || section === "changed" || section === "fixed" || section === "removed") {
        currentSection = section as keyof ChangelogEntry;
        if (currentEntry && !currentEntry[currentSection]) {
          (currentEntry[currentSection] as string[]) = [];
        }
      } else {
        currentSection = null;
      }
    }
    // List item: - item text
    else if (line.startsWith("- ") && currentEntry && currentSection) {
      const item = line.substring(2);
      if (currentEntry[currentSection] && Array.isArray(currentEntry[currentSection])) {
        (currentEntry[currentSection] as string[]).push(item);
      }
    }
    // For unreleased, collect all content
    else if (inUnreleased && currentEntry && line && !line.startsWith("#")) {
      if (!currentEntry.content) {
        currentEntry.content = "";
      }
      currentEntry.content += line + "\n";
    }
  }
  
  if (currentEntry) {
    entries.push(currentEntry);
  }
  
  return entries;
}

export function ChangelogDialog({ open, onOpenChange }: ChangelogDialogProps) {
  const [changelog, setChangelog] = useState<ChangelogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      loadChangelog();
    }
  }, [open]);

  const loadChangelog = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch CHANGELOG.md from the project root
      const response = await fetch("/CHANGELOG.md");
      if (!response.ok) {
        throw new Error("Failed to load changelog");
      }
      
      const content = await response.text();
      const entries = parseChangelog(content);
      setChangelog(entries);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load changelog");
    } finally {
      setLoading(false);
    }
  };

  const currentVersionEntry = changelog.find((e) => e.version === APP_VERSION);
  const unreleasedEntry = changelog.find((e) => e.version === "Unreleased");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Changelog</DialogTitle>
          <DialogDescription>
            Version history and release notes
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[60vh] overflow-y-auto pr-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              <span className="ml-2 text-sm text-muted-foreground">Loading changelog...</span>
            </div>
          ) : error ? (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950">
              <p className="text-sm font-medium text-red-800 dark:text-red-200">Error</p>
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">{error}</p>
            </div>
          ) : (
            <div className="space-y-6 py-4">
              {/* Current Version */}
              {currentVersionEntry && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold">v{currentVersionEntry.version}</h3>
                    {currentVersionEntry.date && (
                      <span className="text-sm text-muted-foreground">
                        ({currentVersionEntry.date})
                      </span>
                    )}
                    <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                      Current
                    </span>
                  </div>
                  
                  {currentVersionEntry.added && currentVersionEntry.added.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-green-700 dark:text-green-400 mb-2">
                        Added
                      </h4>
                      <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-2">
                        {currentVersionEntry.added.map((item, idx) => (
                          <li key={idx}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {currentVersionEntry.changed && currentVersionEntry.changed.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-blue-700 dark:text-blue-400 mb-2">
                        Changed
                      </h4>
                      <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-2">
                        {currentVersionEntry.changed.map((item, idx) => (
                          <li key={idx}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {currentVersionEntry.fixed && currentVersionEntry.fixed.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-yellow-700 dark:text-yellow-400 mb-2">
                        Fixed
                      </h4>
                      <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-2">
                        {currentVersionEntry.fixed.map((item, idx) => (
                          <li key={idx}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Unreleased */}
              {unreleasedEntry && (
                <div className="space-y-3 border-t pt-4">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold">Unreleased</h3>
                    <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-2 py-1 rounded">
                      Coming Soon
                    </span>
                  </div>
                  
                  {unreleasedEntry.content ? (
                    <div className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {unreleasedEntry.content}
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground">
                      {unreleasedEntry.added && unreleasedEntry.added.length > 0 && (
                        <div className="mb-3">
                          <h4 className="text-sm font-semibold text-green-700 dark:text-green-400 mb-2">
                            Planned
                          </h4>
                          <ul className="list-disc list-inside space-y-1 ml-2">
                            {unreleasedEntry.added.map((item, idx) => (
                              <li key={idx}>{item}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Other Versions */}
              {changelog
                .filter((e) => e.version !== APP_VERSION && e.version !== "Unreleased")
                .map((entry) => (
                  <div key={entry.version} className="space-y-2 border-t pt-4">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-semibold">v{entry.version}</h3>
                      {entry.date && (
                        <span className="text-sm text-muted-foreground">({entry.date})</span>
                      )}
                    </div>
                    
                    {entry.added && entry.added.length > 0 && (
                      <div>
                        <h4 className="text-xs font-semibold text-green-700 dark:text-green-400 mb-1">
                          Added
                        </h4>
                        <ul className="list-disc list-inside space-y-1 text-xs text-muted-foreground ml-2">
                          {entry.added.slice(0, 3).map((item, idx) => (
                            <li key={idx}>{item}</li>
                          ))}
                          {entry.added.length > 3 && (
                            <li className="text-muted-foreground/70">
                              ... and {entry.added.length - 3} more
                            </li>
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

