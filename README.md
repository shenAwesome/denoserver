# denoserver
Start server as http://localhost:8000/ 
```
run.bat
``` 
Install as windows service, enables http://localhost:9000/
```
install.bat
```

Uninstall:
```
uninstall.bat
```
Change http port
```
modify ".\core\service\DenoServer.xaml"
```
Create/modify service
```
open "src" in vscode. 
index.ts is the entry point
```
set up IIS rewrite to enable http://localhost/deno/
```
setupIIS.bat
```