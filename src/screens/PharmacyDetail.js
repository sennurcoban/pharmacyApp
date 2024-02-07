import { StyleSheet, Text, View } from 'react-native'
import React from 'react'

const PharmacyDetail = ({route}) => {
    const { pharmacyId } = route.params;
  return (
       <Text>{pharmacyId.id}</Text>
  )
}

export default PharmacyDetail

const styles = StyleSheet.create({})