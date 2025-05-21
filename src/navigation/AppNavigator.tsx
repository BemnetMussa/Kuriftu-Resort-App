// // src/navigation/AppNavigator.js
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../types/RootStackParamList";
// import HomeScreen from "../screens/HomeScreen";
// import ResortListScreen from "../screens/ResortListScreen";
import ResortDetailScreen from "../screens/ResortDetailScreen";
// import ServicesScreen from "../screens/ServicesScreen";
// import EventsScreen from "../screens/EventScreen";
import { useAuth } from "../utils/AuthProvider";
import LoginScreen from "../screens/Auth/LoginScreen";
import SignUpScreen from "../screens/Auth/SignUpScreen";
// import { Image, TouchableOpacity } from "react-native";
// import ProfileScreen from "../screens/ProfileScreen";
// import { Ionicons } from "@expo/vector-icons";
import BottomTabs from "../components/BottomTabs";

const Stack = createNativeStackNavigator<RootStackParamList>();

// export default function AppNavigator() {
//   const { session } = useAuth();

//   return (
//     <NavigationContainer>
//       <Stack.Navigator>
//         {!session ? (
//           <>
//             <Stack.Screen
//               name="Login"
//               component={LoginScreen}
//               options={{ headerShown: false }}
//             />
//             <Stack.Screen
//               name="SignUp"
//               component={SignUpScreen}
//               options={{ headerShown: false }}
//             />
//           </>
//         ) : (
//           <>
//             <Stack.Screen
//               name="Home"
//               component={HomeScreen}
//               options={({ navigation }) => ({
//                 title: "Featured Resorts",
//                 headerRight: () => (
//                   <TouchableOpacity
//                     onPress={() => {
//                       console.log("Button pressed");
//                       navigation.navigate("Profile");
//                     }}
//                     activeOpacity={0.7}
//                   >
//                     <Ionicons name="person" size={20} color="black" />
//                   </TouchableOpacity>
//                 ),
//               })}
//             />
//             <Stack.Screen
//               name="ResortList"
//               component={ResortListScreen}
//               options={{ title: "All Resorts" }}
//             />
//             <Stack.Screen
//               name="ResortDetail"
//               component={ResortDetailScreen}
//               options={({ route }) => ({
//                 title: route.params.resortName,
//               })}
//             />
//             <Stack.Screen
//               name="Services"
//               component={ServicesScreen}
//               options={{ title: "Services" }}
//             />
//             <Stack.Screen
//               name="Events"
//               component={EventsScreen}
//               options={{ title: "Events" }}
//             />
//             <Stack.Screen
//               name="Profile"
//               component={ProfileScreen}
//               options={{ title: "Profile" }}
//             />
//             <BottomTabs />
//           </>
//         )}
//       </Stack.Navigator>
//     </NavigationContainer>
//   );
// }

export default function AppNavigator() {
  const { session } = useAuth();

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!session ? (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="SignUp" component={SignUpScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="BottomTabs" component={BottomTabs} />
            <Stack.Screen
              name="ResortDetail"
              component={ResortDetailScreen}
              options={({ route }) => ({
                headerShown: true,
                title: route.params.resortName,
              })}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
