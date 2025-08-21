import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';

export default function ProductSlideCard({
  name, image, price, currency = 'INR', onPress, width = 140, height = 120
}: {
  name: string;
  image?: string;
  price: number;
  currency?: string;
  onPress?: () => void;
  width?: number;
  height?: number;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={{
        width,
        backgroundColor: '#fff',
        borderRadius: 14,
        padding: 10,
        borderWidth: 1,
        borderColor: '#eee',
      }}
    >
      <View
        style={{
          height,
          borderRadius: 10,
          backgroundColor: '#f5f5f5',
          overflow: 'hidden',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 8,
        }}
      >
        {image ? (
          <Image source={{ uri: image }} resizeMode="cover" style={{ width: '100%', height: '100%' }} />
        ) : (
          <Text style={{ color: '#aaa' }}>No image</Text>
        )}
      </View>
      <Text numberOfLines={1} style={{ fontWeight: '800', fontSize: 13 }}>{name}</Text>
      <Text style={{ color: '#111', fontWeight: '700', marginTop: 2 }}>
        {currency} {price.toFixed(2)}
      </Text>
    </TouchableOpacity>
  );
}
