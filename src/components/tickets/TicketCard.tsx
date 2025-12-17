import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/text-field";
import { DateTimeField } from "@/components/ui/datetime-picker";
import {
  StatCard,
  TicketStatusBadge,
  StatusBadge,
  ConfirmDialog,
} from "@/components/ui";
import { TicketTimeline } from "./TicketTimeline";
import type { Ticket, TicketStatus, Developer } from "@/types";
import { useBugs } from "@/hooks/useBugs";

interface TicketCardProps {
  ticket: Ticket;
  developer?: Developer;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: () => void;
  onStatusChange: (status: TicketStatus) => Promise<void>;
  onComplete: (actualHours?: number, completionDate?: string) => Promise<void>;
  onReopen: () => Promise<void>;
  onUpdateCompletionDate?: (completionDate: string) => Promise<void>;
  onUpdateDueDate?: (dueDate: string) => Promise<void>;
  onUpdateReopenCount?: (reopenCount: number) => Promise<void>;
}

// Status workflow: what statuses can transition to what
const statusTransitions: Record<TicketStatus, TicketStatus[]> = {
  assigned: ["in_progress"],
  in_progress: ["review", "assigned"],
  review: ["completed", "in_progress"],
  completed: [], // Can only reopen
  reopened: ["in_progress"],
};

// Helper to check if ticket is overdue
function isOverdue(ticket: Ticket): boolean {
  if (ticket.status === "completed") return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dueDate = new Date(ticket.dueDate);
  return dueDate < today;
}

// Helper to check if ticket was completed on time
function wasOnTime(ticket: Ticket): boolean | null {
  if (ticket.status !== "completed" || !ticket.completedDate) return null;
  return new Date(ticket.completedDate) <= new Date(ticket.dueDate);
}

