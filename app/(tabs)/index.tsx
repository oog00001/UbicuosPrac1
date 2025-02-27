import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Card, Title } from 'react-native-paper';
import { Accelerometer, Magnetometer, Gyroscope, Pedometer, DeviceMotion } from 'expo-sensors';
import * as Location from 'expo-location';
import { FontAwesome5, MaterialIcons, Ionicons } from '@expo/vector-icons';
import { db, addDoc, collection } from './firebaseConfig';
import { useNavigation } from '@react-navigation/native';
import { TouchableOpacity } from 'react-native';
import * as Battery from 'expo-battery';
import * as Network from 'expo-network';

export default function SensorsScreen() {
  const [dateTime, setDateTime] = useState(new Date());
  const [accelData, setAccelData] = useState({ x: 0, y: 0, z: 0 });
  const [magData, setMagData] = useState({ x: 0, y: 0, z: 0 });
  const [location, setLocation] = useState({ latitude: 0, longitude: 0, altitude: 0 });
  const [isPedometerAvailable, setIsPedometerAvailable] = useState('checking');
  const [pastStepCount, setPastStepCount] = useState(0);
  const [currentStepCount, setCurrentStepCount] = useState(0);
  const navigation = useNavigation();
  const [gyroData, setGyroData] = useState({ x: 0, y: 0, z: 0 });
  const [ipData, setIpData] = useState('');
  const [tipoConexion, setTipoConexion] = useState('');
  const [conexion, setConexion] = useState('');


  const [gravity, setGravity] = useState({ x: 0, y: 0, z: 0 });
  const [batteryLevel, setBatteryLevel] = useState(0);
  const [batteryState, setBatteryState] = useState(0);
  const [lowPowerMode, setLowPowerMode] = useState(false);
  const [accelDataLineal, setAccelDataLineal] = useState({ x: 0, y: 0, z: 0 });
  const [vectorRotacionData, setVectorRotacionData] = useState({ alpha: 0, beta: 0, gamma: 0 });
  const [orientation, setOrientation] = useState({ alpha: 0, beta: 0, gamma: 0 });

  const accelSubscriptionRef = useRef<any>(null);
  const magSubscriptionRef = useRef<any>(null);
  const stepSubscriptionRef = useRef<any>(null);
  const gyroSubscriptionRef = useRef<any>(null);
  const vectorRotationRef = useRef<any>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setDateTime(new Date());
    }, 1000); // Actualiza cada segundo

    return () => clearInterval(interval); // Limpieza al desmontar
  }, []);

  const subscribe = async () => {
    const isAvailable = await Pedometer.isAvailableAsync();
    setIsPedometerAvailable(String(isAvailable));

    if (isAvailable) {
      const end = new Date();
      const start = new Date();
      start.setDate(end.getDate() - 1);

      const pastStepCountResult = await Pedometer.getStepCountAsync(start, end);
      if (pastStepCountResult) {
        setPastStepCount(pastStepCountResult.steps);
      }

      return Pedometer.watchStepCount(result => {
        setCurrentStepCount(result.steps);
      });
    }
  };


  useEffect(() => {


    const fetchData = async () => {
      //  Acelerómetro
      Accelerometer.setUpdateInterval(500);
      accelSubscriptionRef.current = Accelerometer.addListener((data) => {
        setAccelData(data);
      });

      //  Magnetómetro
      Magnetometer.setUpdateInterval(500);
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

      //Giroscopio
      Gyroscope.setUpdateInterval(500);
      gyroSubscriptionRef.current = Gyroscope.addListener((data) => {
        setGyroData(data);
      });




      //Orientacion, gravedad y vector de rotacion
      const isAvailable = await DeviceMotion.isAvailableAsync();
      if(isAvailable){
        DeviceMotion.setUpdateInterval(500);
        vectorRotationRef.current = DeviceMotion.addListener((data) => {
          if (data.rotation)  setOrientation(data.rotation);
          if(data.accelerationIncludingGravity) setGravity(data.accelerationIncludingGravity);
          if(data.rotationRate) setVectorRotacionData(data.rotationRate);
        });
      }






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
      //contador de pasos
      const subscription = subscribe();
      return () => {
        clearInterval(interval);
        if (accelSubscriptionRef.current) accelSubscriptionRef.current.remove();
        if (magSubscriptionRef.current) magSubscriptionRef.current.remove();
        if (stepSubscriptionRef.current) stepSubscriptionRef.current.remove();
        if (gyroSubscriptionRef.current) gyroSubscriptionRef.current.remove();
        if (vectorRotationRef.current) vectorRotationRef.current.remove();
        subscription;
      };

    };
    const interval = setInterval(fetchData, 5000);


  }, []);

  useEffect(() => {
    //actualizar  aceleracion lineal
    setAccelDataLineal({ x: accelData.x - gravity.x, y: accelData.y - gravity.y, z: accelData.z - gravity.z });
    const fetchBattery = async () => {
      //bateria
      setBatteryLevel(await Battery.getBatteryLevelAsync() * 100);
      setBatteryState(await Battery.getBatteryStateAsync());
      setLowPowerMode(await Battery.isLowPowerModeEnabledAsync());

      //internet
      setIpData(await Network.getIpAddressAsync());
      const tipoCon = await Network.getNetworkStateAsync();
      setTipoConexion(String(tipoCon.type));
      setConexion(String(tipoCon.isConnected));
    }
    fetchBattery();
  }, [accelData,gravity]); // Se ejecuta cada vez que accelData cambie


  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Sensores</Text>

      {/* Acelerómetro */}
      <TouchableOpacity onPress={() => navigation.navigate("explore")}>
        <Card style={styles.card}>
          <Card.Content>
            {/* Contenedor para el título y la flecha */}
            <View style={styles.titleContainer}>
              <View style={styles.titleContent}>
                <FontAwesome5 name="drafting-compass" size={20} />
                <Title style={styles.titleText}>Acelerómetro</Title>
              </View>
              <FontAwesome5 name="arrow-right" size={20} />
            </View>

            {/* Datos del acelerómetro */}
            <Text>X: {accelData.x * 10} m/s²</Text>
            <Text>Y: {accelData.y * 10} m/s²</Text>
            <Text>Z: {accelData.z * 10} m/s²</Text>
          </Card.Content>
        </Card>
      </TouchableOpacity>

      {/* Campo Magnético */}
      <TouchableOpacity onPress={() => navigation.navigate("explore")}>
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.titleContainer}>
              <View style={styles.titleContent}>
                <FontAwesome5 name="magnet" size={20} />
                <Title style={styles.titleText}>Campo Geomagnético</Title>
              </View>
              <FontAwesome5 name="arrow-right" size={20} />
            </View>
            <Text>X: {magData.x} μT</Text>
            <Text>Y: {magData.y} μT</Text>
            <Text>Z: {magData.z} μT</Text>
          </Card.Content>
        </Card>
      </TouchableOpacity>

      {/* Ubicación */}
      <TouchableOpacity onPress={() => navigation.navigate("explore")}>
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.titleContainer}>
              <View style={styles.titleContent}>
                <Ionicons name="location" size={20} />
                <Title style={styles.titleText}>Ubicación</Title>
              </View>
              <FontAwesome5 name="arrow-right" size={20} />
            </View>
            {location ? (
              <>
                <Text>Latitud: {location.latitude.toFixed(4)}</Text>
                <Text>Longitud: {location.longitude.toFixed(4)}</Text>
                <Text>Altitud: {location.altitude !== "N/A" ? `${location.altitude.toFixed(4)} m` : "N/A"}</Text>
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
            <View style={styles.titleContainer}>
              <View style={styles.titleContent}>
                <FontAwesome5 name="walking" size={20} />
                <Title style={styles.titleText}>Contador de pasos</Title>
              </View>
              <FontAwesome5 name="arrow-right" size={20} />
            </View>
            <Text>{pastStepCount} pasos</Text>
          </Card.Content>
        </Card>
      </TouchableOpacity>



      {/* Orientacion */}
      <TouchableOpacity onPress={() => navigation.navigate("explore")}>
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.titleContainer}>
              <View style={styles.titleContent}>
                <FontAwesome5 name="compass" size={20} />
                <Title style={styles.titleText}>Orientación</Title>
              </View>
              <FontAwesome5 name="arrow-right" size={20} />
            </View>
            <Text>X: {orientation.beta.toFixed(4)}°</Text>
            <Text>Y: {orientation.gamma.toFixed(4)}°</Text>
            <Text>Z: {orientation.alpha.toFixed(4)}°</Text>
          </Card.Content>
        </Card>
      </TouchableOpacity>

      {/* giroscopio */}
      <TouchableOpacity onPress={() => navigation.navigate("explore")}>
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.titleContainer}>
              <View style={styles.titleContent}>
                <FontAwesome5 name="spinner" size={20} />
                <Title style={styles.titleText}>Giroscopio</Title>
              </View>
              <FontAwesome5 name="arrow-right" size={20} />
            </View>
            <Text>X: {gyroData.x.toFixed(5)}  rad/s</Text>
            <Text>Y: {gyroData.y.toFixed(5)}  rad/s</Text>
            <Text>Z: {gyroData.z.toFixed(5)} rad/s</Text>
          </Card.Content>
        </Card>
      </TouchableOpacity>

      {/* Gravedad */}
      <TouchableOpacity onPress={() => navigation.navigate("explore")}>
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.titleContainer}>
              <View style={styles.titleContent}>
                <FontAwesome5 name="cloud-sun" size={20} />
                <Title style={styles.titleText}>Gravedad</Title>
              </View>
              <FontAwesome5 name="arrow-right" size={20} />
            </View>
            <Text>X: {gravity.x.toFixed(5)}  m/s²</Text>
            <Text>Y: {gravity.y.toFixed(5)}m/s²</Text>
            <Text>Z: {gravity.z.toFixed(5)} m/s²</Text>
          </Card.Content>
        </Card>
      </TouchableOpacity>

      {/* Aceleracion lineal */}
      <TouchableOpacity onPress={() => navigation.navigate("explore")}>
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.titleContainer}>
              <View style={styles.titleContent}>
                <FontAwesome5 name="arrow-right" size={20} />
                <Title style={styles.titleText}>Aceleración lineal</Title>
              </View>
              <FontAwesome5 name="arrow-right" size={20} />
            </View>
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
            <View style={styles.titleContainer}>
              <View style={styles.titleContent}>
                <FontAwesome5 name="sync" size={20} />
                <Title style={styles.titleText}>Vector de rotación</Title>
              </View>
              <FontAwesome5 name="arrow-right" size={20} />
            </View>
            <Text>X: {vectorRotacionData.beta.toFixed(2)}°/s</Text>
            <Text>Y: {vectorRotacionData.gamma.toFixed(2)}°/s</Text>
            <Text>Z: {vectorRotacionData.alpha.toFixed(2)}°/s</Text>
          </Card.Content>
        </Card>
      </TouchableOpacity>

      {/* Fecha y hora*/}
      <TouchableOpacity onPress={() => navigation.navigate("explore")}>
        <Card style={styles.card}>
          <Card.Content>
            <Title><FontAwesome5 name="clock" size={20} /> Fecha y hora</Title>
            <Text>{dateTime.toLocaleDateString()} {dateTime.toLocaleTimeString()}</Text>
          </Card.Content>
        </Card>
      </TouchableOpacity>

      {/* Bateria */}
      <TouchableOpacity onPress={() => navigation.navigate("explore")}>
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.titleContainer}>
              <View style={styles.titleContent}>
                <FontAwesome5 name="battery-half" size={20} />
                <Title style={styles.titleText}>Batería</Title>
              </View>
              <FontAwesome5 name="arrow-right" size={20} />
            </View>
            <Text>Nivel: {Math.floor(batteryLevel)}%</Text>
            <Text>Estado: {batteryState} </Text>
            <Text>Ahorro de energia: {String(lowPowerMode)} </Text>
          </Card.Content>
        </Card>
      </TouchableOpacity>

      {/* Internet */}
      <TouchableOpacity onPress={() => navigation.navigate("explore")}>
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.titleContainer}>
              <View style={styles.titleContent}>
                <FontAwesome5 name="wifi" size={20} />
                <Title style={styles.titleText}>Internet</Title>
              </View>
              <FontAwesome5 name="arrow-right" size={20} />
            </View>
            <Text>Conexion: {conexion} </Text>
            <Text>Tipo de conexión: {tipoConexion} </Text>
            <Text>Dirección IP: {ipData} </Text>
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
  titleContainer: {
    flexDirection: "row", // Alinea en fila
    justifyContent: "space-between", // Espaciado entre elementos
    alignItems: "center", // Alinea verticalmente
  },
  titleContent: {
    flexDirection: "row", // Ícono y texto en fila
    alignItems: "center",
  },
  titleText: {
    marginLeft: 8, // Espacio entre el icono y el texto
  },
});


