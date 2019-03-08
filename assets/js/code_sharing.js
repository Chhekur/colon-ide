var server = require('http').createServer();
var io = require('socket.io')(server);
var localtunnel = require('localtunnel');
const io_client = require('socket.io-client');
var socket;
var clients = [];

function shareCode(){
    if(isCurrentFileSaved()){
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
          socket.emit('file', { id: file.id, name:file.name, remote_path:file.path, data:file.editor.getValue() });
          socket.on('commit-changes', function (data) {
            // console.log('hello');
            if(file.id == data.id && file.path == data.path){
                file.editor.setValue(data.data);
                editor.setValue(data.data);
            }
            files['#' + data.id].editor.setValue(data.data);
          });
        });
    }
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
    $('#code-sharing-box').html('<button class = "btn" id = "share-code" onclick="code_sharing.shareCode()">Share Code</button><br><br><button class = "btn" id = "connect" onclick="code_sharing.connect(false)">Connect</button>');
}

function closeSocket(){
    socket.destroy();
    backAllButtons();
}

function disconnect(){
    server.close();
    backAllButtons();
}

module.exports = {
	shareCode : shareCode,
	connect : connect,
	commitChangesSender : commitChangesSender,
	commitChanges : commitChanges,
	backAllButtons : backAllButtons,
	closeSocket : closeSocket,
	disconnect : disconnect
}