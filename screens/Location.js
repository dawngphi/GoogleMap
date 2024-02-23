import React, { useState, useEffect } from 'react';
import MapView, { Marker } from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import { View } from 'react-native';

const MapDiChuyen = () => {
    const [position, setPosition] = useState(null);

    useEffect(() => {
        // Lấy vị trí hiện tại ngay khi ứng dụng khởi chạy
        Geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                setPosition({
                    latitude: latitude,
                    longitude: longitude,
                    latitudeDelta: 0.005,
                    longitudeDelta: 0.005,
                });
            },
            (error) => console.error(error),
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
        );

        // Theo dõi vị trí khi người dùng di chuyển
        const watchId = Geolocation.watchPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                setPosition({
                    latitude: latitude,
                    longitude: longitude,
                    latitudeDelta: 0.005,
                    longitudeDelta: 0.005,
                });
            },
            (error) => console.error(error),
            { enableHighAccuracy: false, distanceFilter: 10 }
        );

        // Dọn dẹp khi component bị unmount
        return () => Geolocation.clearWatch(watchId);
    }, []);

    return (
        <View style={{ flex: 1 }}>
            {position && (
                <MapView
                    style={{ flex: 1 }}
                    region={position}
                >
                    <Marker coordinate={position} />
                </MapView>
            )}
        </View>
    );
};

export default MapDiChuyen;