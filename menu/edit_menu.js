const fun = require('./functions.js');
let templates_menu = require('./templates_menu.js');

module.exports = [
	{
        role: 'Undo'
    },
    {
        role: 'Redo'
    },
    {
        label: 'Refresh Preview',
        accelerator : 'CmdOrCtrl+R',
        click:function(){
            fun.refreshPreview();
        }
    },
    {
        type: 'separator'
    },
    {
        role: 'Copy'
    },
    {
        role: 'Cut'
    },
    {
        role: 'Paste'
    },
    {
        label:'Templates',
        submenu:templates_menu
    },
    {
        type: 'separator'
    },
    {
        type: 'separator'
    },
    {
        label:'Font Size',
        submenu:[{
            label:'Increase',
            accelerator:'CmdOrCtrl+=',
            click:function(){
                fun.increaseFontSize();
            }
        },
            {
                label:'Decrease',
                accelerator:'CmdOrCtrl+-',
                click:function(){
                    fun.decreaseFontSize();
                }
            }]
    },
    {
        label: 'Zoom',
        submenu:[{
            label:'In',
            role:'zoomin'
        },
            {
                label:'Out',
                accelerator:'CmdOrCtrl+Shift+-',
                role:'zoomout'
            }]
    },
    {
        label: 'Line',
        submenu:[{
            label: 'Indent',
            accelerator: 'CmdOrCtrl+]',
            click:function(){
                fun.Indent();
            }
        },
            {
                label: 'Unindent',
                accelerator: 'CmdOrCtrl+[',
                click:function(){
                    fun.indentLess();
                }
            },
            {
                label: 'Swap Line Up',
                accelerator:'CmdOrCtrl+Shift+Up',
                click:function(){
                    fun.swapLineUp();
                }
            },
            {
                label: 'Swap Line Down',
                accelerator: 'CmdOrCtrl+Shift+Down',
                click:function(){
                    fun.swapLineDown();
                }
            },
            {
                label: 'Duplicate Line',
                accelerator: 'CmdOrCtrl+Shift+D',
                click:function(){
                    fun.duplicateLine();
                }
            },
            {
                label: 'Delete Line',
                accelerator: 'CmdOrCtrl+Shift+K',
                click:function(){
                    fun.deleteLine();
                }
            },
            {
                label: 'Join Lines',
                accelerator: 'CmdOrCtrl+J',
                click:function(){
                    fun.joinLines();
                }
            }]
    },
    {
        label: 'Comment',
        submenu:[{
            label: 'Toggle Comment',
            accelerator : 'CmdOrCtrl+/',
            click:function(){
                fun.toggleCommentIndented();
            }
        },
            {
                label: 'Toggle Block Comment',
                accelerator: 'CmdOrCtrl+Shift+/',
                click:function(){
                    fun.toggleCommentIndented();
                }
            }]
    },
    {
        label: 'Text',
        submenu:[{
            label: 'Insert Line Before',
            accelerator : 'CmdOrCtrl+Shift+Enter',
            click:function(){
                fun.insertLineBefore();
            }
        },
            {
                label: 'Insert Line After',
                accelerator : 'CmdOrCtrl+Enter',
                click:function(){
                    fun.insertLineAfter();
                }
            },
            {
                type: 'separator'
            },
            {
                label: 'Transpose',
                accelerator:'CmdOrCtrl+T',
                click:function(){
                    fun.transposeChars();
                }
            }]
    },
    {
        label: 'Mark',
        submenu:[{
            label : 'Set Mark',
            accelerator: 'CmdOrCtrl+K',
            click:function(){
                fun.setSublimeMark();
            }
        },
            {
                label: 'Select To Mark',
                accelerator : 'CmdOrCtrl+K',
                click:function(){
                    fun.selectToSublimeMark();
                }
            },
            {
                label: 'Delete To Mark',
                accelerator: 'CmdOrCtrl+K',
                click:function(){
                    fun.deleteToSublimeMark();
                }
            },
            {
                label: 'Swap With Mark',
                accelerator: 'CmdOrCtrl+K',
                click:function(){
                    fun.swapWithSublimeMark();
                }
            },
            {
                label : 'Clear Mark',
                accelerator : 'CmdOrCtrl+K',
                click:function(){
                    fun.clearSublimeMark();
                }
            }]
    },
    {
        label:'Code Folding',
        submenu:[{
            label:'Fold',
            accelerator: 'CmdOrCtrl+Shift+[',
            click:function(){
                fun.fold();
            }
        },
            {
                label: 'Unfold',
                accelerator: 'CmdOrCtrl+Shift+]',
                click:function(){
                    fun.unflod();
                }
            }]
    },
    {
        label: 'Convert Case',
        submenu:[{
            label: 'Upper Case',
            accelerator:'CmdOrCtrl+U',
            click:function(){
                fun.upcaseAtCursor();
            }
        },
            {
                label:'Lower Case',
                accelerator: 'CmdOrCtrl+L',
                click:function(){
                    fun.downcaseAtCursor();
                }
            }]
    },
    {
        label:'Wrap',
        accelerator:'Alt+Q',
        click:function(){
            fun.wrapLines();
        }
    },
    {
        label : 'Sort lines',
        accelerator:'F9',
        click:function(){
            fun.sortLines();
        }
    },
    {
        label: 'Sort Lines (Case Sensitive)',
        accelerator:'CmdOrCtrl+F9',
        click:function(){
            fun.sortLinesInsensitive();
        }
    }
]