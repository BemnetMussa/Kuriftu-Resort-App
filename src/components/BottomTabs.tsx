import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import HomeScreen from "../screens/HomeScreen";
import ResortListScreen from "../screens/ResortListScreen";
// import BookingsScreen from "../screens/BookingsScreen"; user should see the event and serives they bookked
import ProfileScreen from "../screens/ProfileScreen";

const Tab = createBottomTabNavigator();

export default function BottomTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: "#007AFF",
        tabBarInactiveTintColor: "gray",
        tabBarIcon: ({ color, size }) => {
          let iconName: any;

          if (route.name === "Home") iconName = "home-outline";
          else if (route.name === "ResortList") iconName = "search-outline";
          else if (route.name === "Bookings") iconName = "calendar";
          else if (route.name === "Profile") iconName = "person-outline";

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="ResortList" component={ResortListScreen} />
      {/* <Tab.Screen name="Bookings" component={BookingsScreen} /> */}
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
