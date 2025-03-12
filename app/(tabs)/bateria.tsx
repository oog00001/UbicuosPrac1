import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { DeviceMotion } from 'expo-sensors';
import { FontAwesome5 } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as Battery from 'expo-battery';
import useSensors from '../../hooks/useSensors';

interface BatteryData {
    level: number;
}

export default function BatteryFuncion() {

    const { batteryLevel, batteryState, lowPowerMode } = useSensors();

    const [batteryHistory, setBatteryHistory] = useState<BatteryData[]>(
        Array.from({ length: 20 }, () => ({ level: 0 }))
    );
    const [containerWidth, setContainerWidth] = useState<number>(0);
    const navigation = useNavigation();

    useEffect(() => {
        navigation.setOptions({
            title: "Bateria",
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

        setBatteryHistory(prevHistory => {
            if (!isFinite(batteryLevel)) return prevHistory;
            const updatedHistory = [...prevHistory, { level: batteryLevel}];
            return updatedHistory.length > 20 ? updatedHistory.slice(-20) : updatedHistory;
        });

        return () => {
        };
    }, [navigation,batteryLevel]);

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
                    <FontAwesome5 name='battery-half' size={20} style={styles.icon} />
                    <Text style={styles.title}>Bateria</Text>
                </View>
                <Text style={styles.dataText}>Nivel: {Math.floor(batteryLevel)}%</Text>
                <Text style={styles.dataText}>Estado: {batteryState}</Text>
                <Text style={styles.dataText}>Ahorro de energia: {String(lowPowerMode)}</Text>
                <Text style={styles.graphText}>Gráfico en tiempo real:</Text>
                {containerWidth > 0 && (
                    <LineChart
                        data={{
                            labels: [],
                            datasets: [
                                { data: batteryHistory.map(d => isFinite(d.level) ? d.level : 0), color: (opacity = 1) => `rgba(0, 0, 255, ${opacity})`, strokeWidth: 2 }
                            ]
                        }}
                        width={containerWidth}
                        height={220}
                        yAxisSuffix=' %'
                        chartConfig={{
                            backgroundGradientFrom: '#ffffff',
                            backgroundGradientTo: '#ffffff',
                            decimalPlaces: 0,
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
