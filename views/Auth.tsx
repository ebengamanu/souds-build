
import React, { useState, useEffect } from 'react';
import { Button } from '../components/Button';
import { User, UserRole, SubscriptionTier } from '../types';
import { saveUser, getStoredUsers, updateUser, setCurrentUserSession, delay } from '../services/store';
import { v4 as uuidv4 } from 'uuid';
import { ArrowLeft, CheckCircle, Camera, LockKeyhole, X } from 'lucide-react';
import { POLICIES } from '../constants';

interface AuthProps {
  view: 'login' | 'register' | 'register-buyer';
  onNavigate: (view: string) => void;
  onLoginSuccess: (user: User) => void;
}

export const Auth: React.FC<AuthProps> = ({ view, onNavigate, onLoginSuccess }) => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [profileFile, setProfileFile] = useState<File | null>(null);
  const [policiesAccepted, setPoliciesAccepted] = useState({
    sales: false,
    privacy: false,
    terms: false,
    purchase: false // Specific for buyer
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [referralId, setReferralId] = useState<string | null>(null);

  // Forgot Password State
  const [isResetting, setIsResetting] = useState(false);
  const [resetStep, setResetStep] = useState(1); // 1: Email, 2: New Password
  const [resetEmail, setResetEmail] = useState('');
  const [newResetPassword, setNewResetPassword] = useState('');

  // Policy Modal State
  const [viewingPolicy, setViewingPolicy] = useState<{title: string, content: React.ReactNode} | null>(null);

  useEffect(() => {
      // Check for Referral ID in URL query params
      const searchParams = new URLSearchParams(window.location.search);
      const refCode = searchParams.get('ref');
      if (refCode) {
          const users = getStoredUsers();
          const referrer = users.find(u => u.referralCode === refCode);
          if (referrer) {
              setReferralId(referrer.id);
              console.log("Referral Code found:", refCode, "Referrer:", referrer.name);
          }
      }
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (view === 'register') {
      if (!policiesAccepted.sales || !policiesAccepted.privacy || !policiesAccepted.terms) {
        setError('Veuillez accepter toutes les politiques pour continuer.');
        setLoading(false);
        return;
      }
    }

    if (view === 'register-buyer') {
      if (!policiesAccepted.privacy || !policiesAccepted.terms || !policiesAccepted.purchase) {
         setError('Veuillez accepter toutes les politiques (Achat, Confidentialité, CGU).');
         setLoading(false);
         return;
      }
    }

    await delay(800);

    const users = getStoredUsers();
    
    if (view === 'register' || view === 'register-buyer') {
      if (users.find(u => u.email === formData.email)) {
        setError('Cet email est déjà utilisé.');
        setLoading(false);
        return;
      }

      const now = Date.now();
      const isArtist = view === 'register';
      const trialDuration = 3 * 24 * 60 * 60 * 1000; // 3 days for artist

      const newUser: User = {
        id: uuidv4(),
        ...formData,
        role: isArtist ? UserRole.ARTIST : UserRole.BUYER_PRO,
        createdAt: now,
        subscriptionTier: isArtist ? SubscriptionTier.TRIAL : SubscriptionTier.BUYER_FREE,
        subscriptionEndDate: isArtist ? now + trialDuration : 0, // No expiry for free buyer initially
        isYearly: false,
        paymentApiConnected: false,
        profilePictureUrl: profileFile ? URL.createObjectURL(profileFile) : undefined,
        buyerLibrary: [], // Initialize library
        referredBy: referralId || undefined // Apply referral if present
      };

      saveUser(newUser);
      setCurrentUserSession(newUser);
      onLoginSuccess(newUser);
    } else {
      const user = users.find(u => u.email === formData.email && u.password === formData.password);
      if (user) {
        setCurrentUserSession(user);
        onLoginSuccess(user);
      } else {
        setError('Email ou mot de passe incorrect.');
      }
    }
    setLoading(false);
  };

  const handleResetCheckEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    await delay(600);
    
    const users = getStoredUsers();
    const userExists = users.some(u => u.email === resetEmail);
    
    if (userExists) {
        setResetStep(2);
    } else {
        setError("Aucun compte ne correspond à cet email.");
    }
    setLoading(false);
  };

  const handleResetConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await delay(800);

    const users = getStoredUsers();
    const userIndex = users.findIndex(u => u.email === resetEmail);
    
    if (userIndex !== -1) {
        const updatedUser = { ...users[userIndex], password: newResetPassword };
        updateUser(updatedUser);
        alert("Mot de passe modifié avec succès ! Vous pouvez vous connecter.");
        setIsResetting(false);
        setResetStep(1);
        setResetEmail('');
        setNewResetPassword('');
        setFormData({ ...formData, email: resetEmail }); // Pre-fill login
    } else {
        setError("Une erreur est survenue.");
    }
    setLoading(false);
  };

  const showPolicy = (type: 'privacy' | 'sales' | 'terms' | 'purchase') => {
      let title = "";
      let content: React.ReactNode = null;

      switch(type) {
          case 'privacy':
              title = "Politique de Confidentialité";
              content = (
                  <div className="space-y-4 text-sm text-stone-700">
                      <p className="font-bold">Dernière mise à jour : 5 décembre 2025</p>
                      <p>Sounds respecte votre vie privée. Nous collectons uniquement les données nécessaires pour le fonctionnement de la plateforme.</p>
                      
                      <h4 className="font-bold text-stone-900 mt-4">Données collectées</h4>
                      <ul className="list-disc pl-5 space-y-1">
                          <li><b>Artistes / Vendeurs :</b> nom, email, informations bancaires (pour paiements), métadonnées des fichiers musicaux uploadés, logs d'utilisation.</li>
                          <li><b>Acheteurs :</b> email (optionnel), informations de paiement (via Stripe/PayPal), IP, identifiant unique de transaction (pour traçabilité). Pas de compte obligatoire pour achat.</li>
                          <li><b>Cookies :</b> préférences, analytics anonymisés.</li>
                      </ul>

                      <h4 className="font-bold text-stone-900 mt-4">Utilisation des données</h4>
                      <ul className="list-disc pl-5 space-y-1">
                          <li>Fournir le service (ventes, downloads, dashboard artistes).</li>
                          <li>Traçabilité en cas de litige.</li>
                          <li>Amélioration de la plateforme.</li>
                      </ul>

                      <h4 className="font-bold text-stone-900 mt-4">Partage des données</h4>
                      <p>Fournisseurs tiers (Paiements, Hébergeur). Autorités (sur ordre légal uniquement).</p>
                      
                      <h4 className="font-bold text-stone-900 mt-4">Droits</h4>
                      <p>Accès, rectification, suppression via contact@sounds.com. Conformité RGPD & CCPA.</p>
                  </div>
              );
              break;
          case 'sales':
              title = "Politique de Vente";
              content = (
                  <div className="space-y-4 text-sm text-stone-700">
                      <p className="font-bold">Modalités d'abonnement artistes (avec réduction annuelle)</p>
                      
                      <h4 className="font-bold text-stone-900 mt-4">Forfaits artistes</h4>
                      <div className="overflow-x-auto">
                          <table className="w-full text-left border-collapse border border-stone-300">
                              <thead>
                                  <tr className="bg-stone-100">
                                      <th className="border border-stone-300 p-2">Forfait</th>
                                      <th className="border border-stone-300 p-2">Mensuel</th>
                                      <th className="border border-stone-300 p-2">Annuel (-10%)</th>
                                  </tr>
                              </thead>
                              <tbody>
                                  <tr><td className="border p-2">Starter</td><td className="border p-2">9,99 €</td><td className="border p-2">107,89 €</td></tr>
                                  <tr><td className="border p-2">Pro</td><td className="border p-2">15,99 €</td><td className="border p-2">172,69 €</td></tr>
                                  <tr><td className="border p-2">Elite</td><td className="border p-2">19,99 €</td><td className="border p-2">215,89 €</td></tr>
                              </tbody>
                          </table>
                      </div>
                      
                      <h4 className="font-bold text-stone-900 mt-4">Détails</h4>
                      <ul className="list-disc pl-5 space-y-1">
                          <li><b>Paiement :</b> Reconduction automatique. Annulation anytime.</li>
                          <li><b>Revenus :</b> 100% du prix net revient à l'artiste.</li>
                          <li><b>Acheteurs :</b> Achat sans compte, téléchargement immédiat.</li>
                      </ul>
                  </div>
              );
              break;
          case 'terms':
              title = "Conditions Générales d'Utilisation";
              content = (
                  <div className="space-y-4 text-sm text-stone-700">
                      <p className="font-bold">Version 1.0 - 5 décembre 2025</p>

                      <h4 className="font-bold text-stone-900 mt-4">1. Description du service</h4>
                      <p>Sounds est une marketplace où les artistes vendent directement leurs créations. 100% des revenus nets pour l'artiste.</p>

                      <h4 className="font-bold text-stone-900 mt-4">2. Propriété & Droits</h4>
                      <p>L'artiste garantit détenir 100% des droits. Sounds n'acquiert aucune propriété, seulement une licence de diffusion.</p>

                      <h4 className="font-bold text-stone-900 mt-4">3. CGU Acheteurs</h4>
                      <ul className="list-disc pl-5 space-y-1">
                          <li>Usage privé uniquement (écoute personnelle).</li>
                          <li>Interdiction d'usage public ou commercial (films, radio, clubs) sans accord.</li>
                          <li>Interdiction de revente ou redistribution.</li>
                      </ul>

                      <h4 className="font-bold text-stone-900 mt-4">4. Protection & Traçabilité</h4>
                      <p>Watermark automatique sur les fichiers audio avec ID de transaction unique pour identifier les fuites.</p>

                      <h4 className="font-bold text-stone-900 mt-4">5. Résiliation</h4>
                      <p>Possible à tout moment depuis le tableau de bord.</p>
                  </div>
              );
              break;
          case 'purchase':
              title = "Politique d'Achat Acheteur Pro";
              content = (
                  <div className="space-y-4 text-sm text-stone-700 whitespace-pre-wrap">
                      {POLICIES.PURCHASE}
                  </div>
              );
              break;
      }
      setViewingPolicy({ title, content });
  };

  const PolicyCheckbox = ({ label, checked, onChange, onRead }: { label: string, checked: boolean, onChange: () => void, onRead: () => void }) => (
    <div className="flex items-start space-x-3 p-3 border border-stone-400 rounded bg-stone-50 hover:bg-white transition-colors">
      <input 
        type="checkbox" 
        checked={checked} 
        onChange={onChange}
        className="mt-1 h-5 w-5 text-red-600 focus:ring-red-500 border-gray-300 rounded cursor-pointer"
      />
      <div className="text-sm text-stone-800">
          J'accepte <button type="button" onClick={onRead} className="text-stone-900 font-bold underline hover:text-red-600">{label}</button>
      </div>
    </div>
  );

  const PolicyModal = () => {
      if (!viewingPolicy) return null;
      return (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
              <div className="bg-white w-full max-w-lg max-h-[80vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-stone-300">
                  <div className="bg-[#2C1B10] text-white p-4 flex justify-between items-center shrink-0">
                      <h3 className="font-bold text-lg leading-tight pr-4">{viewingPolicy.title}</h3>
                      <button onClick={() => setViewingPolicy(null)} className="p-1 hover:bg-white/20 rounded-full transition-colors"><X size={24}/></button>
                  </div>
                  <div className="p-6 overflow-y-auto custom-scrollbar">
                      {viewingPolicy.content}
                  </div>
                  <div className="p-4 border-t border-stone-200 shrink-0 bg-stone-50">
                      <Button fullWidth onClick={() => setViewingPolicy(null)} className="py-3 bg-red-600 text-black font-bold hover:bg-red-500">
                          Fermer
                      </Button>
                  </div>
              </div>
          </div>
      );
  };

  if (isResetting) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-[#D7CCC8]">
            <div className="max-w-md w-full bg-[#EFEBE9] rounded-xl shadow-xl p-8 border border-[#BCAAA4]">
                <button 
                    onClick={() => { setIsResetting(false); setResetStep(1); setError(''); }}
                    className="flex items-center text-stone-600 hover:text-black mb-6"
                >
                    <ArrowLeft size={16} className="mr-1" /> Retour
                </button>
                
                <h2 className="text-2xl font-black mb-2 text-center text-stone-900">Réinitialisation</h2>
                <p className="text-stone-500 text-sm text-center mb-6">
                    {resetStep === 1 ? "Entrez votre email pour continuer." : "Définissez votre nouveau mot de passe."}
                </p>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4 text-sm">
                        {error}
                    </div>
                )}

                {resetStep === 1 ? (
                    <form onSubmit={handleResetCheckEmail} className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold mb-1">Email associé au compte</label>
                            <input
                                required
                                type="email"
                                className="w-full p-3 border border-stone-400 rounded bg-white focus:outline-none focus:border-red-500"
                                value={resetEmail}
                                onChange={e => setResetEmail(e.target.value)}
                            />
                        </div>
                        <Button type="submit" fullWidth disabled={loading}>
                            {loading ? 'Vérification...' : 'Continuer'}
                        </Button>
                    </form>
                ) : (
                    <form onSubmit={handleResetConfirm} className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold mb-1">Nouveau mot de passe</label>
                            <div className="relative">
                                <input
                                    required
                                    type="password"
                                    className="w-full p-3 border border-stone-400 rounded bg-white focus:outline-none focus:border-red-500 pl-10"
                                    value={newResetPassword}
                                    onChange={e => setNewResetPassword(e.target.value)}
                                />
                                <LockKeyhole className="absolute left-3 top-3.5 text-stone-400" size={18} />
                            </div>
                        </div>
                        <Button type="submit" fullWidth disabled={loading}>
                            {loading ? 'Mise à jour...' : 'Confirmer le changement'}
                        </Button>
                    </form>
                )}
            </div>
        </div>
      );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#D7CCC8]">
      <PolicyModal />
      
      <div className="max-w-md w-full bg-[#EFEBE9] rounded-xl shadow-xl p-8 border border-[#BCAAA4]">
        <button 
          onClick={() => onNavigate('landing')}
          className="flex items-center text-stone-600 hover:text-black mb-6"
        >
          <ArrowLeft size={16} className="mr-1" /> Retour
        </button>

        <h2 className="text-3xl font-black mb-6 text-center text-stone-900">
          {view === 'login' && 'Connexion'}
          {view === 'register' && 'Compte Vendeur'}
          {view === 'register-buyer' && 'Acheteur Pro 😎🎧'}
        </h2>

        {/* Show referral message if present */}
        {referralId && view === 'register-buyer' && (
            <div className="bg-green-100 border border-green-400 text-green-800 px-4 py-2 rounded text-xs font-bold mb-4 text-center">
                Parrainé ! Vous rejoignez la communauté via un lien ami.
            </div>
        )}

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          
          {view !== 'login' && (
            <div className="flex flex-col items-center mb-6">
                <div className="w-24 h-24 rounded-full bg-stone-200 border-2 border-dashed border-stone-400 flex items-center justify-center overflow-hidden mb-2 relative group cursor-pointer">
                    {profileFile ? (
                        <img src={URL.createObjectURL(profileFile)} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                        <Camera className="text-stone-400" size={32} />
                    )}
                    <input 
                        type="file" 
                        accept="image/*" 
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        onChange={(e) => setProfileFile(e.target.files?.[0] || null)}
                    />
                </div>
                <p className="text-xs text-stone-500">Photo de profil (Optionnel)</p>
            </div>
          )}

          {view !== 'login' && (
            <div>
              <label className="block text-sm font-bold mb-1">{view === 'register' ? "Nom d'artiste / Label" : "Nom d'utilisateur"}</label>
              <input
                required
                type="text"
                className="w-full p-3 border border-stone-400 rounded bg-white focus:outline-none focus:border-red-500"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
            </div>
          )}
          
          <div>
            <label className="block text-sm font-bold mb-1">Email</label>
            <input
              required
              type="email"
              className="w-full p-3 border border-stone-400 rounded bg-white focus:outline-none focus:border-red-500"
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-bold mb-1">Mot de passe</label>
            <input
              required
              type="password"
              className="w-full p-3 border border-stone-400 rounded bg-white focus:outline-none focus:border-red-500"
              value={formData.password}
              onChange={e => setFormData({...formData, password: e.target.value})}
            />
             {view === 'login' && (
                <div className="flex justify-end mt-1">
                    <button 
                        type="button"
                        onClick={() => setIsResetting(true)}
                        className="text-xs text-stone-500 hover:text-red-700 font-bold underline"
                    >
                        Mot de passe oublié ?
                    </button>
                </div>
             )}
          </div>

          {view === 'register' && (
            <div className="space-y-2 mt-4">
              <p className="text-xs font-bold text-stone-500 uppercase mb-2">Politiques obligatoires (cliquez pour lire)</p>
              <PolicyCheckbox 
                label="la Politique de Vente de Sounds."
                checked={policiesAccepted.sales}
                onChange={() => setPoliciesAccepted(p => ({...p, sales: !p.sales}))}
                onRead={() => showPolicy('sales')}
              />
              <PolicyCheckbox 
                label="la Politique de Confidentialité."
                checked={policiesAccepted.privacy}
                onChange={() => setPoliciesAccepted(p => ({...p, privacy: !p.privacy}))}
                onRead={() => showPolicy('privacy')}
              />
              <PolicyCheckbox 
                label="les Conditions d'Utilisation."
                checked={policiesAccepted.terms}
                onChange={() => setPoliciesAccepted(p => ({...p, terms: !p.terms}))}
                onRead={() => showPolicy('terms')}
              />
            </div>
          )}

          {view === 'register-buyer' && (
             <div className="space-y-2 mt-4">
               <p className="text-xs font-bold text-stone-500 uppercase mb-2">Politiques obligatoires</p>
                <PolicyCheckbox 
                  label="la Politique de Confidentialité."
                  checked={policiesAccepted.privacy}
                  onChange={() => setPoliciesAccepted(p => ({...p, privacy: !p.privacy}))}
                  onRead={() => showPolicy('privacy')}
                />
                <PolicyCheckbox 
                  label="les Conditions d'Utilisation."
                  checked={policiesAccepted.terms}
                  onChange={() => setPoliciesAccepted(p => ({...p, terms: !p.terms}))}
                  onRead={() => showPolicy('terms')}
                />
                <PolicyCheckbox 
                  label="la Politique d'Achat Acheteur Pro."
                  checked={policiesAccepted.purchase}
                  onChange={() => setPoliciesAccepted(p => ({...p, purchase: !p.purchase}))}
                  onRead={() => showPolicy('purchase')}
                />
             </div>
          )}

          <Button type="submit" fullWidth disabled={loading} className="mt-6">
            {loading ? 'Chargement...' : (view === 'login' ? 'Se connecter' : 'Créer mon compte')}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm">
          {view === 'login' ? (
            <p>Pas de compte ? <button onClick={() => onNavigate('register')} className="text-red-700 font-bold underline">Créer un compte</button></p>
          ) : (
            <p>Déjà un compte ? <button onClick={() => onNavigate('login')} className="text-red-700 font-bold underline">Se connecter</button></p>
          )}
        </div>
      </div>
    </div>
  );
};
