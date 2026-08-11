import React, { useState } from 'react';
import { RoutineActivity } from '../types';
import { Sparkles, Plus, CheckCircle, Calendar, Trash2, Soup, Trash, Key } from 'lucide-react';

interface RoutineModuleProps {
  routines: RoutineActivity[];
  selectedPetId: string;
  onAddRoutine: (title: string, frequencyDays: number, category: 'cleaning' | 'litter' | 'food', notes?: string) => void;
  onBumpRoutine: (id: string) => void;
  onDeleteRoutine: (id: string) => void;
}

export default function RoutineModule({
  routines,
  selectedPetId,
  onAddRoutine,
  onBumpRoutine,
  onDeleteRoutine,
}: RoutineModuleProps) {
  const [title, setTitle] = useState('');
  const [frequencyDays, setFrequencyDays] = useState('7');
  const [category, setCategory] = useState<'cleaning' | 'litter' | 'food'>('cleaning');
  const [notes, setNotes] = useState('');
  const [showForm, setShowForm] = useState(false);

  const petRoutines = routines.filter((r) => r.petId === selectedPetId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const days = parseInt(frequencyDays);
    if (!title || isNaN(days)) return;
    onAddRoutine(title, days, category, notes || undefined);
    setTitle('');
    setNotes('');
    setShowForm(false);
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'cleaning': return '🧼';
      case 'litter': return '🐈‍⬛';
      case 'food': return '🍲';
      default: return '📅';
    }
  };

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'cleaning': return 'border-emerald-100 dark:border-emerald-950 bg-emerald-50/10 dark:bg-emerald-950/10 text-emerald-800 dark:text-emerald-300';
      case 'litter': return 'border-amber-100 dark:border-amber-950 bg-amber-50/10 dark:bg-amber-950/10 text-amber-800 dark:text-amber-300';
      case 'food': return 'border-orange-100 dark:border-orange-950 bg-orange-50/10 dark:bg-orange-950/10 text-orange-850 dark:text-orange-300';
      default: return 'border-slate-100 bg-slate-50 text-slate-700';
    }
  };

  // Calculate next inspection due date
  const getNextDueDate = (r: RoutineActivity) => {
    const last = new Date(r.lastDone);
    const next = new Date(last.getTime() + r.frequencyDays * 24 * 60 * 60 * 1000);
    return next;
  };

  const isOverdue = (r: RoutineActivity) => {
    const next = getNextDueDate(r);
    const now = new Date();
    return next.getTime() < now.getTime();
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6" id="routine-card">
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600">
              <Sparkles className="w-5 h-5" />
            </span>
            <h3 className="text-lg font-bold font-display text-slate-800 dark:text-slate-200">
              Rotina & Higiene Escalar
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Controle a desinfecção de caixas de areia, pertences e trocas de ração do tutor.
          </p>
        </div>
        <button
          id="btn-toggle-routine-form"
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs text-slate-700 dark:text-slate-200 transition-all font-bold cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 text-emerald-500" /> Rotina
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="p-4 border border-emerald-100 dark:border-emerald-950/40 bg-emerald-50/20 dark:bg-emerald-950/10 rounded-xl space-y-4">
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 block">Configurar Atividade Preventiva</span>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Categoria</label>
              <select
                id="routine-category-select"
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-lg text-xs dark:text-slate-100 focus:outline-none"
              >
                <option value="cleaning">🧼 Limpeza Geral / Brinquedos</option>
                <option value="litter">🐈‍⬛ Caixa de Areia / Veterinária</option>
                <option value="food">🍲 Ração / Alimentação Específica</option>
              </select>
            </div>

            <div className="space-y-1 md:col-span-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Título da atividade</label>
              <input
                id="routine-title-input"
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="ex: Higienizar bebedouro de inox, Troca total do substrato"
                className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-lg text-xs dark:text-slate-100 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Frequência (Dias)</label>
              <input
                id="routine-frequency-input"
                type="number"
                required
                min="1"
                value={frequencyDays}
                onChange={(e) => setFrequencyDays(e.target.value)}
                placeholder="Exemplo: a cada 7 dias"
                className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-lg text-xs font-mono dark:text-slate-100 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Especificações do produto (opcional)</label>
              <input
                id="routine-notes-input"
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="ex: Usar desinfetante herbal vet s/ perfume"
                className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-lg text-xs dark:text-slate-100 focus:outline-none"
              />
            </div>
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
              className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-md cursor-pointer"
            >
              Adicionar Rotina
            </button>
          </div>
        </form>
      )}

      {/* Routine Activities list */}
      <div className="space-y-2.5">
        {petRoutines.length === 0 ? (
          <p className="text-xs text-slate-400 italic text-center py-6 bg-slate-50 dark:bg-slate-950/20 rounded-xl">
            Nenhuma rotina de higiene configurada.
          </p>
        ) : (
          <div className="space-y-2 max-h-[220px] overflow-y-auto">
            {petRoutines.map((r) => {
              const due = getNextDueDate(r);
              const overdue = isOverdue(r);
              return (
                <div
                  key={r.id}
                  className={`p-3 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-3 hover:border-slate-250 transition-all ${getCategoryColor(r.category)}`}
                  id={`routine-row-${r.id}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl shrink-0">{getCategoryIcon(r.category)}</span>
                    <div>
                      <h4 className="text-xs font-bold leading-tight">{r.title}</h4>
                      <p className="text-[10px] opacity-80 font-mono mt-0.5">
                        Frequência: de {r.frequencyDays} em {r.frequencyDays} dias • Último feito: {new Date(r.lastDone).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                      </p>
                      {r.notes && <p className="text-[10px] italic opacity-75 mt-0.5">📝 {r.notes}</p>}
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-3 border-t md:border-t-0 border-black/5 dark:border-white/5 pt-2 md:pt-0">
                    <span className={`text-[9px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                      overdue ? 'bg-rose-500 text-white animate-pulse' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-450'
                    }`}>
                      {overdue ? '⚠️ Atrasado' : `Próximo: ${due.toLocaleDateString('pt-BR', { timeZone: 'UTC' })}`}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => onBumpRoutine(r.id)}
                        className="text-[10px] font-bold px-2 px-2.5 py-1 bg-white hover:bg-slate-50 text-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800 dark:text-slate-200 rounded-lg border border-black/10 transition-all flex items-center gap-1 cursor-pointer"
                        title="Marcar como feito agora"
                      >
                        <CheckCircle className="w-3 h-3 text-emerald-500" /> Feito
                      </button>

                      <button
                        onClick={() => onDeleteRoutine(r.id)}
                        className="text-slate-400 hover:text-rose-500 p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-all cursor-pointer"
                        title="Remover"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
