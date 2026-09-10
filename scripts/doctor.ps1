[CmdletBinding()]
param(
    [switch]$Strict
)

$ErrorActionPreference = 'SilentlyContinue'
$script:MissingRequired = 0
$script:MissingRecommended = 0

function Resolve-Tool {
    param(
        [Parameter(Mandatory = $true)][string]$Name,
        [string[]]$FallbackPaths = @()
    )

    $command = Get-Command $Name -ErrorAction SilentlyContinue
    if ($null -ne $command) {
        return $command.Source
    }

    foreach ($candidate in $FallbackPaths) {
        if ($candidate -and (Test-Path -LiteralPath $candidate)) {
            return $candidate
        }
    }

    return $null
}

function Get-FirstLine {
    param(
        [Parameter(Mandatory = $true)][string]$Executable,
        [string[]]$Arguments = @('--version')
    )

    $value = & $Executable @Arguments 2>$null | Select-Object -First 1
    if ($null -eq $value) {
        return 'installed'
    }
    return "$value".Trim()
}

function Write-ToolResult {
    param(
        [Parameter(Mandatory = $true)][string]$Name,
        [Parameter(Mandatory = $true)][ValidateSet('required', 'recommended', 'optional')][string]$Tier,
        [string]$Path,
        [string]$Version = ''
    )

    if ($Path) {
        Write-Output ("[OK]   {0,-12} {1}" -f $Name, $Version)
        return
    }

    Write-Output ("[--]   {0,-12} missing ({1})" -f $Name, $Tier)
    if ($Tier -eq 'required') {
        $script:MissingRequired++
    } elseif ($Tier -eq 'recommended') {
        $script:MissingRecommended++
    }
}

Write-Output 'Ultimate VibeCoder Ecosystem — workstation doctor'
Write-Output ("OS: {0} {1}" -f [System.Runtime.InteropServices.RuntimeInformation]::OSDescription, [System.Runtime.InteropServices.RuntimeInformation]::OSArchitecture)
Write-Output ''

$git = Resolve-Tool -Name 'git'
Write-ToolResult -Name 'git' -Tier 'required' -Path $git -Version $(if ($git) { Get-FirstLine -Executable $git })

$node = Resolve-Tool -Name 'node'
$nodeVersion = if ($node) { Get-FirstLine -Executable $node } else { '' }
Write-ToolResult -Name 'node' -Tier 'required' -Path $node -Version $nodeVersion
if ($nodeVersion -match '^v(?<major>\d+)' -and [int]$Matches.major -lt 22) {
    Write-Output '[WARN] Node.js 22+ is recommended for the current Repomix CLI.'
    $script:MissingRequired++
}

foreach ($packageManager in @('npm', 'pnpm', 'yarn', 'bun')) {
    $path = Resolve-Tool -Name $packageManager
    Write-ToolResult -Name $packageManager -Tier 'optional' -Path $path -Version $(if ($path) { Get-FirstLine -Executable $path })
}

$rtkFallback = if ($env:LOCALAPPDATA) { Join-Path $env:LOCALAPPDATA 'rtk\rtk.exe' } else { $null }
$rtk = Resolve-Tool -Name 'rtk' -FallbackPaths @($rtkFallback)
Write-ToolResult -Name 'rtk' -Tier 'recommended' -Path $rtk -Version $(if ($rtk) { Get-FirstLine -Executable $rtk })
if ($rtk) {
    $gainOutput = & $rtk 'gain' 2>$null | Select-Object -First 1
    if (-not $gainOutput) {
        Write-Output '[WARN] rtk exists but `rtk gain` did not respond; confirm this is Rust Token Killer.'
        $script:MissingRecommended++
    }
}

$python = Resolve-Tool -Name 'python'
Write-ToolResult -Name 'python' -Tier 'optional' -Path $python -Version $(if ($python) { Get-FirstLine -Executable $python })

$docker = Resolve-Tool -Name 'docker'
Write-ToolResult -Name 'docker' -Tier 'optional' -Path $docker -Version $(if ($docker) { Get-FirstLine -Executable $docker })
if (-not $docker) {
    Write-Output '       Required only for local Supabase or other containerized services.'
}

$bru = Resolve-Tool -Name 'bru'
Write-ToolResult -Name 'Bruno CLI' -Tier 'optional' -Path $bru -Version $(if ($bru) { Get-FirstLine -Executable $bru })

$gh = Resolve-Tool -Name 'gh'
Write-ToolResult -Name 'GitHub CLI' -Tier 'optional' -Path $gh -Version $(if ($gh) { Get-FirstLine -Executable $gh })

Write-Output ''
Write-Output ("Summary: {0} required issue(s), {1} recommended issue(s)." -f $script:MissingRequired, $script:MissingRecommended)
Write-Output 'This doctor is read-only and does not install or modify tools.'
Write-Output 'See docs/INSTALLATION.md for OS-specific setup and optional-tool guidance.'

if ($script:MissingRequired -gt 0 -or ($Strict -and $script:MissingRecommended -gt 0)) {
    exit 1
}

exit 0
