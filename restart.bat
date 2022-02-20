@echo off
pushd "%~dp0/core"
winsw restart service/DenoServer.xaml
popd