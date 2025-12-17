import { useState, useEffect, useCallback } from "react";
import type { Ticket, CreateTicketInput, UpdateTicketInput, TicketStatus } from "@/types";
import {
  getAllTickets,
  getTicketsByDeveloper,
  createTicket as createTicketApi,
  updateTicket as updateTicketApi,
  updateTicketStatus as updateTicketStatusApi,
  completeTicket as completeTicketApi,
  reopenTicket as reopenTicketApi,
} from "@/lib/tauri";
import { useToast } from "@/hooks/use-toast";

interface UseTicketsOptions {
  developerId?: string;
}

interface UseTicketsReturn {
  tickets: Ticket[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  createTicket: (input: CreateTicketInput) => Promise<Ticket>;
  updateTicket: (input: UpdateTicketInput) => Promise<Ticket>;
  updateTicketStatus: (id: string, status: TicketStatus) => Promise<Ticket>;
  completeTicket: (id: string, actualHours?: number, completionDate?: string) => Promise<Ticket>;
  reopenTicket: (id: string) => Promise<Ticket>;
}

export function useTickets(options: UseTicketsOptions = {}): UseTicketsReturn {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const { developerId } = options;

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = developerId
        ? await getTicketsByDeveloper(developerId)
        : await getAllTickets();
      setTickets(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, [developerId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const createTicket = useCallback(
    async (input: CreateTicketInput): Promise<Ticket> => {
      try {
        const ticket = await createTicketApi(input);
        await refresh();
        toast({
          title: "Ticket created",
          description: `Ticket "${input.title}" has been created successfully.`,
          variant: "success",
        });
        return ticket;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Failed to create ticket";
        toast({
          title: "Error",
          description: errorMsg,
          variant: "destructive",
        });
        throw err;
      }
    },
    [refresh, toast]
  );

  const updateTicket = useCallback(
    async (input: UpdateTicketInput): Promise<Ticket> => {
      try {
        const ticket = await updateTicketApi(input);
        await refresh();
        toast({
          title: "Ticket updated",
          description: "Ticket has been updated successfully.",
          variant: "success",
        });
        return ticket;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Failed to update ticket";
        toast({
          title: "Error",
          description: errorMsg,
          variant: "destructive",
        });
        throw err;
      }
    },
    [refresh, toast]
  );

  const updateTicketStatus = useCallback(
    async (id: string, status: TicketStatus): Promise<Ticket> => {
      try {
        const ticket = await updateTicketStatusApi(id, status);
        await refresh();
        toast({
          title: "Status updated",
          description: `Ticket status changed to ${status.replace("_", " ")}.`,
          variant: "success",
        });
        return ticket;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Failed to update ticket status";
        toast({
          title: "Error",
          description: errorMsg,
          variant: "destructive",
        });
        throw err;
      }
    },
    [refresh, toast]
  );

  const completeTicket = useCallback(
    async (id: string, actualHours?: number, completionDate?: string): Promise<Ticket> => {
      try {
        const ticket = await completeTicketApi(id, actualHours, completionDate);
        await refresh();
        toast({
          title: "Ticket completed",
          description: "Ticket has been marked as completed.",
          variant: "success",
        });
        return ticket;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Failed to complete ticket";
        toast({
          title: "Error",
          description: errorMsg,
          variant: "destructive",
        });
        throw err;
      }
    },
    [refresh, toast]
  );

  const reopenTicket = useCallback(
    async (id: string): Promise<Ticket> => {
      try {
        const ticket = await reopenTicketApi(id);
        await refresh();
        toast({
          title: "Ticket reopened",
          description: "Ticket has been reopened.",
          variant: "success",
        });
        return ticket;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Failed to reopen ticket";
        toast({
          title: "Error",
          description: errorMsg,
          variant: "destructive",
        });
        throw err;
      }
    },
    [refresh, toast]
  );

  return {
    tickets,
    loading,
    error,
    refresh,
    createTicket,
    updateTicket,
    updateTicketStatus,
    completeTicket,
    reopenTicket,
  };
}
