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

// Define the Event type
type Event = {
  id: number;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  image: string;
  isFree: boolean;
  price?: string;
};

interface EventContentProps {
  resortId: string;
}

export default function EventContent({ resortId }: EventContentProps) {
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<Event[]>([]);

  // Fetch events for this resort
  useEffect(() => {
    async function fetchEvents() {
      try {
        setLoading(true);
        
        // You would replace this with your actual API call
        // For now, using mock data
        const mockEvents: Event[] = [
          {
            id: 1,
            title: "Ethiopian Coffee Ceremony",
            description: "Experience the traditional Ethiopian coffee ceremony with local experts.",
            date: "May 10, 2025",
            time: "10:00 AM - 12:00 PM",
            location: "Main Garden",
            image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-NQ5loIIaeeEEFifw0Nv5sbDt7vTOyi.png", // Replace with actual image
            isFree: true,
          },
          {
            id: 2,
            title: "Timket Festival Celebration",
            description: "Join us for a colorful celebration of Timket, the Ethiopian Epiphany.",
            date: "May 15, 2025",
            time: "4:00 PM - 8:00 PM",
            location: "Lakeside Pavilion",
            image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-NQ5loIIaeeEEFifw0Nv5sbDt7vTOyi.png", // Replace with actual image
            isFree: true,
          },
          {
            id: 3,
            title: "Traditional Music Night",
            description: "Enjoy live Ethiopian music performed by local artists.",
            date: "May 20, 2025",
            time: "7:00 PM - 10:00 PM",
            location: "Main Restaurant",
            image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-NQ5loIIaeeEEFifw0Nv5sbDt7vTOyi.png", // Replace with actual image
            isFree: false,
            price: "500 ETB",
          },
          {
            id: 4,
            title: "Lake Tana Boat Tour",
            description: "Discover the historic monasteries and wildlife of Lake Tana.",
            date: "May 25, 2025",
            time: "9:00 AM - 2:00 PM",
            location: "Resort Dock",
            image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-NQ5loIIaeeEEFifw0Nv5sbDt7vTOyi.png", // Replace with actual image
            isFree: false,
            price: "800 ETB",
          },
        ];
        
        // In a real app, you would fetch from Supabase like this:
        // const { data, error } = await supabase
        //   .from('events')
        //   .select('*')
        //   .eq('resort_id', resortId);
        
        // if (error) throw error;
        // setEvents(data);
        
        setEvents(mockEvents);
      } catch (error) {
        console.error("Error fetching events:", error);
        Alert.alert("Error", "Failed to load events");
      } finally {
        setLoading(false);
      }
    }
    
    fetchEvents();
  }, [resortId]);

  const handleRSVP = (eventId: number) => {
    Alert.alert(
      "RSVP Confirmation",
      "Would you like to reserve your spot for this event?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Confirm",
          onPress: () => {
            Alert.alert("Success", "You have successfully RSVP'd for this event!");
          },
        },
      ]
    );
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
        <Text className="text-2xl font-bold mb-2">Upcoming Events</Text>
        <Text className="text-gray-600 mb-6">
          Discover and participate in traditional Ethiopian events and activities
        </Text>

        {events.map((event) => (
          <View
            key={event.id}
            className="mb-6 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
          >
            <Image
              source={{ uri: event.image }}
              className="w-full h-48"
              resizeMode="cover"
            />
            <View className="p-4">
              <View className="flex-row justify-between items-start">
                <Text className="text-xl font-bold flex-1 mr-2">{event.title}</Text>
                {!event.isFree && (
                  <View className="bg-amber-100 px-3 py-1 rounded-full">
                    <Text className="text-amber-800 font-medium text-xs">
                      {event.price}
                    </Text>
                  </View>
                )}
                {event.isFree && (
                  <View className="bg-green-100 px-3 py-1 rounded-full">
                    <Text className="text-green-800 font-medium text-xs">Free</Text>
                  </View>
                )}
              </View>
              
              <Text className="text-gray-600 mt-2 mb-3">{event.description}</Text>
              
              <View className="flex-row items-center mb-2">
                <Ionicons name="calendar" size={16} color="#666" style={{marginRight: 8}} />
                <Text className="text-gray-600">{event.date}</Text>
              </View>
              
              <View className="flex-row items-center mb-2">
                <Ionicons name="time" size={16} color="#666" style={{marginRight: 8}} />
                <Text className="text-gray-600">{event.time}</Text>
              </View>
              
              <View className="flex-row items-center mb-4">
                <Ionicons name="location" size={16} color="#666" style={{marginRight: 8}} />
                <Text className="text-gray-600">{event.location}</Text>
              </View>
              
              <TouchableOpacity
                onPress={() => handleRSVP(event.id)}
                className="bg-blue-600 py-3 rounded-lg items-center"
              >
                <Text className="text-white font-semibold">RSVP</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}