export interface Room {
  id: string;
  title: string;
  description: string;
  price: number;
  location: string;
  city: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  amenities: string[];
  images: string[];
  landlordName: string;
  landlordPhone: string;
  landlordAvatar?: string;
  available: boolean;
  availableFrom: string;
  type: "room" | "studio" | "apartment";
  furnished: boolean;
  petsAllowed: boolean;
  smokingAllowed: boolean;
  rating: number;
  reviewCount: number;
  postedAt: string;
}

export type RoomFilter = {
  minPrice?: number;
  maxPrice?: number;
  type?: Room["type"];
  furnished?: boolean;
  petsAllowed?: boolean;
  city?: string;
  bedrooms?: number;
};
