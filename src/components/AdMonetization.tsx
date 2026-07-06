import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  ExternalLink, 
  TrendingUp, 
  Sliders, 
  X, 
  DollarSign, 
  ShieldCheck, 
  Check, 
  RefreshCw, 
  ArrowUpRight, 
  ShoppingBag, 
  Layers,
  ChevronDown,
  Bell
} from 'lucide-react';

// ==========================================
// 1. ARCHITECTURE INTERFACES & DATA SCHEMA
// ==========================================

export interface AdSource {
  id: string;
  network: 'AdMob' | 'AdManager' | 'AppLovin' | 'UnityAds' | 'DirectPartner';
  name: string;
  ecpm: number; // Simulated eCPM in USD
  title: string;
  description: string;
  imageUrl: string;
  ctaText: string;
  clickUrl: string;
  rating?: number;
  promoBadge?: string;
  category: 'food' | 'vet' | 'medication' | 'insurance' | 'accessories';
}

// Simulated active campaigns reflecting real brand deals and programmatic auction pools
export const SIMULATED_AD_CAMPAIGNS: AdSource[] = [
  {
    id: 'house-institutional-ad',
    network: 'DirectPartner',
    name: 'Parcerias Ctrl+Pet',
    ecpm: 12.50,
    title: 'Seja um Parceiro do Ctrl+Pet!',
    description: 'Quer destacar sua clínica, pet shop ou marca de produtos para milhares de tutores diretamente nesta tela? Entre em contato conosco e conheça nossos planos de anúncios e patrocínios exclusivos.',
    imageUrl: 'https://images.unsplash.com/photo-1544568100-847a948585b9?auto=format&fit=crop&q=80&w=260',
    ctaText: 'Anuncie Aqui',
    clickUrl: 'https://wa.me/5521976721727?text=Olá!%20Gostaria%20de%20anunciar%20ou%20fazer%20uma%20parcerias%20no%20Ctrl%2BPet.',
    promoBadge: 'Parceria de Sucesso 💎',
    category: 'accessories'
  },
  {
    id: 'direct-cobasi-prime',
    network: 'DirectPartner',
    name: 'Cobasi Prime',
    ecpm: 10.20,
    title: 'Assine Cobasi Prime e Economize',
    description: 'Frete grátis nacional, 10% de desconto recorrente em todas as rações e atendimento veterinário online online 24h.',
    imageUrl: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&q=80&w=260',
    ctaText: 'Assinar Agora',
    clickUrl: 'https://cobasi.com.br',
    promoBadge: 'Recomendado ⭐',
    category: 'food'
  },
  {
    id: 'admob-pet-insurance',
    network: 'AdMob',
    name: 'Porto Seguro Pet',
    ecpm: 6.40,
    title: 'Plano de Saúde Porto Pet',
    description: 'Consultas, exames de sangue, vacinas importadas e pronto-socorro sem coparticipação complexa. Simule grátis!',
    imageUrl: 'https://images.unsplash.com/photo-1544568100-847a948585b9?auto=format&fit=crop&q=80&w=260',
    ctaText: 'Simular Plano',
    clickUrl: 'https://portoseguro.com.br',
    promoBadge: 'Anúncio AdMob',
    category: 'insurance'
  },
  {
    id: 'admanager-bayer-seresto',
    network: 'AdManager',
    name: 'Seresto Antipulgas',
    ecpm: 8.90,
    title: 'Até 8 Meses contra Pulgas e Carrapatos',
    description: 'Coleira Seresto Bayer protege seu pet de forma contínua com liberação segura e resistente à água.',
    imageUrl: 'https://images.unsplash.com/photo-1608096299210-db7e38487075?auto=format&fit=crop&q=80&w=260',
    ctaText: 'Ver na Cobasi',
    clickUrl: 'https://cobasi.com.br',
    promoBadge: 'Anúncio Patrocinado',
    category: 'medication'
  },
  {
    id: 'applovin-whiskas-gourmet',
    network: 'AppLovin',
    name: 'Whiskas Sachê',
    ecpm: 4.25,
    title: 'Whiskas® Sachê Refeição Completa',
    description: 'Pedaços cozidos ao vapor ricos em nutrientes, ômega 6 e minerais para o desenvolvimento dos felinos.',
    imageUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=260',
    ctaText: 'Comprar Caixa',
    clickUrl: 'https://whiskas.com.br',
    promoBadge: 'Patrocinado AppLovin',
    category: 'food'
  },
  {
    id: 'unity-dog-toy',
    network: 'UnityAds',
    name: 'Kong Brinquedos',
    ecpm: 3.10,
    title: 'Brinquedos Indestrutíveis Kong®',
    description: 'O melhor mordedor do mundo para gastar energia mental e diminuir a ansiedade de separação do cão.',
    imageUrl: 'https://images.unsplash.com/photo-1576201836106-db1758fd1c97?auto=format&fit=crop&q=80&w=260',
    ctaText: 'Comprar Kong',
    clickUrl: 'https://amazon.com.br',
    promoBadge: 'Unity Ad Network',
    category: 'accessories'
  }
];

