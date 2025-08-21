import React from 'react';
import { View, Text, FlatList } from 'react-native';

export default function SectionSlider<T>({
  title,
  data,
  renderItem,
  itemSeparator = 12,
  contentPadding = 12,
}: {
  title: string;
  data: T[];
  renderItem: ({ item, index }: { item: T; index: number }) => React.ReactElement;
  itemSeparator?: number;
  contentPadding?: number;
}) {
  return (
    <View style={{ marginBottom: 8 }}>
      <Text style={{ fontSize: 18, fontWeight: '800', paddingHorizontal: contentPadding, marginBottom: 8 }}>
        {title}
      </Text>

      <FlatList
        data={data}
        keyExtractor={(_, i) => String(i)}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: contentPadding }}
        ItemSeparatorComponent={() => <View style={{ width: itemSeparator }} />}
        decelerationRate="fast"
        snapToAlignment="start"
        snapToInterval={152}          // card width (140) + gap (12)
        renderItem={renderItem}
      />
    </View>
  );
}
