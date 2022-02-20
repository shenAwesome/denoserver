@echo off
pushd "%~dp0/core"
deno run --allow-read --allow-write install.ts
winsw install service/DenoServer.xaml
winsw start service/DenoServer.xaml
popd