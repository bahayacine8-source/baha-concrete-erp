
import sqlite from "../database.js";
import { randomUUID } from "crypto";

/*
 * إنشاء مادة خام جديدة
 */
export function createMaterial(materialData) {

    const material = {
        id: randomUUID(),
        company_id: materialData.company_id,
        name: materialData.name,
        unit: materialData.unit,
        current_quantity: materialData.current_quantity || 0,
        minimum_quantity: materialData.minimum_quantity || 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    };

    sqlite.prepare(`
        INSERT INTO materials (
            id,
            company_id,
            name,
            unit,
            current_quantity,
            minimum_quantity,
            created_at,
            updated_at
        )
        VALUES (
            @id,
            @company_id,
            @name,
            @unit,
            @current_quantity,
            @minimum_quantity,
            @created_at,
            @updated_at
        )
    `).run(material);

    enqueueSync(
        "materials",
        material.id,
        "create",
        material
    );

    return material;
}

/*
 * جلب جميع المواد
 */
export function getMaterials() {

    return sqlite.prepare(`
        SELECT *
        FROM materials
        ORDER BY name
    `).all();

}

/*
 * جلب مادة واحدة
 */
export function getMaterialById(id) {

    return sqlite.prepare(`
        SELECT *
        FROM materials
        WHERE id = ?
    `).get(id);

}

/*
 * تحديث مادة
 */
export function updateMaterial(id, updates) {

    const current = getMaterialById(id);

    if (!current) {
        throw new Error("Material not found");
    }

    const updated = {
        ...current,
        ...updates,
        updated_at: new Date().toISOString()
    };

    sqlite.prepare(`
        UPDATE materials
        SET
            name = ?,
            unit = ?,
            current_quantity = ?,
            minimum_quantity = ?,
            updated_at = ?
        WHERE id = ?
    `).run(
        updated.name,
        updated.unit,
        updated.current_quantity,
        updated.minimum_quantity,
        updated.updated_at,
        id
    );

    enqueueSync(
        "materials",
        id,
        "update",
        updated
    );

    return updated;
}

/*
 * إضافة كمية إلى المخزون
 */
export function addStock(materialId, quantity, referenceType = null, referenceId = null) {

    const material = getMaterialById(materialId);

    if (!material) {
        throw new Error("Material not found");
    }

    const newQuantity =
        Number(material.current_quantity) +
        Number(quantity);

    sqlite.prepare(`
        UPDATE materials
        SET
            current_quantity = ?,
            updated_at = ?
        WHERE id = ?
    `).run(
        newQuantity,
        new Date().toISOString(),
        materialId
    );

    recordStockMove(
        materialId,
        "IN",
        quantity,
        referenceType,
        referenceId
    );

    return getMaterialById(materialId);
}

/*
 * سحب كمية من المخزون
 */
export function removeStock(materialId, quantity, referenceType = null, referenceId = null) {

    const material = getMaterialById(materialId);

    if (!material) {
        throw new Error("Material not found");
    }

    if (material.current_quantity < quantity) {
        throw new Error("Insufficient stock");
    }

    const newQuantity =
        Number(material.current_quantity) -
        Number(quantity);

    sqlite.prepare(`
        UPDATE materials
        SET
            current_quantity = ?,
            updated_at = ?
        WHERE id = ?
    `).run(
        newQuantity,
        new Date().toISOString(),
        materialId
    );

    recordStockMove(
        materialId,
        "OUT",
        quantity,
        referenceType,
        referenceId
    );

    return getMaterialById(materialId);
}

/*
 * حركات المخزون
 */
export function getMaterialMovements(materialId) {

    return sqlite.prepare(`
        SELECT *
        FROM stock_moves
        WHERE material_id = ?
        ORDER BY created_at DESC
    `).all(materialId);

}

/*
 * تسجيل حركة مخزون
 */
function recordStockMove(
    materialId,
    moveType,
    quantity,
    referenceType,
    referenceId
) {

    const move = {
        id: randomUUID(),
        material_id: materialId,
        move_type: moveType,
        quantity,
        reference_type: referenceType,
        reference_id: referenceId,
        created_at: new Date().toISOString()
    };

    sqlite.prepare(`
        INSERT INTO stock_moves (
            id,
            material_id,
            move_type,
            quantity,
            reference_type,
            reference_id,
            created_at
        )
        VALUES (
            @id,
            @material_id,
            @move_type,
            @quantity,
            @reference_type,
            @reference_id,
            @created_at
        )
    `).run(move);

    enqueueSync(
        "stock_moves",
        move.id,
        "create",
        move
    );
}

/*
 * إضافة عملية إلى sync_queue
 */
function enqueueSync(
    tableName,
    recordId,
    action,
    payload
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
        JSON.stringify(payload)
    );
}