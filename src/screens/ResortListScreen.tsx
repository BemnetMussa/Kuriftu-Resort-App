import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, ActivityIndicator, TextInput } from 'react-native';
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

type ResortListScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ResortList'>;

interface Props {
  navigation: ResortListScreenNavigationProp;
}

export default function ResortListScreen({ navigation }: Props) {
  const [resorts, setResorts] = useState<Resort[]>([]);
  const [filteredResorts, setFilteredResorts] = useState<Resort[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchResorts();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredResorts(resorts);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = resorts.filter(
        (resort) =>
          resort.name.toLowerCase().includes(query) || resort.location.toLowerCase().includes(query)
      );
      setFilteredResorts(filtered);
    }
  }, [searchQuery, resorts]);

  async function fetchResorts() {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('resorts').select('*').order('name');

      if (error) throw error;

      setResorts(data);
      setFilteredResorts(data);
    } catch (error) {
      console.error('Error fetching resorts:', error);
      setError('Failed to load resorts. Please try again later.');
    } finally {
      setLoading(false);
    }
  }

  const renderResortItem = ({ item }: { item: Resort }) => (
    <TouchableOpacity
      className="bg-white rounded-lg shadow-md mb-4"
      onPress={() =>
        navigation.navigate('ResortDetail', {
          resortId: item.id,
          resortName: item.name,
        })
      }
    >
      <Image
        source={{ uri: item.image_url || 'https://via.placeholder.com/100' }}
        className="w-full h-40 rounded-t-lg"
        resizeMode="cover"
      />
      <View className="p-4">
        <Text className="text-xl font-bold">{item.name}</Text>
        <Text className="text-sm text-gray-600">{item.location}</Text>
        <View className="flex-row items-center mt-2">
          <Text className="text-sm font-bold text-yellow-500">★ {item.rating}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-gray-100">
      <View className="p-4 bg-white border-b border-gray-300">
        <TextInput
          className="bg-gray-200 p-4 rounded-xl text-lg"
          placeholder="Search resorts by name or location..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          clearButtonMode="while-editing"
        />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#0066cc" className="flex-1 justify-center items-center" />
      ) : error ? (
        <Text className="text-red-600 text-center mt-4">{error}</Text>
      ) : filteredResorts.length === 0 ? (
        <View className="flex-1 justify-center items-center p-6">
          <Text className="text-lg text-gray-600 text-center">No resorts found matching "{searchQuery}"</Text>
        </View>
      ) : (
        <FlatList
          data={filteredResorts}
          renderItem={renderResortItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerClassName="px-4 py-2"
        />
      )}
    </View>
  );
}