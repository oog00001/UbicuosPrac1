import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Card, Title } from 'react-native-paper';
import { Accelerometer, Magnetometer, Gyroscope, Pedometer, DeviceMotion } from 'expo-sensors';
import * as Location from 'expo-location';
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

  const [gravity, setGravity] = useState({ x: 0, y: 0, z: 0 });
  const [accelDataLineal, setAccelDataLineal] = useState({ x: 0, y: 0, z: 0 });
  const [vectorRotacionData, setVectorRotacionData] = useState({ alpha: 0, beta: 0, gamma: 0 });
  const [orientation, setOrientation] = useState({ yaw: 0, pitch: 0, roll: 0 });

  const accelSubscriptionRef = useRef<any>(null);
  const magSubscriptionRef = useRef<any>(null);
  const stepSubscriptionRef = useRef<any>(null);
  const gyroSubscriptionRef = useRef<any>(null);
  const vectorRotationRef = useRef<any>(null);


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
      const isAvailablePedometer = await Pedometer.isAvailableAsync();
      if (isAvailablePedometer) {
        stepSubscriptionRef.current = Pedometer.watchStepCount((result) => {
          setSteps(result.steps);
        });
      }

      //Giroscopio
      Gyroscope.setUpdateInterval(5000);
      gyroSubscriptionRef.current = Gyroscope.addListener((data) => {
        setGyroData(data);
      });

      //luz

      //Proximidad

      //Vector de rotacion
     /* DeviceMotion.setUpdateInterval(5000);
      vectorRotationRef.current = DeviceMotion.addListener((data) => {
        setVectorRotacionData(data.rotation); 
      });*/

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
      if (vectorRotationRef.current) vectorRotationRef.current.remove();
    };

  }, []);

  useEffect(() => {
    //actualizar la gravedad
    setGravity({ x: accelData.x, y: accelData.y, z: accelData.z - 9.81 });
    setAccelDataLineal({  x: accelData.x - gravity.x, y: accelData.y - gravity.y, z: accelData.z - gravity.z });
  }, [accelData]); // Se ejecuta cada vez que accelData cambie

  useEffect(() => {
    //orientacion
    if (accelData && magData) {
      const pitch = Math.atan2(accelData.y, Math.sqrt(accelData.x * accelData.x + accelData.z * accelData.z));
      const roll = Math.atan2(-accelData.x, accelData.z);
      const yaw = Math.atan2(magData.y, magData.x);

      setOrientation({
        yaw: yaw * (180 / Math.PI), // Convertir de radianes a grados
        pitch: pitch * (180 / Math.PI), // Convertir de radianes a grados
        roll: roll * (180 / Math.PI), // Convertir de radianes a grados
      });
    }
  }, [accelData, magData]);


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
            <Text>Yaw: {orientation.yaw.toFixed(2)}°</Text>
            <Text>Pitch: {orientation.pitch.toFixed(2)}°</Text>
            <Text>Roll: {orientation.roll.toFixed(2)}°</Text>
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
            <Text>X: {gravity.x}  m/s²</Text>
            <Text>Y: {gravity.y}m/s²</Text>
            <Text>Z: {gravity.z} m/s²</Text>
          </Card.Content>
        </Card>
      </TouchableOpacity>

       {/* Aceleracion lineal */}
     <TouchableOpacity onPress={() => navigation.navigate("explore")}>
        <Card style={styles.card}>
          <Card.Content>
          <Title><FontAwesome5 name="arrow-right" size={20} /> Aceleracion lineal</Title>
            <Text>X: {accelDataLineal.x}  m/s²</Text>
            <Text>Y: {accelDataLineal.y} m/s²</Text>
            <Text>Z: {accelDataLineal.z} m/s²</Text>
          </Card.Content>
        </Card>
      </TouchableOpacity>

       {/* Vector de rotacion */}
     <TouchableOpacity onPress={() => navigation.navigate("explore")}>
        <Card style={styles.card}>
          <Card.Content>
          <Title><FontAwesome5 name="sync" size={20} />  Vector de rotacion</Title>
            <Text>Yaw (Z - Alfa): {vectorRotacionData.alpha.toFixed(2)}°/s</Text>
            <Text>Pitch (X - Beta): {vectorRotacionData.beta.toFixed(2)}°/s</Text>
            <Text>Roll (Y - Gamma): {vectorRotacionData.gamma.toFixed(2)}°/s</Text>
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


