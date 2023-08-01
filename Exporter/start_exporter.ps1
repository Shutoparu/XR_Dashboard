# Define the paths to your .exe files
$exe1 = ".\nvidia_gpu_exporter.exe"
$exe2 = ".\ping_exporter.exe"
$exe3 = ".\windows_exporter.exe"

# Get the IP address of the current machine
$ip = Read-Host "Please enter the IP address to ping: "

# Define the arguments for the main.exe
$main_args = "-port 8888 -pingaddr $ip -count 4"

# Add NVSMI to path so that nvidia_smi can be found # Should fix nvidia_smi not found error
# nvidia-smi not in %PATH%  https://github.com/utkuozdemir/nvidia_gpu_exporter/issues/7
Set-Item -Path Env:Path -Value ($Env:Path + ";C:\Program Files\NVIDIA Corporation\NVSMI\")

# Use Start-Process to execute the .exe files
Start-Process $exe1
Start-Process $exe2 -ArgumentList $main_args
Start-Process $exe3
