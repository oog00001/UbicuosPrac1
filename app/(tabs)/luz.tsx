import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Platform, FlatList, Button } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { FontAwesome5 } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import useSensors from '../../hooks/useSensors';
import { db, collection } from './firebaseConfig';
import { onSnapshot, query, orderBy } from "firebase/firestore";

interface LuzData {
    luz: number;
}

export default function LuzFuction() {
    const { lightIntensity } = useSensors();
    const [luzHistory, setLuzHistory] = useState<LuzData[]>(
        Array.from({ length: 20 }, () => ({ luz: 0 }))
    );
    const [containerWidth, setContainerWidth] = useState<number>(0);
    const navigation = useNavigation();

    const [firebaseData, setFirebaseData] = useState<LuzData[]>([]);
    const [displayedData, setDisplayedData] = useState<LuzData[]>([]);
    const [currentIndex, setCurrentIndex] = useState(20);

    useEffect(() => {
        navigation.setOptions({
            title: "Luz",
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

        setLuzHistory(prevHistory => {
            if (!isFinite(lightIntensity)) return prevHistory;
            const updatedHistory = [...prevHistory, { luz: lightIntensity }];
            return updatedHistory.length > 20 ? updatedHistory.slice(-20) : updatedHistory;
        });

    }, [navigation, lightIntensity]);

    //fireBase
    // Cargar datos de Firebase
    useEffect(() => {
        const accelCollection = collection(db, "luz");
        const accelQuery = query(accelCollection, orderBy("timestamp", "asc"));

        const unsubscribe = onSnapshot(accelQuery, (snapshot) => {
            const data = snapshot.docs.map(doc => doc.data() as LuzData);
            setFirebaseData(data);

            // Solo actualizar displayedData si aún no se han cargado más datos
            setDisplayedData((prevDisplayedData) =>
                prevDisplayedData.length > 20 ? prevDisplayedData : data.slice(0, 20)
            );
        });

        return () => unsubscribe();
    }, []);

    // Función para cargar más datos
    const loadMoreData = () => {
        const nextIndex = currentIndex + 20;
        const newData = firebaseData.slice(0, nextIndex);

        if (newData.length > displayedData.length) {
            setDisplayedData(newData);
            setCurrentIndex(nextIndex);
        }
    };

    const renderItem = useCallback(({ item }: { item: LuzData }) => (
        <View style={styles.row}>
            <Text style={styles.cell}>luz {item.luz.toFixed(2)}</Text>
        </View>
    ), []);

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
                    <FontAwesome5 name='lightbulb' size={20} style={styles.icon} />
                    <Text style={styles.title}>Luz</Text>
                </View>
                <Text style={styles.dataText}>{Platform.OS === 'android' ? `${lightIntensity.toFixed(2)} lx` : `Solo disponible en Android`}</Text>
                <Text style={styles.graphText}>Gráfico en tiempo real:</Text>
                {containerWidth > 0 && (
                    <LineChart
                        data={{
                            labels: [],
                            datasets: [
                                { data: luzHistory.map(d => isFinite(d.luz) ? d.luz : 0), color: (opacity = 1) => `rgba(0, 0, 255, ${opacity})`, strokeWidth: 2 }
                            ]
                        }}
                        width={containerWidth}
                        height={220}
                        yAxisSuffix=' lx'
                        chartConfig={{
                            backgroundGradientFrom: '#ffffff',
                            backgroundGradientTo: '#ffffff',
                            decimalPlaces: 2,
                            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                            style: { borderRadius: 16 },
                            propsForDots: { r: '3', strokeWidth: '2', stroke: '#000' },
                            propsForLabels: {
                                fontSize: 9,
                            }
                        }}
                        bezier
                    />
                )}
                <Text style={styles.historyText}>Histórico:</Text>
                <FlatList
                    data={displayedData}
                    keyExtractor={(item) => item.timestamp || Math.random().toString()}
                    renderItem={renderItem}
                    getItemLayout={(_, index) => ({ length: 40, offset: 40 * index, index })}
                    initialNumToRender={20}
                    maxToRenderPerBatch={20}
                    removeClippedSubviews
                    ListFooterComponent={firebaseData.length > displayedData.length ? (
                        <Button title="Cargar más" onPress={loadMoreData} />
                    ) : null}
                />
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
