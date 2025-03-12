import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { DeviceMotion } from 'expo-sensors';
import { FontAwesome5 } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as Network from 'expo-network';
import useSensors from '../../hooks/useSensors';


export default function Internet() {
    const { ipData, tipoConexion, conexion, accesible, avion } = useSensors();
    const [containerWidth, setContainerWidth] = useState<number>(0);
    const inetnetSubscriptionRef = useRef<any>(null);
    const navigation = useNavigation();

    useEffect(() => {
        navigation.setOptions({
            title: "Internet",
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

        return () => {
        };
    }, [navigation]);

    return (
        <View style={styles.screen}>
            <View
                style={styles.container}
                onLayout={(event) => {
                    const { width } = event.nativeEvent.layout;
                    setContainerWidth(width);
                }}
            >
                <View style={styles.titleContent}>
                    <FontAwesome5 name='wifi' size={20} style={styles.icon} />
                    <Text style={styles.title}>Internet</Text>
                </View>
                <Text style={styles.dataText}>Conexión: {conexion} </Text>
                <Text style={styles.dataText}>Tipo de conexión: {tipoConexion}</Text>
                <Text style={styles.dataText}>Dirección IP: {ipData} </Text>
                <Text style={styles.dataText}>Es accesible Internet: {accesible} </Text>
                <Text style={styles.dataText}>Modo avión activo: {avion} </Text>
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
    historyText: {
        fontSize: 18,
        marginBottom: 15,
        fontWeight: 'bold',
    },
});
