import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui";
import { DateTimeField } from "@/components/ui/datetime-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { Bug, BugType, Ticket, Developer } from "@/types";

interface BugCardProps {
  bug: Bug;
  ticket?: Ticket;
  developer?: Developer;
  /** Developer who resolved the bug (looked up from resolvedByDeveloperId) */
  resolvedByDeveloper?: Developer;
  /** All available developers for the resolve dialog */
  allDevelopers: Developer[];
  /** All available tickets for linking fix ticket */
  allTickets: Ticket[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: () => void;
  onResolve: (resolvedByDeveloperId?: string, fixTicketId?: string, fixHours?: number, resolvedDate?: string) => Promise<void>;
  onReclassify: (bugType: BugType) => Promise<void>;
  onUpdateResolutionDate?: (resolvedDate: string) => Promise<void>;
}

// Bug type definitions with descriptions and KPI impact
const bugTypes: {
  value: BugType;
  label: string;
  description: string;
  impact: string;
  icon: string;
  color: string;
  selectedColor: string;
  impactColor: string;
}[] = [
  {
    value: "developer_error",
    label: "Developer Error",
    description: "Coding mistake, oversight, or incorrect implementation",
    impact: "Full KPI deduction",
    icon: "❌",
    color: "border-red-500 bg-red-50 dark:bg-red-950/30",
    selectedColor: "border-red-500 bg-red-100 dark:bg-red-900/50 ring-2 ring-red-500",
    impactColor: "text-red-600 dark:text-red-400",
  },
  {
    value: "conceptual",
    label: "Conceptual / Misunderstanding",
    description: "Requirements were misunderstood or unclear",
    impact: "Minor KPI deduction",
    icon: "🤔",
    color: "border-amber-500 bg-amber-50 dark:bg-amber-950/30",
    selectedColor: "border-amber-500 bg-amber-100 dark:bg-amber-900/50 ring-2 ring-amber-500",
    impactColor: "text-amber-600 dark:text-amber-400",
  },
  {
    value: "requirement_change",
    label: "Requirement Change",
    description: "Specification changed after implementation",
    impact: "No KPI deduction",
    icon: "📝",
    color: "border-blue-500 bg-blue-50 dark:bg-blue-950/30",
    selectedColor: "border-blue-500 bg-blue-100 dark:bg-blue-900/50 ring-2 ring-blue-500",
    impactColor: "text-green-600 dark:text-green-400",
  },
  {
    value: "environment",
    label: "Environment Issue",
    description: "Infrastructure, deployment, or configuration problem",
    impact: "No KPI deduction",
    icon: "🖥️",
    color: "border-gray-500 bg-gray-50 dark:bg-gray-950/30",
    selectedColor: "border-gray-500 bg-gray-100 dark:bg-gray-900/50 ring-2 ring-gray-500",
    impactColor: "text-green-600 dark:text-green-400",
  },
  {
    value: "third_party",
    label: "Third-Party Issue",
    description: "External dependency, API, or library problem",
    impact: "No KPI deduction",
    icon: "🔌",
    color: "border-purple-500 bg-purple-50 dark:bg-purple-950/30",
    selectedColor: "border-purple-500 bg-purple-100 dark:bg-purple-900/50 ring-2 ring-purple-500",
    impactColor: "text-green-600 dark:text-green-400",
  },
];

// Severity colors
const severityVariant: Record<string, "error" | "warning" | "info" | "default"> = {
  critical: "error",
  high: "warning",
  medium: "info",
  low: "default",
};

// Helper to format date for display
function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function BugCard({
  bug,
  ticket,
  developer,
  resolvedByDeveloper,
  allDevelopers,
  allTickets,
  open,
  onOpenChange,
  onEdit,
  onResolve,
  onReclassify,
  onUpdateResolutionDate,
}: BugCardProps) {
  const navigate = useNavigate();
  const [showResolveDialog, setShowResolveDialog] = useState(false);
  const [showReclassifyDialog, setShowReclassifyDialog] = useState(false);
  const [isResolving, setIsResolving] = useState(false);
  const [isReclassifying, setIsReclassifying] = useState(false);
  const [selectedBugType, setSelectedBugType] = useState<BugType>(bug.bugType);
  
  // Resolve dialog state
  const [selectedResolverId, setSelectedResolverId] = useState<string>("");
  const [selectedFixTicketId, setSelectedFixTicketId] = useState<string>("");
  const [fixHours, setFixHours] = useState<string>("");
  const [resolvedDate, setResolvedDate] = useState<string>("");
  
  // Edit resolution date state
  const [showEditResolutionDate, setShowEditResolutionDate] = useState(false);
  const [editResolutionDate, setEditResolutionDate] = useState<string>("");
  const [isUpdating, setIsUpdating] = useState(false);

  const currentBugType = bugTypes.find((t) => t.value === bug.bugType);

  // Get fix ticket info (for display in bug card)
  const fixTicket = bug.fixTicketId 
    ? allTickets.find(t => t.id === bug.fixTicketId) 
    : undefined;

  // Get selected fix ticket info (for resolve dialog)
  const selectedFixTicket = selectedFixTicketId 
    ? allTickets.find(t => t.id === selectedFixTicketId)
    : undefined;

  const handleResolve = async () => {
    setIsResolving(true);
    try {
      const hours = fixHours ? parseFloat(fixHours) : undefined;
      const date = resolvedDate || undefined;
      await onResolve(
        selectedResolverId || undefined,
        selectedFixTicketId || undefined,
        hours,
        date
      );
      setShowResolveDialog(false);
      setSelectedResolverId("");
      setSelectedFixTicketId("");
      setFixHours("");
      setResolvedDate("");
    } finally {
      setIsResolving(false);
    }
  };

  const handleReclassify = async () => {
    if (selectedBugType === bug.bugType) {
      setShowReclassifyDialog(false);
      return;
    }
    setIsReclassifying(true);
    try {
      await onReclassify(selectedBugType);
      setShowReclassifyDialog(false);
    } finally {
      setIsReclassifying(false);
    }
  };

  const activeDevelopers = allDevelopers.filter(d => d.isActive);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-start gap-3">
              <span className="text-2xl">🐛</span>
              <div className="flex-1">
                <h2 className="text-xl font-bold leading-tight">{bug.title}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <StatusBadge status={bug.severity} variant={severityVariant[bug.severity]} />
                  {bug.isResolved ? (
                    <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                      ✓ Resolved
                    </span>
                  ) : (
                    <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                      ⚠ Open
                    </span>
                  )}
                </div>
              </div>
            </DialogTitle>
          </DialogHeader>

          {/* Description */}
          {bug.description && (
            <div className="rounded-lg bg-muted/50 p-3">
              <p className="text-sm whitespace-pre-wrap">{bug.description}</p>
            </div>
          )}

          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Original Ticket:</span>
              <p className="font-medium">{ticket?.title || "Unknown"}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Introduced By:</span>
              <p className="font-medium text-red-600 dark:text-red-400">
                {developer?.name || "Unknown"}
                <span className="text-xs text-muted-foreground ml-1">(KPI impact)</span>
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">Reported:</span>
              <p className="font-medium">{formatDate(bug.createdAt)}</p>
            </div>
            {bug.resolvedDate && (
              <div>
                <span className="text-muted-foreground">Resolved:</span>
                <p className="font-medium text-green-600 dark:text-green-400">
                  {formatDate(bug.resolvedDate)}
                </p>
              </div>
            )}
            {bug.isResolved && resolvedByDeveloper && (
              <div>
                <span className="text-muted-foreground">Resolved By:</span>
                <p className="font-medium text-green-600 dark:text-green-400">
                  {resolvedByDeveloper.name}
                </p>
              </div>
            )}
            {bug.isResolved && fixTicket && (
              <div>
                <span className="text-muted-foreground">Fix Ticket:</span>
                <p className="font-medium text-blue-600 dark:text-blue-400">
                  {fixTicket.title}
                </p>
              </div>
            )}
          </div>

          {/* Bug Classification */}
          <div className="border-t pt-4">
            <h3 className="text-sm font-medium mb-3">Bug Classification</h3>
            {currentBugType && (
              <div className={cn(
                "flex items-start gap-3 p-3 rounded-lg border-2",
                currentBugType.selectedColor
              )}>
                <span className="text-2xl">{currentBugType.icon}</span>
                <div className="flex-1">
                  <p className="font-medium">{currentBugType.label}</p>
                  <p className="text-sm text-muted-foreground">{currentBugType.description}</p>
                  <p className={cn("text-sm mt-1 font-medium", currentBugType.impactColor)}>
                    {currentBugType.impact}
                  </p>
                </div>
              </div>
            )}
            {!bug.isResolved && (
              <Button
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={() => {
                  setSelectedBugType(bug.bugType);
                  setShowReclassifyDialog(true);
                }}
              >
                🔄 Reclassify Bug Type
              </Button>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2 border-t pt-4">
            {!bug.isResolved && (
              <Button
                variant="default"
                size="sm"
                onClick={() => setShowResolveDialog(true)}
                className="bg-green-600 hover:bg-green-700"
              >
                ✓ Mark Resolved
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={onEdit}>
              ✏️ Edit
            </Button>
            {bug.isResolved && bug.resolvedDate && onUpdateResolutionDate && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  // Convert database format to ISO for picker
                  const dbDate = bug.resolvedDate!;
                  const isoDate = dbDate.includes("T") ? dbDate : dbDate.replace(" ", "T");
                  setEditResolutionDate(isoDate);
                  setShowEditResolutionDate(true);
                }}
              >
                📅 Edit Resolution Date
              </Button>
            )}
            {ticket && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onOpenChange(false);
                  navigate(`/tickets?highlight=${ticket.id}`);
                }}
              >
                🎫 View Ticket
              </Button>
            )}
            {developer && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onOpenChange(false);
                  navigate(`/developers?highlight=${developer.id}`);
                }}
              >
                👤 View Developer
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Resolve Dialog with Resolver Selection */}
      <Dialog open={showResolveDialog} onOpenChange={setShowResolveDialog}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>Resolve Bug</DialogTitle>
            <DialogDescription>
              Mark this bug as resolved and optionally specify who fixed it.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="rounded-lg bg-muted/50 p-3">
              <p className="text-sm font-medium">{bug.title}</p>
              <p className="text-xs text-muted-foreground mt-1">
                KPI impact will remain on: <span className="font-medium">{developer?.name || "Unknown"}</span>
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Resolved By (optional)</label>
              <Select 
                value={selectedResolverId || "none"} 
                onValueChange={(v) => setSelectedResolverId(v === "none" ? "" : v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select who fixed this bug" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Not specified</SelectItem>
                  {activeDevelopers.map((dev) => (
                    <SelectItem key={dev.id} value={dev.id}>
                      {dev.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                The developer who actually fixed this bug (can be different from who introduced it)
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Fix Ticket (optional)</label>
              <Select 
                value={selectedFixTicketId || "none"} 
                onValueChange={(v) => {
                  setSelectedFixTicketId(v === "none" ? "" : v);
                  // Clear hours when ticket changes
                  setFixHours("");
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Link to a fix ticket" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No linked ticket</SelectItem>
                  {allTickets.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.title.length > 40 ? t.title.slice(0, 40) + "..." : t.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                If a new ticket was created to fix this bug, link it here
              </p>
            </div>

            {/* Time spent on fix - only shown when fix ticket is selected */}
            {selectedFixTicketId && selectedResolverId && (
              <div className="space-y-2 rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-950/30">
                <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                  <span>⏱️</span>
                  <span className="text-sm font-medium">Time Tracking</span>
                </div>
                <p className="text-xs text-blue-600 dark:text-blue-400 mb-2">
                  The fix ticket "{selectedFixTicket?.title.slice(0, 30)}..." will be reassigned to {allDevelopers.find(d => d.id === selectedResolverId)?.name || "the resolver"}.
                </p>
                <div className="space-y-1">
                  <label className="text-sm font-medium">Hours spent on fix</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    value={fixHours}
                    onChange={(e) => setFixHours(e.target.value)}
                    placeholder="e.g., 2.5"
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  />
                  <p className="text-xs text-muted-foreground">
                    Hours will be added to the fix ticket's actual hours (for KPI tracking)
                  </p>
                </div>
              </div>
            )}

            <DateTimeField
              label="Resolution Date & Time"
              value={resolvedDate}
              onChange={(value) => setResolvedDate(value || "")}
              description="When was this bug resolved? (defaults to now if not specified)"
            />
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowResolveDialog(false)}
              disabled={isResolving}
            >
              Cancel
            </Button>
            <Button
              onClick={handleResolve}
              disabled={isResolving}
              className="bg-green-600 hover:bg-green-700"
            >
              {isResolving ? "Resolving..." : "Resolve Bug"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reclassify Dialog */}
      <Dialog open={showReclassifyDialog} onOpenChange={setShowReclassifyDialog}>
        <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Reclassify Bug Type</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Select the correct classification for this bug. This affects how the bug impacts the developer's KPI score.
            </p>
            
            <div className="grid gap-2">
              {bugTypes.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setSelectedBugType(type.value)}
                  className={cn(
                    "flex items-start gap-3 p-3 rounded-lg border-2 text-left transition-all",
                    selectedBugType === type.value ? type.selectedColor : type.color,
                    "hover:opacity-90"
                  )}
                >
                  <span className="text-xl">{type.icon}</span>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{type.label}</p>
                    <p className="text-xs text-muted-foreground">{type.description}</p>
                    <p className={cn("text-xs mt-1 font-medium", type.impactColor)}>
                      {type.impact}
                    </p>
                  </div>
                  {selectedBugType === type.value && (
                    <span className="text-primary">✓</span>
                  )}
                </button>
              ))}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => setShowReclassifyDialog(false)}
                disabled={isReclassifying}
              >
                Cancel
              </Button>
              <Button
                onClick={handleReclassify}
                disabled={isReclassifying || selectedBugType === bug.bugType}
              >
                {isReclassifying ? "Saving..." : "Update Classification"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Resolution Date Dialog */}
      {onUpdateResolutionDate && (
        <Dialog open={showEditResolutionDate} onOpenChange={setShowEditResolutionDate}>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle>Edit Resolution Date</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <DateTimeField
                label="Resolution Date & Time"
                value={editResolutionDate}
                onChange={(value) => setEditResolutionDate(value || "")}
                description="Update when this bug was resolved"
              />
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowEditResolutionDate(false)}
                  disabled={isUpdating}
                >
                  Cancel
                </Button>
                <Button
                  onClick={async () => {
                    if (!editResolutionDate) return;
                    setIsUpdating(true);
                    try {
                      await onUpdateResolutionDate(editResolutionDate);
                      setShowEditResolutionDate(false);
                    } finally {
                      setIsUpdating(false);
                    }
                  }}
                  disabled={isUpdating || !editResolutionDate}
                >
                  {isUpdating ? "Updating..." : "Update"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
