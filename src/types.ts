export interface UserProfile {
  userId: string;
  name: string;
  email: string;
  region?: string;
  createdAt: string;
}

export interface ScanResult {
  id: string;
  userId: string;
  imageUrl: string;
  diseaseName: string;
  confidence: number;
  treatment: string;
  details: string;
  location?: {
    lat: number;
    lng: number;
  };
  createdAt: string;
}

export interface CommunityAlert {
  id: string;
  diseaseName: string;
  location: {
    lat: number;
    lng: number;
  };
  intensity: number; // 1-10
  updatedAt: string;
}

export interface Message {
  role: 'user' | 'model';
  content: string;
}
