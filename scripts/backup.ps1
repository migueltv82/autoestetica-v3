$ErrorActionPreference = "Stop"
$projectRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$backupRoot = Join-Path $projectRoot "backups"
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$target = Join-Path $backupRoot $timestamp

New-Item -ItemType Directory -Path $target -Force | Out-Null
Write-Host "Generando respaldo en $target"

npx supabase db dump --linked --file (Join-Path $target "schema.sql")
npx supabase db dump --linked --data-only --file (Join-Path $target "data.sql")
npx supabase db dump --linked --role-only --file (Join-Path $target "roles.sql")

Get-FileHash -Algorithm SHA256 (Join-Path $target "*.sql") |
  Select-Object Path, Hash |
  Export-Csv -NoTypeInformation -Encoding UTF8 (Join-Path $target "checksums.csv")

Write-Host "Respaldo terminado. Copialo a una ubicación cifrada fuera de este equipo."
