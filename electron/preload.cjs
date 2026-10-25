const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  setFullScreen: () => ipcRenderer.invoke("full-screen"),
  getRemainingTime: () => ipcRenderer.invoke("get-time"),
  startTest: () => ipcRenderer.invoke("start-test"),
  showExamRules: () => ipcRenderer.invoke("show-rules"),
  requestCameraAccess: () => ipcRenderer.invoke("request-camera-access"),
  openCameraSettings: () => ipcRenderer.invoke("open-camera-settings"),
  savePhoto: (arrayBuffer) => ipcRenderer.invoke("save-photo", arrayBuffer),
});
