from __future__ import print_function
"""
This is VimCeption

When you load this extension, you will feel a kick

"""
import os
from IPython.display import display, Javascript

fname = os.path.join(os.path.dirname(__file__), 'vimception.js')
with open(fname) as f:
    vimception_js = f.read()

def vimception(line=''):
    with open(fname) as f:
        vimception_js = f.read()
    display(Javascript(vimception_js))
    if line != 'off':
        display(Javascript(vimception_js))
    else:
        print(line)
        display(Javascript(vimception_js + "to('default');"));

def load_ipython_extension(ip):
    vimception()
    ip.magics_manager.register_function(vimception)
