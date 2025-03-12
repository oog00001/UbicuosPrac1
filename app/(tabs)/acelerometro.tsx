import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { Accelerometer } from 'expo-sensors';
import { FontAwesome5 } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import useSensors from '../../hooks/useSensors';

interface AccelerometerData {
    x: number;
    y: number;
    z: number;
}

export default function Acelerometro() {
    const { accelData } = useSensors();
    const [accelHistory, setAccelHistory] = useState<AccelerometerData[]>(
        Array.from({ length: 20 }, () => ({ x: 0, y: 0, z: 0 }))
    );
    const [containerWidth, setContainerWidth] = useState<number>(0);
    const accelSubscriptionRef = useRef<any>(null);
    const navigation = useNavigation();

    useEffect(() => {
        navigation.setOptions({
            title: 'Acelerómetro',
            headerLeft: () => (
                <FontAwesome5
                    name='arrow-left'
                    size={20}
                    color='white'
                    style={{ marginLeft: 20, marginRight: 30 }}
                    onPress={() => navigation.goBack()}
                />
            ),
        });

        Accelerometer.setUpdateInterval(500);
        accelSubscriptionRef.current = Accelerometer.addListener((data: AccelerometerData) => {
            setAccelHistory(prevHistory => {
                if (!isFinite(data.x) || !isFinite(data.y) || !isFinite(data.z)) return prevHistory;
                const updatedHistory = [...prevHistory, data];
                return updatedHistory.length > 20 ? updatedHistory.slice(-20) : updatedHistory;
            });
        });

        return () => {
            if (accelSubscriptionRef.current) accelSubscriptionRef.current.remove();
        };
    }, [navigation]);

    useEffect(() => {
        setAccelHistory((prevHistory) => {
            if (!isFinite(accelData.x) || !isFinite(accelData.y) || !isFinite(accelData.z)) {
                return prevHistory;
            }
            const updatedHistory = [...prevHistory, accelData];
            return updatedHistory.length > 20 ? updatedHistory.slice(-20) : updatedHistory;
        });
    }, [accelData]);

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
                    <FontAwesome5 name='drafting-compass' size={20} style={styles.icon} />
                    <Text style={styles.title}>Acelerómetro</Text>
                </View>
                <Text style={styles.dataText}>X: {(accelData.x * 10).toFixed(5)} m/s²</Text>
                <Text style={styles.dataText}>Y: {(accelData.y * 10).toFixed(5)} m/s²</Text>
                <Text style={styles.dataText}>Z: {(accelData.z * 10).toFixed(5)} m/s²</Text>
                <Text style={styles.graphText}>Gráfico en tiempo real:</Text>
                {containerWidth > 0 && (
                    <LineChart
                        data={{
                            labels: [],
                            datasets: [
                                { data: accelHistory.map(d => isFinite(d.x) ? d.x * 10 : 0), color: (opacity = 1) => `rgba(255, 0, 0, ${opacity})`, strokeWidth: 2 },
                                { data: accelHistory.map(d => isFinite(d.y) ? d.y * 10 : 0), color: (opacity = 1) => `rgba(0, 255, 0, ${opacity})`, strokeWidth: 2 },
                                { data: accelHistory.map(d => isFinite(d.z) ? d.z * 10 : 0), color: (opacity = 1) => `rgba(0, 0, 255, ${opacity})`, strokeWidth: 2 }
                            ]
                        }}
                        width={containerWidth}
                        height={220}
                        yAxisSuffix=' m/s²'
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
