const fun = require('./functions.js');
const path = require('path');
const fs = require('fs');

let templates_menu = []

let files = fs.readdirSync(path.join(fun.getUserDataPath(), 'templates'));
// fs.readdir(path.join(fun.getUserDataPath(), 'templates'), function(err, items) {
//     console.log(items);

//     for (var i=0; i<items.length; i++) {
//         // console.log(items[i]);
//         templates_menu.push({label : items[i]});
//     }
// });
for (let i = 0; i < files.length; i++){
	templates_menu.push({label: files[i].split('.')[0], click:function(){fun.openTemplate(files[i].split('.')[0]);}});
}

module.exports = templates_menu;