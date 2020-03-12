# AR Foosball server

Elements related to storing data and remote access

## Development setup (not tested)

Install 64bit python 3.7:
 https://www.python.org/ftp/python/3.7.7/python-3.7.7-amd64.exe

That installation has added elements to your machine's path, so you need to restart explorer.exe or restart the computer.

Install pip (python's npm):

 `python get-pip.py`
 
 Let's create a virtual environment:
 
 `python -m venv VE`
 
 Activate the virtual environment:
 
 `VE\scripts\activate.bat`
 
 Let's install the required packages:
 
 `pip install -r requirements.txt`
 
## Development

To launch the server:

 ```
VE\scripts\activate.bat
python main.py
```