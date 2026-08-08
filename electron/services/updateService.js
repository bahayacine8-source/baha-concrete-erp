
import { autoUpdater } from "electron-updater";
import { dialog } from "electron";


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
        "Auto updater started."
    );


    // =================================================
    // البحث عن تحديث
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
                info.version
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
                "Update available:",
                info.version
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
                "Update downloaded successfully."
            );


            dialog.showMessageBox({

                type: "info",

                title: "التحديث جاهز",

                message:
                    "تم تحميل التحديث بنجاح.",

                detail:
                    "اضغط إعادة التشغيل الآن لتثبيت التحديث.",

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
                "Auto updater error:",
                error
            );

        }
    );


    // =================================================
    // بدء الفحص
    // =================================================

    setTimeout(() => {

        console.log(
            "Starting update check..."
        );

        autoUpdater.checkForUpdates();

    }, 5000);

}

