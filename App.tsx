import React from 'react';
import {
  StyleSheet,
  Text,
  View,
} from 'react-native';
import MapTracking from './screens/MapTracking';
import MapDiChuyen from './screens/Location';
import ShowLocation from './screens/ShowLocation';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
function App(): React.JSX.Element {
  
const Stack = createStackNavigator();
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="MapTracking" component={MapTracking} />
        <Stack.Screen name="ShowLocation" component={ShowLocation} />
      </Stack.Navigator>
    </NavigationContainer>
  );
  
}

const styles = StyleSheet.create({
  body: {
    backgroundColor: 'white',
    flex: 1,
    // justifyContent: 'center',
    // alignItems: 'center',
  },
});

export default App;
