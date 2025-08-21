import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useAddressBook } from '@/context/AddressBook';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'AddressForm'>;

export default function AddressFormScreen({ route, navigation }: Props) {
  const { addAddress, updateAddress } = useAddressBook();
  const editing = route.params?.editing || false;
  const existing = route.params?.address;

  const [name, setName] = useState(existing?.name || '');
  const [phone, setPhone] = useState(existing?.phone || '');
  const [line1, setLine1] = useState(existing?.line1 || '');
  const [line2, setLine2] = useState(existing?.line2 || '');
  const [city, setCity] = useState(existing?.city || '');
  const [state, setState] = useState(existing?.state || '');
  const [postalCode, setPostalCode] = useState(existing?.postalCode || '');
  const [country, setCountry] = useState(existing?.country || 'IN');

  async function onSubmit() {
    if (!name || !line1 || !city || !postalCode) {
      Alert.alert('Missing info', 'Name, Address line 1, City, and Postal Code are required.');
      return;
    }
    if (editing && existing?.id) {
      await updateAddress(existing.id, { name, phone, line1, line2, city, state, postalCode, country });
    } else {
      await addAddress({ name, phone, line1, line2, city, state, postalCode, country, isDefault: false });
    }
    navigation.goBack();
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{editing ? 'Edit address' : 'Add a new address'}</Text>
      <TextInput style={styles.input} placeholder="Full name" value={name} onChangeText={setName} />
      <TextInput style={styles.input} placeholder="Phone (optional)" keyboardType="phone-pad" value={phone} onChangeText={setPhone} />
      <TextInput style={styles.input} placeholder="Address line 1" value={line1} onChangeText={setLine1} />
      <TextInput style={styles.input} placeholder="Address line 2 (optional)" value={line2} onChangeText={setLine2} />
      <TextInput style={styles.input} placeholder="City" value={city} onChangeText={setCity} />
      <TextInput style={styles.input} placeholder="State" value={state} onChangeText={setState} />
      <TextInput style={styles.input} placeholder="Postal code" keyboardType="number-pad" value={postalCode} onChangeText={setPostalCode} />
      <TextInput style={styles.input} placeholder="Country" value={country} onChangeText={setCountry} />
      <TouchableOpacity style={styles.btn} onPress={onSubmit}><Text style={styles.btnText}>{editing ? 'Save' : 'Add address'}</Text></TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, gap: 10 },
  title: { fontSize: 20, fontWeight: '800', marginBottom: 6 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 12 },
  btn: { backgroundColor: 'black', padding: 14, borderRadius: 10, alignItems: 'center', marginTop: 8 },
  btnText: { color: '#fff', fontWeight: '800' }
});
