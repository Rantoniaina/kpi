import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useBugs } from "@/hooks/useBugs";
import { useTickets } from "@/hooks/useTickets";
import { useDevelopers } from "@/hooks/useDevelopers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DataTable,
  Column,
  StatusBadge,
} from "@/components/ui";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BugFormDialog, BugCard } from "@/components/bugs";
import type { Bug, BugSeverity, BugType, CreateBugInput, UpdateBugInput } from "@/types";
import { updateResolutionDate } from "@/lib/tauri";

// Helper to format date for display
function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// Bug type labels with descriptions
const bugTypeLabels: Record<BugType, { label: string; description: string }> = {
  developer_error: { label: "Developer Error", description: "Coding mistake or oversight" },
  conceptual: { label: "Conceptual", description: "Requirement misunderstanding" },
  requirement_change: { label: "Req. Change", description: "Specification changed" },
  environment: { label: "Environment", description: "Infrastructure issue" },
  third_party: { label: "Third Party", description: "External dependency" },
};

// Severity colors
const severityVariant: Record<BugSeverity, "error" | "warning" | "info" | "default"> = {
  critical: "error",
  high: "warning",
  medium: "info",
  low: "default",
};

// Bug type colors
const bugTypeVariant: Record<BugType, "error" | "warning" | "info" | "default" | "success"> = {
  developer_error: "error",
  conceptual: "warning",
  requirement_change: "info",
  environment: "default",
  third_party: "default",
};

