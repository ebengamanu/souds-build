
import { Product, Sale, User, SubscriptionTier, Notification, UserRole, Ticket } from '../types';

const STORAGE_KEYS = {
  USERS: 'sounds_users',
  PRODUCTS: 'sounds_products',
  TICKETS: 'sounds_tickets',
  SALES: 'sounds_sales',
  CURRENT_USER: 'sounds_current_user',
  NOTIFICATIONS: 'sounds_notifications'
};

// Helper to mock delay
export const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export const getStoredUsers = (): User[] => {
  const data = localStorage.getItem(STORAGE_KEYS.USERS);
  return data ? JSON.parse(data) : [];
};

export const saveUser = (user: User) => {
  const users = getStoredUsers();
  // Initialize votes to 0 if new user
  // Initialize loyalty points and generate referral code
  const u = { 
      ...user, 
      votes: 0,
      loyaltyPoints: 0,
      referralCode: user.referralCode || (user.name.replace(/\s/g, '').toUpperCase().slice(0, 4) + Math.floor(Math.random() * 10000))
  };
  users.push(u);
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
};

export const updateUser = (updatedUser: User) => {
  const users = getStoredUsers();
  const index = users.findIndex(u => u.id === updatedUser.id);
  if (index !== -1) {
    users[index] = updatedUser;
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    // Update session if it's the current user
    const currentUser = getCurrentUser();
    if (currentUser && currentUser.id === updatedUser.id) {
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(updatedUser));
    }
  }
};

export const getCurrentUser = (): User | null => {
  const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
  return data ? JSON.parse(data) : null;
};

export const setCurrentUserSession = (user: User | null) => {
  if (user) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  } else {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  }
};

export const getStoredProducts = (): Product[] => {
  const data = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
  const products: Product[] = data ? JSON.parse(data) : [];
  // Ensure legacy data has likes and audioFiles
  return products.map(p => ({
      ...p, 
      likes: p.likes || 0,
      salesCount: p.salesCount || 0,
      audioFiles: p.audioFiles || []
  }));
};

export const saveProduct = (product: Product) => {
  const products = getStoredProducts();
  // Ensure new product has 0 likes if not set
  const p = { ...product, likes: 0 };
  products.push(p);
  localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
};

export const updateProduct = (product: Product) => {
  const products = getStoredProducts();
  const idx = products.findIndex(p => p.id === product.id);
  if (idx !== -1) {
    products[idx] = product;
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  }
};

export const toggleProductLike = (productId: string, increment: boolean) => {
    const products = getStoredProducts();
    const idx = products.findIndex(p => p.id === productId);
    if (idx !== -1) {
        // Prevent negative likes
        const currentLikes = products[idx].likes || 0;
        let newLikes = increment ? currentLikes + 1 : currentLikes - 1;
        if (newLikes < 0) newLikes = 0;
        
        products[idx].likes = newLikes;
        localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));

        // Notify Artist if it's a Like (increment true)
        if (increment) {
            addNotification({
                id: Math.random().toString(36).substr(2, 9),
                artistId: products[idx].artistId,
                message: `Quelqu'un a aimé votre titre "${products[idx].title}" !`,
                date: Date.now(),
                read: false
            });
        }

        return newLikes;
    }
    return 0;
};

export const deleteProduct = (productId: string) => {
    let products = getStoredProducts();
    products = products.filter(p => p.id !== productId);
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
}

// --- TICKET SYSTEM ---

export const getStoredTickets = (): Ticket[] => {
    const data = localStorage.getItem(STORAGE_KEYS.TICKETS);
    let tickets: Ticket[] = data ? JSON.parse(data) : [];
    
    // AUTO-DELETE EXPIRED TICKETS
    // Filter out tickets where the event date is in the past
    const now = Date.now();
    const activeTickets = tickets.filter(t => t.eventDate > now);
    
    // If we removed tickets, update storage immediately
    if (activeTickets.length !== tickets.length) {
        localStorage.setItem(STORAGE_KEYS.TICKETS, JSON.stringify(activeTickets));
    }

    return activeTickets;
};

export const saveTicket = (ticket: Ticket) => {
    const tickets = getStoredTickets();
    tickets.push(ticket);
    localStorage.setItem(STORAGE_KEYS.TICKETS, JSON.stringify(tickets));
};

