import React, { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet, Text, ScrollView, RefreshControl } from 'react-native';
import { api } from '@/api/client';
import SectionSlider from '@/components/SectionSlider';
import CategorySlideCard from '@/components/CategorySlideCard';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { HomeStackParamList } from '@/navigation';
import TwoRowSlider from '@/components/TwoRowSlider';
import ProductSlideCard from '@/components/ProductSlideCard';

type Props = NativeStackScreenProps<HomeStackParamList, 'Home'>;

type Category = { _id: string; name: string; image?: string };

type Product = {
  _id: string;
  name: string;
  images?: string[];
  price: number;
  priceCurrency?: string;
  featured?: boolean;
};


export default function HomeScreen({ navigation }: Props) {
  const [cats, setCats] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [featured, setFeatured] = useState<Product[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
        const [{ data: catRes }, { data: featRes }] = await Promise.all([
            api.get<{ items: Category[] }>('/categories?limit=200'),
            api.get<{ items: Product[] }>('/products?featured=true&limit=20'),
        ]);
        setCats(catRes.items || []);
        setFeatured(featRes.items || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try { await load(); } finally { setRefreshing(false); }
  }, [load]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
        <Text style={{ marginTop: 8, color: '#666' }}>Loading…</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      contentContainerStyle={{ paddingVertical: 8 }}
    >
      {/* Categories slider */}
      <SectionSlider
        title="Categories"
        data={cats}
        renderItem={({ item }) => (
          <CategorySlideCard
            name={item.name}
            image={item.image}
            onPress={() => navigation.navigate('Category', { id: item._id, name: item.name })}
          />
        )}
      />

      {/* You can add more sliders below, e.g. Featured products */}
      {/* <SectionSlider title="Featured" data={featuredProducts} renderItem={...} /> */}
      {featured.length ? (
        <TwoRowSlider
            title="Featured"
            data={featured}
            cardWidth={140}
            gap={12}
            renderCard={(p) => (
            <ProductSlideCard
                name={p.name}
                image={p.images?.[0]}
                price={p.price}
                currency={p.priceCurrency || 'INR'}
                onPress={() => navigation.navigate('ProductDetails', { id: p._id })}
            />
            )}
        />
        ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
