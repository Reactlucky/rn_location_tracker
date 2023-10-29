import React from 'react';
import {View, Text, TextInput, TouchableOpacity, Image, Linking} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import imagePath from '../constants/imagePath';

function Home() {
  const [text, onChangeText] = React.useState('');
  const navigation = useNavigation();

  return (
    <View style={{flex: 1, backgroundColor: '#d4d4d4'}}>
       <Image
          source={imagePath.logo}
          style={{height: 40, width: 250, resizeMode: 'contain', margin:10, alignSelf: 'center'}}
        />
      <View
        style={{
          flex: 1,
          backgroundColor: '#f2f2f2',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
       
        <Text style={{color: '#000'}}>Enter the User ID</Text>
        <TextInput
          style={{
            height: 40,
            margin: 12,
            borderWidth: 1,
            padding: 10,
            width: 200,
            borderRadius: 25,
            color: '#000',
          }}
          onChangeText={onChangeText}
          value={text}
        />

        <TouchableOpacity
          disabled={text === ''}
          style={{
            backgroundColor: text !== '' ? '#7F00FF' : '#d2d2d2',
            height: 35,
            width: 95,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 25,
          }}
          onPress={() => navigation.navigate('Map', {user_id: text})}>
          <Text style={{color: '#fff', fontWeight: 'bold'}}>Next</Text>
        </TouchableOpacity>

        <Text style={{color:'#000', marginTop: 25, textAlign:'center'}}>Please note: Allow the location permission to 'Always' from app settings for background. To enable that 
        <Text onPress={() => Linking.openSettings()} style={{color: '#000', fontWeight: 'bold'}}>{' '}Click here</Text>
        <Text onPress={() => Linking.openSettings()} style={{color: '#000'}}> and disable the battery saver.</Text>
        </Text>

         

      </View>
    </View>
  );
}

export default Home;
