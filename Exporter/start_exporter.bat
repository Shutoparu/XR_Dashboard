@echo off

set "exe1=.\nvidia_gpu_exporter.exe"
set "exe2=.\xrcube_exporter.exe"
set "exe3=.\windows_exporter.exe"

REM Create a temporary PowerShell script
set "ps1_file=%temp%\temp_script.ps1"

REM Add NVSMI to path so that nvidia_smi can be found
echo Set-Item -Path Env:Path -Value ($Env:Path + ";C:\Program Files\NVIDIA Corporation\NVSMI") >> "%ps1_file%"


echo Start-Process "%exe1%"  >> "%ps1_file%"
echo $ip = (Test-Connection -ComputerName (hostname) -Count 1).IPv4Address.IPAddressToString >> "%ps1_file%"
echo Start-Process "%exe2%" -ArgumentList "-ip", $ip  >> "%ps1_file%"
echo Start-Process "%exe3%"  >> "%ps1_file%"

REM Execute the temporary PowerShell script
powershell -ExecutionPolicy Bypass -File "%ps1_file%"

REM Clean up the temporary script
del "%ps1_file%"