export const updateTicket = (ticket: Ticket) => {
    const tickets = getStoredTickets();
    const idx = tickets.findIndex(t => t.id === ticket.id);
    if (idx !== -1) {
        tickets[idx] = ticket;
        localStorage.setItem(STORAGE_KEYS.TICKETS, JSON.stringify(tickets));
    }
};

export const deleteTicket = (ticketId: string) => {
    let tickets = getStoredTickets();
    tickets = tickets.filter(t => t.id !== ticketId);
    localStorage.setItem(STORAGE_KEYS.TICKETS, JSON.stringify(tickets));
};

// --- END TICKET SYSTEM ---

export const getStoredSales = (): Sale[] => {
  const data = localStorage.getItem(STORAGE_KEYS.SALES);
  return data ? JSON.parse(data) : [];
};

export const recordSale = (sale: Sale) => {
  const sales = getStoredSales();
  sales.push(sale);
  localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(sales));
  
  // Update product sales count
  const products = getStoredProducts();
  const productIdx = products.findIndex(p => p.id === sale.productId);
  if (productIdx !== -1) {
    products[productIdx].salesCount += 1;
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));

    // Create Notification for the artist
    addNotification({
        id: Math.random().toString(36).substr(2, 9),
        artistId: products[productIdx].artistId,
        message: `Nouvelle vente ! "${products[productIdx].title}" a été acheté pour ${sale.amount.toFixed(2)}€.`,
        date: Date.now(),
        read: false
    });
  }

  // Update Buyer Library if logged in
  const currentUser = getCurrentUser();
  if (currentUser && currentUser.role === UserRole.BUYER_PRO) {
      addProductToLibrary(currentUser.id, sale.productId);
  }
};

export const addProductToLibrary = (userId: string, productId: string) => {
    const users = getStoredUsers();
    const idx = users.findIndex(u => u.id === userId);
    if (idx !== -1) {
        const user = users[idx];
        const library = user.buyerLibrary || [];
        if (!library.includes(productId)) {
            library.push(productId);
            user.buyerLibrary = library;
            updateUser(user); // Persistence
            // Update session if it's current user
            const currentUser = getCurrentUser();
            if (currentUser && currentUser.id === userId) {
                setCurrentUserSession(user);
            }
        }
    }
}

export const recordShare = (productId: string) => {
    const products = getStoredProducts();
    const product = products.find(p => p.id === productId);
    if (product) {
        addNotification({
            id: Math.random().toString(36).substr(2, 9),
            artistId: product.artistId,
            message: `Votre œuvre "${product.title}" a été partagée !`,
            date: Date.now(),
            read: false
        });
    }
};

export const recordVote = (artistId: string) => {
    const users = getStoredUsers();
    const idx = users.findIndex(u => u.id === artistId);
    if (idx !== -1) {
        const user = users[idx];
        user.votes = (user.votes || 0) + 1;
        
        users[idx] = user;
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));

        addNotification({
            id: Math.random().toString(36).substr(2, 9),
            artistId: artistId,
            message: `Vous avez reçu un nouveau vote ! Total : ${user.votes}`,
            date: Date.now(),
            read: false
        });
        return user.votes;
    }
    return 0;
};

// --- LOYALTY & REFERRAL SYSTEM ---

export const addLoyaltyPoints = (userId: string, points: number) => {
    const users = getStoredUsers();
    const user = users.find(u => u.id === userId);
    
    // Only for Premium Buyers
    if (user && user.role === UserRole.BUYER_PRO && user.subscriptionTier === SubscriptionTier.BUYER_PREMIUM) {
        const currentPoints = user.loyaltyPoints || 0;
        const newPoints = currentPoints + points;
        
        user.loyaltyPoints = newPoints;
        
        // Check for Reward Threshold (100)
        if (user.loyaltyPoints >= 100) {
            user.loyaltyPoints = user.loyaltyPoints - 100; // Reset (or keep remainder)
            
            // Add 1 Month (30 days) to subscription
            // If subscription is expired, add to NOW. If active, add to END date.
            const now = Date.now();
            const currentExpiry = user.subscriptionEndDate > now ? user.subscriptionEndDate : now;
            const oneMonthMs = 30 * 24 * 60 * 60 * 1000;
            
            user.subscriptionEndDate = currentExpiry + oneMonthMs;
            
            // Optional: You could notify the user here via a flag or alert, 
            // but for now the updated date is the proof.
            console.log(`User ${user.name} earned a free month! New expiry: ${new Date(user.subscriptionEndDate)}`);
        }
        
        updateUser(user);
    }
};

