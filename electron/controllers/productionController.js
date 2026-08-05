export async function handleCreateProductionOrder(data) {

    try {


        const order = createProductionOrder(data);



        return {

            success:true,

            data:order

        };


    } catch(error){


        console.error(
            "Production controller error:",
            error
        );


        return {

            success:false,

            error:error.message

        };

    }

}
import {
    createProductionOrder,
    getProductionOrders,
    updateProductionStatus
} from "../services/productionService.js";


export function registerProductionController(ipcMain) {


    // إنشاء أمر إنتاج
    ipcMain.handle(
        "production:create",
        async (event, data)=>{
console.log(
    "IPC production:create",
    data
);
            try {

                const order =
                    createProductionOrder(data);


                return {
                    success:true,
                    data:order
                };


            } catch(error){

                console.error(
                    "Production create error:",
                    error
                );


                return {
                    success:false,
                    error:error.message
                };

            }

        }
    );




    // جلب الأوامر
    ipcMain.handle(
        "production:list",
        ()=>{

            return getProductionOrders();

        }
    );




    // تحديث الحالة
    ipcMain.handle(
        "production:update-status",
        (event,id,status)=>{


            return updateProductionStatus(
                id,
                status
            );


        }
    );


}