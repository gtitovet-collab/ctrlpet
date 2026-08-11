import React, { useState } from 'react';
import { ReproCycle, Pet } from '../types';
import { Heart, Plus, Calendar, Flame, Eye, Trash2 } from 'lucide-react';

interface ReproductiveModuleProps {
  reproCycles: ReproCycle[];
  selectedPet: Pet | null;
  onAddReproCycle: (date: string, event: 'cio' | 'insemination' | 'cross', notes?: string) => void;
  onDeleteReproCycle: (id: string) => void;
}

export default function ReproductiveModule({
  reproCycles,
  selectedPet,
  onAddReproCycle,
  onDeleteReproCycle,
}: ReproductiveModuleProps) {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [event, setEvent] = useState<'cio' | 'insemination' | 'cross'>('cio');
  const [notes, setNotes] = useState('');
  const [showForm, setShowForm] = useState(false);

  if (!selectedPet) return null;

  // Render cycles only if the pet is female.
  if (selectedPet.gender !== 'female') {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col items-center justify-center text-center py-8" id="repro-block-male">
        <Heart className="w-10 h-10 text-slate-300 dark:text-slate-600 mb-2" />
        <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300">Ciclo Reprodutivo Indisponível</h3>
        <p className="text-[10px] text-slate-400 max-w-xs mt-1">
          O ciclo reprodutivo e monitoramento de cios são exclusivos para fêmeas. {selectedPet.name} está cadastrado como macho.
        </p>
      </div>
    );
  }

  const activeCycles = reproCycles
    .filter((c) => c.petId === selectedPet.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date) return;
    onAddReproCycle(date, event, notes || undefined);
    setNotes('');
    setShowForm(false);
  };

  const getEventName = (ev: string) => {
    switch (ev) {
      case 'cio': return 'Cio (Fervura)';
      case 'insemination': return 'Inseminação Artificial';
      case 'cross': return 'Cruza Coito Direto';
      default: return 'Evento';
    }
  };

  const getEventStyle = (ev: string) => {
    switch (ev) {
      case 'cio': return 'bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900/50';
      case 'insemination': return 'bg-sky-50 text-sky-600 border-sky-200 dark:bg-sky-950/40 dark:text-sky-400 dark:border-sky-900/50';
      case 'cross': return 'bg-pink-50 text-pink-600 border-pink-200 dark:bg-pink-950/40 dark:text-pink-400 dark:border-pink-900/50';
      default: return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  const getEventEmoji = (ev: string) => {
    switch (ev) {
      case 'cio': return '🩸';
      case 'insemination': return '🧬';
      case 'cross': return '🐾';
      default: return '📅';
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6" id="reproductive-card">
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-rose-55 dark:bg-pink-950/50 text-pink-500">
              <Heart className="w-5 h-5" />
            </span>
            <h3 className="text-lg font-bold font-display text-slate-800 dark:text-slate-200">
              Ciclo Reprodutivo / Cios
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Monitore janelas de fecundidade, inseminação artificial ou períodos de cio observados pelo tutor.
          </p>
        </div>
        <button
          id="btn-toggle-repro-form"
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs text-slate-700 dark:text-slate-200 transition-all font-bold cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 text-pink-500" /> Registro
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="p-4 border border-pink-100 dark:border-pink-950/60 bg-pink-50/20 dark:bg-pink-950/10 rounded-xl space-y-4">
          <span className="text-xs font-bold text-pink-600 dark:text-pink-400 block">Registrar Período Reprodutivo</span>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Data constatada de início</label>
              <input
                id="repro-date-input"
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-lg text-xs font-mono dark:text-slate-100 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Tipo do Evento</label>
              <select
                id="repro-event-select"
                value={event}
                onChange={(e) => setEvent(e.target.value as any)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-lg text-xs dark:text-slate-100 focus:outline-none"
              >
                <option value="cio">🩸 Início do Cio (Fase de sangramento/proestro)</option>
                <option value="cross">🐾 Cruza Direta Realizada</option>
                <option value="insemination">🧬 Inseminação Veterinária</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Notas sobre comportamento da fêmea</label>
            <input
              id="repro-notes-input"
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="ex: demonstrando carinho excessivo, aceitando contato do macho"
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
              className="px-3 py-1.5 rounded-lg bg-pink-500 hover:bg-pink-600 text-white font-bold text-xs shadow-md cursor-pointer"
            >
              Gravar Ciclo
            </button>
          </div>
        </form>
      )}

      {/* Grid of logs */}
      <div className="space-y-2">
        {activeCycles.length === 0 ? (
          <p className="text-xs text-slate-400 italic text-center py-6 bg-slate-50 dark:bg-slate-950/20 rounded-xl">
            Nenhum ciclo reprodutivo registrado.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[180px] overflow-y-auto">
            {activeCycles.map((cycle) => (
              <div
                key={cycle.id}
                className={`p-3 rounded-xl border flex flex-col justify-between hover:border-slate-300 transition-all ${getEventStyle(cycle.event)}`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{getEventEmoji(cycle.event)}</span>
                    <div>
                      <span className="text-xs font-bold block">{getEventName(cycle.event)}</span>
                      <span className="text-[9px] font-mono opacity-80 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(cycle.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => onDeleteReproCycle(cycle.id)}
                    className="text-slate-400 hover:text-rose-500 p-0.5 rounded transition-all cursor-pointer"
                    title="Remover"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                {cycle.notes && (
                  <p className="text-[10px] mt-2 italic font-sans border-t border-black/5 dark:border-white/5 pt-1.5 opacity-90">
                    “{cycle.notes}”
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
