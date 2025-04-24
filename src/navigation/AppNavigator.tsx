// src/navigation/AppNavigator.js
import { NavigationContainer, useNavigation } from "@react-navigation/native";
import {
  createNativeStackNavigator,
  NativeStackNavigationProp,
} from "@react-navigation/native-stack";
import { RootStackParamList } from "../../types/RootStackParamList";
import HomeScreen from "../screens/HomeScreen";
import ResortListScreen from "../screens/ResortListScreen";
import ResortDetailScreen from "../screens/ResortDetailScreen";
import ServicesScreen from "../screens/ServicesScreen";
import EventsScreen from "../screens/EventScreen";
import { useAuth } from "../utils/AuthProvider";
import LoginScreen from "../screens/Auth/LoginScreen";
import SignUpScreen from "../screens/Auth/SignUpScreen";
import { Image, TouchableOpacity } from "react-native";

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const { session } = useAuth();

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {!session ? (
          <>
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="SignUp"
              component={SignUpScreen}
              options={{ headerShown: false }}
            />
          </>
        ) : (
          <>
            <Stack.Screen
              name="Home"
              component={HomeScreen}
              options={({ navigation }) => ({
                title: "Featured Resorts",
                // headerRight: () => (
                //   <TouchableOpacity
                //     onPress={() => navigation.navigate("Profile")}
                //   >
                //     <Image
                //       source={require("../assets/favicon.png")} // or use a URI
                //       style={{
                //         width: 30,
                //         height: 30,
                //         borderRadius: 15,
                //         marginRight: 10,
                //       }}
                //     />
                //   </TouchableOpacity>
                // ),
              })}
            />
            <Stack.Screen
              name="ResortList"
              component={ResortListScreen}
              options={{ title: "All Resorts" }}
            />
            <Stack.Screen
              name="ResortDetail"
              component={ResortDetailScreen}
              options={({ route }) => ({
                title: route.params.resortName,
              })}
            />
            <Stack.Screen
              name="Services"
              component={ServicesScreen}
              options={{ title: "Services" }}
            />
            <Stack.Screen
              name="Events"
              component={EventsScreen}
              options={{ title: "Events" }}
            />
            {/* <Stack.Screen
              name="Profile"
              component={ProfileScreen}
              options={{ title: "Profile" }}
            /> */}
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
