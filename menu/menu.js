const Menu = require('electron').Menu;
const electron = require('electron')
const fun = require('./functions.js');

const template = [
	{
		label:'File',
		submenu:[{
			label: 'New File',
			accelerator: 'CmdOrCtrl+N',
			click: function(){
				fun.newFile();
			}
		},
		{
			label: 'Open File...',
			accelerator: 'CmdOrCtrl+O',
			click:function(){
				fun.openFile();
			}
		},
		{
			label : 'Open Folder...',
			click:function(){
				fun.openFolder();
			}
		},
		{
			label: 'Save',
			accelerator :'CmdOrCtrl+S',
			click:function(){
				fun.save();
			}
		},
		{
			label: 'Save As',
			accelerator: 'CmdOrCtrl+Shift+S',
			click:function(){
				fun.saveAs();
			}
		},
		{
			label: 'Close File',
			accelerator: 'CmdOrCtrl+W',
			click:function(){
				fun.closeFile();
			}
		},
		{
			label :'Exit',
			click:function(){
				app.quit();
			}
		}]
	},
	{
		label: 'Edit',
		submenu:[{
			role: 'Undo'
		},
		{
			role: 'Redo'
		},
		{
			type: 'separator'
		},
		{
			role: 'Copy'
		},
		{
			role: 'Cut'
		},
		{
			role: 'Paste'
		},
		{
			type: 'separator'
		},
		{
			label:'Font',
			submenu:[{
				label:'Increase',
				role:'zoomin'
			},
			{
				label:'Decrease',
				role:'zoomout',
			}]
		},
		{
			label: 'Line',
			submenu:[{
				label: 'Indent',
				accelerator: 'CmdOrCtrl+]',
				click:function(){
					fun.Indent();
				}
			},
			{
				label: 'Unindent',
				accelerator: 'CmdOrCtrl+[',
				click:function(){
					fun.indentLess();
				}
			},
			{
				label: 'Swap Line Up',
				accelerator:'CmdOrCtrl+Shift+Up',
				click:function(){
					fun.swapLineUp();
				}
			},
			{
				label: 'Swap Line Down',
				accelerator: 'CmdOrCtrl+Shift+Down',
				click:function(){
					fun.swapLineDown();
				}
			},
			{
				label: 'Duplicate Line',
				accelerator: 'CmdOrCtrl+Shift+D',
				click:function(){
					fun.duplicateLine();
				}
			},
			{
				label: 'Delete Line',
				accelerator: 'CmdOrCtrl+Shift+K',
				click:function(){
					fun.deleteLine();
				}
			},
			{
				label: 'Join Lines',
				accelerator: 'CmdOrCtrl+J',
				click:function(){
					fun.joinLines();
				}
			}]
		},
		{
			label: 'Comment',
			submenu:[{
				label: 'Toggle Comment',
				accelerator : 'CmdOrCtrl+/',
				click:function(){
					fun.toggleCommentIndented();
				}
			},
			{
				label: 'Toggle Block Comment',
				accelerator: 'CmdOrCtrl+Shift+/',
				click:function(){
					fun.toggleCommentIndented();
				}
			}]
		},
		{
			label: 'Text',
			submenu:[{
				label: 'Insert Line Before',
				accelerator : 'CmdOrCtrl+Shift+Enter',
				click:function(){
					fun.insertLineBefore();
				}
			},
			{
				label: 'Insert Line After',
				accelerator : 'CmdOrCtrl+Enter',
				click:function(){
					fun.insertLineAfter();
				}
			},
			{
				type: 'separator'
			},
			{
				label: 'Transpose',
				accelerator:'CmdOrCtrl+T',
				click:function(){
					fun.transposeChars();
				}
			}]
		},
		{
			label: 'Mark',
			submenu:[{
				label : 'Set Mark',
				accelerator: 'CmdOrCtrl+K',
				click:function(){
					fun.setSublimeMark();
				}
			},
			{
				label: 'Select To Mark',
				accelerator : 'CmdOrCtrl+K',
				click:function(){
					fun.selectToSublimeMark();
				}
			},
			{
				label: 'Delete To Mark',
				accelerator: 'CmdOrCtrl+K',
				click:function(){
					fun.deleteToSublimeMark();
				}
			},
			{
				label: 'Swap With Mark',
				accelerator: 'CmdOrCtrl+K',
				click:function(){
					fun.swapWithSublimeMark();
				}
			},
			{
				label : 'Clear Mark',
				accelerator : 'CmdOrCtrl+K',
				click:function(){
					fun.clearSublimeMark();
				}
			}]
		},
		{
			label:'Code Folding',
			submenu:[{
				label:'Fold',
				accelerator: 'CmdOrCtrl+Shift+[',
				click:function(){
					fun.fold();
				}
			},
			{
				label: 'Unfold',
				accelerator: 'CmdOrCtrl+Shift+]',
				click:function(){
					fun.unflod();
				}
			}]
		},
		{
			label: 'Convert Case',
			submenu:[{
				label: 'Upper Case',
				accelerator:'CmdOrCtrl+U',
				click:function(){
					fun.upcaseAtCursor();
				}
			},
			{
				label:'Lower Case',
				accelerator: 'CmdOrCtrl+L',
				click:function(){
					fun.downcaseAtCursor();
				}
			}]
		},
		{
			label:'Wrap',
			accelerator:'Alt+Q',
			click:function(){
				fun.wrapLines();
			}
		},
		{
			label : 'Sort lines',
			accelerator:'F9',
			click:function(){
				fun.sortLines();
			}
		},
		{
			label: 'Sort Lines (Case Sensitive)',
			accelerator:'CmdOrCtrl+F9',
			click:function(){
				fun.sortLinesInsensitive();
			}
		}]
	},
	{
		label:'Selection',
		submenu:[{
			label : 'Split Into Lines',
			accelerator : 'CmdOrCtrl+Shift+L',
			click:function(){
				fun.splitSelectionByLine();
			}
		},
		{
			label: 'Add Previous Line',
			accelerator : 'CmdOrCtrl+Alt+Up',
			click:function(){
				fun.addCursorToPrevLine();
			}
		},
		{
			label: 'Add Next Line',
			accelerator : 'CmdOrCtrl+Alt+Down',
			click:function(){
				fun.addCursorToNextLine();
			}
		},
		{
			label: 'Single Selection',
			accelerator: 'Escape',
			click:function(){
				fun.singleSelectionTop();
			}
		}]
	},
	{
		label: 'Find',
		submenu:[{
			label:'Find...',
			accelerator: 'CmdOrCtrl+F',
			click:function(){
				fun.find();
			}
		},
		{
			label:'Find Next',
			accelerator:'F3',
			click:function(){
				fun.findNext();
			}
		},
		{
			label:'Find Previous',
			accelerator: 'Shift+F3',
			click:function(){
				fun.findPrev();
			}
		},
		// {
		// 	label:'Incremental Find',
		// 	accelerator : 'CmdOrCtrl+I',
		// 	click:function(){
		// 		fun.findIncremental();
		// 	}
		// },
		// {
		// 	label:'Decremental Find',
		// 	accelerator:'CmdOrCtrl+Shift+I',
		// 	click:function(){
		// 		fun.findIncrementalReverse();
		// 	}
		// },
		{
			type:'separator'
		},
		{
			label:'Replace',
			accelerator:'CmdOrCtrl+H',
			click:function(){
				fun.replace();
			}
		},
		{
			type:'separator'
		},
		{
			label:'Quick Find',
			accelerator : 'CmdOrCtrl+F3',
			click:function(){
				fun.findUnder();
			}
		},
		{
			label:'Quick Add Next',
			accelerator:'CmdOrCtrl+D',
			click:function(){
				fun.selectNextOccurrence();
			}
		}]
	},
	{
		label:'Goto',
		submenu:[{
			label:'Go Word Left',
			accelerator:'Alt+Left',
			click:function(){
				fun.goSubwordLeft();
			}
		},
		{
			label:'Go Word Right',
			accelerator:'Alt+Right',
			click:function(){
				fun.goSubwordRight();
			}
		},
		{
			label: 'Goto Line',
			accelerator:'CmdOrCtrl+G',
			click:function(){
				fun.jumpToLine();
			}
		},
		{
			label: 'Goto Bracket',
			accelerator:'CmdOrCtrl+M',
			click:function(){
				fun.goToBracket();
			}
		}]
	},
	{
		label:"View",
		submenu:[{
			label:'Console',
			accelerator:'Shift+Enter',
			click:function(){
				fun.openConsole();
			}
		},
		{
			label:'Html Preview',
			accelerator:'Shift+P',
			click:function(){
				fun.openHtmlPreview();
			}
		}]
	}
]

if (process.platform === 'darwin') {
	const name = electron.app.getName()
	// console.log(name);
	template.unshift({
		label: name,
		submenu: [{
			label: 'Quit',
			accelerator: 'Command+Q',
			click: function () {
				app.quit()	
			}
		}]
	})

}
const menu = Menu.buildFromTemplate(template)
Menu.setApplicationMenu(menu)