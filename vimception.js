
var cmd = IPython.keyboard_manager.command_shortcuts;
var edit = IPython.keyboard_manager.edit_shortcuts;
var def_cmd = IPython.default_command_shortcuts;
var def_edit = IPython.default_edit_shortcuts;

// get the code mirror editor of a curently selected cell
function C() { return IPython.notebook.get_selected_cell().code_mirror; };

// change the mode of all current and future CodeMirror instances
function to(mode) {
    var mode = mode || 'vim'
    // first let's apply vim mode to all current cells
    function to_mode(c) { return c.code_mirror.setOption('keyMap', mode);};
    IPython.notebook.get_cells().map(to_mode);
    // apply the mode to future cells created
    IPython.Cell.options_default.cm_config.keyMap = mode;
}

function getCSS(path) {
    $('<link/>', {
       rel: 'stylesheet',
       type: 'text/css',
       href: path,
    }).appendTo('head');
}


var p = "/static/components/codemirror/addon/";
// Grab the CodeMirror vim keymap
$.getScript("/static/components/codemirror/keymap/vim.js");

// also make search work
$.getScript(p + "search/search.js");
$.getScript(p + "search/searchcursor.js");
// TODO: hook-up gq to perform a harwrap
$.getScript(p + "wrap/hardwrap.js");
$.getScript(p + "selection/active-line.js");
//$.getScript("/static/components/codemirror/addon/
// WARNING

$.getScript(p + "display/fullscreen.js");
getCSS(p + "display/fullscreen.css");

getCSS(p + "dialog/dialog.css");
$.getScript("static/components/codemirror/addon/dialog/dialog.js");

//$.getScript("/static/components/codemirror/addon/
$.getScript(p + "fold/indent-fold.js");
$.getScript(p + "fold/foldcode.js");
$.getScript(p + "fold/foldgutter.js");

IPython.CodeCell.options_default.cm_config.foldGutter = true;
IPython.CodeCell.options_default.cm_config.gutters =  ["CodeMirror-linenumbers", "CodeMirror-foldgutter"];
getCSS(p + "fold/foldgutter.css");

var p = "/static/components/codemirror/";
//themes
getCSS(p + "theme/tomorrow-night-eighties.css");
getCSS(p + "theme/twilight.css");
getCSS(p + "theme/vibrant-ink.css");

// on all code mirror instances on this page, apply the function f
function all_cm(f) {
    // apply f to every code mirror instance. f takes one parameter
    IPython.notebook.get_cells().map(function (c) { f(c.code_mirror); } );
}


to('vim');
function vim_up(event) {
    var cell = IPython.notebook.get_selected_cell();
    console.log('IPython "k" handler invoked')
    if (cell && cell.at_top() && cell.code_mirror.options.keyMap === 'vim') {
        console.log('inside the business logic k');
        event.preventDefault();
        IPython.notebook.command_mode()
        IPython.notebook.select_prev();
        IPython.notebook.edit_mode();
        return false;
    };
}

function vim_down(event) {
            var cell = IPython.notebook.get_selected_cell();
            if (cell && cell.at_bottom() && cell.code_mirror.options.keyMap === 'vim') {
                event.preventDefault();
                IPython.notebook.command_mode()
                IPython.notebook.select_next();
                IPython.notebook.edit_mode();
                return false;
            };
        }

var m = '(vim) '
var shortcuts = {
    'k' : {
        help    : m + 'up a line, even across cells',
        help_index : 'AA',
        handler : vim_up
    },
    'j' : {
        help    : m + 'down a line, even across cells',
        help_index : 'AA',
        handler : vim_down
    },
};
edit.add_shortcuts(shortcuts);
//edit.add_shortcuts('k', def_edit['up'].handler);
//edit.add_shortcut('j', def_edit['down'].handler);

