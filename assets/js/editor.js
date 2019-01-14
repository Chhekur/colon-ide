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
// console.log(getUserDataPath());
let last_session = fs.readFileSync(path.join(getUserDataPath(), '/last_session/info.json'));  
last_session = JSON.parse(last_session);
// console.log(last_session,Object.keys(last_session).length);
if(Object.keys(last_session).length > 0){
        fs.writeFileSync(path.join(getUserDataPath() , '/last_session/info.json'), '{}');
    for (let i in last_session){
        // console.log('i - ', i);
        let data = fs.readFileSync(path.join(getUserDataPath(), last_session[i].current_path), 'utf-8');
        openFile(data, last_session[i].original_path);
        // console.log('file_id - ', '#' + file.id);
        // console.log('#' + file.id, i);
        if('#' + file.id != i){
            fs.unlinkSync(path.join(getUserDataPath(), last_session[i].current_path));
            // let temp_last_session = fs.readFileSync(path.join(getUserDataPath() , '/last_session/info.json'));
            // temp_last_session = JSON.parse(temp_last_session);
            // delete temp_last_session[i];
            // temp_last_session = JSON.stringify(temp_last_session, null, 2);
        }
    }

    // for(i in last_session){
    //     let data = fs.readFileSync(path.join(getUserDataPath(), last_session[i].current_path), 'utf-8');
    //     openFile(data, last_session[i].original_path);
    // }
    // fs.writeFileSync('last_session/info.json','{}');
}else{
    newFile();
    // editor = newTab(undefined , newFileCount , 'untitled', '');
    // var file = files['#new' + newFileCount];
    // $('#filename_new1').click();
}

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

