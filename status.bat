@echo off
pushd "%~dp0/core"
winsw status service/DenoServer.xaml
popd