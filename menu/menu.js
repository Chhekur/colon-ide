const Menu = require('electron').Menu;
const electron = require('electron')
// let templates_menu = require('./templates_menu.js');
let file_menu = require('./file_menu.js');
let edit_menu = require('./edit_menu.js');
let selection_menu = require('./selection_menu.js');
let find_menu = require('./find_menu.js');
let goto_menu = require('./goto_menu.js');
let view_menu = require('./view_menu.js');
let help_menu = require('./help_menu.js');
const fun = require('./functions.js');
// console.log(templates_menu);

const template = [
    {
        label:'File',
        submenu: file_menu
    },
    {
        label: 'Edit',
        submenu: edit_menu
    },
    {
        label:'Selection',
        submenu: selection_menu
    },
    {
        label: 'Find',
        submenu: find_menu
    },
    {
        label:'Goto',
        submenu: goto_menu
    },
    {
        label:"View",
        submenu: view_menu
    },
    {
        label: 'Help',
        submenu: help_menu
    }
]

if (process.platform === 'darwin') {
    const name = electron.app.getName()
    // console.log(name);
    template.unshift({
        label: name,
        submenu: [{
            label: 'Quit',
            accelerator: 'Command+Q',
            click: function () {
                app.quit()
            }
        }]
    })

}
const menu = Menu.buildFromTemplate(template)
Menu.setApplicationMenu(menu)