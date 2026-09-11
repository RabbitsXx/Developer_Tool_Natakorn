[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)][string]$TargetPath
)

$ErrorActionPreference = 'Stop'
$kitRoot = Split-Path -Parent $PSScriptRoot

if (-not (Test-Path -LiteralPath $TargetPath -PathType Container)) {
    throw "Target directory does not exist: $TargetPath"
}

$target = (Resolve-Path -LiteralPath $TargetPath).Path
$sourceRoot = Join-Path $kitRoot 'templates'

$copies = @(
    @{ Source = '..\START_PROMPT.md'; Destination = 'START_PROMPT.md' },
    @{ Source = '.gitignore'; Destination = '.gitignore' },
    @{ Source = '.editorconfig'; Destination = '.editorconfig' },
    @{ Source = 'AGENTS.md'; Destination = 'AGENTS.md' },
    @{ Source = 'PROJECT_CONTEXT.md'; Destination = 'PROJECT_CONTEXT.md' },
    @{ Source = 'run.md'; Destination = 'docs\run.md' },
    @{ Source = 'env.example'; Destination = '.env.example' },
    @{ Source = 'repomix.config.json'; Destination = 'repomix.config.json' },
    @{ Source = 'repomixignore'; Destination = '.repomixignore' }
)

Write-Output "Bootstrapping AI project files into: $target"

foreach ($copy in $copies) {
    $source = Join-Path $sourceRoot $copy.Source
    $destination = Join-Path $target $copy.Destination

    if (Test-Path -LiteralPath $destination) {
        Write-Output ("[SKIP] {0} already exists; merge it manually." -f $copy.Destination)
        continue
    }

    $parent = Split-Path -Parent $destination
    if (-not (Test-Path -LiteralPath $parent)) {
        New-Item -ItemType Directory -Path $parent | Out-Null
    }

    Copy-Item -LiteralPath $source -Destination $destination
    Write-Output ("[ADD]  {0}" -f $copy.Destination)
}

$syncScript = Join-Path $kitRoot 'scripts\sync-skills.mjs'
if (-not (Test-Path -LiteralPath $syncScript)) {
    throw 'Agent Skills sync script is missing.'
}

& node $syncScript --target $target
if ($LASTEXITCODE -ne 0) { throw 'Agent Skills sync failed.' }

$setupScript = Join-Path $kitRoot 'scripts\setup-project.mjs'
if (Test-Path -LiteralPath $setupScript) {
    & node $setupScript --target $target
    if ($LASTEXITCODE -ne 0) { throw 'AI Project Kit detector failed.' }
}

Write-Output 'Done. Paste START_PROMPT.md into the AI agent, then let it continue from .ai-kit/project.json.'
Write-Output 'Agent Skills installed as instructions only under .ai-kit/skills/ (SKILL.md + references per pack); load only the pack that matches the task.'
Write-Output 'Optional starters (not auto-installed): Playwright, axe accessibility, Knip, Lefthook, and GitHub Actions templates under templates/optional/'
