@echo off

REM Define the paths to your .exe files
set "exe1=.\nvidia_gpu_exporter.exe"
set "exe2=.\ping_exporter.exe"
set "exe3=.\windows_exporter.exe"

REM Get the IP address of the current machine
set /p ip="Please enter the IP address to ping: "

REM Define the arguments for the main.exe
set "main_args=-port 8888 -pingaddr %ip% -count 4"

REM Create a temporary PowerShell script
set "ps1_file=%temp%\temp_script.ps1"
echo Start-Process "%exe1%"  >> "%ps1_file%"
echo Start-Process "%exe2%" -ArgumentList "%main_args%"  >> "%ps1_file%"
echo Start-Process "%exe3%"  >> "%ps1_file%"

REM Execute the temporary PowerShell script
powershell -ExecutionPolicy Bypass -File "%ps1_file%"

REM Clean up the temporary script
del "%ps1_file%"
