@echo off
pushd "%~dp0/core"
deno  run --allow-net --watch .\Main.ts
popd