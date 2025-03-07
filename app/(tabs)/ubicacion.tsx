import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import * as Location from 'expo-location';
import MapView, { Marker } from 'react-native-maps';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function Ubicacion() {
    const [location, setLocation] = useState({
        city: '',
        latitude: 0,
        longitude: 0,
        accuracy: 0,
        altitude: 0,
        heading: 0,
        speed: 0,
    });
    const [visitedLocations, setVisitedLocations] = useState([]);
    const navigation = useNavigation();

    useEffect(() => {
        navigation.setOptions({
            title: 'Ubicación',
            headerLeft: () => (
                <FontAwesome5
                    name="arrow-left"
                    size={20}
                    color="white"
                    style={{ marginLeft: 20, marginRight: 30 }}
                    onPress={() => navigation.goBack()}
                />
            ),
        });

        const fetchLocation = async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status === 'granted') {
                const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
                let cityName = '';

                const reverseGeocode = await Location.reverseGeocodeAsync({
                    latitude: loc.coords.latitude,
                    longitude: loc.coords.longitude,
                });

                if (reverseGeocode.length > 0) {
                    cityName = reverseGeocode[0].city || '';
                }

                const newLocation = {
                    city: cityName,
                    latitude: loc.coords.latitude,
                    longitude: loc.coords.longitude,
                    accuracy: loc.coords.accuracy ?? 0,
                    altitude: loc.coords.altitude ?? 0,
                    heading: loc.coords.heading ?? 0,
                    speed: loc.coords.speed ?? 0,
                };

                setLocation(newLocation);

                setVisitedLocations(prev => [...prev, newLocation]);
            }
        };

        fetchLocation();
    }, [navigation]);

    const initialRegion = {
        latitude: location.latitude !== 0 ? location.latitude : 40.4168,
        longitude: location.longitude !== 0 ? location.longitude : -3.7038,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
    };

    return (
        <View style={styles.screen}>
            <View style={styles.container}>
                <View style={styles.titleContent}>
                    <Ionicons name="location" size={20} style={styles.icon} />
                    <Text style={styles.title}>{location.city}</Text>
                </View>
                <Text style={styles.dataText}>Latitud: {location.latitude.toFixed(4)}</Text>
                <Text style={styles.dataText}>Longitud: {location.longitude.toFixed(4)}</Text>
                <Text style={styles.dataText}>Precisión: {location.accuracy.toFixed(2)} m</Text>
                <Text style={styles.dataText}>Altitud: {location.altitude.toFixed(2)} m</Text>
                <Text style={styles.dataText}>Rumbo: {location.heading.toFixed(2)} ° norte</Text>
                <Text style={styles.dataText}>Velocidad: {location.speed.toFixed(2)} m/s</Text>
                <Text style={styles.graphText}>Historial de ubicaciones:</Text>
                <MapView style={styles.map} initialRegion={initialRegion}>
                    {visitedLocations.map((loc, index) => (
                        <Marker
                            key={index}
                            coordinate={{ latitude: loc.latitude, longitude: loc.longitude }}
                        />
                    ))}
                </MapView>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: '#ffffff',
        padding: 20,
    },
    container: {
        flex: 1,
        padding: 5,
        backgroundColor: '#ffffff',
    },
    titleContent: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    icon: {
        marginRight: 10,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    dataText: {
        fontSize: 16,
        marginBottom: 5,
    },
    graphText: {
        fontSize: 18,
        marginTop: 30,
        marginBottom: 15,
        fontWeight: 'bold',
    },
    map: {
        width: '100%',
        height: 300,
    },
});
