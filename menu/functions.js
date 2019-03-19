const fs = require('fs');
const dialog = require('electron').dialog;
const ipc = require('electron').ipcMain;
const path = require('path');
const util = require('util');
const exec = require('child_process').exec;
const psTree = require('ps-tree');

// console.log('loading functions-rpc.js');

// const spawn = require('child_process').spawn;

global.filename = undefined;
var child;

function openFileFromSidebar(filepath){
    // console.log(filepath);
    if(filepath == undefined){
        console.log("You can't open this file...");
    }else{
        // filename = filepath;
        // console.log(typeof filepath);
        fs.readFile(filepath,'utf-8' ,function(err,data){
            if(err){
                console.log("An error ocurred reading the file :" + err.message);
            }else{
                mainWindow.webContents.send('openFile', data, filepath);
                // mainWindow.webContents.send('change-mod',filepath);
            }
        });
    }
}

ipc.on('openFileFromSidebar', function(event, filepath){
    openFileFromSidebar(filepath);
})

ipc.on('openRemoteFile', function (event, filepath){
    fs.readFile(filepath, 'utf-8', function(err, data){
        if(err) console.log(err);
        else event.returnValue = {data:data, path:filepath, name:path.basename(filepath)};
    });
});

function openDoubleClickFile(filepath){
    fs.readFile(filepath, 'utf-8', (err, data) => {
        if(err){
            return;
        }
        mainWindow.webContents.send('openDoubleClickFile', data, filepath);
        // mainWindow.webContents.send('change-mod',fileNames[0]);
    });
}

function openFile(){
    dialog.showOpenDialog((fileNames) => {
        if(fileNames === undefined){
            console.log("No file selected");
            return;
        }
        filepath = fileNames[0];
        // filename = fileNames[0];
        // console.log(filepath);
        fs.readFile(filepath, 'utf-8', (err, data) => {
            if(err){
                alert("An error ocurred reading the file :" + err.message);
                return;
            }
            mainWindow.webContents.send('openFile', data, filepath);
            // mainWindow.webContents.send('change-mod',fileNames[0]);
        });
    });
}

ipc.on('getProjectPath', function(event){
    event.returnValue = dialog.showOpenDialog(mainWindow, {properties: ['openDirectory']});
})


function openFolder(project_path){

    let structure = {};
    if(project_path == undefined){
        let dir = dialog.showOpenDialog(mainWindow, {properties: ['openDirectory']});
        structure = {
            path : dir[0],
            name : path.basename(dir[0])
        }
    }else{
        structure = {
            path : project_path,
            name : path.basename(project_path)
        }
    }
    mainWindow.webContents.send('openFolder', structure);
    // let dir = dialog.showOpenDialog(mainWindow,{properties : ['openDirectory']});
    // if(dir === undefined){
    //     console.log("No folder selected");
    // }else{
    //     // structure[dir[0]] = [];
    //     structure = dirTree(dir[0]);
    //     // openFolderHelper(dir[0],structure);
    //     // console.log(typeof structure);
    //     // console.log(structure);
    //     mainWindow.webContents.send('openFolder',structure);
    // }
    // console.log()
}

ipc.on('openProjectFromLastSession', function(event, project_path){
    // console.log(project_path);
    openFolder(project_path);
})

ipc.on('createDirectoryForSpecificDirpath', function(event, folderpath){
	// console.log(dirTree(folderpath));
	mainWindow.webContents.send('getDirectroyForSpecificDirpath', dirTree(folderpath));
});

ipc.on('getRemoteDirectoryForSpecificDirpath', function(event, folderpath){
    event.returnValue = dirTree(folderpath);
});

