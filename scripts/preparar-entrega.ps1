param(
    [string]$Identificacao = 'INTEGRANTES_A_PREENCHER'
)

$ErrorActionPreference = 'Stop'

# A identificação é somente o nome de uma pasta, por exemplo os dois nomes completos.
if ([string]::IsNullOrWhiteSpace($Identificacao) -or
    $Identificacao -in @('.', '..') -or
    $Identificacao.IndexOfAny([IO.Path]::GetInvalidFileNameChars()) -ge 0) {
    throw 'Informe uma identificação válida para a pasta, sem barras ou caracteres especiais de caminho.'
}

$raizProjeto = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '..')).Path
$pastaEntrega = Join-Path $raizProjeto 'entrega'
$pastaIdentificada = Join-Path $pastaEntrega $Identificacao
$pastaProjeto = Join-Path $pastaIdentificada 'TDE--Analisador_Lexico'
$arquivoZip = Join-Path $pastaEntrega 'TDE--Analisador_Lexico.zip'

New-Item -ItemType Directory -Path $pastaProjeto -Force | Out-Null

# Lista explícita: não copia .git, dependências, capturas de tela ou a própria entrega.
$itens = @('index.html', 'styles.css', 'README.md', 'package.json', 'js', 'tests', 'docs', 'scripts')
foreach ($item in $itens) {
    Copy-Item -LiteralPath (Join-Path $raizProjeto $item) -Destination $pastaProjeto -Recurse -Force
}

Compress-Archive -LiteralPath $pastaIdentificada -DestinationPath $arquivoZip -Force
Write-Output "Pasta de entrega: $pastaProjeto"
Write-Output "Pacote ZIP: $arquivoZip"
Write-Output 'Preencha os nomes no README antes de gerar a versão definitiva para o Google Drive.'
