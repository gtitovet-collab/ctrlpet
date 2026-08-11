import React, { useState, useEffect } from 'react';
import { Pet, Measurement, MedicationSchedule, Dose, Vaccine, ClinicalLog, ReproCycle, RoutineActivity } from './types';
import Onboarding from './components/Onboarding';
import PetModal from './components/PetModal';
import { supabase } from './supabaseClient';
import MeasurementModule from './components/MeasurementModule';
import MedicationModule from './components/MedicationModule';
import VaccineModule from './components/VaccineModule';
import ClinicalHistoryModule from './components/ClinicalHistoryModule';
import ReproductiveModule from './components/ReproductiveModule';
import RoutineModule from './components/RoutineModule';
import ShareExportModule from './components/ShareExportModule';
import NearbyFinder from './components/NearbyFinder';
import { Map as MapIcon } from 'lucide-react';

// AdMob & Monetization System Imports
import { 
  NativeAdCard, 
  AdaptiveBanner, 
  ContextualAdSlot, 
  InterstitialAdSimulator, 
  DEFAULT_MEDIATION_CONFIG, 
  runBiddingMediationAuction,
  MediationConfig,
  AdSource
} from './components/AdMonetization';

import {
  PawPrint,
  Sparkles,
  Plus,
  Trash2,
  Edit2,
  Users,
  Settings2,
  Trash,
  Moon,
  Sun,
  Database,
  Shield,
  Scale,
  Pill,
  Heart,
  Calendar,
  Layers,
  ChevronRight,
  LogOut,
  Clock,
  Menu,
  X,
  Cloud,
  Copy,
  Check,
  Mail
} from 'lucide-react';

// Generates initial seed data so the client sees a rich, functional dashboard on first access (Descobribilidade Instantânea)
const SEED_PET_ID = "pet-atena-gold";
const INITIAL_PETS: Pet[] = [
  {
    id: SEED_PET_ID,
    name: "Atena",
    species: "dog",
    breed: "Golden Retriever",
    gender: "female",
    birthDate: "2024-03-12",
    adoptionDate: "2024-05-15",
    microchip: "981020002938102",
    rga: "RGA-SP-82.102-1",
    photo: "" // Will render a beautiful responsive CSS avatar, user can also upload theirs
  },
  {
    id: "pet-milo-cat",
    name: "Milo",
    species: "cat",
    breed: "Siamês",
    gender: "male",
    birthDate: "2022-08-01",
    adoptionDate: "2022-10-10",
    microchip: "982030001029312",
    rga: "RGA-SP-10.392-5"
  }
];

const INITIAL_MEASUREMENTS: Measurement[] = [
  { id: "m1", petId: SEED_PET_ID, date: "2026-04-10", weight: 22.4, height: 48, notes: "Retorno da tosa" },
  { id: "m2", petId: SEED_PET_ID, date: "2026-05-12", weight: 24.8, height: 50, notes: "Jejum de exames" },
  { id: "m3", petId: SEED_PET_ID, date: "2026-06-18", weight: 26.5, height: 53, notes: "Acompanhamento mensal" }
];

const INITIAL_MEDICATIONS: MedicationSchedule[] = [
  {
    id: "med-antibiotic",
    petId: SEED_PET_ID,
    name: "Cefalexina Pet (Antibiótico)",
    dosage: "1 comprimido - 250mg",
    startDate: "2026-06-18T08:00",
    frequencyHours: 12,
    durationDays: 3,
    notes: "Administrar junto com um petisco úmido após a refeição.",
    doses: [
      { id: "d1", number: 1, scheduledTime: "2026-06-18T08:00", taken: true, takenAt: "2026-06-18T08:15" },
      { id: "d2", number: 2, scheduledTime: "2026-06-18T20:00", taken: true, takenAt: "2026-06-18T20:05" },
      { id: "d3", number: 3, scheduledTime: "2026-06-19T08:00", taken: false },
      { id: "d4", number: 4, scheduledTime: "2026-06-19T20:00", taken: false },
      { id: "d5", number: 5, scheduledTime: "2026-06-20T08:00", taken: false },
      { id: "d6", number: 6, scheduledTime: "2026-06-20T20:00", taken: false }
    ]
  }
];

// Trigger the 7-day alert by setting boosterDate close to local date (2026-06-19)
const INITIAL_VACCINES: Vaccine[] = [
  {
    id: "vac-v10",
    petId: SEED_PET_ID,
    name: "Vacina Quádrupla V10 Canina",
    batch: "L20938X-ZOETIS",
    appliedDate: "2025-06-26",
    boosterDate: "2026-06-24", // Booster date is within 7 days from local datetime 2026-06-19! Triggers warning alert.
    veterinarian: "Dr. André Cabral - CRMV 19283",
    status: "pending",
    notes: "Reforço anual obrigatório contra viroses básicas."
  },
  {
    id: "vac-rabia",
    petId: SEED_PET_ID,
    name: "Vacina Antirrábica Nobivac",
    batch: "R908-MSD",
    appliedDate: "2025-05-18",
    boosterDate: "2026-07-15",
    veterinarian: "Dr. André Cabral - CRMV 19283",
    status: "applied",
    notes: "Dose anual aplicada sem efeitos adversos graves."
  }
];

const INITIAL_CLINICAL_LOGS: ClinicalLog[] = [
  {
    id: "log1",
    petId: SEED_PET_ID,
    type: "surgery",
    date: "2026-04-12",
    title: "Castração Eletiva",
    notes: "Cirurgia tranquila sem intercorrências anestésicas. Utilizou colar elizabetano por 10 dias.",
    diagnostics: "Laudo pós-operatório estável, alta total clínica em 22/04."
  },
  {
    id: "log2",
    petId: SEED_PET_ID,
    type: "behavior",
    date: "2026-06-19",
    title: "Observação de Apatia",
    notes: "Ficou deitada no canto da sala e rejeitou o petisco de semente de abóbora. Monitorar febre.",
  }
];

const INITIAL_REPRO_CYCLES: ReproCycle[] = [
  {
    id: "rep1",
    petId: SEED_PET_ID,
    date: "2026-05-12",
    event: "cio",
    notes: "Primeiro cio da puberdade. Sangramento folicular moderado observado por 12 dias."
  }
];

const INITIAL_ROUTINES: RoutineActivity[] = [
  {
    id: "rout1",
    petId: SEED_PET_ID,
    title: "Troca completa do substrato de areia",
    lastDone: "2026-06-18",
    frequencyDays: 7,
    category: "litter",
    notes: "Usar areia sanitária biodegradável de mandioca."
  },
  {
    id: "rout2",
    petId: SEED_PET_ID,
    title: "Higiene de comedouros de aço inoxidável",
    lastDone: "2026-06-19",
    frequencyDays: 1,
    category: "food",
    notes: "Garante proteção contra coliformes e bactérias de saliva acumulada."
  }
];

