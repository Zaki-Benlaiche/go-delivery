'use client';

import React, { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useMenuStore } from '@/store/menuStore';
import { useNotificationStore } from '@/store/notificationStore';
import type { Product } from '@/types';
import ProductFormModal, { type ProductDraft } from './ProductFormModal';

const EMPTY_DRAFT: ProductDraft = { name: '', price: '', category: 'Plats', image: '🍽️' };

// Menu management tab. Lists products as cards; add/edit go through the
// shared ProductFormModal. Delete is direct (no confirm — matches existing UX,
// can be hardened later if needed).
export default function MenuTab() {
  const products = useMenuStore((s) => s.products);
  const addProduct = useMenuStore((s) => s.addProduct);
  const updateProduct = useMenuStore((s) => s.updateProduct);
  const deleteProduct = useMenuStore((s) => s.deleteProduct);
  const addNotification = useNotificationStore((s) => s.addNotification);

  const [showAddModal, setShowAddModal] = useState(false);
  const [addDraft, setAddDraft] = useState<ProductDraft>(EMPTY_DRAFT);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editDraft, setEditDraft] = useState<ProductDraft>(EMPTY_DRAFT);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addDraft.name || !addDraft.price) return;
    await addProduct({
      name: addDraft.name,
      price: Number(addDraft.price),
      category: addDraft.category,
      image: addDraft.image,
      isAvailable: true,
    });
    setShowAddModal(false);
    setAddDraft(EMPTY_DRAFT);
  };

  const beginEdit = (product: Product) => {
    setEditingProduct(product);
    setEditDraft({
      name: product.name,
      price: String(product.price),
      category: product.category || '',
      image: product.image || '',
    });
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct || !editDraft.name || !editDraft.price) return;
    await updateProduct(editingProduct.id, {
      name: editDraft.name,
      price: Number(editDraft.price),
      category: editDraft.category,
      image: editDraft.image,
    });
    setEditingProduct(null);
    addNotification({
      type: 'info',
      title: 'Produit mis à jour',
      message: `${editDraft.name} — ${editDraft.price} DA`,
      icon: '✅',
      color: '#2ed573',
    });
  };

  return (
    <div className="fade-in">
      <div className="r-menu-header">
        <h2 className="section-title r-menu-title">Votre Menu Actuel</h2>
        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
          <Plus size={16} /> Ajouter
        </button>
      </div>

      <div className="grid grid-3">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onEdit={() => beginEdit(product)}
            onDelete={() => deleteProduct(product.id)}
          />
        ))}
        {products.length === 0 && (
          <p className="r-menu-empty">Aucun produit dans le menu.</p>
        )}
      </div>

      {editingProduct && (
        <ProductFormModal
          title="Modifier le produit"
          draft={editDraft}
          onChange={setEditDraft}
          onSubmit={handleEdit}
          onClose={() => setEditingProduct(null)}
        />
      )}

      {showAddModal && (
        <ProductFormModal
          title="Ajouter au Menu"
          draft={addDraft}
          onChange={setAddDraft}
          onSubmit={handleAdd}
          onClose={() => setShowAddModal(false)}
        />
      )}
    </div>
  );
}

function ProductCard({
  product,
  onEdit,
  onDelete,
}: {
  product: Product;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const isRemote = product.image?.startsWith('http') || product.image?.startsWith('data:');
  return (
    <div className="card r-prod-card">
      <div className="r-prod-image">
        {isRemote ? <img src={product.image} alt={product.name} /> : <span>{product.image}</span>}
      </div>
      <div className="r-prod-body">
        <div className="r-prod-row">
          <h3>{product.name}</h3>
          <span className="r-prod-price">{product.price} DA</span>
        </div>
        <span className="r-prod-category">{product.category}</span>
        <div className="r-prod-actions">
          <button className="btn btn-secondary btn-sm r-prod-edit" onClick={onEdit}>
            <Pencil size={14} /> Modifier
          </button>
          <button className="btn btn-secondary btn-sm r-prod-delete" onClick={onDelete}>
            <Trash2 size={14} /> Supprimer
          </button>
        </div>
      </div>
    </div>
  );
}
