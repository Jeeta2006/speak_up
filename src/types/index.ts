export type Sector = 'Education' | 'Healthcare' | 'BBMP/Infra' | 'Police/Other';

export type ReportStatus = 'Received' | 'Review' | 'Verified' | 'Actioned';

export type ToastType = 'success' | 'amber' | 'error';

export type Screen = 'report' | 'feed' | 'map' | 'dashboard' | 'demo';

export type SortOption = 'newest' | 'upvotes';

export type EvidenceItem = {
  type: 'image' | 'video';
  data: string;
  file?: File | Blob;
};

export type Comment = {
  text: string;
  time: string;
};

export type EvidenceCount = {
  photos: number;
  videos: number;
};

export type Report = {
  id: string;
  token: string;
  sector: Sector;
  description: string;
  ward: string;
  lat: number;
  lng: number;
  timestamp: number;
  status: ReportStatus;
  upvotes: number;
  comments: Comment[];
  evidenceCount: EvidenceCount;
  evidenceData?: EvidenceItem[];
};

export type Toast = {
  id: string;
  msg: string;
  type: ToastType;
};

export type Coords = {
  lat: number;
  lng: number;
};

export type SectorStyle = {
  cls: string;
  text: string;
};