function dirTree(filename) {
    var stats = fs.lstatSync(filename),
        info = {
            path: filename,
            name: path.basename(filename)
        };
    // console.log(stats);
    let files = fs.readdirSync(filename);
    let temp_str = [];
    files.forEach(function(file){
    	temp_str.push({
			path : path.join(filename, file),
			name : file,
			type : ((fs.lstatSync(path.join(filename, file)).isDirectory()) ? "folder" : "file")
		});
    });
    info.children = temp_str;
    // if (stats.isDirectory()) {
    //     info.type = "folder";
    //     // return dirTree(filename);
    //     // info.children = fs.readdirSync(filename).map(function(child) {
    //     //     return dirTree(path.join(filename,child));
    //     // });
    // } else {
    //     // Assuming it's a file. In real life it could be a symlink or
    //     // something else!
    //     info.type = "file";
    // }
    // console.log(typeof info);
    // console.log(info);
    return info;
}

// function openFolderHelper(dir,structure){
// 	let queue = [];
// 	queue.push(dir);
// 	while(queue.length > 0){
// 		let d = queue.shift();
// 		temp = [];
// 		let files = fs.readdirSync(d);
// 		for(let i = 0; i < files.length; i++){
// 			let pathname = path.join(d,files[i]);
// 			if(fs.statSync(pathname).isDirectory()){
// 				// console.log('dir');	
// 				queue.push(pathname);
// 			}else{
// 				temp.push(pathname);
// 			}
// 		}
// 	}
// 	// return structure;
// 	// let structure = []
// 	// for(let i = 0; i < files.length; i++){
// 	// 	let pathname = path.join(dir,files[i]);
// 	// 	if(fs.statSync(pathname).isDirectory()){
// 	// 		structure[pathname] = openFolderHelper(pathname);
// 	// 	}else{
// 	// 		structure.push(pathname);
// 	// 	}
// 	// }
// 	// return structure;
// 	// files.forEach(function(file){
// 	// 	let pathname = path.join(dir,file);
// 	// 	if(fs.statSync(pathname).isDirectory()){
// 	// 		structure[pathname] = [];
// 	// 		openFolderHelper(pathname,structure[pathname]);
// 	// 	}else{
// 	// 		structure.push(pathname);
// 	// 	}
// 	// });
// 	console.log('Hello');
// 	// return structure;
// }

function newFile(){
    if(filename != undefined) filename = undefined;
    mainWindow.webContents.send('newFile');
}

function save(){
    mainWindow.webContents.send('save');
}

function getCurrentWorkingFile(callback){
    mainWindow.webContents.send('currentWorkingFile')
    ipc.once('getCurrentWorkingFile', function(event, filename){
        // console.log(filename);
        callback(filename);
    })
}

function copyTemplate(filepath){
	// console.log(path.join(getUserDataPath(), 'templates', path.basename(filepath).split('.')[1] + '.template'));
	if(fs.existsSync(path.join(getUserDataPath(), 'templates', path.basename(filepath).split('.')[1] + '.template'))){
		// console.log('template found..');
		return fs.readFileSync(path.join(getUserDataPath(), 'templates', path.basename(filepath).split('.')[1] + '.template'), 'utf-8');
	}else{
		// console.log('template not found...');
		return '';
	}
}

ipc.on('saveRemoteFile', function(event, data, remote_path){
    fs.writeFile(remote_path, data, function(error){
        if(error) {
            event.returnValue = false;
            alert("An error ocurred creating the file "+ err.message);
        }else{
            event.returnValue = true;
        }
    });
})

ipc.on('save-data', function(event,data,filepath){
    // console.log(filepath);
    if(filepath != undefined){
    	if(data == ''){
    		// console.log('data null');
    		data = copyTemplate(filepath);
    	}
    	// console.log('file writing...');
        fs.writeFile(filepath, data, function(error){
            if(error) alert("An error ocurred creating the file "+ err.message);
            mainWindow.webContents.send('data-saved',filepath, data);
        });
    }else{
        dialog.showSaveDialog(function(fileName){
            if(fileName === undefined)return;
            if(data == ''){
	    		data = copyTemplate(fileName);
	    	}
            // filename = fileName
            // console.log(fileName);
            mainWindow.webContents.send('change-mod',fileName);
            fs.writeFile(fileName, data, function(error){
                if(error) alert("An error ocurred creating the file "+ err.message);
                mainWindow.webContents.send('data-saved',fileName, data);
            });
        });
    }
});

