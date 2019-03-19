const code_sharing = require('../assets/js/code_sharing.js');
const last_session = require('../assets/js/last_session.js');

// require('../node_modules/xterm/lib/addons/fullscreen.js');

const ipc = require('electron').ipcRenderer;
const {dialog} = require('electron').remote;
window.$ = window.jQuery = require('../assets/js/jquery.js');
const showdown  = require('showdown');
const fs = require('fs');
const markdown_converter = new showdown.Converter();
const path = require('path');
var files = {};
var newFileCount = 1;
var download_progress;
var userDataPath;
let settings_file = fs.readFileSync(path.join(getUserDataPath(), 'settings.json'));
settings_file = JSON.parse(settings_file);

if(settings_file.theme) changeCSS('../src/editor/theme/' + settings_file.theme, 1);
// console.log((settings_file.theme) ? settings_file.theme : 'one-dark');

// editor initialisation 

function initEditor(editor_id){

    let configuration = {
        // lineNumbers: true,
        theme: (settings_file.theme)? settings_file.theme.split('.')[0] : 'one-dark',
        // styleActiveLine: true,
        keyMap: "sublime",
        // lineWrapping: true,
        // foldGutter: true,
        // autoCloseBrackets: true,
        // autoCloseTags: true,
        // showTrailingSpace: true,
        // matchBrackets: true,
        mode:'text/text',
        gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"],
        extraKeys: {"Ctrl-Space": "autocomplete","Ctrl-Q": function(cm){ cm.foldCode(cm.getCursor()); }},
        highlightSelectionMatches: {annotateScrollbar: true},
        // hintOptions: {hint: synonyms},
        scrollbarStyle: "simple"
        // indentWithTabs: true
    };
    for(let i in settings_file.editor){
        configuration[i] = settings_file.editor[i];
        // editor.setOption(i, settings_file.editor[i]);
    }
    let editor = CodeMirror.fromTextArea(editor_id, configuration);

    editor.focus();
    editor.on("keyup", function (cm, event) {
        // console.log(event);
        // console.log(CodeMirror.hint);
        // console.log(cm);
        // console.log(editor);
        if (!cm.state.completionActive && event.keyCode != 13 && event.keyCode != 9 && event.keyCode != 16 && event.keyCode != 37 && event.keyCode != 38 && event.keyCode != 39 && event.keyCode != 40 && event.keyCode != 219 && event.keyCode != 221 && event.keyCode != 57 && event.keyCode != 48 && event.keyCode != 186 && event.keyCode != 27 && event.keyCode != 8 && event.keyCode != 32 && event.keyCode != 17) {
            // console.log('Hello');
            // console.log(CodeMirror.commands);
            CodeMirror.commands.autocomplete(cm, null, {completeSingle: false});
        }
    });
    return editor;
}

// get userData path

function getUserDataPath(){
    if(! userDataPath) userDataPath = ipc.sendSync('getUserDataPath');
    // return ipc.sendSync('getUserDataPath');
    return userDataPath;
}


// auto mod selector
// var editor = "";
CodeMirror.modeURL = "../src/editor/mode/%N/%N.js";
// var editor = "";
// var file = "";
var editor;

// checking is last session already there ?
last_session.checkLastSessionProjectAndOpen()
last_session.checkLastSessionFilesAndOpen();

// checking is last session already there end here


ipc.on('openDoubleClickFile', function(event,data,filepath){
    // console.log(data,filepath);
    editor.setValue(data);
    file.path = filepath;
    file.name = path.basename(filepath);
});
// var editor = initEditor(document.getElementById('file_new1'));
// addPanel('bottom',editor, 'new1');
// files['#new'+newFileCount] = {
// 		path: undefined,
// 		name: "untitled",
// 		id: "new"+newFileCount,
// 		editor: editor
// 	}
// var file = files['#new1'];
// var editor1 = initEditor('code1')

ipc.on('currentWorkingFile', function(event){
    event.sender.send('getCurrentWorkingFile', file.name);
});


function newTab(filepath, filecount ,filename, data, remote_path){
    let file_id = "new" + filecount;
    // if(filepath == undefined){
    // 	file_id = "new"+filecount;
    // }else{
    // 	file_id = filepath;
    // }
    $('#code_mirror_editors').append('<li id = "file_tab_'+file_id+'"><a href="" data-target="#' + file_id + '" role="tab" data-toggle="tab"><span id = "filename_'+file_id+'" onclick = "opentab(this)">' + filename + '</span><span onclick = "closeAnyFile(this)" class="close black"></span></a></li>');
    $('#editors').append('<div class="tab-pane" id = "'+file_id+'"><textarea id="file_'+file_id+'" autofocus></textarea></div>');
    let temp = initEditor(document.getElementById('file_' + file_id));
    temp.setValue(data);
    chagneEditorMode(filename,temp);
    temp.refresh();
    // temp.refresh();
    addPanel('bottom',temp, file_id);
    files['#'+ file_id] = {
        path: filepath,
        name: filename,
        remote_path:remote_path,
        id: file_id,
        editor: temp
    }
    temp.on("change", function() {
        last_session.changeLastSessionFilesContent(file.id, editor.getValue());
        closeToDot();
        // // clearTimeout(delay);
        // updateHtmlPreview();
        // updateMarkdownPreview();
        // setTimeout(updateHtmlPreview, 300);
        // setTimeout(updateMarkdownPreview,300);
    });
    // console.log(data);

    // return editor;
}

