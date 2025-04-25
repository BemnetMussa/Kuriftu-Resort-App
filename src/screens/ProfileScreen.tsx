import { useNavigation } from "@react-navigation/native";
import { useEffect, useState } from "react";
import {
  Alert,
  Image,
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../utils/AuthProvider";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../types/RootStackParamList";
import { Ionicons } from "@expo/vector-icons";

type ProfileScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Profile"
>;

export default function ProfileScreen() {
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const { signOut, session, user, updateUser } = useAuth();
  const [isEditModalVisible, setEditModalVisible] = useState(false);
  const [editedName, setEditedName] = useState(user?.name || "");
  const [editedEmail, setEditedEmail] = useState(user?.email || "");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setEditedName(user.name);
      setEditedEmail(user.email);
    }
  }, [user]);

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          try {
            await signOut();
            navigation.reset({
              index: 0,
              routes: [{ name: "Login" }],
            });
          } catch (error: any) {
            setError("Failed to log out. Please try again.");
          }
        },
      },
    ]);
  };

  const handleSaveEdit = async () => {
    try {
      await updateUser({ name: editedName, email: editedEmail });
      setEditModalVisible(false);
      setError(null);
    } catch (error: any) {
      setError(
        "Failed to update profile. Please check your input and try again."
      );
    }
  };

  if (!user) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-100">
        <Text className="text-lg text-gray-600">Loading user...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-100 px-5 pt-6">
      {/* Profile Header */}
      <View className="items-center mb-8">
        <View className="w-24 h-24 rounded-full overflow-hidden border-2 border-gray-300 mb-3">
          <Image
            source={
              typeof user.avatar === "string"
                ? { uri: user.avatar }
                : user.avatar
            }
            className="w-full h-full"
            resizeMode="cover"
          />
        </View>

        <Text className="text-2xl font-bold text-gray-800">{user.name}</Text>
        <Text className="text-base text-gray-500">{user.email}</Text>
      </View>

      {/* Error Message */}
      {error && (
        <View className="bg-red-100 p-3 rounded-lg mb-4">
          <Text className="text-red-600 text-center">{error}</Text>
        </View>
      )}

      {/* we put some of kuriftu unqiue values as images */}

      {/* Action Buttons */}
      <View className="flex-row gap-8 justify-center items-center mt-6">
        <TouchableOpacity
          className="flex-row items-center bg-blue-600 p-4 rounded-lg mb-4 shadow-md"
          onPress={() => setEditModalVisible(true)}
        >
          <Ionicons name="pencil" size={20} color="white" className="mr-3" />
          <Text className="text-white text-lg font-semibold">Edit Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="flex-row items-center bg-gray-600 p-4 rounded-lg mb-4 shadow-md"
          onPress={handleLogout}
        >
          <Ionicons name="log-out" size={20} color="white" className="mr-3" />
          <Text className="text-white text-lg font-semibold">Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Edit Profile Modal */}
      <Modal visible={isEditModalVisible} animationType="slide" transparent>
        <View className="flex-1 justify-center bg-black bg-opacity-50">
          <View className="bg-white m-5 p-6 rounded-lg">
            <Text className="text-xl font-bold text-gray-800 mb-5 text-center">
              Edit Profile
            </Text>
            <TextInput
              className="border border-gray-300 rounded-lg p-3 mb-4 text-base"
              value={editedName}
              onChangeText={setEditedName}
              placeholder="Name"
              placeholderTextColor="#999"
            />
            <TextInput
              className="border border-gray-300 rounded-lg p-3 mb-4 text-base"
              value={editedEmail}
              onChangeText={setEditedEmail}
              placeholder="Email"
              placeholderTextColor="#999"
              keyboardType="email-address"
            />
            <View className="flex-row justify-between">
              <TouchableOpacity
                className="flex-1 bg-gray-400 p-3 rounded-lg mr-2 items-center"
                onPress={() => setEditModalVisible(false)}
              >
                <Text className="text-white font-semibold">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 bg-blue-600 p-3 rounded-lg ml-2 items-center"
                onPress={handleSaveEdit}
              >
                <Text className="text-white font-semibold">Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
