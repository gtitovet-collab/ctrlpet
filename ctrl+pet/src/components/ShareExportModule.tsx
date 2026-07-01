import React from 'react';
import { createPortal } from 'react-dom';
import { Pet, Vaccine, Measurement, ClinicalLog, MedicationSchedule, ReproCycle, RoutineActivity } from '../types';
import { Share2, FileText, Printer, Check, Copy, X, ExternalLink } from 'lucide-react';

interface ShareExportModuleProps {
  selectedPet: Pet | null;
  vaccines: Vaccine[];
  measurements: Measurement[];
  logs: ClinicalLog[];
  medications?: MedicationSchedule[];
  reproCycles?: ReproCycle[];
  routines?: RoutineActivity[];
  tutorName?: string;
  onTriggerInterstitial?: (actionName: string, onComplete: () => void) => void;
}

export default function ShareExportModule({
  selectedPet,
  vaccines,
  measurements,
  logs,
  medications = [],
  reproCycles = [],
  routines = [],
  tutorName = 'Tutor Autônomo',
  onTriggerInterstitial,
}: ShareExportModuleProps) {
  const [copied, setCopied] = React.useState(false);
  const [showDossierModal, setShowDossierModal] = React.useState(false);

  const triggerActionWithAd = (actionName: string, originalAction: () => void) => {
    if (onTriggerInterstitial) {
      onTriggerInterstitial(actionName, originalAction);
    } else {
      originalAction();
    }
  };

  if (!selectedPet) return null;

  const petVaccines = vaccines.filter((v) => v.petId === selectedPet.id);
  const petMeas = measurements
    .filter((m) => m.petId === selectedPet.id)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const petLogs = logs.filter((l) => l.petId === selectedPet.id);
  const petMedications = medications.filter((m) => m.petId === selectedPet.id);
  const petReproCycles = reproCycles.filter((c) => c.petId === selectedPet.id);
  const petRoutines = routines.filter((r) => r.petId === selectedPet.id);

  // Helper to calculate age with extreme precision
  const calculateAgeRange = (birthDateStr?: string) => {
    if (!birthDateStr) return 'Não informada';
    const birthDate = new Date(birthDateStr);
    const today = new Date();
    let ageYears = today.getFullYear() - birthDate.getFullYear();
    let ageMonths = today.getMonth() - birthDate.getMonth();
    
    if (ageMonths < 0 || (ageMonths === 0 && today.getDate() < birthDate.getDate())) {
      ageYears--;
      ageMonths += 12;
    }
    
    const yearsPart = ageYears > 0 ? `${ageYears} ${ageYears === 1 ? 'ano' : 'anos'}` : '';
    const monthsPart = ageMonths > 0 ? `${ageMonths} ${ageMonths === 1 ? 'mês' : 'meses'}` : '';
    
    if (yearsPart && monthsPart) {
      return `${yearsPart} e ${monthsPart}`;
    }
    return yearsPart || monthsPart || 'Recém-nascido';
  };

  // Generate beautiful WhatsApp summary transcription
  const getWhatsAppMessage = () => {
    const appliedVaccines = petVaccines.filter((v) => v.status === 'applied');
    const pendingVaccines = petVaccines.filter((v) => v.status === 'pending');
    const latestWeight = petMeas[petMeas.length - 1]?.weight;

    let text = `🐾 *Histórico de Saúde do Pet: ${selectedPet.name}* 🐾\n`;
    text += `• Espécie/Raça: ${selectedPet.species === 'dog' ? '🐶 Cão' : selectedPet.species === 'cat' ? '🐱 Gato' : '🐾 Outro'} (${selectedPet.breed || 'SRD'})\n`;
    text += `• Nascimento: ${selectedPet.birthDate ? new Date(selectedPet.birthDate).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : 'Não informado'}\n`;
    if (selectedPet.microchip) text += `• Microchip ID: ${selectedPet.microchip}\n`;
    if (selectedPet.rga) text += `• RGA: ${selectedPet.rga}\n`;
    if (latestWeight) text += `• Peso Atual: ${latestWeight.toFixed(2)} kg\n\n`;

    text += `*💉 VACINAS APLICADAS:* ${appliedVaccines.length > 0 ? '' : 'Nenhuma'}\n`;
    appliedVaccines.forEach((v) => {
      text += `- ${v.name} (${v.appliedDate ? new Date(v.appliedDate).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : '—'})\n`;
    });

    if (pendingVaccines.length > 0) {
      text += `\n*⌛ PRÓXIMAS DOSES / REFORÇO:*\n`;
      pendingVaccines.forEach((v) => {
        text += `- ${v.name} (Reforço em: ${new Date(v.boosterDate).toLocaleDateString('pt-BR', { timeZone: 'UTC' })})\n`;
      });
    }

    if (petLogs.length > 0) {
      text += `\n*🩺 HISTÓRICO CLÍNICO RECENTE:*\n`;
      petLogs.slice(0, 3).forEach((l) => {
        text += `- [${l.type.toUpperCase()}] ${l.title} (${new Date(l.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })})\n`;
      });
    }

    text += `\n_Enviado de forma autônoma via app Ctrl+Pet — Carteira Digital Livre._`;
    return encodeURIComponent(text);
  };

  const handleCopyText = () => {
    const rawText = decodeURIComponent(getWhatsAppMessage());
    navigator.clipboard.writeText(rawText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    try {
      window.print();
    } catch (e) {
      console.warn('Silent print bypass in sandboxed window context:', e);
    }
  };

  const handleOpenPreview = () => {
    setShowDossierModal(true);
    // Fires standard print call, catching sandbox blocks inside DevTools frames
    setTimeout(() => {
      try {
        window.print();
      } catch (e) {
        console.warn('Local print bypass:', e);
      }
    }, 450);
  };

  // Shared pure document layouter to support identical rendering for A4 print stylesheet and on-screen modal preview
  const renderDossierContent = () => {
    return (
      <div className="space-y-8 text-left text-slate-900 bg-white leading-relaxed">
        {/* Professional Header of the clinical summary */}
        <div className="border-b-4 border-indigo-600 pb-4 flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🐾</span>
              <h1 className="text-2xl font-extrabold tracking-tight text-indigo-900 uppercase font-sans">
                Ctrl + Pet • Prontuário Médico Digital
              </h1>
            </div>
            <p className="text-[10px] tracking-wider text-slate-500 font-semibold uppercase">
              FICHA CLÍNICA VETERINÁRIA COMPLETA DE IDENTIFICAÇÃO E HISTÓRICO EMITIDA EM {new Date().toLocaleDateString('pt-BR')}
            </p>
          </div>
          <div className="text-right border-l-2 border-slate-300 pl-4">
            <span className="text-[11px] font-bold text-slate-700 block">Status Corporal</span>
            <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full inline-block mt-1">
              Saúde Monitorada
            </span>
          </div>
        </div>

        {/* 1. SECCIÓN: IDENTIFICAÇÃO GERAL */}
        <div className="print-section bg-slate-50 rounded-xl p-5 border border-slate-200">
          <h2 className="text-sm font-extrabold uppercase text-indigo-900 border-b border-indigo-200 pb-1.5 mb-3 flex items-center gap-1">
            📋 Identificação Geral e Dados Cadastrais
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-3 gap-x-4 text-xs">
            <div>
              <span className="text-[10px] text-slate-400 block font-bold uppercase">Nome do Pet</span>
              <span className="font-extrabold text-slate-900 text-sm">{selectedPet.name}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-bold uppercase">Espécie</span>
              <span className="font-bold text-slate-700">{selectedPet.species === 'dog' ? 'Cão (🐶)' : selectedPet.species === 'cat' ? 'Gato (🐱)' : 'Outro'}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-bold uppercase">Raça</span>
              <span className="font-bold text-slate-700">{selectedPet.breed || 'SRD'}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-bold uppercase">Gênero</span>
              <span className="font-bold text-slate-700">{selectedPet.gender === 'female' ? 'Fêmea (♀️)' : 'Macho (♂️)'}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-bold uppercase">Data de Nascimento</span>
              <span className="font-bold text-slate-700">
                {selectedPet.birthDate ? new Date(selectedPet.birthDate).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : 'Não informado'}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-bold uppercase">Idade Calculada</span>
              <span className="font-bold text-slate-900">{calculateAgeRange(selectedPet.birthDate)}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-bold uppercase">Código Microchip</span>
              <span className="font-mono text-slate-700 font-bold">{selectedPet.microchip || 'Não cadastrado'}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-bold uppercase">Nº de RGA (Governo)</span>
              <span className="font-mono text-slate-700 font-bold">{selectedPet.rga || 'Não cadastrado'}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-bold uppercase">Data de Adoção</span>
              <span className="font-bold text-slate-700">
                {selectedPet.adoptionDate ? new Date(selectedPet.adoptionDate).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : 'Não informado'}
              </span>
            </div>
            <div className="col-span-full border-t border-slate-200/60 pt-2 mt-1">
              <span className="text-[10px] text-slate-400 block font-bold uppercase">Tutor Responsável</span>
              <span className="font-extrabold text-indigo-950">{tutorName}</span>
            </div>
          </div>
        </div>

        {/* 2. SECCIÓN: CARTEIRA DE VACINAÇÃO */}
        <div className="print-section bg-white rounded-xl p-5 border border-slate-200">
          <h2 className="text-sm font-extrabold uppercase text-indigo-900 border-b border-indigo-200 pb-1.5 mb-3 flex items-center gap-1">
            💉 Carteira de Imunizações e Vacinas
          </h2>
          {petVaccines.length === 0 ? (
            <p className="text-xs italic text-slate-400 py-2">Nenhuma vacina registrada para este pet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="py-2 px-3 text-left font-bold text-slate-600 text-xs">Vacina / Antígeno</th>
                    <th className="py-2 px-3 text-left font-bold text-slate-600 text-xs text-center">Lote</th>
                    <th className="py-2 px-3 text-left font-bold text-slate-600 text-xs text-center">Aplicador (CRM)</th>
                    <th className="py-2 px-3 text-left font-bold text-slate-600 text-xs text-center">Status</th>
                    <th className="py-2 px-3 text-left font-bold text-slate-600 text-xs text-right">Data Aplicação</th>
                    <th className="py-2 px-3 text-left font-bold text-slate-600 text-xs text-right">Próximo Reforço</th>
                  </tr>
                </thead>
                <tbody>
                  {petVaccines.map((v) => {
                    const todayTime = new Date().setHours(0, 0, 0, 0);
                    const boosterTime = new Date(v.boosterDate).getTime();
                    const isOverdue = v.status === 'pending' && boosterTime < todayTime;
                    return (
                      <tr key={v.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                        <td className="py-2.5 px-3 font-bold text-slate-850 text-xs">{v.name}</td>
                        <td className="py-2.5 px-3 font-mono text-slate-500 text-xs text-center">{v.batch || '—'}</td>
                        <td className="py-2.5 px-3 text-slate-600 text-xs text-center">{v.veterinarian || '—'}</td>
                        <td className="py-2.5 px-3 text-center">
                          {v.status === 'applied' ? (
                            <span className="text-emerald-700 font-extrabold uppercase text-[9px] bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200 inline-block">
                              Aplicada ✅
                            </span>
                          ) : isOverdue ? (
                            <span className="text-rose-700 font-extrabold uppercase text-[9px] bg-rose-50 px-2.5 py-0.5 rounded border border-rose-200 inline-block">
                              Atrasada ⚠️
                            </span>
                          ) : (
                            <span className="text-amber-700 font-extrabold uppercase text-[9px] bg-amber-50 px-2.5 py-0.5 rounded border border-amber-200 inline-block">
                              Agendada ⏳
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-slate-600 text-xs text-right">
                          {v.appliedDate ? new Date(v.appliedDate).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : '—'}
                        </td>
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-900 text-xs text-right">
                          {new Date(v.boosterDate).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* 3. SECCIÓN: CONTROLE DE PESO, BIOMETRIA E ECC */}
        <div className="print-section bg-white rounded-xl p-5 border border-slate-200">
          <h2 className="text-sm font-extrabold uppercase text-indigo-900 border-b border-indigo-200 pb-1.5 mb-3 flex items-center gap-1">
            📈 Controle Biométrico de Massa Corporal (Escore ECC)
          </h2>
          {petMeas.length === 0 ? (
            <p className="text-xs italic text-slate-400 py-2">Nenhuma medição registrada para este animal.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="py-2 px-3 text-left font-bold text-slate-600 text-xs">Data da Pesagem</th>
                    <th className="py-2 px-3 text-center font-bold text-slate-600 text-xs">Peso (kg)</th>
                    <th className="py-2 px-3 text-center font-bold text-slate-600 text-xs">Altura / Medidas</th>
                    <th className="py-2 px-3 text-center font-bold text-slate-600 text-xs">Diferencial</th>
                    <th className="py-2 px-3 text-left font-bold text-slate-600 text-xs">Escore Corporal (ECC) / Detalhes</th>
                  </tr>
                </thead>
                <tbody>
                  {petMeas.map((m, index) => {
                    const prevMeas = index > 0 ? petMeas[index - 1] : null;
                    const diff = prevMeas ? m.weight - prevMeas.weight : 0;
                    let diffText = 'Baseline';
                    let diffStyle = 'text-slate-500 font-mono text-center';
                    
                    if (diff > 0) {
                      diffText = `+${diff.toFixed(2)} kg 📈`;
                      diffStyle = 'text-emerald-600 font-mono font-bold text-center';
                    } else if (diff < 0) {
                      diffText = `${diff.toFixed(2)} kg 📉`;
                      diffStyle = 'text-rose-600 font-mono font-bold text-center';
                    }

                    return (
                      <tr key={m.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                        <td className="py-2 px-3 font-mono text-slate-700 text-xs">
                          {new Date(m.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                        </td>
                        <td className="py-2 px-3 font-bold text-slate-900 text-center text-xs">{m.weight.toFixed(2)} kg</td>
                        <td className="py-2 px-3 text-slate-600 text-center text-xs">{m.height || '—'} cm</td>
                        <td className={`${diffStyle} py-2 px-3 text-xs`}>{diffText}</td>
                        <td className="py-2 px-3 italic text-slate-600 text-xs">{m.notes || 'Normal / Saudável'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* 4. SECCIÓN: HISTÓRICO TERAPÊUTICO */}
        <div className="print-section bg-white rounded-xl p-5 border border-slate-200">
          <h2 className="text-sm font-extrabold uppercase text-indigo-900 border-b border-indigo-200 pb-1.5 mb-3 flex items-center gap-1">
            💊 Histórico Terapêutico de Medicamentos e Antiparasitários
          </h2>
          {petMedications.length === 0 ? (
            <p className="text-xs italic text-slate-400 py-2">Nenhum histórico medicamentoso registrado.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="py-2 px-3 text-left font-bold text-slate-600 text-xs">Fármaco / Tratamento</th>
                    <th className="py-2 px-3 text-center font-bold text-slate-600 text-xs">Dosagem</th>
                    <th className="py-2 px-3 text-center font-bold text-slate-600 text-xs">Intervalo</th>
                    <th className="py-2 px-3 text-center font-bold text-slate-600 text-xs">Período</th>
                    <th className="py-2 px-3 text-center font-bold text-slate-600 text-xs">Estado</th>
                    <th className="py-2 px-3 text-left font-bold text-slate-600 text-xs">Anotações Relevantes</th>
                  </tr>
                </thead>
                <tbody>
                  {petMedications.map((m) => {
                    const completed = m.doses && m.doses.length > 0 && m.doses.every((d) => d.taken);
                    return (
                      <tr key={m.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                        <td className="py-2 px-3 font-bold text-slate-800 text-xs">{m.name}</td>
                        <td className="py-2 px-3 font-semibold text-indigo-700 text-center text-xs">{m.dosage}</td>
                        <td className="py-2 px-3 text-slate-600 text-center text-xs">a cada {m.frequencyHours}h</td>
                        <td className="py-2 px-3 text-slate-600 text-center text-xs">{m.durationDays} dias</td>
                        <td className="py-2 px-3 text-center">
                          {completed ? (
                            <span className="text-indigo-800 font-extrabold uppercase text-[9px] bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                              Fim Ciclo ✅
                            </span>
                          ) : (
                            <span className="text-emerald-700 font-extrabold uppercase text-[9px] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              Ativo ⏳
                            </span>
                          )}
                        </td>
                        <td className="py-2 px-3 italic text-slate-600 text-[11px]">{m.notes || 'Sem anotações adicionais'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* 5. SECCIÓN: MONITORAMENTO DO CICLO REPRODUTIVO (Fêmeas apenas) */}
        {selectedPet.gender === 'female' && (
          <div className="print-section bg-white rounded-xl p-5 border border-slate-200">
            <h2 className="text-sm font-extrabold uppercase text-pink-700 border-b border-pink-100 pb-1.5 mb-3 flex items-center gap-1">
              ❤️ Monitoramento do Ciclo Reprodutivo e Cios
            </h2>
            {petReproCycles.length === 0 ? (
              <p className="text-xs italic text-slate-400 py-2">Sem observação de ciclos no histórico recente.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-pink-100 bg-pink-50/30">
                      <th className="py-2 px-3 text-left font-bold text-pink-900 text-xs">Data Registrada</th>
                      <th className="py-2 px-3 text-left font-bold text-pink-900 text-xs">Evento Reprodutivo</th>
                      <th className="py-2 px-3 text-left font-bold text-pink-900 text-xs">Notas Comportamentais</th>
                    </tr>
                  </thead>
                  <tbody>
                    {petReproCycles.map((c) => {
                      let evLabel: string = c.event;
                      if (c.event === 'cio') evLabel = '🩸 Início do Cio (Estro)';
                      else if (c.event === 'cross') evLabel = '🐾 Acasalamento Coito';
                      else if (c.event === 'insemination') evLabel = '🧬 Inseminação Assistida';

                      return (
                        <tr key={c.id} className="border-b border-pink-50 hover:bg-pink-50/10">
                          <td className="py-2 px-3 font-mono font-bold text-slate-700 text-xs">
                            {new Date(c.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                          </td>
                          <td className="py-2 px-3 font-bold text-pink-805 text-xs">{evLabel}</td>
                          <td className="py-2 px-3 italic text-slate-650 text-xs">{c.notes || 'Nenhuma ocorrência incomum.'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* 6. SECCIÓN: DIAGNÓSTICO E LOGS CLINICOS */}
        <div className="print-section bg-white rounded-xl p-5 border border-slate-200">
          <h2 className="text-sm font-extrabold uppercase text-indigo-900 border-b border-indigo-200 pb-1.5 mb-3 flex items-center gap-1">
            🩺 Exames, Sintomas e Relatórios de Anamnese Geral
          </h2>

          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 mb-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div className="p-2 border border-slate-200 bg-white rounded-lg">
              <span className="text-[9px] text-slate-400 font-extrabold block uppercase">Freq. Cardíaca (FC)</span>
              <span className="font-mono text-slate-600">[_______] bpm</span>
              <span className="text-[8px] text-slate-400 block mt-1">Ref: Cão: 70-160 | Gato: 150-220</span>
            </div>
            <div className="p-2 border border-slate-200 bg-white rounded-lg">
              <span className="text-[9px] text-slate-400 font-extrabold block uppercase">Freq. Respiratória (FR)</span>
              <span className="font-mono text-slate-600">[_______] mpm</span>
              <span className="text-[8px] text-slate-400 block mt-1">Ref: Cão: 10-30 | Gato: 20-40</span>
            </div>
            <div className="p-2 border border-slate-200 bg-white rounded-lg">
              <span className="text-[9px] text-slate-400 font-extrabold block uppercase">Temperatura Corporal</span>
              <span className="font-mono text-slate-600">[_______] ºC</span>
              <span className="text-[8px] text-slate-400 block mt-1">Ref normal: 37,5 a 39,2 ºC</span>
            </div>
            <div className="p-2 border border-slate-200 bg-white rounded-lg">
              <span className="text-[9px] text-slate-400 font-extrabold block uppercase">Hidratação / Turgor</span>
              <span className="font-mono text-slate-600">[_______] seg</span>
              <span className="text-[8px] text-slate-400 block mt-1">Turgor normal: &lt; 2 seg</span>
            </div>
          </div>

          {petLogs.length === 0 ? (
            <p className="text-xs italic text-slate-450 py-2">Sem eventos clínicos ou cirúrgicos adicionais.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="py-2 px-3 text-left font-bold text-slate-600 text-xs">Data</th>
                    <th className="py-2 px-3 text-left font-bold text-slate-600 text-xs">Ocorrência</th>
                    <th className="py-2 px-3 text-left font-bold text-slate-600 text-xs text-center">Tipo</th>
                    <th className="py-2 px-3 text-left font-bold text-slate-600 text-xs">Histórico Clínico</th>
                    <th className="py-2 px-3 text-left font-bold text-slate-600 text-xs">Diagnóstico Realizado</th>
                  </tr>
                </thead>
                <tbody>
                  {petLogs.map((l) => {
                    let logTypeLabel: string = l.type;
                    if (l.type === 'consultation') logTypeLabel = '🩺 Consulta';
                    else if (l.type === 'surgery') logTypeLabel = '✂️ Cirurgia';
                    else if (l.type === 'hospitalization') logTypeLabel = '🏥 Internação';
                    else if (l.type === 'allergy') logTypeLabel = '🚨 Alergia';
                    else if (l.type === 'behavior') logTypeLabel = '🧠 Comportamento';

                    return (
                      <tr key={l.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                        <td className="py-2 px-3 font-mono text-slate-600 text-xs">
                          {new Date(l.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                        </td>
                        <td className="py-2 px-3 font-bold text-slate-900 text-xs">{l.title}</td>
                        <td className="py-2 px-3 text-center text-[10px] font-bold text-slate-650">{logTypeLabel}</td>
                        <td className="py-2 px-3 text-slate-600 text-xs leading-normal">{l.notes}</td>
                        <td className="py-2 px-3 font-bold text-indigo-900 text-xs">{l.diagnostics || 'Sob observação'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* 7. SECCIÓN: ROTINA DE HIGIENE */}
        <div className="print-section bg-white rounded-xl p-5 border border-slate-200">
          <h2 className="text-sm font-extrabold uppercase text-indigo-900 border-b border-indigo-200 pb-1.5 mb-3 flex items-center gap-1">
            🧼 Manejo de Higiene, Banhos e Cuidados Diários
          </h2>
          {petRoutines.length === 0 ? (
            <p className="text-xs italic text-slate-400 py-2">Nenhuma rotina preventiva cadastrada.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="py-2 px-3 text-left font-bold text-slate-600 text-xs">Cuidado Cadastrado</th>
                    <th className="py-2 px-3 text-left font-bold text-slate-600 text-xs text-center">Frequência</th>
                    <th className="py-2 px-3 text-left font-bold text-slate-600 text-xs text-right">Última Realização</th>
                    <th className="py-2 px-3 text-left font-bold text-slate-600 text-xs text-right">Próximo Prazo</th>
                    <th className="py-2 px-3 text-left font-bold text-slate-600 text-xs text-center">Cumprimento</th>
                  </tr>
                </thead>
                <tbody>
                  {petRoutines.map((r) => {
                    const lastDoneDate = new Date(r.lastDone);
                    const nextDueDate = new Date(lastDoneDate.getTime() + r.frequencyDays * 24 * 60 * 60 * 1000);
                    const isOverdue = nextDueDate.getTime() < Date.now();

                    return (
                      <tr key={r.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                        <td className="py-2.5 px-3 font-bold text-slate-800 text-xs">{r.title}</td>
                        <td className="py-2.5 px-3 text-slate-600 text-xs text-center">a cada {r.frequencyDays} dias</td>
                        <td className="py-2.5 px-3 font-mono text-slate-600 text-xs text-right">
                          {new Date(r.lastDone).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-slate-900 font-bold text-xs text-right">
                          {nextDueDate.toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          {isOverdue ? (
                            <span className="text-rose-700 font-extrabold uppercase text-[9px] bg-rose-50 px-2 py-0.5 rounded border border-rose-200 inline-block">
                              Atrasada ⚠️
                            </span>
                          ) : (
                            <span className="text-emerald-700 font-extrabold uppercase text-[9px] bg-emerald-50 px-2   py-0.5 rounded border border-emerald-200 inline-block">
                              Em Dia ✅
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Professional Veterinary Sign-off footer at bottom */}
        <div className="border-t border-slate-300 pt-8 mt-12 grid grid-cols-2 gap-10 text-center text-xs">
          <div className="space-y-6">
            <div className="border-b border-slate-400 mx-auto w-3/4 h-10"></div>
            <div>
              <p className="font-bold text-slate-800">{tutorName}</p>
              <p className="text-[10px] text-slate-500">Tutor Responsável</p>
            </div>
          </div>
          <div className="space-y-6">
            <div className="border-b border-slate-400 mx-auto w-3/4 h-10"></div>
            <div>
              <p className="font-bold text-slate-800">Médico(a) Veterinário(a)</p>
              <p className="text-[10px] text-slate-500">CRMV / Carimbo e Assinatura</p>
            </div>
          </div>
        </div>

        {/* Footer legalities */}
        <div className="text-[9px] text-center text-slate-400 pt-8 mt-5 leading-normal">
          Ficha e documento gerados de forma autônoma de posse do tutor cadastrado.<br />
          Ctrl+Pet — Plataforma Livre Offline de Registro de Saúde Animal.
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6" id="share-export-card">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span 
            onClick={handleOpenPreview}
            className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-505 cursor-pointer hover:opacity-80 transition-all"
            title="Imprimir Prontuário"
          >
            <Share2 className="w-5 h-5 text-emerald-500" />
          </span>
          <h3 className="text-lg font-bold font-display text-slate-800 dark:text-slate-200">
            Exportar Prontuário Clínico
          </h3>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Compartilhe relatórios e fichas médicas unificadas de <strong>{selectedPet.name}</strong> com familiares ou envie PDFs ao veterinário.
        </p>
      </div>

      {/* Editor Safe Mode Info Banner inside Card */}
      <div className="p-3.5 bg-amber-500/10 dark:bg-amber-500/5 rounded-xl border border-amber-500/20 text-amber-800 dark:text-amber-300 text-xs flex gap-2 items-start leading-relaxed">
        <span className="text-sm">💡</span>
        <div>
          <strong>Dica para Imprimir no Editor:</strong> Se clicar em gerar PDF e nada acontecer, é uma trava de segurança do visualizador lateral. Caso ocorra, simplesmente abra em nova aba com o botão <span className="font-bold underline">"Abrir aplicativo em nova aba"</span> no canto superior direito para liberar livremente.
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Print Option */}
        <div className="p-5 border border-slate-150 dark:border-slate-850 rounded-xl space-y-3 flex flex-col justify-between">
          <div className="space-y-1.5">
            <span className="p-2 bg-slate-100 dark:bg-slate-850 text-slate-700 dark:text-slate-300 rounded-lg inline-block">
              <Printer className="w-5 h-5" />
            </span>
            <p className="text-xs font-bold text-slate-800 dark:text-slate-100">Imprimir ou Salvar PDF</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
              Abre a tela de impressão do sistema, já otimizada com formatação de prontuário A4 limpa ocultando menus e botões.
            </p>
          </div>
          <button
            onClick={() => triggerActionWithAd("Gerar PDF do Prontuário", handleOpenPreview)}
            className="w-full text-center py-2 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <FileText className="w-4 h-4" /> Visualizar e Gerar PDF
          </button>
        </div>

        {/* WhatsApp Sharing */}
        <div className="p-5 border border-emerald-150 dark:border-emerald-950/40 rounded-xl space-y-3 flex flex-col justify-between bg-emerald-50/10 dark:bg-emerald-950/5">
          <div className="space-y-1.5">
            <span className="p-2 bg-emerald-500 text-white rounded-lg inline-block">
              <Share2 className="w-5 h-5" />
            </span>
            <p className="text-xs font-bold text-emerald-800 dark:text-emerald-300">Compartilhar via WhatsApp</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
              Gera um sumário completo de texto digitado contendo nome, idade, vacinas agendadas e peso para enviar via mensagem rápida.
            </p>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={handleCopyText}
              className="flex-1 py-2 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-850 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center gap-1 cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-500" /> Copiado!
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" /> Copiar Sumário
                </>
              )}
            </button>
            <button
              onClick={() => {
                triggerActionWithAd("Compartilhar Sumário WhatsApp", () => {
                  window.open(`https://api.whatsapp.com/send?text=${getWhatsAppMessage()}`, '_blank');
                });
              }}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1 transition-all cursor-pointer text-center flex-1"
            >
              WhatsApp 💬
            </button>
          </div>
        </div>
      </div>

      {/* Embedded printable block hidden in normal UI, rendered as direct child of body in react portals to avoid structural wrapping during CSS printing overrides */}
      {createPortal(
        <div className="hidden print:block space-y-8 p-1 sm:p-4 text-slate-900 bg-white" id="printable-dossier-root">
          {/* CSS Page breaks and styles inside print to avoid splitting or displaying normal header items */}
          <style dangerouslySetInnerHTML={{ __html: `
            @media print {
              /* Hide the entire React App main wrapper completely */
              #root {
                display: none !important;
              }

              /* General background & font settings */
              html, body {
                background: #ffffff !important;
                color: #0f172a !important;
                font-family: 'Inter', system-ui, -apple-system, sans-serif !important;
                margin: 0 !important;
                padding: 0 !important;
                width: 100% !important;
                height: auto !important;
                overflow: visible !important;
              }

              /* Position the prontuário document at the top-left of the page physically */
              #printable-dossier-root {
                display: block !important;
                visibility: visible !important;
                position: static !important;
                width: 100% !important;
                margin: 0 !important;
                padding: 10px 4px !important;
              }

              /* Prevent page clipping inside sections */
              .print-section {
                break-inside: avoid !important;
                page-break-inside: avoid !important;
                margin-bottom: 24px !important;
                background: transparent !important;
                border: 1px solid #cbd5e1 !important;
                border-radius: 12px !important;
                padding: 16px !important;
              }
              table {
                width: 100% !important;
                border-collapse: collapse !important;
                page-break-inside: auto !important;
              }
              tr {
                page-break-inside: avoid !important;
                break-inside: avoid !important;
              }
              th, td {
                border-bottom: 1px solid #cbd5e1 !important;
                padding: 8px 6px !important;
                text-align: left !important;
                font-size: 11px !important;
                color: #1e293b !important;
              }
              th {
                background-color: #f1f5f9 !important;
                color: #334155 !important;
                font-weight: 700 !important;
                text-transform: uppercase !important;
                font-size: 10px !important;
              }
            }
          `}} />
          {renderDossierContent()}
        </div>,
        document.body
      )}

      {/* On-Screen Premium Prontuário Preview Modal */}
      {showDossierModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 no-print animate-fade-in">
          <div className="relative bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-5xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200 dark:border-slate-800 animate-slide-up">
            {/* Modal Header Controls */}
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/40">
              <div className="flex items-center gap-3">
                <span className="p-2 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl text-indigo-650 dark:text-indigo-400">
                  <Printer className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </span>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-100">Prontuário Médico Digital - {selectedPet.name}</h3>
                  <p className="text-[11px] text-slate-400 font-medium">Visualização prévia e geração do laudo de impressão A4</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
                >
                  <Printer className="w-4 h-4" /> Imprimir / Salvar PDF
                </button>
                <button
                  onClick={() => setShowDossierModal(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl transition-all cursor-pointer"
                  title="Fechar"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Sandbox Iframe Protection Advice with Active Anchor Link */}
            <div className="px-6 py-4 bg-indigo-50 dark:bg-indigo-950/20 border-b border-indigo-100 dark:border-indigo-900/50 text-indigo-900 dark:text-indigo-200 text-xs flex flex-col md:flex-row md:items-center justify-between gap-4 leading-relaxed">
              <div className="flex gap-2 items-start">
                <span className="text-sm mt-0.5">⚠️</span>
                <div>
                  <strong className="font-extrabold text-indigo-950 dark:text-indigo-100 block mb-0.5">Aviso de Segurança (Iframe do Editor)</strong>
                  Como estamos dentro do ambiente seguro de pré-visualização, o navegador pode travar popups e impedir a tela de PDF. Para salvar sem qualquer bloqueio, abra o aplicativo em uma aba externa e imprima:
                </div>
              </div>
              <a
                href={typeof window !== 'undefined' ? window.location.href : '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="whitespace-nowrap px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-sm shrink-0 cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5" /> Abrir no Navegador 🚀
              </a>
            </div>

            {/* Scrollable document layout area styled representing an A4 printed sheet of paper */}
            <div className="flex-1 overflow-y-auto p-6 md:p-10 bg-slate-100 dark:bg-slate-950/60 flex justify-center">
              <div className="bg-white text-slate-900 p-8 md:p-12 shadow-xl max-w-[850px] w-full rounded-2xl border border-slate-200 dark:border-slate-800 text-left">
                {renderDossierContent()}
              </div>
            </div>

            {/* Bottom bar control action */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/20 flex items-center justify-between text-xs text-slate-500">
              <span className="font-medium text-[10px] tracking-wide uppercase">Ctrl+Pet • Carteira de Saúde Livre</span>
              <button
                onClick={() => setShowDossierModal(false)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold rounded-xl transition-all cursor-pointer"
              >
                Fechar Pré-visualização
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