// ==========================================
// 2. MAIN MEDIATION & CONFIGURATION CONTEXT
// ==========================================

export interface MediationConfig {
  admobFloorPrice: number; // Minimium eCPM floor pricing (USD)
  enableDirectSponsors: boolean; // Prioritize direct partners
  activeNetworks: {
    AdMob: boolean;
    AdManager: boolean;
    AppLovin: boolean;
    UnityAds: boolean;
    DirectPartner: boolean;
  };
}

export const DEFAULT_MEDIATION_CONFIG: MediationConfig = {
  admobFloorPrice: 2.00,
  enableDirectSponsors: true,
  activeNetworks: {
    AdMob: true,
    AdManager: true,
    AppLovin: true,
    UnityAds: true,
    DirectPartner: true,
  }
};

// Global-like system stats for simulation transparency
export interface MediationLog {
  timestamp: string;
  slot: 'NativeAdCard' | 'AdaptiveBanner' | 'ContextualAdSlot' | 'Interstitial';
  action: string;
  winnerNetwork: string;
  winnerEcpm: number;
  status: 'filled' | 'no-fill' | 'rejected-floor';
}

// In-Memory Global state helper for logs
let globalMediationLogs: MediationLog[] = [];
let logsListeners: (() => void)[] = [];

export const addMediationLog = (log: Omit<MediationLog, 'timestamp'>) => {
  const newLog: MediationLog = {
    ...log,
    timestamp: new Date().toLocaleTimeString('pt-BR'),
  };
  globalMediationLogs = [newLog, ...globalMediationLogs].slice(0, 50);
  logsListeners.forEach(listener => listener());
};

export const subscribeToLogs = (callback: () => void) => {
  logsListeners.push(callback);
  return () => {
    logsListeners = logsListeners.filter(l => l !== callback);
  };
};

export const getMediationLogs = () => globalMediationLogs;

