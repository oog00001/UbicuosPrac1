import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Button } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { FontAwesome5 } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import useSensors from '../../hooks/useSensors';
import { db, collection } from './firebaseConfig';
import { onSnapshot, query, orderBy } from 'firebase/firestore';
import { format } from 'date-fns';

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

    const [firebaseData, setFirebaseData] = useState<BatteryData[]>([]);
    const [displayedData, setDisplayedData] = useState<BatteryData[]>([]);
    const [currentIndex, setCurrentIndex] = useState(20);

    useEffect(() => {
        navigation.setOptions({
            title: 'Batería',
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

        setBatteryHistory(prevHistory => {
            if (!isFinite(batteryLevel)) return prevHistory;
            const updatedHistory = [...prevHistory, { level: batteryLevel }];
            return updatedHistory.length > 20 ? updatedHistory.slice(-20) : updatedHistory;
        });

    }, [navigation, batteryLevel]);

    useEffect(() => {
        const accelCollection = collection(db, 'bateria');
        const accelQuery = query(accelCollection, orderBy('timestamp', 'asc'));

        const unsubscribe = onSnapshot(accelQuery, (snapshot) => {
            const data = snapshot.docs.map(doc => doc.data() as BatteryData);
            setFirebaseData(data);

            setDisplayedData((prevDisplayedData) =>
                prevDisplayedData.length > 20 ? prevDisplayedData : data.slice(0, 20)
            );
        });

        return () => unsubscribe();
    }, []);

    const loadMoreData = () => {
        const nextIndex = currentIndex + 20;
        const newData = firebaseData.slice(0, nextIndex);

        if (newData.length > displayedData.length) {
            setDisplayedData(newData);
            setCurrentIndex(nextIndex);
        }
    };

    return (
        <ScrollView style={styles.screen} keyboardShouldPersistTaps='handled' contentContainerStyle={{ paddingBottom: 30 }}>
            <View
                style={styles.container}
                onLayout={(event) => {
                    const { width } = event.nativeEvent.layout;
                    setContainerWidth(width);
                }}
            >
                <View style={styles.titleContent}>
                    <FontAwesome5 name='battery-half' size={20} style={styles.icon} />
                    <Text style={styles.title}>Batería</Text>
                </View>
                <Text style={styles.dataText}>Nivel: {Math.floor(batteryLevel)}%</Text>
                <Text style={styles.dataText}>Estado: {batteryState}</Text>
                <Text style={styles.dataText}>Ahorro de energía: {String(lowPowerMode)}</Text>
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
                <View>
                    {displayedData.map((item, index) => (
                        <View key={index} style={styles.row}>
                            <Text style={styles.cell}>
                                {format(new Date(item.timestamp), "yyyy-MM-dd HH:mm:ss")}
                            </Text>
                            <Text style={styles.cell}>Nivel: {item.nivel}</Text>
                        </View>
                    ))}

                    {firebaseData.length > displayedData.length && (
                        <View style={{ marginTop: 10, marginBottom: 20 }}>
                            <Button title='Cargar más' onPress={loadMoreData} />
                        </View>
                    )}
                </View>
            </View>
        </ScrollView>
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
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    cell: {
        flex: 1,
        textAlign: 'center',
        fontSize: 16,
    },
});
