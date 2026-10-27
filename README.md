# Trabalho-Bio

Site de documentação de um projeto de bioinformática (interação proteína–ligante),
publicado no GitHub Pages com **versionamento automático**: cada push na `main`
atualiza a versão de desenvolvimento e cada tag `v*` publica uma nova versão
estável, que o visitante pode escolher num seletor no cabeçalho da página.

Site publicado: <https://richardblasty.github.io/Trabalho-Bio/>

## Conteúdo do projeto

```
.
├── index.html                    # Página principal da documentação (HTML estático)
├── style.css                     # Estilos (tokens de design, temas claro/escuro, responsividade)
├── script.js                     # Tema, idioma EN/PT, menu móvel, busca e seção atual
├── version-selector.js           # Seletor de versões injetado no site publicado
├── proteina-ligante.png          # Imagem original da estrutura proteína–ligante (fallback)
├── images/                       # Versões WebP otimizadas da imagem (480, 640 e 1160 px)
├── docs/                         # Textos do trabalho em Markdown (introdução, metodologia, ...)
├── scripts/
│   └── prepare_site.py           # Monta a pasta .versioned-docs/ usada no build
├── mkdocs.yml                    # Configuração do MkDocs (tema Material + provedor de versões mike)
├── requirements.txt              # Dependências Python: mkdocs-material e mike
└── .github/workflows/
    └── deploy-docs.yml           # Pipeline de build e publicação versionada
```

### Página (`index.html`)

A página é uma documentação em HTML puro, sem dependências externas, com:

- cabeçalho fixo com busca, seletor de versão, idioma EN/PT, tema claro/escuro e link
  para o repositório; abaixo de 1024 px esses controles ficam num menu;
- seção inicial com o objetivo do projeto, o fluxo dos três produtos e a imagem da proteína;
- seções **Overview**, **Architecture** (entradas e saídas de cada produto), **CpHMD**
  (Produto 1), **GROMACS / MM-PBSA** (Produto 2), **ΔG Analysis** (Produto 3),
  **Governance** (registros RDC/RDM com data, versão, status e link para a ficha original),
  **Team & HPC** e **References**;
- índice lateral "Nesta página" (a partir de 1024 px) que destaca a seção atual.

Os IDs das seções (`#getting-started`, `#project`, `#installation`, `#examples`, `#help`,
`#governance`, `#team`, `#cite`) foram mantidos para não quebrar links já publicados.

**Idioma.** Cada texto traduzível tem os atributos `data-en` e `data-pt`. Quando o texto
contém marcação (`<code>`, links), o elemento recebe também `data-html` e o `script.js`
usa `innerHTML`. A escolha fica salva em `localStorage` (`project-language`).

**Tema.** Um script inline no `<head>` aplica `data-theme` em `<html>` antes da primeira
pintura, usando a escolha salva (`project-theme`) ou a preferência do sistema.

**Busca.** O índice é montado a partir do texto da própria página (títulos, parágrafos,
linhas de tabela), no idioma atual e no outro idioma. Atalho `/`; setas e Enter navegam
pelos resultados.

### Textos do trabalho (`docs/`)

| Arquivo             | Conteúdo                         |
| ------------------- | -------------------------------- |
| `index.md`          | Apresentação da documentação     |
| `introduction.md`   | Visão geral e objetivos          |
| `methodology.md`    | Abordagem e etapas               |
| `results.md`        | Resultados obtidos               |
| `discussion.md`     | Análise e discussão              |
| `conclusion.md`     | Considerações finais             |
| `references.md`     | Referências bibliográficas       |

> Hoje esses arquivos ainda são modelos (com *placeholders*) e **não entram no site
> publicado**: o `mkdocs.yml` usa `docs_dir: .versioned-docs`, que contém apenas a
> página HTML e seus recursos.

## Versionamento (backend)