// change css

function changeCSS(cssFile, cssLinkIndex) {

    var oldlink = document.getElementsByTagName("link").item(cssLinkIndex);

    var newlink = document.createElement("link");
    newlink.setAttribute("rel", "stylesheet");
    newlink.setAttribute("type", "text/css");
    newlink.setAttribute("href", cssFile);

    document.getElementsByTagName("head").item(0).replaceChild(newlink, oldlink);
}

// Change Theme

function changeTheme(){
    // console.log("Chenge Theme");
    let state = document.getElementById('themeChengePanel').style.display;
    if(state == 'none'){
        document.getElementById('themeChengePanel').style.display = 'block';
    }else {
        document.getElementById('themeChengePanel').style.display = 'none';
    }
}
function setTheme(theme_name){
    // console.log(theme_name);
    changeCSS('../src/editor/theme/' + theme_name, 1);
    ipc.send('settingsChangeTheme',theme_name);   
}

ipc.on('themeChanged', function(event){
    settings_file = fs.readFileSync(path.join(getUserDataPath(), 'settings.json'));
    settings_file = JSON.parse(settings_file);

    $('#themes').children().removeClass('theme-container-active');
    $('#' + settings_file.theme.split('.')[0] + '-theme').addClass('theme-container-active');

    // console.log(files);
    for (i in files){
        files[i].editor.setOption("theme", settings_file.theme.split('.')[0]);
        // files[i].editor.refresh();
        // console.log(files[i].editor);
    }
    // file.editor.setOption('theme', settings_file.theme.split('.')[0]);
    // file.editor.refresh();
    // editor.refresh();
});

// check is file already opened

function isFileAlreadyOpened(filepath){
    for(i in files){
        if(files[i].path == filepath && filepath != undefined) return true;
    }
    return false;
}

// end here

// get File ID from filepath

function getFileID(filepath){
    for(i in files){
        if(files[i].path == filepath) return files[i].id;
    }
    return undefined;
}

// end here


// Open File

function openFile(data, filepath, filename, remote_path){
    if(isFileAlreadyOpened(filepath)){
        // console.log($('#filename_'+getFileID(filepath)));
        $('#filename_'+getFileID(filepath)).click();
    }else{
        newFileCount++;
        newTab(filepath, newFileCount , (filename != undefined) ? filename : ((filepath == undefined) ? 'untitled': path.basename(filepath)),data, remote_path);

        //last session

        last_session.makeNewLastSessionFile(newFileCount, filepath, data);
        
        // last session end here

        $('#filename_new'+newFileCount).click();
        // files['#'+filepath] = {
        //  path: filepath,
        //  name: path.basename(filepath),
        //  id: filepath,
        //  editor: editor
        // }
        // // console.log('Hello')
        // editor.getDoc().setValue(data);
        }
}


ipc.on('openFile',function(event, data, filepath){
    openFile(data,filepath);
})


// close current file

function findNextFile(deleted_file_count){
    for(let i = deleted_file_count + 1; i <= newFileCount; i++){
        let key = '#new' + i;
        if(files.hasOwnProperty(key)) return i;
    }
    for(let i = deleted_file_count - 1; i > 0; i--){
        let key = '#new' + i;
        if(files.hasOwnProperty(key)) return i;
    }
    return undefined;
}

function closeAnyFile(button){
    // console.log($(button).parent().data('target'));
    closeCurrentFile(files[$(button).parent().data('target')]);
}

function closeCurrentFile(file){
    let filecount = parseInt(file.id.split('new')[1]);
    // console.log(nextFile);
    let nextfilecount = findNextFile(filecount);

    // delete file from last session

    last_session.deleteLastSessionFile(file.id);

    // delete file from last session end here

    if(nextfilecount != undefined){

        // console.log(filecount);

        $('#file_tab_' + file.id).remove();
        $('#'+ file.id).remove();
        delete files['#'+file.id];
        let nextFile = '#new' + nextfilecount;
        file = files[nextFile];
        editor = file.editor;
        // console.log($('#filename_' + nextFile.split('#')[1]).parent());
        $('#filename_' + nextFile.split('#')[1]).click();
    }else{
        // console.log(files['#' + file.id].filepath, files);
        if(files['#' + file.id].path != undefined){
            $('#file_tab_' + file.id).remove();
            $('#'+ file.id).remove();
            delete files['#'+file.id];
            newFile();
        }
        // ipc.send('close-app');
    }
    // console.log(files.hasOwnProperty(nextFile));
}

