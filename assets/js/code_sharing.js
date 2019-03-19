var server = require('http').createServer();
var io = require('socket.io')(server);
var localtunnel = require('localtunnel');
const io_client = require('socket.io-client');
var socket;
var clients = [];
var remoteFile;
var remote_mode = false;

function shareCode(file, project_path){
    // if(isCurrentFileSaved()){
        $('#code-sharing-box').html('<h5>Waiting...</h5>');
        server.listen(4000, function(){
            // console.log('listening at 4000');
            var tunnel = localtunnel(4000, function(err, tunnel) {
                if (err) {
                    // console.log(err);
                    $('#code-sharing-box').html(err);
                }
             
                // the assigned public url for your tunnel
                // i.e. https://abcdefgjhij.localtunnel.me
                $('#code-sharing-box').html('<h5>Share this url with whome you want to share</h5><br>');
                $('#code-sharing-box').append('<h5>' + tunnel.url + '</h5><br>');
                $('#code-sharing-box').append('<button class = "btn" id = "commit-changes-sender" onclick="code_sharing.commitChangesSender()">Commit Changes</button><br><br>');
                $('#code-sharing-box').append('<button class = "btn" id = "disconnect" onclick="code_sharing.disconnect()">Disconnect</button>');
                // console.log(tunnel.url);
            });
            tunnel.on('error', function(err) {
                $('#code-sharing-box').html(err);
            });
        });
        // console.log(file);
        io.on('connection', function (socket) {
            clients.push(socket);
            if(file){
                socket.emit('file', { id: file.id, name:file.name, remote_path:file.path, data:file.editor.getValue() });
            }else{
                socket.emit('project', {path: project_path, name : path.basename(project_path)});
            }
            socket.on('commit-changes', function (data) {
            // console.log('hello');
                if(file.id == data.id && file.path == data.path){
                    file.editor.setValue(data.data);
                    editor.setValue(data.data);
                }
                files['#' + data.id].editor.setValue(data.data);
            });
            socket.on('getRemoteDirectoryForSpecificDirpath', function(folder_path){
                // console.log(folder_path);
                let dir_structure = createDirectoryForSpecificDirpath(folder_path, true);
                // console.log(dir_structure);
                this.emit('directoryStructureForSpecificRemoteDirpath', dir_structure);
            });
            socket.on('getContentOfRemoteFile', function(filepath){
                console.log('filepath')
                let temp_file = openFileFromSidebar(filepath, true);
                console.log(temp_file);
                this.emit('openFile', temp_file);
            });

            socket.on('saveRemoteFile', function(data, remote_path){
                let status = saveFile(data, remote_path, true);
                console.log(status);
            });
        });
    // }
}

function connect(flag){
    if(!flag){
        $('#code-sharing-box').html('<input placeholder = "URL" class = "input-field" id = "url"><br> <br><button class ="btn" onclick = "code_sharing.connect(true)">Connect</button>');
    }else{
        let url = $('#url').val();
        $('#code-sharing-box').html('<h5>Waiting...</h5>');
        socket = io_client(url);
        socket.on('file', function (data) {
            remoteFile = data;
            // newFileCount++;
            // newTab(undefined, newFileCount, path.basename(data.remote_path), data.data);
            openFile(data.data, undefined, data.name, data.remote_path);
            // console.log(data);
            // socket.emit('my other event', { my: 'data' });
            $('#code-sharing-box').html('<button class = "btn" id = "commit_changes" onclick="code_sharing.commitChanges()">Commit Changes</button><br><br>');
            $('#code-sharing-box').append('<button class = "btn" id = "close_socket" onclick="code_sharing.closeSocket()">Close Connection</button>');
        });

        socket.on('project', function(data){
            code_sharing.remote_mode = true;
            // console.log(data);
            openFolder(data);
            // $('#code-sharing-box').html('<button class = "btn" id = "commit_changes" onclick="code_sharing.commitChanges()">Commit Changes</button><br><br>');
            $('#code-sharing-box').html('<button class = "btn" id = "close_socket" onclick="code_sharing.closeSocket()">Close Connection</button>');
        });

        socket.on('directoryStructureForSpecificRemoteDirpath', function(dir_structure){
            console.log(dir_structure);
            openSpecificDirectory(dir_structure);
        });

        socket.on('openFile', function(temp_file){
            openFile(temp_file.data, undefined, temp_file.name, temp_file.filepath);
        });

        socket.on('commit-changes', function(data){
            // console.log('data recieved');
            // console.log(file.remote_path, remoteFile.remote_path);
            if(file.remote_path == remoteFile.remote_path){
                file.editor.setValue(data.data);
                editor.setValue(data.data);
                // console.log('if executed');
            }
            // console.log('after if');
            for(let i = 0; i < files.length; i++){
                if(files[i].remote_path == remoteFile.remote_path){
                    // console.log('file found');
                    files[i].editor.setValue(data.data);
                }
            }
        });
        socket.on('error', function(error){
            $('#code-sharing-box').html(error);
        });
    }
}

function commitChangesSender(){
    for(let i = 0; i < clients.length; i++){
        clients[i].emit('commit-changes', {id:file.id, name:file.name, path:file.path, data:file.editor.getValue()});
    }
}

function commitChanges(){
    socket.emit('commit-changes', {id:remoteFile.id, name:remoteFile.name, path:remoteFile.remote_path, data:file.editor.getValue()});
}

function backAllButtons(){
    $('#code-sharing-box').html('<button class = "btn" id = "share-code" onclick="code_sharing.shareProject()">Share Project</button><br><br><button class = "btn" id = "share-code" onclick="code_sharing.shareCode()">Share Code</button><br><br><button class = "btn" id = "connect" onclick="code_sharing.connect(false)">Connect</button>');
}

function closeSocket(){
    code_sharing.remote_mode = false;
    socket.destroy();
    backAllButtons();
}

function disconnect(){
    server.close();
    backAllButtons();
}

function shareProject(){
    let project_path = ipc.sendSync('getProjectPath');
    // console.log(project_path);
    if(project_path != null){
        shareCode(false, project_path[0]);
    }else{
        code_sharing.remote_mode = false;
    }
    // console.log(code_sharing.remote_mode);
}

function getRemoteDirectoryForSpecificDirpath(folder_path){
    console.log(folder_path);
    socket.emit('getRemoteDirectoryForSpecificDirpath', folder_path);
}

function openRemoteFile(filepath){
    socket.emit('getContentOfRemoteFile', filepath);
}

function saveRemoteFile(data, remote_path){
    socket.emit('saveRemoteFile', data, remote_path);
}

module.exports = {
	shareCode : shareCode,
	connect : connect,
	commitChangesSender : commitChangesSender,
	commitChanges : commitChanges,
	backAllButtons : backAllButtons,
	closeSocket : closeSocket,
	disconnect : disconnect,
    shareProject : shareProject,
    getRemoteDirectoryForSpecificDirpath,
    openRemoteFile : openRemoteFile
}