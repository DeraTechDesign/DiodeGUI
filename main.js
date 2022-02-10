// Modules to control application life and create native browser window
const { Menu, app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')

addrs = "................................"
const appRootDir = require('app-root-dir').get();
const diodePath = appRootDir + '/bin/diode.exe';
const spawn = require( 'child_process' ).spawn;

let child;
let mainWindow;

ipcMain.handle('getAddr', async (event) => {
  return addrs
})
ipcMain.handle('publish', async (event,ports,mode,remoteAddress) => {
  publishDiode(ports,mode,remoteAddress)
  return 1;
})

ipcMain.handle('bind', async (event,ports,remoteAddress) => {
  bindDiode(remoteAddress,ports)
  return 1;
})

ipcMain.handle('kill', async (event) => {
  await killDiodeCLI()
  return 1;
})


function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1054,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true
    }
  })
  getAddr()
  


  // and load the index.html of the app.
  mainWindow.loadFile('index.html')

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()
}

async function killDiodeCLI(){
  child.kill();
}

function getAddr(){

    let args = ['time']    
    child = spawn( diodePath, args); 
    mainWindow.webContents.send("status", "Syncing")

    child.stdout.on( 'data', data => {
        console.log( `stdout: ${data}` );
    });
    child.stderr.on( 'data', data => {
        onError(data)
        if(data.indexOf("Client address")!=-1){
          addrs = `${data.slice(data.indexOf("0x"),data.indexOf("0x")+42)}`;
          mainWindow.webContents.send("addrUpdate", addrs)
          }
    });
    child.on('exit', (code) => {
      mainWindow.webContents.send("status", "Offline")
    });
}

function bindDiode(address, ports){

    let args = []

    ports.forEach(port => {
      args.push('-bind')
      args.push(port+":"+address+":"+port)
    });
    child = spawn( diodePath, args); 
    child.stdout.on( 'data', data => {
        console.log( `stdout: ${data}` );
    });
    child.stderr.on( 'data', data => {
        onError(data)
    });
    child.on('exit', (code) => {
      mainWindow.webContents.send("status", "Offline")
    });
}

function publishDiode(ports,mode,remoteAddress){

    let args = ['publish']

    ports.forEach(port => {
      args.push('-'+mode)
      if(mode == 'private') args.push(port+','+remoteAddress)
      else args.push(port)
    });
    child = spawn( diodePath, args); 
    child.stdout.on( 'data', data => {
        console.log( `stdout: ${data}` );
    });
    child.stderr.on( 'data', data => {
        onError(data)
    });
    child.on('exit', (code) => {
      mainWindow.webContents.send("status", "Offline")
    });
}

function onError(data) {
    console.log( `stderr: ${data}` );
      
    if(data.indexOf("Bind")!=-1){
      mainWindow.webContents.send("status", "Binded to port(s)")
    }else if(data.indexOf("Port")!=-1){
      mainWindow.webContents.send("status", "Publishing port(s)")
    }else if(data.indexOf("windows")!=-1){
      getAddr();
    }else if(data.indexOf("Diode")!=-1){
      mainWindow.webContents.send("status", "Connecting to the blockchain")
    }else if(data.indexOf("validated")!=-1){
      mainWindow.webContents.send("status", "Network is validated")
    }
}
// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.


const template = [
  // { role: 'appMenu' }
  // { role: 'fileMenu' }
  {
    label: 'File',
    submenu: [
     { role: 'quit' }
    ]
  }
]

const menu = Menu.buildFromTemplate(template)
Menu.setApplicationMenu(menu)