// N.B. This code looks fairly simple, but it took me forever to 
// figure out how to do this, 
// 
// there's a problem here, Ctrl-[ is already handled by CodeMirror by the time we 
// (IPython.keyboard_manager) get it CodeMirror issues signals on mode change, 
// so we have to hook into that to get Ctrl-[
edit.remove_shortcut('Ctrl+[');

CodeMirror.commands.leaveInsertOrEdit = function (cm) {
    if ( cm.state.vim.insertMode ) {
        // do magic here to get out of insert mode
        CodeMirror.keyMap['vim-insert']['Esc'](cm);
    } else {
        IPython.notebook.command_mode();
        IPython.notebook.focus_cell();
    }
};
        
//C().options.extraKeys['Ctrl-['] = 'leaveInsertOrEdit';
all_cm( function (cm) {
    cm.options.extraKeys['Ctrl-['] = 'leaveInsertOrEdit';
    if ( CodeMirror.defaults.extraKeys === null ) { 
        CodeMirror.defaults.extraKeys = {};
    }
    // TODO: make this change permanent
    // this part seems to be ignore when adding a new cell
    // - alternative solution would be to listen for NewCell events and rerun the CM function on it
    // - it could also be the case that when we instatiate CodeMirror, we somehow leave out CM.defaults.extraKeys
    IPython.CodeCell.options_default.cm_config.extraKeys['Ctrl-['] = 'leaveInsertOrEdit';
    IPython.TextCell.options_default.cm_config.extraKeys['Ctrl-['] = 'leaveInsertOrEdit';
})

// On blur, make sure we go back to command mode for CodeMirror (in case user clicked away)
// TODO: Make this permanent - how to get CodeMirror to do this for new cells created after
all_cm( function (cm) {
    cm.on('blur', function(cm) {
        // TODO: I wish I understood a better way to do this, but fake pressing Escape work
        CodeMirror.keyMap['vim-insert']['Esc'](cm);
        CodeMirror.keyMap['vim']['Esc'](cm);
        cm.setOption('styleActiveLine', false);
    });
    cm.on('focus', function(cm) {
        cm.setOption('styleActiveLine', true);
    });
});

// 'i' by default interrupts the kernel (what Ctrl-C does at the terminal)
cmd.remove_shortcut('i');
cmd.add_shortcut('i', def_cmd.enter);

// not quite what we want - 'i' requires a double-tap
// add documentation for this.
cmd.add_shortcut('ctrl+c', function(e) { IPython.notebook.kernel.interrupt(); return false});


function focus_last(e) {
    var cells = IPython.notebook.get_cells();
    cells[cells.length-1].focus_cell();
};

function focus_first(e) {
    console.log('focus first called');
    var cells = IPython.notebook.get_cells();
    cells[0].focus_cell();
};

function combo_tap(combo, action) {
    var that = this;
    function f() {
        console.log('f called once');
        
        // redo this so that when an action is performed, we restore the original combo
        cmd.add_shortcut(combo[1], action);
        setTimeout(function () {
            console.log('resetting f');
            reset();
            //cmd.add_shortcut(combo[0], reset)
        }, 500);
    }
    function reset(e) {
        console.log('reset called');
        //that(combo, action); 
        cmd.add_shortcut(combo[0], f);
    }
    console.log("combo tap for", combo);
    
    reset();
};
cmd.add_shortcut('shift+g', focus_last);
combo_tap('gg', focus_first);

// cut
combo_tap('dd', def_cmd['x']);
//{
//        'd' : {
//            help    : 'delete cell (press twice)',
//            help_index : 'ej',
//            count: 2,
//cmd.add_shortcut('d', def_cmd['x'] );



// copy
combo_tap('yy', def_cmd['c']);

// paste
cmd.add_shortcut('p', def_cmd['v']);

// undo
cmd.add_shortcut('u', def_cmd['z']);

// Join (merge down with cell below)
cmd.add_shortcut('shift+j', def_cmd['shift+m'])

//edit.add_shortcut('k', def_edit['up'].handler);
//[edit.add_shortcut('j', def_edit['down'].handler);
edit.remove_shortcut('ctrl+[');

