import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';

export default function CategorySlideCard({
  name, image, onPress, width = 140
}: { name: string; image?: string; onPress?: () => void; width?: number }) {
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
        marginVertical: 4,
      }}
    >
      <View
        style={{
          height: 90,
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
    </TouchableOpacity>
  );
}
