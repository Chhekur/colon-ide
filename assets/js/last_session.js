
function checkLastSessionProjectAndOpen(){
	let info = getLastSessionProjectInfo();
	if(Object.keys(info).length > 0){
		ipc.send('openProjectFromLastSession', info.project.path);
	}
}

function openLastSessionFolders(){
	let info = getLastSessionProjectInfo();
	if(Object.keys(info).length > 0){
		for(let i = 0; i < info.project.openedFolders.length; i++){
			$('#' + info.project.openedFolders[i]).parent().children('a').children('span').click();
		}
	}
}

function getLastSessionFilesInfo(){
	let info = fs.readFileSync(path.join(getUserDataPath(), '/last_session/info.json'));  
	info = JSON.parse(info);
	return info;
}

function getLastSessionProjectInfo(){
	let info = fs.readFileSync(path.join(getUserDataPath(), '/last_session/project_info.json'));  
	info = JSON.parse(info);
	return info;
}

function writeLastSessionFilesInfo(data){
	fs.writeFileSync(path.join(getUserDataPath() , '/last_session/info.json'), data);
}

function writeLastSessionProjectInfo(data){
	fs.writeFileSync(path.join(getUserDataPath() , '/last_session/project_info.json'), data);
}

function checkLastSessionFilesAndOpen(){
	info = getLastSessionFilesInfo();
	if(Object.keys(info).length > 0){
	        writeLastSessionFilesInfo('{}');
	    for (let i in info){
	        let data = fs.readFileSync(path.join(getUserDataPath(), info[i].current_path), 'utf-8');
	        openFile(data, info[i].original_path);
	        if('#' + file.id != i){
	            fs.unlinkSync(path.join(getUserDataPath(), info[i].current_path));
	        }
	    }
	}else{
	    newFile();
	}
}

function changeLastSessionFilesContent(fileID, data){
	let info = getLastSessionFilesInfo();
	fs.writeFile(path.join(getUserDataPath(), info['#' + fileID].current_path), data, function(error){
        if(error) throw error;
    });
}

function makeNewLastSessionFile(filecount, filepath, data){
	let info = getLastSessionFilesInfo();
	info['#new' + filecount] = {
		original_path : filepath,
        current_path : path.join('last_session','#new' + filecount)
	}
	fs.writeFile(path.join(getUserDataPath(), info['#new' + filecount].current_path), data, function(error){
        if(error) throw error;
    });
    info = JSON.stringify(info, null, 2);
    writeLastSessionFilesInfo(info);
}

function deleteLastSessionFile(fileID,){
	let info = getLastSessionFilesInfo();
	if(info['#' + fileID]){
        fs.unlinkSync(path.join(getUserDataPath(), info['#' + fileID].current_path));
    }
	delete info['#' + fileID];
	info = JSON.stringify(info, null, 2);
    writeLastSessionFilesInfo(info);
}

function updateLastSessionFilePath(fileID, filepath){
	let info = getLastSessionFilesInfo();
	info['#' + fileID].original_path = filepath;
    info = JSON.stringify(info, null, 2);
    writeLastSessionFilesInfo(info);
}

function newLastSessionForProject(project_path){
	let info = getLastSessionProjectInfo();
	info['project'] = {
		path : project_path,
		openedFolders : []
	}
	info = JSON.stringify(info, null, 2);
	writeLastSessionProjectInfo(info);
}

function updateOpenFolderInProjectInfo(folder_path){
	let info = getLastSessionProjectInfo();
	let index = info.project.openedFolders.indexOf(folder_path);
	if(index > -1){
		info.project.openedFolders.splice(index);
	}else{
		info.project.openedFolders.push(folder_path);
	}
	info = JSON.stringify(info, null, 2);
	writeLastSessionProjectInfo(info);
}

module.exports = {
	checkLastSessionProjectAndOpen : checkLastSessionProjectAndOpen,
	checkLastSessionFilesAndOpen : checkLastSessionFilesAndOpen,
	changeLastSessionFilesContent : changeLastSessionFilesContent,
	makeNewLastSessionFile : makeNewLastSessionFile,
	deleteLastSessionFile : deleteLastSessionFile,
	updateLastSessionFilePath : updateLastSessionFilePath,
	newLastSessionForProject : newLastSessionForProject,
	updateOpenFolderInProjectInfo : updateOpenFolderInProjectInfo,
	openLastSessionFolders : openLastSessionFolders
}