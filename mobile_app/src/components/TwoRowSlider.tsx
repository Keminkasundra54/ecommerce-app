import React, { useMemo } from 'react';
import { View, Text, FlatList } from 'react-native';

type TwoRowSliderProps<T> = {
  title: string;
  data: T[];
  renderCard: (item: T, index: number) => React.ReactElement;
  gap?: number;            // space between cards/columns
  cardWidth?: number;      // must match the card width used in renderCard
  horizontalPadding?: number;
};

export default function TwoRowSlider<T>({
  title, data, renderCard, gap = 12, cardWidth = 140, horizontalPadding = 12,
}: TwoRowSliderProps<T>) {
  // Group items into columns of 2 (top, bottom)
  const columns = useMemo(() => {
    const out: T[][] = [];
    for (let i = 0; i < data.length; i += 2) out.push(data.slice(i, i + 2));
    return out;
  }, [data]);

  const snap = cardWidth + gap;

  return (
    <View style={{ marginTop: 8 }}>
      <Text style={{ fontSize: 18, fontWeight: '800', paddingHorizontal: horizontalPadding, marginBottom: 8 }}>
        {title}
      </Text>

      <FlatList
        data={columns}
        keyExtractor={(_, i) => String(i)}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: horizontalPadding }}
        ItemSeparatorComponent={() => <View style={{ width: gap }} />}
        decelerationRate="fast"
        snapToAlignment="start"
        snapToInterval={snap}
        renderItem={({ item: col, index }) => (
          <View style={{ width: cardWidth, gap }}>
            {col.map((it, idx) => (
              <View key={idx}>{renderCard(it, index * 2 + idx)}</View>
            ))}
          </View>
        )}
      />
    </View>
  );
}
