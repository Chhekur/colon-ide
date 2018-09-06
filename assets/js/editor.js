const ipc = require('electron').ipcRenderer;
const {dialog} = require('electron').remote;
window.$ = window.jQuery = require('../assets/js/jquery.js');
const showdown  = require('showdown');
const fs = require('fs');
const markdown_converter = new showdown.Converter();
const path = require('path');
var files = {};
var newFileCount = 1;

// editor initialisation 

function initEditor(editor_id){
	let editor = CodeMirror.fromTextArea(editor_id, {
		lineNumbers: true,
		theme: "one-dark",
		styleActiveLine: true,
		keyMap: "sublime",
		lineWrapping: true,
		foldGutter: true,
		autoCloseBrackets: true,
		autoCloseTags: true,
		showTrailingSpace: true,
		matchBrackets: true,
		mode:'text/text',
		gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"],
		extraKeys: {"Ctrl-Space": "autocomplete","Ctrl-Q": function(cm){ cm.foldCode(cm.getCursor()); }},
		highlightSelectionMatches: {annotateScrollbar: true},
		// hintOptions: {hint: synonyms},
		scrollbarStyle: "simple",
		tabSize: 4,
        indentUnit: 4,
        indentWithTabs: true
	});
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

// auto mod selector
// var editor = "";
CodeMirror.modeURL = "../src/editor/mode/%N/%N.js";
// var editor = "";
// var file = "";
var editor = newTab(undefined , newFileCount , 'untitled', '');
var file = files['#new' + newFileCount];
$('#filename_new1').click();

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
		closeToDot();
		// clearTimeout(delay);
		setTimeout(updateHtmlPreview, 300);
		setTimeout(updateMarkdownPreview,300);
	});
	// console.log(data);
	
	// return editor;
}

ipc.on('openFile',function(event, data, filepath){
	newFileCount++;
	newTab(filepath, newFileCount ,path.basename(filepath),data);
	$('#filename_new'+newFileCount).click();
	// files['#'+filepath] = {
	// 	path: filepath,
	// 	name: path.basename(filepath),
	// 	id: filepath,
	// 	editor: editor
	// }
	// // console.log('Hello')
	// editor.getDoc().setValue(data);

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
	if(nextfilecount != undefined){
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

// new File
function newFile(){
	newFileCount ++;
	newTab(undefined , newFileCount , 'untitled', '');
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
		ipc.send('saveAs-data', data);
	}
})

ipc.on('save', function(event){
	if(editor != undefined){
		var data = editor.getValue();
		// console.log(data);
		ipc.send('save-data', data, file.path);
	}
});

ipc.on('data-saved',function(event,filepath){
	file.path = filepath;
	file.name = path.basename(filepath);
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
		if(temp.indexOf('-') > -1){
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


// open about page

ipc.on('openAbout', function(event){
	// console.log('jello');
	newFileCount++;
	let file_id = "new" + newFileCount;
	fs.readFile('views/about.html', function(err,data){
		if(err) console.log(err);
		$('#code_mirror_editors').append('<li id = "file_tab_'+file_id+'"><a href="" data-target="#' + file_id + '" role="tab" data-toggle="tab"><span id = "filename_'+file_id+'" onclick = "opentab(this)">' + 'About' + '</span><span onclick = "closeAnyFile(this)" class="close black"></span></a></li>');
		$('#editors').append('<div class="tab-pane" id = "'+file_id+'">'+data+'</div>');
		files['#'+ file_id] = {
			path: undefined,
			name: undefined,
			id: file_id,
			editor: undefined
		}
		$('#filename_new'+newFileCount).click();
	});
});

// open console
function openConsole(){
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
}

ipc.on('openConsole',function(event){
	openConsole();
});


// open html preview
function openHtmlPreview(){
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
}

ipc.on('openHtmlPreview', function(event){
	openHtmlPreview();
	// $('#preview').html(file.editor.getValue());
});

// open markdown preview

function openMarkdownPreview(){
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
}

ipc.on('openMarkdownPreview', function(event){
	openMarkdownPreview();
	// $('#preview').html(file.editor.getValue());
});


// open project structure

function openProjectStructure(call_from_menu = false){
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
editor.on("change", function() {
	// clearTimeout(delay);
	closeToDot();
	setTimeout(updateHtmlPreview, 300);
	setTimeout(updateMarkdownPreview, 300);
});

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

setTimeout(updateHtmlPreview, 300);
setTimeout(updateMarkdownPreview, 300);

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
		setTimeout(function(){
			editor.refresh();
		},1);
	}
}


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