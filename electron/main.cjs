const {
  BrowserWindow,
  app,
  ipcMain,
  dialog,
  session,
  systemPreferences,
  shell,
} = require("electron");
const path = require("path");
const fs = require('fs');

let win = null;

function createWindow() {
  win = new BrowserWindow({
    width: 1000,
    height: 700,
    frame: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
    },
  });

  win.loadURL("http://localhost:5173/");
  win.webContents.openDevTools({ mode: "detach" });
}

ipcMain.handle("full-screen", () => {
  win.kiosk = true;
});

ipcMain.handle("request-camera-access", async () => {
  if (process.platform !== "darwin") return { granted: true, status: "granted" };

  let status = systemPreferences.getMediaAccessStatus("camera");
  if (status === "not-determined") {
    await systemPreferences.askForMediaAccess("camera");
    status = systemPreferences.getMediaAccessStatus("camera");
  }

  return { granted: status === "granted", status };
});

ipcMain.handle("open-camera-settings", async () => {
  if (process.platform === "darwin") {
    await shell.openExternal(
      "x-apple.systempreferences:com.apple.preference.security?Privacy_Camera",
    );
  }
});

let end_time = null;

ipcMain.handle("start-test", () => {
  end_time = Date.now() + 60 * 60 * 1000;
});

ipcMain.handle("get-time", () => {
  return end_time === null ? 0 : Math.max(0, end_time - Date.now());
});

ipcMain.handle("show-rules", async () => {
  const res = await dialog.showMessageBox(win, {
    type: "info",
    title: "Exam rules",
    message: "Please follow these things:",
    detail: `
    1. Do not open any new tab
    2. You will get 0 marks if you cheat
    3. Camera snapshots will be captured every 4 seconds and stored locally
    `,
    buttons: ["Cancel", "Accept"],
    defaultId: 0
  });

  return res.response;
});

ipcMain.handle("save-photo", (_, arrayBuffer) => {
  const cameraFeedDirectory = path.join(app.getPath("userData"), "cameraFeed");
  fs.mkdirSync(cameraFeedDirectory, { recursive: true });
  const filePath = path.join(cameraFeedDirectory, `${Date.now()}.jpeg`);
  const buffer = Buffer.from(arrayBuffer);
  fs.writeFileSync(filePath, buffer);
  return { filePath, directory: cameraFeedDirectory };
});

app.whenReady().then(() => {
  const allowVideoPermission = (permission, details = {}) =>
    permission === "media" && details.mediaTypes?.includes("video");

  session.defaultSession.setPermissionCheckHandler(
    (_webContents, permission, _requestingOrigin, details) =>
      allowVideoPermission(permission, details),
  );
  session.defaultSession.setPermissionRequestHandler(
    (_webContents, permission, callback, details) => {
      callback(allowVideoPermission(permission, details));
    },
  );

  createWindow();
});
