
import React, { useState, useEffect, useRef } from 'react';
import { User, Product, ProductCategory, SubscriptionTier, Sale, Notification, Ticket } from '../types';
import { getStoredProducts, saveProduct, updateProduct, deleteProduct, getStoredSales, updateUser, getNotifications, deleteNotification, deleteAllNotifications, getFollowerCount, getStoredTickets, saveTicket, updateTicket, deleteTicket } from '../services/store';
import { SUBSCRIPTION_PLANS, MEDIA_COMMISSION } from '../constants';
import { Button } from '../components/Button';
import { 
  Home, Upload, BarChart2, User as UserIcon, LogOut, Trash2, 
  Edit3, Crown, Bell, Camera, Film, Clock, AlertCircle, CheckCircle, Mic, Book, X, Plus, Save
} from 'lucide-react';

interface ArtistDashboardProps {
  user: User;
  onLogout: () => void;
  onNavigate: (view: string) => void;
}

export const ArtistDashboard: React.FC<ArtistDashboardProps> = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'home' | 'publish' | 'stats' | 'premium' | 'profile'>('home');
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [currentUser, setCurrentUser] = useState<User>(user);
  
  // Publishing Form State
  const [pubForm, setPubForm] = useState({
    title: '',
    type: 'SONG' as 'SONG' | 'ALBUM' | 'VIDEO' | 'LIVE' | 'PDF',
    category: ProductCategory.POP,
    description: '',
    price: '', 
    discountPercent: '',
    duration: '0:00',
    isLive: false
  });
  
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [trailerFile, setTrailerFile] = useState<File | null>(null);
  const [mainMediaFile, setMainMediaFile] = useState<File | null>(null);
  const [isEditingId, setIsEditingId] = useState<string | null>(null);
  const [checkoutPlan, setCheckoutPlan] = useState<{tier: SubscriptionTier, price: number} | null>(null);

  useEffect(() => {
    const allProducts = getStoredProducts().filter(p => p.artistId === user.id);
    setProducts(allProducts);
    const allSales = getStoredSales();
    const myProductIds = allProducts.map(p => p.id);
    setSales(allSales.filter(s => myProductIds.includes(s.productId)));
    setNotifications(getNotifications(user.id));
  }, [user.id, activeTab]);

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();
    const priceVal = parseFloat(pubForm.price) || 0;
    
    const newProduct: Product = {
      id: isEditingId || Math.random().toString(36).substr(2, 9),
      artistId: currentUser.id,
      artistName: currentUser.name,
      title: pubForm.title,
      type: pubForm.type,
      category: pubForm.category,
      description: pubForm.description,
      price: priceVal,
      discountPercent: parseFloat(pubForm.discountPercent) || 0,
      publishedAt: Date.now(),
      salesCount: 0,
      likes: 0,
      duration: pubForm.duration,
      isLive: pubForm.isLive,
      coverUrl: coverFile ? URL.createObjectURL(coverFile) : (isEditingId ? products.find(p=>p.id===isEditingId)?.coverUrl || '' : ''),
      videoUrl: (pubForm.type === 'VIDEO' || pubForm.type === 'LIVE') && mainMediaFile ? URL.createObjectURL(mainMediaFile) : undefined,
      trailerUrl: trailerFile ? URL.createObjectURL(trailerFile) : undefined,
      pdfUrl: pubForm.type === 'PDF' && mainMediaFile ? URL.createObjectURL(mainMediaFile) : undefined,
      audioFiles: pubForm.type === 'SONG' && mainMediaFile ? [{ title: pubForm.title, url: URL.createObjectURL(mainMediaFile), originalName: mainMediaFile.name }] : []
    };

    if (isEditingId) updateProduct(newProduct); else saveProduct(newProduct);
    resetPubForm();
    setActiveTab('home');
    alert("✅ Publié avec succès !");
  };

  const resetPubForm = () => {
    setPubForm({ title: '', type: 'SONG', category: ProductCategory.POP, description: '', price: '', discountPercent: '', duration: '0:00', isLive: false });
    setCoverFile(null); setMainMediaFile(null); setTrailerFile(null); setIsEditingId(null);
  };

  const inputClass = "w-full p-3 rounded-xl border border-stone-300 bg-stone-50 text-black focus:ring-2 focus:ring-red-600 outline-none font-medium";

  const renderHome = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-stone-900 text-white p-6 rounded-3xl shadow-xl relative overflow-hidden">
          <div className="relative z-10">
              <h2 className="text-3xl font-black italic mb-1 uppercase">Bonjour, {currentUser.name}</h2>
              <p className="text-stone-400 font-bold text-sm">Prêt à conquérir le monde aujourd'hui ?</p>
          </div>
          <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-red-600/20 rounded-full blur-3xl"></div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-stone-100">
            <p className="text-stone-400 text-[10px] font-black uppercase tracking-widest mb-1">Abonnés</p>
            <p className="text-3xl font-black text-stone-900">{getFollowerCount(user.id)}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-stone-100">
            <p className="text-stone-400 text-[10px] font-black uppercase tracking-widest mb-1">Total Ventes</p>
            <p className="text-3xl font-black text-stone-900">{sales.length}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
          <div className="p-4 border-b flex justify-between items-center bg-stone-50/50">
              <h3 className="font-black uppercase text-xs tracking-widest text-stone-500">Mes Œuvres</h3>
              <button onClick={() => setActiveTab('publish')} className="text-red-600 p-1 hover:bg-red-50 rounded-full transition-colors"><Plus size={18}/></button>
          </div>
          <div className="divide-y divide-stone-100 max-h-80 overflow-y-auto">
              {products.length === 0 ? (
                  <div className="p-10 text-center text-stone-400 font-bold italic">Aucun contenu publié.</div>
              ) : products.map(p => (
                  <div key={p.id} className="p-4 flex items-center justify-between hover:bg-stone-50 transition-colors">
                      <div className="flex items-center gap-3 min-w-0">
                          <img src={p.coverUrl} className="w-12 h-12 rounded-lg object-cover bg-stone-100"/>
                          <div className="min-w-0">
                              <p className="font-bold text-sm truncate text-stone-800">{p.title}</p>
                              <p className="text-[10px] font-black text-stone-400 uppercase">{p.category}</p>
                          </div>
                      </div>
                      <div className="flex gap-2">
                          <button onClick={() => { setIsEditingId(p.id); setPubForm({...p, price: p.price.toString(), discountPercent: p.discountPercent.toString()} as any); setActiveTab('publish'); }} className="p-2 text-stone-400 hover:text-red-600"><Edit3 size={16}/></button>
                          <button onClick={() => { if(confirm("Supprimer ?")) { deleteProduct(p.id); setProducts(prev => prev.filter(x => x.id !== p.id)); } }} className="p-2 text-stone-400 hover:text-red-600"><Trash2 size={16}/></button>
                      </div>
                  </div>
              ))}
          </div>
      </div>
    </div>
  );

  const renderPublish = () => {
    const isVideoType = pubForm.category === ProductCategory.PODCAST || pubForm.category === ProductCategory.FILM;
    const isBook = pubForm.category === ProductCategory.LIVRE;
    const netProfit = Math.max(0, (parseFloat(pubForm.price) || 0) - MEDIA_COMMISSION).toFixed(2);

    return (
      <div className="max-w-2xl mx-auto bg-white p-6 rounded-3xl shadow-xl border border-stone-200 animate-fade-in-up pb-24">
        <h2 className="text-2xl font-black mb-6 flex items-center gap-2">
            <Upload className="text-red-600"/> {isEditingId ? 'Modifier' : 'Publier un contenu'}
        </h2>

        <form onSubmit={handlePublish} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                   <label className="block text-[10px] font-black uppercase text-stone-500 mb-1.5 ml-1 tracking-widest">Catégorie</label>
                   <select 
                     value={pubForm.category}
                     onChange={e => {
                        const cat = e.target.value as ProductCategory;
                        let type: any = 'SONG';
                        if (cat === ProductCategory.PODCAST || cat === ProductCategory.FILM) type = 'VIDEO';
                        if (cat === ProductCategory.LIVRE) type = 'PDF';
                        setPubForm({...pubForm, category: cat, type});
                     }}
                     className={inputClass}
                   >
                      {Object.values(ProductCategory).map(c => <option key={c} value={c}>{c}</option>)}
                   </select>
              </div>
              <div>
                  <label className="block text-[10px] font-black uppercase text-stone-500 mb-1.5 ml-1 tracking-widest">Format</label>
                  <div className="flex gap-1 bg-stone-100 p-1 rounded-xl">
                      {isBook ? (
                          <div className="flex-1 py-2 text-center text-[10px] font-black uppercase text-stone-600 bg-white rounded-lg shadow-sm">PDF</div>
                      ) : isVideoType ? (
                          <>
                            <button type="button" onClick={() => setPubForm({...pubForm, type: 'VIDEO', isLive: false})} className={`flex-1 py-2 rounded-lg font-black text-[10px] uppercase transition-all ${pubForm.type === 'VIDEO' ? 'bg-white shadow-sm text-red-600' : 'text-stone-400'}`}>MP4</button>
                            <button type="button" onClick={() => setPubForm({...pubForm, type: 'LIVE', isLive: true})} className={`flex-1 py-2 rounded-lg font-black text-[10px] uppercase transition-all ${pubForm.type === 'LIVE' ? 'bg-white shadow-sm text-red-600' : 'text-stone-400'}`}>LIVE</button>
                          </>
                      ) : (
                          <>
                            <button type="button" onClick={() => setPubForm({...pubForm, type: 'SONG'})} className={`flex-1 py-2 rounded-lg font-black text-[10px] uppercase transition-all ${pubForm.type === 'SONG' ? 'bg-white shadow-sm text-red-600' : 'text-stone-400'}`}>SINGLE</button>
                            <button type="button" onClick={() => setPubForm({...pubForm, type: 'ALBUM'})} className={`flex-1 py-2 rounded-lg font-black text-[10px] uppercase transition-all ${pubForm.type === 'ALBUM' ? 'bg-white shadow-sm text-red-600' : 'text-stone-400'}`}>ALBUM</button>
                          </>
                      )}
                  </div>
              </div>
          </div>

          <div>
              <label className="block text-[10px] font-black uppercase text-stone-500 mb-1.5 ml-1 tracking-widest">Titre</label>
              <input required type="text" value={pubForm.title} onChange={e => setPubForm({...pubForm, title: e.target.value})} className={inputClass} placeholder={isBook ? "Nom du livre" : "Titre de l'épisode / morceau"}/>
          </div>

          <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-[10px] font-black uppercase text-stone-500 mb-1.5 ml-1 tracking-widest">Prix (€)</label>
                  <input type="number" step="0.01" min="0" value={pubForm.price} onChange={e => setPubForm({...pubForm, price: e.target.value})} className={inputClass} placeholder="0.00"/>
                  {(isVideoType || isBook) && parseFloat(pubForm.price) > 0 && (
                      <p className="text-[9px] text-green-600 font-bold mt-1 uppercase">Net Artiste: {netProfit}€ (-2€ fixe)</p>
                  )}
               </div>
               <div>
                  <label className="block text-[10px] font-black uppercase text-stone-500 mb-1.5 ml-1 tracking-widest">Remise %</label>
                  <input type="number" min="0" max="50" value={pubForm.discountPercent} onChange={e => setPubForm({...pubForm, discountPercent: e.target.value})} className={inputClass} placeholder="0"/>
               </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="p-4 bg-stone-50 rounded-2xl border-2 border-dashed border-stone-200">
                  <label className="block text-[10px] font-black uppercase text-stone-400 mb-2 flex items-center gap-2">
                    {isVideoType ? <Film size={14}/> : isBook ? <Book size={14}/> : <Camera size={14}/>} 
                    Jaquette {isVideoType ? '16:9' : isBook ? 'Portrait 2:3' : 'Carrée'}
                  </label>
                  <input type="file" accept="image/*" onChange={e => setCoverFile(e.target.files?.[0] || null)} className="w-full text-[10px] file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-red-600 file:text-white file:font-bold"/>
                  {coverFile && (
                    <div className={`mt-3 rounded-lg overflow-hidden border border-stone-200 bg-stone-100 ${isVideoType ? 'aspect-video' : isBook ? 'aspect-[2/3]' : 'aspect-square'}`}>
                        <img src={URL.createObjectURL(coverFile)} className="w-full h-full object-cover"/>
                    </div>
                  )}
              </div>

              <div className="space-y-4">
                  <div className="p-4 bg-stone-900 text-white rounded-2xl border border-stone-700">
                      <label className="block text-[10px] font-black uppercase text-stone-400 mb-2">Fichier Principal ({pubForm.type})</label>
                      <input type="file" accept={isBook ? ".pdf" : isVideoType ? "video/*" : "audio/*"} onChange={e => setMainMediaFile(e.target.files?.[0] || null)} className="w-full text-[10px] file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-white file:text-black file:font-bold"/>
                  </div>
                  {isVideoType && pubForm.type === 'VIDEO' && (
                    <div className="p-4 bg-red-50 rounded-2xl border border-red-100">
                        <label className="block text-[10px] font-black uppercase text-red-400 mb-2">Trailer 30s (Optionnel)</label>
                        <input type="file" accept="video/*" onChange={e => setTrailerFile(e.target.files?.[0] || null)} className="w-full text-[10px] file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-red-600 file:text-white file:font-bold"/>
                    </div>
                  )}
              </div>
          </div>

          <div>
              <label className="block text-[10px] font-black uppercase text-stone-500 mb-1.5 ml-1 tracking-widest">Description</label>
              <textarea rows={3} value={pubForm.description} onChange={e => setPubForm({...pubForm, description: e.target.value})} className={`${inputClass} resize-none`} placeholder="Racontez votre histoire..."></textarea>
          </div>

          <Button type="submit" fullWidth className="py-4 text-black bg-red-600 font-black uppercase tracking-tighter text-lg shadow-2xl active:scale-95 transition-transform">
             Publier Maintenant
          </Button>
        </form>
      </div>
    );
  };

  const renderStats = () => {
    const totalEarnings = sales.reduce((acc, curr) => acc + curr.amount, 0);
    return (
        <div className="space-y-6 animate-fade-in pb-24">
            <h2 className="text-3xl font-black italic uppercase">Analytics</h2>
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-6 rounded-3xl shadow-lg border-b-8 border-green-500">
                    <p className="text-stone-400 font-black text-[10px] uppercase tracking-widest mb-1">Revenu Net</p>
                    <p className="text-4xl font-black text-stone-900 leading-none">{totalEarnings.toFixed(2)}€</p>
                </div>
                <div className="bg-white p-6 rounded-3xl shadow-lg border-b-8 border-red-600">
                    <p className="text-stone-400 font-black text-[10px] uppercase tracking-widest mb-1">Ventes</p>
                    <p className="text-4xl font-black text-stone-900 leading-none">{sales.length}</p>
                </div>
            </div>

            <div className="bg-stone-900 p-6 rounded-3xl text-white">
                <h3 className="font-black uppercase text-xs mb-4 text-red-500 flex items-center gap-2 tracking-widest"><AlertCircle size={16}/> Rappel Commissions</h3>
                <div className="space-y-3">
                    <div className="flex justify-between items-center border-b border-white/5 pb-2">
                        <span className="text-sm font-bold">Musique (MP3/Album)</span>
                        <span className="bg-green-500/20 text-green-400 text-[10px] px-2 py-0.5 rounded-full font-black italic">0% FRAIS</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-white/5 pb-2">
                        <span className="text-sm font-bold">Podcast / Film / Livre</span>
                        <span className="bg-red-500/20 text-red-400 text-[10px] px-2 py-0.5 rounded-full font-black">2.00€ FIXE</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-sm font-bold">Tickets Concerts</span>
                        <span className="bg-red-500/20 text-red-400 text-[10px] px-2 py-0.5 rounded-full font-black">2.00€ FIXE</span>
                    </div>
                </div>
            </div>
        </div>
    );
  };

  const renderPremium = () => (
    <div className="space-y-6 pb-24 animate-fade-in">
      <h2 className="text-3xl font-black italic uppercase">Pass Créateur</h2>
      <div className="space-y-4">
        {SUBSCRIPTION_PLANS.map(plan => (
          <div key={plan.id} className={`bg-white p-6 rounded-3xl shadow-lg border-2 ${currentUser.subscriptionTier === plan.id ? 'border-green-500' : 'border-stone-100'}`}>
            <div className="flex justify-between items-center mb-4">
               <div>
                  <h3 className="text-2xl font-black uppercase italic">{plan.name}</h3>
                  <p className="text-3xl font-black text-red-600">{plan.price}€<span className="text-sm text-stone-400 font-bold">/mois</span></p>
               </div>
               {currentUser.subscriptionTier === plan.id && <div className="bg-green-100 text-green-600 p-2 rounded-full"><CheckCircle/></div>}
            </div>
            <ul className="space-y-2 mb-6">
              {plan.features.map(f => <li key={f} className="text-sm font-bold text-stone-600 flex items-center gap-2">🔥 {f}</li>)}
            </ul>
            <Button fullWidth className="py-4" disabled={currentUser.subscriptionTier === plan.id} onClick={() => alert("Simulé : Paiement Stripe 2€ / " + plan.name)}>
              {currentUser.subscriptionTier === plan.id ? 'PLAN ACTIF' : 'ACTIVER MAINTENANT'}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );

  const renderProfile = () => (
    <div className="bg-white p-8 rounded-3xl shadow-xl animate-fade-in pb-24">
       <div className="flex flex-col items-center mb-10">
           <div className="w-32 h-32 rounded-full border-4 border-red-600 p-1 mb-4 shadow-2xl">
               <img src={currentUser.profilePictureUrl || 'https://via.placeholder.com/150'} className="w-full h-full rounded-full object-cover"/>
           </div>
           <h2 className="text-3xl font-black uppercase italic tracking-tighter">{currentUser.name}</h2>
           <p className="text-stone-400 font-bold uppercase text-xs tracking-widest">{currentUser.email}</p>
           <span className="mt-4 bg-red-100 text-red-600 text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-tighter italic">CERTIFIÉ SOUNDS GOLD</span>
       </div>
       <div className="space-y-3">
          <Button variant="outline" fullWidth onClick={() => alert("Modifier le profil")}>Modifier mes infos</Button>
          <Button fullWidth onClick={onLogout} className="bg-stone-900 text-white border-none">Déconnexion</Button>
          <button className="w-full py-4 text-stone-400 font-black text-[10px] uppercase tracking-widest hover:text-red-600 transition-colors">Supprimer mon compte</button>
       </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#D7CCC8]">
        <div className="bg-[#2C1B10] text-white px-5 pb-4 sticky top-0 z-30 shadow-2xl flex justify-between items-center transition-all border-b border-white/5" style={{ paddingTop: 'calc(env(safe-area-inset-top) + 1.5rem)' }}>
             <div className="font-black text-2xl tracking-tighter italic">SOUNDS <span className="text-red-600">GOLD</span></div>
             <button onClick={() => setShowNotifications(true)} className="relative p-2.5 bg-white/5 rounded-2xl hover:bg-white/10 transition-all">
                 <Bell size={20} />
                 {notifications.length > 0 && <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-600 rounded-full border-2 border-[#2C1B10] animate-pulse"></span>}
             </button>
        </div>

        <main className="max-w-4xl mx-auto px-4 py-6">
            {activeTab === 'home' && renderHome()}
            {activeTab === 'publish' && renderPublish()}
            {activeTab === 'stats' && renderStats()}
            {activeTab === 'premium' && renderPremium()}
            {activeTab === 'profile' && renderProfile()}
        </main>

        <nav className="fixed bottom-0 left-0 w-full bg-[#1a1a1a] text-white border-t border-white/5 z-40 pb-safe shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
            <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
                <NavBtn label="Home" icon={<Home size={22}/>} active={activeTab === 'home'} onClick={() => setActiveTab('home')}/>
                <NavBtn label="Publish" icon={<Upload size={22}/>} active={activeTab === 'publish'} onClick={() => setActiveTab('publish')}/>
                <NavBtn label="Stats" icon={<BarChart2 size={22}/>} active={activeTab === 'stats'} onClick={() => setActiveTab('stats')}/>
                <NavBtn label="Profile" icon={<UserIcon size={22}/>} active={activeTab === 'profile'} onClick={() => setActiveTab('profile')}/>
            </div>
        </nav>

        {showNotifications && <NotificationsOverlay onClose={() => setShowNotifications(false)} notifications={notifications} onDelete={(id: string) => { deleteNotification(user.id, id); setNotifications(getNotifications(user.id)); }} onClear={() => { deleteAllNotifications(user.id); setNotifications([]); }}/>}
    </div>
  );
};

const NavBtn = ({ label, icon, active, onClick }: any) => (
    <button onClick={onClick} className={`flex flex-col items-center justify-center w-full h-full transition-all duration-300 ${active ? 'text-red-600 scale-110' : 'text-stone-600'}`}>
        <div className={`p-1.5 rounded-xl transition-all ${active ? 'bg-red-600/10' : ''}`}>{icon}</div>
        <span className="text-[8px] font-black uppercase tracking-tighter mt-0.5">{label}</span>
    </button>
);

const NotificationsOverlay = ({ onClose, notifications, onDelete, onClear }: any) => (
    <div className="fixed inset-0 z-50 bg-[#F5F5F4] animate-fade-in-up flex flex-col">
        <div className="bg-[#2C1B10] text-white p-5 flex justify-between items-center shadow-xl" style={{ paddingTop: 'calc(env(safe-area-inset-top) + 1.5rem)' }}>
            <h2 className="font-black italic text-xl uppercase">Alertes Sounds</h2>
            <button onClick={onClose} className="p-2 bg-white/10 rounded-full"><X size={20}/></button>
        </div>
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {notifications.length === 0 ? (
              <div className="text-center text-stone-400 mt-20">
                <Bell size={64} className="mx-auto mb-4 opacity-10"/>
                <p className="font-black uppercase tracking-widest text-xs italic">Silence total...</p>
              </div>
            ) : notifications.map((n: any) => (
                <div key={n.id} className="bg-white p-5 rounded-3xl shadow-sm flex justify-between items-start border border-stone-100 group">
                    <div className="flex-1 pr-4">
                        <p className="font-black text-stone-800 text-sm leading-tight italic">{n.message}</p>
                        <p className="text-[10px] font-black text-stone-300 mt-2 uppercase">{new Date(n.date).toLocaleString()}</p>
                    </div>
                    <button onClick={() => onDelete(n.id)} className="text-stone-200 hover:text-red-600 p-1"><Trash2 size={16}/></button>
                </div>
            ))}
        </div>
        {notifications.length > 0 && <div className="p-5 bg-white border-t"><Button fullWidth onClick={onClear} className="bg-stone-900 text-white">Vider tout</Button></div>}
    </div>
);
