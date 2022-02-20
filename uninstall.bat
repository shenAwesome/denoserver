@echo off
pushd "%~dp0/core"
winsw stop service/DenoServer.xaml
winsw uninstall service/DenoServer.xaml
popd