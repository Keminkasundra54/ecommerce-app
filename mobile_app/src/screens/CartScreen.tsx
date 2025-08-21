import React from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, Alert } from 'react-native';
import { useCart } from '@/context/CartContext';
import QuantityStepper from '@/components/QuantityStepper';
import { RootStackParamList } from '@/navigation';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
type Props = NativeStackScreenProps<RootStackParamList, 'Cart'>;
export default function CartScreen({ route, navigation }: Props) {
  const { items, totalItems, totalAmount, updateQty, removeItem, clearCart } = useCart();

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={items}
        keyExtractor={(i) => i.productId}
        contentContainerStyle={{ padding: 12, gap: 12 }}
        ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 20 }}>Your cart is empty</Text>}
        ListFooterComponent={
          items.length ? (
            <View style={{ marginTop: 12, padding: 12, borderTopWidth: 1, borderColor: '#eee', gap: 8 }}>
              <Text style={{ fontWeight: '700' }}>Items: {totalItems}</Text>
              <Text style={{ fontWeight: '800', fontSize: 18 }}>Total: {items[0]?.priceCurrency || 'INR'} {totalAmount.toFixed(2)}</Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('Checkout')}
                style={{ backgroundColor: 'black', padding: 14, borderRadius: 10, alignItems: 'center' }}
              >
                <Text style={{ color: '#fff', fontWeight: '800' }}>Proceed to checkout</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => clearCart()} style={{ padding: 10, alignItems: 'center' }}>
                <Text style={{ color: '#c00' }}>Clear cart</Text>
              </TouchableOpacity>
            </View>
          ) : null
        }
        renderItem={({ item }) => (
          <View style={{ backgroundColor: '#fff', borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: '#eee', flexDirection: 'row', padding: 10, gap: 10 }}>
            {item.image ? <Image source={{ uri: item.image }} style={{ width: 80, height: 80 }} /> : <View style={{ width: 80, height: 80, backgroundColor: '#eee' }} />}
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={{ fontWeight: '700' }}>{item.name}</Text>
              <Text style={{ color: '#666' }}>SKU: {item.sku}</Text>
              <Text style={{ fontWeight: '700' }}>{item.priceCurrency} {item.price.toFixed(2)} / {item.priceUnit}</Text>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }}>
                <QuantityStepper value={item.quantity} onChange={(q)=>updateQty(item.productId, q)} />
                <TouchableOpacity onPress={() => removeItem(item.productId)}>
                  <Text style={{ color: '#c00' }}>Remove</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      />
    </View>
  );
}