O versionamento é feito com [mike](https://github.com/jimporter/mike), que guarda
cada versão do site como uma subpasta da branch `gh-pages`, mais um arquivo
`versions.json` listando as versões e seus apelidos (*aliases*).

### Fluxo do pipeline

O workflow [`.github/workflows/deploy-docs.yml`](.github/workflows/deploy-docs.yml)
roda em push na `main`, em push de tags `v*` e manualmente (`workflow_dispatch`).
Ele tem dois jobs:

**1. `deploy-docs`** — gera e grava a versão na branch `gh-pages`

1. Faz checkout com histórico completo (`fetch-depth: 0`), necessário para o mike
   ler e atualizar a `gh-pages`.
2. Instala Python 3.12 e as dependências do `requirements.txt`.
3. Executa `scripts/prepare_site.py`, que monta `.versioned-docs/`:
   - copia `index.html`, `style.css`, `script.js` e `version-selector.js`
     (falha se algum estiver faltando);
   - copia as pastas `images/`, `img/`, `assets/` e `fonts/`, se existirem;
   - copia `proteina-ligante.png` para `images/proteina-ligante.png`;
   - na **cópia** do HTML, corrige `css/style.css` → `style.css` e
     `js/script.js` → `script.js`, e insere `<script src="version-selector.js">`
     antes de `</body>`. Os arquivos originais não são alterados.
4. Confere se os arquivos essenciais existem em `.versioned-docs/` e valida o build
   com `mkdocs build`.
5. Publica a versão conforme o evento:

   | Evento               | Comando                                                                 | Resultado                                                         |
   | -------------------- | ----------------------------------------------------------------------- | ----------------------------------------------------------------- |
   | push na `main`       | `mike deploy --push dev`                                                | Atualiza a versão `dev` em `/Trabalho-Bio/dev/`                   |
   | push de tag `vX.Y.Z` | `mike deploy --push --update-aliases --alias-type=copy "$VERSION" latest` | Cria `/Trabalho-Bio/vX.Y.Z/` e copia essa versão para `/latest/`  |
   |                      | `mike set-default --push "$VERSION"`                                    | Faz a raiz do site redirecionar para essa versão                  |

**2. `publish-pages`** — depois do job anterior, faz checkout da branch `gh-pages`
e a publica no GitHub Pages com `upload-pages-artifact` e `deploy-pages`.

O `concurrency` (`documentation-deploy`, sem cancelamento) garante que dois deploys
não escrevam na `gh-pages` ao mesmo tempo.

### Estrutura publicada

```
gh-pages/
├── index.html        # redireciona para a versão padrão (última tag)
├── versions.json     # lista de versões e aliases, mantida pelo mike
├── dev/              # último estado da main
├── latest/           # cópia da última versão estável
├── v1.0.0/
└── v1.1.0/
```

### Seletor de versões (frontend)

`version-selector.js` roda no site publicado e:

1. descobre a versão atual pelo caminho da URL (o trecho logo após `/Trabalho-Bio/`);
2. baixa `/Trabalho-Bio/versions.json`;
3. cria um `<select>` no início de `.header-actions`, marcando com `(latest)` a versão
   que tem esse alias e deixando selecionada a versão (ou alias) que está aberta;
4. ao trocar a opção, navega para `/Trabalho-Bio/<versão>/`.

Se `versions.json` não puder ser carregado (por exemplo, abrindo o HTML localmente),
o erro vai para o console e o seletor simplesmente não aparece.

> O caminho base `/Trabalho-Bio/` está fixo em `version-selector.js`. Se o
> repositório for renomeado, atualize esse valor e o `site_url` do `mkdocs.yml`.

## Como publicar

Versão de desenvolvimento — basta enviar para a `main`:

```bash
git push origin main
```

Nova versão estável — crie e envie uma tag começando com `v`:

```bash
git tag v1.0.0
```

```bash
git push origin v1.0.0
```

No repositório do GitHub, em **Settings → Pages**, a fonte deve estar como
**GitHub Actions**, e o workflow precisa de permissão de escrita (já declarada em
`permissions: contents: write`).

## Rodando localmente

Instale as dependências:

```bash
python -m pip install -r requirements.txt
```

Monte a pasta usada no build (os caminhos de CSS, JS e imagem do `index.html`
original só ficam corretos nessa cópia):

```bash
python scripts/prepare_site.py
```

Sirva o site com o MkDocs e abra <http://127.0.0.1:8000>:

```bash
mkdocs serve
```

Para ver o site versionado com o seletor funcionando, use o mike localmente (cria
commits na sua `gh-pages` local, sem enviar ao GitHub):

```bash
mike deploy dev
```

```bash
mike serve
```

## Licença

Distribuído sob a licença MIT. Veja [LICENSE](LICENSE).
