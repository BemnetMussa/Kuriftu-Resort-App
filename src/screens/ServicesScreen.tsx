import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../utils/supabase";

// Define the Service type
type Service = {
  id: number;
  title: string;
  description: string;
  image: string;
  rating: number;
  isPaid: boolean;
  price?: string;
  note?: string;
};

interface ServiceContentProps {
  resortId: string;
}

export default function ServiceContent({ resortId }: ServiceContentProps) {
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState<Service[]>([]);

  // Fetch services for this resort
  useEffect(() => {
    async function fetchServices() {
      try {
        setLoading(true);
        
        // You would replace this with your actual API call
        // For now, using mock data
        const mockServices: Service[] = [
          {
            id: 1,
            title: "Luxury Spa",
            description: "Relax and rejuvenate with our traditional and modern spa treatments.",
            image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-NQ5loIIaeeEEFifw0Nv5sbDt7vTOyi.png", // Replace with actual image
            rating: 4.8,
            isPaid: true,
            price: "From 1,200 ETB",
          },
          {
            id: 2,
            title: "Lakeside Restaurant",
            description: "Enjoy authentic Ethiopian cuisine with a stunning view of Lake Tana.",
            image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-NQ5loIIaeeEEFifw0Nv5sbDt7vTOyi.png", // Replace with actual image
            rating: 4.9,
            isPaid: true,
            price: "Meals from 350 ETB",
          },
          {
            id: 3,
            title: "Infinity Pool",
            description: "Swim in our beautiful infinity pool overlooking Lake Tana.",
            image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-RrrWszsjQfKePT3f3SOTnJwEOUvbhu.png", // Replace with actual image
            rating: 5.0,
            isPaid: false,
            note: "Complimentary for guests",
          },
          {
            id: 4,
            title: "Cultural Tours",
            description: "Guided tours to local monasteries and cultural sites around Lake Tana.",
            image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-NQ5loIIaeeEEFifw0Nv5sbDt7vTOyi.png", // Replace with actual image
            rating: 4.7,
            isPaid: true,
            price: "From 600 ETB",
          },
          {
            id: 5,
            title: "Fitness Center",
            description: "Stay fit during your stay with our modern gym equipment.",
            image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-NQ5loIIaeeEEFifw0Nv5sbDt7vTOyi.png", // Replace with actual image
            rating: 4.6,
            isPaid: false,
            note: "Complimentary for guests",
          },
        ];
        
        // In a real app, you would fetch from Supabase like this:
        // const { data, error } = await supabase
        //   .from('services')
        //   .select('*')
        //   .eq('resort_id', resortId);
        
        // if (error) throw error;
        // setServices(data);
        
        setServices(mockServices);
      } catch (error) {
        console.error("Error fetching services:", error);
        Alert.alert("Error", "Failed to load services");
      } finally {
        setLoading(false);
      }
    }
    
    fetchServices();
  }, [resortId]);

  const handleServicePress = (service: Service) => {
    if (service.isPaid) {
      Alert.alert(
        "Service Information",
        `Would you like to book this service?\n\n${service.price}`,
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Book Now",
            onPress: () => {
              Alert.alert("Success", "Your booking request has been received!");
            },
          },
        ]
      );
    } else {
      Alert.alert(
        "Service Information",
        `${service.note}\n\nThis service is included with your stay.`,
        [{ text: "OK" }]
      );
    }
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#4263EB" />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="px-4 py-6">
        <Text className="text-2xl font-bold mb-2">Our Services</Text>
        <Text className="text-gray-600 mb-6">
          Explore the premium amenities and services available at this resort
        </Text>

        {services.map((service) => (
          <TouchableOpacity
            key={service.id}
            className="mb-4 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
            onPress={() => handleServicePress(service)}
          >
            <View className="flex-row">
              <Image
                source={{ uri: service.image }}
                className="w-28 h-28"
                resizeMode="cover"
              />
              <View className="flex-1 p-3 justify-between">
                <View>
                  <View className="flex-row justify-between items-start">
                    <Text className="text-lg font-bold">{service.title}</Text>
                    <View className="flex-row items-center">
                      <Ionicons name="star" size={14} color="#FFB800" />
                      <Text className="text-gray-700 ml-1 text-sm">{service.rating}</Text>
                    </View>
                  </View>
                  <Text className="text-gray-600 text-sm mt-1" numberOfLines={2}>
                    {service.description}
                  </Text>
                </View>
                
                <View className="flex-row justify-between items-center mt-2">
                  {service.isPaid ? (
                    <Text className="text-blue-600 font-medium">{service.price}</Text>
                  ) : (
                    <Text className="text-green-600 font-medium">{service.note}</Text>
                  )}
                  <Ionicons name="chevron-forward" size={18} color="#666" />
                </View>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}