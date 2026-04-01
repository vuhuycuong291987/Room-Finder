import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  Linking,
  Alert,
  Platform,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";
import { useApp } from "@/context/AppContext";

const { width } = Dimensions.get("window");

export default function RoomDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { rooms, toggleFavorite, isFavorite } = useApp();
  const [imageIndex, setImageIndex] = useState(0);

  const room = rooms.find((r) => r.id === id);

  if (!room) {
    return (
      <View style={[styles.notFound, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.foreground }}>Room not found</Text>
      </View>
    );
  }

  const favorited = isFavorite(room.id);

  const handleFavorite = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    toggleFavorite(room.id);
  };

  const handleCall = () => {
    const phone = room.landlordPhone.replace(/\D/g, "");
    Linking.openURL(`tel:${phone}`).catch(() =>
      Alert.alert("Error", "Cannot open phone app.")
    );
  };

  const handleMessage = () => {
    const phone = room.landlordPhone.replace(/\D/g, "");
    Linking.openURL(`sms:${phone}`).catch(() =>
      Alert.alert("Error", "Cannot open messaging app.")
    );
  };

  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 140 + bottomPad }}
      >
        {/* Image Gallery */}
        <View style={styles.imageWrapper}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) => {
              const index = Math.round(e.nativeEvent.contentOffset.x / width);
              setImageIndex(index);
            }}
          >
            {room.images.map((img, i) => (
              <Image key={i} source={{ uri: img }} style={[styles.image, { width }]} />
            ))}
          </ScrollView>

          {room.images.length > 1 && (
            <View style={styles.dots}>
              {room.images.map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.dot,
                    {
                      backgroundColor: i === imageIndex ? colors.primaryForeground : "rgba(255,255,255,0.5)",
                      width: i === imageIndex ? 20 : 6,
                    },
                  ]}
                />
              ))}
            </View>
          )}

          {/* Back Button */}
          <TouchableOpacity
            style={[
              styles.backBtn,
              {
                top: Platform.OS === "web" ? 67 + 16 : insets.top + 16,
                backgroundColor: "rgba(0,0,0,0.4)",
              },
            ]}
            onPress={() => router.back()}
          >
            <Feather name="arrow-left" size={20} color="#fff" />
          </TouchableOpacity>

          {/* Favorite Button */}
          <TouchableOpacity
            style={[
              styles.favBtn,
              {
                top: Platform.OS === "web" ? 67 + 16 : insets.top + 16,
                backgroundColor: favorited ? colors.primary : "rgba(0,0,0,0.4)",
              },
            ]}
            onPress={handleFavorite}
          >
            <Feather name="heart" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Price & Type */}
          <View style={styles.priceRow}>
            <View>
              <Text style={[styles.price, { color: colors.primary }]}>
                ${room.price.toLocaleString()}
                <Text style={[styles.perMonth, { color: colors.mutedForeground }]}>/month</Text>
              </Text>
            </View>
            <View style={[styles.typeBadge, { backgroundColor: colors.secondary }]}>
              <Text style={[styles.typeText, { color: colors.primary }]}>
                {room.type === "room" ? "Private Room" : room.type === "studio" ? "Studio" : "Apartment"}
              </Text>
            </View>
          </View>

          {/* Title */}
          <Text style={[styles.roomTitle, { color: colors.foreground }]}>{room.title}</Text>

          {/* Location */}
          <View style={styles.locationRow}>
            <Feather name="map-pin" size={15} color={colors.primary} />
            <Text style={[styles.location, { color: colors.mutedForeground }]}>
              {room.location}, {room.city}
            </Text>
          </View>

          {/* Rating & Info */}
          <View style={styles.statsRow}>
            <StatItem icon="star" value={`${room.rating.toFixed(1)} (${room.reviewCount} reviews)`} colors={colors} />
            <StatItem icon="maximize-2" value={`${room.area} sq ft`} colors={colors} />
            <StatItem
              icon="calendar"
              value={`Available ${new Date(room.availableFrom).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`}
              colors={colors}
            />
          </View>

          {/* Quick Tags */}
          <View style={styles.tagRow}>
            {room.furnished && (
              <QuickTag label="Furnished" color={colors.primary} bg={colors.accent} />
            )}
            {room.petsAllowed && (
              <QuickTag label="Pets OK" color="#2E7D32" bg="#E8F5E9" />
            )}
            {room.smokingAllowed && (
              <QuickTag label="Smoking" color="#E65100" bg="#FFF3E0" />
            )}
            {!room.smokingAllowed && (
              <QuickTag label="No Smoking" color={colors.mutedForeground} bg={colors.muted} />
            )}
          </View>

          <Divider colors={colors} />

          {/* Description */}
          <SectionTitle title="About This Room" colors={colors} />
          <Text style={[styles.description, { color: colors.mutedForeground }]}>
            {room.description}
          </Text>

          <Divider colors={colors} />

          {/* Amenities */}
          <SectionTitle title="Amenities" colors={colors} />
          <View style={styles.amenitiesGrid}>
            {room.amenities.map((a) => (
              <View key={a} style={[styles.amenityItem, { backgroundColor: colors.muted }]}>
                <Feather name="check-circle" size={14} color={colors.primary} />
                <Text style={[styles.amenityText, { color: colors.foreground }]}>{a}</Text>
              </View>
            ))}
          </View>

          <Divider colors={colors} />

          {/* Landlord */}
          <SectionTitle title="Contact Landlord" colors={colors} />
          <View style={[styles.landlordCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
              <Text style={styles.avatarText}>
                {room.landlordName.split(" ").map((n) => n[0]).join("").slice(0, 2)}
              </Text>
            </View>
            <View style={styles.landlordInfo}>
              <Text style={[styles.landlordName, { color: colors.foreground }]}>
                {room.landlordName}
              </Text>
              <Text style={[styles.landlordPhone, { color: colors.mutedForeground }]}>
                {room.landlordPhone}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* CTA Buttons */}
      <View
        style={[
          styles.cta,
          {
            backgroundColor: colors.background,
            borderTopColor: colors.border,
            paddingBottom: Platform.OS === "web" ? 34 : insets.bottom + 16,
          },
        ]}
      >
        <TouchableOpacity
          style={[styles.msgBtn, { backgroundColor: colors.muted, borderColor: colors.border }]}
          onPress={handleMessage}
        >
          <Feather name="message-circle" size={20} color={colors.foreground} />
          <Text style={[styles.msgText, { color: colors.foreground }]}>Message</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.callBtn, { backgroundColor: colors.primary }]}
          onPress={handleCall}
        >
          <Feather name="phone" size={20} color={colors.primaryForeground} />
          <Text style={[styles.callText, { color: colors.primaryForeground }]}>Call Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function StatItem({ icon, value, colors }: { icon: string; value: string; colors: ReturnType<typeof useColors> }) {
  return (
    <View style={styles.statItem}>
      <Feather name={icon as any} size={14} color={colors.primary} />
      <Text style={[styles.statText, { color: colors.foreground }]}>{value}</Text>
    </View>
  );
}

