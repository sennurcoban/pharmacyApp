import React from 'react'
import { StyleSheet, Image, View, Pressable } from 'react-native'
import companyImage from '../../assets/intimelogo.png';

const LinkHeader = ({onPress}) => {
  return (
    <View>
    <Pressable onPress={onPress} style={styles.container}>
      <Image source={companyImage} style={styles.image} />
    </Pressable>
    </View>
  )
}

export default LinkHeader

const styles = StyleSheet.create({
    container: {
        display:"flex",
        backgroundColor:"#ffffff87",
        justifyContent:"center",
        alignItems:"center"
      },
      image:{
        objectFit:'contain',
        // backgroundColor:"red",
        height:50,
        width:120,
      }
})