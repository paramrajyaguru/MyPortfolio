@echo off
setlocal
pushd "%~dp0" || exit /b 1
py -3 -c "import sys; sys.exit(sys.version_info < (3,7))" >nul 2>&1
if errorlevel 1 goto try_python
py -3 serve_local.py
goto done
:try_python
python -c "import sys; sys.exit(sys.version_info < (3,7))" >nul 2>&1
if errorlevel 1 goto missing
python serve_local.py
goto done
:missing
echo Install Python 3 from python.org, then double-click stat.bat again.
pause
popd
exit /b 1
:done
if errorlevel 1 pause
popd