CodeMirror.prototype.save = function() { 
    IPython.notebook.save_checkpoint()
}

function focus_last(e) {
    var cells = IPython.notebook.get_cells();
    cells[cells.length-1].focus_cell();
};

function focus_first(e) {
    console.log('focus first called');
    var cells = IPython.notebook.get_cells();
    cells[0].focus_cell();
};

function combo_tap(combo, action) {
    var that = this;
    function f() {
        console.log('f called once');
        setTimeout(function () {
            console.log('resetting f');
            // this wasn't a double tap, so maybe do the default action for the single key, if there was one
            def_cmd[combo[0]].handler();
            reset();
            //cmd.add_shortcut(combo[0], reset)
        }, 800);
        cmd.add_shortcut(combo[1], action);
    }
    function reset(e) {
        console.log('reset called');
        //that(combo, action); 
        cmd.add_shortcut(combo[0], f);
    }
    
    reset();
};

cmd.add_shortcut('shift+g', focus_last);
combo_tap('gg', focus_first);

// get rid of the default Ctrl-W binding
// this only works for Firefox
$(document).ready(function() {
	$(this).bind('keypress', function(e) {
		var key = (e.keyCode ? e.keyCode : e.charCode);
		if (key == '119' && e.ctrlKey) {
			return false;
		}
	});
});

window.addEventListener("beforeunload", function( event ) {
    var press = jQuery.Event("keypress");
    press.ctrlKey = false;
    press.which = 27; // escape
    $(document).trigger(press);
    event.returnValue = "\nXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX";
    event.returnValue +="\nX  Chrome sucks at captruring Ctrl-W, sorry  X";
    event.returnValue += "\nXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX";
});

// update the keyboard shortcuts
IPython.quick_help = new IPython.QuickHelp();

//IPython.CodeCell.options_default.cm_config.styleActiveLine = true;

all_cm( function (cm) {
    cm.setOption('foldGutter', true);
    cm.setOption('gutters',  ["CodeMirror-linenumbers", "CodeMirror-foldgutter"]);
    cm.options.extraKeys["Ctrl-F"] = function(cm){ cm.foldCode(cm.getCursor()); },
    cm.options.extraKeys["Ctrl-F"] =  function(cm) { cm.setOption("fullScreen", !cm.getOption("fullScreen"))};
    IPython.CodeCell.options_default.cm_config.extraKeys['Ctrl-F'] = function(cm){ cm.foldCode(cm.getCursor()); };
    IPython.TextCell.options_default.cm_config.extraKeys['Ctrl-F'] = function(cm){ cm.foldCode(cm.getCursor()); };

    // todo - do this for new cells as well
    cm.setOption('theme', "tomorrow-night-eighties");
    // support this a :only? turn off full screen on blur
    cm.options.extraKeys["F11"] =  function(cm) { cm.setOption("fullScreen", !cm.getOption("fullScreen"))};
    cm.options.extraKeys["Esc"] =  function(cm) {
          if (cm.getOption("fullScreen")) cm.setOption("fullScreen", false);
        };
    cm.options.extraKeys["Ctrl-A"] =  function(cm) {
          if (cm.getOption("fullScreen")) cm.setOption("fullScreen", false);
        };
    //all_cm( function (cm) {
    cm.on('blur',function(cm) { 
        if (cm.getOption("fullScreen")) {
            cm.setOption('fullScreen', false); 
            // fullScreen the newly selected code mirror (doesn't work)
            //setTimeout(100, function() {
            //    console.log(IPython.notebook.get_selected_cell().code_mirror);
            //    IPython.notebook.get_selected_cell().code_mirror.setOption('fullScreen', true); 
            //});
        }
    });
});

setTimeout(200, function() {IPython.notebook.get_selected_cell().set_input_prompt('vim');})

$("#ipython_notebook").append('<img src="http://www.vim.org/images/vim_on_fire.gif" style="'
    + 'position: absolute; left: 51px; top: -10px; height: initial;">');


