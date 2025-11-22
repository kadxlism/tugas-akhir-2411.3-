export interface ProjectCreatePayload {
  name: string;
  client_id: number;
  start_date?: string;
  end_date?: string;
  description?: string;
}
