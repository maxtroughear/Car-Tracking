Pushd "%~dp0"
node export.js %1

robocopy assets "../../public/assets" /E /is

popd