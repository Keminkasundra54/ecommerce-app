import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';

export default function ProductCard({
  name,
  image,
  quantity,
  price,
  currency = 'INR',
  unit = 'piece',
  onPress,
}: {
  name: string;
  image?: string;
  quantity: number;
  price: number;
  currency?: string;    // e.g. 'INR'
  unit?: string;        // e.g. 'kg' | 'piece' | ...
  onPress?: () => void;
}) {
  const out = quantity <= 0;
  const low = !out && quantity < 10;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={out ? 1 : 0.85}
      disabled={out}
      style={{
        backgroundColor: out ? '#f7f7f7' : '#fff',
        borderRadius: 12,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#eee',
        flexDirection: 'row',
        opacity: out ? 0.6 : 1,
      }}
    >
      {/* image */}
      {image ? (
        <Image source={{ uri: image }} style={{ width: 110, height: 110 }} resizeMode="cover" />
      ) : (
        <View style={{ width: 110, height: 110, backgroundColor: '#f0f0f0' }} />
      )}

      {/* content */}
      <View style={{ flex: 1, padding: 12, gap: 6, justifyContent: 'center' }}>
        <Text numberOfLines={2} style={{ fontWeight: '800', fontSize: 14, color: out ? '#666' : '#111' }}>
          {name}
        </Text>

        {/* price + unit */}
        <Text style={{ fontWeight: '800', color: out ? '#6b7280' : '#111' }}>
          {currency} {Number(price).toFixed(2)}{unit ? ` / ${unit}` : ''}
        </Text>

        {/* stock badges */}
        {out ? (
          <View
            style={{
              alignSelf: 'flex-start',
              backgroundColor: '#e5e7eb',
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 8,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <Text style={{ fontSize: 14 }}>⛔️</Text>
            <Text style={{ color: '#6b7280', fontWeight: '700' }}>Out of stock</Text>
          </View>
        ) : low ? (
          <View
            style={{
              alignSelf: 'flex-start',
              backgroundColor: '#fff7ed',
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 8,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
              borderWidth: 1,
              borderColor: '#fde68a',
            }}
          >
            <Text style={{ fontSize: 14 }}>⚠️</Text>
            <Text style={{ color: '#92400e', fontWeight: '700' }}>Only {quantity} left</Text>
          </View>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}
