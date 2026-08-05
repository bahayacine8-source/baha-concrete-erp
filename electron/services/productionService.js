import sqlite from "../database.js";
import { randomUUID } from "crypto";

import {
    getRecipeWithItems
} from "./recipeService.js";
/*
    إنشاء أمر إنتاج
*/
export function createProductionOrder(data) {

    const order = {

        id: randomUUID(),

        company_id:
            data.company_id ||
            data.companyId ||
            "company_001",

        customer_id:
            data.customer_id ||
            data.customerId ||
            null,

        concrete_grade:
            data.concrete_grade ||
            data.concreteGradeCode,

        quantity:
            Number(
                data.quantity ||
                data.quantityM3 ||
                0
            ),

        mixer:
            data.mixer ||
            data.plantName ||
            "",

        driver:
            data.driver ||
            data.driverName ||
            "",

        truck:
            data.truck ||
            data.truckPlate ||
            "",

        status:
            data.status ||
            "pending",

        created_at:
            new Date().toISOString(),

        updated_at:
            new Date().toISOString()

    };

    sqlite.prepare(`
        INSERT INTO production_orders (
            id,
            company_id,
            customer_id,
            concrete_grade,
            quantity,
            mixer,
            driver,
            truck,
            status,
            created_at,
            updated_at
        )
        VALUES (
            @id,
            @company_id,
            @customer_id,
            @concrete_grade,
            @quantity,
            @mixer,
            @driver,
            @truck,
            @status,
            @created_at,
            @updated_at
        )
    `).run(order);

    return order;
}



/*
    جلب أوامر الإنتاج
*/
export function getProductionOrders() {

    return sqlite.prepare(`
        SELECT *
        FROM production_orders
        ORDER BY created_at DESC
    `).all();

}



/*
    جلب أمر إنتاج
*/
export function getProductionOrderById(id) {

    return sqlite.prepare(`
        SELECT *
        FROM production_orders
        WHERE id = ?
    `).get(id);

}



/*
    تحديث حالة الإنتاج
*/
export function updateProductionStatus(id, status) {


    const order = getProductionOrderById(id);


    if (!order) {

        throw new Error(
            "Production order not found"
        );

    }


    sqlite.prepare(`
        UPDATE production_orders
        SET
            status = ?,
            updated_at = ?
        WHERE id = ?
    `).run(

        status,

        new Date().toISOString(),

        id

    );


    const updated =
        getProductionOrderById(id);


    addToSyncQueue(
        "production_orders",
        id,
        "update",
        updated
    );


    return updated;

}



/*
    استهلاك مادة أثناء الإنتاج
*/
export function consumeMaterial(
    materialId,
    quantity,
    productionId
) {


    const material =
        sqlite.prepare(`
            SELECT *
            FROM materials
            WHERE id = ?
        `).get(materialId);



    if (!material) {

        throw new Error(
            "Material not found"
        );

    }



    if (
        Number(material.current_quantity)
        <
        Number(quantity)
    ) {

        throw new Error(
            "Insufficient material stock"
        );

    }



    const newQuantity =
        Number(material.current_quantity)
        -
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



    const move = {

        id: randomUUID(),

        material_id: materialId,

        move_type: "OUT",

        quantity: Number(quantity),

        reference_type: "production",

        reference_id: productionId,

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



    addToSyncQueue(
        "stock_moves",
        move.id,
        "create",
        move
    );


    return {
        material,
        remaining_quantity: newQuantity
    };

}



/*
    إضافة العملية إلى sync_queue
*/
/*
    إضافة العملية إلى sync_queue
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


/*
    إنتاج الخرسانة حسب الوصفة
*/
export function produceConcrete(
    productionId,
    recipeId,
    quantity
) {


    const recipe =
        getRecipeWithItems(recipeId);



    if (!recipe.recipe) {

        throw new Error(
            "Recipe not found"
        );

    }



    const results = [];



    for (const item of recipe.items) {


        const required =
            Number(item.quantity) *
            Number(quantity);



        const material =
            sqlite.prepare(`
                SELECT *
                FROM materials
                WHERE id = ?
            `).get(
                item.material_id
            );



        if (!material) {

            throw new Error(
                "Material not found: "
                + item.material_id
            );

        }



        consumeMaterial(
            material.id,
            required,
            productionId
        );


        results.push({

            material:
                material.name,

            consumed:
                required

        });

    }



    return results;

}