import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { supabase } from '../utils/supabase';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/RootStackParamList';

interface Resort {
  id: number;
  name: string;
  location: string;
  image_url: string;
  rating: number;
}

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

interface Props {
  navigation: HomeScreenNavigationProp;
}

export default function HomeScreen({ navigation }: Props) {
  const [featuredResorts, setFeaturedResorts] = useState<Resort[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchFeaturedResorts();
  }, []);

  async function fetchFeaturedResorts() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('Resorts Table')
        .select('*')
        .order('rating', { ascending: false })
        .limit(5); 

      if (error) throw error;

      setFeaturedResorts(data);
      setError(null); // Clear any previous error
    } catch (error) {
      console.error('Error fetching resorts:', error);
      setError('Failed to load resorts. Please try again later.');
    } finally {
      setLoading(false);
    }
  }

  const renderResortCard = ({ item }: { item: Resort }) => (
    <TouchableOpacity
      className="bg-white rounded-lg mb-4 shadow-md"
      onPress={() => navigation.navigate('ResortDetail', { resortId: item.id, resortName: item.name })}
    >
      <Image
        source={{ uri: item.image_url || 'https://via.placeholder.com/300x200' }}
        className="w-full h-48 rounded-t-lg"
        resizeMode="cover"
      />
      <View className="p-4">
        <Text className="text-lg font-bold">{item.name}</Text>
        <Text className="text-sm text-gray-500">{item.location}</Text>
        <Text className="text-sm text-yellow-500 mt-1">★ {item.rating}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 p-4 bg-gray-100">
      <View className="flex items-center  mb-4">
        <Text className="text-2xl font-bold mb-4">Kuriftu Resorts</Text>
        <Text className="text-gray-600 mb-2">Experience Ethiopia Culture in Luxury</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#0066cc" className="flex-1 justify-center items-center" />
      ) : error ? (
        <Text className="text-red-500 text-center mt-4">{error}</Text>
      ) : (
        <>
          <FlatList
            data={featuredResorts}
            renderItem={renderResortCard}
            keyExtractor={item => item.id.toString()}
            contentContainerStyle={{ paddingBottom: 16 }}  // Corrected here!
          />
          <TouchableOpacity
            className="bg-blue-600 py-4 rounded-lg items-center mt-4"
            onPress={() => navigation.navigate('ResortList')}
          >
            <Text className="text-white text-lg font-bold">View All Resorts</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}