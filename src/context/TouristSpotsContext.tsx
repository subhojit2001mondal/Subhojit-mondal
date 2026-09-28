import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  TouristSpot,
  DEFAULT_TOURIST_SPOTS,
  subscribeToTouristSpots,
  saveTouristSpotToDb,
  deleteTouristSpotFromDb,
  reorderTouristSpotsInDb,
  toggleTouristSpotVisibilityInDb,
  uploadTouristSpotPhoto
} from '../services/dbService';

interface TouristSpotsContextType {
  spots: TouristSpot[];
  visibleSpots: TouristSpot[];
  isLoading: boolean;
  addSpot: (data: {
    name: string;
    description: string;
    photoUrl?: string;
    distance?: string;
    isVisible?: boolean;
  }) => Promise<TouristSpot>;
  updateSpot: (spot: TouristSpot) => Promise<void>;
  deleteSpot: (spotId: string) => Promise<void>;
  reorderSpots: (reorderedSpots: TouristSpot[]) => Promise<void>;
  moveSpotUp: (spotId: string) => Promise<void>;
  moveSpotDown: (spotId: string) => Promise<void>;
  toggleVisibility: (spotId: string, currentVisibility: boolean) => Promise<void>;
  uploadPhoto: (file: File) => Promise<string>;
}

const TouristSpotsContext = createContext<TouristSpotsContextType | undefined>(undefined);

export const TouristSpotsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [spots, setSpots] = useState<TouristSpot[]>(DEFAULT_TOURIST_SPOTS);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsub = subscribeToTouristSpots((updatedSpots) => {
      if (updatedSpots && updatedSpots.length > 0) {
        setSpots(updatedSpots);
      }
      setIsLoading(false);
    });

    return () => unsub();
  }, []);

  const visibleSpots = spots.filter((s) => s.isVisible !== false);

  const addSpot = async (data: {
    name: string;
    description: string;
    photoUrl?: string;
    distance?: string;
    isVisible?: boolean;
  }): Promise<TouristSpot> => {
    const highestOrder = spots.reduce((max, s) => Math.max(max, s.order ?? 0), 0);
    const newId = `spot-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const newSpot: TouristSpot = {
      id: newId,
      name: data.name.trim(),
      description: data.description.trim(),
      photoUrl: data.photoUrl?.trim() || '',
      distance: data.distance?.trim() || '',
      isVisible: data.isVisible !== false,
      order: highestOrder + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await saveTouristSpotToDb(newSpot);
    return newSpot;
  };

  const updateSpot = async (spot: TouristSpot) => {
    await saveTouristSpotToDb(spot);
  };

  const deleteSpot = async (spotId: string) => {
    await deleteTouristSpotFromDb(spotId);
  };

  const reorderSpots = async (reorderedSpots: TouristSpot[]) => {
    await reorderTouristSpotsInDb(reorderedSpots);
  };

  const moveSpotUp = async (spotId: string) => {
    const index = spots.findIndex((s) => s.id === spotId);
    if (index <= 0) return; // Already at the top
    const newSpots = [...spots];
    const temp = newSpots[index];
    newSpots[index] = newSpots[index - 1];
    newSpots[index - 1] = temp;
    await reorderTouristSpotsInDb(newSpots);
  };

  const moveSpotDown = async (spotId: string) => {
    const index = spots.findIndex((s) => s.id === spotId);
    if (index < 0 || index >= spots.length - 1) return; // Already at the bottom
    const newSpots = [...spots];
    const temp = newSpots[index];
    newSpots[index] = newSpots[index + 1];
    newSpots[index + 1] = temp;
    await reorderTouristSpotsInDb(newSpots);
  };

  const toggleVisibility = async (spotId: string, currentVisibility: boolean) => {
    await toggleTouristSpotVisibilityInDb(spotId, !currentVisibility);
  };

  const uploadPhoto = async (file: File): Promise<string> => {
    return await uploadTouristSpotPhoto(file);
  };

  return (
    <TouristSpotsContext.Provider
      value={{
        spots,
        visibleSpots,
        isLoading,
        addSpot,
        updateSpot,
        deleteSpot,
        reorderSpots,
        moveSpotUp,
        moveSpotDown,
        toggleVisibility,
        uploadPhoto
      }}
    >
      {children}
    </TouristSpotsContext.Provider>
  );
};

export const useTouristSpots = (): TouristSpotsContextType => {
  const context = useContext(TouristSpotsContext);
  if (!context) {
    throw new Error('useTouristSpots must be used within a TouristSpotsProvider');
  }
  return context;
};
