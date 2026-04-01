import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Room } from "@/types";
import { SAMPLE_ROOMS } from "@/data/rooms";

interface AppContextType {
  rooms: Room[];
  favorites: string[];
  toggleFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
  addRoom: (room: Room) => void;
  myListings: string[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [rooms, setRooms] = useState<Room[]>(SAMPLE_ROOMS);
  const [myListings, setMyListings] = useState<string[]>([]);

  useEffect(() => {
    loadFavorites();
    loadMyListings();
    loadRooms();
  }, []);

  const loadFavorites = async () => {
    try {
      const stored = await AsyncStorage.getItem("favorites");
      if (stored) setFavorites(JSON.parse(stored));
    } catch {}
  };

  const loadMyListings = async () => {
    try {
      const stored = await AsyncStorage.getItem("myListings");
      if (stored) setMyListings(JSON.parse(stored));
    } catch {}
  };

  const loadRooms = async () => {
    try {
      const stored = await AsyncStorage.getItem("customRooms");
      if (stored) {
        const customRooms: Room[] = JSON.parse(stored);
        setRooms([...customRooms, ...SAMPLE_ROOMS]);
      }
    } catch {}
  };

  const toggleFavorite = async (id: string) => {
    const updated = favorites.includes(id)
      ? favorites.filter((f) => f !== id)
      : [...favorites, id];
    setFavorites(updated);
    await AsyncStorage.setItem("favorites", JSON.stringify(updated));
  };

  const isFavorite = (id: string) => favorites.includes(id);

  const addRoom = async (room: Room) => {
    const updatedRooms = [room, ...rooms];
    const customRooms = updatedRooms.filter((r) =>
      myListings.concat(room.id).includes(r.id)
    );
    setRooms(updatedRooms);
    const updatedListings = [room.id, ...myListings];
    setMyListings(updatedListings);
    await AsyncStorage.setItem("customRooms", JSON.stringify(customRooms));
    await AsyncStorage.setItem("myListings", JSON.stringify(updatedListings));
  };

  return (
    <AppContext.Provider
      value={{ rooms, favorites, toggleFavorite, isFavorite, addRoom, myListings }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
