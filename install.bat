@echo off
pushd "%~dp0/core"
deno run --allow-read --allow-write install.ts
winsw install DenoServer.xaml
winsw start DenoServer.xaml
popd