import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  return (
    <View style={{ flex:1, padding:16, gap:16 }}>
      <Text style={{ fontSize:18, fontWeight:'800' }}>Profile</Text>
      {user ? (
        <>
          <Text>Name: {user.name}</Text>
          <Text>Email: {user.email}</Text>
          <Text>Role: {user.role}</Text>
          <TouchableOpacity onPress={logout} style={{ backgroundColor:'black', padding:12, borderRadius:10, alignItems:'center' }}>
            <Text style={{ color:'#fff', fontWeight:'800' }}>Log out</Text>
          </TouchableOpacity>
        </>
      ) : (
        <Text>Not signed in</Text>
      )}
    </View>
  );
}
