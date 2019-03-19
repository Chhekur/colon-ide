const fun = require('./functions.js');

module.exports = [
	{
        label:'Go Word Left',
        accelerator:'Alt+Left',
        click:function(){
            fun.goSubwordLeft();
        }
    },
    {
        label:'Go Word Right',
        accelerator:'Alt+Right',
        click:function(){
            fun.goSubwordRight();
        }
    },
    {
        label: 'Goto Line',
        accelerator:'CmdOrCtrl+G',
        click:function(){
            fun.jumpToLine();
        }
    },
    {
        label: 'Goto Bracket',
        accelerator:'CmdOrCtrl+M',
        click:function(){
            fun.goToBracket();
        }
    }
]