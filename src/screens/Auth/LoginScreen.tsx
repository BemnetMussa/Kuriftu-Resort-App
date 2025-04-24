import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { RootStackParamList } from "../../../types/RootStackParamList";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useAuth } from "../../utils/AuthProvider";

export default function SignInScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const { signIn } = useAuth();

  async function handleSignIn() {
    setLoading(true);
    try {
      await signIn(email, password);
      navigation.navigate("ResortList");
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  }

  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <View className="flex-1 justify-center px-6 bg-white gap-5">
      <View className="flex items-center">
        <Text className="text-5xl font-extrabold tracking-wider text-blue-500">
          Welcome Back
        </Text>
      </View>
      <TextInput
        className="h-12 border border-gray-300 rounded-lg px-4 mb-4"
        placeholder="Email"
        autoCapitalize="none"
        onChangeText={setEmail}
        value={email}
        keyboardType="email-address"
      />
      <TextInput
        className="h-12 border border-gray-300 rounded-lg px-4 mb-4"
        placeholder="Password"
        secureTextEntry
        onChangeText={setPassword}
        value={password}
      />
      <TouchableOpacity
        className={`bg-blue-600 py-3 rounded-lg items-center ${
          loading ? "opacity-50" : ""
        }`}
        onPress={handleSignIn}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text className="text-white font-bold text-lg">Sign In</Text>
        )}
      </TouchableOpacity>
      <View className="mt-4 items-center">
        <Text>
          Don't have an account?{" "}
          <Text
            className="text-blue-600 font-semibold"
            onPress={() => navigation.navigate("SignUp")}
          >
            Sign up
          </Text>
        </Text>
      </View>
    </View>
  );
}
