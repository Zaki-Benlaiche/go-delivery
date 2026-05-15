'use client';

import React from 'react';
import { Upload } from 'lucide-react';

export interface ProductDraft {
  name: string;
  price: string;
  category: string;
  image: string;
}

interface ProductFormModalProps {
  title: string;
  draft: ProductDraft;
  onChange: (draft: ProductDraft) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
}

// Shared Add/Edit product modal. Replaces two near-identical fixed-overlay
// modals that lived inside RestaurantDashboard. Image input accepts an emoji,
// a remote URL, or a local file (read as a data URL via FileReader).
export default function ProductFormModal({ title, draft, onChange, onSubmit, onClose }: ProductFormModalProps) {
  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => onChange({ ...draft, image: reader.result as string });
    reader.readAsDataURL(file);
  };

  const isRemote = draft.image.startsWith('http') || draft.image.startsWith('data:');

  return (
    <div className="rd-modal-overlay">
      <div className="card fade-in rd-modal">
        <h2 className="rd-modal-title">{title}</h2>
        <form onSubmit={onSubmit} className="rd-modal-form">
          <div className="form-group rd-modal-field">
            <label>Nom du produit</label>
            <input
              type="text"
              required
              placeholder="ex: Pizza Margherita"
              value={draft.name}
              onChange={(e) => onChange({ ...draft, name: e.target.value })}
            />
          </div>
          <div className="rd-modal-row">
            <div className="form-group rd-modal-field">
              <label>Prix (DA)</label>
              <input
                type="number"
                required
                min={0}
                placeholder="ex: 800"
                value={draft.price}
                onChange={(e) => onChange({ ...draft, price: e.target.value })}
              />
            </div>
            <div className="form-group rd-modal-field">
              <label>Catégorie</label>
              <input
                type="text"
                placeholder="ex: Plats"
                value={draft.category}
                onChange={(e) => onChange({ ...draft, category: e.target.value })}
              />
            </div>
          </div>
          <div className="form-group rd-modal-field">
            <label>Image (Fichier ou URL)</label>
            <div className="rd-modal-image-row">
              <input
                type="text"
                placeholder="URL ou Emoji"
                value={draft.image}
                onChange={(e) => onChange({ ...draft, image: e.target.value })}
              />
              <label className="btn btn-secondary btn-sm rd-modal-upload">
                <Upload size={14} />
                <input type="file" hidden accept="image/*" onChange={onFile} />
              </label>
            </div>
            {draft.image && (
              <div className="rd-modal-preview">
                {isRemote ? (
                  <img src={draft.image} alt="" />
                ) : (
                  <span>{draft.image}</span>
                )}
              </div>
            )}
          </div>
          <div className="rd-modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Annuler
            </button>
            <button type="submit" className="btn btn-primary">
              Enregistrer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
