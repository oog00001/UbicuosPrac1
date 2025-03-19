import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import useSensors from '../../hooks/useSensors';
import { db, collection } from './firebaseConfig';
import { onSnapshot, query, orderBy } from 'firebase/firestore';

interface LocationData {
    city: string;
    latitude: number;
    longitude: number;
    accuracy: number;
    altitude: number;
    heading: number;
    speed: number;
}

export default function Ubicacion() {
    const { location } = useSensors();
    const [visitedLocations, setVisitedLocations] = useState<LocationData[]>([]);
    const navigation = useNavigation();

    useEffect(() => {
        navigation.setOptions({
            title: 'Ubicación',
            headerLeft: () => (
                <FontAwesome5
                    name='arrow-left'
                    size={20}
                    color='white'
                    style={{ marginLeft: 20, marginRight: 30 }}
                    onPress={() => navigation.goBack()}
                />
            ),
        });
    }, [navigation]);

    useEffect(() => {
        const accelCollection = collection(db, 'acelerometro');
        const accelQuery = query(accelCollection, orderBy('timestamp', 'asc'));

        const unsubscribe = onSnapshot(accelQuery, (snapshot) => {
            const data = snapshot.docs.map(doc => doc.data() as LocationData);
            setVisitedLocations(data);
        });

        return () => unsubscribe();
    }, []);

    const initialRegion = useMemo(() => ({
        latitude: location.latitude || 40.4168,
        longitude: location.longitude || -3.7038,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
    }), [location]);

    return (
        <View style={styles.screen}>
            <View style={styles.container}>
                <View style={styles.titleContent}>
                    <Ionicons name='location' size={20} style={styles.icon} />
                    <Text style={styles.title}>{location.city}</Text>
                </View>
                <Text style={styles.dataText}>Latitud: {isFinite(location.latitude) ? location.latitude.toFixed(4) : 'N/A'}</Text>
                <Text style={styles.dataText}>Longitud: {isFinite(location.longitude) ? location.longitude.toFixed(4) : 'N/A'}</Text>
                <Text style={styles.dataText}>Precisión: {isFinite(location.accuracy) ? location.accuracy.toFixed(0) : 'N/A'} m</Text>
                <Text style={styles.dataText}>Altitud: {isFinite(location.altitude) ? location.altitude.toFixed(2) : 'N/A'} m</Text>
                <Text style={styles.dataText}>Rumbo: {isFinite(location.heading) ? location.heading.toFixed(2) : 'N/A'} ° norte</Text>
                <Text style={styles.dataText}>Velocidad: {isFinite(location.speed) ? location.speed.toFixed(2) : 'N/A'} m/s</Text>
                <Text style={styles.graphText}>Historial de ubicaciones:</Text>
                <MapView style={styles.map} initialRegion={initialRegion}>
                    {isFinite(location.latitude) && isFinite(location.longitude) && (
                        <Marker
                            coordinate={{
                                latitude: location.latitude,
                                longitude: location.longitude,
                            }}
                        />
                    )}

                    {visitedLocations.length > 0 &&
                        visitedLocations.map((loc, index) => (
                            isFinite(loc.latitude) && isFinite(loc.longitude) ? (
                                <Marker
                                    key={index}
                                    coordinate={{
                                        latitude: loc.latitude,
                                        longitude: loc.longitude,
                                    }}
                                />
                            ) : null
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
