IPython Vimception
==================

Vim-within-vim in the IPython Notebook.

This is a work in progress. For now, put these files into the `extensions`
subdirectory of whatever `ipython locate` returns, usually these files go into
the `~/.ipython/extensions` directory.

Once you do that, in the notebook, just make a cell that will do 

    %load_ext vimception

It's all very rough right now, I'm working on it, so hang tight.

TODO
----

 [ ] supress switching into command mode when moving cursor past the top/bottom lines (using new methods Jonathan added)

 [ ] make the multi-level esacping optional (i.e. allow only ctrl-m to take you to command mode)
 
 [ ] look up what else I had in my todo a few weeks ago

 [ ] add logic to %vimception to write vimception.json to profile_dir/static/custom
	- investigate json config in general (Matthias implemented this at some point)