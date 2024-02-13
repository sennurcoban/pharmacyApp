import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';

const MyCustomTabBar = ({ state, descriptors, navigation }) => {
  return (
    <View style={{ flexDirection: 'row', backgroundColor: '#333333', height: 70 }}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label = options.tabBarLabel !== undefined
          ? options.tabBarLabel
          : options.title !== undefined
          ? options.title
          : route.name;

        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <TouchableOpacity
            key={index}
            onPress={onPress}
            style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
          >
            <Text style={{ color: isFocused ? '#828282' : 'gray' }}>{label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export default MyCustomTabBar;
