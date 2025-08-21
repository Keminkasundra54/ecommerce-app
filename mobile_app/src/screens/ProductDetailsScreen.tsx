import React, { useEffect, useState } from 'react';
import { View, Text, Image, ScrollView, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { api } from '@/api/client';
import { useCart } from '@/context/CartContext';
import QuantityStepper from '@/components/QuantityStepper';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'ProductDetails'>;

type Product = {
  _id: string;
  name: string;
  sku: string;
  images: string[];
  description?: string;
  price: number;
  priceCurrency: string;
  priceUnit: string;
  quantity: number;
  category: { _id: string; name: string };
  subCategory: { _id: string; name: string };
  attributes?: Record<string, any>;
};

export default function ProductDetailsScreen({ route, navigation }: Props) {
  const { id } = route.params;
  const [p, setP] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const { addToCart } = useCart();

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get<Product>(`/products/${id}`);
        setP(res.data);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) return <View style={{ flex: 1, justifyContent: 'center' }}><ActivityIndicator /></View>;
  if (!p) return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><Text>Not found</Text></View>;

  const mainImage = p.images?.[0];

  function onAdd() {
    if (p.quantity <= 0) {
      Alert.alert('Out of stock', 'This product is not available right now.');
      return;
    }
    addToCart(
      {
        productId: p._id,
        name: p.name,
        sku: p.sku,
        image: mainImage,
        price: p.price,
        priceCurrency: p.priceCurrency,
        priceUnit: p.priceUnit
      },
      qty
    );
    Alert.alert('Added to cart', `${p.name} × ${qty}`);
    navigation.navigate('Cart');
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
      {mainImage ? (
        <Image source={{ uri: mainImage }} style={{ width: '100%', height: 260, borderRadius: 12 }} resizeMode="cover" />
      ) : (
        <View style={{ width: '100%', height: 260, borderRadius: 12, backgroundColor: '#eee' }} />
      )}

      <Text style={{ fontSize: 22, fontWeight: '800' }}>{p.name}</Text>
      <Text style={{ color: '#666' }}>SKU: {p.sku}</Text>
      <Text style={{ fontSize: 18, fontWeight: '700' }}>
        {p.priceCurrency} {p.price.toFixed(2)} / {p.priceUnit}
      </Text>

      {p.description ? <Text style={{ lineHeight: 20 }}>{p.description}</Text> : null}

      {p.attributes && Object.keys(p.attributes).length ? (
        <View style={{ paddingVertical: 8, gap: 4 }}>
          {Object.entries(p.attributes).map(([k, v]) => (
            <Text key={k} style={{ color: '#555' }}>{k}: {String(v)}</Text>
          ))}
        </View>
      ) : null}

      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 16 }}>
        <QuantityStepper value={qty} onChange={setQty} />
        <TouchableOpacity
          onPress={onAdd}
          style={{ backgroundColor: 'black', paddingVertical: 14, paddingHorizontal: 20, borderRadius: 10 }}
        >
          <Text style={{ color: '#fff', fontWeight: '800' }}>Add to cart</Text>
        </TouchableOpacity>
      </View>

      <Text style={{ marginTop: 8, color: p.quantity > 0 ? '#090' : '#900' }}>
        In stock: {p.quantity}
      </Text>
    </ScrollView>
  );
}
