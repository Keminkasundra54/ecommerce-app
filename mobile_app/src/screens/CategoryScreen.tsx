import React, { useEffect, useMemo, useState } from 'react';
import { View, FlatList, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { api } from '@/api/client';
import ProductCard from '@/components/ProductCard';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { HomeStackParamList } from '@/navigation';

type Props = NativeStackScreenProps<HomeStackParamList, 'Category'>;

type SubCategory = { _id: string; name: string };
type Product = {
  _id: string;
  name: string;
  images?: string[];
  quantity: number;
  price: number;
  priceCurrency?: string;
  priceUnit?: string;            // 'piece' | 'pack' | 'kg' | 'g' | 'litre' | 'ml'
  subCategory?: { _id: string; name: string };
};

export default function CategoryScreen({ route, navigation }: Props) {
  const { id: categoryId } = route.params;

  const [subs, setSubs] = useState<SubCategory[]>([]);
  const [selectedSub, setSelectedSub] = useState<string>('all');

  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        // fetch subcategories for this category
        const { data: s } = await api.get<{ items: SubCategory[] }>(`/subcategories?category=${categoryId}`);
        if (mounted) {
          setSubs(s.items || []);
          setSelectedSub('all');
        }
        // fetch products for this category (all subs)
        const { data: p } = await api.get<{ items: Product[] }>(`/products?category=${categoryId}&limit=200`);
        if (mounted) setProducts(p.items || []);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [categoryId]);

  const filtered = useMemo(() => {
    if (selectedSub === 'all') return products;
    return products.filter(p => p.subCategory?._id === selectedSub);
  }, [products, selectedSub]);

  if (loading) return <View style={styles.center}><ActivityIndicator /></View>;

  return (
    <View style={{ flex: 1 }}>
      {/* Compact dropdown */}
      <View style={styles.dropdownWrap}>
        <Picker
          selectedValue={selectedSub}
          onValueChange={(val) => setSelectedSub(String(val))}
          style={styles.picker}
          dropdownIconColor="#555"
        >
          <Picker.Item label="All subcategories" value="all" />
          {subs.map(sc => (
            <Picker.Item key={sc._id} label={sc.name} value={sc._id} />
          ))}
        </Picker>
      </View>

     <FlatList
        data={filtered}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ padding: 12, gap: 12 }}
        renderItem={({ item }) => (
              <ProductCard
                    name={item.name}
                    image={item.images?.[0]}
                    quantity={item.quantity}
                    price={item.price}
                    currency={item.priceCurrency || 'INR'}
                    unit={item.priceUnit || 'piece'}
                    onPress={() => {
                        if (item.quantity > 0) {
                        navigation.navigate('ProductDetails', { id: item._id });
                        }
                    }}
                    />
        )}
        ListEmptyComponent={
            <View style={{ padding: 24, alignItems: 'center' }}>
            <Text style={{ color: '#666' }}>No products in this category</Text>
            </View>
        }
        />
    </View>
  );
}

const styles = StyleSheet.create({
  dropdownWrap: {
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderColor: '#eee',
    backgroundColor: '#fff',
  },
  picker: {
    height: 44, // compact height
  },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