ipc.on('closeFile',function(event){
    closeCurrentFile(file);
});

// generate valid ID from path

function pathToId(filepath){
    filepath = filepath.replace(/ /g, '_');
    filepath = filepath.replace(/:/g, '');
    let tokens = filepath.split(path.sep);
    let ID = '';
    for(let i = 0; i < tokens.length; i++){
        ID += tokens[i];
    }
    // console.log(ID);
    return ID;
}



// open folder

function openFolder(structure){
    
    let response = '<ul class="file-tree" ><li><a href="#"><span class = "label" onclick = "createDirectoryForSpecificDirpath(this)" data-path = "' + structure.path + '">' + structure.name + '</span></a><ul id = "' + pathToId(structure.path) + '"></ul>';
    $('#project-structure').html(response);
    // console.log($('#project-structure'));
    $(".file-tree").filetree();
    openProjectStructure(true);

    last_session.openLastSessionFolders();
    if(!code_sharing.remote_mode)
        last_session.newLastSessionForProject(structure.path);
}

ipc.on('openFolder', function(event,structure){
    code_sharing.remote_mode = false;
    openFolder(structure);
});

// create directory for specific Dirpath


function createDirectoryForSpecificDirpath(folder, remote){
    if(remote){
        return ipc.sendSync('getRemoteDirectoryForSpecificDirpath', folder);
    }else{
        if(code_sharing.remote_mode){
            code_sharing.getRemoteDirectoryForSpecificDirpath(folder.getAttribute('data-path'));
        }else{
            ipc.send('createDirectoryForSpecificDirpath', folder.getAttribute('data-path'));
        }
    }
}

ipc.on('getDirectroyForSpecificDirpath', function(event, structure){
    openSpecificDirectory(structure);
});

function openSpecificDirectory(dir_structure){
    $('#' + pathToId(dir_structure.path)).html(makeDirectoryTree(dir_structure.children));
    $('#' + pathToId(dir_structure.path)).filetree();
    last_session.updateOpenFolderInProjectInfo(pathToId(dir_structure.path));
}
// create tree structure for opened folder

function makeDirectoryTree(structure){
    var response = "";
    structure.forEach(function(obj){
        if(obj.type == "folder"){
            // response += '<li><a href="#"><span class = "label">'+ obj.name + '</span></a><ul>' + makeDirectoryTree(obj.children) + '</ul></li>';
            response += '<li><a href="#"><span class = "label" onclick = "createDirectoryForSpecificDirpath(this)" data-path = "' + obj.path + '">'+ obj.name + '</span></a><ul id = "' + pathToId(obj.path) + '"></ul></li>';
        }else{
            response += '<li data-extension = "'+obj.name+'"><a href="#"><span onclick = "openFileFromSidebar(this)" class = "label" data-name = "'+ obj.name +'" data-path = "'+ obj.path +'">' + obj.name + '</span></a></li>';
        }
    });
    return response;
}


function openFileFromSidebar(file, remote){
    if(remote){
        console.log(file);
        return ipc.sendSync('openRemoteFile', file);
    }else{
        let filepath = file.getAttribute('data-path');
        if(code_sharing.remote_mode){
            code_sharing.openRemoteFile(filepath);
        }else{
            ipc.send('openFileFromSidebar', filepath);
        }
    }
}

// // copy template to new opened file

// function copyTemplate(){

// }


// new File
function newFile(){
    newFileCount ++;
    newTab(undefined , newFileCount , 'untitled', '');

    // new file entry in last session

    last_session.makeNewLastSessionFile(newFileCount, undefined, '');

    // new file entry in last session end here

    $('#filename_new'+newFileCount).click();
}

ipc.on('newFile',function(event){
    newFile();
    // editor.getDoc().setValue('');
})

ipc.on('saveAs', function(event){
    if(editor != undefined){
        var data = editor.getValue();
        // console.log(data);

        // update file in last session

        last_session.changeLastSessionFilesContent(file.id, data);

        //update file in last session end here
        ipc.send('saveAs-data', data);
    }
})


function saveFile(data, filepath, remote){
    //update file in last session end here
    if(remote){
        return ipc.sendSync('saveRemoteFile', data, filepath);
    }else{
        ipc.send('save-data', data, filepath);
    }
}

ipc.on('save', function(event){
    if(editor != undefined){
        let data = editor.getValue();
        last_session.changeLastSessionFilesContent(file.id, data);
        if(file.remote_path){
            code_sharing.saveRemoteFile(data, file.remote_path);
        }else{
            saveFile(data, file.path);
        }
    }
});

