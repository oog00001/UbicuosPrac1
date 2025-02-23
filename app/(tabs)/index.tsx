import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Card, Title } from 'react-native-paper';
import { Accelerometer, Magnetometer, Gyroscope } from 'expo-sensors';
import * as Location from 'expo-location';
import * as Pedometer from 'expo-sensors';
import { FontAwesome5, MaterialIcons, Ionicons } from '@expo/vector-icons';
import { db, addDoc, collection } from './firebaseConfig';
import { useNavigation } from '@react-navigation/native';
import { TouchableOpacity } from 'react-native';

export default function SensorsScreen() {
  const [accelData, setAccelData] = useState({ x: 0, y: 0, z: 0 });
  const [magData, setMagData] = useState({ x: 0, y: 0, z: 0 });
  const [location, setLocation] = useState({ latitude: 0, longitude: 0, altitude: 0 });
  const [steps, setSteps] = useState(0);
  const navigation = useNavigation();
  const [gyroData, setGyroData] = useState({ x: 0, y: 0, z: 0 });

  const accelSubscriptionRef = useRef<any>(null);
  const magSubscriptionRef = useRef<any>(null);
  const stepSubscriptionRef = useRef<any>(null);
  const gyroSubscriptionRef = useRef<any>(null);


  useEffect(() => {



    const fetchData = async () => {  
      //  Acelerómetro
    Accelerometer.setUpdateInterval(5000);
    accelSubscriptionRef.current = Accelerometer.addListener((data) => {
      setAccelData(data);
    });

    //  Magnetómetro
    Magnetometer.setUpdateInterval(5000);
    magSubscriptionRef.current = Magnetometer.addListener((data) => {
      setMagData(data);
    });

      //ubicacion
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({});
        setLocation({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
          altitude: loc.coords.altitude || "N/A",
        });
      }


      //contador pasos
      const isAvailablePedometer = await Pedometer.Pedometer.isAvailableAsync();
      if (isAvailablePedometer) {
        stepSubscriptionRef.current = Pedometer.Pedometer.watchStepCount((result) => {
          setSteps(result.steps);
        });
      }

      //Orientacion

      //Giroscopio
      Gyroscope.setUpdateInterval(5000);
      gyroSubscriptionRef.current = Gyroscope.addListener((data) => {
        setGyroData(data);
      });

      //luz
      //Proximidad
      //Gravedad
      //Aceleracion lineal
      //Vector de rotacion
      //Fecha y hora
      //bateria
      //internet

      //enviar a firebase
    /*
      try {
        await addDoc(collection(db, "sensor_data"), {
          timestamp: new Date(),
          accelerometer: accelData,
          magnetometer: magData,
          location: location,
          steps: steps
        });
        console.log("Datos enviados a Firebase");
      } catch (error) {
        console.error("Error al enviar datos: ", error);
      }
    */

    };
    const interval = setInterval(fetchData, 5000);
    return () => {
      clearInterval(interval);
      if (accelSubscriptionRef.current) accelSubscriptionRef.current.remove();
      if (magSubscriptionRef.current) magSubscriptionRef.current.remove();
      if (stepSubscriptionRef.current) stepSubscriptionRef.current.remove();
      if (gyroSubscriptionRef.current) gyroSubscriptionRef.current.remove();
    };

  }, []);


  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Sensores</Text>

      {/* Acelerómetro */}
      <TouchableOpacity onPress={() => navigation.navigate("explore")}>
        <Card style={styles.card}>
          <Card.Content>
          <Title><FontAwesome5 name="drafting-compass" size={20} /> Acelerómetro</Title>
            <Text>X: {accelData.x.toFixed(2)} m/s²</Text>
            <Text>Y: {accelData.y.toFixed(2)} m/s²</Text>
            <Text>Z: {accelData.z.toFixed(2)} m/s²</Text>
          </Card.Content>
        </Card>
      </TouchableOpacity>

      {/* Campo Magnético */}
      <TouchableOpacity onPress={() => navigation.navigate("explore")}>
        <Card style={styles.card}>
          <Card.Content>
          <Title><FontAwesome5 name="magnet" size={20} /> Campo Geomagnético</Title>
            <Text>X: {magData.x.toFixed(2)} μT</Text>
            <Text>Y: {magData.y.toFixed(2)} μT</Text>
            <Text>Z: {magData.z.toFixed(2)} μT</Text>
          </Card.Content>
        </Card>
      </TouchableOpacity>

      {/* Ubicación */}
      <TouchableOpacity onPress={() => navigation.navigate("explore")}>
        <Card style={styles.card}>
          <Card.Content>
            <Title><Ionicons name="location" size={20} /> Ubicación</Title>
            {location ? (
              <>
                <Text>Latitud: {location.latitude.toFixed(4)}</Text>
                <Text>Longitud: {location.longitude.toFixed(4)}</Text>
                <Text>Altitud: {location.altitude !== "N/A" ? `${location.altitude.toFixed(2)} m` : "N/A"}</Text>
              </>
            ) : (
              <Text>Cargando...</Text>
            )}
          </Card.Content>
        </Card>
      </TouchableOpacity>

      {/* Contador de pasos */}
      <TouchableOpacity onPress={() => navigation.navigate("explore")}>
        <Card style={styles.card}>
          <Card.Content>
            <Title><FontAwesome5 name="walking" size={20} /> Contador de pasos</Title>
            <Text>{steps} pasos</Text>
          </Card.Content>
        </Card>
      </TouchableOpacity>



     {/* Orientacion */}
     <TouchableOpacity onPress={() => navigation.navigate("explore")}>
        <Card style={styles.card}>
          <Card.Content>
          <Title><FontAwesome5 name="compass" size={20} /> Orientacion</Title>
            <Text>X:  º</Text>
            <Text>Y:  º</Text>
            <Text>Z: º</Text>
          </Card.Content>
        </Card>
      </TouchableOpacity>

      {/* giroscopio */}
     <TouchableOpacity onPress={() => navigation.navigate("explore")}>
        <Card style={styles.card}>
          <Card.Content>
          <Title><FontAwesome5 name="spinner" size={20} /> Giroscopio</Title>
            <Text>X: {gyroData.x.toFixed(2)}  rad/s</Text>
            <Text>Y: {gyroData.y.toFixed(2)}  rad/s</Text>
            <Text>Z: {gyroData.z.toFixed(2)} rad/s</Text>
          </Card.Content>
        </Card>
      </TouchableOpacity>

      {/* luz*/}
      <TouchableOpacity onPress={() => navigation.navigate("explore")}>
        <Card style={styles.card}>
          <Card.Content>
            <Title><FontAwesome5 name="lightbulb" size={20} /> Luz</Title>
            <Text> lx</Text>
          </Card.Content>
        </Card>
      </TouchableOpacity>

      {/* Proximidad*/}
      <TouchableOpacity onPress={() => navigation.navigate("explore")}>
        <Card style={styles.card}>
          <Card.Content>
            <Title><FontAwesome5 name="hand-paper" size={20} /> Proximidad</Title>
            <Text> cm</Text>
          </Card.Content>
        </Card>
      </TouchableOpacity>

      {/* Grabedad */}
     <TouchableOpacity onPress={() => navigation.navigate("explore")}>
        <Card style={styles.card}>
          <Card.Content>
          <Title><FontAwesome5 name="cloud-sun" size={20} /> Gravedad</Title>
            <Text>X:  m/s²</Text>
            <Text>Y:  m/s²</Text>
            <Text>Z:  m/s²</Text>
          </Card.Content>
        </Card>
      </TouchableOpacity>

       {/* Aceleracion lineal */}
     <TouchableOpacity onPress={() => navigation.navigate("explore")}>
        <Card style={styles.card}>
          <Card.Content>
          <Title><FontAwesome5 name="arrow-right" size={20} /> Aceleracion lineal</Title>
            <Text>X:  m/s²</Text>
            <Text>Y:  m/s²</Text>
            <Text>Z:  m/s²</Text>
          </Card.Content>
        </Card>
      </TouchableOpacity>

       {/* Vector de rotacion */}
     <TouchableOpacity onPress={() => navigation.navigate("explore")}>
        <Card style={styles.card}>
          <Card.Content>
          <Title><FontAwesome5 name="sync" size={20} />  Vector de rotacion</Title>
            <Text>X:  </Text>
            <Text>Y:  </Text>
            <Text>Z:  </Text>
          </Card.Content>
        </Card>
      </TouchableOpacity>

      {/* Fecha y hora*/}
      <TouchableOpacity onPress={() => navigation.navigate("explore")}>
        <Card style={styles.card}>
          <Card.Content>
            <Title><FontAwesome5 name="clock" size={20} /> Fecha y hora</Title>
            <Text> </Text>
          </Card.Content>
        </Card>
      </TouchableOpacity>

      {/* Bateria */}
     <TouchableOpacity onPress={() => navigation.navigate("explore")}>
        <Card style={styles.card}>
          <Card.Content>
          <Title><FontAwesome5 name="battery-half" size={20} />  Bateria</Title>
            <Text>Nivel:  %</Text>
            <Text>Estado:  </Text>
            <Text>Ahorro de energia:  </Text>
          </Card.Content>
        </Card>
      </TouchableOpacity>

      {/* Internet */}
     <TouchableOpacity onPress={() => navigation.navigate("explore")}>
        <Card style={styles.card}>
          <Card.Content>
          <Title><FontAwesome5 name="wifi" size={20} />  Internet</Title>
            <Text>Conexion:  %</Text>
            <Text>Tipo de conexion:  </Text>
            <Text>IP:  </Text>
          </Card.Content>
        </Card>
      </TouchableOpacity>


    </ScrollView>





  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#e0e0ff', padding: 10 },
  header: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginVertical: 10 },
  card: { marginVertical: 5, padding: 10, backgroundColor: 'white' },
});


