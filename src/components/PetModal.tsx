import React, { useState } from 'react';
import { Pet } from '../types';
import { X, Camera, Info, Sparkles } from 'lucide-react';

interface PetModalProps {
  onClose: () => void;
  onSave: (pet: Partial<Pet>) => void;
  editingPet?: Pet | null;
}

export default function PetModal({ onClose, onSave, editingPet }: PetModalProps) {
  const [name, setName] = useState(editingPet?.name || '');
  const [species, setSpecies] = useState<'dog' | 'cat' | 'other'>(editingPet?.species || 'dog');
  const [breed, setBreed] = useState(editingPet?.breed || '');
  const [gender, setGender] = useState<'male' | 'female'>(editingPet?.gender || 'male');
  const [birthDate, setBirthDate] = useState(editingPet?.birthDate || '');
  const [adoptionDate, setAdoptionDate] = useState(editingPet?.adoptionDate || '');
  const [microchip, setMicrochip] = useState(editingPet?.microchip || '');
  const [rga, setRga] = useState(editingPet?.rga || '');
  const [photo, setPhoto] = useState(editingPet?.photo || '');
  const [imageError, setImageError] = useState('');
  const [formError, setFormError] = useState('');

  // Local storage picture loader (Base64 is 100% resilient and cache-friendly offline)
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 800000) {
      setImageError('A imagem é muito pesada (máximo sugerido: 800KB para garantir excelente cache local).');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPhoto(reader.result as string);
      setImageError('');
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    if (file.size > 800000) {
      setImageError('A imagem é muito pesada (máximo sugerido: 800KB para excelente cache local).');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPhoto(reader.result as string);
      setImageError('');
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) {
      setFormError('Por favor, informe o nome do pet.');
      return;
    }
    if (!birthDate && !adoptionDate) {
      setFormError('Você deve preencher a Data de Nascimento OU a Data de Adoção para cadastrar o pet.');
      return;
    }

    setFormError('');

    onSave({
      id: editingPet?.id,
      name,
      species,
      breed,
      gender,
      birthDate: birthDate || undefined,
      adoptionDate: adoptionDate || undefined,
      microchip: microchip || undefined,
      rga: rga || undefined,
      photo: photo || undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header toolbar */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <h3 className="text-lg font-bold font-display text-slate-800 dark:text-slate-200">
            {editingPet ? `Editar perfil de ${editingPet.name}` : 'Cadastrar Novo Pet'}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-800 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable form body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto flex-1 text-xs">
          {/* Picture Loader Drag and Drop */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Imagem de Perfil do Pet (Cache Persistente)</span>
            <div
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className="relative border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-emerald-500 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 transition-all cursor-pointer bg-slate-50/50 dark:bg-slate-950/20"
            >
              {photo ? (
                <div className="relative group w-24 h-24 rounded-full overflow-hidden border-2 border-slate-200 dark:border-slate-800">
                  <img src={photo} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="w-5 h-5 text-white" />
                  </div>
                </div>
              ) : (
                <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-850 flex items-center justify-center text-slate-400">
                  <Camera className="w-7 h-7" />
                </div>
              )}
              <div className="text-center">
                <p className="font-bold text-slate-650 dark:text-slate-350">Arrastar imagem ou clicar para escolher arquivo</p>
                <p className="text-[10px] text-slate-400 mt-1">Formato JPG, PNG ou SVG • Máx, 800KB</p>
              </div>
              <input
                id="pet-avatar-hidden-input"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </div>
            {imageError && (
              <p className="text-[10px] font-bold text-rose-500 bg-rose-50 dark:bg-rose-950/20 p-2 rounded-lg">
                {imageError}
              </p>
            )}
          </div>

          {/* Dual Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Qual o Nome do Pet?</label>
              <input
                id="pet-name-modal-input"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="ex: Pipoca, Rex"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-lg text-xs dark:text-slate-100 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Espécie</label>
                <select
                  id="pet-species-select"
                  value={species}
                  onChange={(e) => setSpecies(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-lg text-xs dark:text-slate-100 focus:outline-none"
                >
                  <option value="dog">🐶 Cão</option>
                  <option value="cat">🐱 Gato</option>
                  <option value="other">🐾 Outro animal</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Gênero</label>
                <select
                  id="pet-gender-select"
                  value={gender}
                  onChange={(e) => setGender(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-lg text-xs dark:text-slate-100 focus:outline-none"
                >
                  <option value="male">Macho ♂</option>
                  <option value="female">Fêmea ♀</option>
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Raça (ou SRD)</label>
              <input
                id="pet-breed-modal-input"
                type="text"
                value={breed}
                onChange={(e) => setBreed(e.target.value)}
                placeholder="ex: Golden Retriever, Sardo"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-lg text-xs dark:text-slate-100 focus:outline-none"
              />
            </div>

            {/* Birth Date (Crucial timezone alignment) */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Data de Nascimento (Opcional)</label>
              <input
                id="pet-birthdate-modal-input"
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-lg text-xs font-mono dark:text-slate-100 focus:outline-none"
              />
            </div>
          </div>

          {/* Resgate and Biolocals info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-slate-100 dark:border-slate-800/60 pt-4">
            {/* Adoption Date */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                <span>🗓️ Data de Adoção</span>
              </label>
              <input
                id="pet-adoption-modal-input"
                type="date"
                value={adoptionDate}
                onChange={(e) => setAdoptionDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-lg text-xs font-mono dark:text-slate-100 focus:outline-none"
              />
            </div>

            {/* Microchip */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Nº Serial Microchip</label>
              <input
                id="pet-microchip-modal-input"
                type="text"
                value={microchip}
                onChange={(e) => setMicrochip(e.target.value)}
                placeholder="Opcional"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-lg text-xs font-mono dark:text-slate-100 focus:outline-none"
              />
            </div>

            {/* RGA Registation */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Registro Geral Animal (RGA)</label>
              <input
                id="pet-rga-modal-input"
                type="text"
                value={rga}
                onChange={(e) => setRga(e.target.value)}
                placeholder="RGA Municipal"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-lg text-xs font-mono dark:text-slate-100 focus:outline-none"
              />
            </div>
          </div>

          {formError && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/50 rounded-xl text-[11px] font-bold text-rose-600 dark:text-rose-400">
              ⚠️ {formError}
            </div>
          )}

          {/* Tips bio */}
          <div className="p-3.5 bg-sky-50 dark:bg-sky-950/20 border border-sky-100 dark:border-sky-900/50 rounded-xl text-[11px] text-slate-650 dark:text-slate-350 flex gap-2">
            <Info className="w-4 h-4 text-sky-500 shrink-0 mt-0.5" />
            <p>
              A data de nascimento ajuda o <strong>Ctrl+Pet</strong> a alertar se a dosagem recomendada pelo seu veterinário está condizente com a idade e ciclo de vacinas pediátricas ou geriátricas.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold shadow-md shadow-emerald-505/10 flex items-center gap-1 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" /> Salvar Pet
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