ipc.on('data-saved',function(event,filepath, data){
    file.path = filepath;
    file.name = path.basename(filepath);
    // console.log(file);
    if(file.editor.getValue() == ''){
        file.editor.setValue(data);
        file.editor.refresh();
    }

    // update original path of file in last session

    last_session.updateLastSessionFilePath(file.id, file.path);

    // update original path of file in last session end here

    // console.log('Hello');
    dotToClose();
})

// change mod automatically

function chagneEditorMode(filename, current_editor){
    // console.log(event,filename);
    var val = filename, m, mode, spec;
    // console.log(val)
    if (m = /.+\.([^.]+)$/.exec(val)) {
        // console.log(m);
        var info = CodeMirror.findModeByExtension(m[1]);
        if (info) {
            mode = info.mode;
            spec = info.mime;
        }
    } else if (/\//.test(val)) {
        var info = CodeMirror.findModeByMIME(val);
        if (info) {
            mode = info.mode;
            spec = val;
        }
    } else {
        mode = spec = val;
    }
    if (mode && mode != 'untitled') {
        current_editor.setOption("mode", spec);
        CodeMirror.autoLoadMode(current_editor, mode);
        // console.log(editor.getOption('mode'));
        // document.getElementById("modeinfo").textContent = spec;
    } else {
        current_editor.setOption("mode", "text/text");
    }
}

ipc.on('change-mod', function(event, filename){
    chagneEditorMode(filename, editor);
})

// for creating panels

function makePanel(where,file_id,editor) {
    var node = document.createElement("div");
    var widget, close, label;

    node.id = "footer_" + file_id;
    node.className = "footer panel " + where;
    left = node.appendChild(document.createElement("div"));
    left.className = "left";
    label = left.appendChild(document.createElement("span"));
    label.className = 'label';
    label.textContent = "Line : ";
    line = label.appendChild(document.createElement("span"));
    line.id = "line"
    label2 = left.appendChild(document.createElement("span"));
    label2.className = 'label';
    label2.textContent = "Column : ";
    column = label2.appendChild(document.createElement("span"));
    column.id = "column";
    right = node.appendChild(document.createElement("div"));
    right.className = "right";
    label = right.appendChild(document.createElement("span"));
    label.className = "label"
    label.textContent = "Tab Size : " + editor.options.tabSize;
    tabsize = label.appendChild(document.createElement("span"));
    tabsize.id = "tabsize";
    label = right.appendChild(document.createElement("span"));
    label.className = "label";
    label.id = "mode";
    return node;
}
function addPanel(where,editor,file_id) {
    var node = makePanel(where,file_id,editor);
    editor.addPanel(node, {position: where, stable: true});
}


// check where curson is and what is the current mod of editor

setInterval(function(){
    if(editor != undefined){
        line = editor.getCursor().line;
        column = editor.getCursor().ch;
        $('#filename_' + file['id']).html(file.name);
        $('#footer_' + file['id'] ).find('#line').html(line + 1);
        $('#footer_' + file['id'] ).find('#column').html(column + 1);
        // document.getElementById('line').innerHTML = line + 1;
        // document.getElementById('column').innerHTML = column + 1;
        let temp = editor.options.mode.split('/')[1];
        // console.log(temp);
        if(temp != undefined && temp.indexOf('-') > -1){
            temp = temp.split('-')[1];
        }
        $('#footer_' + file['id'] ).find('#mode').html(temp);
        // document.getElementById('mode').innerHTML = temp ;
    }
    xterm.fit();
},100);

// trigger left side-bar

$(".panel-left").resizable({
    handleSelector: ".splitter",
    resizeHeight: false
});


$(".panel-middle").resizable({
    handleSelector: ".splitter2",
    resizeHeight: false
});

// create directory tree structure


// $(document).ready(function() {
//     $(".file-tree").filetree();
// });
// var _gaq = _gaq || [];
// _gaq.push(['_setAccount', 'UA-36251023-1']);
// _gaq.push(['_setDomainName', 'jqueryscript.net']);
// _gaq.push(['_trackPageview']);

// (function() {
//     var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
//     ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
//     var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
// })();

// run program
function run(){
    var data = editor.getValue();
    // console.log(file.path);
    ipc.send('save-data', data, file.path);
    let input = $('#input').val();
    ipc.send('runProgram',input,file.path);
    $('.run-button').addClass('hide');
    $('.stop-button').removeClass('hide');
}

function stop(){
    ipc.send('stopProgram');
}

ipc.on('runProgramStatus',function(event,output){
    $('#output').html(output);
    $('.run-button').removeClass('hide');
    $('.stop-button').addClass('hide');
});

// error dialog

ipc.on('error', function(event, message){
    dialog.showErrorBox('Error',message);
});

// save settings

//save editor settings

