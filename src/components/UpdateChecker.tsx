import { useEffect, useState } from "react";
import { UpdateNotification } from "@/components/ui/update-notification";
import { getAppVersion, checkForUpdates, type UpdateInfo } from "@/lib/tauri";
import { APP_VERSION } from "@/lib/constants";

export function UpdateChecker() {
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
  const [showUpdateDialog, setShowUpdateDialog] = useState(false);
  const [currentVersion, setCurrentVersion] = useState<string>(APP_VERSION);
  const [hasChecked, setHasChecked] = useState(false);

  useEffect(() => {
    // Check for updates on app startup (with a small delay to not block initial render)
    const checkUpdates = async () => {
      try {
        // Get version from database (may differ from package.json if updated)
        const dbVersion = await getAppVersion();
        setCurrentVersion(dbVersion);

        // Check for updates using the database version
        const update = await checkForUpdates(dbVersion);
        
        if (update) {
          setUpdateInfo(update);
          setShowUpdateDialog(true);
        }
      } catch (error) {
        // Silently fail - don't interrupt user experience
        console.error("Failed to check for updates:", error);
      } finally {
        setHasChecked(true);
      }
    };

    // Delay update check by 2 seconds to let app load first
    const timer = setTimeout(checkUpdates, 2000);
    return () => clearTimeout(timer);
  }, []);

  // Don't render anything if we haven't checked yet or no update available
  if (!hasChecked || !updateInfo) {
    return null;
  }

  return (
    <UpdateNotification
      open={showUpdateDialog}
      onOpenChange={setShowUpdateDialog}
      updateInfo={updateInfo}
      currentVersion={currentVersion}
      onDismiss={() => {
        // User dismissed - don't show again until next app start
        setShowUpdateDialog(false);
      }}
    />
  );
}

