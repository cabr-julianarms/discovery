# Discovery Architecture Lab

Aplicação de discovery comercial e técnico: qualificação inicial, trilhas combináveis, jornada de arquitetura e saídas padronizadas para CRM e Engenharia.

Site estático (React + Vite + Tailwind), sem backend e sem chave de API. Publicado no GitHub Pages.

## Funcionalidades

- **Qualificar oportunidade**: contexto livre, cinco perguntas universais, trilhas sugeridas por palavras-chave e perguntas de qualificação por trilha. Gera o resumo para CRM e o handoff para Engenharia.
- **Discovery técnico**: jornada Objetivo → AS-IS → Gaps → TO-BE → Transição → Governança, com “Por que perguntamos isso?” em todas as perguntas, cobertura e resumo copiável.
- **Pilares do Google Cloud Architecture Framework**: aba com perguntas transversais (operação, segurança, confiabilidade, custo e desempenho), válidas para qualquer trilha.
- **Estratégia por workload (7 Rs)**: com a trilha de Migração, a aba Workloads registra o destino de cada sistema (retire, retain, rehost, relocate, repurchase, replatform, refactor). A IA também sugere.
- **Analisar com IA (sem API)**: o site monta um pedido com o contexto, as respostas e as lacunas. A pessoa cola no assistente de IA que já usa (ChatGPT, Gemini…) e cola a resposta de volta. O site lê o JSON e mostra para revisão:
  - trilhas sugeridas, com motivo e confiança;
  - respostas encontradas no material, com o trecho de evidência. Deduções da IA entram marcadas como “[A confirmar]”;
  - perguntas para o cliente, frentes a explorar e riscos, que ficam no projeto e entram nos textos de CRM e handoff.
- **Projetos**: salvamento automático no navegador, exclusão, exportação e importação em `.json` para backup ou para passar a um colega.
- Guias de TOGAF, C4, Architecture Framework, 7 Rs, trilhas e glossário.

## Dados e privacidade

- Tudo fica **somente no navegador** de quem usa (localStorage). Não há servidor nem sincronização. Limpar os dados do navegador apaga os projetos; use **Exportar** para backup.
- O pedido para a IA remove e-mails e telefones automaticamente. Nomes e outros dados continuam no texto. Use a conta de IA aprovada pela empresa para dados de cliente.
- O contexto da empresa enviado à IA fica em `COMPANY_CONTEXT`, em [lib/ai-assist.ts](lib/ai-assist.ts).

## Executar localmente

Requer Node.js 24 ou superior.

```sh
npm ci
npm run dev        # servidor local
npm run typecheck
npm test
npm run build      # gera dist/
```

## Publicação

O workflow [.github/workflows/deploy.yml](.github/workflows/deploy.yml) roda typecheck, testes e build a cada push e pull request, e publica no GitHub Pages a cada push na `main`. No repositório, **Settings → Pages → Source** deve estar em **GitHub Actions**.

## Organização

| Caminho | Conteúdo |
| --- | --- |
| `config/tracks.ts` | Trilhas: perguntas de qualificação, perguntas técnicas, sinais e especialista |
| `config/phases.ts` | Fases da jornada |
| `config/frameworks.ts` | Pilares do Architecture Framework e 7 Rs de migração |
| `config/learning-notes.ts` | Explicações “Por que perguntamos isso?” |
| `lib/qualification.ts` | Maturidade, próxima ação e textos de CRM, handoff e resumo do discovery |
| `lib/ai-assist.ts` | Pedido para a IA e leitura da resposta |
| `lib/discovery-rules.ts` | Reconhecimento por palavras-chave e cobertura |
| `lib/local-discoveries.ts` | Projetos salvos, importação e exportação |
| `app/App.tsx` | Navegação e rascunhos de trabalho |
| `app/views/` | Telas |
| `app/components/` | Componentes do app (painel de IA, sugestões, perguntas…) |
| `components/ui/` | Componentes shadcn/ui |
| `app/globals.css` | Paleta de cores (tokens) e tipografia |
| `tests/lab/` | Testes das regras, textos, IA e armazenamento |

Para mudar perguntas ou trilhas, edite `config/tracks.ts`: o site, o pedido para a IA e os textos se ajustam sozinhos.

O reconhecimento por palavras-chave e as sugestões da IA precisam de revisão humana. A porcentagem de cobertura mede perguntas preenchidas, não a qualidade das evidências.
