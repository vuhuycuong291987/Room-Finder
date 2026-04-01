import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Switch,
  Alert,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";
import { useApp } from "@/context/AppContext";
import { Room } from "@/types";

const AMENITY_OPTIONS = [
  "WiFi",
  "Heating",
  "Air Conditioning",
  "Washer",
  "Dryer",
  "Dishwasher",
  "Parking",
  "Gym",
  "Garden",
  "Balcony",
  "All Utilities",
];

const ROOM_TYPES = [
  { value: "room" as const, label: "Private Room" },
  { value: "studio" as const, label: "Studio" },
  { value: "apartment" as const, label: "Apartment" },
];

export default function PostScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { addRoom } = useApp();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [location, setLocation] = useState("");
  const [city, setCity] = useState("");
  const [type, setType] = useState<Room["type"]>("room");
  const [area, setArea] = useState("");
  const [furnished, setFurnished] = useState(false);
  const [petsAllowed, setPetsAllowed] = useState(false);
  const [smokingAllowed, setSmokingAllowed] = useState(false);
  const [landlordName, setLandlordName] = useState("");
  const [landlordPhone, setLandlordPhone] = useState("");
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity) ? prev.filter((a) => a !== amenity) : [...prev, amenity]
    );
  };

  const handleSubmit = async () => {
    if (!title || !price || !location || !city || !landlordName || !landlordPhone) {
      Alert.alert("Missing Fields", "Please fill in all required fields.");
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setSubmitting(true);

    const newRoom: Room = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      title,
      description: description || "No description provided.",
      price: parseInt(price, 10),
      location,
      city,
      bedrooms: type === "room" ? 1 : type === "studio" ? 0 : 1,
      bathrooms: 1,
      area: parseInt(area, 10) || 200,
      amenities: selectedAmenities,
      images: [
        "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80",
      ],
      landlordName,
      landlordPhone,
      available: true,
      availableFrom: new Date().toISOString().split("T")[0],
      type,
      furnished,
      petsAllowed,
      smokingAllowed,
      rating: 0,
      reviewCount: 0,
      postedAt: new Date().toISOString().split("T")[0],
    };

    addRoom(newRoom);
    setSubmitting(false);

    Alert.alert(
      "Listing Posted!",
      "Your room has been published successfully.",
      [{ text: "View Listings", onPress: () => router.push("/(tabs)/") }]
    );

    setTitle("");
    setDescription("");
    setPrice("");
    setLocation("");
    setCity("");
    setArea("");
    setFurnished(false);
    setPetsAllowed(false);
    setSmokingAllowed(false);
    setLandlordName("");
    setLandlordPhone("");
    setSelectedAmenities([]);
    setType("room");
  };

  const Field = ({
    label,
    required,
    children,
  }: {
    label: string;
    required?: boolean;
    children: React.ReactNode;
  }) => (
    <View style={styles.field}>
      <Text style={[styles.fieldLabel, { color: colors.foreground }]}>
        {label}
        {required && <Text style={{ color: colors.primary }}> *</Text>}
      </Text>
      {children}
    </View>
  );

  const inputStyle = [
    styles.input,
    { backgroundColor: colors.card, borderColor: colors.border, color: colors.foreground },
  ];

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { paddingTop: topPad + 16 }]}>
          <Text style={[styles.title, { color: colors.foreground }]}>Post a Room</Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
            Fill in the details to list your room
          </Text>
        </View>

        <ScrollView
          style={styles.body}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            paddingBottom: Platform.OS === "web" ? 150 : insets.bottom + 120,
          }}
        >
          <SectionHeader title="Basic Info" colors={colors} />

          <Field label="Listing Title" required>
            <TextInput
              style={inputStyle}
              value={title}
              onChangeText={setTitle}
              placeholder="e.g. Sunny room in modern apartment"
              placeholderTextColor={colors.mutedForeground}
            />
          </Field>

          <Field label="Description">
            <TextInput
              style={[inputStyle, styles.textarea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Describe your room, the neighbourhood, house rules..."
              placeholderTextColor={colors.mutedForeground}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </Field>

          <Field label="Monthly Rent ($)" required>
            <TextInput
              style={inputStyle}
              value={price}
              onChangeText={setPrice}
              placeholder="e.g. 900"
              placeholderTextColor={colors.mutedForeground}
              keyboardType="numeric"
            />
          </Field>

          <Field label="Room Type" required>
            <View style={styles.typeRow}>
              {ROOM_TYPES.map((t) => (
                <TouchableOpacity
                  key={t.value}
                  style={[
                    styles.typeChip,
                    {
                      backgroundColor: type === t.value ? colors.primary : colors.muted,
                      borderColor: type === t.value ? colors.primary : colors.border,
                    },
                  ]}
                  onPress={() => setType(t.value)}
                >
                  <Text
                    style={[
                      styles.typeChipText,
                      { color: type === t.value ? colors.primaryForeground : colors.foreground },
                    ]}
                  >
                    {t.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Field>

          <SectionHeader title="Location" colors={colors} />

          <Field label="Full Address" required>
            <TextInput
              style={inputStyle}
              value={location}
              onChangeText={setLocation}
              placeholder="e.g. 123 Main Street, Apt 4B"
              placeholderTextColor={colors.mutedForeground}
            />
          </Field>

          <Field label="City" required>
            <TextInput
              style={inputStyle}
              value={city}
              onChangeText={setCity}
              placeholder="e.g. New York"
              placeholderTextColor={colors.mutedForeground}
            />
          </Field>

          <Field label="Room Size (sq ft)">
            <TextInput
              style={inputStyle}
              value={area}
              onChangeText={setArea}
              placeholder="e.g. 200"
              placeholderTextColor={colors.mutedForeground}
              keyboardType="numeric"
            />
          </Field>

          <SectionHeader title="Amenities" colors={colors} />
          <View style={styles.amenitiesGrid}>
            {AMENITY_OPTIONS.map((amenity) => {
              const isSelected = selectedAmenities.includes(amenity);
              return (
                <TouchableOpacity
                  key={amenity}
                  style={[
                    styles.amenityChip,
                    {
                      backgroundColor: isSelected ? colors.accent : colors.muted,
                      borderColor: isSelected ? colors.primary : colors.border,
                    },
                  ]}
                  onPress={() => toggleAmenity(amenity)}
                >
                  <Feather
                    name="check"
                    size={12}
                    color={isSelected ? colors.primary : "transparent"}
                  />
                  <Text
                    style={[
                      styles.amenityText,
                      { color: isSelected ? colors.primary : colors.mutedForeground },
                    ]}
                  >
                    {amenity}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <SectionHeader title="Rules & Preferences" colors={colors} />

          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <ToggleField
              label="Furnished"
              value={furnished}
              onChange={setFurnished}
              colors={colors}
              icon="briefcase"
            />
            <ToggleField
              label="Pets Allowed"
              value={petsAllowed}
              onChange={setPetsAllowed}
              colors={colors}
              icon="heart"
            />
            <ToggleField
              label="Smoking Allowed"
              value={smokingAllowed}
              onChange={setSmokingAllowed}
              colors={colors}
              icon="wind"
              last
            />
          </View>

          <SectionHeader title="Contact Info" colors={colors} />

          <Field label="Your Name" required>
            <TextInput
              style={inputStyle}
              value={landlordName}
              onChangeText={setLandlordName}
              placeholder="e.g. John Smith"
              placeholderTextColor={colors.mutedForeground}
            />
          </Field>

          <Field label="Phone Number" required>
            <TextInput
              style={inputStyle}
              value={landlordPhone}
              onChangeText={setLandlordPhone}
              placeholder="e.g. +1 (555) 123-4567"
              placeholderTextColor={colors.mutedForeground}
              keyboardType="phone-pad"
            />
          </Field>

          <TouchableOpacity
            style={[
              styles.submitBtn,
              { backgroundColor: submitting ? colors.muted : colors.primary },
            ]}
            onPress={handleSubmit}
            disabled={submitting}
          >
            <Feather name="upload" size={20} color={submitting ? colors.mutedForeground : colors.primaryForeground} />
            <Text
              style={[
                styles.submitText,
                { color: submitting ? colors.mutedForeground : colors.primaryForeground },
              ]}
            >
              {submitting ? "Publishing..." : "Publish Listing"}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

function SectionHeader({ title, colors }: { title: string; colors: ReturnType<typeof useColors> }) {
  return (
    <Text style={[styles.sectionHeader, { color: colors.foreground }]}>{title}</Text>
  );
}

function ToggleField({
  label,
  value,
  onChange,
  colors,
  icon,
  last,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
  colors: ReturnType<typeof useColors>;
  icon: string;
  last?: boolean;
}) {
  return (
    <View
      style={[
        styles.toggleRow,
        { borderBottomColor: colors.border },
        last && { borderBottomWidth: 0 },
      ]}
    >
      <View style={styles.toggleLeft}>
        <Feather name={icon as any} size={18} color={colors.mutedForeground} />
        <Text style={[styles.toggleLabel, { color: colors.foreground }]}>{label}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: colors.muted, true: colors.primary }}
        thumbColor="#fff"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  body: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    fontSize: 17,
    fontWeight: "600",
    marginTop: 24,
    marginBottom: 14,
  },
  field: {
    marginBottom: 14,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 8,
  },
  input: {
    height: 50,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 15,
  },
  textarea: {
    height: 100,
    paddingTop: 14,
  },
  typeRow: {
    flexDirection: "row",
    gap: 10,
  },
  typeChip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
  },
  typeChipText: {
    fontSize: 13,
    fontWeight: "500",
  },
  amenitiesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 4,
  },
  amenityChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  amenityText: {
    fontSize: 13,
    fontWeight: "500",
  },
  card: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: "hidden",
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  toggleLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  toggleLabel: {
    fontSize: 15,
    fontWeight: "500",
  },
  submitBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    height: 56,
    borderRadius: 16,
    marginTop: 32,
  },
  submitText: {
    fontSize: 17,
    fontWeight: "600",
  },
});
