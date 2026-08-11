import React, { useState } from 'react';
import { MedicationSchedule, Dose } from '../types';
import { Pill, Plus, Calendar, CheckSquare, Square, Trash2, Clock, CalendarRange } from 'lucide-react';

interface MedicationModuleProps {
  schedules: MedicationSchedule[];
  selectedPetId: string;
  onAddSchedule: (name: string, dosage: string, startDate: string, frequencyHours: number, durationDays: number, notes?: string) => void;
  onDeleteSchedule: (id: string) => void;
  onToggleDose: (scheduleId: string, doseId: string) => void;
}

export default function MedicationModule({
  schedules,
  selectedPetId,
  onAddSchedule,
  onDeleteSchedule,
  onToggleDose,
}: MedicationModuleProps) {
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 16)); // datetime-local format
  const [frequencyHours, setFrequencyHours] = useState('12');
  const [durationDays, setDurationDays] = useState('7');
  const [notes, setNotes] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState<string | null>(null);

  const petSchedules = schedules.filter((s) => s.petId === selectedPetId);

  // Set first schedule as default selected if none is selected
  React.useEffect(() => {
    if (petSchedules.length > 0 && !activeTab) {
      setActiveTab(petSchedules[petSchedules.length - 1].id);
    }
  }, [petSchedules, activeTab]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const freq = parseInt(frequencyHours);
    const dur = parseInt(durationDays);
    if (!name || !dosage || !startDate || isNaN(freq) || isNaN(dur)) return;

    onAddSchedule(name, dosage, startDate, freq, dur, notes);
    
    setName('');
    setDosage('');
    setNotes('');
    setShowForm(false);
  };

  const selectedSchedule = petSchedules.find((s) => s.id === activeTab);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6" id="medications-card">
      {/* Block Header */}
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-505">
              <Pill className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </span>
            <h3 className="text-sm font-bold font-display tracking-tight text-slate-900 dark:text-slate-100 uppercase">
              Medicamentos e Tratamentos
            </h3>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Agende ciclos de remédios inteiros com doses automáticas em segundos.
          </p>
        </div>
        <button
          id="btn-toggle-medication-form"
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 text-xs text-slate-700 dark:text-slate-200 transition-all font-bold cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 text-indigo-550" /> Ciclo
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="p-4 border border-indigo-100 dark:border-indigo-950/60 bg-indigo-50/20 dark:bg-indigo-950/10 rounded-xl space-y-4">
          <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 block">Iniciar Novo Ciclo Completo</span>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Nome do Remédio / Princípio Ativo</label>
              <input
                id="med-name-input"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="ex: Antibiótico Amoxicilina, Vermífugo"
                className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-lg text-xs dark:text-slate-100 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Dosagem (ex: 1 comprimido, 5ml)</label>
              <input
                id="med-dosage-input"
                type="text"
                required
                value={dosage}
                onChange={(e) => setDosage(e.target.value)}
                placeholder="ex: 1/2 comp - 250mg"
                className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-lg text-xs dark:text-slate-100 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Data e Hora da 1ª Dose</label>
              <input
                id="med-start-input"
                type="datetime-local"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-lg text-xs font-mono dark:text-slate-100 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Frequência (horas)</label>
              <select
                id="med-frequency-select"
                value={frequencyHours}
                onChange={(e) => setFrequencyHours(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-lg text-xs dark:text-slate-100 focus:outline-none"
              >
                <option value="6">A cada 6 horas</option>
                <option value="8">A cada 8 horas</option>
                <option value="12">A cada 12 horas (2x ao dia)</option>
                <option value="24">A cada 24 horas (1x ao dia)</option>
                <option value="48">A cada 48 horas</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Duração (dias)</label>
              <input
                id="med-duration-input"
                type="number"
                required
                min="1"
                value={durationDays}
                onChange={(e) => setDurationDays(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-lg text-xs font-mono dark:text-slate-100 focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Instruções de administração / Alimentos</label>
            <input
              id="med-instructions-input"
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="ex: Dar junto com a refeição da noite"
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
              className="px-3 py-1.5 rounded-lg bg-indigo-500 text-white font-bold text-xs hover:bg-indigo-600 shadow-md shadow-indigo-550/10 cursor-pointer"
            >
              Gerar {Math.ceil((parseInt(durationDays) * 24) / parseInt(frequencyHours))} Doses Secundárias
            </button>
          </div>
        </form>
      )}

      {/* Main layout: left tabs for cycles, right panel for doses checklist */}
      {petSchedules.length === 0 ? (
        <div className="text-center py-8 bg-slate-50 dark:bg-slate-950/20 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
          <CalendarRange className="w-10 h-10 mx-auto text-indigo-400 opacity-60 mb-2" />
          <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Nenhum ciclo ativo</p>
          <p className="text-[10px] text-slate-400 max-w-xs mx-auto">Cadastre ciclos como antibióticos ou suplementos para gerar as grades de doses autônomas.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Side tabs for each registered Medication */}
          <div className="md:col-span-1 border-r border-slate-100 dark:border-slate-800/60 pr-0 md:pr-4 space-y-2 max-h-[300px] overflow-y-auto">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-2">Ciclos Ativos</span>
            {petSchedules.map((s) => (
              <div
                key={s.id}
                onClick={() => setActiveTab(s.id)}
                className={`w-full text-left p-3 rounded-xl border transition-all flex flex-col gap-1 cursor-pointer ${
                  activeTab === s.id
                    ? 'border-indigo-200 bg-indigo-50/40 dark:border-indigo-950/40 dark:bg-indigo-950/20 text-indigo-950 dark:text-indigo-100'
                    : 'border-slate-150 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-950/40 text-slate-600 dark:text-slate-300 hover:border-slate-250'
                }`}
              >
                <div className="flex justify-between items-start w-full">
                  <span className="text-xs font-bold font-display truncate pr-1">{s.name}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteSchedule(s.id);
                      if (activeTab === s.id) setActiveTab(null);
                    }}
                    className="text-slate-400 hover:text-rose-500 p-0.5 rounded transition-all cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono mt-1">
                  <span>💊 {s.dosage}</span>
                  <span>⏱️ de {s.frequencyHours}h/{s.frequencyHours}h</span>
                </div>
              </div>
            ))}
          </div>

          {/* Doses checklists representing autonomous compliance */}
          <div className="md:col-span-2 space-y-3">
            {selectedSchedule ? (
              <div className="space-y-4">
                <div className="p-3 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-150 dark:border-slate-850 space-y-1.5">
                  <div className="flex justify-between items-start text-xs font-bold text-slate-800 dark:text-slate-200">
                    <span>Guia de Medicamento: {selectedSchedule.name}</span>
                    <span className="text-[10px] font-mono text-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded-md">
                      {selectedSchedule.durationDays} dias total
                    </span>
                  </div>
                  {selectedSchedule.notes && (
                    <p className="text-[10px] text-slate-500 italic dark:text-slate-400">📝 Notas: {selectedSchedule.notes}</p>
                  )}
                  {/* Progress bar */}
                  <div className="space-y-1 pt-1">
                    <div className="flex justify-between text-[9px] font-mono text-slate-400">
                      <span>Doses tomadas: {selectedSchedule.doses.filter((d) => d.taken).length} de {selectedSchedule.doses.length}</span>
                      <span>
                        {Math.round(
                          (selectedSchedule.doses.filter((d) => d.taken).length / selectedSchedule.doses.length) * 100
                        )}%
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-500 transition-all"
                        style={{
                          width: `${(selectedSchedule.doses.filter((d) => d.taken).length / selectedSchedule.doses.length) * 100}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Doses Grid / Checklist */}
                <div className="space-y-1.5 max-h-[190px] overflow-y-auto">
                  {selectedSchedule.doses.map((dose) => (
                    <div
                      key={dose.id}
                      onClick={() => onToggleDose(selectedSchedule.id, dose.id)}
                      className={`flex items-center justify-between p-2.5 rounded-lg border text-xs cursor-pointer transition-all ${
                        dose.taken
                          ? 'border-emerald-100 bg-emerald-50/10 dark:border-emerald-950/40 dark:bg-emerald-950/5 text-emerald-800 dark:text-emerald-300 opacity-80'
                          : 'border-slate-100 bg-white dark:border-slate-850 dark:bg-slate-950/80 text-slate-700 dark:text-slate-300 hover:border-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        {dose.taken ? (
                          <CheckSquare className="w-4 h-4 text-emerald-500 shrink-0" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-300 dark:text-slate-600 shrink-0" />
                        )}
                        <div>
                          <p className="font-bold">Dose {dose.number}</p>
                          <p className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            {new Date(dose.scheduledTime).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
                          </p>
                        </div>
                      </div>

                      {dose.taken && (
                        <span className="text-[9px] font-mono text-emerald-500/80 uppercase">
                          Tomado às {dose.takenAt ? new Date(dose.takenAt).toLocaleTimeString('pt-BR', { timeStyle: 'short' }) : '—'}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic text-center py-8">
                Selecione um ciclo de remédio ao lado.
              </p>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
