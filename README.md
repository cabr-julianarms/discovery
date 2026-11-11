# Discovery Architecture Lab

Aplicação de discovery comercial e técnico: qualificação inicial, trilhas combináveis, jornada de arquitetura e saídas padronizadas para CRM e Engenharia.

Site estático (React + Vite + Tailwind), sem backend, sem credenciais e sem chamadas de IA. Publicado no GitHub Pages.

## Executar localmente

Requer Node.js 24 ou superior.

```sh
npm ci
npm run dev
```

Validação e build de produção:

```sh
npm run typecheck
npm test
npm run build     # gera dist/
npm run preview
```

## Publicação no GitHub Pages

O workflow [.github/workflows/deploy.yml](.github/workflows/deploy.yml) valida (typecheck, testes, build) a cada push e pull request, e publica no GitHub Pages a cada push na branch `main`.

Configuração única no repositório: **Settings → Pages → Build and deployment → Source: GitHub Actions**.

O build usa caminhos relativos (`base: "./"`), então funciona em qualquer endereço, como `usuario.github.io/nome-do-repo/`.

## Dados

Os projetos são salvos **somente no navegador atual** (localStorage), pelo botão Salvar. Não há sincronização, backup nem salvamento automático, e projetos salvos em outro endereço do site não aparecem aqui. Use exemplos fictícios ou anonimizados.

## Funcionalidades

- Qualificação a partir de contexto livre e cinco perguntas universais.
- Trilhas de migração, IA, desenvolvimento, CI/CD, on-premises e dados.
- Perguntas específicas por trilha, com seleção manual e sugestões por sinais textuais.
- Jornada Objetivo → AS-IS → Gaps → TO-BE → Transição → Governança.
- Guia e representação ilustrativa C4, glossário e explicações de perguntas.
- Texto padronizado para CRM, lacunas e handoff para Engenharia.
- Projetos salvos, reabertura e edição no mesmo navegador.

## Organização

- `config/tracks.ts`: catálogo de trilhas, perguntas e sinais.
- `lib/discovery-rules.ts`: reconhecimento textual e cobertura por respostas.
- `lib/local-discoveries.ts`: armazenamento local versionado.
- `app/page.tsx`: interface e geração dos blocos comerciais.
- `components/ui/`: componentes shadcn/ui usados pela interface.
- `tests/lab/`: testes de regras e de preservação dos dados locais.

O reconhecimento por palavras-chave sugere trilhas e precisa de revisão humana. A porcentagem representa perguntas preenchidas, não qualidade ou validação das evidências.
