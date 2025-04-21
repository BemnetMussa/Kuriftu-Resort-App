import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
  Linking,
} from "react-native";
import { supabase } from "../utils/supabase";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp } from "@react-navigation/native";
import { RootStackParamList } from "../../types/RootStackParamList";
import { Ionicons } from "@expo/vector-icons";

type Resort = {
  id: string;
  name: string;
  image_url: string;
  location: string;
  description: string;
  rating: number;
  amenities: {
    [key: string]: boolean;
  };
  about: string;
};

type ResortDetailScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "ResortDetail"
>;

type ResortDetailScreenRouteProp = RouteProp<
  RootStackParamList,
  "ResortDetail"
>;

interface ResortDetailScreenProps {
  route: ResortDetailScreenRouteProp;
  navigation: ResortDetailScreenNavigationProp;
}

export default function ResortDetailScreen({
  route,
  navigation,
}: ResortDetailScreenProps) {
  const { resortId } = route.params;
  const [resort, setResort] = useState<Resort | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    "about" | "map" | "services" | "events"
  >("about");

  const screenWidth = Dimensions.get("window").width;

  useEffect(() => {
    fetchResortDetails();
  }, [resortId]);

  async function fetchResortDetails() {
    try {
      setLoading(true);

      // Fetch resort details
      const { data: resortData, error: resortError } = await supabase
        .from("Resorts Table")
        .select("*")
        .eq("id", resortId)
        .single();

      if (resortError) throw resortError;
      setResort(resortData);
      setError(null); // Clear any previous error
    } catch (error) {
      console.error("Error fetching resort details:", error);
      setError("Failed to load resort information. Please try again later.");
    } finally {
      setLoading(false);
    }
  }

  // handle payment
  const handlePayment = async () => {
    try {
      const res = await fetch(
        "https://eorhquvegduxpfwdjsgy.supabase.co/functions/v1/payments",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization:
              "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVvcmhxdXZlZ2R1eHBmd2Rqc2d5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ2NjY4MjUsImV4cCI6MjA2MDI0MjgyNX0.nzOSFZISe84H3gGLw5qmzHrHr3tGgYHjsygWryC4IIQ",
          },
          body: JSON.stringify({
            amount: 1000,
            currency: "ETB",
            user_id: "123e4567-e89b-12d3-a456-426614174000",
            type: "event",
            item_id: 1,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok || !data.redirectUrl || !data.chapa_tx_ref) {
        throw new Error(data.error || "Something went wrong");
      }

      const chapaURL = `${data.redirectUrl}?tx_ref=${data.chapa_tx_ref}`;

      //  Open Chapa in external browser (React Native way)
      const supported = await Linking.canOpenURL(chapaURL);
      if (supported) {
        await Linking.openURL(chapaURL);
      } else {
        alert("Can't open payment page.");
      }
    } catch (error) {
      console.error("Payment Error:", error);
      alert("Payment failed. Please try again.");
    }
  };

  // Helper function to render amenities
  const renderAmenities = () => {
    if (!resort?.amenities) return null;

    // Get only amenities that are true
    const availableAmenities = Object.entries(resort.amenities)
      .filter(([_, value]) => value === true)
      .map(([key]) => key);

    if (availableAmenities.length === 0) return null;

    // Map amenity keys to more user-friendly names and icons
    const amenityIcons: { [key: string]: { name: string; icon: string } } = {
      wifi: { name: "Wi-Fi", icon: "wifi" },
      pool: { name: "Pool", icon: "water" },
      gym: { name: "Gym", icon: "fitness" },
      spa: { name: "Spa", icon: "sparkles" },
      restaurant: { name: "Restaurant", icon: "restaurant" },
      bar: { name: "Bar", icon: "wine" },
      parking: { name: "Parking", icon: "car" },
      ac: { name: "A/C", icon: "thermometer" },
    };

    return (
      <View className="flex-row flex-wrap mt-4">
        {availableAmenities.map((amenity) => (
          <View
            key={amenity}
            className="bg-gray-100 rounded-lg px-3 py-2 mr-2 mb-2 flex-row items-center"
          >
            <Ionicons
              name={(amenityIcons[amenity]?.icon as any) || "checkmark-circle"}
              size={16}
              color="#555"
              style={{ marginRight: 6 }}
            />
            <Text className="text-sm text-gray-700">
              {amenityIcons[amenity]?.name ||
                amenity.charAt(0).toUpperCase() + amenity.slice(1)}
            </Text>
          </View>
        ))}
      </View>
    );
  };

  // Render stars for rating
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <Ionicons key={`star-${i}`} name="star" size={16} color="#FFD700" />
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <Ionicons
            key={`star-half-${i}`}
            name="star-half"
            size={16}
            color="#FFD700"
          />
        );
      } else {
        stars.push(
          <Ionicons
            key={`star-outline-${i}`}
            name="star-outline"
            size={16}
            color="#FFD700"
          />
        );
      }
    }

    return (
      <View className="flex-row items-center">
        {stars}
        <Text className="text-sm text-gray-600 ml-1">
          ({rating.toFixed(1)})
        </Text>
      </View>
    );
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#0066cc" />
        <Text className="mt-2 text-gray-600">Loading resort details...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center p-5">
        <Ionicons name="alert-circle-outline" size={48} color="#f87171" />
        <Text className="text-red-500 text-lg text-center mt-2">{error}</Text>
        <TouchableOpacity
          className="mt-4 bg-blue-500 py-2 px-4 rounded-lg"
          onPress={fetchResortDetails}
        >
          <Text className="text-white">Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const renderAboutTab = () => (
    <ScrollView className="flex-1 px-4">
      <View className="mb-6 mt-4">
        <Text className="text-lg font-semibold text-gray-800 mb-2">About</Text>
        <Text className="text-base text-gray-600 leading-6">
          {resort?.about || "no description for this resort"}
        </Text>
      </View>

      <View className="mb-6">
        <Text className="text-lg font-semibold text-gray-800 mb-2">
          Amenities
        </Text>
        {renderAmenities()}
      </View>

      <View className="mb-6">
        <Text className="text-lg font-semibold text-gray-800 mb-2">
          Location
        </Text>
        <View className="flex-row items-center">
          <Ionicons name="location" size={16} color="#666" />
          <Text className="text-base text-gray-600 ml-1">
            {resort?.location}
          </Text>
        </View>
        <View className="bg-gray-200 h-40 rounded-lg mt-2 items-center justify-center">
          <Ionicons name="map" size={48} color="#aaa" />
          <Text className="text-sm text-gray-500 mt-2">
            Map will be displayed here
          </Text>
        </View>
      </View>
    </ScrollView>
  );

  return (
    <View className="flex-1 bg-white">
      {/* Header image */}
      <Image
        source={{
          uri: resort?.image_url || "https://via.placeholder.com/400x300",
        }}
        className="w-full h-72"
        resizeMode="cover"
      />

      {/* Resort info */}
      <View className="px-4 pt-4">
        <Text className="text-2xl font-bold text-gray-800">{resort?.name}</Text>

        <View className="flex-row justify-between items-center mt-1">
          <View className="flex-row items-center">
            <Ionicons name="location" size={16} color="#666" />
            <Text className="text-sm text-gray-500 ml-1">
              {resort?.location}
            </Text>
          </View>

          {resort?.rating ? renderStars(resort.rating) : null}
        </View>
      </View>

      {/* Navigation tabs */}
      <View className="flex-row px-4 border-b border-gray-200">
        <TouchableOpacity
          className={`py-3 mr-4 ${
            activeTab === "about" ? "border-b-2 border-blue-600" : ""
          }`}
          onPress={() => setActiveTab("about")}
        >
          <Text
            className={`${
              activeTab === "about"
                ? "text-blue-600 font-semibold"
                : "text-gray-600"
            }`}
          >
            About
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className={`py-3 mr-4 ${
            activeTab === "services" ? "border-b-2 border-blue-600" : ""
          }`}
          onPress={() => setActiveTab("services")}
        >
          <Text
            className={`${
              activeTab === "services"
                ? "text-blue-600 font-semibold"
                : "text-gray-600"
            }`}
          >
            Services
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className={`py-3 ${
            activeTab === "events" ? "border-b-2 border-blue-600" : ""
          }`}
          onPress={() => setActiveTab("events")}
        >
          <Text
            className={`${
              activeTab === "events"
                ? "text-blue-600 font-semibold"
                : "text-gray-600"
            }`}
          >
            Events
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab content */}
      <View className="flex-1">
        {activeTab === "about" && renderAboutTab()}
        {activeTab === "services" && (
          <View className="flex-1 items-center justify-center">
            <Text className="text-gray-500">
              Services content will be displayed here
            </Text>
          </View>
        )}
        {activeTab === "events" && (
          <View className="flex-1 items-center justify-center">
            <Text className="text-gray-500">
              Events content will be displayed here
            </Text>
          </View>
        )}
      </View>

      {/* Book button */}
      <View className="p-4 bg-white shadow-lg border-t border-gray-200">
        <TouchableOpacity
          className="bg-blue-600 py-4 rounded-lg items-center"
          onPress={handlePayment}
        >
          <Text className="text-white text-lg font-semibold">Book Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
