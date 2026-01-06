
import React, { useState, useEffect, useRef } from 'react';
import { User, Product, ProductCategory, SubscriptionTier, Sale, Ticket } from '../types';
import { getStoredProducts, recordSale, toggleProductLike, updateUser, deleteAccountData, getStoredUsers, recordShare, getArtists, toggleFollowArtist, recordVote, getTopArtistsRecent, getFollowerCount, addLoyaltyPoints, processReferralReward, getStoredTickets, updateTicket } from '../services/store';
import { Button } from '../components/Button';
import { 
  Home, Music, Crown, User as UserIcon, Search, Heart, LogOut, Trash2, 
  Play, Pause, X, CreditCard, CheckCircle, Share2, MapPin, Calendar, Download, Hotel, Car, Mic, Film, Book, WifiOff, ListMusic, Trophy
} from 'lucide-react';

interface BuyerProDashboardProps {
  user: User;
  onLogout: () => void;
  onNavigate: (view: string) => void;
}

export const BuyerProDashboard: React.FC<BuyerProDashboardProps> = ({ user, onLogout, onNavigate }) => {
  const [currentUser, setCurrentUser] = useState<User>(user);
  const [activeTab, setActiveTab] = useState<'home' | 'library' | 'vote' | 'premium' | 'profile'>('home');
  const [products, setProducts] = useState<Product[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [artists, setArtists] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'detail'>('list');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  useEffect(() => {
    setProducts(getStoredProducts());
    setTickets(getStoredTickets());
    setArtists(getArtists());
  }, []);

  const libraryProductIds = currentUser.buyerLibrary || [];
  const myLibrary = products.filter(p => libraryProductIds.includes(p.id));
  const isPremium = currentUser.subscriptionTier === SubscriptionTier.BUYER_PREMIUM;

  const renderHome = () => (
    <div className="p-6 pb-32 animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-black italic tracking-tighter italic uppercase">SOUNDS <span className="text-red-600">GOLD</span></h1>
        <div className="bg-stone-900 text-white p-2 rounded-xl text-xs font-black">PRO</div>
      </div>

      <div className="bg-gradient-to-br from-[#2C1B10] to-[#5D4037] p-8 rounded-[40px] text-white shadow-2xl relative overflow-hidden mb-8">
          <div className="relative z-10">
              <p className="text-red-500 font-black uppercase text-[10px] tracking-[0.3em] mb-2">Exclusivité Sounds</p>
              <h2 className="text-3xl font-black italic italic uppercase tracking-tighter leading-none mb-4">Rejoins les <br/>Sounds Awards 🏆</h2>
              <Button onClick={() => setActiveTab('vote')} className="bg-red-600 text-white rounded-2xl py-3 px-8 text-[11px] font-black uppercase tracking-widest border-none">Voter Maintenant</Button>
          </div>
          <Trophy className="absolute -right-6 -bottom-6 text-white/5 w-40 h-40" />
      </div>

      <h2 className="text-xl font-black italic uppercase mb-6 tracking-tighter">Accès Rapide</h2>
      <div className="grid grid-cols-2 gap-4">
          <div onClick={() => { setActiveTab('home'); onNavigate('marketplace'); }} className="bg-white p-6 rounded-3xl border border-stone-100 shadow-sm flex flex-col items-center gap-3 active:scale-95 transition-all">
              <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center"><Film size={24}/></div>
              <span className="text-[10px] font-black uppercase tracking-widest">Marketplace</span>
          </div>
          <div onClick={() => setActiveTab('library')} className="bg-white p-6 rounded-3xl border border-stone-100 shadow-sm flex flex-col items-center gap-3 active:scale-95 transition-all">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center"><ListMusic size={24}/></div>
              <span className="text-[10px] font-black uppercase tracking-widest">Ma Liste</span>
          </div>
      </div>
    </div>
  );

  const renderLibrary = () => (
      <div className="p-6 pb-32 animate-fade-in space-y-10">
          <h2 className="text-4xl font-black italic italic uppercase tracking-tighter mb-4">Ma Liste</h2>
          
          {/* MOVIES & PODCASTS */}
          <div>
              <h3 className="text-[10px] font-black text-stone-400 uppercase tracking-[0.3em] mb-5 flex items-center gap-2">🎬 Films & Podcasts</h3>
              <div className="space-y-6">
                  {myLibrary.filter(p => p.category === ProductCategory.FILM || p.category === ProductCategory.PODCAST).length === 0 ? (
                      <div className="bg-stone-50 p-10 rounded-3xl text-center text-stone-300 text-[10px] font-black uppercase tracking-widest">Vide</div>
                  ) : myLibrary.filter(p => p.category === ProductCategory.FILM || p.category === ProductCategory.PODCAST).map(p => (
                      <div key={p.id} className="relative aspect-video rounded-3xl overflow-hidden shadow-2xl group" onClick={() => { setSelectedProduct(p); setViewMode('detail'); }}>
                          <img src={p.coverUrl} className="w-full h-full object-cover"/>
                          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
                          <div className="absolute bottom-5 left-5">
                              <p className="text-white font-black text-xl italic uppercase tracking-tighter mb-1">{p.title}</p>
                              <p className="text-stone-300 text-[10px] font-black uppercase tracking-widest">{p.artistName}</p>
                          </div>
                          <div className="absolute top-5 right-5">
                              {isPremium && <div className="bg-green-500 text-white text-[9px] font-black px-3 py-1 rounded-full flex items-center gap-1 shadow-lg"><WifiOff size={10}/> OFFLINE</div>}
                          </div>
                      </div>
                  ))}
              </div>
          </div>

          {/* BOOKS */}
          <div>
              <h3 className="text-[10px] font-black text-stone-400 uppercase tracking-[0.3em] mb-5 flex items-center gap-2">📚 Bibliothèque Livres</h3>
              <div className="grid grid-cols-2 gap-5">
                  {myLibrary.filter(p => p.category === ProductCategory.LIVRE).map(p => (
                      <div key={p.id} className="group" onClick={() => { setSelectedProduct(p); setViewMode('detail'); }}>
                          <div className="aspect-[2/3] rounded-2xl overflow-hidden shadow-xl mb-2 relative">
                              <img src={p.coverUrl} className="w-full h-full object-cover"/>
                              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors"></div>
                          </div>
                          <p className="font-black text-xs uppercase truncate px-1">{p.title}</p>
                      </div>
                  ))}
              </div>
          </div>

          {/* MUSIC */}
          <div>
              <h3 className="text-[10px] font-black text-stone-400 uppercase tracking-[0.3em] mb-5 flex items-center gap-2">🎵 Mes Hits</h3>
              <div className="space-y-3">
                  {myLibrary.filter(p => ![ProductCategory.FILM, ProductCategory.PODCAST, ProductCategory.LIVRE].includes(p.category)).map(p => (
                      <div key={p.id} className="bg-white p-4 rounded-3xl border border-stone-100 shadow-sm flex items-center gap-4 active:bg-stone-50 transition-colors" onClick={() => { setSelectedProduct(p); setViewMode('detail'); }}>
                          <img src={p.coverUrl} className="w-14 h-14 rounded-2xl object-cover shadow-lg"/>
                          <div className="flex-1 min-w-0">
                              <p className="font-black text-sm uppercase italic truncate">{p.title}</p>
                              <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest">{p.artistName}</p>
                          </div>
                          <button className="w-10 h-10 bg-red-50 text-red-600 rounded-full flex items-center justify-center shadow-inner"><Play size={18} fill="currentColor"/></button>
                      </div>
                  ))}
              </div>
          </div>
      </div>
  );

  const renderDetailView = () => {
    if(!selectedProduct) return null;
    const isVideo = selectedProduct.category === ProductCategory.FILM || selectedProduct.category === ProductCategory.PODCAST;
    
    return (
        <div className="fixed inset-0 z-[60] bg-white animate-slide-up flex flex-col pb-safe">
             <div className="p-5 flex justify-between items-center bg-white border-b border-stone-100" style={{ paddingTop: 'calc(env(safe-area-inset-top) + 1rem)' }}>
                 <button onClick={() => setViewMode('list')} className="p-2.5 bg-stone-100 rounded-2xl"><X size={20}/></button>
                 <span className="font-black text-[10px] uppercase tracking-[0.3em] text-stone-400">{selectedProduct.category}</span>
                 <button className="p-2.5 bg-stone-100 rounded-2xl"><Share2 size={20}/></button>
             </div>
             
             <div className="flex-1 overflow-y-auto p-6">
                 <div className={`w-full rounded-[40px] overflow-hidden bg-black shadow-2xl mb-8 ${isVideo ? 'aspect-video' : 'aspect-square'}`}>
                     <img src={selectedProduct.coverUrl} className="w-full h-full object-cover opacity-60"/>
                     <div className="absolute inset-0 flex items-center justify-center">
                        <button className="w-24 h-24 bg-red-600 text-white rounded-full flex items-center justify-center shadow-2xl scale-110 active:scale-95 transition-transform">
                            <Play size={40} fill="white" className="ml-2"/>
                        </button>
                     </div>
                 </div>

                 <h1 className="text-4xl font-black uppercase italic tracking-tighter mb-2 leading-none">{selectedProduct.title}</h1>
                 <p className="text-xl font-black text-stone-300 uppercase tracking-widest mb-8">{selectedProduct.artistName}</p>

                 <div className="bg-stone-50 p-8 rounded-[40px] border border-stone-100 mb-8">
                     <p className="text-stone-600 leading-relaxed font-medium italic opacity-70">"{selectedProduct.description || "Aucune description fournie."}"</p>
                 </div>

                 {/* AGODA & VEHICLE - DESIGN CONSERVATION */}
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <a href="https://sovrn.co/1andbi6" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 bg-blue-50 p-6 rounded-3xl border border-blue-100 active:scale-95 transition-all">
                        <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200"><Hotel size={24}/></div>
                        <div><p className="font-black text-blue-900 text-sm italic">Réserver Hôtel</p><p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Agoda Deals</p></div>
                    </a>
                    <a href="https://sovrn.co/9chsaoz" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 bg-red-50 p-6 rounded-3xl border border-red-100 active:scale-95 transition-all">
                        <div className="w-12 h-12 bg-red-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-red-200"><Car size={24}/></div>
                        <div><p className="font-black text-red-900 text-sm italic">Louer Véhicule</p><p className="text-[10px] font-bold text-red-400 uppercase tracking-widest">EconomyBooking</p></div>
                    </a>
                 </div>
             </div>
             
             <div className="p-5">
                 <Button fullWidth className="py-5 rounded-[30px] shadow-2xl text-lg tracking-tighter">DÉMARRER LA LECTURE</Button>
             </div>
        </div>
    );
  };

  return (
    <div className="min-h-screen bg-white">
        {activeTab === 'home' && renderHome()}
        {activeTab === 'library' && renderLibrary()}
        {activeTab === 'vote' && <div className="p-6">Awards en cours...</div>}
        {activeTab === 'profile' && <div className="p-6"><Button onClick={onLogout}>Quitter</Button></div>}
        {viewMode === 'detail' && renderDetailView()}

        <nav className="fixed bottom-0 left-0 w-full bg-[#1a1a1a] text-white border-t border-white/5 h-20 z-40 pb-safe shadow-2xl">
            <div className="flex justify-around items-center h-full max-w-lg mx-auto px-4">
                <NavBtn icon={<Home size={24}/>} active={activeTab === 'home'} onClick={() => setActiveTab('home')}/>
                <NavBtn icon={<ListMusic size={24}/>} active={activeTab === 'library'} onClick={() => setActiveTab('library')}/>
                <NavBtn icon={<Trophy size={24}/>} active={activeTab === 'vote'} onClick={() => setActiveTab('vote')}/>
                <NavBtn icon={<UserIcon size={24}/>} active={activeTab === 'profile'} onClick={() => setActiveTab('profile')}/>
            </div>
        </nav>
    </div>
  );
};

const NavBtn = ({ icon, active, onClick }: any) => (
    <button onClick={onClick} className={`p-4 rounded-3xl transition-all duration-300 ${active ? 'bg-red-600 text-white scale-110 shadow-2xl shadow-red-600/30' : 'text-stone-600 hover:text-stone-400'}`}>
        {icon}
    </button>
);