function newTab(filepath, filecount ,filename, data){
    let file_id = "new" + filecount;
    // if(filepath == undefined){
    // 	file_id = "new"+filecount;
    // }else{
    // 	file_id = filepath;
    // }
    $('#code_mirror_editors').append('<li id = "file_tab_'+file_id+'"><a href="" data-target="#' + file_id + '" role="tab" data-toggle="tab"><span id = "filename_'+file_id+'" onclick = "opentab(this)">' + filename + '</span><span onclick = "closeAnyFile(this)" class="close black"></span></a></li>');
    $('#editors').append('<div class="tab-pane" id = "'+file_id+'"><textarea id="file_'+file_id+'"></textarea></div>');
    let temp = initEditor(document.getElementById('file_' + file_id));
    temp.setValue(data);
    chagneEditorMode(filename,temp);
    temp.refresh();
    // temp.refresh();
    addPanel('bottom',temp, file_id);
    files['#'+ file_id] = {
        path: filepath,
        name: filename,
        id: file_id,
        editor: temp
    }
    temp.on("change", function() {
        let last_session = fs.readFileSync(path.join(getUserDataPath(), '/last_session/info.json'));
        last_session = JSON.parse(last_session);
        fs.writeFile(path.join(getUserDataPath(), last_session['#' + file.id].current_path), editor.getValue(), function(error){
            if(error) throw error;
        });
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
        if(files[i].path == filepath) return true;
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

function openFile(data, filepath){
    if(isFileAlreadyOpened(filepath)){
        // console.log($('#filename_'+getFileID(filepath)));
        $('#filename_'+getFileID(filepath)).click();
    }else{
        newFileCount++;
        newTab(filepath, newFileCount , (filepath == undefined) ? 'untitled': path.basename(filepath),data);

        //last session

        let last_session = fs.readFileSync(path.join(getUserDataPath(), '/last_session/info.json'));
        last_session = JSON.parse(last_session);
        // console.log(last_session);
        last_session['#new' + newFileCount] = {
            original_path : filepath,
            current_path : path.join('last_session','#new' + newFileCount)
        }
        fs.writeFile(path.join(getUserDataPath(), last_session['#new' + newFileCount].current_path), data, function(error){
            if(error) throw error;
        });
        last_session = JSON.stringify(last_session, null, 2);
        fs.writeFileSync(path.join(getUserDataPath(), '/last_session/info.json'),last_session);

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

    let last_session = fs.readFileSync(path.join(getUserDataPath(), '/last_session/info.json'));
    last_session = JSON.parse(last_session);
    if(last_session['#new' + filecount]){
        fs.unlinkSync(path.join(getUserDataPath(), last_session['#new' + filecount].current_path));
    }
    // fs.unlinkSync(path.join(__dirname, '..', last_session['#new' + filecount].current_path), function(error){
    //     if(error) throw error;
    // });
    delete last_session['#new' + filecount];
    last_session = JSON.stringify(last_session, null, 2);
    fs.writeFileSync(path.join(getUserDataPath(), '/last_session/info.json'), last_session);

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

        ipc.send('close-app');
    }
    // console.log(files.hasOwnProperty(nextFile));
}

ipc.on('closeFile',function(event){
    closeCurrentFile(file);
});


// open folder
ipc.on('openFolder', function(event,structure){
    let response = '<ul class="file-tree"><li><a href="#"><span class = "label">' + structure.name + '</span></a><ul>';
    response += makeDirectoryTree(structure.children);
    response += '</ul>';
    $('#project-structure').html(response);
    $(".file-tree").filetree();
    openProjectStructure(true);
});

// create tree structure for opened folder

function makeDirectoryTree(structure){
    var response = "";
    structure.forEach(function(obj){
        if(obj.type == "folder"){
            response += '<li><a href="#"><span class = "label">'+ obj.name + '</span></a><ul>' + makeDirectoryTree(obj.children) + '</ul></li>';
        }else{
            response += '<li data-extension = "'+obj.name+'"><a href="#"><span onclick = "openFileFromSidebar(this)" class = "label" data-name = "'+ obj.name +'" data-path = "'+ obj.path +'">' + obj.name + '</span></a></li>';
        }
    });
    return response;
}


function openFileFromSidebar(file){
    // console.log(file.getAttribute('data-path'));
    let filepath = file.getAttribute('data-path');
    ipc.send('openFileFromSidebar', filepath);
}

// // copy template to new opened file

// function copyTemplate(){

// }


// new File
function newFile(){
    newFileCount ++;
    newTab(undefined , newFileCount , 'untitled', '');

    // new file entry in last session

    let last_session = fs.readFileSync(path.join(getUserDataPath(), '/last_session/info.json'));
    last_session = JSON.parse(last_session);
    last_session['#new' + newFileCount] = {
        original_path : undefined,
        current_path : path.join('last_session','#new' + newFileCount)
    }
    fs.writeFile(path.join(getUserDataPath(), last_session['#new' + newFileCount].current_path), '', function(error){
        if(error) {
            console.log(error);
            throw error;
        }
    });
    last_session = JSON.stringify(last_session, null, 2);
    fs.writeFileSync(path.join(getUserDataPath(), 'last_session/info.json'), last_session);

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

        let last_session = fs.readFileSync(path.join(getUserDataPath(), '/last_session/info.json'));
        last_session = JSON.parse(last_session);
        // console.log(file);
        fs.writeFile(path.join(getUserDataPath(), last_session['#' + file.id].current_path), data, function(error){
            if(error) throw error;
        });

        //update file in last session end here
        ipc.send('saveAs-data', data);
    }
})

ipc.on('save', function(event){
    if(editor != undefined){
        var data = editor.getValue();
        // console.log(data);

        // update file in last session

        let last_session = fs.readFileSync(path.join(getUserDataPath(), '/last_session/info.json'));
        last_session = JSON.parse(last_session);
        // console.log(file);
        fs.writeFile(path.join(getUserDataPath(), last_session['#' + file.id].current_path), data, function(error){
            if(error) throw error;
        });

        //update file in last session end here

        ipc.send('save-data', data, file.path);
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

    let last_session = fs.readFileSync(path.join(getUserDataPath(), '/last_session/info.json'));
    last_session = JSON.parse(last_session);
    last_session['#' + file.id].original_path = file.path;
    last_session = JSON.stringify(last_session, null, 2);
    fs.writeFileSync(path.join(getUserDataPath(), 'last_session/info.json'), last_session);

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


$(document).ready(function() {
    $(".file-tree").filetree();
});
var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-36251023-1']);
_gaq.push(['_setDomainName', 'jqueryscript.net']);
_gaq.push(['_trackPageview']);

(function() {
    var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
    ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
    var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();

// run program
function run(){
    var data = editor.getValue();
    // console.log(file.path);
    ipc.send('save-data', data, file.path);
    let input = $('#input').val();
    ipc.send('runProgram',input,file.path);
}

ipc.on('runProgramStatus',function(event,output){
    $('#output').html(output);
});

// error dialog

ipc.on('error', function(event, message){
    dialog.showErrorBox('Error',message);
});

// save settings

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




// open about page

ipc.on('openAbout', function(event){
    if(isFileAlreadyOpened(path.join(__dirname, 'about.html'))){
        $('#filename_'+getFileID(path.join(__dirname, 'about.html'))).click();
    // console.log('jello');
    }else{
        newFileCount++;
        let file_id = "new" + newFileCount;
        fs.readFile(path.join(__dirname, 'about.html'), function(err,data){
            if(err) console.log(err);
            $('#code_mirror_editors').append('<li id = "file_tab_'+file_id+'"><a href="" data-target="#' + file_id + '" role="tab" data-toggle="tab"><span id = "filename_'+file_id+'" onclick = "opentab(this)">' + 'About' + '</span><span onclick = "closeAnyFile(this)" class="close black"></span></a></li>');
            $('#editors').append('<div class="tab-pane" id = "'+file_id+'">'+data+'</div>');
            files['#'+ file_id] = {
                path: path.join(__dirname, 'about.html'),
                name: undefined,
                id: file_id,
                editor: undefined
            }
            $('#filename_new'+newFileCount).click();
        });
    }
});

// open console
function openConsole(){
    if($('.settings-panel').css('display') != 'none'){
        openSettingsPanel();
        editor.refresh();
    }
    if($('.console-container').css('display') == 'none'){
        $('.panel-middle').css('width','60%');
        $('.console-container').css('display','block');
        $('.fa-terminal').addClass('side-nav-button-active');
    }else{
        $('.panel-middle').css('width','100%');
        $('.console-container').css('display','none');
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
    editor.refresh();
}

// open settings panel end here

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


// update preview
// editor.on("change", function() {
    // clearTimeout(delay);

    // auto save current file on change

    // let last_session = fs.readFileSync('./last_session/info.json');  
    // last_session = JSON.parse(last_session);
    // fs.writeFile(last_session['#' + file.id].current_path, editor.getValue(), function(error){
    //     if(error) throw error;
    // });

    // end here

    // closeToDot();
    // setTimeout(updateHtmlPreview, 300);
    // setTimeout(updateMarkdownPreview, 300);
    // updateHtmlPreview();
    // updateMarkdownPreview();
// });

// Refresh Preview

ipc.on('refreshPreview', function(event){
    updateHtmlPreview();
    updateMarkdownPreview();
})



function updateHtmlPreview() {
    if(editor != undefined){
        var previewFrame = document.getElementById('html-preview');
        var preview =  previewFrame.contentDocument ||  previewFrame.contentWindow.document;
        preview.open();
        // console.log(editor.getValue());
        preview.write(editor.getValue());
        preview.close();
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

// setTimeout(updateHtmlPreview, 300);
// setTimeout(updateMarkdownPreview, 300);

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
    updateHtmlPreview();
    updateMarkdownPreview();
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



// Tabs

// (function($){  
//     function initSecondaryCodeEditor(){
//       var $active = $('#code_mirror_editors > .active > a');      
//       var $sec_tab = $($active.data('target'));
//       // --> 1. & 2. & 3.: try to find an already existing CodeMirror instance (https://github.com/codemirror/CodeMirror/issues/1413)
//       // if found, simply refresh it!
//       var codeMirrorContainer = $sec_tab.find(".CodeMirror")[0];
//       if (codeMirrorContainer && codeMirrorContainer.CodeMirror) {
//       			// console.log('hello');
// 				codeMirrorContainer.CodeMirror.refresh();
//       } else {
//       	console.log('Hello');
//       	initEditor($sec_tab.find('textarea')[0]);
//         // CodeMirror.fromTextArea($sec_tab.find('textarea')[0], {
//         //   lineNumbers: true
//         // });
//       }
//       // <--
//     }

//   $(document).ready(function(){

//       $('#code_mirror_editors > li > a[data-toggle="tab"]').on('shown.bs.tab', function(e){
//         // --> 1.: this might be called while the element is still invisible which breaks some CodeMirror calculations
//         if ($(e.target).is(":visible")) {
//           initSecondaryCodeEditor();
//         }
//         // <--
//       });

//       // Remember tabs
//       var json, tabsState;
//       $('a[data-toggle="tab"]').on('shown.bs.tab', function(e){
//         tabsState = localStorage.getItem("tabs-state");
//         json = JSON.parse(tabsState || "{}");
//         json[$(e.target).parents("ul.nav.nav-pills, ul.nav.nav-tabs").attr("id")] = $(e.target).data('target');

//         localStorage.setItem("tabs-state", JSON.stringify(json));
//       });

//       tabsState = localStorage.getItem("tabs-state");

//       json = JSON.parse(tabsState || "{}");
//       $.each(json, function(containerId, target) {
//         return $("#" + containerId + " a[data-target=" + target + "]").tab('show');
//       });

//       $("ul.nav.nav-pills, ul.nav.nav-tabs").each(function() {
//         var $this = $(this);
//         if (!json[$this.attr("id")]) {
//           return $this.find("a[data-toggle=tab]:first, a[data-toggle=pill]:first").tab("show");
//           }
//       });

//     });// doc.ready
//   })(jQuery);