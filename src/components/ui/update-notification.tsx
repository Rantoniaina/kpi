import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Download, X, ExternalLink } from "lucide-react";
import type { UpdateInfo } from "@/lib/tauri";
import { openUrl, backupBeforeUpdate } from "@/lib/tauri";

interface UpdateNotificationProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  updateInfo: UpdateInfo | null;
  currentVersion: string;
  onDismiss?: () => void;
}

export function UpdateNotification({
  open,
  onOpenChange,
  updateInfo,
  currentVersion,
  onDismiss,
}: UpdateNotificationProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  if (!updateInfo) return null;

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      // Create backup before update
      try {
        const backupPath = await backupBeforeUpdate();
        console.log("Backup created before update:", backupPath);
      } catch (backupError) {
        console.warn("Failed to create backup (continuing anyway):", backupError);
        // Continue with update even if backup fails
      }
      
      // Open download URL
      await openUrl(updateInfo.url);
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to open download URL:", error);
      alert(`Failed to open download page: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDismiss = () => {
    onOpenChange(false);
    onDismiss?.();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-2xl">🔄</span>
            <span>Update Available</span>
          </DialogTitle>
          <DialogDescription>
            A new version of KPI Tool is available
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 p-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  Version {updateInfo.version} is now available
                </p>
                <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                  You are currently running version {currentVersion}
                </p>
              </div>
            </div>
          </div>

          {updateInfo.releaseNotes && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold">What's New:</h4>
              <div className="text-sm text-muted-foreground max-h-40 overflow-y-auto rounded border p-3 bg-muted/50">
                <div className="whitespace-pre-wrap">{updateInfo.releaseNotes}</div>
              </div>
            </div>
          )}

          {updateInfo.publishedAt && (
            <p className="text-xs text-muted-foreground">
              Published: {new Date(updateInfo.publishedAt).toLocaleDateString()}
            </p>
          )}

          <div className="rounded-lg bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800 p-3">
            <p className="text-xs text-yellow-800 dark:text-yellow-200">
              <strong>Note:</strong> Your data will be automatically backed up before the update. 
              Database migrations will run automatically to ensure compatibility.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleDismiss}
            disabled={isDownloading}
          >
            <X className="mr-2 h-4 w-4" />
            Later
          </Button>
          <Button
            onClick={handleDownload}
            disabled={isDownloading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isDownloading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Opening...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Download Update
                <ExternalLink className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

