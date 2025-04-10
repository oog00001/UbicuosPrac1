import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions, Button, ScrollView } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { FontAwesome5 } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import useSensors from '../../hooks/useSensors';
import { db, collection } from './firebaseConfig';
import { onSnapshot, query, orderBy } from 'firebase/firestore';
import { format } from 'date-fns';

interface MagnetometerData {
    x: number;
    y: number;
    z: number;
}

export default function Magnetometro() {
    const { magData } = useSensors();
    const navigation = useNavigation();

    const [firebaseData, setFirebaseData] = useState<MagnetometerData[]>([]);
    const [displayedData, setDisplayedData] = useState<MagnetometerData[]>([]);
    const [currentIndex, setCurrentIndex] = useState(20);

    const [magHistory, setMagHistory] = useState<MagnetometerData[]>(() =>
        Array.from({ length: 20 }, () => ({ x: 0, y: 0, z: 0 }))
    );
    const [containerWidth, setContainerWidth] = useState<number>(Dimensions.get('window').width);
    const rotateAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        navigation.setOptions({
            title: 'Campo Geomagnético',
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

        setMagHistory((prevHistory) => {
            if (!isFinite(magData.x) || !isFinite(magData.y) || !isFinite(magData.z)) {
                return prevHistory;
            }
            const updatedHistory = [...prevHistory, magData];
            return updatedHistory.length > 20 ? updatedHistory.slice(-20) : updatedHistory;
        });

        const angle = Math.atan2(magData.y, magData.x) * (180 / Math.PI);
        Animated.timing(rotateAnim, {
            toValue: angle,
            duration: 300,
            useNativeDriver: true,
        }).start();
    }, [navigation, magData]);

    const rotateInterpolate = rotateAnim.interpolate({
        inputRange: [-180, 180],
        outputRange: ['-180deg', '180deg'],
    });

    useEffect(() => {
        const accelCollection = collection(db, 'magnetometro');
        const accelQuery = query(accelCollection, orderBy('timestamp', 'asc'));

        const unsubscribe = onSnapshot(accelQuery, (snapshot) => {
            const data = snapshot.docs.map(doc => doc.data() as MagnetometerData);
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
                    <FontAwesome5 name='magnet' size={20} style={styles.icon} />
                    <Text style={styles.title}>Campo Geomagnético</Text>
                </View>
                <Text style={styles.dataText}>X: {magData.x.toFixed(5)} μT</Text>
                <Text style={styles.dataText}>Y: {magData.y.toFixed(5)} μT</Text>
                <Text style={styles.dataText}>Z: {magData.z.toFixed(5)} μT</Text>
                <Text style={styles.graphText}>Gráfico en tiempo real:</Text>
                {containerWidth > 0 && (
                    <LineChart
                        data={{
                            labels: [],
                            datasets: [
                                { data: magHistory.map(d => isFinite(d.x) ? d.x : 0), color: (opacity = 1) => `rgba(255, 0, 0, ${opacity})`, strokeWidth: 2 },
                                { data: magHistory.map(d => isFinite(d.y) ? d.y : 0), color: (opacity = 1) => `rgba(0, 255, 0, ${opacity})`, strokeWidth: 2 },
                                { data: magHistory.map(d => isFinite(d.z) ? d.z : 0), color: (opacity = 1) => `rgba(0, 0, 255, ${opacity})`, strokeWidth: 2 }
                            ]
                        }}
                        width={containerWidth}
                        height={220}
                        yAxisSuffix=' μT'
                        chartConfig={{
                            backgroundGradientFrom: '#ffffff',
                            backgroundGradientTo: '#ffffff',
                            decimalPlaces: 2,
                            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                            style: { borderRadius: 16 },
                            propsForDots: { r: '3', strokeWidth: '2', stroke: '#000' },
                            propsForLabels: { fontSize: 10 },
                        }}
                        bezier
                    />
                )}
                <View style={styles.compassContainer}>
                    <Animated.Image
                        source={require('./aguja.png')}
                        style={[styles.compass, { transform: [{ rotate: rotateInterpolate }] }]}
                    />
                    <Text style={[styles.directionLabel, styles.north]}>N</Text>
                    <Text style={[styles.directionLabel, styles.east]}>E</Text>
                    <Text style={[styles.directionLabel, styles.south]}>S</Text>
                    <Text style={[styles.directionLabel, styles.west]}>O</Text>
                </View>
                <Text style={styles.historyText}>Histórico:</Text>
                <View>
                    {displayedData.map((item, index) => (
                        <View key={index} style={styles.row}>
                            <Text style={styles.cell}>
                                {format(new Date(item.timestamp), "yyyy-MM-dd HH:mm:ss")}
                            </Text>
                            <Text style={styles.cell}>X: {item.x.toFixed(3)}</Text>
                            <Text style={styles.cell}>Y: {item.y.toFixed(3)}</Text>
                            <Text style={styles.cell}>Z: {item.z.toFixed(3)}</Text>
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
    directionLabel: {
        position: 'absolute',
        fontSize: 18,
        fontWeight: 'bold',
    },
    north: {
        top: 10,
        left: '50%',
        marginLeft: -10,
    },
    east: {
        right: 10,
        top: '50%',
        marginTop: -10,
    },
    south: {
        bottom: 10,
        left: '50%',
        marginLeft: -10,
    },
    west: {
        left: 10,
        top: '50%',
        marginTop: -10,
    },
    compassContainer: {
        width: 200,
        height: 200,
        borderRadius: 100,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        backgroundColor: '#f0f0f0',
        alignSelf: 'center',
    },
    compass: {
        width: 150,
        height: 150,
        borderRadius: 75,
        resizeMode: 'cover',
        position: 'absolute',
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
    historyText: {
        fontSize: 18,
        marginBottom: 15,
        marginTop: 20,
        fontWeight: 'bold',
    },
});
