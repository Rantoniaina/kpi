import { invoke } from "@tauri-apps/api/core";
import type {
  Developer,
  CreateDeveloperInput,
  UpdateDeveloperInput,
  Ticket,
  CreateTicketInput,
  UpdateTicketInput,
  Bug,
  CreateBugInput,
  UpdateBugInput,
  MonthlyKPI,
  KPIConfig,
} from "@/types";

// Developer commands
export async function isFirstTimeSetup(): Promise<boolean> {
  return invoke("is_first_time_setup");
}

export async function createDeveloper(
  data: CreateDeveloperInput
): Promise<Developer> {
  return invoke("create_developer", { input: data });
}

export async function getAllDevelopers(): Promise<Developer[]> {
  return invoke("get_all_developers");
}

export async function getDeveloperById(id: string): Promise<Developer> {
  return invoke("get_developer_by_id", { id });
}

export async function updateDeveloper(
  data: UpdateDeveloperInput
): Promise<Developer> {
  return invoke("update_developer", { input: data });
}

export async function deleteDeveloper(id: string): Promise<void> {
  return invoke("delete_developer", { id });
}

// Ticket commands
export async function createTicket(data: CreateTicketInput): Promise<Ticket> {
  return invoke("create_ticket", { input: data });
}

export async function getAllTickets(): Promise<Ticket[]> {
  return invoke("get_all_tickets");
}

export async function getTicketsByDeveloper(
  developerId: string
): Promise<Ticket[]> {
  return invoke("get_tickets_by_developer", { developerId });
}

export async function updateTicket(data: UpdateTicketInput): Promise<Ticket> {
  return invoke("update_ticket", { input: data });
}

export async function updateTicketStatus(
  id: string,
  status: string
): Promise<Ticket> {
  return invoke("update_ticket_status", { id, status });
}

export async function completeTicket(
  id: string,
  actualHours?: number,
  completionDate?: string
): Promise<Ticket> {
  return invoke("complete_ticket", { 
    id, 
    actualHours: actualHours ?? null,
    completionDate: completionDate ?? null
  });
}

export async function reopenTicket(id: string): Promise<Ticket> {
  return invoke("reopen_ticket", { id });
}

export async function updateCompletionDate(
  id: string,
  completionDate: string
): Promise<Ticket> {
  return invoke("update_completion_date", { id, completionDate });
}

export async function updateDueDate(
  id: string,
  dueDate: string
): Promise<Ticket> {
  return invoke("update_due_date", { id, dueDate });
}

export async function updateReopenCount(
  id: string,
  reopenCount: number
): Promise<Ticket> {
  return invoke("update_reopen_count", { id, reopenCount });
}

// Bug commands
export async function createBug(data: CreateBugInput): Promise<Bug> {
  return invoke("create_bug", { input: data });
}

export async function getAllBugs(): Promise<Bug[]> {
  return invoke("get_all_bugs");
}

export async function getBugsByTicket(ticketId: string): Promise<Bug[]> {
  return invoke("get_bugs_by_ticket", { ticketId });
}

export async function getBugsByDeveloper(developerId: string): Promise<Bug[]> {
  return invoke("get_bugs_by_developer", { developerId });
}

export async function updateBug(data: UpdateBugInput): Promise<Bug> {
  return invoke("update_bug", { input: data });
}

export async function resolveBug(
  id: string,
  resolvedByDeveloperId?: string,
  fixTicketId?: string,
  fixHours?: number,
  resolvedDate?: string
): Promise<Bug> {
  // Ensure we pass null instead of undefined for Tauri/serde compatibility
  return invoke("resolve_bug", { 
    id, 
    resolvedByDeveloperId: resolvedByDeveloperId || null,
    fixTicketId: fixTicketId || null,
    fixHours: fixHours ?? null,
    resolvedDate: resolvedDate ?? null
  });
}

export async function updateResolutionDate(
  id: string,
  resolvedDate: string
): Promise<Bug> {
  return invoke("update_resolution_date", { id, resolvedDate });
}

// Utility commands
export async function openUrl(url: string): Promise<void> {
  return invoke("open_url", { url });
}

// Updater commands
export async function getAppVersion(): Promise<string> {
  return invoke("get_app_version");
}

export async function checkForUpdates(currentVersion: string): Promise<UpdateInfo | null> {
  return invoke("check_for_updates", { currentVersion });
}

export async function updateAppVersion(version: string): Promise<void> {
  return invoke("update_app_version", { version });
}

export async function backupBeforeUpdate(): Promise<string> {
  return invoke("backup_before_update");
}

export interface UpdateInfo {
  version: string;
  url: string;
  releaseNotes?: string;
  publishedAt?: string;
}

// KPI commands
export async function generateMonthlyKPI(
  developerId: string,
  month: number,
  year: number
): Promise<MonthlyKPI> {
  return invoke("generate_monthly_kpi", { developerId, month, year });
}

export async function getKPIHistory(developerId: string): Promise<MonthlyKPI[]> {
  return invoke("get_kpi_history", { developerId });
}

export async function getCurrentMonthKPI(
  developerId: string
): Promise<MonthlyKPI> {
  return invoke("get_current_month_kpi", { developerId });
}

export async function exportMonthlyKPIAsCSV(
  developerId: string | null,
  month: number,
  year: number
): Promise<string> {
  return invoke("export_monthly_kpi_csv", {
    developerId: developerId || null,
    month,
    year,
  });
}

// Config commands
export async function getKPIConfig(): Promise<KPIConfig> {
  return invoke("get_kpi_config");
}

export async function saveKPIConfig(
  deliveryWeight: number,
  qualityWeight: number,
  bugPenaltyCritical: number,
  bugPenaltyHigh: number,
  bugPenaltyMedium: number,
  bugPenaltyLow: number
): Promise<void> {
  return invoke("save_kpi_config_command", {
    deliveryWeight,
    qualityWeight,
    bugPenaltyCritical,
    bugPenaltyHigh,
    bugPenaltyMedium,
    bugPenaltyLow,
  });
}

// Data management commands
export async function exportAllData(): Promise<string> {
  return invoke("export_all_data");
}

export async function importData(jsonData: string): Promise<void> {
  return invoke("import_data", { jsonData });
}

export async function clearAllData(): Promise<void> {
  return invoke("clear_all_data");
}

export async function backupDatabase(): Promise<string> {
  return invoke("backup_database");
}

export async function restoreDatabase(backupPath: string): Promise<void> {
  return invoke("restore_database", { backupPath });
}

export async function restartApp(): Promise<void> {
  return invoke("restart_app");
}