function saveAs(){
    mainWindow.webContents.send('saveAs');
}

ipc.on('saveAs-data', function(event, data){
    // console.log(data);
    dialog.showSaveDialog(function(fileName){
        if(fileName === undefined)return;
        filename = fileName
        if(data == ''){
    		data = copyTemplate(fileName);
    	}
        // console.log(fileName);
        mainWindow.webContents.send('change-mod',fileName);
        fs.writeFile(fileName, data, function(error){
            if(error) alert("An error ocurred creating the file "+ err.message);
            mainWindow.webContents.send('data-saved',fileName, data);
        });
    });
});

function closeFile(){
    mainWindow.webContents.send('closeFile');
}

ipc.on('close-app',function(event){
    app.quit();
})

function killProcess (pid, signal, callback) {
    signal   = signal || 'SIGKILL';
    callback = callback || function () {};
    var killTree = true;
    if(killTree) {
        psTree(pid, function (err, children) {
            [pid].concat(
                children.map(function (p) {
                    return p.PID;
                })
            ).forEach(function (tpid) {
                try { process.kill(tpid, signal) }
                catch (ex) { }
            });
            callback();
        });
    } else {
        try { process.kill(pid, signal) }
        catch (ex) { }
        callback();
    }
};



function makeCommand(filepath){
    // console.log(filepath)
    let filename = path.basename(filepath);
    let ext = filename.split('.')[1];
    let currentFileDir = path.join(filepath,'..');
    let command = "cd " + currentFileDir + " && ";
    switch(ext){
        case "py":
            command += 'python ' + filename + ' < input.txt';
            break;
        case "java":
            command += 'javac ' + filename + ' && java ' + filename.split('.')[0] + ' < input.txt';
            break;
        case "c":
            if(process.platform === "win32"){
                command += 'gcc ' + filename + ' -o ' + filename.split('.')[0] + ' && ' + filename.split('.')[0] + '.exe < input.txt';
            }else{
                command += 'gcc ' + filename + ' -o ' + filename.split('.')[0] + ' && ./' + filename.split('.')[0] + ' < input.txt';
            }
            break;
        case "cpp":
            if(process.platform === "win32"){
                command += 'g++ ' + filename + ' -o ' + filename.split('.')[0] + ' && ' + filename.split('.')[0] + '.exe < input.txt';
            }else{
                command += 'g++ ' + filename + ' -o ' + filename.split('.')[0] + ' && ./' + filename.split('.')[0] + ' < input.txt';
            }
            break;
        case "js":
            command += 'node ' + filename + ' < input.txt';
            break;
        case "rb":
            command += 'ruby ' + filename + ' < input.txt';
            break;
        case "pl":
            command += 'perl ' + filename + ' < input.txt';
            break;
        case "cs":
            command += 'csc ' + filename + ' < input.txt';
            break;
        case "php":
            command += 'php ' + filename + ' < input.txt';
            break;
        case "go":
            command += 'go run ' + filename + ' < input.txt';
            break;
        case "s":
            if(process.platform === "win32"){
                command += 'g++ ' + filename + ' -o ' + filename.split('.')[0] + ' && ' + filename.split('.')[0] + '.exe < input.txt';
            }else{
                command += 'g++ ' + filename + ' -o ' + filename.split('.')[0] + ' && ./' + filename.split('.')[0] + ' < input.txt';
            }
            break;
        default:
            command = undefined;
            break;
    }
    return command;
}


ipc.on('runProgram',function(event,input,filepath){
    if(filepath != undefined){//mainWindow.webContents.send('error',"You didn't open or save any file yet");
        // else{
        let command = makeCommand(filepath);
        if(command == undefined) mainWindow.webContents.send('error',"Build system not found for this programming language..");
        else{
            let currentFileDir = path.join(filepath,'..');
            let inputFile = path.join(currentFileDir,'input.txt');
            fs.writeFile(inputFile, input, function(err,data){
                if(err){
                    console.log(err);
                    mainWindow.webContents.send('runProgramStatus',err.message);
                    // console.log(err.message);
                }else{
                    child = exec(command,{maxBuffer: 1024 * 10000} , function(err,stdout,stderr){
                        if(err){
                            console.log(err, 'line 324');
                            killProcess(child.pid);
                            // child.kill();
                            // console.log(child);
                            console.log(err);
                            if(child.killed){
                                err.message = "Process has been killed"
                            }
                            mainWindow.webContents.send('runProgramStatus',err.message);
                            // console.log(err.message.split('\n')[1]);
                        }else{
                            mainWindow.webContents.send('runProgramStatus',stdout);
                            // console.log(stdout);
                        }
                    });
                }
            });
        }
    }
});

