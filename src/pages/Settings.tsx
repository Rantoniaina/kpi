import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Settings as SettingsIcon, Sliders, Database, Save, Loader2, Download, Upload, HardDrive, Trash2, FileText, Bug, ExternalLink } from "lucide-react";
import { ChangelogDialog } from "@/components/ui/changelog-dialog";
import { getGitHubIssueUrl, APP_VERSION } from "@/lib/constants";
import { openUrl } from "@/lib/tauri";
import { getKPIConfig, saveKPIConfig, exportAllData, importData, clearAllData, backupDatabase, restoreDatabase } from "@/lib/tauri";
import { save, open } from "@tauri-apps/plugin-dialog";
import { writeTextFile, readTextFile } from "@tauri-apps/plugin-fs";
import type { KPIConfig } from "@/types";

// Clear Data Button Component
function ClearDataButtonComponent() {
  const [isOpen, setIsOpen] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  const handleClear = async () => {
    try {
      setIsClearing(true);
      await clearAllData();
      setIsOpen(false);
      // Reload immediately after clearing data
      window.location.reload();
    } catch (error) {
      setIsClearing(false);
      setIsOpen(false);
      alert(`Failed to clear data: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  return (
    <>
      <Button
        variant="destructive"
        onClick={() => setIsOpen(true)}
        disabled={isClearing}
        className="w-full"
      >
        {isClearing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Clearing...
          </>
        ) : (
          <>
            <Trash2 className="mr-2 h-4 w-4" />
            Clear All Data
          </>
        )}
      </Button>
      <ConfirmDialog
        open={isOpen}
        onOpenChange={setIsOpen}
        title="Clear All Data"
        description="This will permanently delete all developers, tickets, bugs, and KPI reports. This action cannot be undone. Are you absolutely sure?"
        confirmText="Yes, Clear All Data"
        cancelText="Cancel"
        onConfirm={handleClear}
        variant="destructive"
      />
    </>
  );
}

export function Settings() {
  const [_kpiConfig, setKpiConfig] = useState<KPIConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showChangelog, setShowChangelog] = useState(false);

  // Local state for editing
  const [deliveryWeight, setDeliveryWeight] = useState(0.5);
  const [qualityWeight, setQualityWeight] = useState(0.5);
  const [bugPenaltyCritical, setBugPenaltyCritical] = useState(15.0);
  const [bugPenaltyHigh, setBugPenaltyHigh] = useState(10.0);
  const [bugPenaltyMedium, setBugPenaltyMedium] = useState(5.0);
  const [bugPenaltyLow, setBugPenaltyLow] = useState(2.0);

  // Load config on mount
  useEffect(() => {
    const loadConfig = async () => {
      try {
        setLoading(true);
        const config = await getKPIConfig();
        setKpiConfig(config);
        setDeliveryWeight(config.deliveryWeight);
        setQualityWeight(config.qualityWeight);
        setBugPenaltyCritical(config.bugPenalties.critical);
        setBugPenaltyHigh(config.bugPenalties.high);
        setBugPenaltyMedium(config.bugPenalties.medium);
        setBugPenaltyLow(config.bugPenalties.low);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load KPI configuration");
      } finally {
        setLoading(false);
      }
    };
    loadConfig();
  }, []);

  // Auto-adjust quality weight when delivery weight changes (only if user is adjusting delivery)
  const handleDeliveryWeightChange = (value: number) => {
    setDeliveryWeight(value);
    setQualityWeight(1.0 - value);
  };

  // Auto-adjust delivery weight when quality weight changes (only if user is adjusting quality)
  const handleQualityWeightChange = (value: number) => {
    setQualityWeight(value);
    setDeliveryWeight(1.0 - value);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(false);

      await saveKPIConfig(
        deliveryWeight,
        qualityWeight,
        bugPenaltyCritical,
        bugPenaltyHigh,
        bugPenaltyMedium,
        bugPenaltyLow
      );

      // Reload config to get updated values
      const config = await getKPIConfig();
      setKpiConfig(config);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save KPI configuration");
    } finally {
      setSaving(false);
    }
  };

  const totalWeight = deliveryWeight + qualityWeight;
  const weightError = Math.abs(totalWeight - 1.0) > 0.01;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Configure application preferences and KPI calculation parameters
        </p>
      </div>

      {/* Settings Sections */}
      <div className="space-y-6">
        {/* KPI Configuration Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                <Sliders className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <CardTitle>KPI Configuration</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Adjust how KPI scores are calculated
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                <span className="ml-2 text-sm text-muted-foreground">Loading configuration...</span>
              </div>
            ) : (
              <>
                {error && (
                  <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950">
                    <p className="text-sm font-medium text-red-800 dark:text-red-200">Error</p>
                    <p className="text-sm text-red-600 dark:text-red-400 mt-1">{error}</p>
                  </div>
                )}

                {success && (
                  <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-900 dark:bg-green-950">
                    <p className="text-sm font-medium text-green-800 dark:text-green-200">
                      Configuration saved successfully!
                    </p>
                  </div>
                )}

                {/* Score Weights */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-semibold mb-4">Score Weights</h3>
                    <p className="text-xs text-muted-foreground mb-4">
                      These weights determine how delivery and quality scores are combined into the overall score.
                      They must sum to 1.0 (100%).
                    </p>
                    
                    <div className="space-y-4">
                      <Slider
                        label="Delivery Weight"
                        description="Weight for delivery score in overall KPI calculation (quality weight is automatically adjusted)"
                        value={deliveryWeight}
                        onValueChange={handleDeliveryWeightChange}
                        min={0}
                        max={1}
                        step={0.01}
                        unit=""
                        className={weightError ? "border-red-500" : ""}
                      />
                      <Slider
                        label="Quality Weight"
                        description="Weight for quality score in overall KPI calculation (delivery weight is automatically adjusted)"
                        value={qualityWeight}
                        onValueChange={handleQualityWeightChange}
                        min={0}
                        max={1}
                        step={0.01}
                        unit=""
                        className={weightError ? "border-red-500" : ""}
                      />
                      {weightError && (
                        <p className="text-xs text-red-600 dark:text-red-400">
                          ⚠️ Weights must sum to 1.0 (current: {(totalWeight * 100).toFixed(1)}%)
                        </p>
                      )}
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-muted-foreground">Total:</span>
                        <span className={weightError ? "text-red-600 dark:text-red-400 font-semibold" : "font-semibold"}>
                          {(totalWeight * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bug Penalties */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-semibold mb-4">Bug Severity Penalties</h3>
                    <p className="text-xs text-muted-foreground mb-4">
                      Points deducted from quality score for each bug based on severity.
                      Higher severity bugs have larger penalties.
                    </p>
                    
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="penalty-critical">Critical</Label>
                        <Input
                          id="penalty-critical"
                          type="number"
                          min="0"
                          step="0.1"
                          value={bugPenaltyCritical}
                          onChange={(e) => setBugPenaltyCritical(parseFloat(e.target.value) || 0)}
                        />
                        <p className="text-xs text-muted-foreground">
                          Points deducted per critical bug
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="penalty-high">High</Label>
                        <Input
                          id="penalty-high"
                          type="number"
                          min="0"
                          step="0.1"
                          value={bugPenaltyHigh}
                          onChange={(e) => setBugPenaltyHigh(parseFloat(e.target.value) || 0)}
                        />
                        <p className="text-xs text-muted-foreground">
                          Points deducted per high severity bug
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="penalty-medium">Medium</Label>
                        <Input
                          id="penalty-medium"
                          type="number"
                          min="0"
                          step="0.1"
                          value={bugPenaltyMedium}
                          onChange={(e) => setBugPenaltyMedium(parseFloat(e.target.value) || 0)}
                        />
                        <p className="text-xs text-muted-foreground">
                          Points deducted per medium severity bug
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="penalty-low">Low</Label>
                        <Input
                          id="penalty-low"
                          type="number"
                          min="0"
                          step="0.1"
                          value={bugPenaltyLow}
                          onChange={(e) => setBugPenaltyLow(parseFloat(e.target.value) || 0)}
                        />
                        <p className="text-xs text-muted-foreground">
                          Points deducted per low severity bug
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-end pt-4 border-t">
                  <Button
                    onClick={handleSave}
                    disabled={saving || weightError}
                    className="min-w-[120px]"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Configuration
                      </>
                    )}
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Data Management Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
                <Database className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div className="flex-1">
                <CardTitle>Data Management</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Backup, restore, export, import, and manage your data
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Export/Import Section */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold">Export & Import</h3>
              <div className="grid gap-3 md:grid-cols-2">
                <Button
                  variant="outline"
                  onClick={async () => {
                    try {
                      const jsonData = await exportAllData();
                      const filePath = await save({
                        defaultPath: `kpi-export-${new Date().toISOString().split('T')[0]}.json`,
                        filters: [
                          {
                            name: "JSON",
                            extensions: ["json"],
                          },
                        ],
                      });
                      if (filePath) {
                        await writeTextFile(filePath, jsonData);
                        alert(`Data exported successfully to:\n${filePath}`);
                      }
                    } catch (error) {
                      alert(`Failed to export data: ${error instanceof Error ? error.message : String(error)}`);
                    }
                  }}
                  className="w-full"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Export All Data (JSON)
                </Button>
                <Button
                  variant="outline"
                  onClick={async () => {
                    try {
                      const filePath = await open({
                        filters: [
                          {
                            name: "JSON",
                            extensions: ["json"],
                          },
                        ],
                      });
                      if (filePath && typeof filePath === 'string') {
                        const jsonData = await readTextFile(filePath);
                        await importData(jsonData);
                        // Reload immediately after importing data
                        window.location.reload();
                      }
                    } catch (error) {
                      alert(`Failed to import data: ${error instanceof Error ? error.message : String(error)}`);
                    }
                  }}
                  className="w-full"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Import Data (JSON)
                </Button>
              </div>
            </div>

            {/* Backup/Restore Section */}
            <div className="space-y-3 pt-4 border-t">
              <h3 className="text-sm font-semibold">Database Backup & Restore</h3>
              <div className="grid gap-3 md:grid-cols-2">
                <Button
                  variant="outline"
                  onClick={async () => {
                    try {
                      const backupPath = await backupDatabase();
                      alert(`Database backed up successfully to:\n${backupPath}`);
                    } catch (error) {
                      alert(`Failed to backup database: ${error instanceof Error ? error.message : String(error)}`);
                    }
                  }}
                  className="w-full"
                >
                  <HardDrive className="mr-2 h-4 w-4" />
                  Backup Database
                </Button>
                <Button
                  variant="outline"
                  onClick={async () => {
                    try {
                      const filePath = await open({
                        filters: [
                          {
                            name: "Database",
                            extensions: ["db"],
                          },
                        ],
                      });
                      if (filePath && typeof filePath === 'string') {
                        await restoreDatabase(filePath);
                        // Reload immediately after restoring database
                        window.location.reload();
                      }
                    } catch (error) {
                      alert(`Failed to restore database: ${error instanceof Error ? error.message : String(error)}`);
                    }
                  }}
                  className="w-full"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Restore Database
                </Button>
              </div>
            </div>

            {/* Clear Data Section */}
            <div className="space-y-3 pt-4 border-t">
              <h3 className="text-sm font-semibold text-red-600 dark:text-red-400">Danger Zone</h3>
              <p className="text-xs text-muted-foreground">
                Permanently delete all data. This action cannot be undone.
              </p>
              <ClearDataButtonComponent />
            </div>
          </CardContent>
        </Card>

        {/* About Section */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-500/10">
              <SettingsIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">About</h2>
              <p className="text-sm text-muted-foreground">
                Application information and version
              </p>
            </div>
          </div>
          <div className="pl-14 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Version</span>
              <button
                onClick={() => setShowChangelog(true)}
                className="text-sm text-muted-foreground hover:text-foreground hover:underline cursor-pointer"
              >
                {APP_VERSION}
              </button>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Database Location</span>
              <span className="text-sm text-muted-foreground font-mono text-xs">
                ~/Library/Application Support/kpi-tool/kpi.db
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Framework</span>
              <span className="text-sm text-muted-foreground">Tauri 2.x</span>
            </div>
          </div>
        </Card>

        {/* Report Bug Section */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/10">
              <Bug className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Report a Bug</h2>
              <p className="text-sm text-muted-foreground">
                Found an issue? Report it on GitHub
              </p>
            </div>
          </div>
          <div className="pl-14">
            <Button
              variant="outline"
              onClick={async () => {
                try {
                  const url = getGitHubIssueUrl();
                  await openUrl(url);
                } catch (error) {
                  alert(`Failed to open GitHub: ${error instanceof Error ? error.message : String(error)}`);
                }
              }}
              className="w-full"
            >
              <Bug className="mr-2 h-4 w-4" />
              Report Bug on GitHub
              <ExternalLink className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </Card>
      </div>

      {/* Changelog Dialog */}
      <ChangelogDialog open={showChangelog} onOpenChange={setShowChangelog} />
    </div>
  );
}