export default function App() {
  const [session, setSession] = useState<{
    id?: string;
    email: string;
    isLoggedIn: boolean;
    fullName?: string;
    phone?: string;
    allowWhatsApp?: boolean;
  } | null>(null);
  const [pets, setPets] = useState<Pet[]>([]);
  const [selectedPetId, setSelectedPetId] = useState<string>('');
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [medications, setMedications] = useState<MedicationSchedule[]>([]);
  const [vaccines, setVaccines] = useState<Vaccine[]>([]);
  const [clinicalLogs, setClinicalLogs] = useState<ClinicalLog[]>([]);
  const [reproductiveCycles, setReproductiveCycles] = useState<ReproCycle[]>([]);
  const [routines, setRoutines] = useState<RoutineActivity[]>([]);

  // System states
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'nearby'>('dashboard');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isPetModalOpen, setIsPetModalOpen] = useState(false);
  const [editingPet, setEditingPet] = useState<Pet | null>(null);
  const [isTechOpen, setIsTechOpen] = useState(false);

  // AdMob & Mediation Bidding states
  const [mediationConfig, setMediationConfig] = useState<MediationConfig>(DEFAULT_MEDIATION_CONFIG);
  const [activeInterstitial, setActiveInterstitial] = useState<{
    adSource: AdSource;
    onComplete: () => void;
  } | null>(null);
  const [isInterstitialLoading, setIsInterstitialLoading] = useState(false);
  const [interstitialActionName, setInterstitialActionName] = useState('');

  const handleTriggerInterstitial = (actionName: string, onComplete: () => void) => {
    setInterstitialActionName(actionName);
    setIsInterstitialLoading(true);

    // Beautiful simulated pre-loading delay representing actual high-value document calculation latency
    setTimeout(() => {
      setIsInterstitialLoading(false);
      const auction = runBiddingMediationAuction('Interstitial', mediationConfig);
      if (auction.campaign) {
        setActiveInterstitial({
          adSource: auction.campaign,
          onComplete: () => {
            setActiveInterstitial(null);
            onComplete();
          }
        });
      } else {
        // Safe programmatic bypass on "No Fill" or bid failure
        onComplete();
      }
    }, 1500);
  };
  
  // Profile edit modal states
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [profileName, setProfileName] = useState('');
  const [profilePhone, setProfilePhone] = useState('');
  const [profileConsent, setProfileConsent] = useState(true);

  // Delete account verification states
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState('');

  // Secure Delete (Pet / Vaccine / other records) states with password verification
  const [secureDeleteTarget, setSecureDeleteTarget] = useState<{
    type: 'pet' | 'vaccine' | 'measurement' | 'medication' | 'clinicalLog' | 'repro' | 'routine';
    id: string;
    name: string;
  } | null>(null);
  const [secureDeletePassword, setSecureDeletePassword] = useState('');
  const [secureDeleteError, setSecureDeleteError] = useState('');
  const [toastNotification, setToastNotification] = useState<string | null>(null);

  // Simulation settings for Guarda Compartilhada
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing'>('synced');
  const [coOwnerEmail, setCoOwnerEmail] = useState('');
  const [linkedUsers, setLinkedUsers] = useState<string[]>([]);
  const [coOwners, setCoOwners] = useState<string[]>([]);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [lastInvitedEmail, setLastInvitedEmail] = useState('');
  const [generatedInviteLink, setGeneratedInviteLink] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [isGuardaTableMissing, setIsGuardaTableMissing] = useState(false);

  // Fetch real co-owners from Supabase when selected pet changes
  const fetchCoOwners = async (petId: string) => {
    if (!supabase || !petId) return;
    try {
      const { data, error } = await supabase
        .from('GuardaCompartilhada')
        .select('co_owner_email')
        .eq('pet_id', petId);
      if (error) {
        if (error.code === '42P01' || error.message?.includes('GuardaCompartilhada') || error.message?.includes('schema cache')) {
          setIsGuardaTableMissing(true);
          console.warn('Aviso: Tabela GuardaCompartilhada ainda não existe no Supabase.');
        } else {
          console.error('Erro ao buscar co-proprietários no Supabase:', error.message);
        }
      } else if (data) {
        setCoOwners(data.map((item: any) => item.co_owner_email));
        setIsGuardaTableMissing(false);
      }
    } catch (err) {
      console.error('Erro ao buscar co-proprietários no Supabase:', err);
    }
  };

  useEffect(() => {
    if (selectedPetId) {
      fetchCoOwners(selectedPetId);
    } else {
      setCoOwners([]);
    }
  }, [selectedPetId]);

  // Synchronize linkedUsers with the current logged-in user
  useEffect(() => {
    if (session?.email) {
      const stored = localStorage.getItem(`ctrlpet_linked_users_${session.email.toLowerCase()}`);
      if (stored) {
        setLinkedUsers(JSON.parse(stored));
      } else {
        // Default to showing gtitovet@gmail.com ONLY if the current session is gtitovet@gmail.com
        if (session.email.toLowerCase() === 'gtitovet@gmail.com') {
          setLinkedUsers(['gtitovet@gmail.com']);
        } else {
          setLinkedUsers([]);
        }
      }
    } else {
      setLinkedUsers([]);
    }
  }, [session]);

  // Synchronize pet data with Supabase 'Pets' table
  const syncPetToSupabase = async (pet: Pet) => {
    console.log('Iniciando syncPetToSupabase para o pet:', pet);
    try {
      setSyncStatus('syncing');
      
      if (!supabase) {
        console.warn('Supabase não configurado ou nulo. Salvando apenas localmente.');
        setTimeout(() => setSyncStatus('synced'), 500);
        return;
      }

      console.log('Enviando dados para a tabela "Pets" do Supabase...');
      const formattedBirthDate = pet.birthDate ? pet.birthDate.split('T')[0] : null;
      const formattedAdoptionDate = pet.adoptionDate ? pet.adoptionDate.split('T')[0] : null;
      const petPayload = {
        id: pet.id,
        user_id: session?.id || session?.email || 'unknown',
        Nome: pet.name,
        'Espécie': pet.species,
        'Raça': pet.breed || 'SRD',
        Nascimento: formattedBirthDate,
        'Gênero': pet.gender || null,
        DataAdocao: formattedAdoptionDate,
        Microchip: pet.microchip || null,
        RGA: pet.rga || null,
        Foto: pet.photo || null
      };
      console.log('Payload a ser enviado para Pets:', petPayload);

      const { data, error } = await supabase
        .from('Pets')
        .upsert(petPayload)
        .select();

      if (error) {
        console.error('Erro retornado no upsert de pet:', error);
        setToastNotification('Erro ao salvar na nuvem. Salvo localmente.');
      } else {
        console.log('Resposta de sucesso para pet:', data);
        setToastNotification(`Pet "${pet.name}" sincronizado com a nuvem!`);
      }
    } catch (err: any) {
      console.error('Erro de conexão com o Supabase ao salvar pet:', err);
    } finally {
      setSyncStatus('synced');
    }
  };

  // Synchronize vaccine data with Supabase 'Vacinas' table
  const syncVacinaToSupabase = async (vaccine: Vaccine) => {
    console.log('Iniciando syncVacinaToSupabase para a vacina:', vaccine);
    try {
      setSyncStatus('syncing');
      
      if (!supabase) {
        console.warn('Supabase não configurado ou nulo. Salvando apenas localmente.');
        setTimeout(() => setSyncStatus('synced'), 500);
        return;
      }

      console.log('Enviando dados para a tabela "Vacinas" do Supabase...');
      const vaccinePayload = {
        id: vaccine.id,
        pet_id: vaccine.petId,
        user_id: session?.id || session?.email || 'unknown',
        'Nome': vaccine.name,
        'Aplicação': vaccine.appliedDate || null,
        'Próxima dose': vaccine.boosterDate || null,
        'Lote': vaccine.batch || null,
        'Veterinário(a)': vaccine.veterinarian || null
      };
      console.log('Payload de vacina a ser enviado para Vacinas:', vaccinePayload);

      const { data, error } = await supabase
        .from('Vacinas')
        .upsert(vaccinePayload)
        .select();

      if (error) {
        console.error('Erro retornado no upsert de vacina:', error);
        setToastNotification('Erro ao salvar vacina na nuvem. Salvo localmente.');
      } else {
        console.log('Resposta de sucesso para vacina:', data);
        setToastNotification(`Vacina "${vaccine.name}" sincronizada com a nuvem!`);
      }
    } catch (err: any) {
      console.error('Erro de conexão com o Supabase ao salvar vacina:', err);
    } finally {
      setSyncStatus('synced');
    }
  };

  const deletePetFromSupabase = async (petId: string) => {
    try {
      setSyncStatus('syncing');

      if (!supabase) {
        setTimeout(() => setSyncStatus('synced'), 500);
        return;
      }

      const { error } = await supabase
        .from('Pets')
        .delete()
        .eq('id', petId);

      if (error) {
        console.error('Erro ao deletar pet:', error.message);
        setToastNotification('Erro ao deletar da nuvem. Removido localmente.');
      } else {
        setToastNotification('Pet removido da nuvem!');
      }
    } catch (err: any) {
      console.error('Erro de conexão com o Supabase ao deletar pet:', err);
    } finally {
      setSyncStatus('synced');
    }
  };

  const deleteVaccineFromSupabase = async (vaccineId: string) => {
    try {
      setSyncStatus('syncing');

      if (!supabase) {
        setTimeout(() => setSyncStatus('synced'), 500);
        return;
      }

      const { error } = await supabase
        .from('Vacinas')
        .delete()
        .eq('id', vaccineId);

      if (error) {
        console.error('Erro ao deletar vacina do Supabase:', error.message);
      }
    } catch (err: any) {
      console.error('Erro de conexão com o Supabase ao deletar vacina:', err);
    } finally {
      setSyncStatus('synced');
    }
  };

  const deleteMeasurementFromSupabase = async (id: string) => {
    try {
      if (!supabase) return;
      setSyncStatus('syncing');
      const { error } = await supabase
        .from('Medidas')
        .delete()
        .eq('id', id);
      if (error) {
        console.error('Erro ao deletar medida do Supabase:', error.message);
      }
    } catch (err) {
      console.error('Erro de conexão ao deletar medida do Supabase:', err);
    } finally {
      setSyncStatus('synced');
    }
  };

  const deleteMedicationFromSupabase = async (id: string) => {
    try {
      if (!supabase) return;
      setSyncStatus('syncing');
      const { error } = await supabase
        .from('Medicamentos')
        .delete()
        .eq('id', id);
      if (error) {
        console.error('Erro ao deletar medicamento do Supabase:', error.message);
      }
    } catch (err) {
      console.error('Erro de conexão ao deletar medicamento do Supabase:', err);
    } finally {
      setSyncStatus('synced');
    }
  };

  const deleteClinicalLogFromSupabase = async (id: string) => {
    try {
      if (!supabase) return;
      setSyncStatus('syncing');
      const { error } = await supabase
        .from('HistoricoClinico')
        .delete()
        .eq('id', id);
      if (error) {
        console.error('Erro ao deletar histórico clínico do Supabase:', error.message);
      }
    } catch (err) {
      console.error('Erro de conexão ao deletar histórico clínico do Supabase:', err);
    } finally {
      setSyncStatus('synced');
    }
  };

  const deleteReproCycleFromSupabase = async (id: string) => {
    try {
      if (!supabase) return;
      setSyncStatus('syncing');
      const { error } = await supabase
        .from('CiclosReprodutivos')
        .delete()
        .eq('id', id);
      if (error) {
        console.error('Erro ao deletar ciclo reprodutivo do Supabase:', error.message);
      }
    } catch (err) {
      console.error('Erro de conexão ao deletar ciclo reprodutivo do Supabase:', err);
    } finally {
      setSyncStatus('synced');
    }
  };

  const deleteRoutineFromSupabase = async (id: string) => {
    try {
      if (!supabase) return;
      setSyncStatus('syncing');
      const { error } = await supabase
        .from('Rotinas')
        .delete()
        .eq('id', id);
      if (error) {
        console.error('Erro ao deletar rotina do Supabase:', error.message);
      }
    } catch (err) {
      console.error('Erro de conexão ao deletar rotina do Supabase:', err);
    } finally {
      setSyncStatus('synced');
    }
  };

  const syncMeasurementToSupabase = async (meas: Measurement) => {
    try {
      if (!supabase) return;
      setSyncStatus('syncing');
      const userId = session?.id || session?.email || 'unknown';
      const payload = {
        id: meas.id,
        pet_id: meas.petId,
        user_id: userId,
        Data: meas.date,
        Peso: meas.weight,
        Altura: meas.height,
        "Observações": meas.notes || null
      };
      const { error } = await supabase
        .from('Medidas')
        .upsert(payload);
      if (error) {
        console.error('Erro ao salvar medida no Supabase:', error.message);
      }
    } catch (err) {
      console.error('Erro de conexão ao salvar medida no Supabase:', err);
    } finally {
      setSyncStatus('synced');
    }
  };

  const syncMedicationToSupabase = async (med: MedicationSchedule) => {
    try {
      if (!supabase) return;
      setSyncStatus('syncing');
      const userId = session?.id || session?.email || 'unknown';
      const payload = {
        id: med.id,
        pet_id: med.petId,
        user_id: userId,
        Nome: med.name,
        Dosagem: med.dosage,
        DataInicio: med.startDate,
        FrequenciaHoras: med.frequencyHours,
        DuracaoDias: med.durationDays,
        "Observações": med.notes || null,
        Doses: med.doses
      };
      const { error } = await supabase
        .from('Medicamentos')
        .upsert(payload);
      if (error) {
        console.error('Erro ao salvar medicamento no Supabase:', error.message);
      }
    } catch (err) {
      console.error('Erro de conexão ao salvar medicamento no Supabase:', err);
    } finally {
      setSyncStatus('synced');
    }
  };

  const syncClinicalLogToSupabase = async (log: ClinicalLog) => {
    try {
      if (!supabase) return;
      setSyncStatus('syncing');
      const userId = session?.id || session?.email || 'unknown';
      const payload = {
        id: log.id,
        pet_id: log.petId,
        user_id: userId,
        Tipo: log.type,
        Data: log.date,
        "Título": log.title,
        Notas: log.notes,
        "Diagnóstico": log.diagnostics || null
      };
      const { error } = await supabase
        .from('HistoricoClinico')
        .upsert(payload);
      if (error) {
        console.error('Erro ao salvar histórico clínico no Supabase:', error.message);
      }
    } catch (err) {
      console.error('Erro de conexão ao salvar histórico clínico no Supabase:', err);
    } finally {
      setSyncStatus('synced');
    }
  };

  const syncReproCycleToSupabase = async (repro: ReproCycle) => {
    try {
      if (!supabase) return;
      setSyncStatus('syncing');
      const userId = session?.id || session?.email || 'unknown';
      const payload = {
        id: repro.id,
        pet_id: repro.petId,
        user_id: userId,
        Data: repro.date,
        Evento: repro.event,
        "Observações": repro.notes || null
      };
      const { error } = await supabase
        .from('CiclosReprodutivos')
        .upsert(payload);
      if (error) {
        console.error('Erro ao salvar ciclo reprodutivo no Supabase:', error.message);
      }
    } catch (err) {
      console.error('Erro de conexão ao salvar ciclo reprodutivo no Supabase:', err);
    } finally {
      setSyncStatus('synced');
    }
  };

  const syncRoutineToSupabase = async (rout: RoutineActivity) => {
    try {
      if (!supabase) return;
      setSyncStatus('syncing');
      const userId = session?.id || session?.email || 'unknown';
      const payload = {
        id: rout.id,
        pet_id: rout.petId,
        user_id: userId,
        "Título": rout.title,
        UltimaRealizacao: rout.lastDone,
        FrequenciaDias: rout.frequencyDays,
        Categoria: rout.category,
        "Observações": rout.notes || null
      };
      const { error } = await supabase
        .from('Rotinas')
        .upsert(payload);
      if (error) {
        console.error('Erro ao salvar rotina no Supabase:', error.message);
      }
    } catch (err) {
      console.error('Erro de conexão ao salvar rotina no Supabase:', err);
    } finally {
      setSyncStatus('synced');
    }
  };

  const fetchPetsFromSupabase = async (activeSession?: typeof session): Promise<Pet[]> => {
    try {
      if (!supabase) {
        return [];
      }
      setSyncStatus('syncing');
      const sess = activeSession ?? session;
      const userId = sess?.id || sess?.email || 'unknown';
      const email = sess?.email?.toLowerCase().trim();

      // 1. Tentar carregar os IDs de pets compartilhados na guarda compartilhada de forma defensiva
      let sharedPetIds: string[] = [];
      if (email) {
        try {
          const { data: sharedData, error: sharedError } = await supabase
            .from('GuardaCompartilhada')
            .select('pet_id')
            .eq('co_owner_email', email);
          if (sharedError) {
            console.warn('Erro ao consultar GuardaCompartilhada:', sharedError.message);
            if (sharedError.code === '42P01' || sharedError.message?.includes('GuardaCompartilhada') || sharedError.message?.includes('schema cache')) {
              setIsGuardaTableMissing(true);
            }
          } else if (sharedData) {
            sharedPetIds = sharedData.map((s: any) => s.pet_id);
            setIsGuardaTableMissing(false);
          }
        } catch (sharedErr) {
          console.warn('Tabela GuardaCompartilhada ainda não configurada no Supabase. Fallback local ativo.', sharedErr);
        }
      }

      // 2. Fazer query filtrando pelos pets de posse direta OU pets compartilhados via Guarda
      let query = supabase.from('Pets').select('*');
      if (sharedPetIds.length > 0) {
        const escapedIds = sharedPetIds.map(id => `"${id}"`).join(',');
        query = query.or(`user_id.eq."${userId}",id.in.(${escapedIds})`);
      } else {
        query = query.eq('user_id', userId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Erro ao buscar pets do Supabase:', error.message);
        return [];
      } else {
        const mappedPets: Pet[] = (data || []).map((item: any) => {
          const rawSpecies = (item['Espécie'] || item.species || '').toLowerCase();
          const mappedSpecies: 'dog' | 'cat' | 'other' = 
            rawSpecies.includes('gato') || rawSpecies.includes('cat') 
              ? 'cat' 
              : (rawSpecies.includes('cachorro') || rawSpecies.includes('cão') || rawSpecies.includes('cao') || rawSpecies.includes('dog') 
                ? 'dog' 
                : 'other');

          return {
            id: item.id,
            name: item.Nome || item.name || 'Sem nome',
            species: mappedSpecies,
            breed: item['Raça'] || item.breed || 'SRD',
            gender: (item['Gênero'] || item.gender || 'male') as 'male' | 'female',
            birthDate: item['Nascimento'] || item.birthDate || undefined,
            adoptionDate: item['DataAdocao'] || item.adoptionDate || undefined,
            microchip: item['Microchip'] || item.microchip || undefined,
            rga: item['RGA'] || item.rga || undefined,
            photo: item['Foto'] || item.photo || undefined
          };
        });

        setPets(mappedPets);
        localStorage.setItem('ctrlpet_pets', JSON.stringify(mappedPets));
        if (mappedPets.length > 0) {
          setToastNotification('Pets carregados da nuvem!');
        }
        return mappedPets;
      }
    } catch (err) {
      console.error('Erro ao conectar ao Supabase para buscar pets:', err);
      return [];
    } finally {
      setSyncStatus('synced');
    }
  };

  const fetchVaccinesFromSupabase = async (activeSession?: typeof session, currentPets?: Pet[]) => {
    try {
      if (!supabase) {
        return;
      }
      setSyncStatus('syncing');
      const sess = activeSession ?? session;
      const userId = sess?.id || sess?.email || 'unknown';

      const petsList = currentPets ?? pets;
      const petIds = petsList.map(p => p.id);

      let query = supabase.from('Vacinas').select('*');
      if (petIds.length > 0) {
        query = query.in('pet_id', petIds);
      } else {
        query = query.eq('user_id', userId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Erro ao buscar vacinas do Supabase:', error.message);
      } else {
        const mappedVaccines: Vaccine[] = (data || []).map((item: any) => {
          return {
            id: item.id ? item.id.toString() : `vac-sync-${Date.now()}-${Math.random()}`,
            petId: item.pet_id ? item.pet_id.toString() : selectedPetId,
            name: item.Nome || item.name || 'Sem nome',
            appliedDate: item['Aplicação'] || item.appliedDate || null,
            boosterDate: item['Próxima dose'] || item.boosterDate || '',
            batch: item.Lote || item.batch || undefined,
            veterinarian: item['Veterinário(a)'] || item.veterinarian || undefined,
            status: item['Aplicação'] || item.appliedDate ? 'applied' : 'pending',
            notes: item.notes || ''
          } as Vaccine;
        });

        setVaccines(mappedVaccines);
        localStorage.setItem('ctrlpet_vac', JSON.stringify(mappedVaccines));
      }
    } catch (err) {
      console.error('Erro ao conectar ao Supabase para buscar vacinas:', err);
    } finally {
      setSyncStatus('synced');
    }
  };

  const fetchMeasurementsFromSupabase = async (activeSession?: typeof session, currentPets?: Pet[]) => {
    try {
      if (!supabase) return;
      setSyncStatus('syncing');
      const sess = activeSession ?? session;
      const userId = sess?.id || sess?.email || 'unknown';

      const petsList = currentPets ?? pets;
      const petIds = petsList.map(p => p.id);

      let query = supabase.from('Medidas').select('*');
      if (petIds.length > 0) {
        query = query.in('pet_id', petIds);
      } else {
        query = query.eq('user_id', userId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Erro ao buscar medidas do Supabase:', error.message);
      } else {
        const mapped: Measurement[] = (data || []).map((item: any) => ({
          id: item.id,
          petId: item.pet_id,
          date: item.Data || item.date,
          weight: Number(item.Peso || item.weight || 0),
          height: Number(item.Altura || item.height || 0),
          notes: item['Observações'] || item.notes
        }));

        setMeasurements(mapped);
        localStorage.setItem('ctrlpet_meas', JSON.stringify(mapped));
      }
    } catch (err) {
      console.error('Erro ao conectar ao Supabase para buscar medidas:', err);
    } finally {
      setSyncStatus('synced');
    }
  };

  const fetchMedicationsFromSupabase = async (activeSession?: typeof session, currentPets?: Pet[]) => {
    try {
      if (!supabase) return;
      setSyncStatus('syncing');
      const sess = activeSession ?? session;
      const userId = sess?.id || sess?.email || 'unknown';

      const petsList = currentPets ?? pets;
      const petIds = petsList.map(p => p.id);

      let query = supabase.from('Medicamentos').select('*');
      if (petIds.length > 0) {
        query = query.in('pet_id', petIds);
      } else {
        query = query.eq('user_id', userId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Erro ao buscar medicamentos do Supabase:', error.message);
      } else {
        const mapped: MedicationSchedule[] = (data || []).map((item: any) => ({
          id: item.id,
          petId: item.pet_id,
          name: item.Nome || item.name,
          dosage: item.Dosagem || item.dosage,
          startDate: item.DataInicio || item.startDate,
          frequencyHours: Number(item.FrequenciaHoras || item.frequencyHours),
          durationDays: Number(item.DuracaoDias || item.durationDays),
          notes: item['Observações'] || item.notes,
          doses: Array.isArray(item.Doses) ? item.Doses : []
        }));

        setMedications(mapped);
        localStorage.setItem('ctrlpet_meds', JSON.stringify(mapped));
      }
    } catch (err) {
      console.error('Erro ao conectar ao Supabase para buscar medicamentos:', err);
    } finally {
      setSyncStatus('synced');
    }
  };

  const fetchClinicalLogsFromSupabase = async (activeSession?: typeof session, currentPets?: Pet[]) => {
    try {
      if (!supabase) return;
      setSyncStatus('syncing');
      const sess = activeSession ?? session;
      const userId = sess?.id || sess?.email || 'unknown';

      const petsList = currentPets ?? pets;
      const petIds = petsList.map(p => p.id);

      let query = supabase.from('HistoricoClinico').select('*');
      if (petIds.length > 0) {
        query = query.in('pet_id', petIds);
      } else {
        query = query.eq('user_id', userId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Erro ao buscar histórico clínico do Supabase:', error.message);
      } else {
        const mapped: ClinicalLog[] = (data || []).map((item: any) => ({
          id: item.id,
          petId: item.pet_id,
          type: item.Tipo || item.type,
          date: item.Data || item.date,
          title: item['Título'] || item.title,
          notes: item.Notas || item.notes,
          diagnostics: item['Diagnóstico'] || item.diagnostics
        }));

        setClinicalLogs(mapped);
        localStorage.setItem('ctrlpet_logs', JSON.stringify(mapped));
      }
    } catch (err) {
      console.error('Erro ao conectar ao Supabase para buscar histórico clínico:', err);
    } finally {
      setSyncStatus('synced');
    }
  };

  const fetchReproCyclesFromSupabase = async (activeSession?: typeof session, currentPets?: Pet[]) => {
    try {
      if (!supabase) return;
      setSyncStatus('syncing');
      const sess = activeSession ?? session;
      const userId = sess?.id || sess?.email || 'unknown';

      const petsList = currentPets ?? pets;
      const petIds = petsList.map(p => p.id);

      let query = supabase.from('CiclosReprodutivos').select('*');
      if (petIds.length > 0) {
        query = query.in('pet_id', petIds);
      } else {
        query = query.eq('user_id', userId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Erro ao buscar ciclos reprodutivos do Supabase:', error.message);
      } else {
        const mapped: ReproCycle[] = (data || []).map((item: any) => ({
          id: item.id,
          petId: item.pet_id,
          date: item.Data || item.date,
          event: item.Evento || item.event,
          notes: item['Observações'] || item.notes
        }));

        setReproductiveCycles(mapped);
        localStorage.setItem('ctrlpet_repro', JSON.stringify(mapped));
      }
    } catch (err) {
      console.error('Erro ao conectar ao Supabase para buscar ciclos reprodutivos:', err);
    } finally {
      setSyncStatus('synced');
    }
  };

  const fetchRoutinesFromSupabase = async (activeSession?: typeof session, currentPets?: Pet[]) => {
    try {
      if (!supabase) return;
      setSyncStatus('syncing');
      const sess = activeSession ?? session;
      const userId = sess?.id || sess?.email || 'unknown';

      const petsList = currentPets ?? pets;
      const petIds = petsList.map(p => p.id);

      let query = supabase.from('Rotinas').select('*');
      if (petIds.length > 0) {
        query = query.in('pet_id', petIds);
      } else {
        query = query.eq('user_id', userId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Erro ao buscar rotinas do Supabase:', error.message);
      } else {
        const mapped: RoutineActivity[] = (data || []).map((item: any) => ({
          id: item.id,
          petId: item.pet_id,
          title: item['Título'] || item.title,
          lastDone: item.UltimaRealizacao || item.lastDone,
          frequencyDays: Number(item.FrequenciaDias || item.frequencyDays),
          category: item.Categoria || item.category,
          notes: item['Observações'] || item.notes
        }));

        setRoutines(mapped);
        localStorage.setItem('ctrlpet_rout', JSON.stringify(mapped));
      }
    } catch (err) {
      console.error('Erro ao conectar ao Supabase para buscar rotinas:', err);
    } finally {
      setSyncStatus('synced');
    }
  };

  const handleLoadFromSupabase = async (activeSession?: typeof session) => {
    const sess = activeSession ?? session;
    if (!sess?.isLoggedIn) {
      console.log('Sem sessão ativa. Pulando carga do Supabase.');
      return;
    }
    const loadedPets = await fetchPetsFromSupabase(sess);
    await fetchVaccinesFromSupabase(sess, loadedPets);
    await fetchMeasurementsFromSupabase(sess, loadedPets);
    await fetchMedicationsFromSupabase(sess, loadedPets);
    await fetchClinicalLogsFromSupabase(sess, loadedPets);
    await fetchReproCyclesFromSupabase(sess, loadedPets);
    await fetchRoutinesFromSupabase(sess, loadedPets);
  };

  const checkAndApplyInvite = async (sess: typeof session) => {
    if (!sess?.email || !supabase) {
      await handleLoadFromSupabase(sess);
      return;
    }
    const params = new URLSearchParams(window.location.search);
    const invitePetId = params.get('invite');
    const invitePetName = params.get('petName') || 'Pet';
    
    if (invitePetId) {
      try {
        const email = sess.email.toLowerCase().trim();
        const { error } = await supabase
          .from('GuardaCompartilhada')
          .upsert({
            pet_id: invitePetId,
            co_owner_email: email
          });
        
        if (error) {
          if (error.code === '42P01' || error.message?.includes('GuardaCompartilhada') || error.message?.includes('schema cache')) {
            setIsGuardaTableMissing(true);
            console.warn('Aviso: Tabela GuardaCompartilhada ausente no Supabase.');
            setToastNotification(`Você aceitou o convite para compartilhar a guarda do(a) ${invitePetName}! Salvando localmente (Tabela Supabase pendente).`);
            // Clean search params
            window.history ? window.history.replaceState({}, document.title, window.location.pathname) : null;
          } else {
            console.error('Erro ao aceitar convite no Supabase:', error.message);
          }
        } else {
          setToastNotification(`Você aceitou o convite para compartilhar a guarda do(a) ${invitePetName}!`);
          setIsGuardaTableMissing(false);
          // Clean search params
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      } catch (err) {
        console.error('Erro ao salvar vínculo de guarda compartilhada:', err);
      }
    }
    // Always load the data after checking/applying
    await handleLoadFromSupabase(sess);
  };

  // Load state on startup
  useEffect(() => {
    // Check dark mode
    const storedTheme = localStorage.getItem('ctrlpet_dark_mode');
    if (storedTheme === 'true') {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }

    // Check user session
    const storedSession = localStorage.getItem('ctrlpet_session');
    let parsedSession = null;
    if (storedSession) {
      parsedSession = JSON.parse(storedSession);
      setSession(parsedSession);
      setProfileName(parsedSession.fullName || '');
      setProfilePhone(parsedSession.phone || '');
      setProfileConsent(parsedSession.allowWhatsApp ?? true);
    }

    // Load or initialize DB schema states
    const storedPets = localStorage.getItem('ctrlpet_pets');
    if (storedPets) {
      setPets(JSON.parse(storedPets));
    } else {
      setPets(INITIAL_PETS);
      localStorage.setItem('ctrlpet_pets', JSON.stringify(INITIAL_PETS));
    }

    const storedMeas = localStorage.getItem('ctrlpet_meas');
    if (storedMeas) {
      setMeasurements(JSON.parse(storedMeas));
    } else {
      setMeasurements(INITIAL_MEASUREMENTS);
      localStorage.setItem('ctrlpet_meas', JSON.stringify(INITIAL_MEASUREMENTS));
    }

    const storedMeds = localStorage.getItem('ctrlpet_meds');
    if (storedMeds) {
      setMedications(JSON.parse(storedMeds));
    } else {
      setMedications(INITIAL_MEDICATIONS);
      localStorage.setItem('ctrlpet_meds', JSON.stringify(INITIAL_MEDICATIONS));
    }

    const storedVac = localStorage.getItem('ctrlpet_vac');
    if (storedVac) {
      setVaccines(JSON.parse(storedVac));
    } else {
      setVaccines(INITIAL_VACCINES);
      localStorage.setItem('ctrlpet_vac', JSON.stringify(INITIAL_VACCINES));
    }

    const storedLogs = localStorage.getItem('ctrlpet_logs');
    if (storedLogs) {
      setClinicalLogs(JSON.parse(storedLogs));
    } else {
      setClinicalLogs(INITIAL_CLINICAL_LOGS);
      localStorage.setItem('ctrlpet_logs', JSON.stringify(INITIAL_CLINICAL_LOGS));
    }

    const storedRepro = localStorage.getItem('ctrlpet_repro');
    if (storedRepro) {
      setReproductiveCycles(JSON.parse(storedRepro));
    } else {
      setReproductiveCycles(INITIAL_REPRO_CYCLES);
      localStorage.setItem('ctrlpet_repro', JSON.stringify(INITIAL_REPRO_CYCLES));
    }

    const storedRout = localStorage.getItem('ctrlpet_rout');
    if (storedRout) {
      setRoutines(JSON.parse(storedRout));
    } else {
      setRoutines(INITIAL_ROUTINES);
      localStorage.setItem('ctrlpet_rout', JSON.stringify(INITIAL_ROUTINES));
    }

    // Load data from Supabase only if user has an active session
    // Pass parsedSession directly to avoid React setState race condition and check incoming invitations
    checkAndApplyInvite(parsedSession);
  }, []);

  // Update selected pet id automatically when pets populate
  useEffect(() => {
    if (pets.length > 0) {
      const exists = pets.some((p) => p.id === selectedPetId);
      if (!exists) {
        setSelectedPetId(pets[0].id);
      }
    } else {
      setSelectedPetId('');
    }
  }, [pets, selectedPetId]);

  // Persists updates locally
  const saveState = (key: string, data: any, stateSetter: Function) => {
    setSyncStatus('syncing');
    stateSetter(data);
    localStorage.setItem(key, JSON.stringify(data));
    setTimeout(() => setSyncStatus('synced'), 700);
  };

  // Toggle theme
  const handleToggleTheme = () => {
    const nextVal = !isDarkMode;
    setIsDarkMode(nextVal);
    localStorage.setItem('ctrlpet_dark_mode', String(nextVal));
    if (nextVal) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // 1. Pets Autonomy Setup
  const handlePetSave = (petData: Partial<Pet>) => {
    console.log('handlePetSave chamada com petData:', petData);
    if (petData.id) {
      // Editing
      console.log('Editando pet existente com id:', petData.id);
      const updated = pets.map((p) => {
        if (p.id === petData.id) {
          const editedPet = {
            ...p,
            ...petData,
            birthDate: petData.birthDate || undefined,
            adoptionDate: petData.adoptionDate || undefined
          } as Pet;
          console.log('Pet editado gerado para sincronizar:', editedPet);
          // Sync with Supabase
          syncPetToSupabase(editedPet);
          return editedPet;
        }
        return p;
      });
      saveState('ctrlpet_pets', updated, setPets);
    } else {
      // Add new
      console.log('Adicionando novo pet');
      const newPet: Pet = {
        id: `pet-uuid-${Date.now()}`,
        name: petData.name || 'Sem nome',
        species: petData.species || 'dog',
        breed: petData.breed || 'SRD',
        gender: petData.gender || 'male',
        birthDate: petData.birthDate || undefined,
        adoptionDate: petData.adoptionDate,
        microchip: petData.microchip,
        rga: petData.rga,
        photo: petData.photo
      };
      console.log('Novo pet gerado:', newPet);
      const updated = [...pets, newPet];
      saveState('ctrlpet_pets', updated, setPets);
      setSelectedPetId(newPet.id);
      // Sync with Supabase
      syncPetToSupabase(newPet);
    }
    setIsPetModalOpen(false);
    setEditingPet(null);
  };

  const handlePetDelete = (id: string) => {
    const updated = pets.filter((p) => p.id !== id);
    saveState('ctrlpet_pets', updated, setPets);
    if (selectedPetId === id && updated.length > 0) {
      setSelectedPetId(updated[0].id);
    } else if (updated.length === 0) {
      setSelectedPetId('');
    }
    // Delete from Supabase
    deletePetFromSupabase(id);
  };

  // Trigger modal for password authorization of deleting selected records
  const triggerItemDelete = (
    type: 'pet' | 'vaccine' | 'measurement' | 'medication' | 'clinicalLog' | 'repro' | 'routine',
    id: string,
    name: string
  ) => {
    setSecureDeleteTarget({ type, id, name });
    setSecureDeletePassword('');
    setSecureDeleteError('');
  };

  // Helper code to handle the floating validation & toast notification fade
  const showSuccessToast = (msg: string) => {
    setToastNotification(msg);
    setTimeout(() => {
      setToastNotification((prev) => prev === msg ? null : prev);
    }, 4000);
  };

  const handleConfirmSecureDelete = (e: React.FormEvent) => {
    e.preventDefault();
    setSecureDeleteError('');

    const registeredUsers = JSON.parse(localStorage.getItem('ctrlpet_registered_users') || '[]');
    const currentUserObj = registeredUsers.find((u: any) => u.email.toLowerCase() === session?.email?.toLowerCase());
    const correctPassword = currentUserObj ? currentUserObj.password : '';

    if (!secureDeletePassword) {
      setSecureDeleteError('Por favor, informe a senha para autorizar a operação.');
      return;
    }

    if (secureDeletePassword !== correctPassword) {
      setSecureDeleteError('Senha incorreta! Não foi possível autorizar a exclusão.');
      return;
    }

    if (!secureDeleteTarget) return;

    if (secureDeleteTarget.type === 'pet') {
      handlePetDelete(secureDeleteTarget.id);
      showSuccessToast(`Pet "${secureDeleteTarget.name}" excluído com sucesso!`);
    } else if (secureDeleteTarget.type === 'vaccine') {
      const updatedVac = vaccines.filter((v) => v.id !== secureDeleteTarget.id);
      saveState('ctrlpet_vac', updatedVac, setVaccines);
      deleteVaccineFromSupabase(secureDeleteTarget.id);
      showSuccessToast(`Registro de vacina "${secureDeleteTarget.name}" removido!`);
    } else if (secureDeleteTarget.type === 'measurement') {
      handleDeleteMeasurement(secureDeleteTarget.id);
      showSuccessToast(`Medição "${secureDeleteTarget.name}" removida com sucesso!`);
    } else if (secureDeleteTarget.type === 'medication') {
      handleDeleteSchedule(secureDeleteTarget.id);
      showSuccessToast(`Ciclo de medicamento "${secureDeleteTarget.name}" removido com sucesso!`);
    } else if (secureDeleteTarget.type === 'repro') {
      handleDeleteReproCycle(secureDeleteTarget.id);
      showSuccessToast(`Ciclo reprodutivo "${secureDeleteTarget.name}" removido com sucesso!`);
    } else if (secureDeleteTarget.type === 'clinicalLog') {
      handleDeleteClinicalLog(secureDeleteTarget.id);
      showSuccessToast(`Registro clínico "${secureDeleteTarget.name}" removido com sucesso!`);
    } else if (secureDeleteTarget.type === 'routine') {
      handleDeleteRoutine(secureDeleteTarget.id);
      showSuccessToast(`Atividade de rotina "${secureDeleteTarget.name}" removida com sucesso!`);
    }

    setSecureDeleteTarget(null);
  };

  // 2. Weights and heights
  const handleAddMeasurement = (weight: number, height: number, date: string, notes?: string) => {
    const newM: Measurement = {
      id: `meas-${Date.now()}`,
      petId: selectedPetId,
      weight,
      height,
      date,
      notes
    };
    const updated = [...measurements, newM];
    saveState('ctrlpet_meas', updated, setMeasurements);
    syncMeasurementToSupabase(newM);
  };

  const handleDeleteMeasurement = (id: string) => {
    const updated = measurements.filter((m) => m.id !== id);
    saveState('ctrlpet_meas', updated, setMeasurements);
    deleteMeasurementFromSupabase(id);
  };

  // 3. Vaccines manual scheduler
  const handleAddVaccine = (
    name: string,
    boosterDate: string,
    appliedDate: string | null,
    batch?: string,
    veterinarian?: string,
    notes?: string,
    nextBoosterDate?: string
  ) => {
    const list = [...vaccines];
    const baseId = Date.now();
    
    const newV: Vaccine = {
      id: `vaccine-${baseId}`,
      petId: selectedPetId,
      name,
      boosterDate: nextBoosterDate && appliedDate ? appliedDate : boosterDate,
      appliedDate,
      batch,
      veterinarian,
      notes,
      status: appliedDate ? 'applied' : 'pending'
    };
    list.push(newV);
    // Sync with Supabase
    syncVacinaToSupabase(newV);

    if (nextBoosterDate) {
      const nextV: Vaccine = {
        id: `vaccine-${baseId + 1}`,
        petId: selectedPetId,
        name,
        boosterDate: nextBoosterDate,
        appliedDate: null,
        batch: undefined,
        veterinarian: undefined,
        notes: `Reforço programado após dose aplicada em ${appliedDate ? new Date(appliedDate).toLocaleDateString('pt-BR', {timeZone: 'UTC'}) : ''}`,
        status: 'pending'
      };
      list.push(nextV);
      // Sync with Supabase
      syncVacinaToSupabase(nextV);
    }

    saveState('ctrlpet_vac', list, setVaccines);
  };

  const handleToggleVaccineStatus = (id: string) => {
    let updatedVaccine: Vaccine | null = null;
    const updated = vaccines.map((v) => {
      if (v.id === id) {
        const nv = {
          ...v,
          status: v.status === 'applied' ? 'pending' : 'applied',
          appliedDate: v.status === 'applied' ? null : new Date().toISOString().split('T')[0]
        } as Vaccine;
        updatedVaccine = nv;
        return nv;
      }
      return v;
    });
    saveState('ctrlpet_vac', updated, setVaccines);
    if (updatedVaccine) {
      syncVacinaToSupabase(updatedVaccine);
    }
  };

  const handleDeleteVaccine = (id: string) => {
    const updated = vaccines.filter((v) => v.id !== id);
    saveState('ctrlpet_vac', updated, setVaccines);
    deleteVaccineFromSupabase(id);
  };

  // 4. Multi-dose medicine cycles (Cadastro Único de Múltiplas Doses)
  const handleAddSchedule = (name: string, dosage: string, startDate: string, frequencyHours: number, durationDays: number, notes?: string) => {
    const scheduleId = `sched-${Date.now()}`;
    const totalDoses = Math.ceil((durationDays * 24) / frequencyHours);
    const startObj = new Date(startDate);
    
    const doseItems: Dose[] = [];
    for (let i = 0; i < totalDoses; i++) {
      const scheduledTime = new Date(startObj.getTime() + i * frequencyHours * 60 * 60 * 1000);
      doseItems.push({
        id: `dose-${scheduleId}-${i}`,
        number: i + 1,
        scheduledTime: scheduledTime.toISOString(),
        taken: false
      });
    }

    const newSched: MedicationSchedule = {
      id: scheduleId,
      petId: selectedPetId,
      name,
      dosage,
      startDate,
      frequencyHours,
      durationDays,
      notes,
      doses: doseItems
    };

    const updated = [...medications, newSched];
    saveState('ctrlpet_meds', updated, setMedications);
    syncMedicationToSupabase(newSched);
  };

  const handleDeleteSchedule = (id: string) => {
    const updated = medications.filter((m) => m.id !== id);
    saveState('ctrlpet_meds', updated, setMedications);
    deleteMedicationFromSupabase(id);
  };

  const handleToggleDose = (scheduleId: string, doseId: string) => {
    let updatedMed: MedicationSchedule | null = null;
    const updated = medications.map((s) => {
      if (s.id === scheduleId) {
        const updatedDoses = s.doses.map((d) => {
          if (d.id === doseId) {
            return {
              ...d,
              taken: !d.taken,
              takenAt: !d.taken ? new Date().toISOString() : undefined
            };
          }
          return d;
        });
        const ns = { ...s, doses: updatedDoses };
        updatedMed = ns;
        return ns;
      }
      return s;
    });
    saveState('ctrlpet_meds', updated, setMedications);
    if (updatedMed) {
      syncMedicationToSupabase(updatedMed);
    }
  };

  // 5. Clinical history reports
  const handleAddClinicalLog = (type: 'consultation' | 'surgery' | 'hospitalization' | 'allergy' | 'behavior', title: string, date: string, notes: string, diagnostics?: string) => {
    const newL: ClinicalLog = {
      id: `log-${Date.now()}`,
      petId: selectedPetId,
      type,
      title,
      date,
      notes,
      diagnostics
    };
    const updated = [...clinicalLogs, newL];
    saveState('ctrlpet_logs', updated, setClinicalLogs);
    syncClinicalLogToSupabase(newL);
  };

  const handleDeleteClinicalLog = (id: string) => {
    const updated = clinicalLogs.filter((l) => l.id !== id);
    saveState('ctrlpet_logs', updated, setClinicalLogs);
    deleteClinicalLogFromSupabase(id);
  };

  // 6. Reproductive cycle registration
  const handleAddReproCycle = (date: string, event: 'cio' | 'insemination' | 'cross', notes?: string) => {
    const newC: ReproCycle = {
      id: `repro-${Date.now()}`,
      petId: selectedPetId,
      date,
      event,
      notes
    };
    const updated = [...reproductiveCycles, newC];
    saveState('ctrlpet_repro', updated, setReproductiveCycles);
    syncReproCycleToSupabase(newC);
  };

  const handleDeleteReproCycle = (id: string) => {
    const updated = reproductiveCycles.filter((c) => c.id !== id);
    saveState('ctrlpet_repro', updated, setReproductiveCycles);
    deleteReproCycleFromSupabase(id);
  };

  // 7. Cleaning and routine activity
  const handleAddRoutine = (title: string, frequencyDays: number, category: 'cleaning' | 'litter' | 'food', notes?: string) => {
    const newR: RoutineActivity = {
      id: `rout-${Date.now()}`,
      petId: selectedPetId,
      title,
      frequencyDays,
      category,
      notes,
      lastDone: new Date().toISOString().split('T')[0]
    };
    const updated = [...routines, newR];
    saveState('ctrlpet_rout', updated, setRoutines);
    syncRoutineToSupabase(newR);
  };

  const handleBumpRoutine = (id: string) => {
    let updatedR: RoutineActivity | null = null;
    const updated = routines.map((r) => {
      if (r.id === id) {
        const nr = {
          ...r,
          lastDone: new Date().toISOString().split('T')[0]
        };
        updatedR = nr;
        return nr;
      }
      return r;
    });
    saveState('ctrlpet_rout', updated, setRoutines);
    if (updatedR) {
      syncRoutineToSupabase(updatedR);
    }
  };

  const handleDeleteRoutine = (id: string) => {
    const updated = routines.filter((r) => r.id !== id);
    saveState('ctrlpet_rout', updated, setRoutines);
    deleteRoutineFromSupabase(id);
  };

  const handleProfilePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let input = e.target.value.replace(/\D/g, '');
    if (input.length > 11) {
      input = input.substring(0, 11);
    }
    
    let formatted = '';
    if (input.length > 0) {
      formatted = `(${input.substring(0, 2)}`;
    }
    if (input.length > 2) {
      formatted += `) ${input.substring(2, 7)}`;
    }
    if (input.length > 7) {
      formatted += `-${input.substring(7, 11)}`;
    }
    
    setProfilePhone(formatted);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileName.trim()) {
      alert('Por favor, indique seu nome completo.');
      return;
    }
    const stripped = profilePhone.replace(/\D/g, '');
    if (stripped.length < 10) {
      alert('Por favor, informe um WhatsApp válido com o DDD.');
      return;
    }

    // Save
    const updatedSession = {
      ...session,
      fullName: profileName,
      phone: profilePhone,
      allowWhatsApp: profileConsent,
      isLoggedIn: true
    };
    localStorage.setItem('ctrlpet_session', JSON.stringify(updatedSession));
    setSession(updatedSession as any);

    if (supabase) {
      supabase.auth.updateUser({
        data: {
          full_name: profileName,
          phone: profilePhone,
          allow_whatsapp: profileConsent,
        }
      }).catch(err => console.error('Erro ao atualizar metadados no Supabase:', err));
    }

    // Update inside registered database
    const registeredUsers = JSON.parse(localStorage.getItem('ctrlpet_registered_users') || '[]');
    const userIndex = registeredUsers.findIndex((u: any) => u.email.toLowerCase() === session?.email.toLowerCase());
    if (userIndex !== -1) {
      registeredUsers[userIndex] = {
        ...registeredUsers[userIndex],
        fullName: profileName,
        phone: profilePhone,
        allowWhatsApp: profileConsent
      };
      localStorage.setItem('ctrlpet_registered_users', JSON.stringify(registeredUsers));
    }

    setIsProfileModalOpen(false);
  };

  // 8. Guarda Compartilhada simulation & real Supabase integration
  const handleAddCoOwner = async (e: React.FormEvent) => {
    e.preventDefault();
    const emailToInvite = coOwnerEmail.toLowerCase().trim();
    if (!emailToInvite) return;

    const currentPet = pets.find((p) => p.id === selectedPetId);
    const petName = currentPet ? currentPet.name : 'seu Pet';

    // Update local simulation list
    if (!linkedUsers.includes(emailToInvite)) {
      const updated = [...linkedUsers, emailToInvite];
      setLinkedUsers(updated);
      if (session?.email) {
        localStorage.setItem(`ctrlpet_linked_users_${session.email.toLowerCase()}`, JSON.stringify(updated));
      }
    }

    // Save to real Supabase database if configured
    if (supabase && selectedPetId) {
      try {
        setSyncStatus('syncing');
        const { error } = await supabase
          .from('GuardaCompartilhada')
          .upsert({
            pet_id: selectedPetId,
            co_owner_email: emailToInvite
          });

        if (error) {
          if (error.code === '42P01' || error.message?.includes('GuardaCompartilhada') || error.message?.includes('schema cache')) {
            setIsGuardaTableMissing(true);
            console.warn('Aviso: Tabela GuardaCompartilhada ausente no Supabase.');
            setToastNotification('Vínculo local criado! Tabela do Supabase ausente (veja instruções no painel).');
          } else {
            console.error('Erro ao salvar vínculo no Supabase:', error.message);
            setToastNotification('Vínculo local criado. Banco de dados offline ou tabela não configurada.');
          }
        } else {
          setToastNotification('Vínculo registrado com sucesso na nuvem!');
          setIsGuardaTableMissing(false);
          // Refresh database co-owners list
          fetchCoOwners(selectedPetId);
        }
      } catch (err) {
        console.error('Erro ao conectar ao Supabase para salvar guarda:', err);
      } finally {
        setSyncStatus('synced');
      }
    }

    // Generate beautiful invitation URL
    const link = `${window.location.origin}${window.location.pathname}?invite=${selectedPetId || ''}&by=${encodeURIComponent(session?.email || '')}&petName=${encodeURIComponent(petName)}`;
    setGeneratedInviteLink(link);
    setLastInvitedEmail(emailToInvite);
    setIsInviteModalOpen(true);
    setCoOwnerEmail('');
  };

  // 9. Transparent clean-slate account deletion
  const handleAccountWipe = () => {
    // Reset and open password confirmation modal
    setDeletePassword('');
    setDeleteError('');
    setIsDeleteModalOpen(true);
  };

  const handleConfirmAccountDelete = (e: React.FormEvent) => {
    e.preventDefault();
    setDeleteError('');

    const registeredUsers = JSON.parse(localStorage.getItem('ctrlpet_registered_users') || '[]');
    const currentUserObj = registeredUsers.find((u: any) => u.email.toLowerCase() === session?.email?.toLowerCase());
    
    // Find expected password
    const correctPassword = currentUserObj ? currentUserObj.password : '';

    if (!deletePassword) {
      setDeleteError('Por favor, informe a sua senha para autorizar.');
      return;
    }

    if (deletePassword !== correctPassword) {
      setDeleteError('Senha incorreta. Verifique os dados digitados.');
      return;
    }

    // Explicit native confirmation for extra safety (LGPD compliance warning)
    if (confirm('Aviso Crítico de Autoprivacidade: Ao confirmar, todos os registros de pets, vacinas aplicadas, agendamentos e seu perfil serão totalmente apagados do navegador. Confirmar exclusão permanente?')) {
      localStorage.clear();
      setSession(null);
      setPets([]);
      setSelectedPetId('');
      setMeasurements([]);
      setMedications([]);
      setVaccines([]);
      setClinicalLogs([]);
      setReproductiveCycles([]);
      setRoutines([]);
      setIsDeleteModalOpen(false);
    }
  };

  const selectedPet = pets.find((p) => p.id === selectedPetId) || null;

  // Calculate pet exact age in years and months
  const getPetAgeLabel = (birth?: string, adoption?: string) => {
    if (!birth) {
      if (adoption) {
        const b = new Date(adoption);
        const now = new Date();
        let years = now.getFullYear() - b.getFullYear();
        let months = now.getMonth() - b.getMonth();
        if (months < 0) {
          years--;
          months += 12;
        }
        if (years === 0) return `Adotado há ${months}m`;
        return `Adotado há ${years}a e ${months}m`;
      }
      return 'Idade não informada';
    }
    const b = new Date(birth);
    const now = new Date();
    let years = now.getFullYear() - b.getFullYear();
    let months = now.getMonth() - b.getMonth();
    if (months < 0) {
      years--;
      months += 12;
    }
    if (years === 0) return `${months} m`;
    return `${years}a e ${months}m`;
  };

  // Check login validation
  if (!session) {
    return (
      <Onboarding
        onComplete={() => {
          const stored = localStorage.getItem('ctrlpet_session');
          if (stored) {
            const parsed = JSON.parse(stored);
            setSession(parsed);
            setProfileName(parsed.fullName || '');
            setProfilePhone(parsed.phone || '');
            setProfileConsent(parsed.allowWhatsApp ?? true);

            // Ao cadastrar ou logar um novo usuário, limpamos dados demo/anteriores locais
            // para garantir uma página em branco e pronta para o cliente preencher.
            setPets([]);
            setVaccines([]);
            setMeasurements([]);
            setMedications([]);
            setClinicalLogs([]);
            setReproductiveCycles([]);
            setRoutines([]);

            localStorage.setItem('ctrlpet_pets', '[]');
            localStorage.setItem('ctrlpet_vac', '[]');
            localStorage.setItem('ctrlpet_meas', '[]');
            localStorage.setItem('ctrlpet_meds', '[]');
            localStorage.setItem('ctrlpet_logs', '[]');
            localStorage.setItem('ctrlpet_repro', '[]');
            localStorage.setItem('ctrlpet_rout', '[]');

            // Carrega os dados reais deste usuário a partir do Supabase e processa convites pendentes
            checkAndApplyInvite(parsed);
          }
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 flex flex-col md:flex-row text-slate-800 dark:text-slate-100 font-sans transition-colors duration-250">
      
      {/* Backdrop for mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 md:hidden no-print" 
          onClick={() => setIsSidebarOpen(false)} 
        />
      )}

      {/* 🧭 Left Sidebar (Fidelity Theme Layout) */}
      <aside 
        className={`fixed md:static inset-y-0 left-0 z-50 w-72 bg-slate-900 text-slate-300 flex flex-col flex-shrink-0 border-r border-slate-950 transition-transform duration-300 ease-in-out no-print ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`} 
        id="navigation-bar"
      >
        {/* Sidebar Header with exact high-fidelity brand icon representation */}
        <div className="p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-gradient-to-br from-[#4040F2] to-[#2B2BC4] rounded-lg shadow-sm flex flex-col items-center justify-center text-white border border-[#5252FF]/20 flex-shrink-0">
              <div className="font-extrabold text-[11px] tracking-tighter leading-none select-none font-sans flex items-center gap-0.5 pt-0.5">
                CTRL
                <span className="text-[9px] leading-none">🐾</span>
              </div>
              <div className="font-bold text-[8px] tracking-wide leading-none select-none mt-0.5 opacity-90">
                + Pet
              </div>
            </div>
            <div>
              <h1 className="text-base font-extrabold tracking-tight text-white flex items-center gap-0.5 font-display leading-none">
                Ctrl<span className="text-[#5B59F5] font-extrabold">+</span>Pet
              </h1>
              <p className="text-[9px] uppercase tracking-wider text-slate-500 font-bold font-mono mt-1 leading-none">
                Vacinação e cuidados na palma da mão.
              </p>
            </div>
          </div>
          
          {/* Close Menu Button on Mobile */}
          <button
            type="button"
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg md:hidden cursor-pointer"
            onClick={() => setIsSidebarOpen(false)}
            aria-label="Fechar menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex-1 p-4 space-y-6 overflow-y-auto">
          {/* Main Navigation Modules Switcher */}
          <div className="space-y-1.5" id="nav-category-menu">
            <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold px-3 mb-1">
              Menu Principal
            </div>
            <button
              onClick={() => {
                setCurrentTab('dashboard');
                setIsSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer text-left ${
                currentTab === 'dashboard'
                  ? 'bg-slate-800 text-white border-l-4 border-indigo-505'
                  : 'hover:bg-slate-800/40 text-slate-400 hover:text-slate-200'
              }`}
            >
              <PawPrint className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>Painel do Pet (Prontuário)</span>
            </button>
            <button
              onClick={() => {
                setCurrentTab('nearby');
                setIsSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer text-left ${
                currentTab === 'nearby'
                  ? 'bg-slate-800 text-white border-l-4 border-indigo-505'
                  : 'hover:bg-slate-800/40 text-slate-400 hover:text-slate-200'
              }`}
            >
              <MapIcon className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>Clínicas & Pet Shops (Mapa)</span>
            </button>
          </div>

          {/* Active Pet Selector: Matches the visual hierarchy of the Geometric theme side block */}
          <div className="space-y-2">
            <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold px-3 mb-2 flex items-center justify-between">
              <span>Seus Animais</span>
              <span className="font-mono text-[9px] px-1.5 py-0.5 bg-slate-800 rounded">{pets.length}</span>
            </div>
            
            {pets.length === 0 ? (
              <p className="text-[11px] px-3 text-slate-500 italic">Nenhum pet cadastrado.</p>
            ) : (
              <div className="space-y-1" id="pet-switcher-buttons-list">
                {pets.map((p) => {
                  const isActive = p.id === selectedPetId;
                  return (
                    <div
                      key={p.id}
                      onClick={() => {
                        setSelectedPetId(p.id);
                        setIsSidebarOpen(false);
                      }}
                      className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                        isActive
                          ? 'bg-slate-800 text-white border-l-4 border-indigo-500'
                          : 'hover:bg-slate-800/50 text-slate-400 hover:text-slate-350'
                      }`}
                    >
                      <div className="flex items-center gap-3 font-medium text-xs">
                        <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center font-bold text-xs text-white border border-slate-600 overflow-hidden">
                          {p.species === 'dog' ? '🐶' : p.species === 'cat' ? '🐱' : '🐾'}
                        </div>
                        <span className="truncate max-w-[120px]">{p.name}</span>
                      </div>
                      <span className="text-[9px] font-mono opacity-50 uppercase">{p.breed ? p.breed.substring(0, 8) : 'SRD'}</span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Add Pet Inside Sidebar */}
            <button
              id="btn-open-add-pet-modal"
              onClick={() => {
                setEditingPet(null);
                setIsPetModalOpen(true);
                setIsSidebarOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 text-indigo-400 hover:text-indigo-300 hover:bg-slate-800/40 rounded-lg text-xs font-semibold cursor-pointer transition-colors mt-2"
            >
              <Plus className="w-4 h-4" /> Adicionar Pet
            </button>
          </div>

          {/* Dados do Tutor / Perfil (New screen-to-dashboard connection requirement) */}
          <div className="space-y-2 pt-4 border-t border-slate-800">
            <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold px-3 flex items-center justify-between">
              <span>Seus Dados (Perfil)</span>
              <button
                onClick={() => {
                  setProfileName(session?.fullName || '');
                  setProfilePhone(session?.phone || '');
                  setProfileConsent(session?.allowWhatsApp ?? true);
                  setIsProfileModalOpen(true);
                }}
                className="text-[10px] text-indigo-400 hover:text-indigo-300 font-bold underline cursor-pointer"
              >
                Editar
              </button>
            </div>
            <div className="mx-3 p-3 bg-slate-800/80 rounded-xl border border-slate-750 space-y-2">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-indigo-600/30 border border-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs select-none">
                  👤
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-slate-200 truncate leading-tight">
                    {session?.fullName || 'Tutor Autônomo'}
                  </p>
                  <p className="text-[10px] text-slate-450 truncate whitespace-nowrap leading-none mt-1">
                    {session?.email}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between pt-1.5 border-t border-slate-750 text-[10px]">
                <span className="text-slate-400 flex items-center gap-1 font-mono">
                  <span className="text-green-500">💬</span> {session?.phone || '(S/ Número)'}
                </span>
                <span className={`px-1.5 py-0.5 rounded-sm leading-none font-bold font-mono text-[9px] uppercase ${
                  session?.allowWhatsApp ? 'bg-emerald-950 text-emerald-400 border border-emerald-900/60' : 'bg-rose-950 text-rose-400 border border-rose-900/60'
                }`}>
                  {session?.allowWhatsApp ? 'Alertas Ativos' : 'Sem Alerta'}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Options Block */}
          <div className="space-y-1.5 pt-4 border-t border-slate-800">
            <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold px-3 mb-1">
              Preferências
            </div>
            <div className="flex items-center justify-between px-3">
              <span className="text-xs text-slate-400">Modo de Cor</span>
              <button
                id="btn-toggle-dark-mode"
                onClick={handleToggleTheme}
                className="p-1 px-2.5 bg-slate-850 hover:bg-slate-800 text-slate-300 hover:text-white rounded border border-slate-750 text-xs transition-all cursor-pointer flex items-center gap-1.5"
                title="Alternar tema"
              >
                {isDarkMode ? <Sun className="w-3 h-3" /> : <Moon className="w-3 h-3" />}
                <span className="text-[9px] font-mono">{isDarkMode ? 'Claro' : 'Escuro'}</span>
              </button>
            </div>
            <div className="flex items-center justify-between px-3 pt-2">
              <span className="text-xs text-slate-400">Sair da Carteira</span>
              <button
                id="btn-logout"
                onClick={() => {
                  localStorage.removeItem('ctrlpet_session');
                  setSession(null);
                  if (supabase) {
                    supabase.auth.signOut().catch(err => console.error('Erro ao deslogar do Supabase:', err));
                  }
                  
                  // Limpar dados locais ao deslogar para evitar vazamento ou telas vazias
                  setPets([]);
                  setVaccines([]);
                  setMeasurements([]);
                  setMedications([]);
                  setClinicalLogs([]);
                  setReproductiveCycles([]);
                  setRoutines([]);
                  setSelectedPetId('');

                  localStorage.removeItem('ctrlpet_pets');
                  localStorage.removeItem('ctrlpet_vac');
                  localStorage.removeItem('ctrlpet_meas');
                  localStorage.removeItem('ctrlpet_meds');
                  localStorage.removeItem('ctrlpet_logs');
                  localStorage.removeItem('ctrlpet_repro');
                  localStorage.removeItem('ctrlpet_rout');
                }}
                className="p-1 px-2 hover:bg-slate-800 text-rose-400 hover:text-rose-300 rounded border border-transparent text-xs transition-colors cursor-pointer flex items-center gap-1"
                title="Desconectar"
              >
                <LogOut className="w-3 h-3" />
                <span className="text-[9px] font-mono">Sair</span>
              </button>
            </div>
          </div>
        </nav>

        {/* Sidebar Footer Info */}
        <div className="p-4 border-t border-slate-800">
          <div className="bg-slate-850 p-3 rounded-lg text-xs flex items-center justify-between font-mono">
            <span className="text-slate-500 text-[10px]">Local Sync</span>
            <span className="opacity-55 text-slate-400 text-[10px]">v1.4.2</span>
          </div>
        </div>
      </aside>

      {/* 💻 Main Panel (Geometric Canvas) */}
      <main className="flex-1 flex flex-col min-w-0" id="pet-switcher-banner">
        {/* Dynamic Theme Header Page Block */}
        <header className="h-20 bg-gradient-to-r from-[#0F172A] via-[#1E1B4B] to-[#0F172A] text-white border-b border-indigo-500/20 shadow-md flex-shrink-0 no-print">
          <div className="w-full max-w-[1400px] h-full px-4 sm:px-6 mx-auto flex items-center justify-between gap-4">
            {/* 1. Left Section: Hamburger & High-Fidelity App Logo */}
            <div className="flex items-center gap-3 min-w-0">
              {/* Hamburger Button on Mobile */}
              <button
                type="button"
                className="p-1.5 text-indigo-200 hover:text-white hover:bg-white/5 rounded-lg md:hidden cursor-pointer flex items-center justify-center transition-all duration-200 flex-shrink-0"
                onClick={() => setIsSidebarOpen(true)}
                aria-label="Abrir menu"
              >
                <Menu className="w-5 h-5 text-white" />
              </button>

              {/* Title & Slogan: Clean, modern, high-contrast and spacious layout */}
              <div className="flex flex-col justify-center min-w-0">
                <h1 className="text-sm md:text-base font-black tracking-tight text-white flex items-center gap-1.5 leading-none font-sans">
                  <span>🐾</span>Ctrl<span className="text-[#8B8AFF] font-black">+</span>Pet
                </h1>
              </div>
            </div>

            {/* 2. Right Section: Tutor Identity and Call to Action */}
            <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
              {/* User Identity Banner: Elegant and spacious */}
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-full border border-white/10 transition-colors">
                <div className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-300 flex items-center justify-center font-bold text-[10px] font-sans">
                  👤
                </div>
                <div className="text-left">
                  <p className="text-[11px] font-bold text-white leading-none">
                    {session?.fullName || 'Tutor'}
                  </p>
                  <p className="text-[9px] text-indigo-200/70 leading-none mt-0.5">
                    {selectedPet ? `Visualizando ${selectedPet.name}` : 'Sem Pet'}
                  </p>
                </div>
              </div>

              {/* Active pet simplified badge for mobile view to preserve space */}
              {selectedPet && (
                <div className="sm:hidden flex items-center justify-center bg-indigo-500/20 border border-indigo-400/30 text-[10px] text-indigo-100 font-extrabold px-2 py-1 rounded-full whitespace-nowrap">
                  🐾 {selectedPet.name}
                </div>
              )}

              <button
                onClick={() => {
                  setEditingPet(null);
                  setIsPetModalOpen(true);
                }}
                className="h-8 px-3 bg-gradient-to-r from-[#4040F2] to-[#2B2BC4] hover:from-[#5252FF] hover:to-[#3737E1] text-white rounded-full text-[11px] font-extrabold flex items-center justify-center gap-1 shadow-[0_2px_8px_rgba(64,64,242,0.25)] hover:shadow-[0_4px_12px_rgba(64,64,242,0.45)] transition-all duration-300 cursor-pointer border border-[#5252FF]/20"
                title="Cadastrar Pet"
              >
                <Plus className="w-3 h-3 stroke-[3.5]" />
                <span className="hidden xs:inline">Cadastrar Pet</span>
                <span className="xs:hidden">Pet</span>
              </button>
            </div>
          </div>
        </header>

        {/* Outer background view wrapper */}
        <div className="flex-1 overflow-y-auto content-start bg-[#F8FAFC] dark:bg-slate-950">
          
          {currentTab === 'nearby' ? (
            <div className="p-6 md:p-8">
              <NearbyFinder />
            </div>
          ) : (
            <div className="w-full max-w-[1400px] p-6 mx-auto space-y-8">
              {/* Google AdMob Adaptive Banner Placement */}
              <AdaptiveBanner config={mediationConfig} />

              {/* Selected Pet Bio & Information Block: Styled with geometric precision */}
          {selectedPet ? (
            <div className="bg-white dark:bg-slate-900 p-6 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 hover:border-indigo-200 dark:hover:border-indigo-950/60 transition-all no-print">
              <div className="flex flex-col md:flex-row items-center gap-5 leading-relaxed">
                {selectedPet.photo ? (
                  <img
                    src={selectedPet.photo}
                    alt={selectedPet.name}
                    className="w-16 h-16 rounded-full object-cover border-2 border-indigo-500 shadow-sm"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 font-display font-black text-xl flex items-center justify-center border border-indigo-150">
                    {selectedPet.name.substring(0, 2).toUpperCase()}
                  </div>
                )}
                
                <div className="text-center md:text-left space-y-1">
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                    <h3 className="text-xl font-bold font-display text-slate-900 dark:text-white leading-none">
                      {selectedPet.name}
                    </h3>
                    <span className="text-[10px] font-mono tracking-wider font-bold bg-slate-100 dark:bg-slate-805 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded border border-slate-200/60 dark:border-slate-750">
                      🎂 {getPetAgeLabel(selectedPet.birthDate, selectedPet.adoptionDate)}
                    </span>
                    <span className={`text-xs font-bold font-mono px-1.5 rounded ${selectedPet.gender === 'female' ? 'text-rose-500 bg-rose-50 dark:bg-rose-950/20' : 'text-indigo-500 bg-indigo-105 dark:bg-indigo-950/20'}`}>
                      {selectedPet.gender === 'female' ? 'Fêmea ♀' : 'Macho ♂'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Espécie: <strong className="text-slate-700 dark:text-slate-300 uppercase">{selectedPet.species === 'dog' ? 'Cão' : selectedPet.species === 'cat' ? 'Gato' : 'Pet'}</strong>
                    {selectedPet.breed && <span> | Raça: <strong>{selectedPet.breed}</strong></span>}
                    {selectedPet.birthDate ? (
                      <span> | Nascido em: <strong>{new Date(selectedPet.birthDate).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</strong></span>
                    ) : selectedPet.adoptionDate ? (
                      <span> | Adotado em: <strong>{new Date(selectedPet.adoptionDate).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</strong></span>
                    ) : (
                      <span> | Idade estimada na adoção: <strong>Não informada</strong></span>
                    )}
                  </p>

                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] font-mono text-slate-400">
                    {selectedPet.microchip && <span>🛰️ Microchip: {selectedPet.microchip}</span>}
                    {selectedPet.rga && <span>🛡️ Registro RGA: {selectedPet.rga}</span>}
                    {selectedPet.adoptionDate && selectedPet.birthDate && (
                      <span className="text-indigo-600 dark:text-indigo-400">🗓️ Adotado em: {new Date(selectedPet.adoptionDate).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons to adjust selected physical profile */}
              <div className="flex gap-2 shrink-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800 pt-4 md:pt-0 w-full md:w-auto justify-center md:justify-end">
                <button
                  id="btn-edit-pet"
                  onClick={() => {
                    setEditingPet(selectedPet);
                    setIsPetModalOpen(true);
                  }}
                  className="px-3 py-1.5 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-850 hover:border-indigo-400 dark:hover:border-indigo-950 transition-all font-bold text-xs rounded-lg cursor-pointer"
                >
                  Editar Bio
                </button>
                <button
                  id="btn-delete-pet"
                  onClick={() => {
                    triggerItemDelete('pet', selectedPet.id, selectedPet.name);
                  }}
                  className="px-3 py-1.5 border border-transparent text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/25 transition-all text-xs font-semibold rounded-lg cursor-pointer"
                >
                  Excluir Pet
                </button>
              </div>
            </div>
          ) : null}

          {/* Main Prontuário Grid System - Multi-column responsive layout */}
          {selectedPet ? (
            <div 
              className="w-full" 
              style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 480px), 1fr))', 
                gap: '24px' 
              }}
            >
              {/* Imunizations Vaccine module */}
              <VaccineModule
                vaccines={vaccines}
                selectedPetId={selectedPet.id}
                onAddVaccine={handleAddVaccine}
                onToggleVaccineStatus={handleToggleVaccineStatus}
                onDeleteVaccine={(id, name) => triggerItemDelete('vaccine', id, name)}
              />

              {/* Medications block */}
              <MedicationModule
                schedules={medications}
                selectedPetId={selectedPet.id}
                onAddSchedule={handleAddSchedule}
                onDeleteSchedule={(id) => {
                  const item = medications.find((m) => m.id === id);
                  triggerItemDelete(
                    'medication',
                    id,
                    item ? `Ciclo de ${item.name}` : 'Ciclo de Medicamento'
                  );
                }}
                onToggleDose={handleToggleDose}
              />

              {/* Measurements and tracking weight block */}
              <MeasurementModule
                measurements={measurements}
                selectedPetId={selectedPet.id}
                onAddMeasurement={handleAddMeasurement}
                onDeleteMeasurement={(id) => {
                  const item = measurements.find((m) => m.id === id);
                  triggerItemDelete(
                    'measurement',
                    id,
                    item
                      ? `Medição de ${item.weight} kg (${new Date(item.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })})`
                      : 'Medição'
                  );
                }}
              />

              {/* Reproduction statuses for females */}
              <ReproductiveModule
                reproCycles={reproductiveCycles}
                selectedPet={selectedPet}
                onAddReproCycle={handleAddReproCycle}
                onDeleteReproCycle={(id) => {
                  const item = reproductiveCycles.find((c) => c.id === id);
                  let eventName = 'Ciclo Reprodutivo';
                  if (item) {
                    if (item.event === 'cio') eventName = '🩸 Cio (Fervura)';
                    else if (item.event === 'insemination') eventName = '🧬 Inseminação Artificial';
                    else if (item.event === 'cross') eventName = '🐾 Cruza Coito Direto';
                  }
                  triggerItemDelete(
                    'repro',
                    id,
                    item ? `${eventName} do dia ${new Date(item.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}` : 'Ciclo Reprodutivo'
                  );
                }}
              />

              {/* Clinical Log timeline */}
              <ClinicalHistoryModule
                logs={clinicalLogs}
                selectedPetId={selectedPet.id}
                onAddLog={handleAddClinicalLog}
                onDeleteLog={(id) => {
                  const item = clinicalLogs.find((l) => l.id === id);
                  triggerItemDelete(
                    'clinicalLog',
                    id,
                    item ? `Registro Clínico: ${item.title}` : 'Registro Clínico'
                  );
                }}
              />

              {/* Routines module */}
              <RoutineModule
                routines={routines}
                selectedPetId={selectedPet.id}
                onAddRoutine={handleAddRoutine}
                onBumpRoutine={handleBumpRoutine}
                onDeleteRoutine={(id) => {
                  const item = routines.find((r) => r.id === id);
                  triggerItemDelete(
                    'routine',
                    id,
                    item ? `Atividade de Rotina: ${item.title}` : 'Atividade de Rotina'
                  );
                }}
              />

              {/* Quick report sharing outputs */}
              <ShareExportModule
                selectedPet={selectedPet}
                vaccines={vaccines}
                measurements={measurements}
                logs={clinicalLogs}
                medications={medications}
                reproCycles={reproductiveCycles}
                routines={routines}
                tutorName={session?.fullName}
                onTriggerInterstitial={handleTriggerInterstitial}
              />

              {/* Contextual Ad Slot: "Comprar Ração & Clube de Benefícios" card */}
              <ContextualAdSlot config={mediationConfig} />

              {/* Native Ad Card: Integrated into feed with identical styling metrics */}
              <NativeAdCard config={mediationConfig} />
            </div>
          ) : (
            <div className="p-16 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm text-slate-500 dark:text-slate-450 font-display">
              <PawPrint className="w-12 h-12 mx-auto mb-4 text-slate-300 dark:text-slate-700 animate-bounce" />
              <h3 className="text-xl font-bold font-display text-slate-850 dark:text-slate-200">Nenhum pet selecionado</h3>
              <p className="text-xs mt-1.5 max-w-sm mx-auto">
                Para começar a monitorar vacinas, tratamentos e pesos de forma livre e segura, utilize a barra do console para adicionar um pet.
              </p>
            </div>
          )}

          {/* 🛡️ Family Sync Shared & Privacy Scrub Control block */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm grid grid-cols-1 lg:grid-cols-3 gap-6 relative print:hidden" id="sharing-danger-controls">
            {/* Multi-editor sharing simulation */}
            <div className="space-y-4">
              <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider flex items-center gap-1.5">
                <Users className="w-4 h-4 text-indigo-500" /> Guarda Compartilhada (Multi-editora)
              </span>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal">
                O Ctrl+Pet permite que múltiplos tutores editem ou visualizem em tempo real a saúde de forma integrada, simulando chaves UUID e replicação persistente:
              </p>
              <form 
                onSubmit={handleAddCoOwner} 
                className="flex flex-wrap gap-[10px]"
                style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}
              >
                <input
                  id="coowner-email-input"
                  type="email"
                  required
                  value={coOwnerEmail}
                  onChange={(e) => setCoOwnerEmail(e.target.value)}
                  placeholder="tutor-co-autor@provedor.com"
                  className="flex-1 px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-lg dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-550 focus:border-indigo-550"
                  style={{ flex: '1', minWidth: '200px' }}
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg cursor-pointer transition-colors shrink-0"
                >
                  Convidar Tutor
                </button>
              </form>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {Array.from(new Set([...coOwners, ...linkedUsers])).map((user) => (
                  <span key={user} className="text-[10px] bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-850">
                    {user} (Guarda ativa)
                  </span>
                ))}
              </div>
            </div>

            {/* Cloud Sync & Backup Section */}
            <div className="space-y-4 border-t lg:border-t-0 lg:border-l border-slate-100 dark:border-slate-800 pt-4 lg:pt-0 pl-0 lg:pl-6 flex flex-col justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-450 tracking-wider flex items-center gap-1.5">
                  <Cloud className="w-4 h-4 text-emerald-500" /> Backup e Sincronização na Nuvem
                </span>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal mt-2">
                  Guarde com segurança todas as informações de vacinas, tratamentos e evolução de peso. Acesse de outros aparelhos de forma automática e integrada em tempo real.
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-[11px] text-slate-400 font-medium">Status do Backup:</span>
                  {supabase ? (
                    <span className="text-[10px] px-2 py-0.5 font-bold uppercase rounded-md bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      Sincronização Ativa
                    </span>
                  ) : (
                    <span className="text-[10px] px-2 py-0.5 font-bold uppercase rounded-md bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 border border-slate-250 dark:border-slate-850">
                      Armazenado no Aparelho
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* LGPD Scrub Controls */}
            <div className="space-y-4 border-t lg:border-t-0 lg:border-l border-slate-100 dark:border-slate-800 pt-4 lg:pt-0 pl-0 lg:pl-6 flex flex-col justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-rose-500 tracking-wider flex items-center gap-1.5">
                  <Trash2 className="w-4 h-4 text-rose-500" /> Autoprivacidade e Exclusão LGPD (Conformidade)
                </span>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal mt-2">
                  Em total conformidade com a LGPD e regras rígidas das lojas móveis. Seus dados moram no seu navegador. Delete tudo instantaneamente e de forma irrevogável sem intermediários clínicos.
                </p>
              </div>
              <button
                onClick={handleAccountWipe}
                className="w-full md:w-auto self-start mt-2 px-4 py-2 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20 text-rose-600 dark:text-rose-450 border border-rose-200 dark:border-rose-900/40 font-bold text-xs rounded-lg transition-all cursor-pointer"
              >
                ⚠️ Apagar Todos os Meus Dados do Navegador
              </button>
            </div>
          </div>

        </div>
      )}
    </div>

        {/* Dynamic Canvas Footer */}
        <footer className="h-14 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-8 flex flex-col md:flex-row items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 flex-shrink-0 no-print">
          <div className="flex gap-4">
            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span> Conexão Criptografada</span>
            <span>Sem monitoramento de CPF</span>
          </div>
          <div className="flex gap-4 mt-1 md:mt-0 font-bold">
            <a href="#" className="hover:text-indigo-600">Suporte</a>
            <span>|</span>
            <a href="#" className="hover:text-indigo-600">Política de Privacidade</a>
          </div>
        </footer>
      </main>

      {/* ⚡ Interstitial Ad & Document Pre-Processor Overlays */}
      {isInterstitialLoading && (
        <div className="fixed inset-0 z-[110] bg-slate-950/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-white text-center select-none no-print">
          <div className="w-16 h-16 relative">
            <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20 text-indigo-500"></div>
            <div className="absolute inset-0 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin"></div>
          </div>
          <p className="mt-6 text-sm font-black font-sans text-slate-100 flex items-center gap-1.5 justify-center">
            <span>⚙️</span> Otimizando Prontuário Médico Digital
          </p>
          <p className="text-xs text-indigo-200/70 max-w-sm mt-2 leading-relaxed">
            Processando histórico clínico, compilando biometria e estruturando laudo formatado A4 para exportação segura...
          </p>
        </div>
      )}

      {activeInterstitial && (
        <InterstitialAdSimulator
          adSource={activeInterstitial.adSource}
          onDismiss={activeInterstitial.onComplete}
        />
      )}

      {/* 🐕 Interactive Pop-up Modal Form */}
      {isPetModalOpen && (
        <PetModal
          onClose={() => setIsPetModalOpen(false)}
          onSave={handlePetSave}
          editingPet={editingPet}
        />
      )}

      {/* 👤 Profile Modal Editor */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-lg font-extrabold text-[#2B2BC4] dark:text-[#7a75ff] font-sans flex items-center gap-1.5">
                <span>👤 Seus Dados (Perfil)</span>
              </h3>
              <button
                onClick={() => setIsProfileModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              {/* Name */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-505 dark:text-slate-450 flex items-center gap-1">
                  <span>Nome do Tutor</span>
                  <span className="text-rose-500">*</span>
                </label>
                <input
                  id="modal-profile-name"
                  type="text"
                  required
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  placeholder="Seu nome completo"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:outline-none focus:border-indigo-500 dark:text-slate-100 font-medium"
                />
              </div>

              {/* Email (Read-only indication) */}
              <div className="space-y-1 opacity-70">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">E-mail de Cadastro</label>
                <input
                  type="email"
                  disabled
                  value={session?.email || ''}
                  className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-lg text-sm text-slate-500 cursor-not-allowed"
                />
              </div>

              {/* Phone with Mask */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-550 dark:text-slate-450 flex items-center gap-1.5 justify-between">
                  <span>WhatsApp de Alertas</span>
                  <span className="text-[10px] text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 px-1.5 py-0.5 rounded flex items-center gap-1 font-mono">
                    💬 Notificação
                  </span>
                </label>
                <input
                  id="modal-profile-phone"
                  type="tel"
                  required
                  value={profilePhone}
                  onChange={handleProfilePhoneChange}
                  placeholder="(11) 99999-9999"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:outline-none focus:border-indigo-500 dark:text-slate-100 font-mono font-bold"
                />
              </div>

              {/* Verification checkbox */}
              <label className="flex items-start gap-3 bg-indigo-50/40 dark:bg-indigo-950/10 p-3 rounded-lg border border-indigo-100 dark:border-indigo-900/30 cursor-pointer">
                <input
                  id="modal-profile-consent"
                  type="checkbox"
                  checked={profileConsent}
                  onChange={(e) => setProfileConsent(e.target.checked)}
                  className="w-4.5 h-4.5 rounded text-[#2B2BC4] border-slate-300 mt-0.5"
                />
                <span className="text-[11px] text-slate-600 dark:text-slate-450 leading-normal">
                  Desejo manter as notificações ativadas de revacinação e cuidados via WhatsApp de acordo com privacidade LGPD.
                </span>
              </label>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsProfileModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-lg transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#2B2BC4] hover:bg-[#1E1EB0] text-white font-bold text-xs rounded-lg transition-colors cursor-pointer"
                >
                  Salvar Perfil
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 🤝 Co-Owner Share Invitation Link Modal */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-xl space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-lg font-extrabold text-[#2B2BC4] dark:text-[#7a75ff] font-sans flex items-center gap-1.5">
                <span>🤝 Convite de Guarda Compartilhada</span>
              </h3>
              <button
                onClick={() => {
                  setIsInviteModalOpen(false);
                  setCopiedLink(false);
                }}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Você adicionou <strong className="text-slate-800 dark:text-slate-200">{lastInvitedEmail}</strong> como tutor co-proprietário.
                Envie o convite abaixo para que ele possa acessar, visualizar e atualizar as informações do pet em tempo real!
              </p>

              {/* Link Display Box */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Link Único de Compartilhamento</label>
                <div className="flex gap-2 bg-slate-50 dark:bg-slate-950 p-2 rounded-lg border border-slate-200 dark:border-slate-850">
                  <input
                    type="text"
                    readOnly
                    onFocus={(e) => e.target.select()}
                    value={generatedInviteLink}
                    className="flex-1 bg-transparent border-none text-xs text-slate-600 dark:text-slate-400 focus:outline-none overflow-x-auto select-all font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(generatedInviteLink);
                      setCopiedLink(true);
                      setTimeout(() => setCopiedLink(false), 2000);
                    }}
                    className="p-1.5 bg-[#2B2BC4] hover:bg-[#1E1EB0] text-white rounded-lg transition-colors cursor-pointer shrink-0"
                    title="Copiar Link"
                  >
                    {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    const text = `Olá! Convido você para compartilhar a guarda do(a) ${pets.find(p => p.id === selectedPetId)?.name || 'meu pet'} no Ctrl+Pet para acompanharmos vacinas e histórico clínico juntos. Faça seu login ou cadastro para acessar: ${generatedInviteLink}`;
                    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
                  }}
                  className="w-full py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  Compartilhar via WhatsApp 💬
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const petName = pets.find(p => p.id === selectedPetId)?.name || 'Pet';
                    const subject = `Convite de Guarda Compartilhada: ${petName}`;
                    const body = `Olá! Convido você para compartilhar a guarda do(a) ${petName} no Ctrl+Pet para acompanharmos vacinas e histórico clínico juntos.\n\nAcesse o link abaixo para visualizar e editar os dados em tempo real:\n${generatedInviteLink}`;
                    window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_blank');
                  }}
                  className="w-full py-2 bg-slate-100 hover:bg-slate-250 dark:bg-slate-850 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Mail className="w-4 h-4" /> Compartilhar via E-mail
                </button>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setIsInviteModalOpen(false);
                  setCopiedLink(false);
                }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-lg transition-colors cursor-pointer"
              >
                Concluído
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ⚠️ Account Permanent Deletion Password Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-xl space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 flex items-center gap-1.5 font-sans">
                <span>⚠️ Confirmar Exclusão de Conta</span>
              </h3>
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmAccountDelete} className="space-y-4">
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
                Esta ação é definitiva e está em conformidade com as diretrizes de privacidade da LGPD. Todos os dados pessoais, informações sobre os seus pets e histórico completo de vacinas serão permanentemente revogados deste navegador.
              </p>

              {/* Password Request Input */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-405 block pb-0.5">
                  Digite sua Senha para Confirmar Exclusão:
                </label>
                <input
                  id="modal-delete-password"
                  type="password"
                  required
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:outline-none focus:border-rose-500 dark:text-slate-100 font-bold"
                />
              </div>

              {deleteError && (
                <p className="text-xs text-rose-600 dark:text-rose-400 font-semibold bg-rose-50 dark:bg-rose-950/20 p-2.5 rounded-lg border border-rose-150 dark:border-rose-900/40 animate-pulse">
                  {deleteError}
                </p>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-lg transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-750 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer"
                >
                  Excluir de Forma Permanente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 🔐 Secure Item Deletion (Pet or Vaccine) Modal */}
      {secureDeleteTarget && (
        <div className="fixed inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-xl space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 flex items-center gap-1.5 font-sans">
                <span>⚠️ Confirmar Exclusão</span>
              </h3>
              <button
                onClick={() => setSecureDeleteTarget(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmSecureDelete} className="space-y-4">
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
                Você solicitou a exclusão permanente de: <strong className="text-slate-900 dark:text-white font-bold">{secureDeleteTarget.name}</strong> ({secureDeleteTarget.type === 'pet' ? 'Pet' : 'Registro de Vacina'}).
                Esta operação removerá permanentemente os registros e não poderá ser desfeita.
              </p>

              {/* Password Request Input */}
              <div className="space-y-1">
                <label htmlFor="secure-delete-pwd" className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 block pb-0.5">
                  Digite sua Senha para Autorizar:
                </label>
                <input
                  id="secure-delete-pwd"
                  type="password"
                  required
                  value={secureDeletePassword}
                  onChange={(e) => setSecureDeletePassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:outline-none focus:border-rose-500 dark:text-slate-100 font-bold"
                  autoFocus
                />
              </div>

              {secureDeleteError && (
                <p className="text-xs text-rose-600 dark:text-rose-400 font-semibold bg-rose-50 dark:bg-rose-950/20 p-2.5 rounded-lg border border-rose-150 dark:border-rose-900/40 animate-pulse">
                  {secureDeleteError}
                </p>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setSecureDeleteTarget(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-lg transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer"
                >
                  Confirmar Exclusão
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 🔔 Floating Success Toast Notification */}
      {toastNotification && (
        <div className="fixed top-5 right-5 z-[100] bg-emerald-600 text-white shadow-2xl border border-emerald-500 rounded-xl px-5 py-3 flex items-center gap-3 animate-in slide-in-from-top-10 fade-in duration-300">
          <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-xs">
            ✓
          </div>
          <div>
            <p className="text-xs font-bold font-sans">{toastNotification}</p>
          </div>
          <button 
            type="button"
            onClick={() => setToastNotification(null)}
            className="text-white hover:text-emerald-200 font-bold cursor-pointer text-xs ml-2"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
