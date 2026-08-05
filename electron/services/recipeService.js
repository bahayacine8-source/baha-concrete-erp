import sqlite from "../database.js";
import { randomUUID } from "crypto";



/*
    إنشاء وصفة خرسانة
*/
export function createRecipe(data) {


    const recipe = {

        id: randomUUID(),

        company_id: data.company_id,

        name: data.name,

        concrete_grade: data.concrete_grade,

        created_at: new Date().toISOString(),

        updated_at: new Date().toISOString()

    };



    sqlite.prepare(`
        INSERT INTO concrete_recipes (
            id,
            company_id,
            name,
            concrete_grade,
            created_at,
            updated_at
        )
        VALUES (
            @id,
            @company_id,
            @name,
            @concrete_grade,
            @created_at,
            @updated_at
        )
    `).run(recipe);



    return recipe;

}
export function getRecipeWithItems(recipeId) {


    const recipe =
        sqlite.prepare(`
            SELECT *
            FROM concrete_recipes
            WHERE id = ?
        `).get(recipeId);



    const items =
        sqlite.prepare(`
            SELECT *
            FROM recipe_items
            WHERE recipe_id = ?
        `).all(recipeId);



    return {

        recipe,

        items

    };

}


/*
    إضافة مادة للوصفة
*/
export function addRecipeItem(data) {


    const item = {

        id: randomUUID(),

        recipe_id: data.recipe_id,

        material_id: data.material_id,

        quantity: Number(data.quantity),

        unit: data.unit,

        created_at: new Date().toISOString()

    };



    sqlite.prepare(`
        INSERT INTO recipe_items (
            id,
            recipe_id,
            material_id,
            quantity,
            unit,
            created_at
        )
        VALUES (
            @id,
            @recipe_id,
            @material_id,
            @quantity,
            @unit,
            @created_at
        )
    `).run(item);



    return item;

}



/*
    جلب وصفة كاملة
*/
export function getRecipe(recipeId) {


    const recipe =
        sqlite.prepare(`
            SELECT *
            FROM concrete_recipes
            WHERE id = ?
        `).get(recipeId);



    const items =
        sqlite.prepare(`
            SELECT *
            FROM recipe_items
            WHERE recipe_id = ?
        `).all(recipeId);



    return {

        recipe,

        items

    };

}