export function Bugs() {
  const [searchParams] = useSearchParams();
  const ticketIdFromUrl = searchParams.get("ticket") || undefined;
  const developerIdFromUrl = searchParams.get("developer") || undefined;

  // Fetch bugs based on URL params
  const { bugs, loading, error, refresh, createBug, updateBug, resolveBug } = useBugs({
    ticketId: ticketIdFromUrl,
    developerId: developerIdFromUrl,
  });
  const { tickets } = useTickets();
  const { developers } = useDevelopers();

  const [search, setSearch] = useState("");
  const [severityFilter, setSeverityFilter] = useState<BugSeverity | "all">("all");
  const [typeFilter, setTypeFilter] = useState<BugType | "all">("all");
  const [resolvedFilter, setResolvedFilter] = useState<"all" | "resolved" | "unresolved">("all");
  const [ticketFilter, setTicketFilter] = useState<string>(ticketIdFromUrl || "all");
  const [developerFilter, setDeveloperFilter] = useState<string>(developerIdFromUrl || "all");
  
  // Form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBug, setEditingBug] = useState<Bug | undefined>();
  
  // Card state (for viewing bug details)
  const [selectedBug, setSelectedBug] = useState<Bug | undefined>();
  const [isCardOpen, setIsCardOpen] = useState(false);

  // Get ticket by ID
  const getTicket = (ticketId: string) => tickets.find((t) => t.id === ticketId);
  
  // Get developer by ID
  const getDeveloper = (developerId: string) => developers.find((d) => d.id === developerId);

  // Get ticket title by ID
  const getTicketTitle = (ticketId: string): string => {
    const ticket = tickets.find((t) => t.id === ticketId);
    return ticket?.title || "Unknown Ticket";
  };

  // Get developer name by ID
  const getDeveloperName = (developerId: string): string => {
    const dev = developers.find((d) => d.id === developerId);
    return dev?.name || "Unknown";
  };

  // Filter bugs
  const filteredBugs = useMemo(() => {
    return bugs.filter((bug) => {
      // Search filter
      const searchLower = search.toLowerCase();
      const matchesSearch =
        !search ||
        bug.title.toLowerCase().includes(searchLower) ||
        bug.description?.toLowerCase().includes(searchLower);

      // Severity filter
      const matchesSeverity = severityFilter === "all" || bug.severity === severityFilter;

      // Type filter
      const matchesType = typeFilter === "all" || bug.bugType === typeFilter;

      // Resolved filter
      const matchesResolved =
        resolvedFilter === "all" ||
        (resolvedFilter === "resolved" && bug.isResolved) ||
        (resolvedFilter === "unresolved" && !bug.isResolved);

      // Ticket filter (only if not already filtered by URL)
      const matchesTicket =
        ticketIdFromUrl || ticketFilter === "all" || bug.ticketId === ticketFilter;

      // Developer filter (only if not already filtered by URL)
      const matchesDeveloper =
        developerIdFromUrl || developerFilter === "all" || bug.developerId === developerFilter;

      return matchesSearch && matchesSeverity && matchesType && matchesResolved && matchesTicket && matchesDeveloper;
    });
  }, [bugs, search, severityFilter, typeFilter, resolvedFilter, ticketFilter, developerFilter, ticketIdFromUrl, developerIdFromUrl]);

  // Table columns configuration
  const columns: Column<Bug>[] = [
    {
      key: "title",
      header: "Bug",
      cell: (bug) => (
        <div className="max-w-[250px]">
          <p className="font-medium truncate">{bug.title}</p>
          {bug.description && (
            <p className="text-sm text-muted-foreground truncate">
              {bug.description}
            </p>
          )}
        </div>
      ),
    },
    {
      key: "ticket",
      header: "Ticket",
      cell: (bug) => (
        <span className="text-sm truncate max-w-[150px] block">
          {getTicketTitle(bug.ticketId)}
        </span>
      ),
    },
    {
      key: "developer",
      header: "Developer",
      cell: (bug) => (
        <span className="text-sm">{getDeveloperName(bug.developerId)}</span>
      ),
    },
    {
      key: "severity",
      header: "Severity",
      className: "w-[100px]",
      cell: (bug) => (
        <StatusBadge status={bug.severity} variant={severityVariant[bug.severity]} />
      ),
    },
    {
      key: "type",
      header: "Type",
      className: "w-[130px]",
      cell: (bug) => (
        <StatusBadge
          status={bugTypeLabels[bug.bugType].label}
          variant={bugTypeVariant[bug.bugType]}
        />
      ),
    },
    {
      key: "status",
      header: "Status",
      className: "w-[100px]",
      cell: (bug) =>
        bug.isResolved ? (
          <span className="inline-flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
            ✓ Resolved
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
            ⚠ Open
          </span>
        ),
    },
    {
      key: "date",
      header: "Reported",
      className: "w-[100px]",
      cell: (bug) => (
        <span className="text-sm text-muted-foreground">
          {formatDate(bug.createdAt)}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      className: "w-[60px]",
      cell: (bug) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            handleEdit(bug);
          }}
        >
          ✏️
        </Button>
      ),
    },
  ];

  // Stats
  const totalBugs = bugs.length;
  const unresolvedBugs = bugs.filter((b) => !b.isResolved).length;
  const developerErrorBugs = bugs.filter((b) => b.bugType === "developer_error").length;

  const handleEdit = (bug: Bug) => {
    setEditingBug(bug);
    setIsFormOpen(true);
  };

  const handleCreateOrUpdate = async (data: CreateBugInput | UpdateBugInput) => {
    if (editingBug) {
      await updateBug({
        id: editingBug.id,
        ...data,
      } as UpdateBugInput);
    } else {
      await createBug(data as CreateBugInput);
    }
    setIsFormOpen(false);
    setEditingBug(undefined);
  };

  const handleFormClose = (open: boolean) => {
    setIsFormOpen(open);
    if (!open) {
      setEditingBug(undefined);
    }
  };

  const handleRowClick = (bug: Bug) => {
    setSelectedBug(bug);
    setIsCardOpen(true);
  };

  const handleCardClose = (open: boolean) => {
    setIsCardOpen(open);
    if (!open) {
      setSelectedBug(undefined);
    }
  };

  const handleResolve = async (resolvedByDeveloperId?: string, fixTicketId?: string, fixHours?: number, resolvedDate?: string) => {
    if (!selectedBug) return;
    await resolveBug(selectedBug.id, resolvedByDeveloperId, fixTicketId, fixHours, resolvedDate);
    setIsCardOpen(false);
    setSelectedBug(undefined);
  };

  const handleReclassify = async (bugType: BugType) => {
    if (!selectedBug) return;
    await updateBug({
      id: selectedBug.id,
      bugType,
    });
    // Update the selected bug in state to reflect the change
    setSelectedBug((prev) => prev ? { ...prev, bugType } : undefined);
  };

  const handleEditFromCard = () => {
    if (!selectedBug) return;
    setIsCardOpen(false);
    setEditingBug(selectedBug);
    setIsFormOpen(true);
  };

  const handleUpdateResolutionDate = async (resolvedDate: string) => {
    if (!selectedBug) return;
    const updated = await updateResolutionDate(selectedBug.id, resolvedDate);
    setSelectedBug(updated);
    await refresh();
  };

  if (error) {
    const isCorrupted = error.toLowerCase().includes("corrupt") || 
                        error.toLowerCase().includes("malformed") ||
                        error.toLowerCase().includes("not a database");
    
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bugs</h1>
          <p className="text-muted-foreground">Track and classify bugs by type</p>
        </div>
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-medium text-red-800 mb-2">
            {isCorrupted ? "Database Corruption Detected" : "Error"}
          </p>
          <p className="text-sm text-red-600 mb-3">{error}</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={refresh}>
              Try Again
            </Button>
            {isCorrupted && (
              <Button 
                variant="default" 
                size="sm" 
                onClick={() => window.location.href = "/settings"}
              >
                Go to Settings to Restore
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bugs</h1>
          <p className="text-muted-foreground">
            Track and classify bugs by type ({filteredBugs.length} of {totalBugs})
            {ticketIdFromUrl && (
              <span className="ml-2 text-xs bg-muted px-2 py-0.5 rounded">
                Filtered by ticket
              </span>
            )}
            {developerIdFromUrl && (
              <span className="ml-2 text-xs bg-muted px-2 py-0.5 rounded">
                Filtered by developer
              </span>
            )}
          </p>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>+ Report Bug</Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🐛</span>
            <div>
              <p className="text-2xl font-bold">{totalBugs}</p>
              <p className="text-xs text-muted-foreground">Total Bugs</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">⚠️</span>
            <div>
              <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{unresolvedBugs}</p>
              <p className="text-xs text-muted-foreground">Unresolved</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">❌</span>
            <div>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">{developerErrorBugs}</p>
              <p className="text-xs text-muted-foreground">Developer Errors</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
        <div className="flex-1">
          <Input
            placeholder="Search by title or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-sm"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {/* Severity Filter */}
          <Select value={severityFilter} onValueChange={(v) => setSeverityFilter(v as BugSeverity | "all")}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Severity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Severity</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>

          {/* Type Filter */}
          <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as BugType | "all")}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="developer_error">Developer Error</SelectItem>
              <SelectItem value="conceptual">Conceptual</SelectItem>
              <SelectItem value="requirement_change">Req. Change</SelectItem>
              <SelectItem value="environment">Environment</SelectItem>
              <SelectItem value="third_party">Third Party</SelectItem>
            </SelectContent>
          </Select>

          {/* Resolved Filter */}
          <Select value={resolvedFilter} onValueChange={(v) => setResolvedFilter(v as "all" | "resolved" | "unresolved")}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="unresolved">Open</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
            </SelectContent>
          </Select>

          {/* Ticket Filter (only show if not filtered by URL) */}
          {!ticketIdFromUrl && (
            <Select value={ticketFilter} onValueChange={setTicketFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Ticket" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tickets</SelectItem>
                {tickets.map((ticket) => (
                  <SelectItem key={ticket.id} value={ticket.id}>
                    {ticket.title.length > 20 ? ticket.title.slice(0, 20) + "..." : ticket.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {/* Developer Filter (only show if not filtered by URL) */}
          {!developerIdFromUrl && (
            <Select value={developerFilter} onValueChange={setDeveloperFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Developer" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Developers</SelectItem>
                {developers
                  .filter((d) => d.isActive)
                  .map((dev) => (
                    <SelectItem key={dev.id} value={dev.id}>
                      {dev.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        data={filteredBugs}
        columns={columns}
        loading={loading}
        getRowKey={(bug) => bug.id}
        onRowClick={handleRowClick}
        pagination={{ itemsPerPage: 25, showPagination: true }}
        emptyState={{
          icon: "🐛",
          title: search || severityFilter !== "all" || typeFilter !== "all" || resolvedFilter !== "all"
            ? "No bugs found"
            : "No bugs reported",
          description:
            search || severityFilter !== "all" || typeFilter !== "all" || resolvedFilter !== "all"
              ? "Try adjusting your search or filter criteria"
              : "Great news! No bugs have been reported yet.",
          action: (
            <Button onClick={() => setIsFormOpen(true)}>+ Report Bug</Button>
          ),
        }}
      />

      {/* Bug Form Dialog */}
      <BugFormDialog
        open={isFormOpen}
        onOpenChange={handleFormClose}
        onSubmit={handleCreateOrUpdate}
        bug={editingBug}
        tickets={tickets}
        preselectedTicketId={ticketIdFromUrl}
      />

      {/* Bug Card (Detail View) */}
      {selectedBug && (
        <BugCard
          bug={selectedBug}
          ticket={getTicket(selectedBug.ticketId)}
          developer={getDeveloper(selectedBug.developerId)}
          resolvedByDeveloper={
            selectedBug.resolvedByDeveloperId 
              ? getDeveloper(selectedBug.resolvedByDeveloperId) 
              : undefined
          }
          allDevelopers={developers}
          allTickets={tickets}
          open={isCardOpen}
          onOpenChange={handleCardClose}
          onEdit={handleEditFromCard}
          onResolve={handleResolve}
          onReclassify={handleReclassify}
          onUpdateResolutionDate={handleUpdateResolutionDate}
        />
      )}
    </div>
  );
}
