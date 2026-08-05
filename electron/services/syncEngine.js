import firestore from "../firebase.js";
import sqlite from "../database.js";

import {
    collection,
    doc,
    setDoc
} from "firebase/firestore";


let syncStarted = false;

export function startSyncEngine(){

    if(syncStarted){
        console.log("Sync Engine already running");
        return;
    }

    syncStarted = true;

    console.log("Sync Engine started");

    syncPendingData();

    setInterval(() => {
        syncPendingData();
    }, 30000);

}



export async function syncPendingData() {

    const items = sqlite.prepare(`
        SELECT *
        FROM sync_queue
        WHERE synced = 0
    `).all();


    console.log(
        "Pending sync:",
        items.length
    );


    for (const item of items) {

        try {

            const data = JSON.parse(item.data);


            console.log(
                "Uploading:",
                item.table_name,
                item.record_id
            );


            await setDoc(
                doc(
                    collection(
                        firestore,
                        item.table_name
                    ),
                    item.record_id
                ),
                data
            );


            sqlite.prepare(`
                UPDATE sync_queue
                SET synced = 1
                WHERE id = ?
            `).run(item.id);


            console.log(
                "Synced:",
                item.record_id
            );

        } catch (error) {

            console.error(
                "Sync failed:",
                error.message
            );

        }

    }

    console.log("Sync completed");

}