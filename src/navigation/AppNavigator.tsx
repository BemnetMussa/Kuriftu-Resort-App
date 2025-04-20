// src/navigation/AppNavigator.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/RootStackParamList';

import HomeScreen from '../screens/HomeScreen';
import ResortListScreen from '../screens/ResortListScreen';
import ResortDetailScreen from '../screens/ResortDetailScreen';
import ServicesScreen from '../screens/ServicesScreen';
import EventsScreen from '../screens/EventScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Kuriftu Resorts', headerTitleAlign: "center" }} />
         <Stack.Screen name="ResortList" component={ResortListScreen} options={{ title: 'All Resorts' }} />
        <Stack.Screen 
          name="ResortDetail" 
          component={ResortDetailScreen} 
          options={({ route }) => ({ title: route.params.resortName })} 
        />
        <Stack.Screen name="Services" component={ServicesScreen} />
        <Stack.Screen name="Events" component={EventsScreen} />  
      </Stack.Navigator>
    </NavigationContainer>
  );
}