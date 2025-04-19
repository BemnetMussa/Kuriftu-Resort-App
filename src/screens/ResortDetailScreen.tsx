import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Image, ActivityIndicator, TouchableOpacity } from 'react-native';
import { supabase } from '../utils/supabase';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../types/RootStackParamList';

type Resort = {
  id: string;
  name: string;
  image_url: string;
  location: string;
  description: string;
  rating: number;
  amenities: string[];
};

type Service = {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
};

type Event = {
  id: string;
  name: string;
  description: string;
  location: string;
  price: number;
  date: string;
};

type ResortDetailScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ResortDetail'>;

type ResortDetailScreenRouteProp = RouteProp<RootStackParamList, 'ResortDetail'>;

interface ResortDetailScreenProps {
  route: ResortDetailScreenRouteProp;
  navigation: ResortDetailScreenNavigationProp;
}

export default function ResortDetailScreen({ route, navigation }: ResortDetailScreenProps) {
  const { resortId } = route.params;
  const [resort, setResort] = useState<Resort | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'details' | 'services' | 'events'>('details');

  useEffect(() => {
    fetchResortDetails();
  }, [resortId]);

  async function fetchResortDetails() {
    try {
      setLoading(true);
    
      console.log(resortId, 'Resort ID from route params'); // Debugging line
      // Fetch resort details
      const { data: resortData, error: resortError } = await supabase
        .from('Resorts Table')
        .select('*')
        .eq('id', resortId)
        .single(); 


      if (resortError) throw resortError;
      setResort(resortData);
      setError(null); // Clear any previous error

      // Fetch services for this resort
      const { data: servicesData, error: servicesError } = await supabase
        .from('Services Table')
        .select('*')
        .eq('resort_id', resortId);

      if (servicesError) throw servicesError;
      setServices(servicesData);

      // Fetch upcoming events for this resort
      const { data: eventsData, error: eventsError } = await supabase
        .from('Events Table')
        .select('*')
        .eq('resort_id', resortId)
        .gte('date', new Date().toISOString())
        .order('date', { ascending: true });

      if (eventsError) throw eventsError;
      setEvents(eventsData);
    } catch (error) {
      console.error('Error fetching resort details:', error);
      setError('Failed to load resort information. Please try again later.');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#0066cc" />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center p-5">
        <Text className="text-red-500 text-lg text-center">{error}</Text>
      </View>
    );
  }

  const renderDetailsTab = () => (
    <ScrollView className="flex-1 p-4">
      <Image
        source={{ uri: resort?.image_url || 'https://via.placeholder.com/400x300' }}
        className="w-full h-60"
        resizeMode="cover"
      />
      <View className="mt-4">
        <View className="flex-row justify-between items-center mb-2">
          <Text className="text-2xl font-bold text-gray-800 flex-1">{resort?.name}</Text>
          <View className="bg-yellow-100 p-2 rounded-lg">
            <Text className="text-yellow-600 font-bold">★ {resort?.rating}</Text>
          </View>
        </View>
        <Text className="text-lg text-gray-600 mb-4">{resort?.location}</Text>
        <Text className="text-xl font-semibold text-gray-800">About</Text>
        <Text className="text-base text-gray-700 mt-2">{resort?.description}</Text>
        <Text className="text-xl font-semibold text-gray-800 mt-6">Amenities</Text>
        <View className="flex-row flex-wrap mt-2">
          {resort?.amenities?.map((amenity, index) => (
            <View key={index} className="bg-blue-100 rounded-full px-4 py-2 m-1">
              <Text className="text-blue-600 text-sm">{amenity}</Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );

  const renderServicesTab = () => (
    <ScrollView className="flex-1 p-4">
      {services.length === 0 ? (
        <Text className="text-center text-gray-600 mt-12">No services available at this resort.</Text>
      ) : (
        services.map((service) => (
          <View key={service.id} className="flex-row bg-white my-4 rounded-lg shadow-lg overflow-hidden">
            <Image
              source={{ uri: service.image_url || 'https://via.placeholder.com/100x100' }}
              className="w-24 h-24"
              resizeMode="cover"
            />
            <View className="flex-1 p-4">
              <Text className="text-lg font-bold text-gray-800">{service.name}</Text>
              <Text className="text-sm text-gray-600 mt-2">{service.description}</Text>
              <Text className="text-lg font-semibold text-blue-600 mt-4">${service.price}</Text>
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );

  const renderEventsTab = () => (
    <ScrollView className="flex-1 p-4">
      {events.length === 0 ? (
        <Text className="text-center text-gray-600 mt-12">No upcoming events at this resort.</Text>
      ) : (
        events.map((event) => (
          <View key={event.id} className="flex-row bg-white my-4 rounded-lg shadow-lg overflow-hidden">
            <View className="w-20 bg-blue-600 justify-center items-center p-4">
              <Text className="text-white font-bold text-lg">
                {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </Text>
            </View>
            <View className="flex-1 p-4">
              <Text className="text-lg font-bold text-gray-800">{event.name}</Text>
              <Text className="text-sm text-gray-600 mt-2">{event.location}</Text>
              <Text className="text-sm text-gray-600 mt-2">{event.description}</Text>
              {event.price > 0 && (
                <Text className="text-lg font-semibold text-blue-600 mt-4">${event.price}</Text>
              )}
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );

  return (
    <View className="flex-1 bg-gray-100">
      <View className="flex-row bg-white border-b border-gray-300">
        <TouchableOpacity
          className={`flex-1 py-4 items-center   ${activeTab === 'details' ? 'border-b-4 border-blue-600' : ''}`}
          onPress={() => setActiveTab('details')}
        >
          <Text className={`text-lg ${activeTab === 'details' ? 'text-blue-600 font-semibold' : 'text-gray-600'}`}>Details</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className={`flex-1 py-4 items-center ${activeTab === 'services' ? 'border-b-4 border-blue-600' : ''}`}
          onPress={() => setActiveTab('services')}
        >
          <Text className={`text-lg ${activeTab === 'services' ? 'text-blue-600 font-semibold' : 'text-gray-600'}`}>Services</Text>
          <View className="bg-gray-200 rounded-full px-2 py-1 mt-1">
            <Text className="text-xs text-gray-600">{services.length}</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          className={`flex-1 py-4 items-center ${activeTab === 'events' ? 'border-b-4 border-blue-600' : ''}`}
          onPress={() => setActiveTab('events')}
        >
          <Text className={`text-lg ${activeTab === 'events' ? 'text-blue-600 font-semibold' : 'text-gray-600'}`}>Events</Text>
          <View className="bg-gray-200 rounded-full px-2 py-1 mt-1">
            <Text className="text-xs text-gray-600">{events.length}</Text>
          </View>
        </TouchableOpacity>
      </View>

      {activeTab === 'details' && renderDetailsTab()}
      {activeTab === 'services' && renderServicesTab()}
      {activeTab === 'events' && renderEventsTab()}
    </View>
  );
}