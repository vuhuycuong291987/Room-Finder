import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Switch,
  Platform,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { RoomFilter } from "@/types";

const PRICE_RANGES = [
  { label: "Any", min: undefined, max: undefined },
  { label: "Under $600", min: undefined, max: 600 },
  { label: "$600 - $900", min: 600, max: 900 },
  { label: "$900 - $1,200", min: 900, max: 1200 },
  { label: "$1,200+", min: 1200, max: undefined },
];

const CITIES = ["All Cities", "New York", "Brooklyn", "Manhattan", "Queens"];
const TYPES = [
  { value: undefined, label: "All Types" },
  { value: "room" as const, label: "Room" },
  { value: "studio" as const, label: "Studio" },
  { value: "apartment" as const, label: "Apartment" },
];

interface FilterSheetProps {
  visible: boolean;
  onClose: () => void;
  onApply: (filter: RoomFilter) => void;
  currentFilter: RoomFilter;
}

export function FilterSheet({ visible, onClose, onApply, currentFilter }: FilterSheetProps) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [filter, setFilter] = useState<RoomFilter>(currentFilter);
  const [priceIndex, setPriceIndex] = useState(0);

  const handleApply = () => {
    const selected = PRICE_RANGES[priceIndex];
    onApply({ ...filter, minPrice: selected.min, maxPrice: selected.max });
    onClose();
  };

  const handleReset = () => {
    setFilter({});
    setPriceIndex(0);
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { borderBottomColor: colors.border, paddingTop: Platform.OS === "web" ? 67 : insets.top + 16 }]}>
          <TouchableOpacity onPress={onClose}>
            <Feather name="x" size={24} color={colors.foreground} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>Filters</Text>
          <TouchableOpacity onPress={handleReset}>
            <Text style={[styles.resetText, { color: colors.primary }]}>Reset</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
          <Section title="Price Range" colors={colors}>
            <View style={styles.optionGrid}>
              {PRICE_RANGES.map((range, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.optionChip,
                    {
                      backgroundColor: priceIndex === index ? colors.primary : colors.muted,
                      borderColor: priceIndex === index ? colors.primary : colors.border,
                    },
                  ]}
                  onPress={() => setPriceIndex(index)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      { color: priceIndex === index ? colors.primaryForeground : colors.foreground },
                    ]}
                  >
                    {range.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Section>

          <Section title="Room Type" colors={colors}>
            <View style={styles.optionGrid}>
              {TYPES.map((type, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.optionChip,
                    {
                      backgroundColor: filter.type === type.value ? colors.primary : colors.muted,
                      borderColor: filter.type === type.value ? colors.primary : colors.border,
                    },
                  ]}
                  onPress={() => setFilter({ ...filter, type: type.value })}
                >
                  <Text
                    style={[
                      styles.chipText,
                      { color: filter.type === type.value ? colors.primaryForeground : colors.foreground },
                    ]}
                  >
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Section>

          <Section title="City" colors={colors}>
            <View style={styles.optionGrid}>
              {CITIES.map((city, index) => {
                const isSelected = index === 0 ? !filter.city : filter.city === city;
                return (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.optionChip,
                      {
                        backgroundColor: isSelected ? colors.primary : colors.muted,
                        borderColor: isSelected ? colors.primary : colors.border,
                      },
                    ]}
                    onPress={() => setFilter({ ...filter, city: index === 0 ? undefined : city })}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        { color: isSelected ? colors.primaryForeground : colors.foreground },
                      ]}
                    >
                      {city}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </Section>

          <Section title="Preferences" colors={colors}>
            <ToggleRow
              label="Furnished"
              value={!!filter.furnished}
              onChange={(v) => setFilter({ ...filter, furnished: v || undefined })}
              colors={colors}
            />
            <ToggleRow
              label="Pets Allowed"
              value={!!filter.petsAllowed}
              onChange={(v) => setFilter({ ...filter, petsAllowed: v || undefined })}
              colors={colors}
            />
          </Section>

          <View style={{ height: 120 }} />
        </ScrollView>

        <View
          style={[
            styles.footer,
            {
              backgroundColor: colors.background,
              borderTopColor: colors.border,
              paddingBottom: Platform.OS === "web" ? 34 : insets.bottom + 16,
            },
          ]}
        >
          <TouchableOpacity
            style={[styles.applyBtn, { backgroundColor: colors.primary }]}
            onPress={handleApply}
          >
            <Text style={[styles.applyText, { color: colors.primaryForeground }]}>
              Apply Filters
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

function Section({ title, children, colors }: { title: string; children: React.ReactNode; colors: ReturnType<typeof useColors> }) {
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>{title}</Text>
      {children}
    </View>
  );
}

function ToggleRow({
  label,
  value,
  onChange,
  colors,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
  colors: ReturnType<typeof useColors>;
}) {
  return (
    <View style={[styles.toggleRow, { borderBottomColor: colors.border }]}>
      <Text style={[styles.toggleLabel, { color: colors.foreground }]}>{label}</Text>
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  resetText: {
    fontSize: 15,
    fontWeight: "500",
  },
  body: {
    flex: 1,
  },
  section: {
    padding: 20,
    paddingBottom: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 14,
  },
  optionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  optionChip: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 13,
    fontWeight: "500",
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  toggleLabel: {
    fontSize: 15,
    fontWeight: "500",
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  applyBtn: {
    height: 54,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  applyText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
