import type {
  ExecutionAction,
  PhotoRequirement,
  Recurrence,
  Role,
  TaskStatus
} from "./types";

export const APP_NAME = "Checklist Operacional D&D";

export const ROLE_LABELS: Record<Role, string> = {
  admin: "Gerente Comercial",
  supervisor: "Supervisor",
  manager: "Gerente de Loja"
};

export const ROLE_DESCRIPTIONS: Record<Role, string> = {
  admin: "Acesso total à rede de lojas",
  supervisor: "Lojas sob sua supervisão",
  manager: "Somente a sua loja"
};

export const STATUS_LABELS: Record<TaskStatus, string> = {
  pending: "Pendente",
  in_progress: "Em andamento",
  completed: "Concluída",
  correction_requested: "Aguardando correção",
  rejected: "Reprovada pelo supervisor"
};

export const STATUS_ORDER: TaskStatus[] = [
  "pending",
  "in_progress",
  "completed",
  "correction_requested",
  "rejected"
];

export const RECURRENCE_LABELS: Record<Recurrence, string> = {
  daily: "Diária",
  weekly: "Semanal",
  monthly: "Mensal",
  once: "Pontual"
};

export const PHOTO_LABELS: Record<PhotoRequirement, string> = {
  required: "Foto obrigatória",
  optional: "Foto opcional",
  none: "Sem foto"
};

export const ACTION_LABELS: Record<ExecutionAction, string> = {
  created: "Tarefa gerada",
  started: "Iniciou a tarefa",
  completed: "Concluiu a tarefa",
  correction_requested: "Solicitou correção",
  rejected: "Reprovou a tarefa",
  approved: "Aprovou a execução",
  reopened: "Reabriu a tarefa",
  photo_added: "Anexou foto",
  photo_removed: "Removeu foto",
  observation: "Registrou observação",
  updated: "Atualizou a tarefa"
};

export const NAV_ITEMS = [
  { href: "/painel", label: "Painel", icon: "LayoutDashboard", roles: ["admin", "supervisor", "manager"] },
  { href: "/atividades", label: "Atividades", icon: "ClipboardCheck", roles: ["admin", "supervisor", "manager"] },
  { href: "/lojas", label: "Lojas", icon: "Store", roles: ["admin", "supervisor", "manager"] },
  { href: "/usuarios", label: "Usuários", icon: "Users", roles: ["admin"] },
  { href: "/categorias", label: "Categorias", icon: "FolderTree", roles: ["admin"] },
  { href: "/modelos", label: "Modelos de tarefas", icon: "ListChecks", roles: ["admin"] },
  { href: "/relatorios", label: "Relatórios", icon: "FileSpreadsheet", roles: ["admin", "supervisor", "manager"] },
  { href: "/historico", label: "Histórico", icon: "History", roles: ["admin", "supervisor", "manager"] }
] as const;

export const MAX_PHOTO_MB = Number(process.env.NEXT_PUBLIC_MAX_PHOTO_MB ?? 10);
export const MAX_PHOTOS_PER_TASK = Number(process.env.NEXT_PUBLIC_MAX_PHOTOS_PER_TASK ?? 5);

export const DEFAULT_CATEGORIES = [
  { name: "Organização de Estoque", description: "Organização, separação e identificação do estoque", sortOrder: 1 },
  { name: "Organização de Produtos e Prateleiras", description: "Exposição, abastecimento e precificação", sortOrder: 2 },
  { name: "Limpeza e Conservação", description: "Limpeza e conservação geral da loja", sortOrder: 3 },
  { name: "Comunicação Visual", description: "Mural, campanhas e materiais informativos", sortOrder: 4 },
  { name: "Rotinas Administrativas", description: "Controles internos e solicitações da gestão", sortOrder: 5 }
];

