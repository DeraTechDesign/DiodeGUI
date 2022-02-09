// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process because
// `nodeIntegration` is turned off. Use `preload.js` to
// selectively enable features needed in the rendering
// process.
const { ipcRenderer } = require('electron')
const { clipboard } = require('electron')


ipcRenderer.on("status", function (event, data) {
    const addrText = document.getElementById("status");
    addrText.innerText = data;
    //alert("received data")
});
ipcRenderer.invoke('getAddr').then((result) => {
    const addrText = document.getElementById("addr");
    addrText.innerText = result;
  })

document.querySelector('#addrBtn').addEventListener('click', () => {
    const address  = document.getElementById("addr").innerText;
    clipboard.writeText(address)
    alert("Copied Address to Clipboard",)
})


document.querySelector('#bind').addEventListener('click', () => {
    document.getElementById("bindCls").className = "is-active"
    document.getElementById("pbCls").className = " "

    document.getElementById("pbDiv").className = "notification is-light tabcontent"
    document.getElementById("bindDiv").className = "notification is-light current"
})

document.querySelector('#pb').addEventListener('click', () => {
    document.getElementById("bindCls").className = ""
    document.getElementById("pbCls").className = "is-active"

    document.getElementById("pbDiv").className = "notification is-light current"
    document.getElementById("bindDiv").className = "notification is-dark tabcontent"
})


document.querySelector('#publishDiode').addEventListener('click', () => {
    const ports  = document.getElementById("portP").value.split(" ");
    const mode = document.getElementById("methodP").value.toLowerCase();
    const remoteAddress = document.getElementById("privAddrP").value;
    ipcRenderer.invoke('publish',ports,mode,remoteAddress)
})

document.querySelector('#bindDiode').addEventListener('click', () => {
    const ports  = document.getElementById("portB").value.split(" ");
    const remoteAddress = document.getElementById("privAddrB").value;
    ipcRenderer.invoke('bind',ports,remoteAddress)
})

document.querySelector('#disconnect').addEventListener('click', () => {
    
    ipcRenderer.invoke('kill')
})

