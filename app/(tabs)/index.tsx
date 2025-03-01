import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform } from 'react-native';
import { Card, Title } from 'react-native-paper';
import { Accelerometer, Magnetometer, Gyroscope, DeviceMotion, LightSensor } from 'expo-sensors';
import * as Location from 'expo-location';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
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
  const navigation = useNavigation();
  const [gyroData, setGyroData] = useState({ x: 0, y: 0, z: 0 });
  const [ipData, setIpData] = useState('');
  const [tipoConexion, setTipoConexion] = useState('');
  const [conexion, setConexion] = useState('');

  const [gravity, setGravity] = useState({ x: 0, y: 0, z: 0 });
  const [batteryLevel, setBatteryLevel] = useState(0);
  const [batteryState, setBatteryState] = useState('');
  const [lowPowerMode, setLowPowerMode] = useState('');
  const [accelDataLineal, setAccelDataLineal] = useState({ x: 0, y: 0, z: 0 });
  const [vectorRotacionData, setVectorRotacionData] = useState({ alpha: 0, beta: 0, gamma: 0 });
  const [orientation, setOrientation] = useState({ x: 0, y: 0, z: 0 });

  const accelSubscriptionRef = useRef<any>(null);
  const magSubscriptionRef = useRef<any>(null);
  const stepSubscriptionRef = useRef<any>(null);
  const gyroSubscriptionRef = useRef<any>(null);
  const vectorRotationRef = useRef<any>(null);

  const [lightIntensity, setLightIntensity] = useState(0);

  useEffect(() => {
    navigation.setOptions({
      title: "Sensores",
    });
    
    // Sensor de luz
    const subscribe = () => {
      LightSensor.addListener((data) => {
        setLightIntensity(data.illuminance);
      });
    };

    subscribe();

    return () => {
      LightSensor.removeAllListeners();
    };
  }, [navigation]);

  const radianesAGrados = (radianes: number) => {
    return (radianes * 180) / Math.PI;
  };

  // Función para normalizar el valor entre -360 y 360
  const normalizarRango = (valor: number) => {
    let grados = valor % 360;
    if (grados > 180) {
      grados -= 360;
    } else if (grados < -180) {
      grados += 360;
    }
    return grados;
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setDateTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      // Acelerómetro
      Accelerometer.setUpdateInterval(500);
      accelSubscriptionRef.current = Accelerometer.addListener((data) => {
        setAccelData(data);
      });

      // Magnetómetro
      Magnetometer.setUpdateInterval(500);
      magSubscriptionRef.current = Magnetometer.addListener((data) => {
        setMagData(data);
      });

      // Ubicación
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({});
        setLocation({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
          altitude: loc.coords.altitude ?? 0,
        });
      }

      // Giroscopio
      Gyroscope.setUpdateInterval(500);
      gyroSubscriptionRef.current = Gyroscope.addListener((data) => {
        setGyroData(data);
      });

      // Orientación, gravedad, vector de rotación y aceleración lineal
      const isAvailable = await DeviceMotion.isAvailableAsync();
      if (isAvailable) {
        DeviceMotion.setUpdateInterval(500);
        vectorRotationRef.current = DeviceMotion.addListener((data) => {
          if (data.rotation) setOrientation({
            z: normalizarRango(radianesAGrados(data.rotation.alpha)),
            x: normalizarRango(radianesAGrados(data.rotation.beta)),
            y: normalizarRango(radianesAGrados(data.rotation.gamma))
          });
          if (data.accelerationIncludingGravity) setGravity(data.accelerationIncludingGravity);
          if (data.rotationRate) setVectorRotacionData(data.rotationRate);
          if (data.acceleration) setAccelDataLineal(data.acceleration);
        });
      }

      return () => {
        clearInterval(interval);

        if (accelSubscriptionRef.current) accelSubscriptionRef.current.remove();
        if (magSubscriptionRef.current) magSubscriptionRef.current.remove();
        if (stepSubscriptionRef.current) stepSubscriptionRef.current.remove();
        if (gyroSubscriptionRef.current) gyroSubscriptionRef.current.remove();
        if (vectorRotationRef.current) vectorRotationRef.current.remove();

      };
    };

    const interval = setInterval(fetchData, 500);

    return () => clearInterval(interval);

  }, []);

  useEffect(() => {
    const fetchBattery = async () => {
      // Batería
      const batteryLevelValue = await Battery.getBatteryLevelAsync();
      setBatteryLevel(batteryLevelValue * 100);

      const batteryStateValue = await Battery.getBatteryStateAsync();

      let batteryStateText = '';
      switch (batteryStateValue) {
        case Battery.BatteryState.CHARGING:
          batteryStateText = 'cargando';
          break;
        case Battery.BatteryState.FULL:
          batteryStateText = 'batería llena';
          break;
        case Battery.BatteryState.UNPLUGGED:
          batteryStateText = 'descarga';
          break;
        default:
          batteryStateText = 'desconocido';
      }
      setBatteryState(batteryStateText);

      const lowPowerModeValue = await Battery.isLowPowerModeEnabledAsync();

      let lowPowerModeText = '';
      if (!lowPowerModeValue) {
        lowPowerModeText = 'desactivado';
      } else {
        lowPowerModeText = 'activado';
      }
      setLowPowerMode(lowPowerModeText);

      // WiFi
      setIpData(await Network.getIpAddressAsync());
      const tipoCon = await Network.getNetworkStateAsync();
      let tipoConexionText = '';
      if (tipoCon.type) {
        switch (tipoCon.type.toLowerCase()) {
          case 'wifi':
            tipoConexionText = 'WiFi';
            break;
          case 'cellular':
            tipoConexionText = 'datos móviles';
            break;
          case 'unknown':
            tipoConexionText = 'desconocido';
            break;
          case 'none':
            tipoConexionText = 'sin conexión';
            break;
          default:
            tipoConexionText = 'desconocida';
        }
        setTipoConexion(tipoConexionText);
      }

      setConexion(tipoCon.isConnected ? 'sí' : 'no');
    };

    fetchBattery();
  }, [accelData, gravity]);


  return (
    <ScrollView style={styles.container}>

      {/* Acelerómetro */}
      <TouchableOpacity onPress={() => navigation.navigate('acelerometro')}>
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.titleContainer}>
              <View style={styles.titleContent}>
                <FontAwesome5 name='drafting-compass' size={20} />
                <Title style={styles.titleText}>Acelerómetro</Title>
              </View>
              <FontAwesome5 name='arrow-right' size={20} />
            </View>
            <Text>X: {(accelData.x * 10).toFixed(5)} m/s²</Text>
            <Text>Y: {(accelData.y * 10).toFixed(5)} m/s²</Text>
            <Text>Z: {(accelData.z * 10).toFixed(5)} m/s²</Text>
          </Card.Content>
        </Card>
      </TouchableOpacity>

      {/* Campo Magnético */}
      <TouchableOpacity onPress={() => navigation.navigate('explore')}>
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.titleContainer}>
              <View style={styles.titleContent}>
                <FontAwesome5 name='magnet' size={20} />
                <Title style={styles.titleText}>Campo Geomagnético</Title>
              </View>
              <FontAwesome5 name='arrow-right' size={20} />
            </View>
            <Text>X: {magData.x.toFixed(5)} μT</Text>
            <Text>Y: {magData.y.toFixed(5)} μT</Text>
            <Text>Z: {magData.z.toFixed(5)} μT</Text>
          </Card.Content>
        </Card>
      </TouchableOpacity>

      {/* Ubicación */}
      <TouchableOpacity onPress={() => navigation.navigate('explore')}>
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.titleContainer}>
              <View style={styles.titleContent}>
                <Ionicons name='location' size={20} />
                <Title style={styles.titleText}>Ubicación</Title>
              </View>
              <FontAwesome5 name='arrow-right' size={20} />
            </View>
            {location ? (
              <>
                <Text>Latitud: {location.latitude.toFixed(4)}</Text>
                <Text>Longitud: {location.longitude.toFixed(4)}</Text>
                <Text>Altitud: {location.altitude.toFixed(2)} m</Text>
              </>
            ) : (
              <Text>Cargando...</Text>
            )}
          </Card.Content>
        </Card>
      </TouchableOpacity>

      {/* Orientacion */}
      <TouchableOpacity onPress={() => navigation.navigate('explore')}>
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.titleContainer}>
              <View style={styles.titleContent}>
                <FontAwesome5 name='compass' size={20} />
                <Title style={styles.titleText}>Orientación</Title>
              </View>
              <FontAwesome5 name='arrow-right' size={20} />
            </View>
            <Text>X: {orientation.x.toFixed(4)} °</Text>
            <Text>Y: {orientation.y.toFixed(4)} °</Text>
            <Text>Z: {orientation.z.toFixed(4)} °</Text>
          </Card.Content>
        </Card>
      </TouchableOpacity>

      {/* giroscopio */}
      <TouchableOpacity onPress={() => navigation.navigate('explore')}>
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.titleContainer}>
              <View style={styles.titleContent}>
                <FontAwesome5 name='spinner' size={20} />
                <Title style={styles.titleText}>Giroscopio</Title>
              </View>
              <FontAwesome5 name='arrow-right' size={20} />
            </View>
            <Text>X: {gyroData.x.toFixed(5)} rad/s</Text>
            <Text>Y: {gyroData.y.toFixed(5)} rad/s</Text>
            <Text>Z: {gyroData.z.toFixed(5)} rad/s</Text>
          </Card.Content>
        </Card>
      </TouchableOpacity>

      {/* Gravedad */}
      <TouchableOpacity onPress={() => navigation.navigate('explore')}>
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.titleContainer}>
              <View style={styles.titleContent}>
                <FontAwesome5 name='cloud-sun' size={20} />
                <Title style={styles.titleText}>Gravedad</Title>
              </View>
              <FontAwesome5 name='arrow-right' size={20} />
            </View>
            <Text>X: {gravity.x.toFixed(5)}  m/s²</Text>
            <Text>Y: {gravity.y.toFixed(5)} m/s²</Text>
            <Text>Z: {gravity.z.toFixed(5)} m/s²</Text>
          </Card.Content>
        </Card>
      </TouchableOpacity>

      {/* Aceleracion lineal */}
      <TouchableOpacity onPress={() => navigation.navigate('explore')}>
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.titleContainer}>
              <View style={styles.titleContent}>
                <FontAwesome5 name='arrow-right' size={20} />
                <Title style={styles.titleText}>Aceleración lineal</Title>
              </View>
              <FontAwesome5 name='arrow-right' size={20} />
            </View>
            <Text>X: {accelDataLineal.x.toFixed(5)} m/s²</Text>
            <Text>Y: {accelDataLineal.y.toFixed(5)} m/s²</Text>
            <Text>Z: {accelDataLineal.z.toFixed(5)} m/s²</Text>
          </Card.Content>
        </Card>
      </TouchableOpacity>

      {/* Tasa de rotacion */}
      <TouchableOpacity onPress={() => navigation.navigate('explore')}>
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.titleContainer}>
              <View style={styles.titleContent}>
                <FontAwesome5 name='sync' size={20} />
                <Title style={styles.titleText}>Tasa de rotación</Title>
              </View>
              <FontAwesome5 name='arrow-right' size={20} />
            </View>
            <Text>X: {vectorRotacionData.beta.toFixed(2)} °/s</Text>
            <Text>Y: {vectorRotacionData.gamma.toFixed(2)} °/s</Text>
            <Text>Z: {vectorRotacionData.alpha.toFixed(2)} °/s</Text>
          </Card.Content>
        </Card>
      </TouchableOpacity>

      {/* Bateria */}
      <TouchableOpacity onPress={() => navigation.navigate('explore')}>
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.titleContainer}>
              <View style={styles.titleContent}>
                <FontAwesome5 name='battery-half' size={20} />
                <Title style={styles.titleText}>Batería</Title>
              </View>
              <FontAwesome5 name='arrow-right' size={20} />
            </View>
            <Text>Nivel: {Math.floor(batteryLevel)}%</Text>
            <Text>Estado: {batteryState} </Text>
            <Text>Ahorro de energia: {String(lowPowerMode)} </Text>
          </Card.Content>
        </Card>
      </TouchableOpacity>

      {/* Internet */}
      <TouchableOpacity onPress={() => navigation.navigate('explore')}>
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.titleContainer}>
              <View style={styles.titleContent}>
                <FontAwesome5 name='wifi' size={20} />
                <Title style={styles.titleText}>Internet</Title>
              </View>
              <FontAwesome5 name='arrow-right' size={20} />
            </View>
            <Text>Conexión: {conexion} </Text>
            <Text>Tipo de conexión: {tipoConexion} </Text>
            <Text>Dirección IP: {ipData} </Text>
          </Card.Content>
        </Card>
      </TouchableOpacity>

      {/* Luz */}
      <TouchableOpacity onPress={() => navigation.navigate('explore')}>
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.titleContainer}>
              <View style={styles.titleContent}>
                <FontAwesome5 name='lightbulb' size={20} />
                <Title style={styles.titleText}>Luz</Title>
              </View>
              <FontAwesome5 name='arrow-right' size={20} />
            </View>
            <Text>{Platform.OS === 'android' ? `${lightIntensity.toFixed(2)} lx` : `Only available on Android`}</Text>
          </Card.Content>
        </Card>
      </TouchableOpacity>

      {/* Fecha y hora*/}
      <TouchableOpacity onPress={() => navigation.navigate('explore')}>
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.titleContainer}>
              <View style={styles.titleContent}>
                <Title><FontAwesome5 name='clock' size={20} /> Fecha y hora</Title>
              </View>
            </View>
            <Text>{dateTime.toLocaleDateString()} {dateTime.toLocaleTimeString()}</Text>
          </Card.Content>
        </Card>
      </TouchableOpacity>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#8795D0', padding: 10 },
  card: { marginVertical: 5, padding: 10, backgroundColor: 'white' },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  titleContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  titleText: {
    marginLeft: 8,
  },
});
