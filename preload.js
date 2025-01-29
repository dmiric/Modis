// Preload script - Can be expanded for advanced features
const { contextBridge, ipcRenderer } = require('electron');

// contextBridge.exposeInMainWorld('myAPI', {
//   modifyPage: () => {
//     // Modify the page here

//     const elements = document.querySelectorAll('.background-image.item-popup--poe2');
//     for (let i = 0; i < elements.length; i++) {
//       if (window.getComputedStyle(elements[i]).backgroundImage !== 'none') {
//         elements[i].style.backgroundImage = 'none';
//         break; // Exit loop after first match
//       }
//     }
//   }
// });