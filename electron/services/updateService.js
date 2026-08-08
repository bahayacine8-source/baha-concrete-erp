
import { dialog } from "electron";
import { createRequire } from "module";

const require = createRequire(import.meta.url);

const { autoUpdater } = require("electron-updater");


// =====================================================
// إعدادات التحديث
// =====================================================

autoUpdater.autoDownload = false;
autoUpdater.autoInstallOnAppQuit = true;


// =====================================================
// تشغيل نظام التحديث
// =====================================================

export function startAutoUpdater() {

    console.log(
        "================================="
    );

    console.log(
        "Auto updater started."
    );

    console.log(
        "Current version:",
        autoUpdater.currentVersion.version
    );

    console.log(
        "================================="
    );


    // =================================================
    // فحص التحديث
    // =================================================

    autoUpdater.on(
        "checking-for-update",
        () => {

            console.log(
                "Checking for updates..."
            );

        }
    );


    // =================================================
    // لا يوجد تحديث
    // =================================================

    autoUpdater.on(
        "update-not-available",
        (info) => {

            console.log(
                "Application is up to date:",
                info?.version
            );

        }
    );


    // =================================================
    // يوجد تحديث
    // =================================================

    autoUpdater.on(
        "update-available",
        (info) => {

            console.log(
                "================================="
            );

            console.log(
                "UPDATE AVAILABLE:",
                info.version
            );

            console.log(
                "================================="
            );


            dialog.showMessageBox({

                type: "info",

                title: "تحديث جديد",

                message:
                    `يوجد إصدار جديد: ${info.version}`,

                detail:
                    "هل تريد تحميل التحديث الآن؟",

                buttons: [
                    "تحميل التحديث",
                    "لاحقًا"
                ],

                defaultId: 0,

                cancelId: 1

            }).then((result) => {

                if (result.response === 0) {

                    console.log(
                        "Downloading update..."
                    );

                    autoUpdater.downloadUpdate();

                }

            });

        }
    );


    // =================================================
    // تقدم التحميل
    // =================================================

    autoUpdater.on(
        "download-progress",
        (progress) => {

            console.log(
                `Update download: ${progress.percent.toFixed(1)}%`
            );

        }
    );


    // =================================================
    // تم تحميل التحديث
    // =================================================

    autoUpdater.on(
        "update-downloaded",
        () => {

            console.log(
                "================================="
            );

            console.log(
                "UPDATE DOWNLOADED"
            );

            console.log(
                "================================="
            );


            dialog.showMessageBox({

                type: "info",

                title: "التحديث جاهز",

                message:
                    "تم تحميل التحديث بنجاح.",

                detail:
                    "هل تريد إعادة تشغيل البرنامج وتثبيت التحديث؟",

                buttons: [
                    "إعادة التشغيل الآن",
                    "لاحقًا"
                ],

                defaultId: 0,

                cancelId: 1

            }).then((result) => {

                if (result.response === 0) {

                    autoUpdater.quitAndInstall();

                }

            });

        }
    );


    // =================================================
    // خطأ
    // =================================================

    autoUpdater.on(
        "error",
        (error) => {

            console.error(
                "================================="
            );

            console.error(
                "AUTO UPDATE ERROR"
            );

            console.error(
                error
            );

            console.error(
                "================================="
            );

        }
    );


    // =================================================
    // بدء الفحص بعد تشغيل التطبيق
    // =================================================

    setTimeout(async () => {

        try {

            console.log(
                "Starting update check..."
            );

            await autoUpdater.checkForUpdates();

        } catch (error) {

            console.error(
                "Update check failed:",
                error
            );

        }

    }, 5000);

}
export async function checkForUpdatesNow() {
    try {
        console.log("Manual update check started...");

        const result = await autoUpdater.checkForUpdates();

        console.log(
            "Manual update check completed:",
            result?.updateInfo?.version
        );

        return result;

    } catch (error) {
        console.error(
            "Manual update check failed:",
            error
        );

        dialog.showErrorBox(
            "خطأ في التحديث",
            `تعذر التحقق من وجود تحديثات.\n\n${error.message}`
        );

        throw error;
    }
}