// Shared programmatic mediation engine matching Google Ad Manager / AdMob algorithm
export function runBiddingMediationAuction(
  slot: MediationLog['slot'],
  config: MediationConfig,
  categoryFilter?: 'food' | 'vet' | 'medication' | 'insurance' | 'accessories' | 'all'
): { campaign: AdSource | null; ecpm: number; logs: string[] } {
  const auditLogs: string[] = [];
  auditLogs.push(`Leilão AdMob ativado para o slot: ${slot}`);

  // 1. Filter campaigns based on active networks from our Google mediation rules
  let eligible = SIMULATED_AD_CAMPAIGNS.filter(c => {
    return config.activeNetworks[c.network];
  });

  if (categoryFilter && categoryFilter !== 'all') {
    eligible = eligible.filter(c => c.category === categoryFilter);
  }

  if (eligible.length === 0) {
    auditLogs.push(`Nenhuma rede de anúncios foi habilitada nas configurações.`);
    return { campaign: null, ecpm: 0, logs: auditLogs };
  }

  // 2. Direct Partners priority check
  if (config.enableDirectSponsors) {
    const directSponsors = eligible.filter(c => c.network === 'DirectPartner');
    if (directSponsors.length > 0) {
      // Sort by best eCPM
      directSponsors.sort((a, b) => b.ecpm - a.ecpm);
      const topDirect = directSponsors[0];
      auditLogs.push(`[Mediation Direct Deal] Prioritário ativo: ${topDirect.name} ocupando canal com $${topDirect.ecpm.toFixed(2)} CPM`);
      return { campaign: topDirect, ecpm: topDirect.ecpm, logs: auditLogs };
    }
  }

  // 3. Programmatic Real-time Bidding (RTB) Simulation
  auditLogs.push(`Iniciando Unified Bidding para redes de mediação...`);
  
  // Sort remaining networks by simulated eCPM bidding range
  const rtbCandidates = eligible
    .filter(c => c.network !== 'DirectPartner')
    .map(c => {
      // Intentionally introduce slight bid jittering (+-10%) to simulate actual programmatic auction fluctuation
      const jitter = (Math.random() * 0.2 - 0.1) * c.ecpm;
      return {
        ...c,
        calculatedBid: Math.max(0.1, +(c.ecpm + jitter).toFixed(2))
      };
    });

  if (rtbCandidates.length === 0) {
    auditLogs.push(`Sem lances programáticos qualificados.`);
    return { campaign: null, ecpm: 0, logs: auditLogs };
  }

  // Sort by calculated bid descending
  rtbCandidates.sort((a, b) => b.calculatedBid - a.calculatedBid);
  const highestBidder = rtbCandidates[0];

  auditLogs.push(`Análise de lances recebidos:`);
  rtbCandidates.forEach(cand => {
    auditLogs.push(`-> ${cand.network} (${cand.name}): Lance $${cand.calculatedBid.toFixed(2)} eCPM`);
  });

  // 4. Validate against price floor
  if (highestBidder.calculatedBid < config.admobFloorPrice) {
    auditLogs.push(`[MED_FAIL] Vencedor ${highestBidder.name} ($${highestBidder.calculatedBid.toFixed(2)}) abaixo do piso configurado ($${config.admobFloorPrice.toFixed(2)})`);
    return { campaign: null, ecpm: 0, logs: auditLogs };
  }

  auditLogs.push(`[MED_SUCCESS] AdMob Mediation venceu: ${highestBidder.name} com lance final de $${highestBidder.calculatedBid.toFixed(2)}`);
  
  return { 
    campaign: highestBidder, 
    ecpm: highestBidder.calculatedBid, 
    logs: auditLogs 
  };
}


// ==========================================
// 3. AD MOB COMPONENT 1: NATIVE AD CARD
// ==========================================

interface NativeAdCardProps {
  config: MediationConfig;
  categoryFilter?: 'food' | 'vet' | 'medication' | 'insurance' | 'accessories' | 'all';
}

