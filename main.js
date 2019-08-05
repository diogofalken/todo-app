const { app, Tray, Menu, BrowserWindow, ipcMain } = require("electron");
const { resolve } = require("path");

let mainTray = null;
let addTodo = null;
const allTodos = [];

// Create a render function in order to be dynamic
const render = (tray = mainTray) => {
  const todos = allTodos.map(item => ({
    label: item,
    submenu: [
      {
        label: "Remover",
        click: () => {
          allTodos.splice(allTodos.indexOf(item), 1);
          render();
        }
      }
    ]
  }));

  // Create tray template
  const trayTemplate = [
    {
      label: "Add new TODO",
      click() {
        createAddTodo();
      }
    },
    {
      type: "separator"
    },
    ...todos,
    {
      type: "separator"
    },
    {
      role: "quit",
      accelerator: "CmdOrCtrl+Q"
    }
  ];

  // Build Menu from template
  const trayMenu = Menu.buildFromTemplate(trayTemplate);

  // Insert Tray
  tray.setContextMenu(trayMenu);
};

const createAddTodo = () => {
  addTodo = new BrowserWindow({
    width: 300,
    height: 200,
    title: "Add TODO",
    webPreferences: { nodeIntegration: true }
  });

  addTodo.loadFile(resolve(__dirname, "addTodoWindow.html"));

  // Handle garbage collection
  addTodo.on("close", () => {
    addTodo = null;
  });
};

// Create menu template for addTodo window
const addTodoTemplate = [
  {
    label: "File",
    submenu: [
      {
        label: "Quit",
        accelerator: "CmdOrCtrl+Q",
        click() {
          app.quit();
        }
      },
      {
        label: "Toggle DevTools",
        accelerator: process.platform == "CmdOrCtrl+I",
        click(item, focusedWindow) {
          focusedWindow.toggleDevTools();
        }
      }
    ]
  }
];

// Catch new todo
ipcMain.on("todo:add", (e, item) => {
  allTodos.push(item);
  addTodo.hide();
  render();
});

// Listen for app to be ready
app.on("ready", () => {
  // Create tray
  mainTray = new Tray(resolve(__dirname, "assets", "icon.png"));

  Menu.setApplicationMenu(Menu.buildFromTemplate(addTodoTemplate));
  render(mainTray);
});

// If OSX, add empty object to menu
if (process.platform == "darwin") {
  trayTemplate.unshift({});
}