const fun = require('./functions.js');

module.exports = [
	{
        label: 'New File',
        accelerator: 'CmdOrCtrl+N',
        click: function(){
            fun.newFile();
        }
    },
    {
        label: 'Open File...',
        accelerator: 'CmdOrCtrl+O',
        click:function(){
            fun.openFile();
        }
    },
    {
        label : 'Open Folder...',
        click:function(){
            fun.openFolder();
        }
    },
    {
        label: 'Save',
        accelerator :'CmdOrCtrl+S',
        click:function(){
            fun.save();
        }
    },
    {
        label: 'Save As',
        accelerator: 'CmdOrCtrl+Shift+S',
        click:function(){
            fun.saveAs();
        }
    },
    {
        label: 'Close File',
        accelerator: 'CmdOrCtrl+W',
        click:function(){
            fun.closeFile();
        }
    },
    {
    	label:'Create Template',
    	submenu:[
    		{
    			label : 'cpp',
    			click:function(){
    				fun.createTemplate('cpp');
    			}
    		},
    		{
    			label : 'c',
    			click:function(){
    				fun.createTemplate('c');
    			}
    		},
    		{
    			label : 'py',
    			click:function(){
    				fun.createTemplate('py');
    			}
    		},
    		{
    			label : 'java',
    			click:function(){
    				fun.createTemplate('java');
    			}
    		},
    		{
    			label : 'js',
    			click:function(){
    				fun.createTemplate('js');
    			}
    		},
    		{
    			label : 'rb',
    			click:function(){
    				fun.createTemplate('rb');
    			}
    		},
    		{
    			label : 'pl',
    			click:function(){
    				fun.createTemplate('pl');
    			}
    		},
    		{
    			label : 'cs',
    			click:function(){
    				fun.createTemplate('cs');
    			}
    		},
    		{
    			label : 'php',
    			click:function(){
    				fun.createTemplate('php');
    			}
    		},
    		{
    			label : 'go',
    			click:function(){
    				fun.createTemplate('go');
    			}
    		},
    		{
    			label : 'txt',
    			click:function(){
    				fun.createTemplate('txt');
    			}
    		}
    	]
    },
    {
        label :'Exit',
        click:function(){
            app.quit();
        }
    }
]