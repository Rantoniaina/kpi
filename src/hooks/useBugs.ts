import { useState, useEffect, useCallback } from "react";
import type { Bug, CreateBugInput, UpdateBugInput } from "@/types";
import {
  getAllBugs,
  getBugsByTicket,
  getBugsByDeveloper,
  createBug as createBugApi,
  updateBug as updateBugApi,
  resolveBug as resolveBugApi,
} from "@/lib/tauri";
import { useToast } from "@/hooks/use-toast";

interface UseBugsOptions {
  ticketId?: string;
  developerId?: string;
}

interface UseBugsReturn {
  bugs: Bug[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  createBug: (input: CreateBugInput) => Promise<Bug>;
  updateBug: (input: UpdateBugInput) => Promise<Bug>;
  resolveBug: (id: string, resolvedByDeveloperId?: string, fixTicketId?: string, fixHours?: number, resolvedDate?: string) => Promise<Bug>;
}

export function useBugs(options: UseBugsOptions = {}): UseBugsReturn {
  const [bugs, setBugs] = useState<Bug[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const { ticketId, developerId } = options;

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let data: Bug[];
      if (ticketId) {
        data = await getBugsByTicket(ticketId);
      } else if (developerId) {
        data = await getBugsByDeveloper(developerId);
      } else {
        // No filter provided - get all bugs
        data = await getAllBugs();
      }
      setBugs(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, [ticketId, developerId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const createBug = useCallback(
    async (input: CreateBugInput): Promise<Bug> => {
      try {
        const bug = await createBugApi(input);
        await refresh();
        toast({
          title: "Bug reported",
          description: `Bug "${input.title}" has been reported successfully.`,
          variant: "success",
        });
        return bug;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Failed to report bug";
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

  const updateBug = useCallback(
    async (input: UpdateBugInput): Promise<Bug> => {
      try {
        const bug = await updateBugApi(input);
        await refresh();
        toast({
          title: "Bug updated",
          description: "Bug information has been updated successfully.",
          variant: "success",
        });
        return bug;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Failed to update bug";
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

  const resolveBug = useCallback(
    async (id: string, resolvedByDeveloperId?: string, fixTicketId?: string, fixHours?: number, resolvedDate?: string): Promise<Bug> => {
      try {
        const bug = await resolveBugApi(id, resolvedByDeveloperId, fixTicketId, fixHours, resolvedDate);
        await refresh();
        toast({
          title: "Bug resolved",
          description: "Bug has been marked as resolved.",
          variant: "success",
        });
        return bug;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Failed to resolve bug";
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
    bugs,
    loading,
    error,
    refresh,
    createBug,
    updateBug,
    resolveBug,
  };
}