function saveEditorSettings(){
    let editor_settings_temp = $('#editor').children();
    let editor_settings = {};
    for(let i = 0; i < editor_settings_temp.length; i ++){
        if(editor_settings_temp[i].getAttribute('for')){
            // console.log(editor_settings_temp[i].getAttribute('for'))
            // console.log(editor_settings_temp[i]);
            // editor_settings[$('#' + editor_settings_temp[i].getAttribute('for')).attr('id')] = $('#' + editor_settings_temp[i].getAttribute('for')).is(':checked');
            if($('#' + editor_settings_temp[i].getAttribute('for')).attr('type') == 'checkbox'){
                editor_settings[editor_settings_temp[i].getAttribute('for')] = $('#' + editor_settings_temp[i].getAttribute('for')).is(':checked');
            }else if($('#' + editor_settings_temp[i].getAttribute('for')).attr('type') == 'number'){
                // console.log('Hello');
                // console.log(parseInt($('#' + editor_settings_temp[i].getAttribute('for')).val()));
                editor_settings[editor_settings_temp[i].getAttribute('for')] = parseInt($('#' + editor_settings_temp[i].getAttribute('for')).val());
            }
            // console.log($('#' + editor_settings_temp[i].getAttribute('for')).is(':checked'));
        }
    }
    // console.log(editor_settings);

    ipc.send('saveEditorSettings', editor_settings);
}

ipc.on('editorSettingsSaved', function(event){
    let settings_file = fs.readFileSync(path.join(getUserDataPath(), 'settings.json'));
    settings_file = JSON.parse(settings_file);
    for(let i in files){
        for(let j in settings_file.editor){
            files[i].editor.setOption(j,settings_file.editor[j]);
            files[i].editor.refresh();
        }
    }
});

// end here


// save discord settings

function saveDiscordSettings(){
    let discord_settings_temp = $('#discord-rpc').children();
    let discord_settings = {};
    for(let i = 0; i < discord_settings_temp.length; i ++){
        if(discord_settings_temp[i].getAttribute('for')){
            if($('#' + discord_settings_temp[i].getAttribute('for')).attr('type') == 'checkbox'){
                discord_settings[discord_settings_temp[i].getAttribute('for')] = $('#' + discord_settings_temp[i].getAttribute('for')).is(':checked');
            }else if($('#' + discord_settings_temp[i].getAttribute('for')).attr('type') == 'text'){
                discord_settings[discord_settings_temp[i].getAttribute('for')] = $('#' + discord_settings_temp[i].getAttribute('for')).val();
                // console.log($('#discord-status').val())
            }
        }
    }
    // console.log(discord_settings);

    ipc.send('saveDiscordSettings', discord_settings);
}

ipc.on('discordSettingsSaved', function(event){
    console.log('discord settings saved');
});


function renderHTMLFileAndOpen(filename){
	if(isFileAlreadyOpened(path.join(__dirname, filename))){
        $('#filename_'+getFileID(path.join(__dirname, filename))).click();
    // console.log('jello');
    }else{
        newFileCount++;
        let file_id = "new" + newFileCount;
        fs.readFile(path.join(__dirname, filename), function(err,data){
            if(err) console.log(err);
            $('#code_mirror_editors').append('<li id = "file_tab_'+file_id+'"><a href="" data-target="#' + file_id + '" role="tab" data-toggle="tab"><span id = "filename_'+file_id+'" onclick = "opentab(this)">' + filename.split('.')[0] + '</span><span onclick = "closeAnyFile(this)" class="close black"></span></a></li>');
            $('#editors').append('<div class="tab-pane" id = "'+file_id+'">'+data+'</div>');
            files['#'+ file_id] = {
                path: path.join(__dirname, filename),
                name: undefined,
                id: file_id,
                editor: undefined
            }
            $('#filename_new'+newFileCount).click();
        });
    }
}


// open about page

ipc.on('openAbout', function(event){
    renderHTMLFileAndOpen('about.html')
});

// open Terminal

function openTerminal(){
    if($('.settings-panel').css('display') != 'none'){
        openSettingsPanel();
        editor.refresh();
    }
    if($('.terminal-container').css('display') == 'none'){
        $('.panel-middle').css('width', '60%');
        $('.terminal-container').css('display', 'block');
        $('.fa-terminal').addClass('side-nav-button-active');
    }else{
        $('.panel-middle').css('width','100%');
        $('.terminal-container').css('display','none');
        $('.fa-terminal').removeClass('side-nav-button-active');
    }
    $('.html-preview').css('display','none');
    $('.fa-television').removeClass('side-nav-button-active');
    $('.markdown-preview').css('display','none');
    $('.fa-desktop').removeClass('side-nav-button-active');
    $('.update-download-section').css('display','none');
    $('.fa-download').removeClass('side-nav-button-active');
    $('.settings-panel').css('display', 'none');
    $('.fa-cog').removeClass('side-nav-button-active');
    $('.code-sharing-panel').css('display','none');
    $('.fa-share-square-o').removeClass('side-nav-button-active');
    $('.console-container').css('display', 'none');
    $('.fa-play').removeClass('side-nav-button-active');
}

