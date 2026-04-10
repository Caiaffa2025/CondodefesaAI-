export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  plan: 'free' | 'pro' | 'condo';
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
  notificationsEnabled?: boolean;
  createdAt: string;
}

export interface CondoCase {
  id?: string;
  userId: string;
  problemType: 'multa' | 'abuso_sindico' | 'taxa_indevida' | 'abuso_taxas' | 'vizinhanca' | 'obras_irregulares' | 'outro';
  customProblemType?: string;
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
  detailedReport?: string;
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

export interface FAQ {
  id?: string;
  question: string;
  answer: string;
  order?: number;
  createdAt: string;
}