function QuickTag({ label, color, bg }: { label: string; color: string; bg: string }) {
  return (
    <View style={[styles.quickTag, { backgroundColor: bg }]}>
      <Text style={[styles.quickTagText, { color }]}>{label}</Text>
    </View>
  );
}

function Divider({ colors }: { colors: ReturnType<typeof useColors> }) {
  return <View style={[styles.divider, { backgroundColor: colors.border }]} />;
}

function SectionTitle({ title, colors }: { title: string; colors: ReturnType<typeof useColors> }) {
  return <Text style={[styles.sectionTitle, { color: colors.foreground }]}>{title}</Text>;
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flex: 1 },
  notFound: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  imageWrapper: {
    position: "relative",
  },
  image: {
    height: 320,
    backgroundColor: "#ddd",
  },
  dots: {
    position: "absolute",
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  backBtn: {
    position: "absolute",
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  favBtn: {
    position: "absolute",
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    padding: 20,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  price: {
    fontSize: 26,
    fontWeight: "700",
  },
  perMonth: {
    fontSize: 16,
    fontWeight: "400",
  },
  typeBadge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  typeText: {
    fontSize: 13,
    fontWeight: "600",
  },
  roomTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginTop: 8,
    marginBottom: 6,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 16,
  },
  location: {
    fontSize: 14,
    flex: 1,
  },
  statsRow: {
    gap: 10,
    marginBottom: 16,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statText: {
    fontSize: 14,
    fontWeight: "500",
  },
  tagRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 4,
  },
  quickTag: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  quickTagText: {
    fontSize: 12,
    fontWeight: "600",
  },
  divider: {
    height: 1,
    marginVertical: 20,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "600",
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    lineHeight: 24,
  },
  amenitiesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  amenityItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  amenityText: {
    fontSize: 13,
    fontWeight: "500",
  },
  landlordCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  landlordInfo: {
    flex: 1,
  },
  landlordName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  landlordPhone: {
    fontSize: 14,
  },
  cta: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    gap: 12,
    padding: 16,
    paddingTop: 14,
    borderTopWidth: 1,
  },
  msgBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 52,
    borderRadius: 14,
    borderWidth: 1,
  },
  msgText: {
    fontSize: 15,
    fontWeight: "600",
  },
  callBtn: {
    flex: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 52,
    borderRadius: 14,
  },
  callText: {
    fontSize: 15,
    fontWeight: "600",
  },
});
