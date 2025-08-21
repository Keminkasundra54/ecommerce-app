import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';

export default function SubcategoryChips({
  items, selected, onSelect
}: { items: { _id: string; name: string }[]; selected: string | null; onSelect: (id: string) => void; }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 12, paddingVertical: 8, gap: 8 }}>
      <Chip label="All" active={!selected} onPress={() => onSelect('')} />
      {items.map(s => <Chip key={s._id} label={s.name} active={selected === s._id} onPress={() => onSelect(s._id)} />)}
    </ScrollView>
  );
}

function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} style={{
      paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999,
      borderWidth: 1, borderColor: active ? '#000' : '#ddd', backgroundColor: active ? '#000' : '#fff'
    }}>
      <Text style={{ color: active ? '#fff' : '#111', fontWeight: '600' }}>{label}</Text>
    </TouchableOpacity>
  );
}
