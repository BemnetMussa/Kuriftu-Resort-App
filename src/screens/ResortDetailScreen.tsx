import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
  Linking,
  Alert,
  Platform,
} from "react-native";
import { supabase } from "../utils/supabase";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp } from "@react-navigation/native";
import { RootStackParamList } from "../../types/RootStackParamList";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { WebView } from "react-native-webview";

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

interface Coordinate {
  latitude: number;
  longitude: number;
}

export default function ResortDetailScreen({
  route,
  navigation,
}: ResortDetailScreenProps) {
  const { resortId } = route.params;
  const [resort, setResort] = useState<Resort | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState<Coordinate | null>(null);
  const [routeCoords, setRouteCoords] = useState([]);
  const [distance, setDistance] = useState("");
  const [duration, setDuration] = useState("");
  const mapRef = useRef<WebView | null>(null);

  const [activeTab, setActiveTab] = useState<
    "about" | "map" | "services" | "events"
  >("about");

  const screenWidth = Dimensions.get("window").width;

  // some random resort location, but we set the location(lat, and lon) manualy in the supabase for every resorts
  const destination: Coordinate = {
    latitude: 9.03045,
    longitude: 38.7653,
  };

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

  // fetch the map form gebeta
  // const fetchGebetaRoute = async ({
  //   origin,
  //   destination,
  //   apiKey,
  // }: {
  //   origin: Coordinate;
  //   destination: Coordinate;
  //   apiKey: string;
  // }) => {
  //   try {
  //     const response = await fetch(
  //       `https://mapapi.gebeta.app/api/route/direction/?origin={${origin.latitude},${origin.longitude}}&destination={${destination.latitude},${destination.longitude}}&apiKey=${apiKey}`
  //     );
  //     const data = await response.json();
  //     console.log("Gebeta API Response:", data);
  //   } catch (error) {
  //     console.error("Error fetching route from Gebeta:", error);
  //   }
  // };

  useEffect(() => {
    const mapApi = process.env.EXPO_PUBLIC_MAP as string;

    const fetchRoute = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Denied", "Please allow location access.");
        return;
      }

      const userLocation = await Location.getCurrentPositionAsync({});
      const origin = {
        latitude: userLocation.coords.latitude,
        longitude: userLocation.coords.longitude,
      };
      setLocation(origin);

      // Send user location to WebView
      mapRef.current?.postMessage(
        JSON.stringify({
          type: "setUserLocation",
          lat: origin.latitude,
          lng: origin.longitude,
        })
      );

      try {
        const url =
          "https://api.openrouteservice.org/v2/directions/driving-car/geojson";

        const body = {
          coordinates: [
            [origin.longitude, origin.latitude],
            [destination.longitude, destination.latitude],
          ],
        };

        const response = await fetch(url, {
          method: "POST",
          headers: {
            Authorization: mapApi,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        const coordinates = data.features[0].geometry.coordinates.map(
          ([lon, lat]: [number, number]) => ({
            latitude: lat,
            longitude: lon,
          })
        );
        setRouteCoords(coordinates);

        // Send route to WebView
        mapRef.current?.postMessage(
          JSON.stringify({
            type: "addRoute",
            coordinates,
          })
        );

        const summary = data.features[0].properties.summary;
        setDistance((summary.distance / 1000).toFixed(2) + " km");
        setDuration((summary.duration / 60).toFixed(1) + " min");
      } catch (error) {
        console.error("ORS error:", error);
        Alert.alert("Routing Error", "Could not fetch route from ORS.");
      }
    };

    fetchRoute();
  }, []);

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
        {/* map */}
        {/* <View className="bg-gray-200 h-40 rounded-lg mt-2 items-center justify-center">
          <Ionicons name="map" size={48} color="#aaa" />
          <Text className="text-sm text-gray-500 mt-2">
            Map will be displayed here
          </Text>
        </View> */}

        {/* <View className={`flex-1`}>
          <MapView
            ref={mapRef}
            className={`w-full h-full`}
            showsUserLocation
            initialRegion={{
              latitude: destination.latitude,
              longitude: destination.longitude,
              latitudeDelta: 0.05,
              longitudeDelta: 0.05,
            }}
          >
            {location && <Marker coordinate={location} title="Your Location" />}
            <Marker coordinate={destination} title="Kuriftu Resort" />
            {routeCoords.length > 0 && (
              <Polyline
                coordinates={routeCoords}
                strokeColor="#1E90FF"
                strokeWidth={4}
              />
            )}
          </MapView>

          {distance && duration && (
            <View
              className={`absolute bottom-10 left-5 right-5 bg-white p-4 rounded-xl shadow-lg`}
            >
              <Text className={`text-lg font-semibold`}>
                Distance: {distance}
              </Text>
              <Text className={`text-lg font-semibold`}>
                Estimated Time: {duration}
              </Text>
            </View>
          )}
        </View> */}

        <View className="h-[300px] mt-2 rounded-lg overflow-hidden relative bg-gray-100">
          <WebView
            ref={mapRef}
            source={require("../assets/map.html")}
            className="flex-1 h-full w-full border-2"
            originWhitelist={["*"]}
            onMessage={(event) => {
              try {
                const data = JSON.parse(event.nativeEvent.data);
                if (data.type === "mapReady") {
                  console.log("Map is ready");
                } else if (data.type === "error") {
                  console.error("Map HTML error:", data);
                }
              } catch (error) {
                console.error("Error processing WebView message:", error);
              }
            }}
            scalesPageToFit={true}
            scrollEnabled={true}
          />
          {distance && duration && (
            <View className="absolute bottom-3 left-3 right-3 bg-white/90 p-3 rounded-lg shadow-lg">
              <Text className="text-base font-semibold text-gray-800">
                Distance: {distance}
              </Text>
              <Text className="text-base font-semibold text-gray-800">
                Estimated Time: {duration}
              </Text>
            </View>
          )}
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