ipc.on('stopProgram', function(event){
    if(child){
        child.killed = true;
        killProcess(child.pid);

    }
});

ipc.on('settingsChangeTheme', (event, data)=>{
	let settings_file = fs.readFileSync(path.join(getUserDataPath(), 'settings.json'));
	settings_file = JSON.parse(settings_file);
    settings_file.theme = data;
    // console.log(settings_file);
    settings_file = JSON.stringify(settings_file, null, 2)
    fs.writeFileSync(path.join(getUserDataPath(), 'settings.json'), settings_file);
    // fs.writeFile('../settings.json', settings_file, (error)=>{
    //     if(error)throw error;
    //     console.log("theme changed !", data);
    // });
    mainWindow.webContents.send('themeChanged');
});


ipc.on('getUserDataPath', function(event){
    // let userDataPath = app.getPath('userData');
    // if(! fs.existsSync(path.join(userDataPath, 'last_session'))){
    //     fs.mkdirSync(path.join(userDataPath, 'last_session'));
    //     fs.writeFileSync(path.join(userDataPath, 'last_session', 'info.json'), '{}');
    // }else{
    //     if(! fs.existsSync(path.join(userDataPath, 'last_session', 'info.json'))){
    //         fs.writeFileSync(path.join(userDataPath, 'last_session', 'info.json'), '{}');
    //     }
    // }
    // if(! fs.existsSync(path.join(userDataPath, 'templates'))){
    // 	fs.mkdirSync(path.join(userDataPath,'templates'));
    // }
    event.returnValue = getUserDataPath();
});

function getUserDataPath(){
	let userDataPath = app.getPath('userData');
	let settings_default = {
		  "theme": "one-dark.css",
		  "editor": {
		    "autoCloseBrackets": true,
		    "autoCloseTags": true,
		    "foldGutter": true,
		    "indentWithTabs": true,
		    "lineNumbers": true,
		    "lineWrapping": true,
		    "matchBrackets": true,
		    "showTrailingSpace": true,
		    "styleActiveLine": true,
		    "tabSize": 4,
        	"indentUnit": 4
		  },
          "discord":{
            "discord-rpc-enable":false,
            "discord-status":"I am new to colon"
          }
		}
	settings_default = JSON.stringify(settings_default, null, 2);
	if(! fs.existsSync(path.join(userDataPath, 'settings.json'))){
		fs.writeFileSync(path.join(userDataPath, 'settings.json'), settings_default);
	}
    if(! fs.existsSync(path.join(userDataPath, 'last_session'))){
        fs.mkdirSync(path.join(userDataPath, 'last_session'));
        fs.writeFileSync(path.join(userDataPath, 'last_session', 'info.json'), '{}');
        fs.writeFileSync(path.join(userDataPath, 'last_session', 'project_info.json'), '{}');
    }else{
        if(! fs.existsSync(path.join(userDataPath, 'last_session', 'info.json'))){
            fs.writeFileSync(path.join(userDataPath, 'last_session', 'info.json'), '{}');
        }
        if(! fs.existsSync(path.join(userDataPath, 'last_session', 'project_info.json'))){
            fs.writeFileSync(path.join(userDataPath, 'last_session', 'project_info.json'), '{}');
        }
    }
    if(! fs.existsSync(path.join(userDataPath, 'templates'))){
    	fs.mkdirSync(path.join(userDataPath,'templates'));
    }
    return userDataPath;
}


