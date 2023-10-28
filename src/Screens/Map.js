import React, {useState, useRef, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Image,
  Platform,
  Button,
  TextInput,
} from 'react-native';
import MapView, {Marker, AnimatedRegion} from 'react-native-maps';
import {GOOGLE_MAP_KEY} from '../constants/googleMapKey';
import imagePath from '../constants/imagePath';
import MapViewDirections from 'react-native-maps-directions';
import Loader from '../components/Loader';
import {locationPermission, getCurrentLocation} from '../helper/helperFunction';
import {useNavigation} from '@react-navigation/native';
import BackgroundTimer from 'react-native-background-timer';

const screen = Dimensions.get('window');
const ASPECT_RATIO = screen.width / screen.height;
const LATITUDE_DELTA = 0.04;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;
let usersData = [];

const Map = ({navigation, route}) => {
  // const navigation = useNavigation();

  const mapRef = useRef();
  const markerRef = useRef();

  const [newUserCord, setNewUserCord] = useState({
    latitude: 24.8852,
    longitude: 72.8575,
  });

  // ------------------FRIBE CODE-----------------

  const FribeClient = require('../FribeClient');

  // console.log('ruuning client...');

  const fribe = new FribeClient('01HBJYWF109Q3FEJX5X4748CNR');

  useEffect(() => {
    // fribe.subscribe('tasleem_channel', 'event_name', data => {
    //   console.log('subscribe --> ', data);
    //   setNewUserCord(data.coordinate);
    // });

    // Initialize an empty array to store user data

    fribe.subscribe('tasleem_channel', 'event_name', data => {
      // Check if the user with the given userID already exists in the array
      const existingUserIndex = usersData.findIndex(
        user => user.userId === data.userId,
      );

      if (existingUserIndex !== -1) {
        // If the user already exists, update their lat and long
        usersData[existingUserIndex].lat = data.coordinate.latitude;
        usersData[existingUserIndex].long = data.coordinate.longitude;
      } else {
        // If the user doesn't exist, create a new entry in the array
        const newUser = {
          userId: data.userId,
          lat: data.coordinate.latitude,
          long: data.coordinate.longitude,
        };
        usersData.push(newUser);
      }

      // Now usersData array contains data for multiple users
      console.log('Users Data: -----> ', usersData);

      // You can use this updated array to display the user data on your screens.
      // For example, you can map through the array to display each user's data in your UI.
    });
  }, []);

  fribe.listen('fribe:subscription_error', err => {
    console.log('subscription_error ---> ', err);
  });
  fribe.listen('fribe:subscription_sucess', msg => {
    console.log('subscription_sucess ---> ', msg);
  });

  const callTrigger = (latitude, longitude) => {
    console.log('trigger call ---> ', route?.params?.user_id);

    fribe.trigger('tasleem_channel', 'event_name', {
      coordinate: {
        latitude,
        longitude,
      },
      userId: route?.params?.user_id,
    });
  };

  const disconnectFribe = () => {
    fribe.unbind('tasleem_channel', 'event_name');
    console.log('Unbind call --> ');
    // fribe.disconnect();
    navigation.goBack();
    setShowMap(false);
  };

  // -----------------FRIBE CODE------------------

  const [state, setState] = useState({
    curLoc: {
      latitude: 30.7046,
      longitude: 77.1025,
    },
    // destinationCords: {
    //   latitude: 24.58,
    //   longitude: 73.7125,
    // },
    isLoading: false,
    coordinate: new AnimatedRegion({
      latitude: 30.7046,
      longitude: 77.1025,
      latitudeDelta: LATITUDE_DELTA,
      longitudeDelta: LONGITUDE_DELTA,
    }),
    time: 0,
    distance: 0,
    heading: 0,
  });

  const {
    curLoc,
    time,
    distance,
    destinationCords,
    isLoading,
    coordinate,
    heading,
  } = state;
  const updateState = data => setState(state => ({...state, ...data}));

  useEffect(() => {
    getLiveLocation();
  }, []);

  const getLiveLocation = async () => {
    console.log(' live call ----');
    
    const locPermissionDenied = await locationPermission();
    console.log(' locPermissionDenied----', locPermissionDenied);

    if (locPermissionDenied) {
      const {latitude, longitude, heading} = await getCurrentLocation();
      console.log('get live location after 4 second', heading);
      callTrigger(latitude, longitude, heading);
      animate(latitude, longitude);
      updateState({
        heading: heading,
        curLoc: {latitude, longitude},
        coordinate: new AnimatedRegion({
          latitude: latitude,
          longitude: longitude,
          latitudeDelta: LATITUDE_DELTA,
          longitudeDelta: LONGITUDE_DELTA,
        }),
      });
      // onCenter();
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      getLiveLocation();
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  // const onPressLocation = () => {
  //   navigation.navigate('chooseLocation', {getCordinates: fetchValue});
  // };
  // const fetchValue = data => {
  //   console.log('this is data', data);
  //   updateState({
  //     destinationCords: {
  //       latitude: 24.5854,
  //       longitude: 73.7125,
  //     },
  //   });
  // };

  const animate = (latitude, longitude) => {
    const newCoordinate = {latitude, longitude};
    if (Platform.OS == 'android') {
      if (markerRef.current) {
        markerRef.current.animateMarkerToCoordinate(newCoordinate, 7000);
      }
    } else {
      coordinate.timing(newCoordinate).start();
    }
  };

  const onCenter = () => {
    mapRef.current.animateToRegion({
      latitude: curLoc.latitude,
      longitude: curLoc.longitude,
      latitudeDelta: LATITUDE_DELTA,
      longitudeDelta: LONGITUDE_DELTA,
    });
  };

  const fetchTime = (d, t) => {
    updateState({
      distance: d,
      time: t,
    });
  };

  const [showMap, setShowMap] = useState(false);

  const showMapFunc = () => {
    setShowMap(true);
  };

  // console.log('destinationCords', destinationCords);

  return (
    <View style={styles.container}>
      <>
        {distance !== 0 && time !== 0 && (
          <View style={{alignItems: 'center', marginVertical: 16}}>
            <Text>Time left: {time.toFixed(0)} </Text>
            <Text>Distance left: {distance.toFixed(0)}</Text>
          </View>
        )}
        <View
          style={{
            backgroundColor: 'white',
            alignItems: 'center',
            justifyContent: 'center',
            height: 70,
          }}>
          <Image
            source={imagePath.logo}
            style={{height: 30, width: 250, resizeMode: 'contain'}}
          />
        </View>
        <View style={{flex: 1}}>
          <MapView
            ref={mapRef}
            style={StyleSheet.absoluteFill}
            initialRegion={{
              ...curLoc,
              latitudeDelta: LATITUDE_DELTA,
              longitudeDelta: LONGITUDE_DELTA,
            }}>
            <Marker.Animated ref={markerRef} coordinate={coordinate}>
              <Image
                source={imagePath.primaryMarker}
                style={{
                  width: 40,
                  height: 40,
                  transform: [{rotate: `${heading}deg`}],
                }}
                resizeMode="contain"
              />
            </Marker.Animated>

            {/* {Object.keys(destinationCords).length > 0 && (
                <Marker
                  coordinate={destinationCords}
                >
                  <Image source={imagePath.secondaryMarker} style={{height: 60, width: 60}} />
                </Marker>
              )} */}

            {/* <Marker
                coordinate={newUserCord}>
                <Image
                  source={imagePath.secondaryMarker}
                  style={{height: 60, width: 60,resizeMode:'contain'}}
                />
              </Marker> */}
            {usersData.map((user, index) => (
              <Marker
                key={index} // It's important to provide a unique key
                coordinate={{latitude: user.lat, longitude: user.long}}>
                <Image
                  source={imagePath.secondaryMarker}
                  style={{height: 60, width: 60, resizeMode: 'contain'}}
                />
              </Marker>
            ))}
          </MapView>
          <TouchableOpacity
            style={{
              position: 'absolute',
              bottom: 0,
              right: 0,
            }}
            onPress={onCenter}>
            <Image source={imagePath.greenIndicator} />
          </TouchableOpacity>
        </View>

        <Loader isLoading={isLoading} />
        <View
          style={{
            backgroundColor: '#fff',
            height: 100,
            width: '100%',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <Text style={{fontWeight: 'bold', fontSize: 18, color: '#000'}}>
            CurrentLocation: {curLoc.latitude} / {curLoc.longitude}
          </Text>

          <TouchableOpacity
            style={{
              backgroundColor: '#7F00FF',
              height: 35,
              width: 95,
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 25,
            }}
            onPress={disconnectFribe}>
            <Text style={{color: '#fff', fontWeight: 'bold'}}>Unbind</Text>
          </TouchableOpacity>
        </View>
      </>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  bottomCard: {
    backgroundColor: 'white',
    width: '100%',
    padding: 30,
    borderTopEndRadius: 24,
    borderTopStartRadius: 24,
  },
  inpuStyle: {
    backgroundColor: 'white',
    borderRadius: 4,
    borderWidth: 1,
    alignItems: 'center',
    height: 48,
    justifyContent: 'center',
    marginTop: 16,
  },
});

export default Map;