export const DEFAULT_TEMPLATES: {
  category: string;
  title: string;
  description: string;
  recurrence: Recurrence;
  photoRequirement: PhotoRequirement;
  dueTime: string;
}[] = [
  // A. Organização de Estoque
  { category: "Organização de Estoque", title: "Organização geral do estoque", description: "Manter o estoque limpo, acessível e com corredores livres.", recurrence: "daily", photoRequirement: "required", dueTime: "10:00" },
  { category: "Organização de Estoque", title: "Separação de produtos por categorias", description: "Separar os produtos por categoria e família.", recurrence: "weekly", photoRequirement: "required", dueTime: "11:00" },
  { category: "Organização de Estoque", title: "Identificação correta dos produtos", description: "Conferir etiquetas e identificações de todos os produtos.", recurrence: "weekly", photoRequirement: "optional", dueTime: "11:30" },
  { category: "Organização de Estoque", title: "Organização de caixas e materiais", description: "Empilhar caixas com segurança e organizar materiais de apoio.", recurrence: "weekly", photoRequirement: "required", dueTime: "12:00" },
  { category: "Organização de Estoque", title: "Verificação de produtos parados", description: "Identificar produtos sem movimentação e reportar à gestão.", recurrence: "monthly", photoRequirement: "optional", dueTime: "15:00" },
  { category: "Organização de Estoque", title: "Conferência de produtos sem identificação", description: "Localizar e identificar produtos sem etiqueta ou código.", recurrence: "weekly", photoRequirement: "required", dueTime: "14:00" },

  // B. Organização de Produtos e Prateleiras
  { category: "Organização de Produtos e Prateleiras", title: "Organização dos produtos nas prateleiras", description: "Alinhar, agrupar e organizar os produtos nas prateleiras.", recurrence: "daily", photoRequirement: "required", dueTime: "10:30" },
  { category: "Organização de Produtos e Prateleiras", title: "Produtos posicionados corretamente", description: "Conferir posicionamento conforme o plano de exposição.", recurrence: "daily", photoRequirement: "optional", dueTime: "11:00" },
  { category: "Organização de Produtos e Prateleiras", title: "Exposição conforme padrão da marca", description: "Validar a exposição visual conforme o padrão D&D.", recurrence: "weekly", photoRequirement: "required", dueTime: "12:00" },
  { category: "Organização de Produtos e Prateleiras", title: "Abastecimento de produtos", description: "Repor produtos faltantes e manter a exposição completa.", recurrence: "daily", photoRequirement: "optional", dueTime: "09:30" },
  { category: "Organização de Produtos e Prateleiras", title: "Verificação de precificação", description: "Conferir etiquetas de preço e promover correções.", recurrence: "weekly", photoRequirement: "required", dueTime: "13:00" },
  { category: "Organização de Produtos e Prateleiras", title: "Organização de displays e materiais promocionais", description: "Organizar displays e materiais de campanha.", recurrence: "weekly", photoRequirement: "required", dueTime: "14:00" },

  // C. Limpeza e Conservação
  { category: "Limpeza e Conservação", title: "Limpeza de prateleiras", description: "Limpar prateleiras e remover poeira dos produtos.", recurrence: "daily", photoRequirement: "required", dueTime: "09:00" },
  { category: "Limpeza e Conservação", title: "Limpeza de balcões", description: "Limpar balcões, caixa e áreas de atendimento.", recurrence: "daily", photoRequirement: "optional", dueTime: "09:30" },
  { category: "Limpeza e Conservação", title: "Limpeza e organização do estoque", description: "Limpar o estoque e manter o ambiente seguro.", recurrence: "weekly", photoRequirement: "required", dueTime: "16:00" },
  { category: "Limpeza e Conservação", title: "Limpeza da área de atendimento", description: "Limpar piso, vidros e área de circulação.", recurrence: "daily", photoRequirement: "none", dueTime: "10:00" },
  { category: "Limpeza e Conservação", title: "Conservação geral da loja", description: "Verificar iluminação, mobiliário e conservação geral.", recurrence: "monthly", photoRequirement: "optional", dueTime: "17:00" },

  // D. Comunicação Visual
  { category: "Comunicação Visual", title: "Atualização do mural", description: "Atualizar o mural de comunicados internos.", recurrence: "weekly", photoRequirement: "required", dueTime: "10:00" },
  { category: "Comunicação Visual", title: "Retirada de comunicados antigos", description: "Remover comunicados e materiais vencidos.", recurrence: "weekly", photoRequirement: "optional", dueTime: "10:30" },
  { category: "Comunicação Visual", title: "Atualização de campanhas", description: "Aplicar as campanhas vigentes conforme orientação.", recurrence: "monthly", photoRequirement: "required", dueTime: "11:00" },
  { category: "Comunicação Visual", title: "Organização de materiais informativos", description: "Organizar folders, cartazes e materiais informativos.", recurrence: "weekly", photoRequirement: "optional", dueTime: "11:30" },

  // E. Rotinas Administrativas
  { category: "Rotinas Administrativas", title: "Conferência de informações", description: "Conferir informações operacionais e registros internos.", recurrence: "daily", photoRequirement: "none", dueTime: "17:00" },
  { category: "Rotinas Administrativas", title: "Atualização de controles internos", description: "Atualizar planilhas e controles da loja.", recurrence: "weekly", photoRequirement: "optional", dueTime: "17:30" },
  { category: "Rotinas Administrativas", title: "Verificação de comunicados", description: "Ler e confirmar os comunicados da gestão.", recurrence: "daily", photoRequirement: "none", dueTime: "18:00" },
  { category: "Rotinas Administrativas", title: "Cumprimento de atividades solicitadas pela gestão", description: "Executar as solicitações encaminhadas pela gerência comercial.", recurrence: "once", photoRequirement: "optional", dueTime: "18:00" }
];

export const DEMO_CREDENTIALS = [
  { role: "Gerente Comercial (admin)", email: "admin@dd.local", password: "Dd@2026!" },
  { role: "Supervisora", email: "supervisor@dd.local", password: "Dd@2026!" },
  { role: "Gerente de Loja", email: "gerente@dd.local", password: "Dd@2026!" }
];

