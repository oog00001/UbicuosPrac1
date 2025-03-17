import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, Button } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import useSensors from '../../hooks/useSensors';
import { db, collection } from './firebaseConfig';
import { onSnapshot, query, orderBy } from "firebase/firestore";

interface InternateData {
    ipData: string;
    tipoConexion: string;
    conexion: string;
    accesible: string;
    avion: string;
}

export default function Internet() {
    const { ipData, tipoConexion, conexion, accesible, avion } = useSensors();
    const navigation = useNavigation();

    const [firebaseData, setFirebaseData] = useState<InternateData[]>([]);
    const [displayedData, setDisplayedData] = useState<InternateData[]>([]);
    const [currentIndex, setCurrentIndex] = useState(20);

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
    }, [navigation]);

    //fireBase
    // Cargar datos de Firebase
    useEffect(() => {
        const accelCollection = collection(db, "internet");
        const accelQuery = query(accelCollection, orderBy("timestamp", "asc"));

        const unsubscribe = onSnapshot(accelQuery, (snapshot) => {
            const data = snapshot.docs.map(doc => doc.data() as InternateData);
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

    const renderItem = useCallback(({ item }: { item: InternateData }) => (
        <View style={styles.row}>
            <Text style={styles.cell}>Conexión: {item.conexion} </Text>
            <Text style={styles.cell}>Tipo de conexión: {item.tipoConexion}</Text>
            <Text style={styles.cell}>Dirección IP: {item.ipData} </Text>
            <Text style={styles.cell}>Es accesible Internet: {item.accesible} </Text>
            <Text style={styles.cell}>Modo avión activo: {item.avion} </Text>
        </View>
    ), []);

    return (
        <View style={styles.screen}>
            <View style={styles.container}>
                <View style={styles.titleContent}>
                    <FontAwesome5 name='wifi' size={20} style={styles.icon} />
                    <Text style={styles.title}>Internet</Text>
                </View>
                <Text style={styles.dataText}>Conexión: {conexion} </Text>
                <Text style={styles.dataText}>Tipo de conexión: {tipoConexion}</Text>
                <Text style={styles.dataText}>Dirección IP: {ipData} </Text>
                <Text style={styles.dataText}>Es accesible Internet: {accesible} </Text>
                <Text style={styles.dataText}>Modo avión activo: {avion} </Text>
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