ipc.on('saveEditorSettings', function(event, editor_settings){
	let settings_file = fs.readFileSync(path.join(getUserDataPath(), 'settings.json'));
	settings_file = JSON.parse(settings_file);
	settings_file.editor = editor_settings;
	settings_file = JSON.stringify(settings_file, null, 2)
    fs.writeFileSync(path.join(getUserDataPath(), 'settings.json'), settings_file);
    mainWindow.webContents.send('editorSettingsSaved');
})

ipc.on('saveDiscordSettings', function(event, discord_settings){
    let settings_file = fs.readFileSync(path.join(getUserDataPath(), 'settings.json'));
    settings_file = JSON.parse(settings_file);
    settings_file.discord = discord_settings;
    settings_file = JSON.stringify(settings_file, null, 2)
    fs.writeFileSync(path.join(getUserDataPath(), 'settings.json'), settings_file);
    mainWindow.webContents.send('discordSettingsSaved');
})


function createTemplate(file_ext){
	mainWindow.webContents.send('openFile', '', path.join(getUserDataPath(),'templates' , file_ext + '.template'));
	// openFileFromSidebar(path.join(getUserDataPath(), file_ext + '.template'));
}

function openTemplate(file_ext){
	openFileFromSidebar(path.join(getUserDataPath(),'templates', file_ext + '.template'));
}

ipc.on('checkForUpdates',function(event){
    autoUpdater.checkForUpdates();
});

ipc.on('downloadUpdate', function(event){
    autoUpdater.downloadUpdate();
});

ipc.on('installUpdate', function (event){
    autoUpdater.quitAndInstall();
});

function toggleCommentIndented(){
    mainWindow.webContents.send('toggleCommentIndented');
}

function Indent(){
    mainWindow.webContents.send('Indent');
}
function indentLess(){
    mainWindow.webContents.send('indentLess');
}
function swapLineUp(){
    mainWindow.webContents.send('swapLineUp');
}
function swapLineDown(){
    mainWindow.webContents.send('swapLineDown');
}

function duplicateLine(){
    mainWindow.webContents.send('duplicateLine');
}
function deleteLine(){
    mainWindow.webContents.send('deleteLine');
}
function joinLines(){
    mainWindow.webContents.send('joinLines');
}
function insertLineBefore(){
    mainWindow.webContents.send('insertLineBefore');
}
function insertLineAfter(){
    mainWindow.webContents.send('insertLineAfter');
}
function transposeChars(){
    mainWindow.webContents.send('transposeChars');
}
function setSublimeMark(){
    mainWindow.webContents.send('setSublimeMark');
}
function selectToSublimeMark(){
    mainWindow.webContents.send('selectToSublimeMark');
}
function deleteToSublimeMark(){
    mainWindow.webContents.send('deleteToSublimeMark');
}
function swapWithSublimeMark(){
    mainWindow.webContents.send('swapWithSublimeMark');
}
function clearSublimeMark(){
    mainWindow.webContents.send('clearSublimeMark');
}
function fold(){
    mainWindow.webContents.send('fold');
}
function unflod(){
    mainWindow.webContents.send('unflod');
}
function upcaseAtCursor(){
    mainWindow.webContents.send('upcaseAtCursor');
}
function downcaseAtCursor(){
    mainWindow.webContents.send('downcaseAtCursor');
}
function wrapLines(){
    mainWindow.webContents.send('wrapLines');
}
function sortLines(){
    mainWindow.webContents.send('sortLines');
}
function sortLinesInsensitive(){
    mainWindow.webContents.send('sortLinesInsensitive');
}
function splitSelectionByLine(){
    mainWindow.webContents.send('splitSelectionByLine');
}
function addCursorToPrevLine(){
    mainWindow.webContents.send('addCursorToPrevLine');
}
function addCursorToNextLine(){
    mainWindow.webContents.send('addCursorToNextLine');
}
function singleSelectionTop(){
    mainWindow.webContents.send('singleSelectionTop');
}
function find(){
    mainWindow.webContents.send('find');
}
function findNext(){
    mainWindow.webContents.send('findNext');
}
function findPrev(){
    mainWindow.webContents.send('findPrev');
}
function findIncremental(){
    mainWindow.webContents.send('findIncremental');
}
function findIncrementalReverse(){
    mainWindow.webContents.send('findIncrementalReverse');
}function replace(){
    mainWindow.webContents.send('replace');
}
function findUnder(){
    mainWindow.webContents.send('findUnder');
}
function selectNextOccurrence(){
    mainWindow.webContents.send('selectNextOccurrence');
}
function goSubwordLeft(){
    mainWindow.webContents.send('goSubwordLeft');
}
function goSubwordRight(){
    mainWindow.webContents.send('goSubwordRight');
}
function jumpToLine(){
    mainWindow.webContents.send('jumpToLine');
}
function goToBracket(){
    mainWindow.webContents.send('goToBracket');
}
function openConsole(){
    mainWindow.webContents.send('openConsole');
}

