export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  plan: 'free' | 'pro';
  condoConvention?: {
    name: string;
    data: string; // base64
    uploadedAt: string;
  };
  internalRegulations?: {
    name: string;
    data: string; // base64
    uploadedAt: string;
  };
  createdAt: string;
}

export interface CondoCase {
  id?: string;
  userId: string;
  problemType: 'multa' | 'abuso_sindico' | 'taxa_indevida' | 'outro';
  description: string;
  condoName: string;
  condoAddress: string;
  location: string;
  managerName: string;
  numApartments: number;
  numTowers: number;
  triedToResolve: boolean;
  severity: 'baixo' | 'medio' | 'alto';
  diagnosis: string;
  rights: string;
  nextSteps: string;
  documents: {
    notificacao: string;
    pedido: string;
    impugnacao: string;
    notificacaoInadimplencia: string;
  };
  feedback?: {
    helpful: boolean;
    comment?: string;
    createdAt: string;
  };
  notificationsEnabled?: boolean;
  status?: 'pendente' | 'resolvido';
  createdAt: string;
}
