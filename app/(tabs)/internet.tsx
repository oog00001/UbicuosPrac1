import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Button } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import useSensors from '../../hooks/useSensors';
import { db, collection } from './firebaseConfig';
import { onSnapshot, query, orderBy } from 'firebase/firestore';

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
            title: 'Internet',
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
    }, [navigation]);

    useEffect(() => {
        const accelCollection = collection(db, 'internet');
        const accelQuery = query(accelCollection, orderBy('timestamp', 'asc'));

        const unsubscribe = onSnapshot(accelQuery, (snapshot) => {
            const data = snapshot.docs.map(doc => doc.data() as InternateData);
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
                <View>
                    {displayedData.map((item, index) => (
                        <View key={index} style={styles.row}>
                            <Text style={styles.cell}> {item.timestamp}</Text>
                            <Text style={styles.cell}>Conexión: {item.conexion} </Text>
                            <Text style={styles.cell}>Tipo: {item.tipoConexion}</Text>
                            <Text style={styles.cell}>IP: {item.ipData} </Text>
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
