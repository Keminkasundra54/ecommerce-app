import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { api } from '@/api/client';

type Order = {
  _id: string;
  grandTotal: number;
  currency?: string;
  status: string;
  createdAt: string;
  items: { name: string; quantity: number }[];
};

export default function OrdersScreen() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const { data } = await api.get<{ items: Order[] }>('/orders/mine');
      setOrders(data.items || []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  if (loading) return <View style={{ flex:1, justifyContent:'center' }}><ActivityIndicator /></View>;

  return (
    <View style={{ flex: 1, padding: 12 }}>
      <FlatList
        data={orders}
        keyExtractor={(o) => o._id}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        ListEmptyComponent={<Text style={{ textAlign:'center', marginTop: 16 }}>No orders yet.</Text>}
        renderItem={({ item }) => (
          <TouchableOpacity
            activeOpacity={0.8}
            style={{ borderWidth:1, borderColor:'#eee', backgroundColor:'#fff', padding:12, borderRadius:12 }}
          >
            <Text style={{ fontWeight:'800' }}>#{item._id.slice(-6).toUpperCase()}</Text>
            <Text style={{ color:'#666' }}>
              {new Date(item.createdAt).toLocaleString()}
            </Text>
            <Text style={{ marginTop: 4 }}>
              {item.currency || 'INR'} {item.grandTotal?.toFixed?.(2)} • {item.status}
            </Text>
            <Text style={{ color:'#666', marginTop: 2 }}>
              {item.items?.slice(0,3).map(i => `${i.name}×${i.quantity}`).join(', ')}
              {item.items?.length > 3 ? ' …' : ''}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