// open console
function openConsole(){
    if($('.settings-panel').css('display') != 'none'){
        openSettingsPanel();
        editor.refresh();
    }
    if($('.console-container').css('display') == 'none'){
        $('.panel-middle').css('width','60%');
        $('.console-container').css('display','block');
        $('.fa-play').addClass('side-nav-button-active');
    }else{
        $('.panel-middle').css('width','100%');
        $('.console-container').css('display','none');
        $('.fa-play').removeClass('side-nav-button-active');
    }
    $('.html-preview').css('display','none');
    $('.fa-television').removeClass('side-nav-button-active');
    $('.markdown-preview').css('display','none');
    $('.fa-desktop').removeClass('side-nav-button-active');
    $('.update-download-section').css('display','none');
    $('.fa-download').removeClass('side-nav-button-active');
    $('.settings-panel').css('display', 'none');
    $('.fa-cog').removeClass('side-nav-button-active');
    $('.code-sharing-panel').css('display','none');
    $('.fa-share-square-o').removeClass('side-nav-button-active');
    $('.terminal-container').css('display', 'none');
    $('.fa-terminal').removeClass('side-nav-button-active');
}

ipc.on('openConsole',function(event){
    openConsole();
});


// open html preview
function openHtmlPreview(){
    if($('.settings-panel').css('display') != 'none'){
        openSettingsPanel();
        editor.refresh();
    }
    if($('.html-preview').css('display') == 'none'){
        $('.panel-middle').css('width','60%');
        $('.html-preview').css('display','block');
        $('.fa-television').addClass('side-nav-button-active');
    }else{
        $('.panel-middle').css('width','100%');
        $('.html-preview').css('display','none');
        $('.fa-television').removeClass('side-nav-button-active');
    }
    $('.console-container').css('display','none');
    $('.fa-terminal').removeClass('side-nav-button-active');
    $('.markdown-preview').css('display','none');
    $('.fa-desktop').removeClass('side-nav-button-active');
    $('.update-download-section').css('display','none');
    $('.fa-download').removeClass('side-nav-button-active');
    $('.settings-panel').css('display', 'none');
    $('.fa-cog').removeClass('side-nav-button-active');
    $('.code-sharing-panel').css('display','none');
    $('.fa-share-square-o').removeClass('side-nav-button-active');
    $('.terminal-container').css('display', 'none');
    $('.fa-terminal').removeClass('side-nav-button-active');
}

ipc.on('openHtmlPreview', function(event){
    openHtmlPreview();
    // $('#preview').html(file.editor.getValue());
});

// open settings panel

function openSettingsPanel(){
    if($('.panel-left').css('display') != 'none'){
        openProjectStructure();
        // editor.refresh();
    }
    if($('.settings-panel').css('display') == 'none'){
        $('.panel-middle').css('display','none');
        $('.settings-panel').css('display','block');
        $('.fa-cog').addClass('side-nav-button-active');
        $('#menu-themes').trigger('click');
        settings_file = fs.readFileSync(path.join(getUserDataPath(), 'settings.json'));
        settings_file = JSON.parse(settings_file);
        $('#themes').children().removeClass('theme-container-active');
        $('#' + settings_file.theme.split('.')[0] + '-theme').addClass('theme-container-active');
        for(let i in settings_file.editor){
            if(settings_file.editor[i] == true){
                $('#' + i).attr('checked','true');
            }else if(settings_file.editor[i] != true && settings_file.editor[i] != false){
                $('#' + i).val(settings_file.editor[i]);
            }
        }
        for(let i in settings_file.discord){
            if(settings_file.discord[i] == true){
                $('#' + i).attr('checked','true');
            }else if(settings_file.discord[i] != true && settings_file.editor[i] != false){
                $('#' + i).val(settings_file.discord[i]);
            }
        }
    }else{
        // editor.refresh();
        $('.panel-middle').css('width','100%');
        $('.panel-middle').css('display','block');
        $('.settings-panel').css('display', 'none');
        $('.fa-cog').removeClass('side-nav-button-active');
    }
    $('.console-container').css('display','none');
    $('.fa-terminal').removeClass('side-nav-button-active');
    $('.html-preview').css('display','none');
    $('.fa-television').removeClass('side-nav-button-active');
    $('.markdown-preview').css('display','none');
    $('.fa-desktop').removeClass('side-nav-button-active');
    $('.update-download-section').css('display','none');
    $('.fa-download').removeClass('side-nav-button-active');
    $('.code-sharing-panel').css('display','none');
    $('.fa-share-square-o').removeClass('side-nav-button-active');
    $('.terminal-container').css('display', 'none');
    $('.fa-terminal').removeClass('side-nav-button-active');
    editor.refresh();
}

