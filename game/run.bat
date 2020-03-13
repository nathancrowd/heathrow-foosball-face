start cmd /k "echo 'python server' & ..\server\VE\Scripts\activate.bat & python ..\server\main.py"
start cmd /k "http-server -S -C cert.pem"
gulp