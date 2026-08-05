import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

import fs from "fs";
import path from "path";
import { app as electronApp } from "electron";


const configPath = electronApp.isPackaged
    ? path.join(
        process.resourcesPath,
        "firebase-applet-config.json"
      )
    : path.join(
        process.cwd(),
        "firebase-applet-config.json"
      );


const firebaseConfig = JSON.parse(
    fs.readFileSync(
        configPath,
        "utf-8"
    )
);


const firebaseApp = initializeApp(
    firebaseConfig
);


const db = getFirestore(
    firebaseApp
);


export default db;