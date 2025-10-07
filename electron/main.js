import { app, BrowserWindow, ipcMain } from 'electron'
import path from 'path'
import { fileURLToPath } from 'url'
import Store from 'electron-store';

const store = new Store();

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

function createWindow() {
  const windowState = store.get('windowState', {
    width: 800,
    height: 600,
    isMaximized: false,
    isFullScreen: false,
  });

  const win = new BrowserWindow({
    width: windowState.width,
    height: windowState.height,
    // frame: false,
    autoHideMenuBar: true,
    title: '君の番だ。',
    icon: path.join(__dirname, '../assets/watashidesuga.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })

  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL)
    // win.webContents.openDevTools()
  } else {
    win.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  if (windowState.isMaximized) {
    win.maximize();
  } else if (windowState.isFullScreen) {
    win.setFullScreen(true);
  }

  // 监听各种状态变化事件并保存
  const saveWindowState = () => {
    const isMaximized = win.isMaximized();
    const isFullScreen = win.isFullScreen();
    const bounds = win.getBounds(); // 包含 width, height, x, y

    store.set('windowState', {
      width: bounds.width,
      height: bounds.height,
      x: bounds.x,
      y: bounds.y,
      isMaximized,
      isFullScreen,
    });
  };

  // 保存时机：
  win.on('resize', () => {
    if (!win.isMaximized() && !win.isFullScreen()) saveWindowState();
  });
  win.on('move', () => {
    if (!win.isMaximized() && !win.isFullScreen()) saveWindowState();
  });
  win.on('close', saveWindowState);
  win.on('maximize', saveWindowState);
  win.on('unmaximize', saveWindowState);
  win.on('enter-full-screen', saveWindowState);
  win.on('leave-full-screen', saveWindowState);
}

app.whenReady().then(() => {
  createWindow()
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

ipcMain.on('app:quit', () => {
  app.quit()
})