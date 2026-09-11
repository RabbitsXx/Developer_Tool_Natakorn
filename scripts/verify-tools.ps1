# verify-tools.ps1 - one-command verification entry point for this kit.
#
# It answers two different questions and reports one summary:
#   1. Is this workstation ready?          -> scripts/doctor.ps1 (read-only; -Strict to gate on it)
#   2. Is the kit itself still valid?      -> scripts/validate-kit.mjs
#                                             scripts/verify-bootstrap-protocol.mjs
#
# Use -SkipTools for the kit contract only, or run doctor.ps1 directly for the full tool table.
# Exit code is 0 only when every stage that ran succeeded.
[CmdletBinding()]
param(
    [switch]$Strict,
    [switch]$SkipTools
)

$ErrorActionPreference = 'Continue'
$kitRoot = Split-Path -Parent $PSScriptRoot
$script:Failed = 0

function Invoke-Stage {
    param(
        [Parameter(Mandatory = $true)][string]$Name,
        [Parameter(Mandatory = $true)][scriptblock]$Command
    )

    $raw = & $Command 2>&1
    $exitCode = $LASTEXITCODE
    # Native stderr arrives as ErrorRecord objects; unwrap them so failures print the real message
    # instead of PowerShell's "At line:1 char:1" wrapper.
    $output = ($raw | ForEach-Object {
        if ($_ -is [System.Management.Automation.ErrorRecord]) { $_.Exception.Message } else { [string]$_ }
    }) -join "`n"

    if ($exitCode -eq 0) {
        Write-Host ('[OK]    {0}' -f $Name)
        return
    }

    $script:Failed++
    Write-Host ('[FAIL]  {0} (exit {1})' -f $Name, $exitCode)
    if ($output.Trim()) {
        $output.Trim() -split "`n" | ForEach-Object { Write-Host ('        {0}' -f $_.TrimEnd()) }
    }
}

Write-Host ''
Write-Host 'Kit verification (workstation + kit contract)'
Write-Host ('-' * 62)

if (-not $SkipTools) {
    $doctorArgs = @('-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', (Join-Path $PSScriptRoot 'doctor.ps1'))
    if ($Strict) { $doctorArgs += '-Strict' }
    Invoke-Stage 'workstation tools (doctor.ps1)' { & powershell @doctorArgs }
}

Push-Location $kitRoot
try {
    Invoke-Stage 'kit contract (validate-kit.mjs)' { node scripts/validate-kit.mjs }
    Invoke-Stage 'bootstrap protocol (verify-bootstrap-protocol.mjs)' { node scripts/verify-bootstrap-protocol.mjs }
} finally {
    Pop-Location
}

Write-Host ('-' * 62)
if ($script:Failed -eq 0) {
    Write-Host 'Summary: all stages passed.'
    exit 0
}

Write-Host ('Summary: {0} stage(s) failed.' -f $script:Failed)
exit 1
