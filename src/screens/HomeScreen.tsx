import { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { supabase } from "../utils/supabase";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../types/RootStackParamList";
import { Ionicons } from "@expo/vector-icons";

// Updated interface with correct amenities type
interface Resort {
  id: number;
  name: string;
  location: string;
  image_url: string;
  rating: number;
  amenities: {
    [key: string]: boolean;
  };
  about: string;
}

type HomeScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Home"
>;

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
        .from("Resorts Table")
        .select("id, name, location, image_url, rating, amenities, about")
        .order("rating", { ascending: false })
        .limit(5);

      if (error) throw error;

      setFeaturedResorts(data as Resort[]);
      setError(null);
    } catch (error: any) {
      console.error("Error fetching resorts:", error);
      setError("Failed to load resorts. Please try again later.");
    } finally {
      setLoading(false);
    }
  }

  // Render a star rating component
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
      <View className="flex-row items-center mt-1">
        {stars}
        <Text className="text-sm text-gray-600 ml-1">
          ({rating.toFixed(1)})
        </Text>
      </View>
    );
  };

  // Updated to handle amenities as an object with boolean values
  const renderAmenities = (amenities: { [key: string]: boolean } | null) => {
    if (!amenities) return null;

    // Get only amenities that are true
    const availableAmenities = Object.entries(amenities)
      .filter(([_, value]) => value === true)
      .map(([key]) => key);

    if (availableAmenities.length === 0) return null;

    const displayCount = Math.min(availableAmenities.length, 3);
    const displayAmenities = availableAmenities.slice(0, displayCount);

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
      <View className="flex-row flex-wrap mt-2">
        {displayAmenities.map((amenity) => (
          <View
            key={amenity}
            className="bg-gray-100 rounded-full px-2 py-1 mr-2 mb-1 flex-row items-center"
          >
            {amenityIcons[amenity] && (
              <Ionicons
                name={amenityIcons[amenity].icon as any}
                size={12}
                color="#555"
                style={{ marginRight: 4 }}
              />
            )}
            <Text className="text-xs text-gray-700">
              {amenityIcons[amenity]?.name ||
                amenity.charAt(0).toUpperCase() + amenity.slice(1)}
            </Text>
          </View>
        ))}
        {availableAmenities.length > displayCount && (
          <View className="bg-gray-100 rounded-full px-2 py-1">
            <Text className="text-xs text-gray-700">
              +{availableAmenities.length - displayCount} more
            </Text>
          </View>
        )}
      </View>
    );
  };

  const renderResortCard = ({ item }: { item: Resort }) => (
    <TouchableOpacity
      className="bg-white rounded-lg mb-4 shadow-md overflow-hidden"
      onPress={() =>
        navigation.navigate("ResortDetail", {
          resortId: item.id,
          resortName: item.name,
        })
      }
    >
      <Image
        source={{
          uri: item.image_url || "https://via.placeholder.com/300x200",
        }}
        className="w-full h-48"
        resizeMode="cover"
      />
      <View className="p-4">
        <Text className="text-lg font-bold">{item.name}</Text>
        <View className="flex-row items-center mt-1">
          <Ionicons name="location" size={14} color="#666" />
          <Text className="text-sm text-gray-500 ml-1">{item.location}</Text>
        </View>
        {renderStars(item.rating)}
        {renderAmenities(item.amenities)}
      </View>
    </TouchableOpacity>
  );

  const EmptyState = () => (
    <View className="flex-1 justify-center items-center py-8">
      <Ionicons name="bed-outline" size={64} color="#ccc" />
      <Text className="text-gray-500 mt-4 text-center">No resorts found</Text>
      <TouchableOpacity
        className="mt-4 bg-blue-500 py-2 px-4 rounded-lg"
        onPress={fetchFeaturedResorts}
      >
        <Text className="text-white">Retry</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View className="flex-1 bg-gray-100">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Scrollable banner */}
        <View className="bg-white pt-6 pb-4 px-4 shadow-sm">
          <Text className="text-gray-600 text-center">
            Experience Ethiopian Culture in Luxury
          </Text>
        </View>

        {/* Loading/Error/Main Content */}
        {loading ? (
          <View className="justify-center items-center mt-20">
            <ActivityIndicator size="large" color="#0066cc" />
            <Text className="mt-2 text-gray-600">Loading resorts...</Text>
          </View>
        ) : error ? (
          <View className="justify-center items-center p-4 mt-10">
            <Ionicons name="alert-circle-outline" size={48} color="#f87171" />
            <Text className="text-red-500 text-center mt-2">{error}</Text>
            <TouchableOpacity
              className="mt-4 bg-blue-500 py-2 px-4 rounded-lg"
              onPress={fetchFeaturedResorts}
            >
              <Text className="text-white">Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View className="p-4">
            <FlatList
              data={featuredResorts}
              renderItem={renderResortCard}
              keyExtractor={(item) => item.id.toString()}
              ListEmptyComponent={<EmptyState />}
              scrollEnabled={false} // flatlist doesn't scroll, scrollview handles that
            />
          </View>
        )}
      </ScrollView>

      {/* Fixed Bottom Button */}
      <View className="absolute bottom-0 left-0 right-0 bg-white p-4 border-t border-gray-200">
        <TouchableOpacity
          className="bg-blue-600 py-4 rounded-lg items-center shadow-md"
          onPress={() => navigation.navigate("ResortList")}
        >
          <Text className="text-white text-lg font-semibold">
            View All Resorts
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