// open settings panel end here

// open code sharing panel

function openCodeSharingPanel(){
    if($('.settings-panel').css('display') != 'none'){
        openSettingsPanel();
        editor.refresh();
    }
    if($('.code-sharing-panel').css('display') == 'none'){
        $('.panel-middle').css('width','60%');
        $('.code-sharing-panel').css('display','block');
        $('.fa-share-square-o').addClass('side-nav-button-active');
    }else{
        $('.panel-middle').css('width','100%');
        $('.code-sharing-panel').css('display','none');
        $('.fa-share-square-o').removeClass('side-nav-button-active');
    }
    $('.console-container').css('display','none');
    $('.fa-terminal').removeClass('side-nav-button-active');
    $('.html-preview').css('display','none');
    $('.fa-television').removeClass('side-nav-button-active');
    $('.markdown-preview').css('display','none');
    $('.fa-desktop').removeClass('side-nav-button-active');
    $('.settings-panel').css('display', 'none');
    $('.fa-cog').removeClass('side-nav-button-active');
    $('.update-download-section').css('display','none');
    $('.fa-download').removeClass('side-nav-button-active');
    $('.terminal-container').css('display', 'none');
    $('.fa-terminal').removeClass('side-nav-button-active');
}

// end here

function isCurrentFileSaved(){
    // if(file.path != undefined) return true
    var data = editor.getValue();
    // console.log(file.path);
    ipc.send('save-data', data, file.path);
    if(file.path != undefined) return true;
    else return false;
}


// open update download section

function openUpdateDownloadSection(){
    if($('.settings-panel').css('display') != 'none'){
        openSettingsPanel();
        editor.refresh();
    }
    if($('.update-download-section').css('display') == 'none'){
        $('.panel-middle').css('width','60%');
        $('.update-download-section').css('display','block');
        $('.fa-download').addClass('side-nav-button-active');
    }else{
        $('.panel-middle').css('width','100%');
        $('.update-download-section').css('display','none');
        $('.fa-download').removeClass('side-nav-button-active');
    }
    $('.console-container').css('display','none');
    $('.fa-terminal').removeClass('side-nav-button-active');
    $('.html-preview').css('display','none');
    $('.fa-television').removeClass('side-nav-button-active');
    $('.markdown-preview').css('display','none');
    $('.fa-desktop').removeClass('side-nav-button-active');
    $('.settings-panel').css('display', 'none');
    $('.fa-cog').removeClass('side-nav-button-active');
    $('.code-sharing-panel').css('display','none');
    $('.fa-share-square-o').removeClass('side-nav-button-active');
    $('.terminal-container').css('display', 'none');
    $('.fa-terminal').removeClass('side-nav-button-active');
}


ipc.on('openUpdateDownloadSection', function(event){
    openUpdateDownloadSection();
});

// open update download section end here

// check for updates

function checkForUpdates(){
    ipc.send('checkForUpdates');
    if($('#update-error')) $('#update-error').remove();
    $('#check-for-update').text('Checking For Updates..');
}

ipc.on('updateAvailable', function(event, version){
    $('#update-badge').removeClass('hide');
    $('#update-section-box').empty();
    $('#update-section-box').append('<p id = "update-version">Update Available ' + version + '</p><br>');
    $('#update-section-box').append('<button id = "download-button" class="btn" onclick = "downloadUpdate()">Download</button>');
})

function downloadUpdate(){
    ipc.send('downloadUpdate');
    $('#update-section-box').empty();
    $('#update-section-box').append('<p id = "downloading">Downloading..</p>');
    $('#update-section-box').append('<div id = "download_bar" style = "width:200px; height:50px;" class = "ldBar" data-preset = "rainbow" data-value = "0"></div>');
    download_progress = new ldBar("#download_bar");
}

ipc.on('updateNotAvailable', function(event){
    $('#update-badge').addClass('hide');
    $('#check-for-update').remove();
    $('#update-section-box').append('<p>Current version is up-to-date.</p>');

});

ipc.on('downloadProgress', function(event, percent){
    download_progress.set(percent);
    // console.log(percent);
});

function installUpdate(){
    ipc.send('installUpdate');
}

ipc.on('updateDownloaded', function(event){
    $('#update-section-box').empty();
    $('#update-section-box').append('<button id = "install-update" class = "btn" onclick="installUpdate()">Install</button>');
});

ipc.on('updateError', function (event, error){
    $('#update-section-box').empty();
    $('#update-section-box').append('<p id = "update-error">' + error + '</p><br>');
    $('#update-section-box').append('<button class = "btn" id = "check-for-update" onclick="checkForUpdates()">Retry</button>');
});

// end here


// open markdown preview

