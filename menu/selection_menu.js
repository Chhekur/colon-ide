const fun = require('./functions.js');

module.exports = [
	{
        label : 'Split Into Lines',
        accelerator : 'CmdOrCtrl+Shift+L',
        click:function(){
            fun.splitSelectionByLine();
        }
    },
    {
        label: 'Add Previous Line',
        accelerator : 'CmdOrCtrl+Alt+Up',
        click:function(){
            fun.addCursorToPrevLine();
        }
    },
    {
        label: 'Add Next Line',
        accelerator : 'CmdOrCtrl+Alt+Down',
        click:function(){
            fun.addCursorToNextLine();
        }
    },
    {
        label: 'Single Selection',
        accelerator: 'Escape',
        click:function(){
            fun.singleSelectionTop();
        }
    }
]