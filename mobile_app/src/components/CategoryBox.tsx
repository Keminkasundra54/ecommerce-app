import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';

export default function CategoryBox({
  name, image, onPress,
}: { name: string; image?: string; onPress?: () => void }) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={{
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 14,
        padding: 12,
        borderWidth: 1,
        borderColor: '#eee',
        // shadow (iOS) / elevation (Android)
        shadowColor: '#000',
        shadowOpacity: 0.06,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
      }}
    >
      <View
        style={{
          height: 110,
          borderRadius: 10,
          backgroundColor: '#f5f5f5',
          overflow: 'hidden',
          marginBottom: 10,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {image ? (
          <Image
            source={{ uri: image }}
            resizeMode="cover"
            style={{ width: '100%', height: '100%' }}
          />
        ) : (
          <Text style={{ color: '#aaa' }}>No image</Text>
        )}
      </View>
      <Text numberOfLines={1} style={{ fontWeight: '800', fontSize: 14 }}>{name}</Text>
    </TouchableOpacity>
  );
}
