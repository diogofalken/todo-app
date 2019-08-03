const { app, Tray, Menu } = require('electron');
const { resolve } = require('path');

let mainTray = null;

// Create a render function in order to be dynamic
const render = (tray = mainTray) => {
  // Create tray template
  const trayTemplate = [
    {
      label: 'Add new TODO',
      click() {
        console.log('jeff');
      }
    },
    {
      type: 'separator'
    },
    {
      label: 'Todo1'
    },
    {
      type: 'separator'
    },
    {
      role: 'quit',
      accelerator: 'CmdOrCtrl+Q'
    }
  ];

  // Build Menu from template
  const trayMenu = Menu.buildFromTemplate(trayTemplate);

  // Insert Tray
  tray.setContextMenu(trayMenu);
};

// Listen for app to be ready
app.on('ready', () => {
  // Create tray
  mainTray = new Tray(resolve(__dirname, 'assets', 'icon.png'));

  render(mainTray);
});

// If OSX, add empty object to menu
if (process.platform == 'darwin') {
  trayTemplate.unshift({});
}
