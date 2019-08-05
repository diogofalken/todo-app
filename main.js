const {
  app,
  Tray,
  Menu,
  BrowserWindow,
  ipcMain,
  globalShortcut
} = require("electron");
const { resolve } = require("path");
const Store = require("electron-store");

// DB
const store = new Store({
  todos: {
    type: "string"
  }
});

let mainTray = null;
let addTodoWindow = null;
let showTodoCompletedWindow = null;
let allTodos = [];

// Create a render function in order to be dynamic
const render = (tray = mainTray) => {
  const storedTodos = store.get("todos");
  allTodos = storedTodos ? JSON.parse(storedTodos) : [];
  const todos = allTodos
    .filter(item => item.state == 0)
    .map(({ name }) => ({
      label: name,
      submenu: [
        {
          label: "Completed",
          click: () => {
            // Find index and change state
            let todoIndex = allTodos.findIndex(todo => todo.name == name);
            allTodos[todoIndex].state = 1;

            // Reset DB
            store.clear();
            store.set("todos", JSON.stringify([...allTodos]));
            render();
          }
        },
        {
          label: "Remove",
          click: () => {
            // Add the new array to electron db
            store.set(
              "todos",
              JSON.stringify(allTodos.filter(todo => todo.name !== name))
            );
            render();
          }
        }
      ]
    }));

  // Create tray template
  const trayTemplate = [
    {
      label: "Add new...",
      click() {
        createAddTodo();
      }
    },
    {
      label: "Show completed...",
      click() {
        createShowTodoCompleted();
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
      role: "reload",
      accelerator: "CmdOrCtrl+R"
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
  addTodoWindow = new BrowserWindow({
    width: 300,
    height: 125,
    frame: false,
    webPreferences: { nodeIntegration: true }
  });

  addTodoWindow.loadFile(resolve(__dirname, "addTodoWindow.html"));

  // Handle garbage collection
  addTodoWindow.on("close", () => {
    addTodoWindow = null;
  });

  // When the window is not focused
  addTodoWindow.on("blur", e => {
    e.preventDefault();
    addTodoWindow.hide();
  });
};

const createShowTodoCompleted = () => {
  showTodoCompletedWindow = new BrowserWindow({
    frame: false,
    webPreferences: { nodeIntegration: true }
  });

  showTodoCompletedWindow.loadFile(
    resolve(__dirname, "showTodoCompleted.html")
  );

  showTodoCompletedWindow.on("close", () => {
    showTodoCompletedWindow = null;
  });

  // When the window is not focused
  showTodoCompletedWindow.on("blur", e => {
    e.preventDefault();
    showTodoCompletedWindow.hide();
  });
};

// Catch new todo
ipcMain.on("todo:add", (e, item) => {
  // Add to electron db
  const name = item;
  const state = 0;
  store.set("todos", JSON.stringify([...allTodos, { name, state }]));
  addTodoWindow.hide();
  render();
});

// Listen for app to be ready
app.on("ready", () => {
  // Create tray
  mainTray = new Tray(resolve(__dirname, "assets", "icon.png"));

  // Add global shortcut to add new todo
  globalShortcut.register("CommandOrControl+Shift+X", () => {
    createAddTodo();
  });

  render(mainTray);
});

// If OSX, add empty object to menu
if (process.platform == "darwin") {
  addTodoTemplate.unshift({});
}
