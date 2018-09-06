const fs = require('fs');
const dialog = require('electron').dialog;
const ipc = require('electron').ipcMain;
const path = require('path');
const util = require('util');
const exec = require('child_process').exec;
// const spawn = require('child_process').spawn;

global.filename = undefined;

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

function openFolder(){

	let structure = {};
	let dir = dialog.showOpenDialog(mainWindow,{properties : ['openDirectory']});
	if(dir === undefined){
		console.log("No folder selected");
	}else{
		// structure[dir[0]] = [];
    	structure = dirTree(dir[0]);
		// openFolderHelper(dir[0],structure);
		// console.log(typeof structure);
		mainWindow.webContents.send('openFolder',structure);
	}
	// console.log()
}

function dirTree(filename) {
    var stats = fs.lstatSync(filename),
        info = {
            path: filename,
            name: path.basename(filename)
        };
 
    if (stats.isDirectory()) {
        info.type = "folder";
        info.children = fs.readdirSync(filename).map(function(child) {
            return dirTree(path.join(filename,child));
        });
    } else {
        // Assuming it's a file. In real life it could be a symlink or
        // something else!
        info.type = "file";
    }
 	// console.log(typeof info);
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

ipc.on('save-data', function(event,data,filepath){
	// console.log(filepath);
	if(filepath != undefined){
		fs.writeFile(filepath, data, function(error){
			if(error) alert("An error ocurred creating the file "+ err.message);
			mainWindow.webContents.send('data-saved',filepath);
		});
	}else{
		dialog.showSaveDialog(function(fileName){
			if(fileName === undefined)return;
			// filename = fileName
			// console.log(fileName);
			mainWindow.webContents.send('change-mod',fileName);
			fs.writeFile(fileName, data, function(error){
				if(error) alert("An error ocurred creating the file "+ err.message);
				mainWindow.webContents.send('data-saved',fileName);
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
		// console.log(fileName);
		mainWindow.webContents.send('change-mod',fileName);
		fs.writeFile(fileName, data, function(error){
			if(error) alert("An error ocurred creating the file "+ err.message);
			mainWindow.webContents.send('data-saved',fileName);
		});
	});
});

function closeFile(){
	mainWindow.webContents.send('closeFile');
}

ipc.on('close-app',function(event){
	app.quit();
})

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
					let child = exec(command,{maxBuffer: 1024 * 500} , function(err,stdout,stderr){
						if(err){
							console.log(err);
							mainWindow.webContents.send('runProgramStatus',err.message);
							// console.log(err.message.split('\n')[1]);
						}else{
							mainWindow.webContents.send('runProgramStatus',stdout);
							// console.log(stdout);
							var to = setTimeout(function(){
							  child.kill();
							}, 2000);
						}
					});
				}
			});
		}
	}
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
	isUpdatCallFromMenu = true;
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
function openAbout(){
	mainWindow.webContents.send('openAbout');
}


module.exports = {
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
	checkForUpdates : checkForUpdates,
	increaseFontSize : increaseFontSize,
	decreaseFontSize : decreaseFontSize,
	openAbout : openAbout
}