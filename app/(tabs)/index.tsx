import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Card, Title } from 'react-native-paper';
import { Accelerometer, Magnetometer } from 'expo-sensors';
import * as Location from 'expo-location';
import { FontAwesome5, MaterialIcons, Ionicons } from '@expo/vector-icons';
import { db, addDoc, collection } from './firebaseConfig';

export default function SensorsScreen() {
  const [accelData, setAccelData] = useState({ x: 0, y: 0, z: 0 });
  const [magData, setMagData] = useState({ x: 0, y: 0, z: 0 });
  const [location, setLocation] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      Accelerometer.getLatestUpdate().then(data => setAccelData(data));
      Magnetometer.getLatestUpdate().then(data => setMagData(data));
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        let loc = await Location.getCurrentPositionAsync({});
        setLocation(loc.coords);
      }

      // Enviar datos a Firebase
      try {
        await addDoc(collection(db, "sensor_data"), {
          accelerometer: accelData,
          magnetometer: magData,
          location: location,
          timestamp: new Date()
        });
      } catch (error) {
        console.error("Error al enviar datos a Firebase: ", error);
      }
    };
    
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Sensores</Text>

      {/* Acelerómetro */}
      <Card style={styles.card}>
        <Card.Content>
          <Title><FontAwesome5 name="accelerometer" size={20} /> Acelerómetro</Title>
          <Text>X: {accelData.x.toFixed(2)} m/s²</Text>
          <Text>Y: {accelData.y.toFixed(2)} m/s²</Text>
          <Text>Z: {accelData.z.toFixed(2)} m/s²</Text>
        </Card.Content>
      </Card>

      {/* Campo Magnético */}
      <Card style={styles.card}>
        <Card.Content>
          <Title><MaterialIcons name="magnet-on" size={20} /> Campo Geomagnético</Title>
          <Text>X: {magData.x.toFixed(2)} μT</Text>
          <Text>Y: {magData.y.toFixed(2)} μT</Text>
          <Text>Z: {magData.z.toFixed(2)} μT</Text>
        </Card.Content>
      </Card>

      {/* Ubicación */}
      <Card style={styles.card}>
        <Card.Content>
          <Title><Ionicons name="location" size={20} /> Ubicación</Title>
          {location ? (
            <>
              <Text>Latitud: {location.latitude.toFixed(4)}</Text>
              <Text>Longitud: {location.longitude.toFixed(4)}</Text>
              <Text>Altitud: {location.altitude ? location.altitude.toFixed(2) : 'N/A'} m</Text>
            </>
          ) : (
            <Text>Cargando...</Text>
          )}
        </Card.Content>
      </Card>

      {/* Contador de pasos */}
      <Card style={styles.card}>
        <Card.Content>
          <Title><FontAwesome5 name="walking" size={20} /> Contador de pasos</Title>
          <Text>0 pasos</Text>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#e0e0ff', padding: 10 },
  header: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginVertical: 10 },
  card: { marginVertical: 5, padding: 10, backgroundColor: 'white' },
});
