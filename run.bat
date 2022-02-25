@echo off
pushd "%~dp0/core"
deno  run --allow-all --watch .\Main.ts
popd