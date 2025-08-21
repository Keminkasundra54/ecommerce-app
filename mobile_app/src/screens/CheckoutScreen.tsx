import React, { useMemo, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, Platform, ToastAndroid } from 'react-native';
import { useAddressBook } from '@/context/AddressBook';
import AddressItem from '@/components/AddressItem';
import { useCart } from '@/context/CartContext';
import { api } from '@/api/client';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'Checkout'>;

function idempotencyKey() {
    return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export default function CheckoutScreen({ navigation }: Props) {
    const { addresses, removeAddress, setDefault } = useAddressBook();
    const { items, totalAmount, totalItems, clearCart } = useCart();

    const defaultId = useMemo(() => addresses.find(a => a.isDefault)?.id, [addresses]);
    const [selected, setSelected] = useState<string | undefined>(defaultId);

    const selectedAddress = addresses.find(a => a.id === selected);

    async function placeOrder() {
        if (!selectedAddress) {
            Alert.alert('Select address', 'Please choose a shipping address.');
            return;
        }
        if (!items.length) {
            Alert.alert('Cart empty', 'Add items before checking out.');
            return;
        }
        try {
            const payload = {
                items: items.map(i => ({ productId: i.productId, quantity: i.quantity })),
                shippingAddress: {
                    name: selectedAddress.name,
                    phone: selectedAddress.phone,
                    line1: selectedAddress.line1,
                    line2: selectedAddress.line2,
                    city: selectedAddress.city,
                    state: selectedAddress.state,
                    postalCode: selectedAddress.postalCode,
                    country: selectedAddress.country || 'IN',
                },
                payment: { provider: 'cod' },
                idempotencyKey: idempotencyKey(),
            };
            const { data: order } = await api.post('/orders/checkout', payload);
            clearCart();
            const msg = `Order created (#${String(order._id).slice(-6).toUpperCase()})`;
            if (Platform.OS === 'android') {
                ToastAndroid.show(msg, ToastAndroid.SHORT);
            } else {
                Alert.alert('Success', msg);
            }

            // go to Orders tab (parent is the Tab navigator)
            const parent = navigation.getParent();         // <— the Tab navigator
            parent?.navigate('TabOrders' as never);        // switch tab

            // optional: reset the Cart stack so back button doesn’t return to Checkout
            navigation.reset({ index: 0, routes: [{ name: 'Cart' as never }] });
        } catch (e: any) {
            const msg = e?.response?.data?.error || e?.message || 'Checkout failed';
            Alert.alert('Checkout failed', msg);
        }
    }

    return (
        <View style={{ flex: 1, padding: 12 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text style={{ fontSize: 18, fontWeight: '800' }}>Select shipping address</Text>
                <TouchableOpacity onPress={() => navigation.navigate('AddressForm')}><Text style={{ color: '#007aff' }}>+ Add</Text></TouchableOpacity>
            </View>

            <FlatList
                data={addresses}
                keyExtractor={(a) => a.id}
                ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
                renderItem={({ item }) => (
                    <AddressItem
                        a={item}
                        selected={selected === item.id}
                        onSelect={() => setSelected(item.id)}
                        onEdit={() => navigation.navigate('AddressForm', { editing: true, address: item })}
                        onDelete={() => removeAddress(item.id)}
                        onMakeDefault={() => setDefault(item.id)}
                    />
                )}
                ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 16 }}>No saved addresses. Tap “+ Add”.</Text>}
            />

            <View style={{ borderTopWidth: 1, borderColor: '#eee', paddingTop: 12, marginTop: 12, gap: 8 }}>
                <Text>Total items: {totalItems}</Text>
                <Text style={{ fontWeight: '800', fontSize: 16 }}>Order total: ₹{totalAmount.toFixed(2)}</Text>
                <TouchableOpacity onPress={placeOrder} style={{ backgroundColor: 'black', padding: 14, borderRadius: 10, alignItems: 'center' }}>
                    <Text style={{ color: '#fff', fontWeight: '800' }}>Place order (COD)</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}
