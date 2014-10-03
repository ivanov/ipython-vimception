IPython Vimception
==================

Vim-within-Vim in the IPython Notebook.

In my "Putting the V in IPython" talk at SciPy2014, I spent [half of my time
talking about ipython-vimception](https://www.youtube.com/watch?v=p9gnhmX1sPo#t=723).
Here are the [slides for the talk](http://nbviewer.ipython.org/github/ivanov/scipy2014/blob/master/v%20in%20IPython.ipynb).

This is a work in progress. For now, put these files into a folder called
`vimception` (**not** `ipython-vimception`) in the `extensions` subdirectory of whatever `ipython locate`
returns, usually these files go into the `~/.ipython/extensions` directory.

Once you do that, in the notebook, just make an execute a cell with:

    %load_ext vimception

Once you're satisfied that the above works, you can edit your profile's
static/custom/custom.js to have this:

```javascript
function load_vimception() {
    cell = IPython.notebook.insert_cell_at_index('code', 0);
    IPython.notebook.select(0);
    cell.set_text('%load_ext vimception\n%reload_ext vimception\n%vimception');
    if (!IPython.notebook.kernel) {
        $([IPython.events]).on('status_started.Kernel', function() {
            cell.execute();
            IPython.notebook.delete_cell();
        });
    } else { 
        cell.execute();
        IPython.notebook.delete_cell();
    }
}

$([IPython.events]).on('notebook_loaded.Notebook', function(){
    $('#help_menu').prepend([
            '<li id="vimception" title="load up vimception cell">',
            '<a href="#" title="vimception" onClick="load_vimception()">vimception</a></li>',
            ].join("\n"));

// uncomment next line to *always* start in vimception
// $('#vimception a').click();
});
```

This allows you to enter vimception by going clicking on <code>Help ->
vimception </code>. To leave vimception, save and reload the notebook. If you
uncomment the last line to *always* start vimception, there will not be a way to
get out of vimception mode without editing custom.js and then reload the page.


It's all very rough right now, I'm working on it, so hang tight.

TODO
----

 [ ] suppress switching into command mode when moving cursor past the top/bottom
     lines (using new methods Jonathan added)

 [ ] make the multi-level escaping optional (i.e. allow only `ctrl-m` to take
     you to command mode)
 
 [ ] look up what else I had in my todo a few weeks ago

 [ ] add logic to %vimception to write vimception.json to profile_dir/static/custom
	- investigate json config in general (Matthias implemented this at some point)

[ ] multi-level undo

[ ] unalias v - and use nb-cccp if it's loaded 

[ ] turn it into an nbextension (no python side)
    - implementing this should close #4 as well

[ ] Ctrl-n and Ctrl-p should work as local completion (like in vim)

[ ] on click, disable the vim fire

[ ] the cell that vimception is started from gets FUBARed  :\ or actuall just
    entering edit mode doesn't work?

[ ] allow going between cells independent of which character you're on

[ ] shift-J on the last line should join cell below

[ ] standardize on a post-load function that vimception will call to allow for
    further customization.