export function NativeAdCard({ config, categoryFilter = 'all' }: NativeAdCardProps) {
  const [auctionResult, setAuctionResult] = useState<{
    campaign: AdSource | null;
    ecpm: number;
    logs: string[];
  } | null>(null);
  const [loading, setLoading] = useState(true);

  const runAuction = () => {
    setLoading(true);
    const timer = setTimeout(() => {
      const res = runBiddingMediationAuction('NativeAdCard', config, categoryFilter);
      setAuctionResult(res);
      setLoading(false);

      // Save log globally
      addMediationLog({
        slot: 'NativeAdCard',
        action: res.campaign ? `Preencheu com anúncio de ${res.campaign.category}` : 'Falha de Preenchimento (No Fill)',
        winnerNetwork: res.campaign ? res.campaign.network : 'Nenhuma',
        winnerEcpm: res.campaign ? res.ecpm : 0,
        status: res.campaign ? 'filled' : (res.logs.some(l => l.includes('abaixo do piso')) ? 'rejected-floor' : 'no-fill')
      });
    }, 400); // 400ms simulate bidding network latency

    return () => clearTimeout(timer);
  };

  useEffect(() => {
    runAuction();
  }, [config, categoryFilter]);

  if (loading) {
    // Beautiful visual skeleton loader representing the layout dimensions of native cards
    return (
      <div className="w-full max-w-full box-border mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm animate-pulse space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <div className="flex gap-2 items-center w-full sm:w-auto">
            <div className="w-5 h-5 bg-slate-200 dark:bg-slate-800 rounded-md shrink-0"></div>
            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-24"></div>
          </div>
          <div className="sm:ml-auto w-16 h-4 bg-slate-200 dark:bg-slate-800 rounded self-start sm:self-auto"></div>
        </div>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="w-full md:w-16 h-40 md:h-16 bg-slate-200 dark:bg-slate-800 rounded-xl shrink-0"></div>
          <div className="flex-1 space-y-2 w-full">
            <div className="h-3.5 bg-slate-200 dark:bg-slate-800 rounded w-3/4"></div>
            <div className="h-3.5 bg-slate-200 dark:bg-slate-800 rounded w-5/6"></div>
            <div className="h-3 bg-slate-100 dark:bg-slate-850 rounded w-1/2"></div>
          </div>
        </div>
        <div className="h-8 bg-slate-150 dark:bg-slate-850 rounded-xl w-full"></div>
      </div>
    );
  }

  // Graceful zero-height collapse on Programmatic No Fill to preserve clean UX
  if (!auctionResult || !auctionResult.campaign) {
    return (
      <div className="w-full max-w-full box-border mx-auto bg-amber-500/5 border border-dashed border-amber-500/20 rounded-2xl p-4 text-center text-xs text-amber-600/80">
        <div className="font-bold flex items-center justify-center gap-1">
          <span>🛡️</span> Slot Native Ad Ocultado (Piso eCPM não atingido)
        </div>
        <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
          O contêiner do anúncio colapsou para zero pixels para não quebrar o layout limpo do aplicativo.
        </p>
      </div>
    );
  }

  const { campaign } = auctionResult;

  return (
    <div className="w-full max-w-full box-border mx-auto bg-white dark:bg-slate-900 border border-indigo-100 dark:border-indigo-950/40 rounded-2xl p-5 shadow-sm space-y-4 relative overflow-hidden group transition-all hover:shadow-md">
      {/* Visual Ad Tag Indicator */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 text-[10px] font-bold">
        <span className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 break-words whitespace-normal">
          <Sparkles className="w-3.5 h-3.5 shrink-0" />
          <span>{campaign.promoBadge || 'Dica Patrocinada'}</span>
        </span>
        <span className="self-start sm:self-auto bg-indigo-50 dark:bg-indigo-950/60 text-indigo-650 dark:text-indigo-400 text-[8px] uppercase tracking-wider px-2 py-0.5 rounded border border-indigo-200/30">
          Ad ({campaign.network})
        </span>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <img 
          src={campaign.imageUrl} 
          alt={campaign.title} 
          referrerPolicy="no-referrer"
          className="w-full md:w-16 h-40 md:h-16 rounded-xl object-cover border border-slate-100 dark:border-slate-850 shrink-0 shadow-sm"
        />
        <div className="space-y-1.5 min-w-0 w-full">
          <h4 className="text-xs font-bold text-slate-850 dark:text-slate-100 font-sans group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors break-words whitespace-normal">
            {campaign.title}
          </h4>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-sans break-words whitespace-normal">
            {campaign.description}
          </p>
        </div>
      </div>

      <a 
        href={campaign.clickUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="w-full h-8 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 text-[11px] font-bold rounded-xl flex items-center justify-center gap-1 transition-all cursor-pointer border border-indigo-200/20"
      >
        <span>{campaign.ctaText}</span>
        <ArrowUpRight className="w-3.5 h-3.5" />
      </a>
    </div>
  );
}


// ==========================================
// 4. AD MOB COMPONENT 2: ADAPTIVE BANNER
// ==========================================

interface AdaptiveBannerProps {
  config: MediationConfig;
}

export function AdaptiveBanner({ config }: AdaptiveBannerProps) {
  const [ad, setAd] = useState<AdSource | null>(null);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    // Run auction instantly for banner
    const res = runBiddingMediationAuction('AdaptiveBanner', config);
    if (res.campaign) {
      setAd(res.campaign);
      setCollapsed(false);
      
      addMediationLog({
        slot: 'AdaptiveBanner',
        action: `Exibiu banner rotativo: ${res.campaign.name}`,
        winnerNetwork: res.campaign.network,
        winnerEcpm: res.ecpm,
        status: 'filled'
      });
    } else {
      setAd(null);
      setCollapsed(true);

      addMediationLog({
        slot: 'AdaptiveBanner',
        action: `Sem anúncios para o banner (No Fill)`,
        winnerNetwork: 'Nenhuma',
        winnerEcpm: 0,
        status: 'no-fill'
      });
    }
  }, [config]);

  if (collapsed || !ad) {
    // Collapses to zero-height when empty to avoid layout shifts or white space
    return null;
  }

  return (
    <div className="w-full max-w-full box-border mx-auto bg-slate-50 dark:bg-slate-950/40 py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-850 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left no-print overflow-hidden">
      <div className="flex flex-col xs:flex-row items-start xs:items-center gap-3 min-w-0 flex-1 w-full">
        <span className="text-[10px] font-extrabold uppercase bg-indigo-600 text-white px-2 py-0.5 rounded-md tracking-wider shrink-0">
          {ad.id.includes('house') || ad.id.includes('institutional') ? 'ANUNCIE' : 'AD'}
        </span>
        <div className="min-w-0 flex-1 w-full">
          <p className="text-[11px] font-extrabold text-slate-805 dark:text-slate-100 flex flex-wrap items-center gap-1.5 break-words whitespace-normal">
            {ad.title}
            <span className="text-[9px] text-indigo-500 font-medium">({ad.name})</span>
          </p>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 break-words whitespace-normal leading-relaxed mt-1">
            {ad.description}
          </p>
        </div>
      </div>
      
      <div className="flex items-center justify-between sm:justify-end gap-2.5 w-full sm:w-auto shrink-0 border-t sm:border-t-0 border-slate-200 dark:border-slate-800 pt-2.5 sm:pt-0">
        <a 
          href={ad.clickUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="whitespace-nowrap px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-extrabold rounded-lg flex items-center justify-center gap-1 transition-all shadow-sm cursor-pointer flex-1 sm:flex-initial"
        >
          <span>{ad.ctaText || 'Instalar / Acessar'}</span>
          <ArrowUpRight className="w-3 h-3 stroke-[2.5]" />
        </a>
        <button 
          onClick={() => setCollapsed(true)} 
          className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 shrink-0 cursor-pointer hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg transition-colors"
          aria-label="Ignorar anúncio"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}


// ==========================================
// 5. AD MOB COMPONENT 3: CONTEXTUAL AD SLOT
// ==========================================

interface ContextualAdSlotProps {
  config: MediationConfig;
}

export function ContextualAdSlot({ config }: ContextualAdSlotProps) {
  const [showNotificationModal, setShowNotificationModal] = useState(false);

  return (
    <>
      <div className="bg-gradient-to-br from-[#1E1B4B] to-[#0F172A] border border-indigo-900/40 rounded-2xl p-6 shadow-xl text-white relative overflow-hidden group">
        
        {/* Background circles */}
        <div className="absolute right-0 top-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-indigo-500/20 transition-all duration-500"></div>

        <div className="relative space-y-4">
          {/* Top Header Row */}
          <div className="flex justify-between items-center text-[10px] font-bold">
            <span className="flex items-center gap-1.5 text-indigo-350 tracking-wider font-sans uppercase">
              <ShoppingBag className="w-4 h-4 text-indigo-400" />
              <span>Clube de Benefícios Ctrl+Pet</span>
            </span>
            <span className="bg-white/10 hover:bg-white/15 px-2.5 py-0.5 rounded-full text-indigo-200 border border-white/5 font-sans uppercase tracking-wider text-[9px]">
              📢 Lançamento
            </span>
          </div>

          {/* New Launch Layout - Removed brand Petlove */}
          <div className="space-y-3">
            <h3 className="text-base font-black tracking-tight leading-snug text-slate-100 flex flex-wrap items-center gap-2">
              <span>Clube de Benefícios Ctrl+Pet (Em Breve)</span>
              <span className="text-[10px] bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full font-black uppercase">✨ Novidade</span>
            </h3>
            <p className="text-xs text-indigo-200/90 leading-relaxed font-sans">
              Estamos negociando parcerias exclusivas com as maiores redes de petshops, farmácias veterinárias e laboratórios para garantir descontos reais em rações, medicamentos e exames para os usuários do nosso aplicativo.
            </p>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              onClick={() => setShowNotificationModal(true)}
              className="px-5 py-2 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white text-xs font-black rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer border border-indigo-400/20 transition-all"
            >
              <Bell className="w-4 h-4" />
              <span>Quero Ser Avisado</span>
            </button>
          </div>

          {/* Footer line */}
          <div className="text-[9.5px] text-indigo-300/60 font-semibold flex items-center justify-between select-none pt-2 border-t border-indigo-950">
            <span>* Sem custos adicionais para os usuários cadastrados.</span>
            <span className="flex items-center gap-1 text-[11px] text-indigo-305">
              Seguro &amp; Verificado <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            </span>
          </div>
        </div>
      </div>

      {/* Beautiful modal dialog */}
      {showNotificationModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in no-print">
          <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            
            {/* Top Close Button */}
            <button
              onClick={() => setShowNotificationModal(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header / Icon */}
            <div className="flex items-center gap-3">
              <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl text-indigo-600 dark:text-indigo-400">
                <Bell className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h4 className="text-base font-extrabold text-slate-900 dark:text-white">🚀 Falta pouco!</h4>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">Parcerias oficiais em andamento</p>
              </div>
            </div>

            {/* Message Body */}
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-sans pt-1">
              Assim que os primeiros cupons forem liberados, você receberá uma notificação aqui no app.
            </p>

            {/* CTA action to close */}
            <div className="pt-2">
              <button
                onClick={() => setShowNotificationModal(false)}
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-750 text-white font-bold text-xs rounded-xl shadow-md transition-colors cursor-pointer"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}


// ==========================================
// 6. AD MOB COMPONENT 4: INTERSTITIAL COMPONENT & SIMULATOR
// ==========================================

interface InterstitialAdSimulatorProps {
  onDismiss: () => void;
  adSource: AdSource;
}

export function InterstitialAdSimulator({ onDismiss, adSource }: InterstitialAdSimulatorProps) {
  const [countdown, setCountdown] = useState(5);
  const [canClose, setCanClose] = useState(false);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanClose(true);
    }
  }, [countdown]);

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950/95 flex flex-col items-center justify-center p-4 md:p-10 text-white font-sans no-print animate-fade-in select-none">
      
      {/* Top Banner indicating Google AdMob Sandbox */}
      <div className="absolute top-0 inset-x-0 bg-indigo-900 border-b border-indigo-500/20 py-2 px-4 flex items-center justify-between text-xs text-indigo-200 font-semibold font-sans">
        <span className="flex items-center gap-1.5 uppercase tracking-wider text-[10px]">
          <span className="w-2.5 h-2.5 bg-amber-500 rounded-full animate-ping"></span>
          Simulador AdMob Active Mediation (Canal Principal)
        </span>
        <span className="bg-white/10 px-2.5 py-0.5 rounded text-[10px]">
          eCPM: ${adSource.ecpm.toFixed(2)} USD
        </span>
      </div>

      {/* Main Full-Screen Ad Layout resembling a Mobile App Overlay */}
      <div className="relative max-w-xl w-full bg-slate-900/65 rounded-3xl border border-slate-800 p-6 md:p-8 space-y-6 text-center shadow-2xl flex flex-col justify-between items-center my-10 min-h-[420px]">
        
        {/* Ad close control */}
        <div className="absolute top-4 right-4 z-10">
          {canClose ? (
            <button 
              onClick={onDismiss}
              className="p-2.5 bg-white/15 dark:bg-white/10 hover:bg-white/20 active:scale-95 text-white rounded-full transition-all cursor-pointer border border-white/5"
              aria-label="Fechar anúncio"
            >
              <X className="w-5 h-5 stroke-[2.5]" />
            </button>
          ) : (
            <span className="bg-black/60 px-3.5 py-1.5 rounded-full text-xs font-bold text-indigo-200 font-mono tracking-wider border border-white/5">
              Pular em {countdown}s
            </span>
          )}
        </div>

        {/* Brand Logo and Header Info */}
        <div className="space-y-1.5">
          <span className="bg-indigo-650 text-white text-[9px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full border border-indigo-500/30">
            Recomendado por Ctrl+Pet
          </span>
          <h2 className="text-lg md:text-xl font-black text-slate-100 tracking-tight leading-snug mt-3">
            {adSource.title}
          </h2>
          <p className="text-xs text-indigo-300 font-medium font-sans">
            Sponsor: {adSource.name} ({adSource.network})
          </p>
        </div>

        {/* Large Media Artwork */}
        <div className="w-full relative rounded-2xl overflow-hidden aspect-video border border-slate-800 shadow-lg">
          <img 
            src={adSource.imageUrl} 
            alt={adSource.title} 
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-4">
            <p className="text-xs text-left text-slate-100 font-medium line-clamp-2">
              {adSource.description}
            </p>
          </div>
        </div>

        {/* Call to action panel */}
        <div className="w-full space-y-3 pt-2">
          <a 
            href={adSource.clickUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full h-11 bg-gradient-to-r from-[#4040F2] via-[#3737E1] to-[#2020B0] hover:scale-[1.02] text-white text-xs font-extrabold rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer border border-[#5252FF]/30"
          >
            Comprar / Conhecer Oferta 
            <ArrowUpRight className="w-4 h-4 stroke-[3]" />
          </a>
          <button 
            onClick={canClose ? onDismiss : undefined}
            disabled={!canClose}
            className={`text-xs ${canClose ? 'text-slate-400 hover:text-white cursor-pointer' : 'text-slate-650'} transition-colors underline`}
          >
            Continuar para o Prontuário do Pet
          </button>
        </div>
      </div>

      <p className="text-[10px] text-slate-500 max-w-sm text-center leading-normal">
        Você está visualizando a simulação do contêiner de Interstitial do Google AdMob. Nenhum dado do tutor ou do pet foi compartilhado.
      </p>
    </div>
  );
}


// ==========================================
// 7. DEVELOPER MEDIATION REALTIME LOGS INTERACTIVE PANEL
// ==========================================

export function DeveloperMediationPanel({ 
  config, 
  onChangeConfig 
}: { 
  config: MediationConfig; 
  onChangeConfig: (newConfig: MediationConfig) => void; 
}) {
  const [logs, setLogs] = useState<MediationLog[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setLogs(getMediationLogs());
    const unsub = subscribeToLogs(() => {
      setLogs(getMediationLogs());
    });
    return unsub;
  }, []);

  const handleToggleNetwork = (net: keyof MediationConfig['activeNetworks']) => {
    onChangeConfig({
      ...config,
      activeNetworks: {
        ...config.activeNetworks,
        [net]: !config.activeNetworks[net]
      }
    });
  };

  const handleFloorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChangeConfig({
      ...config,
      admobFloorPrice: parseFloat(e.target.value) || 0
    });
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-5 text-left text-slate-200 mt-6 no-print">
      
      {/* Header section toggleable */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="flex justify-between items-center cursor-pointer select-none"
      >
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-black font-sans text-slate-50">
              Console de Mediação e Bidding AdMob / Sponsor
            </h3>
            <p className="text-[11px] text-slate-400">
              Simule pisos de lances, priorização de patrocinadores e visualize logs em tempo real
            </p>
          </div>
        </div>
        <div className="text-slate-400 hover:text-white transition-all p-1.5 bg-slate-800/40 rounded-lg">
          <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {isOpen && (
        <div className="mt-5 pt-5 border-t border-slate-800 space-y-6 animate-fade-in">
          
          {/* Settings grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Left Box: Controls */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                <Sliders className="w-3.5 h-3.5 text-indigo-400" /> Parâmetros de Filtro &amp; Leilão
              </h4>

              {/* Floor Price Input */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase block">
                  Piso de eCPM do Programático: <span className="text-indigo-400 font-extrabold">${config.admobFloorPrice.toFixed(2)} USD</span>
                </label>
                <div className="flex items-center gap-3">
                  <input 
                    type="range" 
                    min="1.00" 
                    max="10.00" 
                    step="0.50"
                    value={config.admobFloorPrice}
                    onChange={handleFloorChange}
                    className="flex-1 accent-indigo-550 h-1 rounded-lg bg-slate-800 cursor-pointer"
                  />
                  <span className="text-xs font-mono font-bold bg-slate-850 px-2.5 py-1 rounded">
                    ${config.admobFloorPrice.toFixed(2)}
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 leading-normal">
                  Lances programáticos (AdMob/AppLovin) abaixo deste valor serão recusados pelo leilão unificado (No Fill).
                </p>
              </div>

              {/* Direct Contract Toggle */}
              <div className="flex items-center justify-between p-3 bg-slate-850 rounded-xl border border-slate-800/60">
                <div className="space-y-0.5">
                  <label className="text-[11px] font-bold text-slate-100 flex items-center gap-1.5">
                    Priorizar Contratos Diretos (Direct Sponsor)
                  </label>
                  <p className="text-[10px] text-slate-400">
                    Garante preenchimento fixo com PremieR ou Cobasi acima de RTB
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onChangeConfig({ ...config, enableDirectSponsors: !config.enableDirectSponsors })}
                  className={`w-11 h-6 rounded-full flex items-center px-1 transition-colors duration-300 ${config.enableDirectSponsors ? 'bg-indigo-600' : 'bg-slate-700'}`}
                >
                  <span className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-300 ${config.enableDirectSponsors ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>
            </div>

            {/* Right Box: Target Networks */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                Redes de Anunciantes Ativas
              </h4>

              <div className="grid grid-cols-2 gap-2">
                {(Object.keys(config.activeNetworks) as Array<keyof MediationConfig['activeNetworks']>).map(net => (
                  <button
                    key={net}
                    onClick={() => handleToggleNetwork(net)}
                    className={`p-2 rounded-xl text-[11px] font-bold border transition-all flex items-center justify-between ${
                      config.activeNetworks[net]
                        ? 'bg-indigo-600/10 border-indigo-500/40 text-indigo-200'
                        : 'bg-slate-850 border-slate-800 text-slate-400'
                    }`}
                  >
                    <span>{net}</span>
                    {config.activeNetworks[net] ? (
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <span className="w-1.5 h-1.5 bg-slate-600 rounded-full shrink-0"></span>
                    )}
                  </button>
                ))}
              </div>
              
              <p className="text-[10px] text-slate-500 mt-2 leading-relaxed">
                Intercale as redes para simular quedas de faturamento e verificar o comportamento responsivo dos slots.
              </p>
            </div>
          </div>

          {/* Unified Logs list */}
          <div className="space-y-3 pt-4 border-t border-slate-800">
            <div className="flex justify-between items-center">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                <RefreshCw className="w-4 h-4 text-indigo-400 animate-spin-slow" /> Histórico do Leilão Real-time (Bidding Tracker)
              </h4>
              <button 
                onClick={() => {
                  globalMediationLogs = [];
                  setLogs([]);
                }}
                className="text-[10px] text-indigo-400 hover:text-indigo-300 underline font-bold"
              >
                Limpar Logs
              </button>
            </div>

            <div className="bg-slate-950 rounded-xl p-3 max-h-48 overflow-y-auto border border-slate-850 font-mono text-[10px] space-y-1.5">
              {logs.length === 0 ? (
                <p className="text-slate-500 italic text-center py-4">Aguardando interações ou recarregamento para registrar os lances...</p>
              ) : (
                logs.map((l, idx) => {
                  let statusColor = 'text-emerald-400';
                  if (l.status === 'no-fill') statusColor = 'text-amber-500';
                  if (l.status === 'rejected-floor') statusColor = 'text-rose-500';

                  return (
                    <div key={idx} className="flex justify-between border-b border-slate-900 pb-1.5 last:border-0 last:pb-0 gap-2 text-left">
                      <div className="truncate">
                        <span className="text-slate-500">[{l.timestamp}]</span>{' '}
                        <span className="text-indigo-400 font-extrabold">{l.slot}</span>:{' '}
                        <span className="text-slate-350">{l.action}</span>
                      </div>
                      <div className={`shrink-0 font-bold ${statusColor}`}>
                        {l.winnerNetwork !== 'Nenhuma' ? `${l.winnerNetwork} ($${l.winnerEcpm.toFixed(2)})` : l.status.toUpperCase()}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
