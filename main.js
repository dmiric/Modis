import { app, BrowserWindow, globalShortcut, Tray, Menu, clipboard } from "electron";
import path from "path";
import { PoE2ItemParser } from "poe-item-parser";
import { keyboard, Key, sleep } from "@nut-tree-fork/nut-js"; // Nut.js for keyboard input
import { items } from './links.js';


let mainWindow;
let tray;
let item;

const basePath = app.getAppPath();


app.on("ready", () => {
  // Create the window
  mainWindow = new BrowserWindow({
    width: 1500,
    height: 838,
    show: false, // Keep the window hidden initially
    webPreferences: {
      preload: path.join(basePath, "preload.js"),
      contextIsolation: true,
      sandbox: false,  // Disabling sandboxing can sometimes help with these issues
      enableWebSQL: false,  // Disable webSQL if it's not needed
    },
  });

  mainWindow.on("blur", () => {
    mainWindow.hide(); // Hide the window when it loses focus
  });

  // Minimize to tray
  tray = new Tray(path.join(basePath, "icon.png")); // Replace with a valid icon path
  const contextMenu = Menu.buildFromTemplate([
    { label: "Show App", click: () => mainWindow.show() },
    { label: "Quit", click: () => app.quit() },
  ]);
  tray.setToolTip("Modis");
  tray.setContextMenu(contextMenu);

  // Register global shortcut
  globalShortcut.register("Ctrl+E", async () => {
    try {
      let item_text;

      // Function to search for an item in the array
      const searchItem = (name, req = "") => {
        // search with req
        let res = items.find(item => item.name === name && (item.req === req || (!req && item.req === "")));

        if(res) {
          return res;
        }
        // search without req
        return items.find(item => item.name === name);
      };

      const jewelType = (itemName) => {
        let jT = itemName.lines[itemName.lines.length - 1].trim();
        if(jT === 'Ruby') return 'Rubies'
        if(jT === 'Sapphire') return 'Sapphires'
        if(jT === 'Emerald') return 'Emeralds'
      }

        // Simulate Ctrl+C using Nut.js
      await keyboard.pressKey(Key.LeftControl); // Press Ctrl
      await keyboard.pressKey(Key.C); // Press C
      await keyboard.releaseKey(Key.C); // Release C
      await keyboard.releaseKey(Key.LeftControl); // Release Ctrl

      // Wait a moment for the system to update the clipboard
      await sleep(100); // 100ms delay (Nut.js provides sleep)

      // Get the copied text from the clipboard
      item_text = clipboard.readText();

      console.log(item_text);

      // Use PoE2ItemParser
      item = new PoE2ItemParser(item_text).getItem();
      console.log("Parsed item:", item);
      
      // determine item requirements to find the correct link
      let requirements = '';
      
      if(item.requirements.strength > 0)
        requirements = 'str_'
    
      if(item.requirements.dexterity > 0)
        requirements = requirements + 'dex_'

      if(item.requirements.intelligence > 0)
        requirements = requirements + 'int'
      
      let req = '';
      // replace last _ with nothing
      req = requirements.replace(/_$/, "") ? requirements.replace(/_$/, "") : '';
    
    let result;
    if(item.itemClass === 'Jewels') {
      console.log("it's jewel");
      console.log(jewelType(item.itemName));
      result = searchItem(jewelType(item.itemName), req);
    } else {
      result = searchItem(item.itemClass, req);
    }
    // Output: { "name": "Modifiers", "link": "/us/Modifiers", "req": "" }

      // Load the desired webpage
    mainWindow.loadURL("https://poe2db.tw/" + result.link);
      
      console.log("req:" + req + 'req');

      // Show or hide the window
      if (mainWindow.isVisible()) {
        mainWindow.hide();
      } else {
        mainWindow.show();
      }

      console.log("Parsed item:", item); // For debugging
    } catch (error) {
      console.error("Error handling global shortcut:", error);
    }
  });

  // Prevent app from quitting when window is closed
  mainWindow.on("close", (event) => {
    event.preventDefault();
    mainWindow.hide();
  });

  app.on("will-quit", () => {
    globalShortcut.unregisterAll();
  });
});
