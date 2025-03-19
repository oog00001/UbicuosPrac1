import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform } from 'react-native';
import { Card, Title } from 'react-native-paper';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { db, addDoc, collection } from './firebaseConfig';
import { useNavigation } from '@react-navigation/native';
import { TouchableOpacity } from 'react-native';
import useSensors from '../../hooks/useSensors';

export default function SensorsScreen() {
  const navigation = useNavigation();
  const sensorData = useSensors();
  const prevSensorDataRef = useRef(sensorData);
  const [lastSentTime, setLastSentTime] = useState(Date.now());

  useEffect(() => {
    navigation.setOptions({
      title: 'Sensores',
    });
  }, [navigation]);

  useEffect(() => {
    const currentTime = Date.now();

    if (
      sensorData !== prevSensorDataRef.current &&
      currentTime - lastSentTime >= 2000
    ) {
      prevSensorDataRef.current = sensorData;
      setLastSentTime(currentTime);
      sendSensorDataToFirebase();
    }
  }, [sensorData, lastSentTime]);

  const sendSensorDataToFirebase = async () => {
    if (!sensorData) return;

    try {
      const timestamp = new Date().toISOString();

      await addDoc(collection(db, 'acelerometro'), {
        timestamp,
        x: sensorData.accelData?.x ?? 0,
        y: sensorData.accelData?.y ?? 0,
        z: sensorData.accelData?.z ?? 0,
      });

      await addDoc(collection(db, 'magnetometro'), {
        timestamp,
        x: sensorData.magData?.x ?? 0,
        y: sensorData.magData?.y ?? 0,
        z: sensorData.magData?.z ?? 0,
      });

      if (sensorData.location) {
        await addDoc(collection(db, 'ubicacion'), {
          timestamp,
          latitude: sensorData.location?.latitude ?? 0,
          longitude: sensorData.location?.longitude ?? 0,
          altitude: sensorData.location?.altitude ?? 0,
        });
      }

      await addDoc(collection(db, 'orientacion'), {
        timestamp,
        x: sensorData.orientation?.x ?? 0,
        y: sensorData.orientation?.y ?? 0,
        z: sensorData.orientation?.z ?? 0,
      });

      await addDoc(collection(db, 'gravedad'), {
        timestamp,
        x: sensorData.gravity?.x ?? 0,
        y: sensorData.gravity?.y ?? 0,
        z: sensorData.gravity?.z ?? 0,
      });

      await addDoc(collection(db, 'giroscopio'), {
        timestamp,
        x: sensorData.gyroData?.x ?? 0,
        y: sensorData.gyroData?.y ?? 0,
        z: sensorData.gyroData?.z ?? 0,
      });

      await addDoc(collection(db, 'vector_lineal'), {
        timestamp,
        x: sensorData.accelDataLineal?.x ?? 0,
        y: sensorData.accelDataLineal?.y ?? 0,
        z: sensorData.accelDataLineal?.z ?? 0,
      });

      await addDoc(collection(db, 'vector_rotacion'), {
        timestamp,
        x: sensorData.vectorRotacionData?.beta ?? 0,
        y: sensorData.vectorRotacionData?.gamma ?? 0,
        z: sensorData.vectorRotacionData?.alpha ?? 0,
      });

      await addDoc(collection(db, 'bateria'), {
        timestamp,
        nivel: Math.floor(sensorData.batteryLevel ?? 0),
        estado: sensorData.batteryState ?? 'Desconocido',
        ahorroEnergia: sensorData.lowPowerMode ?? false,
      });

      await addDoc(collection(db, 'internet'), {
        timestamp,
        conexion: sensorData.conexion ?? 'Desconocido',
        tipoConexion: sensorData.tipoConexion ?? 'Desconocido',
        ipData: sensorData.ipData ?? 'N/A',
      });

      await addDoc(collection(db, 'luz'), {
        timestamp,
        intensidad: sensorData.lightIntensity ?? 'Desconocido',
      });

      console.log('Datos enviados a Firebase.');
    } catch (error) {
      console.error('Error al enviar datos:', error);
    }
  };

  return (
    <ScrollView style={styles.container}>

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
            <Text>X: {(sensorData.accelData.x * 10).toFixed(5)} m/s²</Text>
            <Text>Y: {(sensorData.accelData.y * 10).toFixed(5)} m/s²</Text>
            <Text>Z: {(sensorData.accelData.z * 10).toFixed(5)} m/s²</Text>
          </Card.Content>
        </Card>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('magnetometro')}>
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.titleContainer}>
              <View style={styles.titleContent}>
                <FontAwesome5 name='magnet' size={20} />
                <Title style={styles.titleText}>Campo Geomagnético</Title>
              </View>
              <FontAwesome5 name='arrow-right' size={20} />
            </View>
            <Text>X: {sensorData.magData.x.toFixed(5)} μT</Text>
            <Text>Y: {sensorData.magData.y.toFixed(5)} μT</Text>
            <Text>Z: {sensorData.magData.z.toFixed(5)} μT</Text>
          </Card.Content>
        </Card>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('ubicacion')}>
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.titleContainer}>
              <View style={styles.titleContent}>
                <Ionicons name='location' size={20} />
                <Title style={styles.titleText}>Ubicación</Title>
              </View>
              <FontAwesome5 name='arrow-right' size={20} />
            </View>
            {sensorData.location ? (
              <>
                <Text>Latitud: {sensorData.location.latitude.toFixed(4)}</Text>
                <Text>Longitud: {sensorData.location.longitude.toFixed(4)}</Text>
                <Text>Altitud: {sensorData.location.altitude.toFixed(2)} m</Text>
              </>
            ) : (
              <Text>Cargando...</Text>
            )}
          </Card.Content>
        </Card>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('orientacion')}>
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.titleContainer}>
              <View style={styles.titleContent}>
                <FontAwesome5 name='compass' size={20} />
                <Title style={styles.titleText}>Orientación</Title>
              </View>
              <FontAwesome5 name='arrow-right' size={20} />
            </View>
            <Text>X: {sensorData.orientation.x.toFixed(4)} °</Text>
            <Text>Y: {sensorData.orientation.y.toFixed(4)} °</Text>
            <Text>Z: {sensorData.orientation.z.toFixed(4)} °</Text>
          </Card.Content>
        </Card>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('giroscopio')}>
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.titleContainer}>
              <View style={styles.titleContent}>
                <FontAwesome5 name='spinner' size={20} />
                <Title style={styles.titleText}>Giroscopio</Title>
              </View>
              <FontAwesome5 name='arrow-right' size={20} />
            </View>
            <Text>X: {sensorData.gyroData.x.toFixed(5)} rad/s</Text>
            <Text>Y: {sensorData.gyroData.y.toFixed(5)} rad/s</Text>
            <Text>Z: {sensorData.gyroData.z.toFixed(5)} rad/s</Text>
          </Card.Content>
        </Card>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('gravedad')}>
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.titleContainer}>
              <View style={styles.titleContent}>
                <FontAwesome5 name='cloud-sun' size={20} />
                <Title style={styles.titleText}>Gravedad</Title>
              </View>
              <FontAwesome5 name='arrow-right' size={20} />
            </View>
            <Text>X: {sensorData.gravity.x.toFixed(5)} m/s²</Text>
            <Text>Y: {sensorData.gravity.y.toFixed(5)} m/s²</Text>
            <Text>Z: {sensorData.gravity.z.toFixed(5)} m/s²</Text>
          </Card.Content>
        </Card>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('vector_lineal')}>
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.titleContainer}>
              <View style={styles.titleContent}>
                <FontAwesome5 name='arrow-right' size={20} />
                <Title style={styles.titleText}>Aceleración lineal</Title>
              </View>
              <FontAwesome5 name='arrow-right' size={20} />
            </View>
            <Text>X: {sensorData.accelDataLineal.x.toFixed(5)} m/s²</Text>
            <Text>Y: {sensorData.accelDataLineal.y.toFixed(5)} m/s²</Text>
            <Text>Z: {sensorData.accelDataLineal.z.toFixed(5)} m/s²</Text>
          </Card.Content>
        </Card>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('vector_rotacion')}>
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.titleContainer}>
              <View style={styles.titleContent}>
                <FontAwesome5 name='sync' size={20} />
                <Title style={styles.titleText}>Tasa de rotación</Title>
              </View>
              <FontAwesome5 name='arrow-right' size={20} />
            </View>
            <Text>X: {sensorData.vectorRotacionData.beta.toFixed(2)} °/s</Text>
            <Text>Y: {sensorData.vectorRotacionData.gamma.toFixed(2)} °/s</Text>
            <Text>Z: {sensorData.vectorRotacionData.alpha.toFixed(2)} °/s</Text>
          </Card.Content>
        </Card>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('bateria')}>
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.titleContainer}>
              <View style={styles.titleContent}>
                <FontAwesome5 name='battery-half' size={20} />
                <Title style={styles.titleText}>Batería</Title>
              </View>
              <FontAwesome5 name='arrow-right' size={20} />
            </View>
            <Text>Nivel: {Math.floor(sensorData.batteryLevel)}%</Text>
            <Text>Estado: {sensorData.batteryState} </Text>
            <Text>Ahorro de energia: {String(sensorData.lowPowerMode)} </Text>
          </Card.Content>
        </Card>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('internet')}>
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.titleContainer}>
              <View style={styles.titleContent}>
                <FontAwesome5 name='wifi' size={20} />
                <Title style={styles.titleText}>Internet</Title>
              </View>
              <FontAwesome5 name='arrow-right' size={20} />
            </View>
            <Text>Conexión: {sensorData.conexion} </Text>
            <Text>Tipo de conexión: {sensorData.tipoConexion} </Text>
            <Text>Dirección IP: {sensorData.ipData} </Text>
          </Card.Content>
        </Card>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('luz')}>
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.titleContainer}>
              <View style={styles.titleContent}>
                <FontAwesome5 name='lightbulb' size={20} />
                <Title style={styles.titleText}>Luz</Title>
              </View>
              <FontAwesome5 name='arrow-right' size={20} />
            </View>
            <Text>{Platform.OS === 'android' ? `${sensorData.lightIntensity.toFixed(2)} lx` : `Only available on Android`}</Text>
          </Card.Content>
        </Card>
      </TouchableOpacity>

      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.titleContainer}>
            <View style={styles.titleContent}>
              <Title><FontAwesome5 name='clock' size={20} /> Fecha y hora</Title>
            </View>
          </View>
          <Text>{sensorData.dateTime.toLocaleDateString()} {sensorData.dateTime.toLocaleTimeString()}</Text>
        </Card.Content>
      </Card>

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
