import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useTickets } from "@/hooks/useTickets";
import { useDevelopers } from "@/hooks/useDevelopers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DataTable,
  Column,
  TicketStatusBadge,
  StatusBadge,
} from "@/components/ui";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TicketFormDialog, TicketCard } from "@/components/tickets";
import type { Ticket, CreateTicketInput, UpdateTicketInput, TicketStatus } from "@/types";
import { updateCompletionDate, updateDueDate, updateReopenCount } from "@/lib/tauri";

// Helper to check if a ticket is overdue
function isOverdue(ticket: Ticket): boolean {
  if (ticket.status === "completed") return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dueDate = new Date(ticket.dueDate);
  return dueDate < today;
}

// Helper to format date for display
function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

type SortField = "dueDate" | "assignedDate" | "status" | "complexity";
type SortOrder = "asc" | "desc";

export function Tickets() {
  const [searchParams] = useSearchParams();
  const developerIdFromUrl = searchParams.get("developer") || undefined;
  
  const { 
    tickets, 
    loading, 
    error, 
    createTicket, 
    updateTicket, 
    updateTicketStatus,
    completeTicket,
    reopenTicket,
    refresh 
  } = useTickets();
  const { developers } = useDevelopers();
  
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<TicketStatus | "all">("all");
  const [developerFilter, setDeveloperFilter] = useState<string>(developerIdFromUrl || "all");
  const [sortField, setSortField] = useState<SortField>("dueDate");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTicket, setEditingTicket] = useState<Ticket | undefined>();
  const [viewingTicket, setViewingTicket] = useState<Ticket | undefined>();

  // Get developer by ID
  const getDeveloper = (developerId: string) => {
    return developers.find((d) => d.id === developerId);
  };

  // Get developer name by ID
  const getDeveloperName = (developerId: string): string => {
    return getDeveloper(developerId)?.name || "Unknown";
  };

  // Filter and sort tickets
  const filteredTickets = useMemo(() => {
    let result = tickets.filter((ticket) => {
      // Search filter
      const searchLower = search.toLowerCase();
      const matchesSearch =
        !search ||
        ticket.title.toLowerCase().includes(searchLower) ||
        ticket.description?.toLowerCase().includes(searchLower);

      // Status filter
      const matchesStatus = statusFilter === "all" || ticket.status === statusFilter;

      // Developer filter
      const matchesDeveloper =
        developerFilter === "all" || ticket.developerId === developerFilter;

      return matchesSearch && matchesStatus && matchesDeveloper;
    });

    // Sort
    result.sort((a, b) => {
      let comparison = 0;
      
      switch (sortField) {
        case "dueDate":
          comparison = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
          break;
        case "assignedDate":
          comparison = new Date(a.assignedDate).getTime() - new Date(b.assignedDate).getTime();
          break;
        case "status": {
          const statusOrder: Record<TicketStatus, number> = {
            assigned: 1,
            in_progress: 2,
            review: 3,
            completed: 4,
            reopened: 0,
          };
          comparison = statusOrder[a.status] - statusOrder[b.status];
          break;
        }
        case "complexity": {
          const complexityOrder = { low: 1, medium: 2, high: 3, critical: 4 };
          comparison = complexityOrder[a.complexity] - complexityOrder[b.complexity];
          break;
        }
      }

      return sortOrder === "asc" ? comparison : -comparison;
    });

    return result;
  }, [tickets, search, statusFilter, developerFilter, sortField, sortOrder]);

  // Table columns configuration
  const columns: Column<Ticket>[] = [
    {
      key: "title",
      header: "Title",
      cell: (ticket) => (
        <div className="max-w-[300px]">
          <p className="font-medium truncate">{ticket.title}</p>
          {ticket.description && (
            <p className="text-sm text-muted-foreground truncate">
              {ticket.description}
            </p>
          )}
        </div>
      ),
    },
    {
      key: "developer",
      header: "Developer",
      cell: (ticket) => (
        <span className="text-sm">{getDeveloperName(ticket.developerId)}</span>
      ),
    },
    {
      key: "dueDate",
      header: "Due Date",
      cell: (ticket) => {
        const overdue = isOverdue(ticket);
        return (
          <span className={overdue ? "text-red-600 dark:text-red-400 font-medium" : "text-muted-foreground"}>
            {formatDate(ticket.dueDate)}
            {overdue && " ⚠️"}
          </span>
        );
      },
    },
    {
      key: "status",
      header: "Status",
      cell: (ticket) => <TicketStatusBadge status={ticket.status} />,
    },
    {
      key: "complexity",
      header: "Complexity",
      cell: (ticket) => (
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
      ),
    },
    {
      key: "reopenCount",
      header: "Reopens",
      className: "w-[80px]",
      cell: (ticket) =>
        ticket.reopenCount > 0 ? (
          <span className="text-red-600 dark:text-red-400 font-medium">
            {ticket.reopenCount}
          </span>
        ) : (
          <span className="text-muted-foreground">0</span>
        ),
    },
    {
      key: "actions",
      header: "",
      className: "w-[60px]",
      cell: (ticket) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            handleEdit(ticket);
          }}
        >
          ✏️
        </Button>
      ),
    },
  ];

  const handleRowClick = (ticket: Ticket) => {
    setViewingTicket(ticket);
  };

  const handleEdit = (ticket: Ticket) => {
    setViewingTicket(undefined);
    setEditingTicket(ticket);
    setIsFormOpen(true);
  };

  const handleCreateOrUpdate = async (data: CreateTicketInput | UpdateTicketInput) => {
    if (editingTicket) {
      await updateTicket({
        id: editingTicket.id,
        ...data,
      } as UpdateTicketInput);
    } else {
      await createTicket(data as CreateTicketInput);
    }
    setIsFormOpen(false);
    setEditingTicket(undefined);
  };

  const handleFormClose = (open: boolean) => {
    setIsFormOpen(open);
    if (!open) {
      setEditingTicket(undefined);
    }
  };

  const handleStatusChange = async (status: TicketStatus) => {
    if (!viewingTicket) return;
    await updateTicketStatus(viewingTicket.id, status);
    // Update the viewing ticket with new status
    setViewingTicket((prev) => prev ? { ...prev, status } : undefined);
  };

  const handleComplete = async (actualHours?: number, completionDate?: string) => {
    if (!viewingTicket) return;
    const updated = await completeTicket(viewingTicket.id, actualHours, completionDate);
    setViewingTicket(updated);
  };

  const handleReopen = async () => {
    if (!viewingTicket) return;
    const updated = await reopenTicket(viewingTicket.id);
    setViewingTicket(updated);
  };

  const handleUpdateCompletionDate = async (completionDate: string) => {
    if (!viewingTicket) return;
    const updated = await updateCompletionDate(viewingTicket.id, completionDate);
    setViewingTicket(updated);
    await refresh();
  };

  const handleUpdateDueDate = async (dueDate: string) => {
    if (!viewingTicket) return;
    const updated = await updateDueDate(viewingTicket.id, dueDate);
    setViewingTicket(updated);
    await refresh();
  };

  const handleUpdateReopenCount = async (reopenCount: number) => {
    if (!viewingTicket) return;
    const updated = await updateReopenCount(viewingTicket.id, reopenCount);
    setViewingTicket(updated);
    await refresh();
  };

  if (error) {
    const isCorrupted = error.toLowerCase().includes("corrupt") || 
                        error.toLowerCase().includes("malformed") ||
                        error.toLowerCase().includes("not a database");
    
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tickets</h1>
          <p className="text-muted-foreground">Track ticket assignments and progress</p>
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
          <h1 className="text-3xl font-bold tracking-tight">Tickets</h1>
          <p className="text-muted-foreground">
            Track ticket assignments and progress ({filteredTickets.length} of {tickets.length})
          </p>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>+ Create Ticket</Button>
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
          {/* Status Filter */}
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as TicketStatus | "all")}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="assigned">Assigned</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="review">Review</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="reopened">Reopened</SelectItem>
            </SelectContent>
          </Select>

          {/* Developer Filter */}
          <Select value={developerFilter} onValueChange={setDeveloperFilter}>
            <SelectTrigger className="w-[160px]">
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

          {/* Sort Options */}
          <Select value={`${sortField}-${sortOrder}`} onValueChange={(v) => {
            const [field, order] = v.split("-") as [SortField, SortOrder];
            setSortField(field);
            setSortOrder(order);
          }}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="dueDate-asc">Due Date ↑</SelectItem>
              <SelectItem value="dueDate-desc">Due Date ↓</SelectItem>
              <SelectItem value="assignedDate-asc">Assigned ↑</SelectItem>
              <SelectItem value="assignedDate-desc">Assigned ↓</SelectItem>
              <SelectItem value="status-asc">Status ↑</SelectItem>
              <SelectItem value="status-desc">Status ↓</SelectItem>
              <SelectItem value="complexity-asc">Complexity ↑</SelectItem>
              <SelectItem value="complexity-desc">Complexity ↓</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        data={filteredTickets}
        columns={columns}
        loading={loading}
        getRowKey={(ticket) => ticket.id}
        onRowClick={handleRowClick}
        pagination={{ itemsPerPage: 25, showPagination: true }}
        emptyState={{
          icon: "🎫",
          title: search || statusFilter !== "all" || developerFilter !== "all" 
            ? "No tickets found" 
            : "No tickets yet",
          description:
            search || statusFilter !== "all" || developerFilter !== "all"
              ? "Try adjusting your search or filter criteria"
              : "Create your first ticket to start tracking work",
          action:
            !search && statusFilter === "all" && developerFilter === "all" ? (
              <Button onClick={() => setIsFormOpen(true)}>+ Create Ticket</Button>
            ) : undefined,
        }}
      />

      {/* Ticket Detail Card */}
      {viewingTicket && (
        <TicketCard
          ticket={viewingTicket}
          developer={getDeveloper(viewingTicket.developerId)}
          open={!!viewingTicket}
          onOpenChange={(open) => !open && setViewingTicket(undefined)}
          onEdit={() => handleEdit(viewingTicket)}
          onStatusChange={handleStatusChange}
          onComplete={handleComplete}
          onReopen={handleReopen}
          onUpdateCompletionDate={handleUpdateCompletionDate}
          onUpdateDueDate={handleUpdateDueDate}
          onUpdateReopenCount={handleUpdateReopenCount}
        />
      )}

      {/* Create/Edit Ticket Dialog */}
      <TicketFormDialog
        open={isFormOpen}
        onOpenChange={handleFormClose}
        onSubmit={handleCreateOrUpdate}
        ticket={editingTicket}
        developers={developers.filter((d) => d.isActive)}
      />
    </div>
  );
}
