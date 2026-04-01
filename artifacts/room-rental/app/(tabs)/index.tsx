import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useApp } from "@/context/AppContext";
import { RoomCard } from "@/components/RoomCard";
import { FilterSheet } from "@/components/FilterSheet";
import { RoomFilter } from "@/types";

const SORT_OPTIONS = ["Newest", "Price: Low", "Price: High", "Rating"];

export default function BrowseScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { rooms } = useApp();

  const [search, setSearch] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const [filter, setFilter] = useState<RoomFilter>({});
  const [sortIndex, setSortIndex] = useState(0);
  const [gridMode, setGridMode] = useState(false);

  const filteredRooms = useMemo(() => {
    let result = rooms.filter((r) => {
      if (search) {
        const q = search.toLowerCase();
        if (
          !r.title.toLowerCase().includes(q) &&
          !r.city.toLowerCase().includes(q) &&
          !r.location.toLowerCase().includes(q)
        )
          return false;
      }
      if (filter.minPrice && r.price < filter.minPrice) return false;
      if (filter.maxPrice && r.price > filter.maxPrice) return false;
      if (filter.type && r.type !== filter.type) return false;
      if (filter.furnished && !r.furnished) return false;
      if (filter.petsAllowed && !r.petsAllowed) return false;
      if (filter.city && r.city !== filter.city) return false;
      return true;
    });

    if (sortIndex === 1) result = [...result].sort((a, b) => a.price - b.price);
    else if (sortIndex === 2) result = [...result].sort((a, b) => b.price - a.price);
    else if (sortIndex === 3) result = [...result].sort((a, b) => b.rating - a.rating);
    else result = [...result].sort((a, b) => (b.postedAt > a.postedAt ? 1 : -1));

    return result;
  }, [rooms, search, filter, sortIndex]);

  const hasActiveFilter = Object.keys(filter).some(
    (k) => filter[k as keyof RoomFilter] !== undefined
  );

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 16 }]}>
        <View>
          <Text style={[styles.greeting, { color: colors.mutedForeground }]}>Find your</Text>
          <Text style={[styles.title, { color: colors.foreground }]}>Perfect Room</Text>
        </View>
        <TouchableOpacity
          style={[styles.gridBtn, { backgroundColor: colors.muted }]}
          onPress={() => setGridMode(!gridMode)}
        >
          <Feather name={gridMode ? "list" : "grid"} size={18} color={colors.foreground} />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={[styles.searchRow, { paddingHorizontal: 20 }]}>
        <View style={[styles.searchBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Feather name="search" size={18} color={colors.mutedForeground} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search by location or title..."
            placeholderTextColor={colors.mutedForeground}
            style={[styles.searchInput, { color: colors.foreground }]}
          />
          {search ? (
            <TouchableOpacity onPress={() => setSearch("")}>
              <Feather name="x" size={16} color={colors.mutedForeground} />
            </TouchableOpacity>
          ) : null}
        </View>
        <TouchableOpacity
          style={[
            styles.filterBtn,
            {
              backgroundColor: hasActiveFilter ? colors.primary : colors.card,
              borderColor: hasActiveFilter ? colors.primary : colors.border,
            },
          ]}
          onPress={() => setShowFilter(true)}
        >
          <Feather
            name="sliders"
            size={18}
            color={hasActiveFilter ? colors.primaryForeground : colors.foreground}
          />
        </TouchableOpacity>
      </View>

      {/* Sort Options */}
      <FlatList
        horizontal
        data={SORT_OPTIONS}
        keyExtractor={(item) => item}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.sortList}
        renderItem={({ item, index }) => (
          <TouchableOpacity
            style={[
              styles.sortChip,
              {
                backgroundColor: sortIndex === index ? colors.primary : colors.muted,
                borderColor: sortIndex === index ? colors.primary : colors.border,
              },
            ]}
            onPress={() => setSortIndex(index)}
          >
            <Text
              style={[
                styles.sortText,
                { color: sortIndex === index ? colors.primaryForeground : colors.mutedForeground },
              ]}
            >
              {item}
            </Text>
          </TouchableOpacity>
        )}
      />

      {/* Results Count */}
      <View style={styles.resultsRow}>
        <Text style={[styles.resultsText, { color: colors.mutedForeground }]}>
          {filteredRooms.length} {filteredRooms.length === 1 ? "listing" : "listings"} found
        </Text>
      </View>

      {/* Room List */}
      <FlatList
        data={filteredRooms}
        keyExtractor={(item) => item.id}
        numColumns={gridMode ? 2 : 1}
        key={gridMode ? "grid" : "list"}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.list,
          { paddingBottom: Platform.OS === "web" ? 120 : insets.bottom + 100 },
        ]}
        columnWrapperStyle={gridMode ? styles.columnWrapper : undefined}
        renderItem={({ item }) => (
          <RoomCard
            room={item}
            horizontal={!gridMode}
            onPress={() => router.push({ pathname: "/room/[id]", params: { id: item.id } })}
          />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Feather name="home" size={48} color={colors.mutedForeground} />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No rooms found</Text>
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              Try adjusting your search or filters
            </Text>
          </View>
        }
      />

      <FilterSheet
        visible={showFilter}
        onClose={() => setShowFilter(false)}
        onApply={setFilter}
        currentFilter={filter}
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
    alignItems: "flex-end",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  greeting: {
    fontSize: 14,
    fontWeight: "400",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
  },
  gridBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  searchRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
  },
  filterBtn: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  sortList: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    gap: 8,
  },
  sortChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  sortText: {
    fontSize: 13,
    fontWeight: "500",
  },
  resultsRow: {
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  resultsText: {
    fontSize: 13,
  },
  list: {
    paddingHorizontal: 16,
  },
  columnWrapper: {
    gap: 12,
  },
  empty: {
    alignItems: "center",
    paddingTop: 80,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  emptyText: {
    fontSize: 14,
    textAlign: "center",
  },
});