function openHtmlPreview(){
    mainWindow.webContents.send('openHtmlPreview');
}
function openProjectStructure(){
    mainWindow.webContents.send('openProjectStructure');
}
function checkForUpdates(){
    // isUpdatCallFromMenu = true;
    autoUpdater.checkForUpdates();
}
function increaseFontSize(){
    mainWindow.webContents.send('increaseFontSize');
}
function decreaseFontSize(){
    mainWindow.webContents.send('decreaseFontSize');
}

function openMarkdownPreview(){
    mainWindow.webContents.send('openMarkdownPreview');
}
function changeTheme(){
    mainWindow.webContents.send('changeTheme');
}
function openAbout(){
    mainWindow.webContents.send('openAbout');
}

function refreshPreview(){
    mainWindow.webContents.send('refreshPreview');
}



module.exports = {
    refreshPreview : refreshPreview,
    openDoubleClickFile:openDoubleClickFile,
    openFile : openFile,
    openFolder : openFolder,
    newFile : newFile,
    save : save,
    saveAs : saveAs,
    closeFile : closeFile,
    Indent : Indent,
    indentLess : indentLess,
    swapLineUp : swapLineUp,
    swapLineDown : swapLineDown,
    duplicateLine : duplicateLine,
    deleteLine : deleteLine,
    joinLines : joinLines,
    insertLineBefore : insertLineBefore,
    insertLineAfter : insertLineAfter,
    transposeChars : transposeChars,
    setSublimeMark : setSublimeMark,
    selectToSublimeMark : selectToSublimeMark,
    deleteToSublimeMark : deleteToSublimeMark,
    swapWithSublimeMark : swapWithSublimeMark,
    clearSublimeMark : clearSublimeMark,
    fold : fold,
    unflod : unflod,
    upcaseAtCursor : upcaseAtCursor,
    downcaseAtCursor : downcaseAtCursor,
    wrapLines : wrapLines,
    sortLines : sortLines,
    sortLinesInsensitive : sortLinesInsensitive,
    splitSelectionByLine : splitSelectionByLine,
    addCursorToPrevLine : addCursorToPrevLine,
    addCursorToNextLine : addCursorToNextLine,
    singleSelectionTop : singleSelectionTop,
    find : find,
    findNext : findNext,
    findPrev : findPrev,
    findIncremental : findIncremental,
    findIncrementalReverse : findIncrementalReverse,
    replace : replace,
    findUnder : findUnder,
    selectNextOccurrence : selectNextOccurrence,
    goSubwordLeft : goSubwordLeft,
    goSubwordRight : goSubwordRight,
    jumpToLine : jumpToLine,
    goToBracket : goToBracket,
    openConsole : openConsole,
    openHtmlPreview : openHtmlPreview,
    openMarkdownPreview : openMarkdownPreview,
    openProjectStructure : openProjectStructure,
    changeTheme:changeTheme,
    checkForUpdates : checkForUpdates,
    increaseFontSize : increaseFontSize,
    decreaseFontSize : decreaseFontSize,
    openAbout : openAbout,
    createTemplate : createTemplate,
    getUserDataPath : getUserDataPath,
    openTemplate : openTemplate,
    getCurrentWorkingFile : getCurrentWorkingFile
}