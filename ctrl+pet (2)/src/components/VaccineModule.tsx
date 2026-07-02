import React, { useState } from 'react';
import { Vaccine } from '../types';
import { Shield, Plus, Calendar, Bell, AlertTriangle, CheckCircle, Clock, Trash2 } from 'lucide-react';

interface VaccineModuleProps {
  vaccines: Vaccine[];
  selectedPetId: string;
  onAddVaccine: (
    name: string,
    boosterDate: string,
    appliedDate: string | null,
    batch?: string,
    veterinarian?: string,
    notes?: string,
    nextBoosterDate?: string
  ) => void;
  onToggleVaccineStatus: (id: string) => void;
  onDeleteVaccine?: (id: string, name: string) => void;
}

export default function VaccineModule({
  vaccines,
  selectedPetId,
  onAddVaccine,
  onToggleVaccineStatus,
  onDeleteVaccine,
}: VaccineModuleProps) {
  const [name, setName] = useState('');
  const [boosterDate, setBoosterDate] = useState('');
  const [appliedDate, setAppliedDate] = useState(new Date().toISOString().split('T')[0]);
  const [batch, setBatch] = useState('');
  const [veterinarian, setVeterinarian] = useState('');
  const [notes, setNotes] = useState('');
  const [showForm, setShowForm] = useState(false);

  // Dynamic logic state variables
  const [regType, setRegType] = useState<'applied' | 'future'>('applied');
  const [hasBooster, setHasBooster] = useState(false);
  const [nextBoosterDate, setNextBoosterDate] = useState('');

  const petVaccines = vaccines.filter((v) => v.petId === selectedPetId);

  // Check if any vaccine has a booster date coming up in the next 7 days
  const upcomingBoosters = petVaccines.filter((v) => {
    if (v.status === 'applied') return false; // Already taken
    const now = new Date();
    const booster = new Date(v.boosterDate);
    const diffTime = booster.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 7;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    if (regType === 'applied') {
      if (!appliedDate) return;
      
      const boosterParam = hasBooster && nextBoosterDate ? nextBoosterDate : appliedDate;

      onAddVaccine(
        name,
        boosterParam,
        appliedDate,
        batch || undefined,
        veterinarian || undefined,
        notes || undefined,
        hasBooster && nextBoosterDate ? nextBoosterDate : undefined
      );
    } else {
      if (!boosterDate) return;
      onAddVaccine(
        name,
        boosterDate,
        null, // No appliedDate
        undefined,
        undefined,
        notes || undefined,
        undefined
      );
    }

    // Reset Form
    setName('');
    setBoosterDate('');
    setAppliedDate(new Date().toISOString().split('T')[0]);
    setBatch('');
    setVeterinarian('');
    setNotes('');
    setRegType('applied');
    setHasBooster(false);
    setNextBoosterDate('');
    setShowForm(false);
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6" id="vaccines-card">
      {/* Module Title */}
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-505">
              <Shield className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </span>
            <h3 className="text-sm font-bold font-display tracking-tight text-slate-900 dark:text-slate-100 uppercase">
              Carteira de Vacinação
            </h3>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Cadastre doses manuais de reforço, lotes e configure lembretes de revacinação.
          </p>
        </div>
        <button
          id="btn-toggle-vaccine-form"
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 text-xs text-slate-700 dark:text-slate-200 transition-all font-bold cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 text-indigo-550" /> Vacina
        </button>
      </div>

      {/* ⚠️ Alerta de Reforço com Gatilhamento Prévio (7 dias) */}
      {upcomingBoosters.length > 0 && (
        <div className="p-4 bg-amber-50 dark:bg-amber-950/35 border border-amber-200 dark:border-amber-900/60 rounded-xl space-y-2" id="booster-warning-banner">
          <div className="flex items-start gap-2 text-amber-800 dark:text-amber-300">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-500" />
            <div>
              <p className="text-xs font-bold">⚠️ Sistema Inteligente: Alerta Fixo de Revacinação (⚠️ -7 Dias)</p>
              <p className="text-[11px] leading-relaxed">
                As seguintes vacinas estão agendadas para aplicação ou reforço nos próximos 7 dias. Lembre-se de adquirir a dose ou agendar a ida do tutor:
              </p>
            </div>
          </div>
          <div className="space-y-1.5 pl-6">
            {upcomingBoosters.map((v) => (
              <div key={v.id} className="flex justify-between items-center text-[11px] text-slate-700 dark:text-slate-300 font-mono">
                <span>💉 <strong>{v.name}</strong></span>
                <span className="text-amber-600 dark:text-amber-400 font-bold">
                  Reforço: {new Date(v.boosterDate).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Vaccine Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="p-4 border border-orange-100 dark:border-orange-950/60 bg-orange-50/20 dark:bg-orange-950/10 rounded-xl space-y-4">
          <span className="text-xs font-bold text-orange-600 dark:text-orange-400 block">Cadastrar Nova Vacina / Dose</span>

          {/* 1. Vaccine Name */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase block">Nome da Vacina (ex: V10, Antirrábica)</label>
            <input
              id="vaccine-name-input"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="ex: Antirrábica Nobivac"
              className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-lg text-xs dark:text-slate-100 focus:outline-none focus:border-orange-500"
            />
          </div>

          {/* 2. Style selector as a beautiful selector layout */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase block tracking-wider">
              O que você deseja fazer?
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setRegType('applied')}
                className={`px-3 py-2.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  regType === 'applied'
                    ? 'bg-orange-600 border-orange-600 text-white shadow-sm shadow-orange-655/10'
                    : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-750 dark:text-slate-250 hover:bg-slate-50 dark:hover:bg-slate-900 shadow-xs'
                }`}
              >
                <CheckCircle className="w-4 h-4" />
                Registrar vacina já aplicada
              </button>
              <button
                type="button"
                onClick={() => setRegType('future')}
                className={`px-3 py-2.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  regType === 'future'
                    ? 'bg-orange-600 border-orange-600 text-white shadow-sm shadow-orange-655/10'
                    : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-750 dark:text-slate-250 hover:bg-slate-50 dark:hover:bg-slate-905 shadow-xs'
                }`}
              >
                <Calendar className="w-4 h-4" />
                Agendar vacinação futura
              </button>
            </div>
          </div>

          {/* 3. Conditional Fields Display */}
          {regType === 'applied' ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Data da Aplicação *</label>
                  <input
                    id="vaccine-applied-date-input"
                    type="date"
                    required
                    value={appliedDate}
                    onChange={(e) => setAppliedDate(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-lg text-xs font-mono dark:text-slate-100 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Nº do Lote (Opcional)</label>
                  <input
                    id="vaccine-batch-input"
                    type="text"
                    value={batch}
                    onChange={(e) => setBatch(e.target.value)}
                    placeholder="ex: L10293X"
                    className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-lg text-xs dark:text-slate-100 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Médico Veterinário/Clínica (Opcional)</label>
                  <input
                    id="vaccine-vet-input"
                    type="text"
                    value={veterinarian}
                    onChange={(e) => setVeterinarian(e.target.value)}
                    placeholder="ex: Dr. Carlos Silva"
                    className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-lg text-xs dark:text-slate-100 focus:outline-none"
                  />
                </div>
              </div>

              {/* Automatic Reinforcement programming toggle switch */}
              <div className="p-3 bg-white dark:bg-slate-950 rounded-xl border border-slate-150 dark:border-slate-800/60 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs">
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-205">Programar data do próximo reforço?</p>
                  <p className="text-[10px] text-slate-400">Marque para agendar a próxima dose de reforço automaticamente no aplicativo.</p>
                </div>
                <div>
                  <label className="relative inline-flex items-center cursor-pointer select-none">
                    <input
                      id="vaccine-has-booster"
                      type="checkbox"
                      checked={hasBooster}
                      onChange={(e) => {
                        setHasBooster(e.target.checked);
                        if (e.target.checked && !nextBoosterDate) {
                          const d = new Date(appliedDate);
                          d.setFullYear(d.getFullYear() + 1); // default as +1 Year
                          setNextBoosterDate(d.toISOString().split('T')[0]);
                        }
                      }}
                      className="rounded border-slate-300 text-orange-600 focus:ring-orange-600 w-4 h-4 cursor-pointer"
                    />
                    <span className="ml-2 text-xs font-bold text-slate-705 dark:text-slate-305">Sim, programar reforço</span>
                  </label>
                </div>
              </div>

              {hasBooster && (
                <div className="space-y-1 w-full md:w-1/3 animate-in fade-in slide-in-from-top-2 duration-200">
                  <label className="text-[10px] font-bold text-slate-500 uppercase block">Data da Próxima Aplicação *</label>
                  <input
                    id="vaccine-next-booster-input"
                    type="date"
                    required
                    value={nextBoosterDate}
                    onChange={(e) => setNextBoosterDate(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-lg text-xs font-mono dark:text-slate-100 focus:outline-none"
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-1 w-full md:w-1/3 animate-in fade-in duration-200">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Data do Agendamento *</label>
              <input
                id="vaccine-booster-input"
                type="date"
                required
                value={boosterDate}
                onChange={(e) => setBoosterDate(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-lg text-xs font-mono dark:text-slate-100 focus:outline-none"
              />
            </div>
          )}

          {/* 4. Notes and Buttons */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Anotações extras</label>
            <input
              id="vaccine-notes-input"
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="ex: Reação leve de sonolência nas primeiras 4 horas"
              className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-lg text-xs dark:text-slate-100 focus:outline-none"
            />
          </div>

          <div className="flex gap-2 justify-end pt-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-3 py-1.5 rounded-lg text-xs hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-all font-semibold cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-3 py-1.5 rounded-lg bg-orange-600 text-white font-bold text-xs hover:bg-orange-700 shadow-md shadow-orange-600/10 cursor-pointer"
            >
              Salvar Registro
            </button>
          </div>
        </form>
      )}

      {/* Grid displaying the registered Vaccine records */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Applied vaccine history list */}
        <div className="space-y-2">
          <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
            ✓ Histórico Aplicado
          </span>
          <div className="space-y-2 max-h-[220px] overflow-y-auto">
            {petVaccines.filter((v) => v.status === 'applied').length === 0 ? (
              <p className="text-[11px] text-slate-400 italic py-4 text-center bg-slate-50 dark:bg-slate-950/20 rounded-xl">
                Nenhuma vacina aplicada registrada.
              </p>
            ) : (
              petVaccines
                .filter((v) => v.status === 'applied')
                .map((v) => (
                  <div
                    key={v.id}
                    className="p-3 rounded-xl border border-emerald-100 dark:border-emerald-950/30 bg-emerald-50/10 dark:bg-emerald-950/5 hover:border-emerald-250 transition-all space-y-2"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 leading-none">{v.name}</h4>
                        {v.batch && <span className="text-[9px] font-mono text-slate-400">Lote: {v.batch}</span>}
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-[9px] font-bold text-emerald-600 bg-emerald-105 border border-emerald-200 px-1.5 py-0.5 rounded flex items-center gap-1 font-mono">
                          <CheckCircle className="w-2.5 h-2.5" /> Aplicada
                        </span>
                        {onDeleteVaccine && (
                          <button
                            type="button"
                            onClick={() => {
                              onDeleteVaccine(v.id, v.name);
                            }}
                            className="p-1 text-slate-400 hover:text-rose-500 rounded transition-colors cursor-pointer"
                            title="Excluir de forma permanente"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                    {v.appliedDate && (
                      <div className="flex items-center gap-1 text-[10px] font-mono text-slate-500">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Aplicado em: {new Date(v.appliedDate).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</span>
                      </div>
                    )}
                    {v.notes && <p className="text-[10px] text-slate-400 italic">“{v.notes}”</p>}
                  </div>
                ))
            )}
          </div>
        </div>

        {/* Pending vaccine booster checklists */}
        <div className="space-y-2">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            ⌛ Próximos Reforços Agendados
          </span>
          <div className="space-y-2 max-h-[220px] overflow-y-auto">
            {petVaccines.filter((v) => v.status === 'pending').length === 0 ? (
              <p className="text-[11px] text-slate-400 italic py-4 text-center bg-slate-50 dark:bg-slate-950/20 rounded-xl">
                Sem agendamentos futuros.
              </p>
            ) : (
              petVaccines
                .filter((v) => v.status === 'pending')
                .map((v) => (
                  <div
                    key={v.id}
                    className="p-3 rounded-xl border border-slate-150 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-950/20 hover:border-slate-200 transition-all space-y-2 flex flex-col justify-b"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">{v.name}</h4>
                        <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1 mt-1">
                          <Clock className="w-3 h-3" /> Reforço: {new Date(v.boosterDate).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => onToggleVaccineStatus(v.id)}
                          className="text-[10px] font-bold text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/40 hover:bg-orange-100 p-1.5 rounded-lg border border-orange-200 dark:border-orange-900/40 cursor-pointer"
                          title="Marcar como aplicada hoje"
                        >
                          ✓ Aplicar
                        </button>
                        {onDeleteVaccine && (
                          <button
                            type="button"
                            onClick={() => {
                              onDeleteVaccine(v.id, v.name);
                            }}
                            className="p-1 text-slate-400 hover:text-rose-500 rounded transition-colors cursor-pointer"
                            title="Excluir de forma permanente"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                    {v.notes && <p className="text-[10px] text-slate-400 italic leading-snug">“{v.notes}”</p>}
                  </div>
                ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