export function TicketCard({
  ticket,
  developer,
  open,
  onOpenChange,
  onEdit,
  onStatusChange,
  onComplete,
  onReopen,
  onUpdateCompletionDate,
  onUpdateDueDate,
  onUpdateReopenCount,
}: TicketCardProps) {
  const navigate = useNavigate();
  const { bugs } = useBugs({ ticketId: ticket.id });
  
  const [isCompleting, setIsCompleting] = useState(false);
  const [actualHours, setActualHours] = useState<string>("");
  const [completionDate, setCompletionDate] = useState<string>("");
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);
  const [showReopenDialog, setShowReopenDialog] = useState(false);
  const [isReopening, setIsReopening] = useState(false);
  const [isChangingStatus, setIsChangingStatus] = useState(false);
  
  // Edit dialogs state
  const [showEditCompletionDate, setShowEditCompletionDate] = useState(false);
  const [showEditDueDate, setShowEditDueDate] = useState(false);
  const [showEditReopenCount, setShowEditReopenCount] = useState(false);
  const [editCompletionDate, setEditCompletionDate] = useState<string>("");
  const [editDueDate, setEditDueDate] = useState<string>("");
  const [editReopenCount, setEditReopenCount] = useState<string>("");
  const [isUpdating, setIsUpdating] = useState(false);

  const overdue = isOverdue(ticket);
  const onTime = wasOnTime(ticket);
  const availableTransitions = statusTransitions[ticket.status];
  
  // Bug stats
  const totalBugs = bugs.length;
  const unresolvedBugs = bugs.filter((b) => !b.isResolved).length;
  const developerErrorBugs = bugs.filter((b) => b.bugType === "developer_error").length;

  const handleStatusChange = async (newStatus: TicketStatus) => {
    setIsChangingStatus(true);
    try {
      await onStatusChange(newStatus);
    } finally {
      setIsChangingStatus(false);
    }
  };

  const handleComplete = async () => {
    setIsCompleting(true);
    try {
      const hours = actualHours ? parseFloat(actualHours) : undefined;
      const date = completionDate || undefined;
      await onComplete(hours, date);
      setShowCompleteDialog(false);
      setActualHours("");
      setCompletionDate("");
    } finally {
      setIsCompleting(false);
    }
  };

  const handleReopen = async () => {
    setIsReopening(true);
    try {
      await onReopen();
      setShowReopenDialog(false);
    } finally {
      setIsReopening(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-start gap-3">
              <span className="text-2xl">🎫</span>
              <div className="flex-1">
                <h2 className="text-xl font-bold leading-tight">{ticket.title}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <TicketStatusBadge status={ticket.status} />
                  {overdue && (
                    <span className="text-xs text-red-600 dark:text-red-400 font-medium">
                      ⚠️ Overdue
                    </span>
                  )}
                  {onTime === true && (
                    <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                      ✓ On time
                    </span>
                  )}
                  {onTime === false && (
                    <span className="text-xs text-red-600 dark:text-red-400 font-medium">
                      ✗ Late
                    </span>
                  )}
                </div>
              </div>
            </DialogTitle>
          </DialogHeader>

          {/* Description */}
          {ticket.description && (
            <div className="rounded-lg bg-muted/50 p-3">
              <p className="text-sm whitespace-pre-wrap">{ticket.description}</p>
            </div>
          )}

          {/* Two-column layout: Info + Timeline */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Info Grid */}
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-muted-foreground">Developer:</span>
                <p className="font-medium">{developer?.name || "Unknown"}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Complexity:</span>
                <div className="mt-1">
                  <StatusBadge
                    status={ticket.complexity}
                    variant={
                      ticket.complexity === "critical"
                        ? "error"
                        : ticket.complexity === "high"
                        ? "warning"
                        : ticket.complexity === "medium"
                        ? "info"
                        : "default"
                    }
                  />
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-muted/30 rounded-lg p-4">
              <h3 className="text-sm font-medium mb-3">Timeline</h3>
              <TicketTimeline ticket={ticket} />
            </div>
          </div>

          {/* Bug Stats */}
          {totalBugs > 0 && (
            <div className="border-t pt-4">
              <h3 className="text-sm font-medium mb-3">Linked Bugs ({totalBugs})</h3>
              <div className="grid grid-cols-3 gap-2">
                <StatCard
                  icon="🐛"
                  label="Total"
                  value={totalBugs}
                  className="p-3"
                />
                <StatCard
                  icon="⚠️"
                  label="Unresolved"
                  value={unresolvedBugs}
                  className="p-3"
                />
                <StatCard
                  icon="❌"
                  label="Dev Errors"
                  value={developerErrorBugs}
                  className="p-3"
                />
              </div>
            </div>
          )}

          {/* Status Workflow */}
          <div className="border-t pt-4">
            <h3 className="text-sm font-medium mb-3">Change Status</h3>
            <div className="flex flex-wrap gap-2">
              {availableTransitions.map((status) => (
                <Button
                  key={status}
                  variant="outline"
                  size="sm"
                  onClick={() => handleStatusChange(status)}
                  disabled={isChangingStatus}
                >
                  → {status.replace("_", " ")}
                </Button>
              ))}
              
              {ticket.status === "review" && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => setShowCompleteDialog(true)}
                  disabled={isChangingStatus}
                  className="bg-green-600 hover:bg-green-700"
                >
                  ✓ Mark Complete
                </Button>
              )}
              
              {ticket.status === "completed" && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setShowReopenDialog(true)}
                  disabled={isChangingStatus}
                >
                  ↩ Reopen
                </Button>
              )}
            </div>
          </div>

          {/* Edit Fields Section */}
          {(onUpdateCompletionDate || onUpdateDueDate || onUpdateReopenCount) && (
            <div className="border-t pt-4">
              <h3 className="text-sm font-medium mb-3">Edit Fields</h3>
              <div className="flex flex-wrap gap-2">
                {ticket.status === "completed" && ticket.completedDate && onUpdateCompletionDate && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      // Convert database format to ISO for picker
                      const dbDate = ticket.completedDate!;
                      const isoDate = dbDate.includes("T") ? dbDate : dbDate.replace(" ", "T");
                      setEditCompletionDate(isoDate);
                      setShowEditCompletionDate(true);
                    }}
                  >
                    📅 Edit Completion Date
                  </Button>
                )}
                {onUpdateDueDate && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      // Convert database format to ISO for picker
                      const dbDate = ticket.dueDate;
                      const isoDate = dbDate.includes("T") ? dbDate : dbDate.replace(" ", "T");
                      setEditDueDate(isoDate);
                      setShowEditDueDate(true);
                    }}
                  >
                    📅 Edit Due Date
                  </Button>
                )}
                {onUpdateReopenCount && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditReopenCount(ticket.reopenCount.toString());
                      setShowEditReopenCount(true);
                    }}
                  >
                    🔄 Edit Reopen Count
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-2 border-t pt-4">
            <Button variant="outline" size="sm" onClick={onEdit}>
              ✏️ Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                onOpenChange(false);
                navigate(`/bugs?ticket=${ticket.id}`);
              }}
            >
              🐛 View Bugs
            </Button>
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

      {/* Complete Dialog */}
      <Dialog open={showCompleteDialog} onOpenChange={setShowCompleteDialog}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Mark Ticket Complete</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              This will mark the ticket as completed and calculate if it was delivered on time.
            </p>
            {ticket.actualHours && ticket.actualHours > 0 && (
              <div className="rounded-lg bg-muted/50 p-3 text-sm">
                <p className="text-muted-foreground">
                  Previously logged: <span className="font-medium text-foreground">{ticket.actualHours}h</span>
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  New hours will be added to this total.
                </p>
              </div>
            )}
            <TextField
              label={ticket.actualHours ? "Additional Hours" : "Actual Hours (optional)"}
              type="number"
              value={actualHours}
              onChange={(e) => setActualHours(e.target.value)}
              placeholder="Enter hours"
              description={
                ticket.actualHours 
                  ? `Hours to add (new total: ${ticket.actualHours + (parseFloat(actualHours) || 0)}h)`
                  : "How many hours did this ticket take?"
              }
            />
            <DateTimeField
              label="Completion Date & Time"
              value={completionDate}
              onChange={(value) => setCompletionDate(value || "")}
              description="When was this ticket completed? (defaults to now if not specified)"
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowCompleteDialog(false)}
                disabled={isCompleting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleComplete}
                disabled={isCompleting}
                className="bg-green-600 hover:bg-green-700"
              >
                {isCompleting ? "Completing..." : "Complete Ticket"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reopen Confirmation */}
      <ConfirmDialog
        open={showReopenDialog}
        onOpenChange={setShowReopenDialog}
        title="Reopen Ticket"
        description={`Are you sure you want to reopen "${ticket.title}"? This will increment the reopen count (currently ${ticket.reopenCount}) and affect the developer's KPI score.`}
        confirmText="Reopen"
        variant="destructive"
        onConfirm={handleReopen}
        loading={isReopening}
      />

      {/* Edit Completion Date Dialog */}
      {onUpdateCompletionDate && (
        <Dialog open={showEditCompletionDate} onOpenChange={setShowEditCompletionDate}>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle>Edit Completion Date</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <DateTimeField
                label="Completion Date & Time"
                value={editCompletionDate}
                onChange={(value) => setEditCompletionDate(value || "")}
                description="Update when this ticket was completed"
              />
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowEditCompletionDate(false)}
                  disabled={isUpdating}
                >
                  Cancel
                </Button>
                <Button
                  onClick={async () => {
                    if (!editCompletionDate) return;
                    setIsUpdating(true);
                    try {
                      await onUpdateCompletionDate(editCompletionDate);
                      setShowEditCompletionDate(false);
                    } finally {
                      setIsUpdating(false);
                    }
                  }}
                  disabled={isUpdating || !editCompletionDate}
                >
                  {isUpdating ? "Updating..." : "Update"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Due Date Dialog */}
      {onUpdateDueDate && (
        <Dialog open={showEditDueDate} onOpenChange={setShowEditDueDate}>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle>Edit Due Date</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <DateTimeField
                label="Due Date & Time"
                value={editDueDate}
                onChange={(value) => setEditDueDate(value || "")}
                description="Update when this ticket is due"
              />
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowEditDueDate(false)}
                  disabled={isUpdating}
                >
                  Cancel
                </Button>
                <Button
                  onClick={async () => {
                    if (!editDueDate) return;
                    setIsUpdating(true);
                    try {
                      await onUpdateDueDate(editDueDate);
                      setShowEditDueDate(false);
                    } finally {
                      setIsUpdating(false);
                    }
                  }}
                  disabled={isUpdating || !editDueDate}
                >
                  {isUpdating ? "Updating..." : "Update"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Reopen Count Dialog */}
      {onUpdateReopenCount && (
        <Dialog open={showEditReopenCount} onOpenChange={setShowEditReopenCount}>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle>Edit Reopen Count</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <TextField
                label="Reopen Count"
                type="number"
                value={editReopenCount}
                onChange={(e) => setEditReopenCount(e.target.value)}
                placeholder="0"
                description="Number of times this ticket has been reopened"
              />
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowEditReopenCount(false)}
                  disabled={isUpdating}
                >
                  Cancel
                </Button>
                <Button
                  onClick={async () => {
                    const count = parseInt(editReopenCount, 10);
                    if (isNaN(count) || count < 0) return;
                    setIsUpdating(true);
                    try {
                      await onUpdateReopenCount(count);
                      setShowEditReopenCount(false);
                    } finally {
                      setIsUpdating(false);
                    }
                  }}
                  disabled={isUpdating || isNaN(parseInt(editReopenCount, 10)) || parseInt(editReopenCount, 10) < 0}
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

