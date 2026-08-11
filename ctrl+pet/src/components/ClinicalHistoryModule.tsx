import React, { useState } from 'react';
import { ClinicalLog } from '../types';
import { Stethoscope, Plus, Calendar, Filter, Trash2, HeartPulse, Activity } from 'lucide-react';

interface ClinicalHistoryModuleProps {
  logs: ClinicalLog[];
  selectedPetId: string;
  onAddLog: (type: 'consultation' | 'surgery' | 'hospitalization' | 'allergy' | 'behavior', title: string, date: string, notes: string, diagnostics?: string) => void;
  onDeleteLog: (id: string) => void;
}

export default function ClinicalHistoryModule({
  logs,
  selectedPetId,
  onAddLog,
  onDeleteLog,
}: ClinicalHistoryModuleProps) {
  const [logType, setLogType] = useState<'consultation' | 'surgery' | 'hospitalization' | 'allergy' | 'behavior'>('consultation');
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [diagnostics, setDiagnostics] = useState('');
  const [showForm, setShowForm] = useState(false);
  
  // Tab-based filtration: 'all' | 'surgery' | 'hospitalization' | 'allergy' | 'behavior'
  const [activeFilter, setActiveFilter] = useState<'all' | 'consultation' | 'surgery' | 'hospitalization' | 'allergy' | 'behavior'>('all');

  const petLogs = logs.filter((l) => l.petId === selectedPetId);
  const filteredLogs = petLogs.filter((l) => activeFilter === 'all' || l.type === activeFilter);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !date || !notes) return;
    onAddLog(logType, title, date, notes, diagnostics || undefined);
    setTitle('');
    setNotes('');
    setDiagnostics('');
    setShowForm(false);
  };

  const getEmojiIcon = (type: string) => {
    switch (type) {
      case 'consultation': return '🩺';
      case 'surgery': return '✂️';
      case 'hospitalization': return '🏥';
      case 'allergy': return '🚨';
      case 'behavior': return '🧠';
      default: return '📝';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'consultation': return 'Consulta';
      case 'surgery': return 'Cirurgia';
      case 'hospitalization': return 'Internação';
      case 'allergy': return 'Alergia';
      case 'behavior': return 'Diário de Comportamento';
      default: return 'Histórico';
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6" id="clinical-history-card">
      {/* Title */}
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-505 flex items-center justify-center">
              <HeartPulse className="w-5 h-5 animate-pulse text-indigo-600 dark:text-indigo-400" />
            </span>
            <h3 className="text-sm font-bold font-display tracking-tight text-slate-900 dark:text-slate-100 uppercase">
              Histórico Clínico Expandido
            </h3>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Acompanhe cirurgias, internações, alergias e observe sintomas de apatia ou comportamento.
          </p>
        </div>
        <button
          id="btn-toggle-clinical-form"
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 text-xs text-slate-700 dark:text-slate-200 transition-all font-bold cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 text-indigo-550" /> Registro
        </button>
      </div>

      {/* Interactive horizontal tabs (Filtro por categorias) */}
      <div className="flex flex-wrap gap-1.5 border-b border-slate-150 dark:border-slate-800 pb-3" id="clinical-category-tabs">
        {[
          { key: 'all', label: 'Todos os registros' },
          { key: 'allergy', label: '⚠️ Alergias' },
          { key: 'surgery', label: '✂️ Cirurgias' },
          { key: 'hospitalization', label: '🏥 Internações' },
          { key: 'behavior', label: '🧠 Diário de Comportamento' },
          { key: 'consultation', label: '🩺 Consultas' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveFilter(tab.key as any)}
            className={`px-3 py-1.5 rounded-lg text-xs transition-all font-semibold cursor-pointer ${
              activeFilter === tab.key
                ? 'bg-indigo-600 text-white font-bold'
                : 'text-slate-505 hover:text-slate-705 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Register form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="p-4 border border-rose-100 dark:border-rose-950/60 bg-rose-50/20 dark:bg-rose-950/10 rounded-xl space-y-4">
          <span className="text-xs font-bold text-rose-600 dark:text-rose-400 block">Adicionar Diagnóstico ou Sintoma</span>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Categoria</label>
              <select
                id="clinical-type-select"
                value={logType}
                onChange={(e) => setLogType(e.target.value as any)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-lg text-xs dark:text-slate-100 focus:outline-none"
              >
                <option value="consultation">🩺 Consulta Geral</option>
                <option value="surgery">✂️ Cirurgia / Procedimento</option>
                <option value="hospitalization">🏥 Internação / Soro</option>
                <option value="allergy">⚠️ Alergia grave</option>
                <option value="behavior">🧠 Diário de Comportamento (vômitos/apatia)</option>
              </select>
            </div>

            <div className="space-y-1 md:col-span-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Título ou descrição sumária</label>
              <input
                id="clinical-title-input"
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="ex: Cirurgia de Castração, Reação a picada de abelha, Episódio de vômitos"
                className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-lg text-xs dark:text-slate-100 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Data da ocorrência</label>
              <input
                id="clinical-date-input"
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-lg text-xs font-mono dark:text-slate-100 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Diagnóstico oficial / Prescrição Veterinária (opcional)</label>
              <input
                id="clinical-diagnostics-input"
                type="text"
                value={diagnostics}
                onChange={(e) => setDiagnostics(e.target.value)}
                placeholder="Laudo, medicamentos recomendados para casa"
                className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-lg text-xs dark:text-slate-100 focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Relatório descritivo livre (Sintomas, observações do tutor)</label>
            <textarea
              id="clinical-notes-textarea"
              required
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Descreva minuciosamente o que houve, dosagem de remédios, tempo de febre, alteração na caipira..."
              className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-lg text-xs dark:text-slate-100 focus:outline-none resize-none"
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
              className="px-3 py-1.5 rounded-lg bg-rose-500 text-white font-bold text-xs hover:bg-rose-600 shadow-md shadow-rose-550/10 cursor-pointer"
            >
              Gravar Entrada
            </button>
          </div>
        </form>
      )}

      {/* Logs timeline list container */}
      <div className="space-y-3">
        {filteredLogs.length === 0 ? (
          <p className="text-xs text-slate-400 italic text-center py-8 bg-slate-50 dark:bg-slate-950/20 rounded-2xl">
            Nenhum evento clínico cadastrado para o filtro selecionado.
          </p>
        ) : (
          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
            {filteredLogs.map((log) => (
              <div
                key={log.id}
                className="p-4 rounded-xl border border-slate-150 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-950/40 hover:border-slate-200 dark:hover:border-slate-800 transition-all space-y-2 relative group"
                id={`clinical-log-node-${log.id}`}
              >
                {/* Delete overlay button */}
                <button
                  onClick={() => onDeleteLog(log.id)}
                  className="absolute top-3 right-3 text-slate-400 hover:text-rose-500 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  title="Excluir entrada"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>

                {/* Metadata */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm">{getEmojiIcon(log.type)}</span>
                  <span className="text-[10px] font-extrabold uppercase bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 px-2 py-0.5 rounded">
                    {getTypeLabel(log.type)}
                  </span>
                  <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(log.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                  </span>
                </div>

                {/* Content info */}
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">{log.title}</h4>
                  <p className="text-[11px] text-slate-650 dark:text-slate-300 leading-relaxed font-sans">
                    {log.notes}
                  </p>
                </div>

                {log.diagnostics && (
                  <div className="text-[10px] border-t border-slate-100 dark:border-slate-800/60 pt-2 flex gap-1 items-start text-emerald-600 dark:text-emerald-400 leading-snug">
                    <Activity className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    <span><strong>Tratamento / Diagnóstico:</strong> {log.diagnostics}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
