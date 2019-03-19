const fun = require('./functions.js');

module.exports = [
	// {
	//     label: 'Check For Updates...',
	//     click:function(){
	//         fun.checkForUpdates();
	//     }
	// },
    {
        label:'About Colon',
        click:function(){
            fun.openAbout();
        }
    }
]