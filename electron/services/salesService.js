import sqlite from "../database.js";
import { randomUUID } from "crypto";


/*
    إنشاء فاتورة بيع جديدة
*/
export function createSale(saleData) {

    const sale = {

        id: randomUUID(),

        company_id: saleData.company_id,

        customer_id: saleData.customer_id,

        invoice_number:
            saleData.invoice_number ||
            "INV-" + Date.now(),

        total_amount:
            Number(saleData.total_amount || 0),

        paid_amount:
            Number(saleData.paid_amount || 0),

        remaining_amount:
            Number(saleData.total_amount || 0) -
            Number(saleData.paid_amount || 0),

        status:
            saleData.status || "pending",

        created_at:
            new Date().toISOString(),

        updated_at:
            new Date().toISOString()

    };


    sqlite.prepare(`
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
        VALUES (
            @id,
            @company_id,
            @customer_id,
            @invoice_number,
            @total_amount,
            @paid_amount,
            @remaining_amount,
            @status,
            @created_at,
            @updated_at
        )
    `).run(sale);


   addToSyncQueue(
    "recipe_items",
    item.id,
    "create",
    item
);


    return sale;

}



/*
    جلب كل المبيعات
*/
export function getSales() {

    return sqlite.prepare(`
        SELECT *
        FROM sales
        ORDER BY created_at DESC
    `).all();

}



/*
    جلب فاتورة حسب ID
*/
export function getSaleById(id) {

    return sqlite.prepare(`
        SELECT *
        FROM sales
        WHERE id = ?
    `).get(id);

}



/*
    تحديث حالة الفاتورة
*/
export function updateSaleStatus(id, status) {


    const sale = getSaleById(id);


    if (!sale) {

        throw new Error(
            "Sale not found"
        );

    }


    sqlite.prepare(`
        UPDATE sales
        SET
            status = ?,
            updated_at = ?
        WHERE id = ?
    `).run(
        status,
        new Date().toISOString(),
        id
    );


    const updated = getSaleById(id);


    addToSyncQueue(
        "sales",
        id,
        "update",
        updated
    );


    return updated;

}



/*
    تحديث الدفع
*/
export function updatePayment(id, amount) {


    const sale = getSaleById(id);


    if (!sale) {

        throw new Error(
            "Sale not found"
        );

    }


    const paid =
        Number(sale.paid_amount) +
        Number(amount);


    const remaining =
        Number(sale.total_amount) -
        paid;



    sqlite.prepare(`
        UPDATE sales
        SET
            paid_amount = ?,
            remaining_amount = ?,
            updated_at = ?
        WHERE id = ?
    `).run(

        paid,

        remaining,

        new Date().toISOString(),

        id

    );


    const updated = getSaleById(id);


    addToSyncQueue(
        "sales",
        id,
        "payment",
        updated
    );


    return updated;

}



/*
    إضافة إلى sync_queue
*/
function addToSyncQueue(
    tableName,
    recordId,
    action,
    data
) {

    sqlite.prepare(`
        INSERT INTO sync_queue (
            table_name,
            record_id,
            action,
            data,
            synced
        )
        VALUES (?, ?, ?, ?, 0)
    `).run(

        tableName,

        recordId,

        action,

        JSON.stringify(data)

    );

}