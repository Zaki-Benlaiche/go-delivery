'use client';

import React, { useEffect, useState } from 'react';
import { Upload } from 'lucide-react';
import { useMenuStore } from '@/store/menuStore';
import { useNotificationStore } from '@/store/notificationStore';

// Restaurant profile editor (logo, name, address, description). Image input
// accepts URL, emoji, or local file → data URL.
export default function SettingsTab() {
  const restaurant = useMenuStore((s) => s.restaurant);
  const updateRestaurant = useMenuStore((s) => s.updateRestaurant);
  const addNotification = useNotificationStore((s) => s.addNotification);

  const [settingsImage, setSettingsImage] = useState('');

  // Hydrate the image field once the restaurant data lands.
  useEffect(() => {
    if (restaurant) setSettingsImage(restaurant.image || '');
  }, [restaurant]);

  if (!restaurant) return null;

  const isImageRemote = restaurant.image && (restaurant.image.startsWith('http') || restaurant.image.startsWith('data:'));
  const isDraftRemote = settingsImage && (settingsImage.startsWith('http') || settingsImage.startsWith('data:'));

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setSettingsImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    await updateRestaurant({
      name: (form.elements.namedItem('name') as HTMLInputElement).value,
      description: (form.elements.namedItem('description') as HTMLTextAreaElement).value,
      address: (form.elements.namedItem('address') as HTMLInputElement).value,
      image: settingsImage,
    });
    addNotification({
      type: 'info',
      title: 'Profil mis à jour',
      message: 'Les informations du restaurant ont été enregistrées.',
      icon: '✅',
      color: '#2ed573',
    });
  };

  return (
    <div className="fade-in r-settings">
      <div className="r-settings-shell">
        <div className="card r-settings-card">
          <div className="r-settings-hero">
            {isImageRemote && <img src={restaurant.image} alt="" className="r-settings-hero-img" />}
            <div className="r-settings-hero-row">
              <div className="r-settings-avatar">
                {isImageRemote ? <img src={restaurant.image} alt="" /> : <span>{restaurant.image || '🏪'}</span>}
              </div>
              <div className="r-settings-hero-text">
                <h2>{restaurant.name}</h2>
                <p>{restaurant.category || 'Restaurant Partner'}</p>
              </div>
            </div>
          </div>

          <form onSubmit={onSubmit} className="r-settings-form">
            <div className="r-settings-field r-settings-field-full">
              <label>Logo / Photo</label>
              <div className="r-settings-image-row">
                <input
                  type="text"
                  className="input r-settings-image-input"
                  value={settingsImage}
                  onChange={(e) => setSettingsImage(e.target.value)}
                  placeholder="Lien URL ou Base64..."
                />
                <label className="btn btn-secondary r-settings-upload">
                  <Upload size={16} /> Téléverser
                  <input type="file" hidden accept="image/*" onChange={onFile} />
                </label>
              </div>
              {settingsImage && (
                <div className="r-settings-preview">
                  {isDraftRemote ? <img src={settingsImage} alt="" /> : <span>{settingsImage}</span>}
                </div>
              )}
            </div>

            <div className="r-settings-field">
              <label>Nom</label>
              <input name="name" type="text" className="input" defaultValue={restaurant.name} required />
            </div>

            <div className="r-settings-field">
              <label>Adresse</label>
              <input name="address" type="text" className="input" defaultValue={restaurant.address} />
            </div>

            <div className="r-settings-field r-settings-field-full">
              <label>Description</label>
              <textarea name="description" className="input" defaultValue={restaurant.description} rows={3} />
            </div>

            <div className="r-settings-field-full r-settings-actions">
              <button type="submit" className="btn btn-primary btn-block r-settings-submit">
                Mettre à jour
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
