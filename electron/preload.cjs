const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
    production: {

        create: (data) =>
            ipcRenderer.invoke("production:create", data),

        list: () =>
            ipcRenderer.invoke("production:list"),

        updateStatus: (id, status) =>
            ipcRenderer.invoke(
                "production:update-status",
                id,
                status
            )

    }
});