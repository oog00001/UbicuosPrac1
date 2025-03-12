import { useState, useEffect, useRef } from "react";
import { Accelerometer, Magnetometer, Gyroscope, DeviceMotion, LightSensor } from 'expo-sensors';
import * as Location from 'expo-location';
import * as Battery from 'expo-battery';
import * as Network from 'expo-network';

const useSensors = () => {
    const [dateTime, setDateTime] = useState(new Date());
    const [accelData, setAccelData] = useState({ x: 0, y: 0, z: 0 });
    const [magData, setMagData] = useState({ x: 0, y: 0, z: 0 });
    const [location, setLocation] = useState({ latitude: 0, longitude: 0, altitude: 0 });
    const [gyroData, setGyroData] = useState({ x: 0, y: 0, z: 0 });
    const [ipData, setIpData] = useState('');
    const [tipoConexion, setTipoConexion] = useState('');
    const [conexion, setConexion] = useState('');

    const [gravity, setGravity] = useState({ x: 0, y: 0, z: 0 });
    const [batteryLevel, setBatteryLevel] = useState(0);
    const [batteryState, setBatteryState] = useState('');
    const [lowPowerMode, setLowPowerMode] = useState('');
    const [accelDataLineal, setAccelDataLineal] = useState({ x: 0, y: 0, z: 0 });
    const [vectorRotacionData, setVectorRotacionData] = useState({ alpha: 0, beta: 0, gamma: 0 });
    const [orientation, setOrientation] = useState({ x: 0, y: 0, z: 0 });

    const accelSubscriptionRef = useRef(null);
    const magSubscriptionRef = useRef(null);
    const stepSubscriptionRef = useRef(null);
    const gyroSubscriptionRef = useRef(null);
    const vectorRotationRef = useRef(null);

    const [lightIntensity, setLightIntensity] = useState(0);

    useEffect(() => {

        // Sensor de luz
        const subscribe = () => {
            LightSensor.addListener((data) => {
                setLightIntensity(data.illuminance);
            });
        };

        subscribe();

        return () => {
            LightSensor.removeAllListeners();
        };
    }, []);

    const radianesAGrados = (radianes) => {
        return (radianes * 180) / Math.PI;
    };

    // Función para normalizar el valor entre -360 y 360
    const normalizarRango = (valor) => {
        let grados = valor % 360;
        if (grados > 180) {
            grados -= 360;
        } else if (grados < -180) {
            grados += 360;
        }
        return grados;
    };

    useEffect(() => {
        const interval = setInterval(() => {
            setDateTime(new Date());
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            // Acelerómetro
            Accelerometer.setUpdateInterval(500);
            accelSubscriptionRef.current = Accelerometer.addListener(setAccelData);
    
            // Magnetómetro
            Magnetometer.setUpdateInterval(500);
            magSubscriptionRef.current = Magnetometer.addListener(setMagData);
    
            // Ubicación
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status === 'granted') {
                const loc = await Location.getCurrentPositionAsync({});
                setLocation({
                    latitude: loc.coords.latitude,
                    longitude: loc.coords.longitude,
                    altitude: loc.coords.altitude ?? 0,
                });
            }
    
            // Giroscopio
            Gyroscope.setUpdateInterval(500);
            gyroSubscriptionRef.current = Gyroscope.addListener(setGyroData);
    
            // DeviceMotion (orientación y gravedad)
            const isAvailable = await DeviceMotion.isAvailableAsync();
            if (isAvailable) {
                DeviceMotion.setUpdateInterval(500);
                vectorRotationRef.current = DeviceMotion.addListener((data) => {
                    if (data.rotation) {
                        setOrientation({
                            z: normalizarRango(radianesAGrados(data.rotation.alpha)),
                            x: normalizarRango(radianesAGrados(data.rotation.beta)),
                            y: normalizarRango(radianesAGrados(data.rotation.gamma))
                        });
                    }
                    if (data.accelerationIncludingGravity) setGravity(data.accelerationIncludingGravity);
                    if (data.rotationRate) setVectorRotacionData(data.rotationRate);
                    if (data.acceleration) setAccelDataLineal(data.acceleration);
                });
            }
        };
    
        fetchData();
    
        return () => {
            // Eliminamos suscripciones cuando el componente se desmonta
            if (accelSubscriptionRef.current) accelSubscriptionRef.current.remove();
            if (magSubscriptionRef.current) magSubscriptionRef.current.remove();
            if (gyroSubscriptionRef.current) gyroSubscriptionRef.current.remove();
            if (vectorRotationRef.current) vectorRotationRef.current.remove();
        };
    }, []);   

    useEffect(() => {
        const fetchBattery = async () => {
            // Batería
            const batteryLevelValue = await Battery.getBatteryLevelAsync();
            setBatteryLevel(batteryLevelValue * 100);

            const batteryStateValue = await Battery.getBatteryStateAsync();

            let batteryStateText = '';
            switch (batteryStateValue) {
                case Battery.BatteryState.CHARGING:
                    batteryStateText = 'cargando';
                    break;
                case Battery.BatteryState.FULL:
                    batteryStateText = 'batería llena';
                    break;
                case Battery.BatteryState.UNPLUGGED:
                    batteryStateText = 'descarga';
                    break;
                default:
                    batteryStateText = 'desconocido';
            }
            setBatteryState(batteryStateText);

            const lowPowerModeValue = await Battery.isLowPowerModeEnabledAsync();

            let lowPowerModeText = '';
            if (!lowPowerModeValue) {
                lowPowerModeText = 'desactivado';
            } else {
                lowPowerModeText = 'activado';
            }
            setLowPowerMode(lowPowerModeText);

            // WiFi
            setIpData(await Network.getIpAddressAsync());
            const tipoCon = await Network.getNetworkStateAsync();
            let tipoConexionText = '';
            if (tipoCon.type) {
                switch (tipoCon.type.toLowerCase()) {
                    case 'wifi':
                        tipoConexionText = 'WiFi';
                        break;
                    case 'cellular':
                        tipoConexionText = 'datos móviles';
                        break;
                    case 'unknown':
                        tipoConexionText = 'desconocido';
                        break;
                    case 'none':
                        tipoConexionText = 'sin conexión';
                        break;
                    default:
                        tipoConexionText = 'desconocida';
                }
                setTipoConexion(tipoConexionText);
            }

            setConexion(tipoCon.isConnected ? 'sí' : 'no');
        };

        fetchBattery();
    }, [accelData, gravity]);

    return { dateTime, accelData, magData, location, gyroData, ipData, tipoConexion, 
        conexion, gravity, batteryLevel, batteryState, lowPowerMode, accelDataLineal, 
        vectorRotacionData, orientation, lightIntensity };
};

export default useSensors;
