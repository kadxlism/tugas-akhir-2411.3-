export interface InvoiceCreatePayload {
  project_id: number;
  issued_by?: number;
  issue_date?: string;
  due_date?: string;
  total_amount?: number;
  tax?: number;
  discount?: number;
  status?: "draft" | "sent" | "paid" | "overdue";
}
