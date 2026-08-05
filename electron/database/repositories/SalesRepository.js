import db from "../../database.js";
import { addToSyncQueue } from "./SyncQueueRepository.js";

export function createSale(sale) {

  db.prepare(`
    INSERT INTO sales (
      id,
      company_id,
      customer_id,
      invoice_number,
      total_amount,
      paid_amount,
      remaining_amount,
      status,
      created_at,
      updated_at
    )
    VALUES (?,?,?,?,?,?,?,?,?,?)
  `).run(
      sale.id,
      sale.companyId,
      sale.customerId,
      sale.invoiceNumber,
      sale.totalAmount,
      sale.paidAmount,
      sale.remainingAmount,
      sale.status,
      new Date().toISOString(),
      new Date().toISOString()
  );

  addToSyncQueue({
    tableName: "sales",
    recordId: sale.id,
    operation: "INSERT",
    payload: sale
  });

}