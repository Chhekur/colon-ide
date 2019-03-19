const fun = require('./functions.js');

module.exports = [
	{
        label:'Find...',
        accelerator: 'CmdOrCtrl+F',
        click:function(){
            fun.find();
        }
    },
    {
        label:'Find Next',
        accelerator:'F3',
        click:function(){
            fun.findNext();
        }
    },
    {
        label:'Find Previous',
        accelerator: 'Shift+F3',
        click:function(){
            fun.findPrev();
        }
    },
    // {
    // 	label:'Incremental Find',
    // 	accelerator : 'CmdOrCtrl+I',
    // 	click:function(){
    // 		fun.findIncremental();
    // 	}
    // },
    // {
    // 	label:'Decremental Find',
    // 	accelerator:'CmdOrCtrl+Shift+I',
    // 	click:function(){
    // 		fun.findIncrementalReverse();
    // 	}
    // },
    {
        type:'separator'
    },
    {
        label:'Replace',
        accelerator:'CmdOrCtrl+H',
        click:function(){
            fun.replace();
        }
    },
    {
        type:'separator'
    },
    {
        label:'Quick Find',
        accelerator : 'CmdOrCtrl+F3',
        click:function(){
            fun.findUnder();
        }
    },
    {
        label:'Quick Add Next',
        accelerator:'CmdOrCtrl+D',
        click:function(){
            fun.selectNextOccurrence();
        }
    }
]