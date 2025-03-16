import { useState, useEffect, useRef } from "react";
import { Accelerometer, Magnetometer, Gyroscope, DeviceMotion, LightSensor } from 'expo-sensors';
import * as Location from 'expo-location';
import * as Battery from 'expo-battery';
import * as Network from 'expo-network';

const useSensors = () => {
    const [dateTime, setDateTime] = useState(new Date());
    const [accelData, setAccelData] = useState({ x: 0, y: 0, z: 0 });
    const [magData, setMagData] = useState({ x: 0, y: 0, z: 0 });
    const [location, setLocation] = useState({
        city: '',
        latitude: 0,
        longitude: 0,
        accuracy: 0,
        altitude: 0,
        heading: 0,
        speed: 0,
    });
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

    const [accesible, setAccesible] = useState('');
    const [avion, setavion] = useState('');

    const accelSubscriptionRef = useRef(null);
    const magSubscriptionRef = useRef(null);
    const gyroSubscriptionRef = useRef(null);
    const vectorRotationRef = useRef(null);

    const [lightIntensity, setLightIntensity] = useState(0);

    useEffect(() => {
        // Sensor de luz con verificación de valor
        const subscribe = () => {
            LightSensor.addListener((data) => {
                setLightIntensity((prev) =>
                    prev === data.illuminance ? prev : data.illuminance
                );
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
            // Acelerómetro con verificación
            Accelerometer.setUpdateInterval(2000);
            accelSubscriptionRef.current = Accelerometer.addListener((data) => {
                setAccelData((prev) =>
                    prev.x === data.x && prev.y === data.y && prev.z === data.z
                        ? prev
                        : data
                );
            });

            // Magnetómetro con verificación
            Magnetometer.setUpdateInterval(2000);
            magSubscriptionRef.current = Magnetometer.addListener((data) => {
                setMagData((prev) =>
                    prev.x === data.x && prev.y === data.y && prev.z === data.z
                        ? prev
                        : data
                );
            });

            // Ubicación
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status === 'granted') {
                const loc = await Location.getCurrentPositionAsync({});
                const { latitude, longitude, accuracy, altitude, heading, speed } = loc.coords;

                // Obtención de la ciudad mediante geocodificación inversa
                let city = '';
                try {
                    const geo = await Location.reverseGeocodeAsync({ latitude, longitude });
                    if (geo && geo.length > 0) {
                        // Se obtiene la ciudad o, en su defecto, la región
                        city = geo[0].city || geo[0].region || '';
                    }
                } catch (error) {
                    console.error("Error al obtener la ciudad:", error);
                }

                setLocation((prev) => {
                    const newLoc = { city, latitude, longitude, accuracy, altitude, heading, speed };
                    // Verificar que algún valor haya cambiado antes de actualizar el estado
                    if (
                        prev.city === newLoc.city &&
                        prev.latitude === newLoc.latitude &&
                        prev.longitude === newLoc.longitude &&
                        prev.accuracy === newLoc.accuracy &&
                        prev.altitude === newLoc.altitude &&
                        prev.heading === newLoc.heading &&
                        prev.speed === newLoc.speed
                    ) {
                        return prev;
                    }
                    return { ...prev, ...newLoc };
                });
            }

            // Giroscopio con verificación
            Gyroscope.setUpdateInterval(2000);
            gyroSubscriptionRef.current = Gyroscope.addListener((data) => {
                setGyroData((prev) =>
                    prev.x === data.x && prev.y === data.y && prev.z === data.z
                        ? prev
                        : data
                );
            });

            // DeviceMotion (orientación y gravedad)
            const isAvailable = await DeviceMotion.isAvailableAsync();
            if (isAvailable) {
                DeviceMotion.setUpdateInterval(2000);
                vectorRotationRef.current = DeviceMotion.addListener((data) => {
                    if (data.rotation) {
                        const newOrientation = {
                            z: normalizarRango(radianesAGrados(data.rotation.alpha)),
                            x: normalizarRango(radianesAGrados(data.rotation.beta)),
                            y: normalizarRango(radianesAGrados(data.rotation.gamma))
                        };
                        setOrientation((prevOrientation) => {
                            if (
                                prevOrientation.x === newOrientation.x &&
                                prevOrientation.y === newOrientation.y &&
                                prevOrientation.z === newOrientation.z
                            ) {
                                return prevOrientation;
                            }
                            return newOrientation;
                        });
                    }
                    if (data.accelerationIncludingGravity) {
                        setGravity((prev) => {
                            if (
                                prev.x === data.accelerationIncludingGravity.x &&
                                prev.y === data.accelerationIncludingGravity.y &&
                                prev.z === data.accelerationIncludingGravity.z
                            ) {
                                return prev;
                            }
                            return data.accelerationIncludingGravity;
                        });
                    }
                    if (data.rotationRate) {
                        setVectorRotacionData((prev) =>
                            prev.alpha === data.rotationRate.alpha &&
                                prev.beta === data.rotationRate.beta &&
                                prev.gamma === data.rotationRate.gamma
                                ? prev
                                : data.rotationRate
                        );
                    }
                    if (data.acceleration) {
                        setAccelDataLineal((prev) =>
                            prev.x === data.acceleration.x &&
                                prev.y === data.acceleration.y &&
                                prev.z === data.acceleration.z
                                ? prev
                                : data.acceleration
                        );
                    }
                });
            }
        };

        fetchData();

        return () => {
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
            setBatteryLevel((prev) =>
                prev === batteryLevelValue * 100 ? prev : batteryLevelValue * 100
            );

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
            setBatteryState((prev) =>
                prev === batteryStateText ? prev : batteryStateText
            );

            const lowPowerModeValue = await Battery.isLowPowerModeEnabledAsync();
            const lowPowerModeText = lowPowerModeValue ? 'activado' : 'desactivado';
            setLowPowerMode((prev) =>
                prev === lowPowerModeText ? prev : lowPowerModeText
            );

            // WiFi y red
            const newIpData = await Network.getIpAddressAsync();
            setIpData((prev) => (prev === newIpData ? prev : newIpData));

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
                setTipoConexion((prev) =>
                    prev === tipoConexionText ? prev : tipoConexionText
                );
            }
            setConexion((prev) =>
                prev === (tipoCon.isConnected ? 'sí' : 'no')
                    ? prev
                    : (tipoCon.isConnected ? 'sí' : 'no')
            );

            setAccesible((prev) =>
                prev === (tipoCon.isInternetReachable ? 'sí' : 'no')
                    ? prev
                    : (tipoCon.isInternetReachable ? 'sí' : 'no')
            );

            const isAirplaneMode = await Network.isAirplaneModeEnabledAsync();
            setavion((prev) =>
                prev === (isAirplaneMode ? 'sí' : 'no')
                    ? prev
                    : (isAirplaneMode ? 'sí' : 'no')
            );
        };

        const interval = setInterval(fetchBattery, 2000);
        return () => clearInterval(interval);
    }, []);

    return {
        dateTime, accelData, magData, location, gyroData, ipData, tipoConexion,
        conexion, gravity, batteryLevel, batteryState, lowPowerMode, accelDataLineal,
        vectorRotacionData, orientation, lightIntensity, avion, accesible
    };
};

export default useSensors;
