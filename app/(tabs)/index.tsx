import React from 'react';
import { View, Text, StyleSheet, ScrollView, Platform } from 'react-native';
import { Card, Title } from 'react-native-paper';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { db, addDoc, collection } from './firebaseConfig';
import { useNavigation } from '@react-navigation/native';
import { TouchableOpacity } from 'react-native';
import useSensors from '../../hooks/useSensors';

export default function SensorsScreen() {
  const navigation = useNavigation();
  const { dateTime, accelData, magData, location, gyroData, ipData, tipoConexion, 
    conexion, gravity, batteryLevel, batteryState, lowPowerMode, accelDataLineal, 
    vectorRotacionData, orientation, lightIntensity } = useSensors();

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
            <Text>X: {magData.x.toFixed(5)} μT</Text>
            <Text>Y: {magData.y.toFixed(5)} μT</Text>
            <Text>Z: {magData.z.toFixed(5)} μT</Text>
          </Card.Content>
        </Card>
      </TouchableOpacity>

      {/* Ubicación */}
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
            <Text>X: {orientation.x.toFixed(4)} °</Text>
            <Text>Y: {orientation.y.toFixed(4)} °</Text>
            <Text>Z: {orientation.z.toFixed(4)} °</Text>
          </Card.Content>
        </Card>
      </TouchableOpacity>

      {/* giroscopio */}
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
            <Text>X: {gyroData.x.toFixed(5)} rad/s</Text>
            <Text>Y: {gyroData.y.toFixed(5)} rad/s</Text>
            <Text>Z: {gyroData.z.toFixed(5)} rad/s</Text>
          </Card.Content>
        </Card>
      </TouchableOpacity>

      {/* Gravedad */}
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
            <Text>X: {gravity.x.toFixed(5)}  m/s²</Text>
            <Text>Y: {gravity.y.toFixed(5)} m/s²</Text>
            <Text>Z: {gravity.z.toFixed(5)} m/s²</Text>
          </Card.Content>
        </Card>
      </TouchableOpacity>

      {/* Aceleracion lineal */}
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
            <Text>X: {accelDataLineal.x.toFixed(5)} m/s²</Text>
            <Text>Y: {accelDataLineal.y.toFixed(5)} m/s²</Text>
            <Text>Z: {accelDataLineal.z.toFixed(5)} m/s²</Text>
          </Card.Content>
        </Card>
      </TouchableOpacity>

      {/* Tasa de rotacion */}
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
            <Text>X: {vectorRotacionData.beta.toFixed(2)} °/s</Text>
            <Text>Y: {vectorRotacionData.gamma.toFixed(2)} °/s</Text>
            <Text>Z: {vectorRotacionData.alpha.toFixed(2)} °/s</Text>
          </Card.Content>
        </Card>
      </TouchableOpacity>

      {/* Bateria */}
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
            <Text>Nivel: {Math.floor(batteryLevel)}%</Text>
            <Text>Estado: {batteryState} </Text>
            <Text>Ahorro de energia: {String(lowPowerMode)} </Text>
          </Card.Content>
        </Card>
      </TouchableOpacity>

      {/* Internet */}
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
            <Text>Conexión: {conexion} </Text>
            <Text>Tipo de conexión: {tipoConexion} </Text>
            <Text>Dirección IP: {ipData} </Text>
          </Card.Content>
        </Card>
      </TouchableOpacity>

      {/* Luz */}
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
            <Text>{Platform.OS === 'android' ? `${lightIntensity.toFixed(2)} lx` : `Only available on Android`}</Text>
          </Card.Content>
        </Card>
      </TouchableOpacity>

      {/* Fecha y hora*/}
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
