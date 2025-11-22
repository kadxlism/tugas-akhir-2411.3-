// src/api/invoice.ts
import axios from "@/services/axios";
import { InvoiceCreatePayload } from "@/types/invoice" 

export const createInvoice = async (data: InvoiceCreatePayload) => {
  return axios.post("/api/invoices", data);
};
