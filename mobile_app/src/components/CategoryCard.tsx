import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';

export default function CategoryCard({ name, image, onPress }: { name: string; image?: string; onPress?: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} style={{ backgroundColor: '#fff', borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: '#eee' }}>
      {image ? (
        <Image source={{ uri: image }} style={{ height: 140, width: '100%' }} resizeMode="cover" />
      ) : (
        <View style={{ height: 140, backgroundColor: '#f2f2f2' }} />
      )}
      <View style={{ padding: 12 }}>
        <Text style={{ fontWeight: '700' }}>{name}</Text>
      </View>
    </TouchableOpacity>
  );
}
