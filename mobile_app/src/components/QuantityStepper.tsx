import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

export default function QuantityStepper({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
      <TouchableOpacity onPress={() => onChange(Math.max(1, value - 1))}
        style={{ borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 }}>
        <Text style={{ fontSize: 18 }}>−</Text>
      </TouchableOpacity>
      <Text style={{ minWidth: 28, textAlign: 'center', fontWeight: '700' }}>{value}</Text>
      <TouchableOpacity onPress={() => onChange(value + 1)}
        style={{ borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 }}>
        <Text style={{ fontSize: 18 }}>＋</Text>
      </TouchableOpacity>
    </View>
  );
}