function openMarkdownPreview(){
    if($('.settings-panel').css('display') != 'none'){
        openSettingsPanel();
        editor.refresh();
    }
    if($('.markdown-preview').css('display') == 'none'){
        $('.panel-middle').css('width','60%');
        $('.markdown-preview').css('display','block');
        $('.fa-desktop').addClass('side-nav-button-active');
    }else{
        $('.panel-middle').css('width','100%');
        $('.markdown-preview').css('display','none');
        $('.fa-desktop').removeClass('side-nav-button-active');
    }
    $('.console-container').css('display','none');
    $('.fa-terminal').removeClass('side-nav-button-active');
    $('.html-preview').css('display','none');
    $('.fa-television').removeClass('side-nav-button-active');
    $('.update-download-section').css('display','none');
    $('.fa-download').removeClass('side-nav-button-active');
    $('.settings-panel').css('display', 'none');
    $('.fa-cog').removeClass('side-nav-button-active');
    $('.code-sharing-panel').css('display','none');
    $('.fa-share-square-o').removeClass('side-nav-button-active');
    $('.terminal-container').css('display', 'none');
    $('.fa-terminal').removeClass('side-nav-button-active');
}

ipc.on('openMarkdownPreview', function(event){
    openMarkdownPreview();
    // $('#preview').html(file.editor.getValue());
});

// change Theme
ipc.on('changeTheme', function (event) {
    changeTheme();
});

// open project structure

function openProjectStructure(call_from_menu = false){
    if($('.settings-panel').css('display') != "none"){
        openSettingsPanel();
        editor.refresh();
    }
    if($('.panel-left').css('display') == "none"){
        $('.panel-left').css('display','block');
        $('.panel-left').css('width','150px');
        $('.fa-folder-o').addClass('side-nav-button-active');
    }else if($('.panel-left').css('display') == "block" && call_from_menu == false){
        $('.panel-left').css('display','none');
        $('.fa-folder-o').removeClass('side-nav-button-active');
    }
}

ipc.on('openProjectStructure', function(event){
    openProjectStructure();
});

// change dot to close if file has saved
function dotToClose(){
    $('#file_tab_'+file.id).find('.dot').addClass('black');
    $('#file_tab_'+file.id).find('.dot').addClass('close');
    $('#file_tab_'+file.id).find('.dot').removeClass('dot');
}


// change close to do if file not saved
function closeToDot(){
    $('#file_tab_'+file.id).find('.close').removeClass('black');
    $('#file_tab_'+file.id).find('.close').addClass('dot');
    $('#file_tab_'+file.id).find('.close').removeClass('close');
}


ipc.on('refreshPreview', function(event){
    updateHtmlPreview();
    updateMarkdownPreview();
})



function updateHtmlPreview() {
    if(editor != undefined){
        saveFile(editor.getValue(), file.path)
        $('#html-preview').attr('src',`file:///${file.path}`);
    }
}

function updateMarkdownPreview(){
    if(editor != undefined){
        var previewFrame = document.getElementById('markdown-preview');
        var preview =  previewFrame.contentDocument ||  previewFrame.contentWindow.document;
        let Html = markdown_converter.makeHtml(editor.getValue());
        preview.write('<link rel="stylesheet" href="../assets/css/md.css">');
        preview.write(Html);
        preview.close();
    }
}

// Increase or Decrease font size

ipc.on('increaseFontSize', function(event){
    increaseFontSize();
});

ipc.on('decreaseFontSize', function(event){
    decreaseFontSize();
});

function increaseFontSize(){
    let currentFontSize = parseInt($('.CodeMirror').css('font-size').split('px'));
    // console.log(currentFontSize);
    $('.CodeMirror').css('font-size',++currentFontSize);
    editor.refresh();
}

function decreaseFontSize(){
    let currentFontSize = parseInt($('.CodeMirror').css('font-size').split('px'));
    // console.log(currentFontSize);
    $('.CodeMirror').css('font-size',--currentFontSize);
    editor.refresh();
}

// click on tab

function opentab(tab){
    // console.log(tab);
    file = files[$(tab).parent().data('target')];
    editor = file.editor;
    // updateHtmlPreview();
    // updateMarkdownPreview();
    // editor.on("change", function() {
    // 	closeToDot();
    // 	// clearTimeout(delay);
    // 	setTimeout(updateHtmlPreview, 300);
    // 	setTimeout(updateMarkdownPreview,300);
    // });
    if(editor != undefined){
        // editor.refresh();
        setTimeout(function(){
            editor.refresh();
            editor.focus();
        },1);
    }
}

// open settings right panel

function openSettingsRightPanel(menu){
    $('.right-settings-panel').children().css('display','none');
    $('#menu').children().removeClass('menu-active');
    $('#' + menu).css('display', 'block');
    $('#menu-' + menu).addClass('menu-active');
}

// end here

require('../assets/js/terminal.js')