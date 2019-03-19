const fun = require('./functions.js');

module.exports = [
	{
        label:'Console',
        accelerator:'Shift+Enter',
        click:function(){
            fun.openConsole();
        }
    },
    {
        label:'Html Preview',
        accelerator:'CmdOrCtrl+Shift+P',
        click:function(){
            fun.openHtmlPreview();
        }
    },
    {
        label:'Markdown Preview',
        accelerator:'CmdOrCtrl+Alt+P',
        click:function(){
            fun.openMarkdownPreview();
        }
    },
    {
        label : 'Project Structure',
        click:function(){
            fun.openProjectStructure();
        }
    }
    // {
    //     label : 'Change Theme',
    //     click:function(){
    //         fun.changeTheme();
    //     }
    // }
]