export const processReferralReward = (newPremiumUserId: string) => {
    const users = getStoredUsers();
    const newUser = users.find(u => u.id === newPremiumUserId);
    
    if (newUser && newUser.referredBy) {
        // Find referrer and give 3 points
        addLoyaltyPoints(newUser.referredBy, 3);
    }
};

// --- END LOYALTY ---


export const getNotifications = (artistId: string): Notification[] => {
    const data = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    const all: Notification[] = data ? JSON.parse(data) : [];
    return all.filter(n => n.artistId === artistId).sort((a, b) => b.date - a.date);
};

export const addNotification = (notif: Notification) => {
    const data = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    const all: Notification[] = data ? JSON.parse(data) : [];
    all.push(notif);
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(all));
};

export const deleteNotification = (artistId: string, notifId: string) => {
    const data = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    let all: Notification[] = data ? JSON.parse(data) : [];
    // Filter out the specific notification
    all = all.filter(n => !(n.artistId === artistId && n.id === notifId));
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(all));
};

export const deleteAllNotifications = (artistId: string) => {
    const data = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    let all: Notification[] = data ? JSON.parse(data) : [];
    // Filter out all notifications for this artist
    all = all.filter(n => n.artistId !== artistId);
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(all));
};

export const deleteAccountData = (userId: string) => {
    // Remove products
    let products = getStoredProducts();
    products = products.filter(p => p.artistId !== userId);
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));

    // Remove tickets
    let tickets = getStoredTickets();
    tickets = tickets.filter(t => t.artistId !== userId);
    localStorage.setItem(STORAGE_KEYS.TICKETS, JSON.stringify(tickets));

    // Remove user
    let users = getStoredUsers();
    users = users.filter(u => u.id !== userId);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));

    // Clear session
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
}

// --- TOP SELLER ALGORITHM (Strict 30-Day Rolling Window) ---
export const getTopArtistsRecent = (): string[] => {
    const sales = getStoredSales();
    const products = getStoredProducts();
    const now = Date.now();
    
    // Strict 30-day window: [Now - 30 days] to [Now]
    const thirtyDaysInMs = 30 * 24 * 60 * 60 * 1000;
    const thresholdDate = now - thirtyDaysInMs;

    // Filter sales strictly within the last 30 days
    const recentSales = sales.filter(s => s.date >= thresholdDate);

    // Map sales volume to artists
    const artistSales: Record<string, number> = {};

    recentSales.forEach(sale => {
        const product = products.find(p => p.id === sale.productId);
        if (product) {
            if (!artistSales[product.artistId]) artistSales[product.artistId] = 0;
            artistSales[product.artistId] += sale.amount;
        }
    });

    // Sort by Total Sales Amount Descending and get top 4 IDs
    return Object.entries(artistSales)
        .sort(([, amountA], [, amountB]) => amountB - amountA)
        .slice(0, 4)
        .map(([artistId]) => artistId);
};


// --- YAMO / FOLLOW LOGIC ---

export const getArtists = (): User[] => {
    return getStoredUsers().filter(u => u.role === UserRole.ARTIST);
};

export const getFollowerCount = (artistId: string): number => {
    return getStoredUsers().filter(u => u.following?.includes(artistId)).length;
};

export const toggleFollowArtist = (userId: string, artistId: string): string[] => {
    const users = getStoredUsers();
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) return [];

    const user = users[userIndex];
    const following = user.following || [];
    const isFollowing = following.includes(artistId);

    let newFollowing: string[];
    if (isFollowing) {
        newFollowing = following.filter(id => id !== artistId);
    } else {
        newFollowing = [...following, artistId];
        // Notify Artist of new follower
        addNotification({
            id: Math.random().toString(36).substr(2, 9),
            artistId: artistId,
            message: `Nouvel abonné Yamo : ${user.name}`,
            date: Date.now(),
            read: false
        });
    }

    user.following = newFollowing;
    updateUser(user); // Persist
    
    // Update session if it's current user
    const currentUser = getCurrentUser();
    if (currentUser && currentUser.id === userId) {
        setCurrentUserSession(user);
    }

    return newFollowing;
};