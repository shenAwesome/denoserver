@echo off
pushd "%~dp0/core"
winsw stop DenoServer.xaml
winsw uninstall DenoServer.xaml
popd