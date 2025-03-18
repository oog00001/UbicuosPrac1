import React, { useState, useEffect, useRef, useLayoutEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, Button } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { FontAwesome5 } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import useSensors from '../../hooks/useSensors';
import { db, collection } from './firebaseConfig';
import { onSnapshot, query, orderBy } from "firebase/firestore";

interface AccelLinealData {
    x: number;
    y: number;
    z: number;
}

export default function AceleracionLineal() {
    const { accelDataLineal } = useSensors();
    const [accelLinealHistory, setAccelLinealHistory] = useState<AccelLinealData[]>(
        Array.from({ length: 20 }, () => ({ x: 0, y: 0, z: 0 }))
    );
    const [containerWidth, setContainerWidth] = useState<number>(0);
    const navigation = useNavigation();

    const [firebaseData, setFirebaseData] = useState<AccelLinealData[]>([]);
    const [displayedData, setDisplayedData] = useState<AccelLinealData[]>([]);
    const [currentIndex, setCurrentIndex] = useState(20);

    useEffect(() => {
        navigation.setOptions({
            title: "Aceleración lineal",
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

        setAccelLinealHistory(prevHistory => {
            if (!isFinite(accelDataLineal.x) || !isFinite(accelDataLineal.y) || !isFinite(accelDataLineal.z)) return prevHistory;
            const updatedHistory = [...prevHistory, accelDataLineal];
            return updatedHistory.length > 20 ? updatedHistory.slice(-20) : updatedHistory;
        });

    }, [navigation, accelDataLineal]);

    //fireBase
    // Cargar datos de Firebase
    useEffect(() => {
        const accelCollection = collection(db, "vector_lineal");
        const accelQuery = query(accelCollection, orderBy("timestamp", "asc"));

        const unsubscribe = onSnapshot(accelQuery, (snapshot) => {
            const data = snapshot.docs.map(doc => doc.data() as AccelLinealData);
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

    const renderItem = useCallback(({ item }: { item: AccelLinealData }) => (
        <View style={styles.row}>
            <Text style={styles.cell}>X: {item.x.toFixed(3)}</Text>
            <Text style={styles.cell}>Y: {item.y.toFixed(3)}</Text>
            <Text style={styles.cell}>Z: {item.z.toFixed(3)}</Text>
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
                    <FontAwesome5 name='arrow-right' size={20} style={styles.icon} />
                    <Text style={styles.title}>Aceleración lineal</Text>
                </View>
                <Text style={styles.dataText}>X: {(accelDataLineal.x).toFixed(5)} m/s²</Text>
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
