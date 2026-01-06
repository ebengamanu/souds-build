
import React, { useState, useEffect, useRef } from 'react';
import { Product, ProductCategory, Sale, User, ProductComment } from '../types';
import { getStoredProducts, recordSale, toggleProductLike, recordShare, getArtists, getTopArtistsRecent } from '../services/store';
import { Button } from '../components/Button';
import { 
  Search, Heart, Share2, Play, Pause, ArrowLeft, CreditCard, Mic, Film, Book,
  MessageCircle, Send, ThumbsUp, X, TrendingUp, CheckCircle, Plus
} from 'lucide-react';

interface BuyerMarketplaceProps {
  onNavigate: (view: string) => void;
}

export const BuyerMarketplace: React.FC<BuyerMarketplaceProps> = ({ onNavigate }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [artists, setArtists] = useState<User[]>([]);
  const [topArtistIds, setTopArtistIds] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'All'>('All');
  const [currentView, setCurrentView] = useState<'list' | 'detail'>('list');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [showComments, setShowComments] = useState(false);
  const [purchaseComplete, setPurchaseComplete] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    setProducts(getStoredProducts());
    setArtists(getArtists());
    setTopArtistIds(getTopArtistsRecent());
  }, []);

  const handleLike = (id: string, e?: React.MouseEvent) => {
      if(e) e.stopPropagation();
      const isLiked = favorites.includes(id);
      setFavorites(prev => isLiked ? prev.filter(fid => fid !== id) : [...prev, id]);
      toggleProductLike(id, !isLiked);
  };

  const filteredProducts = products.filter(p => {
    const match = p.title.toLowerCase().includes(searchTerm.toLowerCase()) || p.artistName.toLowerCase().includes(searchTerm.toLowerCase());
    const cat = selectedCategory === 'All' || p.category === selectedCategory;
    return match && cat;
  }).sort((a,b) => b.salesCount - a.salesCount);

  const renderMediaCard = (p: Product) => {
    const isVideo = p.category === ProductCategory.PODCAST || p.category === ProductCategory.FILM;
    const isBook = p.category === ProductCategory.LIVRE;
    
    return (
      <div key={p.id} className="w-full group animate-fade-in-up" onClick={() => { setSelectedProduct(p); setCurrentView('detail'); window.scrollTo(0,0); }}>
          <div className={`relative overflow-hidden rounded-2xl bg-black shadow-2xl transition-transform duration-500 hover:scale-[1.02] ${isVideo ? 'aspect-video' : isBook ? 'aspect-[2/3]' : 'aspect-square'}`}>
              {isVideo && p.trailerUrl ? (
                  <video src={p.trailerUrl} muted autoPlay loop playsInline className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"/>
              ) : (
                  <img src={p.coverUrl} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"/>
              )}
              
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent"></div>
              
              <div className="absolute top-3 left-3 flex gap-1.5">
                  {p.isLive && <span className="bg-red-600 text-white text-[9px] font-black px-2 py-0.5 rounded italic animate-pulse">LIVE 🔴</span>}
                  <span className="bg-black/60 backdrop-blur-md text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase">{p.category}</span>
              </div>

              <div className="absolute bottom-3 left-3 right-3">
                  <h3 className="text-white font-black text-lg leading-tight mb-1 truncate drop-shadow-lg italic">{p.title}</h3>
                  <p className="text-stone-300 text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                      {p.artistName} {topArtistIds.includes(p.artistId) && <TrendingUp size={10} className="text-green-400"/>}
                  </p>
              </div>

              <div className="absolute bottom-3 right-3">
                  <div className="bg-red-600 text-white text-xs font-black px-3 py-1.5 rounded-full shadow-xl">
                      {p.price === 0 ? 'FREE' : `${p.price.toFixed(2)}€`}
                  </div>
              </div>
          </div>
          <div className="mt-2 flex justify-between items-center px-1">
               <div className="flex gap-4 text-stone-500 text-[10px] font-black uppercase tracking-tighter">
                   <span className="flex items-center gap-1 opacity-50"><Play size={12}/> {p.salesCount}</span>
                   <span className="flex items-center gap-1 opacity-50"><MessageCircle size={12}/> {p.comments?.length || 0}</span>
               </div>
               <button onClick={(e) => handleLike(p.id, e)} className={`${favorites.includes(p.id) ? 'text-red-600' : 'text-stone-400'}`}>
                   <Heart size={18} fill={favorites.includes(p.id) ? "currentColor" : "none"}/>
               </button>
          </div>
      </div>
    );
  };

  const renderDetail = () => {
    if(!selectedProduct) return null;
    const isVideo = selectedProduct.category === ProductCategory.PODCAST || selectedProduct.category === ProductCategory.FILM;

    return (
        <div className="fixed inset-0 z-50 bg-white overflow-y-auto animate-slide-up pb-20">
             <div className="sticky top-0 z-50 bg-[#2C1B10] text-white p-4 flex items-center justify-between" style={{ paddingTop: 'calc(env(safe-area-inset-top) + 1rem)' }}>
                 <button onClick={() => setCurrentView('list')} className="p-2.5 bg-white/10 rounded-2xl"><ArrowLeft size={20}/></button>
                 <h2 className="font-black italic uppercase tracking-tighter text-sm">SOUNDS EXPLORE</h2>
                 <button onClick={() => { recordShare(selectedProduct.id); alert("Lien copié !"); }} className="p-2.5 bg-white/10 rounded-2xl"><Share2 size={20}/></button>
             </div>

             <div className={`w-full bg-black relative ${isVideo ? 'aspect-video' : 'aspect-square shadow-2xl'}`}>
                 {isVideo && selectedProduct.videoUrl ? (
                     <video ref={videoRef} src={selectedProduct.videoUrl} controls className="w-full h-full" poster={selectedProduct.coverUrl}/>
                 ) : (
                     <div className="relative w-full h-full">
                         <img src={selectedProduct.coverUrl} className="w-full h-full object-cover"/>
                         <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                            <button className="w-20 h-20 bg-red-600 text-white rounded-full flex items-center justify-center shadow-2xl animate-pulse">
                                <Play size={40} fill="white" className="ml-2"/>
                            </button>
                         </div>
                     </div>
                 )}
             </div>

             <div className="p-6 max-w-2xl mx-auto">
                 <div className="flex justify-between items-start mb-6">
                     <div>
                         <span className="text-[10px] font-black text-red-600 uppercase tracking-widest italic">{selectedProduct.category}</span>
                         <h1 className="text-4xl font-black text-stone-900 tracking-tighter italic leading-none my-2">{selectedProduct.title}</h1>
                         <p className="text-lg font-black text-stone-400 uppercase tracking-widest">{selectedProduct.artistName}</p>
                     </div>
                     <div className="text-right">
                         <p className="text-3xl font-black text-stone-900 leading-none">{selectedProduct.price === 0 ? "GRATUIT" : `${selectedProduct.price.toFixed(2)}€`}</p>
                         <p className="text-[9px] font-black text-stone-400 uppercase mt-2">Licence perpétuelle</p>
                     </div>
                 </div>

                 <div className="flex gap-2 mb-10 overflow-x-auto pb-4 scrollbar-hide">
                     <button onClick={() => handleLike(selectedProduct.id)} className={`flex-1 min-w-[90px] py-4 rounded-3xl border-2 font-black text-[10px] uppercase flex flex-col items-center gap-1.5 transition-all ${favorites.includes(selectedProduct.id) ? 'bg-red-600 border-red-600 text-white scale-105' : 'border-stone-100 text-stone-500'}`}>
                         <Heart size={22} fill={favorites.includes(selectedProduct.id) ? "white" : "none"}/> J'aime
                     </button>
                     <button onClick={() => setShowComments(true)} className="flex-1 min-w-[90px] py-4 rounded-3xl border-2 border-stone-100 text-stone-500 font-black text-[10px] uppercase flex flex-col items-center gap-1.5 active:bg-stone-50">
                         <MessageCircle size={22}/> Avis ({selectedProduct.comments?.length || 0})
                     </button>
                     <button onClick={() => alert("Simulé : Achat réussi")} className="flex-[2] min-w-[150px] py-4 rounded-3xl bg-red-600 text-white font-black text-[12px] uppercase flex flex-col items-center gap-1.5 shadow-2xl shadow-red-200">
                         <CreditCard size={22}/> {selectedProduct.price === 0 ? "ÉCOUTER / LIRE" : "ACHETER"}
                     </button>
                 </div>

                 <div className="bg-stone-50 p-6 rounded-3xl border border-stone-100 mb-10">
                     <h3 className="font-black text-[10px] text-stone-400 uppercase mb-3 tracking-[0.2em]">Synopsis / Infos</h3>
                     <p className="text-stone-600 text-sm leading-relaxed italic">{selectedProduct.description || "Aucune description disponible pour ce contenu."}</p>
                 </div>
                 
                 <div className="space-y-4">
                     <h3 className="font-black text-xl uppercase tracking-tighter italic">Pourquoi Sounds Gold ?</h3>
                     <div className="grid grid-cols-2 gap-3">
                         <div className="p-4 bg-white border border-stone-100 rounded-2xl text-center">
                             <div className="w-10 h-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-2"><CheckCircle size={20}/></div>
                             <p className="text-[10px] font-black uppercase">100% Artiste</p>
                         </div>
                         <div className="p-4 bg-white border border-stone-100 rounded-2xl text-center">
                             <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-2"><CheckCircle size={20}/></div>
                             <p className="text-[10px] font-black uppercase">Sécurisé</p>
                         </div>
                     </div>
                 </div>
             </div>
        </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#D7CCC8]">
        <div className="sticky top-0 z-30 shadow-2xl">
            <header className="bg-[#2C1B10] text-white" style={{ paddingTop: 'calc(env(safe-area-inset-top) + 1.2rem)' }}>
                <div className="max-w-6xl mx-auto px-5 py-5 flex justify-between items-center">
                    <button onClick={() => onNavigate('landing')} className="p-2 hover:bg-white/5 rounded-xl"><ArrowLeft className="text-stone-400 hover:text-white"/></button>
                    <h1 className="font-black text-3xl tracking-tighter italic uppercase leading-none">SOUNDS <span className="text-red-600">MARKET</span></h1>
                    <div className="w-10"></div>
                </div>
            </header>
            <div className="bg-[#3E2723] p-4 px-6 flex items-center gap-3 border-b border-white/5 shadow-xl">
                <div className="flex-1 relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-500 group-focus-within:text-red-600 transition-colors" size={18}/>
                    <input type="text" placeholder="RECHERCHER UN FILM, LIVRE, PODCAST..." value={searchTerm} onChange={e=>setSearchTerm(e.target.value)} className="w-full pl-11 pr-5 py-3 rounded-2xl bg-white/5 text-white placeholder-stone-500 font-bold text-sm outline-none border-2 border-transparent focus:border-red-600 transition-all"/>
                </div>
            </div>
            <div className="bg-[#4E342E] py-4 overflow-x-auto whitespace-nowrap px-6 scrollbar-hide">
                <div className="flex gap-4">
                    <Tab label="TOUT" active={selectedCategory==='All'} onClick={()=>setSelectedCategory('All')}/>
                    <Tab label="🎬 FILMS" active={selectedCategory===ProductCategory.FILM} onClick={()=>setSelectedCategory(ProductCategory.FILM)}/>
                    <Tab label="🎙️ PODCASTS" active={selectedCategory===ProductCategory.PODCAST} onClick={()=>setSelectedCategory(ProductCategory.PODCAST)}/>
                    <Tab label="📚 LIVRES" active={selectedCategory===ProductCategory.LIVRE} onClick={()=>setSelectedCategory(ProductCategory.LIVRE)}/>
                    <Tab label="🎵 MUSIQUE" active={selectedCategory===ProductCategory.AFROBEAT} onClick={()=>setSelectedCategory(ProductCategory.AFROBEAT)}/>
                </div>
            </div>
        </div>

        <main className="max-w-6xl mx-auto p-5 md:p-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {currentView === 'list' && filteredProducts.map(p => renderMediaCard(p))}
            {currentView === 'detail' && renderDetail()}
        </main>
    </div>
  );
};

const Tab = ({ label, active, onClick }: any) => (
    <button onClick={onClick} className={`px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${active ? 'bg-red-600 text-white shadow-2xl scale-105 italic' : 'bg-white/5 text-stone-400 hover:bg-white/10'}`}>{label}</button>
);
