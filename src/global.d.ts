interface Window {

productionAPI:{

createOrder:(data:any)=>Promise<any>;

getOrders:()=>Promise<any>;

updateStatus:
(id:string,status:string)=>Promise<any>;

}

}