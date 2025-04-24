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
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../../types/RootStackParamList";
import { useAuth } from "../../utils/AuthProvider";

export default function SignUpScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const { signUp } = useAuth();

  async function handleSignUp() {
    setLoading(true);
    try {
      await signUp(email, password, name);
      Alert.alert("Success", "Check your inbox for a verification link!");
      navigation.navigate("Home");
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
        <Text className="text-3xl font-extrabold tracking-wider text-green-700">
          Welcome to Kuriftu Resort
        </Text>

        <Text className="mt-5 text-gray-500 font-semibold text-md">
          Create your account and start exploring unforgettable moments with us.
        </Text>
      </View>

      <TextInput
        className="h-12 border border-gray-300 rounded-lg px-4 mb-4"
        placeholder="Name"
        autoCapitalize="none"
        onChangeText={setName}
        value={name}
      />
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
        className={`bg-green-600 py-3 rounded-lg items-center ${
          loading ? "opacity-50" : ""
        }`}
        onPress={handleSignUp}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text className="text-white font-bold text-lg">Sign Up</Text>
        )}
      </TouchableOpacity>
      <View className="mt-4 items-center">
        <Text>
          Already have an account?{" "}
          <Text
            className="text-green-600 font-semibold"
            onPress={() => navigation.navigate("Login")}
          >
            Sign in
          </Text>
        </Text>
      </View>
    </View>
  );
}
