import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { DeviceMotion } from 'expo-sensors';
import { FontAwesome5 } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import useSensors from '../../hooks/useSensors';

interface OrientationData {
    x: number;
    y: number;
    z: number;
}

export default function Orientacion() {
    const { orientation } = useSensors();
    const [oriHistory, setOriHistory] = useState<OrientationData[]>(
        Array.from({ length: 20 }, () => ({ x: 0, y: 0, z: 0 }))
    );
    const [containerWidth, setContainerWidth] = useState<number>(0);
    const oriSubscriptionRef = useRef<any>(null);
    const navigation = useNavigation();

    const radianesAGrados = (radianes: number) => {
        return (radianes * 180) / Math.PI;
    };

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
        navigation.setOptions({
            title: "Orientacion",
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


        const asincronia = async () => {
            setOriHistory(prevHistory => {
                if (!isFinite(orientation.x) || !isFinite(orientation.y) || !isFinite(orientation.z)) return prevHistory;
                const updatedHistory = [...prevHistory, orientation];
                return updatedHistory.length > 20 ? updatedHistory.slice(-20) : updatedHistory;
            });
        };

        asincronia();

        return () => {
            if (oriSubscriptionRef.current) oriSubscriptionRef.current.remove();
        };
    }, [navigation,orientation]);



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
                    <FontAwesome5 name='compass' size={20} style={styles.icon} />
                    <Text style={styles.title}>Orientacion</Text>
                </View>
                <Text style={styles.dataText}>X: {(orientation.x).toFixed(5)} °</Text>
                <Text style={styles.dataText}>Y: {(orientation.y).toFixed(5)} °</Text>
                <Text style={styles.dataText}>Z: {(orientation.z).toFixed(5)} °</Text>
                <Text style={styles.graphText}>Gráfico en tiempo real:</Text>
                {containerWidth > 0 && (
                    <LineChart
                        data={{
                            labels: [],
                            datasets: [
                                { data: oriHistory.map(d => isFinite(d.x) ? d.x : 0), color: (opacity = 1) => `rgba(255, 0, 0, ${opacity})`, strokeWidth: 2 },
                                { data: oriHistory.map(d => isFinite(d.y) ? d.y : 0), color: (opacity = 1) => `rgba(0, 255, 0, ${opacity})`, strokeWidth: 2 },
                                { data: oriHistory.map(d => isFinite(d.z) ? d.z : 0), color: (opacity = 1) => `rgba(0, 0, 255, ${opacity})`, strokeWidth: 2 }
                            ]
                        }}
                        width={containerWidth}
                        height={220}
                        yAxisSuffix=' °'
                        chartConfig={{
                            backgroundGradientFrom: '#ffffff',
                            backgroundGradientTo: '#ffffff',
                            decimalPlaces: 2,
                            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                            style: { borderRadius: 16 },
                            propsForDots: { r: '3', strokeWidth: '2', stroke: '#000' },
                            propsForLabels: {
                                fontSize: 10,
                            }
                        }}
                        bezier
                    />
                )}
                <Text style={styles.historyText}>Histórico:</Text>
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
