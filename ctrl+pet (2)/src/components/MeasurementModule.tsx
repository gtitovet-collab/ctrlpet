import React, { useState } from 'react';
import { Measurement } from '../types';
import { Scale, Ruler, Sparkles, TrendingUp, Plus, Calendar, Trash2 } from 'lucide-react';

interface MeasurementModuleProps {
  measurements: Measurement[];
  selectedPetId: string;
  onAddMeasurement: (weight: number, height: number, date: string, notes?: string) => void;
  onDeleteMeasurement: (id: string) => void;
}

export default function MeasurementModule({
  measurements,
  selectedPetId,
  onAddMeasurement,
  onDeleteMeasurement,
}: MeasurementModuleProps) {
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [showForm, setShowForm] = useState(false);

  // Filter and sort measurements chronologically
  const activeMeasurements = measurements
    .filter((m) => m.petId === selectedPetId)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const latestMeasure = activeMeasurements[activeMeasurements.length - 1];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const w = parseFloat(weight);
    const h = parseFloat(height);
    if (!w || !h || !date) return;
    onAddMeasurement(w, h, date, notes);
    setWeight('');
    setHeight('');
    setNotes('');
    setShowForm(false);
  };

  // Generate clean SVG points for the weight chart
  const renderChart = () => {
    if (activeMeasurements.length < 2) {
      return (
        <div className="h-40 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-950/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 p-4 text-center">
          <TrendingUp className="w-8 h-8 mb-2 opacity-60 text-emerald-500" />
          <p className="text-xs font-semibold">Gráfico de Peso Contínuo</p>
          <p className="text-[10px] max-w-[200px]">Adicione pelo menos 2 registros com datas diferentes para ver o gráfico de peso.</p>
        </div>
      );
    }

    const weights = activeMeasurements.map((m) => m.weight);
    const minW = Math.min(...weights) * 0.9;
    const maxW = Math.max(...weights) * 1.1;
    const rangeW = maxW - minW || 1;

    const width = 500;
    const height = 150;
    const padding = 30;

    const points = activeMeasurements.map((m, index) => {
      const x = padding + (index / (activeMeasurements.length - 1)) * (width - padding * 2);
      const y = height - padding - ((m.weight - minW) / rangeW) * (height - padding * 2);
      return { x, y, ...m };
    });

    const pathD = points.reduce((acc, p, i) => {
      return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
    }, '');

    return (
      <div className="space-y-2">
        <div className="flex justify-between items-center text-[10px] text-slate-400 px-1">
          <span>Menor peso: {Math.min(...weights).toFixed(1)}kg</span>
          <span className="font-bold text-indigo-500 uppercase tracking-wider flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-indigo-500" /> Tendência de Crescimento
          </span>
          <span>Maior peso: {Math.max(...weights).toFixed(1)}kg</span>
        </div>
        <div className="bg-slate-50 dark:bg-slate-950/40 border border-slate-200/50 dark:border-slate-800 rounded-2xl p-3">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible">
            {/* Grid horizontal lines */}
            {[0, 0.5, 1].map((ratio, index) => {
              const y = padding + ratio * (height - padding * 2);
              const value = maxW - ratio * rangeW;
              return (
                <g key={index} className="opacity-30 dark:opacity-20">
                  <line x1={padding} y1={y} x2={width - padding} y2={y} stroke="currentColor" strokeDasharray="3,3" className="text-slate-400 dark:text-slate-500" />
                  <text x={padding - 5} y={y + 3} textAnchor="end" className="fill-slate-400 dark:fill-slate-500 text-[8px] font-mono">
                    {value.toFixed(1)}k
                  </text>
                </g>
              );
            })}

            {/* Path outline */}
            <path
              d={pathD}
              fill="none"
              stroke="url(#gradient-emerald)"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Gradient fill beneath path */}
            <path
              d={`${pathD} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`}
              fill="url(#gradient-fill)"
              opacity="0.15"
            />

            {/* Highlight dots */}
            {points.map((p, idx) => (
              <g key={p.id} className="group cursor-pointer">
                <circle
                  cx={p.x}
                  cy={p.y}
                  r="5"
                  className="fill-indigo-600 stroke-white dark:stroke-slate-900 stroke-2 hover:r-7 transition-all"
                />
                <circle
                  cx={p.x}
                  cy={p.y}
                  r="8"
                  className="fill-indigo-400 opacity-0 group-hover:opacity-30 transition-all"
                />
                {/* Micro tooltip */}
                <text
                  x={p.x}
                  y={p.y - 12}
                  textAnchor="middle"
                  className="fill-slate-800 dark:fill-slate-200 text-[9px] font-bold font-mono bg-white dark:bg-slate-800 px-1 py-0.5 rounded shadow opacity-0 group-hover:opacity-100 transition-all"
                >
                  {p.weight} kg ({new Date(p.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })})
                </text>
              </g>
            ))}

            {/* Gradients declarations */}
            <defs>
              <linearGradient id="gradient-emerald" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#4f46e5" />
                <stop offset="100%" stopColor="#6366f1" />
              </linearGradient>
              <linearGradient id="gradient-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#4f46e5" />
                <stop offset="100%" stopColor="#4f46e5" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6" id="measurement-card">
      {/* Title block */}
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-505">
              <Scale className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </span>
            <h3 className="text-sm font-bold font-display tracking-tight text-slate-900 dark:text-slate-100 uppercase">
              Peso e Medidas do Pet
            </h3>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Acompanhe o ganho e consistência de massa de forma linear e contínua.
          </p>
        </div>
        <button
          id="btn-toggle-measurement-form"
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 text-xs text-slate-700 dark:text-slate-200 transition-all font-bold cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 text-indigo-550" /> Registo
        </button>
      </div>

      {/* Grid Highlights */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Peso Último</span>
            <p className="text-xl font-bold font-display text-slate-900 dark:text-slate-100">
              {latestMeasure ? `${latestMeasure.weight.toFixed(2)} kg` : '—'}
            </p>
          </div>
          <Scale className="w-8 h-8 opacity-25 text-slate-400 dark:text-slate-500" />
        </div>

        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Altura Última</span>
            <p className="text-xl font-bold font-display text-slate-900 dark:text-slate-100">
              {latestMeasure ? `${latestMeasure.height.toFixed(0)} cm` : '—'}
            </p>
          </div>
          <Ruler className="w-8 h-8 opacity-25 text-slate-400 dark:text-slate-500" />
        </div>
      </div>

      {/* SVG Growth Chart */}
      {renderChart()}

      {/* Toggleable add form with animation */}
      {showForm && (
        <form onSubmit={handleSubmit} className="p-4 border border-emerald-100 dark:border-emerald-950/60 bg-emerald-50/20 dark:bg-emerald-950/10 rounded-xl space-y-4">
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 block">Novo Registro de Massa</span>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Peso (kg)</label>
              <div className="relative">
                <input
                  id="weight-input"
                  type="number"
                  step="0.01"
                  required
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="ex: 12.80"
                  className="w-full pl-3 pr-8 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-lg text-xs font-mono dark:text-slate-100 focus:outline-none"
                />
                <span className="absolute right-2.5 top-2 text-[10px] font-bold text-slate-400">kg</span>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Altura / Comprimento (cm)</label>
              <div className="relative">
                <input
                  id="height-input"
                  type="number"
                  step="0.5"
                  required
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  placeholder="ex: 45"
                  className="w-full pl-3 pr-8 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-lg text-xs font-mono dark:text-slate-100 focus:outline-none"
                />
                <span className="absolute right-2.5 top-2 text-[10px] font-bold text-slate-400">cm</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Data da Medição (aceita retroativa)</label>
              <div className="relative flex items-center">
                <input
                  id="measurement-date-input"
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full pl-3 pr-8 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-lg text-xs font-mono dark:text-slate-100 focus:outline-none"
                />
                <Calendar className="absolute right-2.5 w-4 h-4 text-slate-400" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Notas adicionais (opcional)</label>
              <input
                id="measurement-notes-input"
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Exemplo: pós-tosa, jejum"
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
              className="px-3 py-1.5 rounded-lg bg-emerald-500 text-white font-bold text-xs hover:bg-emerald-600 shadow-md shadow-emerald-550/10 cursor-pointer"
            >
              Salvar Entrada
            </button>
          </div>
        </form>
      )}

      {/* Archive Logs list of measurements */}
      <div className="space-y-2">
        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Histórico Cronológico</span>
        
        {activeMeasurements.length === 0 ? (
          <p className="text-xs text-slate-400 italic text-center py-4 bg-slate-50 dark:bg-slate-950/20 rounded-xl">
            Nenhuma medição cadastrada.
          </p>
        ) : (
          <div className="space-y-1.5 max-h-[160px] overflow-y-auto">
            {activeMeasurements.map((m) => (
              <div
                key={m.id}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-850 hover:border-slate-200 transition-all"
              >
                <div className="flex items-center gap-3">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <div>
                    <span className="text-[11px] font-bold font-mono text-slate-700 dark:text-slate-300">
                      {new Date(m.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                    </span>
                    {m.notes && <p className="text-[10px] text-slate-400 font-sans italic">{m.notes}</p>}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-xs font-bold font-mono text-slate-800 dark:text-slate-200">
                    {m.weight.toFixed(2)} kg
                  </span>
                  <span className="text-[10px] font-bold font-mono text-slate-400 dark:text-slate-500">
                    {m.height} cm
                  </span>
                  <button
                    onClick={() => onDeleteMeasurement(m.id)}
                    className="text-slate-400 hover:text-rose-500 p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-all cursor-pointer"
                    title="Excluir medição"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
