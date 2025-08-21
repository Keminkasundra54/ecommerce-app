import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import type { Address } from '@/context/AddressBook';

export default function AddressItem({
  a, selected, onSelect, onEdit, onDelete, onMakeDefault
}: {
  a: Address;
  selected?: boolean;
  onSelect?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onMakeDefault?: () => void;
}) {
  return (
    <TouchableOpacity onPress={onSelect} activeOpacity={0.8}
      style={{ borderWidth: 1, borderColor: selected ? '#000' : '#eee', backgroundColor: selected ? '#fafafa' : '#fff', borderRadius: 12, padding: 12, gap: 6 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text style={{ fontWeight: '800' }}>{a.name} {a.isDefault ? ' (Default)' : ''}</Text>
        {selected ? <Text>✓</Text> : null}
      </View>
      <Text>{a.line1}{a.line2 ? `, ${a.line2}` : ''}</Text>
      <Text>{a.city}{a.state ? `, ${a.state}` : ''} {a.postalCode}</Text>
      <Text>{a.country || 'IN'}{a.phone ? ` • ${a.phone}` : ''}</Text>

      <View style={{ flexDirection: 'row', gap: 16, marginTop: 8 }}>
        {onEdit ? <TouchableOpacity onPress={onEdit}><Text style={{ color: '#007aff' }}>Edit</Text></TouchableOpacity> : null}
        {onMakeDefault && !a.isDefault ? <TouchableOpacity onPress={onMakeDefault}><Text style={{ color: '#007aff' }}>Make Default</Text></TouchableOpacity> : null}
        {onDelete ? <TouchableOpacity onPress={onDelete}><Text style={{ color: '#c00' }}>Delete</Text></TouchableOpacity> : null}
      </View>
    </TouchableOpacity>
  );
}
