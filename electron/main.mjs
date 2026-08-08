
import { app, BrowserWindow, ipcMain } from "electron";
import path from "path";
import { fileURLToPath } from "url";
import { Menu } from "electron";
import db from "./database.js";
import {
    registerProductionController
} from "./controllers/productionController.js";

import {
    runMigrations
} from "./database/migrations.js";

import {
    createMaterial,
    addStock
} from "./services/materialsService.js";

import {
    createRecipe,
    addRecipeItem
} from "./services/recipeService.js";

import {
    produceConcrete
} from "./services/productionService.js";

import {
    startSyncEngine
} from "./services/syncEngine.js";

import {
    startAutoUpdater
} from "./services/updateService.js";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


// =====================================================
// إنشاء نافذة البرنامج
// =====================================================

function createWindow() {

    const win = new BrowserWindow({

        width: 1400,
        height: 900,

        webPreferences: {

            contextIsolation: true,

            preload: path.join(
                __dirname,
                "preload.cjs"
            )

        }

    });


    // =================================================
    // تحديد مكان index.html
    // =================================================

    const startPage = app.isPackaged
        ? path.join(
            process.resourcesPath,
            "app.asar",
            "dist",
            "index.html"
        )
        : path.join(
            __dirname,
            "../dist/index.html"
        );


    console.log("Loading page:", startPage);


    // =================================================
    // تحميل React
    // =================================================

    win.loadFile(startPage)
        .then(() => {

            console.log(
                "HTML loaded successfully"
            );

        })
        .catch((error) => {

            console.error(
                "HTML loading failed:",
                error
            );

        });


    // DevTools أثناء التطوير فقط
    if (!app.isPackaged) {

        win.webContents.openDevTools();

    }


    return win;
}


// =====================================================
// تهيئة قاعدة البيانات
// =====================================================

function initializeDatabase() {

    db.exec(`

        CREATE TABLE IF NOT EXISTS users (

            id TEXT PRIMARY KEY,

            name TEXT,

            email TEXT

        );

    `);

}
ipcMain.handle("app:getVersion", () => {
    return app.getVersion();
});

// =====================================================
// تشغيل التطبيق
// =====================================================

app.whenReady().then(async () => {

    try {

        console.log(
            "Starting application..."
        );


        // =================================================
        // IPC Controllers
        // =================================================

        registerProductionController(ipcMain);


        // =================================================
        // 1 - قاعدة البيانات
        // =================================================

        runMigrations();

        initializeDatabase();

        console.log(
            "Database ready"
        );


        // =================================================
        // 2 - إنشاء المواد الخام
        // =================================================

        const cement = createMaterial({

            company_id: "company_001",

            name: "Cement",

            unit: "kg",

            minimum_quantity: 2000

        });


        const sand = createMaterial({

            company_id: "company_001",

            name: "Sand",

            unit: "kg",

            minimum_quantity: 5000

        });


        // =================================================
        // 3 - إضافة المخزون
        // =================================================

        addStock(
            cement.id,
            10000
        );


        addStock(
            sand.id,
            20000
        );


        console.log(
            "Materials created"
        );


        // =================================================
        // 4 - إنشاء وصفة الخرسانة
        // =================================================

        const recipe = createRecipe({

            company_id: "company_001",

            name: "Standard Concrete",

            concrete_grade: "C25"

        });


        addRecipeItem({

            recipe_id: recipe.id,

            material_id: cement.id,

            quantity: 350,

            unit: "kg"

        });


        addRecipeItem({

            recipe_id: recipe.id,

            material_id: sand.id,

            quantity: 700,

            unit: "kg"

        });


        console.log(
            "Recipe created:",
            recipe.id
        );


        // =================================================
        // 5 - تجربة إنتاج 10 m3
        // =================================================

        const production = produceConcrete(

            "production001",

            recipe.id,

            10

        );


        console.log(
            "Production result:",
            production
        );


        // =================================================
        // 6 - تشغيل المزامنة
        // =================================================

        await startSyncEngine();


        setInterval(async () => {

            try {

                await startSyncEngine();

            } catch (error) {

                console.error(
                    "Sync error:",
                    error
                );

            }

        }, 30000);


        // =================================================
        // 7 - فتح النافذة
        // =================================================
Menu.setApplicationMenu(null);
        createWindow();


        // =================================================
        // 8 - تشغيل التحديث التلقائي
        // =================================================

        if (app.isPackaged) {

            startAutoUpdater();

        } else {

            console.log(
                "Auto updater disabled in development mode."
            );

        }


        console.log(
            "Application started successfully."
        );


    } catch (error) {

        console.error(
            "Application startup failed:",
            error
        );

    }

});


// =====================================================
// إغلاق التطبيق
// =====================================================

app.on(
    "window-all-closed",
    () => {

        if (process.platform !== "darwin") {

            app.quit();

        }

    }
);
