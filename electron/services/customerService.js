import sqlite from "../database.js";
import { randomUUID } from "crypto";

const DEVICE_ID = "desktop-main";

export function createCustomer(customerData) {

    const id = randomUUID();

    const customer = {
        id,
        company_id: customerData.company_id,
        name: customerData.name,
        phone: customerData.phone || "",
        address: customerData.address || "",
        balance: customerData.balance || 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    };

    sqlite.prepare(`
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
        VALUES (
            @id,
            @company_id,
            @name,
            @phone,
            @address,
            @balance,
            @created_at,
            @updated_at
        )
    `).run(customer);

    sqlite.prepare(`
        INSERT INTO sync_queue (
            id,
            device_id,
            table_name,
            record_id,
            operation,
            payload,
            sync_status,
            created_at
        )
        VALUES (
            ?, ?, ?, ?, ?, ?, ?, ?
        )
    `).run(
        randomUUID(),
        DEVICE_ID,
        "customers",
        customer.id,
        "create",
        JSON.stringify(customer),
        "pending",
        new Date().toISOString()
    );

    return customer;
}
export function getCustomers() {

    return sqlite.prepare(`
        SELECT *
        FROM customers
        ORDER BY created_at DESC
    `).all();

}
export function updateCustomer(id, updates) {

    const current = sqlite.prepare(`
        SELECT *
        FROM customers
        WHERE id = ?
    `).get(id);

    if (!current) {
        throw new Error("Customer not found");
    }

    const updated = {
        ...current,
        ...updates,
        updated_at: new Date().toISOString()
    };

    sqlite.prepare(`
        UPDATE customers
        SET
            name = ?,
            phone = ?,
            address = ?,
            balance = ?,
            updated_at = ?
        WHERE id = ?
    `).run(
        updated.name,
        updated.phone,
        updated.address,
        updated.balance,
        updated.updated_at,
        id
    );

    sqlite.prepare(`
        INSERT INTO sync_queue (
            id,
            device_id,
            table_name,
            record_id,
            operation,
            payload,
            sync_status,
            created_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
        randomUUID(),
        DEVICE_ID,
        "customers",
        id,
        "update",
        JSON.stringify(updated),
        "pending",
        new Date().toISOString()
    );

    return updated;
}
