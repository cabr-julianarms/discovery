import { Gauge, PiggyBank, ShieldCheck, ShieldHalf, Wrench } from "lucide-react";
import type { LearningNote } from "./learning-notes";

/**
 * Pilares do Google Cloud Architecture Framework, usados como bloco transversal
 * de perguntas: valem para qualquer trilha.
 */
export const pillars = [
  {
    id: "operations",
    name: "Excelência operacional",
    icon: Wrench,
    summary: "Monitorar, operar e evoluir a solução com previsibilidade: observabilidade, automação, gestão de incidentes e mudanças.",
    question: "Como o ambiente é monitorado hoje e quem responde quando algo dá errado?",
    note: {
      why: "Mostra a maturidade operacional e quem vai sustentar a solução depois da entrega.",
      togaf: "Baseline operacional e requisitos de Governança.",
      c4: "Pode adicionar sistemas de monitoramento e pessoas de operação no Context.",
      good: "Cite ferramentas de monitoramento e alerta, horário de suporte, quem é acionado e como mudanças são aprovadas.",
    },
  },
  {
    id: "security",
    name: "Segurança, privacidade e conformidade",
    icon: ShieldHalf,
    summary: "Identidade e acesso, proteção de dados, rede segura, auditoria e requisitos legais ou setoriais (LGPD, BACEN, ANS, PCI).",
    question: "Quais exigências de segurança, acesso e conformidade (LGPD, normas do setor, auditorias) se aplicam?",
    note: {
      why: "Requisitos de segurança e conformidade restringem arquitetura, região, fornecedores e prazos.",
      togaf: "Restrições e princípios do TO-BE; insumo para Governança.",
      c4: "Fronteiras de confiança, zonas de rede e sistemas de identidade no Context e no Deployment.",
      good: "Diga quais normas se aplicam, onde os dados podem ficar, como é o login (AD, SSO, MFA) e quem aprova acessos.",
    },
  },
  {
    id: "reliability",
    name: "Confiabilidade",
    icon: ShieldCheck,
    summary: "Disponibilidade, tolerância a falhas, backup e recuperação de desastres, de acordo com o impacto de cada sistema no negócio.",
    question: "Qual disponibilidade se espera e qual o impacto para o negócio se o sistema parar?",
    note: {
      why: "Define redundância, multi-zona ou multi-região e estratégia de backup, que mudam bastante o custo.",
      togaf: "Requisitos não funcionais do TO-BE.",
      c4: "Réplicas, zonas e regiões no Deployment.",
      good: "Informe horário crítico de uso, SLA desejado, impacto por hora parada e como é o backup hoje.",
    },
  },
  {
    id: "cost",
    name: "Otimização de custos",
    icon: PiggyBank,
    summary: "Visibilidade e controle do gasto: custo atual, orçamento, modelo de compra, responsáveis e práticas de FinOps.",
    question: "Qual é o custo atual do ambiente, qual o orçamento e quem aprova o gasto com nuvem?",
    note: {
      why: "Sem a linha de base de custo não há como mostrar ganho, e sem o aprovador a proposta trava.",
      togaf: "Motivadores de negócio e critérios de sucesso da Architecture Vision.",
      c4: "Não muda o diagrama, mas orienta o dimensionamento do Deployment.",
      good: "Traga custo mensal aproximado (infra, licenças, contratos), orçamento previsto, modelo de compra e quem decide.",
    },
  },
  {
    id: "performance",
    name: "Otimização de desempenho",
    icon: Gauge,
    summary: "Capacidade e escalabilidade: volumes, picos, latência e crescimento esperado, para dimensionar sem desperdício.",
    question: "Quais volumes, picos de uso e tempos de resposta a solução precisa suportar?",
    note: {
      why: "Volumes e picos definem o dimensionamento e se a solução precisa escalar automaticamente.",
      togaf: "Requisitos não funcionais do TO-BE.",
      c4: "Tecnologia e escala dos containers; nós e autoscaling no Deployment.",
      good: "Informe usuários simultâneos, transações ou dados por dia, sazonalidade, crescimento previsto e tempo de resposta aceitável.",
    },
  },
] as const satisfies readonly {
  id: string;
  name: string;
  icon: typeof Wrench;
  summary: string;
  question: string;
  note: LearningNote;
}[];

export const pillarQuestions = pillars.map((pillar) => pillar.question);

/** Os 7 Rs de migração: a decisão por workload. */
export const migrationStrategies = [
  {
    id: "retire",
    name: "Retire",
    label: "Desativar",
    summary: "O sistema não é mais necessário: desliga em vez de migrar.",
    when: "Pouco ou nenhum uso, função duplicada ou substituída.",
    ask: "Quem ainda usa? O que acontece se desligar?",
  },
  {
    id: "retain",
    name: "Retain",
    label: "Manter onde está",
    summary: "Fica no ambiente atual por enquanto.",
    when: "Restrição legal, dependência forte, fim de vida próximo ou migração sem retorno agora.",
    ask: "O que impede de mover? Até quando fica assim?",
  },
  {
    id: "rehost",
    name: "Rehost",
    label: "Mover como está (lift and shift)",
    summary: "Leva a VM ou o servidor para a nuvem sem mudar a aplicação.",
    when: "Prazo curto (ex.: fim de contrato de datacenter), aplicação estável, pouca equipe para mudanças.",
    ask: "Sistema operacional e versão são suportados? Há licenças atreladas ao hardware?",
  },
  {
    id: "relocate",
    name: "Relocate",
    label: "Realocar a plataforma",
    summary: "Move a plataforma de virtualização inteira (ex.: VMware para Google Cloud VMware Engine).",
    when: "Muitas VMs em VMware, necessidade de sair rápido do datacenter mantendo ferramentas e processos.",
    ask: "Qual a versão do VMware? Quantos hosts e VMs? Como está o licenciamento?",
  },
  {
    id: "repurchase",
    name: "Repurchase",
    label: "Trocar por SaaS",
    summary: "Substitui o sistema por um produto pronto, geralmente SaaS.",
    when: "Função comum de mercado (e-mail, CRM, RH) e customizações pouco relevantes.",
    ask: "Quais customizações são essenciais? Há dados e integrações para migrar?",
  },
  {
    id: "replatform",
    name: "Replatform",
    label: "Ajustar a plataforma",
    summary: "Pequenas mudanças para usar serviços gerenciados (ex.: banco para Cloud SQL, app para containers).",
    when: "Ganho claro de operação ou custo com esforço moderado.",
    ask: "Quais componentes poderiam virar serviço gerenciado? Há janela para testes?",
  },
  {
    id: "refactor",
    name: "Refactor",
    label: "Reescrever ou modernizar",
    summary: "Redesenha a aplicação para ser nativa de nuvem (microsserviços, serverless).",
    when: "A aplicação é estratégica e a arquitetura atual limita o negócio.",
    ask: "Existe equipe e orçamento para desenvolvimento? Qual o ganho esperado?",
  },
] as const;

export type MigrationStrategyId = (typeof migrationStrategies)[number]["id"];
