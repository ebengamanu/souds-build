
export enum UserRole {
  ARTIST = 'ARTIST',
  BUYER = 'BUYER',
  BUYER_PRO = 'BUYER_PRO'
}

export enum SubscriptionTier {
  TRIAL = 'TRIAL',
  BASIC = 'BASIC', 
  PRO = 'PRO', 
  UNLIMITED = 'UNLIMITED', 
  BUYER_FREE = 'BUYER_FREE',
  BUYER_PREMIUM = 'BUYER_PREMIUM'
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  createdAt: number;
  subscriptionTier: SubscriptionTier;
  subscriptionEndDate: number;
  isYearly: boolean;
  paymentApiConnected: boolean;
  profilePictureUrl?: string; 
  paymentApiKey?: string;
  buyerLibrary?: string[];
  following?: string[];
  hasCompletedOnboarding?: boolean;
  votes?: number;
  loyaltyPoints?: number;
  referralCode?: string;
  referredBy?: string;
}

export enum ProductCategory {
  POP = 'Pop',
  RAP = 'Rap',
  RNB = 'R&B',
  JAZZ = 'Jazz',
  ROCK = 'Rock',
  AFROBEAT = 'Afrobeat',
  GOSPEL = 'Gospel',
  ELECTRO = 'Electro',
  VARIETE = 'Variété',
  MBOLE = 'Mbolé',
  PODCAST = 'Podcast',
  FILM = 'Film',
  LIVRE = 'Livre'
}

export interface ProductComment {
  id: string;
  userId: string;
  userName: string;
  userPic?: string;
  text: string;
  timestamp: number;
  likes: number;
  reactions: { type: 'heart' | 'cry' | 'angry' | 'like', count: number }[];
  replies?: ProductComment[];
}

export interface Product {
  id: string;
  artistId: string;
  artistName: string;
  title: string;
  type: 'SONG' | 'ALBUM' | 'VIDEO' | 'LIVE' | 'PDF';
  category: ProductCategory;
  description: string;
  price: number;
  discountPercent: number; 
  coverUrl: string; 
  audioFiles: { title: string; url: string; originalName: string }[];
  videoUrl?: string;
  trailerUrl?: string;
  pdfUrl?: string;
  duration?: string;
  isLive?: boolean;
  publishedAt: number;
  salesCount: number;
  likes: number;
  comments?: ProductComment[];
}

export interface Ticket {
  id: string;
  artistId: string;
  eventName: string;
  performerName: string;
  images: string[];
  price: number;
  discountPercent: number;
  eventDate: number;
  location: {
      country: string;
      city: string;
      place: string;
      mapsUrl: string;
  };
  refundPolicy: string;
  publishedAt: number;
  stock?: number;
}

export interface Sale {
  id: string;
  productId: string;
  productTitle: string; 
  amount: number;
  date: number;
}

export interface Notification {
  id: string;
  artistId: string;
  message: string;
  date: number;
  read: boolean;
}
