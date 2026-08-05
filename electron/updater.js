import { autoUpdater } from "electron-updater";
import { dialog } from "electron";


export function checkForUpdates(){


    autoUpdater.autoDownload = false;


    autoUpdater.on(
        "update-available",
        (info)=>{


            dialog.showMessageBox({

                type:"info",

                title:"تحديث جديد",

                message:
                `يوجد إصدار جديد ${info.version}`,

                buttons:[
                    "تحميل",
                    "لاحقا"
                ]

            }).then(result=>{


                if(result.response === 0){

                    autoUpdater.downloadUpdate();

                }

            });


        }
    );



    autoUpdater.on(
        "update-downloaded",
        ()=>{


            dialog.showMessageBox({

                title:"جاهز",

                message:
                "تم تحميل التحديث. سيتم إعادة التشغيل."

            }).then(()=>{

                autoUpdater.quitAndInstall();

            });


        }
    );



    autoUpdater.checkForUpdates();

}