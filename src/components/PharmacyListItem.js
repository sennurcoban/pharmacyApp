import { FlatList, StyleSheet, Text, View,Button, Pressable } from 'react-native'
import React from 'react'

const dummyData = [
    {
        id:1,
    pharmacyName:"Eczane Kırmızı",
    distance: 317,
    phoneNumber: 216878799,
    address:"vlkrvrejnvrkejnverv",
    street:"Aydınevler",
    discrit:"Maltepe",
},
{
    id:2,
    pharmacyName:"Yaşar Eczanesi",
    distance: 317,
    phoneNumber: 55555555,
    address:"vlkrvrejnvrkejnverv",
    street:"Aydınevler",
    discrit:"Maltepe",
},

]

const PharmacyListItem = ({item, onPress}) => {
  return (
    <Pressable onPress={onPress}>
      <FlatList data={dummyData} renderItem={
        ({item})=> (
        <View style={styles.container}>
            <View style={styles.nameContainer}>
            <Text style={styles.text}>{item.pharmacyName}</Text>
        <Text style={styles.text}>{item.distance}</Text>
            </View>
        <Text style={styles.text}>{item.phoneNumber}</Text>
        <Text style={styles.text}>{item.address}</Text>
        <Text style={styles.text}>{item.street}</Text>
        <Text style={styles.text}>{item.discrit}</Text>
        <View style={styles.buttonContainer}>
        <Button title='Yol Tarifi Al' />
        <Button title='Arama Yap'/>
       </View>
        </View>
      )} />
          </Pressable>
  )
}

export default PharmacyListItem

const styles = StyleSheet.create({
    container:{
        flex:1,
        padding:10
    },
    nameContainer:{
        flexDirection:'row',
        justifyContent:'space-between',
        padding:5
    },
    text:{
        fontSize:18
    },
    buttonContainer:{
        flexDirection:'row',
        justifyContent:'space-between'
    }
})