import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Room } from "@/types";
import { useColors } from "@/hooks/useColors";
import { useApp } from "@/context/AppContext";

const { width } = Dimensions.get("window");

interface RoomCardProps {
  room: Room;
  onPress: () => void;
  horizontal?: boolean;
}

export function RoomCard({ room, onPress, horizontal }: RoomCardProps) {
  const colors = useColors();
  const { toggleFavorite, isFavorite } = useApp();

  const handleFavorite = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    toggleFavorite(room.id);
  };

  const cardWidth = horizontal ? width - 40 : (width - 52) / 2;

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, width: cardWidth }]}
    >
      <View style={styles.imageContainer}>
        <Image source={{ uri: room.images[0] }} style={styles.image} />
        <TouchableOpacity
          style={[styles.favoriteBtn, { backgroundColor: "rgba(255,255,255,0.9)" }]}
          onPress={handleFavorite}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Feather
            name="heart"
            size={16}
            color={isFavorite(room.id) ? "#E8735A" : "#888"}
            style={isFavorite(room.id) ? { opacity: 1 } : { opacity: 0.8 }}
          />
        </TouchableOpacity>
        <View style={[styles.typeBadge, { backgroundColor: colors.primary }]}>
          <Text style={[styles.typeText, { color: colors.primaryForeground }]}>
            {room.type === "room" ? "Room" : room.type === "studio" ? "Studio" : "Apt"}
          </Text>
        </View>
      </View>

      <View style={styles.info}>
        <Text style={[styles.price, { color: colors.primary }]}>
          ${room.price.toLocaleString()}
          <Text style={[styles.perMonth, { color: colors.mutedForeground }]}>/mo</Text>
        </Text>
        <Text style={[styles.title, { color: colors.foreground }]} numberOfLines={1}>
          {room.title}
        </Text>
        <View style={styles.locationRow}>
          <Feather name="map-pin" size={11} color={colors.mutedForeground} />
          <Text style={[styles.location, { color: colors.mutedForeground }]} numberOfLines={1}>
            {room.city}
          </Text>
        </View>
        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Feather name="star" size={11} color={colors.star} />
            <Text style={[styles.metaText, { color: colors.foreground }]}>
              {room.rating.toFixed(1)}
            </Text>
          </View>
          {room.furnished && (
            <View style={[styles.tag, { backgroundColor: colors.accent }]}>
              <Text style={[styles.tagText, { color: colors.primary }]}>Furnished</Text>
            </View>
          )}
          {room.petsAllowed && (
            <View style={[styles.tag, { backgroundColor: "#E8F5E9" }]}>
              <Text style={[styles.tagText, { color: "#2E7D32" }]}>Pets OK</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    marginBottom: 12,
  },
  imageContainer: {
    position: "relative",
  },
  image: {
    width: "100%",
    height: 150,
    backgroundColor: "#e0e0e0",
  },
  favoriteBtn: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  typeBadge: {
    position: "absolute",
    bottom: 10,
    left: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  typeText: {
    fontSize: 11,
    fontWeight: "600",
  },
  info: {
    padding: 12,
    gap: 4,
  },
  price: {
    fontSize: 18,
    fontWeight: "700",
  },
  perMonth: {
    fontSize: 13,
    fontWeight: "400",
  },
  title: {
    fontSize: 14,
    fontWeight: "500",
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  location: {
    fontSize: 12,
    flex: 1,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexWrap: "wrap",
    marginTop: 2,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  metaText: {
    fontSize: 12,
    fontWeight: "500",
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  tagText: {
    fontSize: 10,
    fontWeight: "600",
  },
});
