# Get the process ID for the 'OvenSpace' process
$PID = Get-Process | Where-Object { $_.ProcessName -like "*OvenSpace*" } | Select-Object -ExpandProperty ID

# Check if the process ID exists and kill the process if it does
if ($PID) {
    Write-Host "killing $PID"
    Stop-Process -Id $PID -Force
}
