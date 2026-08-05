import db from "../../database.js";
import { addToSyncQueue } from "./SyncQueueRepository.js";

export function createCustomer(customer) {

  db.prepare(`
    INSERT INTO customers (
      id,
      company_id,
      name,
      phone,
      address,
      balance,
      created_at,
      updated_at
    )
    VALUES (?,?,?,?,?,?,?,?)
  `).run(
      customer.id,
      customer.companyId,
      customer.name,
      customer.phone,
      customer.address,
      customer.balance || 0,
      new Date().toISOString(),
      new Date().toISOString()
  );

  addToSyncQueue({
    tableName: "customers",
    recordId: customer.id,
    operation: "INSERT",
    payload: customer
  });

}