import React, { useState } from 'react';
import { View, Text, Button } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import BottomSheet from '@gorhom/bottom-sheet'; 

const Tab = createBottomTabNavigator();

const SearchScreen = () => {
  const [isVisible, setIsVisible] = useState(false);

  const toggleBottomSheet = () => {
    setIsVisible(!isVisible);
  };

  return (
    <>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Search Screen</Text>
        <Button title="Open Bottom Sheet" onPress={toggleBottomSheet} />
      </View>
      <BottomSheet
        index={0}
        snapPoints={['25%', '50%', '75%']}
        isVisible={isVisible}
        onClose={toggleBottomSheet}
      >
        <View style={{ height: 200, backgroundColor: 'white' }}>
          <Text>Bottom Sheet Content</Text>
        </View>
      </BottomSheet>
    </>
  );
};

export default SearchScreen;
