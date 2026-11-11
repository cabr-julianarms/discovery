import { CloudCog, Sparkles, Code2, GitBranch, HardDrive, Database } from "lucide-react";

export type Track = {
  id: string;
  name: string;
  short: string;
  color: string;
  icon: typeof CloudCog;
  questions: string[];
  qualificationQuestions: string[];
  specialist: string;
  signals: string[];
};
export const tracks: Track[] = [
  {
    id: "migration",
    name: "Migração & Cloud",
    short: "Inventário, dependências, ondas e destino",
    color: "#5aa8ff",
    icon: CloudCog,
    questions: [
      "Quais workloads, bancos e volumes estão no escopo?",
      "Quais dependências impedem mover cada workload isoladamente?",
      "Quais requisitos de RTO, RPO e janela de indisponibilidade existem?",
    ],
    qualificationQuestions: [
      "O que vocês pretendem mover: servidores, aplicações, bancos ou todo o ambiente?",
      "Os servidores usam Windows ou Linux? Quais versões?",
      "As licenças de Windows e banco pertencem à empresa, são assinatura ou vieram com o servidor?",
      "Quantos servidores existem e, se souberem, qual CPU, memória e armazenamento de cada um?",
      "Existe alguma data, contrato ou fim de suporte motivando a migração?",
    ],
    specialist: "Arquiteto(a) de Cloud e Migração",
    signals: [
      "projeto de migracao", "migracao de", "migrar para", "migrar servidores",
      "migrar ambiente", "migrate to gcp", "mover para nuvem", "move to cloud",
      "cloud migration", "rehost", "replatform", "lift and shift",
      "modernizar infraestrutura",
    ],
  },
  {
    id: "ai",
    name: "IA & Agentes",
    short: "Casos, fontes, guardrails e valor",
    color: "#b989ff",
    icon: Sparkles,
    questions: [
      "Qual decisão ou tarefa humana o caso de uso pretende apoiar?",
      "Quais fontes, sistemas e permissões alimentam a experiência?",
      "Qual tolerância a imprecisão e qual revisão humana são necessárias?",
    ],
    qualificationQuestions: [
      "Qual atividade as pessoas esperam realizar com IA no dia a dia?",
      "Quantos usuários começariam e quais áreas participariam?",
      "A IA usará apenas conhecimento geral ou também documentos e sistemas internos?",
      "Quais dados não podem ser expostos e quem poderá acessar cada informação?",
      "O resultado será apenas consultado ou a IA também deverá executar ações em algum sistema?",
    ],
    specialist: "Especialista em Data & AI / Gemini Enterprise",
    signals: [
      "inteligencia artificial", " ia ", "gemini", "chatgpt", "agente", "agentes",
      "llm", "licencas", "licença", "automacao", "automação", "generativa",
    ],
  },
  {
    id: "development",
    name: "Desenvolvimento",
    short: "Aplicações, runtime, código e integrações",
    color: "#ff9d66",
    icon: Code2,
    questions: [
      "Quais aplicações compõem o produto e quem é responsável por elas?",
      "Quais runtimes, frameworks e versões sustentam a solução atual?",
      "Como as aplicações se integram e quais contratos precisam ser preservados?",
    ],
    qualificationQuestions: [
      "Qual aplicação ou ERP está envolvido e para que ela é usada?",
      "A solução foi desenvolvida pela empresa ou por um fornecedor? Quem dá suporte?",
      "Em qual linguagem, framework e versão ela foi construída? Se não souberem, quem pode confirmar?",
      "Ela possui API ou já se integra com outros sistemas? Existe documentação?",
      "A necessidade é consultar informações, gerar arquivos ou também cadastrar e alterar dados?",
    ],
    specialist: "Arquiteto(a) de Aplicações e Integração",
    signals: [
      "aplicacao", "aplicação", "erp", "sistema", "api", "integracao", "integração",
      "codigo", "código", "java", ".net", "delphi", "python", "microsservico",
    ],
  },
  {
    id: "cicd",
    name: "CI/CD & DevOps",
    short: "Fluxo, ambientes, controles e entrega",
    color: "#53d8a0",
    icon: GitBranch,
    questions: [
      "Como uma mudança percorre código, teste, aprovação e produção?",
      "Quais ambientes, artefatos, runners e secrets participam do fluxo?",
      "Quais controles são manuais e onde ocorrem falhas ou esperas?",
    ],
    qualificationQuestions: [
      "Onde o código-fonte está armazenado atualmente?",
      "Como uma alteração é testada, aprovada e publicada em produção?",
      "Quais ferramentas de pipeline, repositório e automação são usadas?",
      "Existem ambientes separados de desenvolvimento, homologação e produção?",
      "Qual é o principal problema atual: demora, falhas, trabalho manual ou falta de controle?",
    ],
    specialist: "Especialista em DevOps / SRE",
    signals: [
      "ci/cd", "cicd", "devops", "pipeline", "github", "gitlab", "jenkins",
      "deploy", "deployment", "kubernetes", "gke", "docker", "terraform",
    ],
  },
  {
    id: "onprem",
    name: "On-premises",
    short: "Datacenter, rede, capacidade e operação",
    color: "#ffd45a",
    icon: HardDrive,
    questions: [
      "Como o ambiente físico e virtual está distribuído hoje?",
      "Quais redes, firewalls, rotas e serviços compartilhados são críticos?",
      "Quem opera cada camada e quais contratos ou limitações existem?",
    ],
    qualificationQuestions: [
      "O ambiente fica na empresa, em datacenter próprio ou em um fornecedor?",
      "Os servidores são físicos ou máquinas virtuais? Qual virtualizador é utilizado?",
      "Quais sistemas operacionais e versões estão instalados?",
      "Como funcionam internet, firewall, VPN e acesso remoto ao ambiente?",
      "Quem administra servidores e rede e quem deverá participar da próxima conversa?",
    ],
    specialist: "Arquiteto(a) de Infraestrutura e Redes",
    signals: [
      "on-premise", "on premise", "onprem", "servidor local", "servidores locais", "fisico", "físico", "vmware",
      "hyper-v", "firewall", "vpn", "rede", "switch", "fortigate", "servidor proprio",
    ],
  },
  {
    id: "data",
    name: "Dados & DW",
    short: "Fontes, ingestão, qualidade e consumo",
    color: "#ff718d",
    icon: Database,
    questions: [
      "Quais fontes alimentam a plataforma e em que frequência?",
      "Como ingestão, transformação, qualidade e linhagem funcionam hoje?",
      "Quem consome os dados e quais SLAs orientam disponibilidade e atualização?",
    ],
    qualificationQuestions: [
      "Quais bancos, planilhas, ERPs ou outras fontes possuem os dados necessários?",
      "Qual banco de dados é utilizado e qual é a versão: SQL Server, Oracle, PostgreSQL, MySQL ou outro?",
      "Qual é o tamanho aproximado e quanto ele cresce por mês ou por ano?",
      "Hoje existe Data Warehouse, Data Lake, ETL ou ferramenta de BI? Quais tecnologias?",
      "Os dados precisam ser atualizados em tempo real, várias vezes ao dia ou em cargas periódicas?",
      "Quem usa relatórios e dashboards e quais problemas existem com qualidade, confiança ou demora?",
    ],
    specialist: "Especialista em Dados, Banco e Analytics",
    signals: [
      "dados", "banco", "database", "sql server", "oracle", "postgres", "mysql",
      "data warehouse", " dw ", "datalake", "data lake", "etl", "bi", "power bi",
      "dashboard", "relatorio", "relatório", "bigquery", "analytics",
    ],
  },
];
