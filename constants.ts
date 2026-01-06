
import { ProductCategory, SubscriptionTier } from './types';

export const APP_NAME = "Sounds";
export const TICKET_FEE = 2.00;
export const MEDIA_COMMISSION = 2.00; // Commission fixe de 2€ sur podcasts, films et lives

export const SUBSCRIPTION_PLANS = [
  {
    id: SubscriptionTier.BASIC,
    name: "Basique",
    price: 9.99,
    uploadLimit: 5,
    features: ["5 Contenus/mois", "Statistiques de base", "Support email"]
  },
  {
    id: SubscriptionTier.PRO,
    name: "Pro",
    price: 15.99,
    uploadLimit: 10,
    features: ["10 Contenus/mois", "Statistiques avancées", "Badge certifié", "Support prioritaire"]
  },
  {
    id: SubscriptionTier.UNLIMITED,
    name: "Illimité",
    price: 19.99,
    uploadLimit: 9999,
    features: ["Uploads illimités", "Analytics complets", "Promotion mise en avant", "Support VIP 24/7"]
  }
];

export const BUYER_PLANS = [
    {
        id: SubscriptionTier.BUYER_FREE,
        name: "Gratuit",
        price: 0,
        features: ["Stockage 5 titres", "Écoute/Lecture en ligne", "Qualité Standard"]
    },
    {
        id: SubscriptionTier.BUYER_PREMIUM,
        name: "Premium",
        price: 3.99,
        features: ["Stockage Illimité", "Mode Hors-ligne", "Haute Qualité (1080p)", "Support Prioritaire"]
    }
];

export const CATEGORIES = Object.values(ProductCategory);
export const LANDING_BG_IMAGE = "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=2070&auto=format&fit=crop";

export const PROTECTION_TEXT = {
  intro: "Sur Sounds, chaque morceau, album, podcast, film ou livre acheté est automatiquement protégé grâce à un système de watermark personnalisé et des métadonnées invisibles intégrées au fichier.",
  details: [
    {
      title: "Métadonnées Inviolables",
      desc: "Informations invisibles (ex: 'Propriété de Sounds #ABC123')."
    },
    {
      title: "Shadow Watermark",
      desc: "Signal caché résistant à la compression pour identifier l'acheteur originel."
    }
  ]
};

export const POLICIES = {
    PURCHASE: `
## Politique d'Achat - Sounds Gold

**1. Achats & Bibliothèque**
Vos achats sont stockés de manière sécurisée dans votre bibliothèque "Mes contenus" sur le cloud Sounds. Accès illimité via PWA.

**2. Limites de Stockage (Compte Gratuit)**
5 titres/fichiers max. Passez Premium (3.99€/mois) pour l'illimité.

**3. Podcasts, Films & Livres**
Les contenus vidéo sont visionnables en 16:9 haute qualité. Les livres (PDF) sont consultables via notre lecteur sécurisé. Le mode hors-ligne est réservé aux membres Premium.
    `
};
