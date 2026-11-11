/** "Por que perguntamos isso?" — uma explicação para cada pergunta do discovery técnico. */
export type LearningNote = { why: string; togaf: string; c4: string; good: string };

export const learningNotes: Record<string, LearningNote> = {
  // Migração & Cloud
  "Quais workloads, bancos e volumes estão no escopo?": {
    why: "Delimita o objeto da transformação e evita que o inventário seja confundido com escopo aprovado.",
    togaf: "Baseline da arquitetura de Aplicações, Dados e Tecnologia.",
    c4: "Alimenta System Landscape, Container e Deployment.",
    good: "Liste workload, função, ambiente, tecnologia, volume, owner e criticidade.",
  },
  "Quais dependências impedem mover cada workload isoladamente?": {
    why: "Dependências definem quais sistemas precisam migrar juntos e onde está o risco de quebra.",
    togaf: "Insumo para Gaps e para o planejamento de ondas na Transição.",
    c4: "Revela relações entre containers e sistemas externos no Context e no Container.",
    good: "Para cada workload, cite com quem conversa, por qual protocolo e o que acontece se a conexão cair.",
  },
  "Quais requisitos de RTO, RPO e janela de indisponibilidade existem?": {
    why: "Determina a estratégia de corte (big bang, paralela, replicação) e o custo da solução de continuidade.",
    togaf: "Requisitos não funcionais que restringem o TO-BE e a Transição.",
    c4: "Influencia o Deployment: réplicas, regiões e mecanismos de backup.",
    good: "Informe por sistema: tempo máximo parado, perda de dados aceitável e quando a janela pode acontecer.",
  },
  // IA & Agentes
  "Qual decisão ou tarefa humana o caso de uso pretende apoiar?": {
    why: "Começa pelo resultado e impede que a solução nasça como 'vamos colocar IA em alguma coisa'.",
    togaf: "Architecture Vision e motivadores de negócio.",
    c4: "Identifica pessoas, sistema em foco e relações no Context.",
    good: "Descreva ator, tarefa atual, dor, frequência e resultado esperado.",
  },
  "Quais fontes, sistemas e permissões alimentam a experiência?": {
    why: "A qualidade da resposta da IA depende das fontes, e o controle de acesso define o que cada pessoa pode ver.",
    togaf: "Baseline de Dados e requisitos de segurança.",
    c4: "Sistemas externos e data stores no Context e no Container.",
    good: "Liste cada fonte (Drive, SharePoint, ERP, banco), o formato, o volume e quem tem permissão hoje.",
  },
  "Qual tolerância a imprecisão e qual revisão humana são necessárias?": {
    why: "Define guardrails, avaliação e onde uma pessoa precisa aprovar antes de o resultado ter efeito.",
    togaf: "Princípios e critérios de Governança da solução.",
    c4: "Pode adicionar pessoas e etapas de aprovação nas relações do Context.",
    good: "Diga o impacto de um erro, quem revisa, em que momento e qual taxa de acerto seria aceitável.",
  },
  // Desenvolvimento
  "Quais aplicações compõem o produto e quem é responsável por elas?": {
    why: "Ownership claro evita que decisões de arquitetura fiquem sem dono e acelera validações.",
    togaf: "Baseline de Aplicações e mapa de stakeholders.",
    c4: "Define os containers e as fronteiras de responsabilidade.",
    good: "Liste aplicação, finalidade, time ou fornecedor responsável e criticidade para o negócio.",
  },
  "Quais runtimes, frameworks e versões sustentam a solução atual?": {
    why: "Versões fora de suporte e frameworks legados mudam o esforço e a estratégia (rehost, replatform, refactor).",
    togaf: "Baseline de Tecnologia e restrições do TO-BE.",
    c4: "Tecnologia anotada em cada container.",
    good: "Informe linguagem, framework, versão, sistema operacional e se há suporte do fabricante.",
  },
  "Como as aplicações se integram e quais contratos precisam ser preservados?": {
    why: "Integrações quebradas são a causa mais comum de incidentes em modernizações.",
    togaf: "Gaps e restrições de interoperabilidade.",
    c4: "Relações entre containers e sistemas externos, com protocolo.",
    good: "Para cada integração: origem, destino, protocolo (API, arquivo, fila, banco), frequência e quem consome.",
  },
  // CI/CD & DevOps
  "Como uma mudança percorre código, teste, aprovação e produção?": {
    why: "Revela o fluxo real de entrega, suas esperas, controles e pontos de falha.",
    togaf: "Baseline, gaps operacionais e oportunidades de transição.",
    c4: "Pode alimentar um Dynamic Diagram e o Deployment por ambiente.",
    good: "Narre desde o commit até produção, incluindo pessoas, ferramentas e gates.",
  },
  "Quais ambientes, artefatos, runners e secrets participam do fluxo?": {
    why: "Mostra a superfície de risco do pipeline e o que precisa ser replicado ou protegido no destino.",
    togaf: "Baseline de Tecnologia e requisitos de segurança.",
    c4: "Deployment: ambientes, nós e onde o pipeline executa.",
    good: "Liste ambientes, onde os artefatos ficam, onde rodam os jobs e como os secrets são guardados.",
  },
  "Quais controles são manuais e onde ocorrem falhas ou esperas?": {
    why: "Os pontos manuais e as falhas recorrentes são onde a automação gera valor mais rápido.",
    togaf: "Gaps e quick wins para a Transição.",
    c4: "Pode marcar pessoas e etapas manuais em um Dynamic Diagram.",
    good: "Cite a etapa, quanto tempo leva, com que frequência falha e quem é acionado.",
  },
  // On-premises
  "Como o ambiente físico e virtual está distribuído hoje?": {
    why: "A distribuição física define capacidade, pontos únicos de falha e o ponto de partida da migração.",
    togaf: "Baseline de Tecnologia.",
    c4: "Deployment: datacenters, clusters, hosts e VMs.",
    good: "Informe locais, quantidade de hosts e VMs, virtualizador e versão, storage e idade do hardware.",
  },
  "Quais redes, firewalls, rotas e serviços compartilhados são críticos?": {
    why: "Rede e serviços compartilhados (AD, DNS, impressão) costumam ser dependências escondidas.",
    togaf: "Baseline de Tecnologia e restrições de segurança.",
    c4: "Deployment: zonas de rede, firewalls e serviços de infraestrutura.",
    good: "Descreva segmentos, links, VPNs, firewalls e quais serviços todos os sistemas usam.",
  },
  "Quem opera cada camada e quais contratos ou limitações existem?": {
    why: "Contratos, fornecedores e equipes definem prazos, responsabilidades e o que pode mudar.",
    togaf: "Stakeholders, restrições e Governança.",
    c4: "Fronteiras de responsabilidade (boundaries) no Deployment.",
    good: "Para cada camada: quem opera, contrato, vencimento, multa ou limitação relevante.",
  },
  // Dados & DW
  "Quais fontes alimentam a plataforma e em que frequência?": {
    why: "Fontes e frequência definem o desenho de ingestão e o custo da plataforma.",
    togaf: "Baseline de Dados.",
    c4: "Sistemas externos e data stores no Context e no Container.",
    good: "Liste fonte, tecnologia, volume, frequência de carga e quem é dono do dado.",
  },
  "Como ingestão, transformação, qualidade e linhagem funcionam hoje?": {
    why: "Revela retrabalho, falhas silenciosas e o quanto da lógica de negócio está escondida em ETLs.",
    togaf: "Baseline de Dados e Gaps de qualidade.",
    c4: "Containers de ingestão e transformação, com suas relações.",
    good: "Descreva ferramentas, quantidade de jobs, onde ficam as regras e como erros são detectados.",
  },
  "Quem consome os dados e quais SLAs orientam disponibilidade e atualização?": {
    why: "Consumidores e SLAs definem o que é 'pronto' e priorizam o que migrar primeiro.",
    togaf: "Requisitos do TO-BE e critérios de sucesso.",
    c4: "Pessoas e sistemas consumidores no Context.",
    good: "Liste áreas, relatórios críticos, horário em que precisam estar atualizados e impacto de atraso.",
  },
  // Perguntas de fase (transversais)
  "Qual mudança de negócio ou operação precisa ser viabilizada?": {
    why: "Sem um objetivo de negócio claro, a arquitetura vira lista de tecnologias.",
    togaf: "Architecture Vision: motivadores, metas e critérios de sucesso.",
    c4: "Define o sistema em foco e as pessoas do Context.",
    good: "Descreva o resultado esperado, como será medido e até quando.",
  },
  "O que impede o cenário atual de atender o resultado esperado?": {
    why: "Os gaps conectam o AS-IS ao TO-BE e justificam cada mudança proposta.",
    togaf: "Gap Analysis entre baseline e target.",
    c4: "Indica elementos que mudam, entram ou saem entre os diagramas atual e alvo.",
    good: "Liste cada impedimento, sua causa e a evidência que o sustenta.",
  },
  "Quais capacidades precisam existir no cenário-alvo?": {
    why: "Descrever capacidades antes de produtos evita amarrar a solução cedo demais.",
    togaf: "Target Architecture.",
    c4: "Base para o Context e o Container do cenário-alvo.",
    good: "Escreva no formato 'ser capaz de…', com o requisito de negócio que cada capacidade atende.",
  },
  "Quais dependências definem a ordem das ondas de mudança?": {
    why: "A ordem das ondas reduz risco e mostra valor cedo.",
    togaf: "Opportunities & Solutions e Migration Planning.",
    c4: "Diagramas intermediários (transition states) quando ajudam a explicar.",
    good: "Liste o que precisa vir antes de quê, quick wins possíveis e estados intermediários aceitáveis.",
  },
  "Quais decisões, responsáveis e critérios sustentarão a arquitetura?": {
    why: "Sem dono e critério, a arquitetura se perde depois do projeto.",
    togaf: "Implementation Governance e Architecture Change Management.",
    c4: "Mantém os diagramas como fonte viva, atualizados a cada decisão.",
    good: "Registre decisões (ADRs), responsáveis, fóruns de aprovação e indicadores de acompanhamento.",
  },
};

export const defaultLearningNote = (phaseName: string): LearningNote => ({
  why: "Conecta a resposta ao objetivo da fase e evita decisões sem evidência.",
  togaf: `${phaseName}: produz evidência para baseline, gap ou target.`,
  c4: "Pode alterar pessoas, sistemas, containers, relações ou nós de deployment.",
  good: "Seja específica, identifique fonte, responsável, ambiente e o que ainda precisa ser confirmado.",
});
