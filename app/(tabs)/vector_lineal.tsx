import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { DeviceMotion } from 'expo-sensors';
import { FontAwesome5 } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

interface accelLinealData {
    x: number;
    y: number;
    z: number;
}

export default function AceleracionLineal() {
    const [accelDataLineal, setAccelDataLineal] = useState({ x: 0, y: 0, z: 0 });
    const [accelLinealHistory, setAccelLinealHistory] = useState<accelLinealData[]>(
        Array.from({ length: 20 }, () => ({ x: 0, y: 0, z: 0 }))
    );
    const [containerWidth, setContainerWidth] = useState<number>(0);
    const accelLinealSubscriptionRef = useRef<any>(null);
    const navigation = useNavigation();

    useEffect(() => {
        navigation.setOptions({
            title: "Aceleracion lineal",
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
            const isAvailable = await DeviceMotion.isAvailableAsync();
            if (isAvailable) {
                DeviceMotion.setUpdateInterval(500);
                accelLinealSubscriptionRef.current = DeviceMotion.addListener((data) => {
                    if (data.acceleration) {
                        setAccelDataLineal(data.acceleration);
                        let xP = data.acceleration.x;
                        let yP = data.acceleration.y;
                        let zP = data.acceleration.z;
                        setAccelLinealHistory(prevHistory => {
                            if (!isFinite(xP) || !isFinite(yP) || !isFinite(zP)) return prevHistory;
                            const updatedHistory = [...prevHistory, accelDataLineal];
                            return updatedHistory.length > 20 ? updatedHistory.slice(-20) : updatedHistory;
                        });
                    }
                });
            }
        };

        asincronia();

        return () => {
            if (accelLinealSubscriptionRef.current) accelLinealSubscriptionRef.current.remove();
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
                    <FontAwesome5 name='arrow-right' size={20} style={styles.icon} />
                    <Text style={styles.title}>Aceleracion lineal</Text>
                </View>
                <Text style={styles.dataText}>X: {(accelDataLineal.x ).toFixed(5)} m/s²</Text>
                <Text style={styles.dataText}>Y: {(accelDataLineal.y).toFixed(5)} m/s²</Text>
                <Text style={styles.dataText}>Z: {(accelDataLineal.z).toFixed(5)} m/s²</Text>
                <Text style={styles.graphText}>Gráfico en tiempo real:</Text>
                {containerWidth > 0 && (
                    <LineChart
                        data={{
                            labels: [],
                            datasets: [
                                { data: accelLinealHistory.map(d => isFinite(d.x) ? d.x : 0), color: (opacity = 1) => `rgba(255, 0, 0, ${opacity})`, strokeWidth: 2 },
                                { data: accelLinealHistory.map(d => isFinite(d.y) ? d.y : 0), color: (opacity = 1) => `rgba(0, 255, 0, ${opacity})`, strokeWidth: 2 },
                                { data: accelLinealHistory.map(d => isFinite(d.z) ? d.z : 0), color: (opacity = 1) => `rgba(0, 0, 255, ${opacity})`, strokeWidth: 2 }
                            ]
                        }}
                        width={containerWidth}
                        height={220}
                        yAxisSuffix=' m/s²'
                        chartConfig={{
                            backgroundGradientFrom: '#ffffff',
                            backgroundGradientTo: '#ffffff',
                            decimalPlaces: 5,
                            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                            style: { borderRadius: 16 },
                            propsForDots: { r: '3', strokeWidth: '2', stroke: '#000' },
                            propsForLabels: {
                                fontSize: 8,
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
