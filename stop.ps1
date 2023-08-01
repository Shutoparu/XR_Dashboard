# Get the process ID for the 'OvenSpace' process
$myPID = Get-Process | Where-Object { $_.ProcessName -like "*OvenSpace*" } | Select-Object -ExpandProperty ID

# Check if the process ID exists and kill the process if it does
if ($myPID) {
    Write-Host "killing $myPID"
    Stop-Process -Id $myPID -Force
}
