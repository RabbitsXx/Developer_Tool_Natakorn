[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)][string]$TargetPath,
    [string]$OverlayPath,
    [switch]$DryRun
)

$ErrorActionPreference = 'Stop'
$kitRoot = Split-Path -Parent $PSScriptRoot
$cli = Join-Path $kitRoot 'bin\natakorn.mjs'
if ($OverlayPath) {
    & node (Join-Path $PSScriptRoot 'sync-overlays.mjs') --source $OverlayPath --target $TargetPath --dry-run
    if ($LASTEXITCODE -ne 0) { throw 'Overlay validation failed.' }
}
$cliArguments = @($cli, 'init', '--target', $TargetPath, '--agent', 'all')
if ($DryRun) { $cliArguments += '--dry-run' }
& node @cliArguments
if ($LASTEXITCODE -ne 0) { throw 'Project bootstrap failed. Inspect the JSON report.' }
if ($OverlayPath -and -not $DryRun) {
    & node (Join-Path $PSScriptRoot 'sync-overlays.mjs') --source $OverlayPath --target $TargetPath
    if ($LASTEXITCODE -ne 0) { throw 'Overlay synchronization failed.' }
    & node (Join-Path $PSScriptRoot 'setup-project.mjs') --target $TargetPath
    if ($LASTEXITCODE -ne 0) { throw 'Project state refresh failed.' }
}
