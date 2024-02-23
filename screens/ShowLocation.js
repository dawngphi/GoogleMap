import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from "react-native-maps";
import Haversine from 'haversine';
import database from '@react-native-firebase/database';
import DateTimePicker from '@react-native-community/datetimepicker';

const startMakerImage = require('../src/image/icon_ghim_start.png');
const endMakerImage = require('../src/image/icon_ghim_end.png');

const ShowLocation = () => {
    const [latitude, setLatitude] = useState(10.8496476);
    const [longitude, setLongitude] = useState(106.6245025);
    const [routeCoordinates, setRouteCoordinates] = useState([]);
    const [region, setRegion] = useState({
        latitude: 10.8496476,
        longitude: 106.6245025,
        latitudeDelta: 0.009,
        longitudeDelta: 0.009,
    });
    const [distance, setDistance] = useState(0);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);

    const calculateDistance = (newRouteCoordinates) => {
        let totalDistance = 0;
        for (let i = 1; i < newRouteCoordinates.length; i++) {
            totalDistance += Haversine(newRouteCoordinates[i - 1], newRouteCoordinates[i], { unit: 'kilometer' });
        }
        return totalDistance.toFixed(2);
    };

    const fetchDataForDate = (date) => {
        const locationRef = database().ref(`/locations/${date}`);
        locationRef.orderByChild('timestamp').once('value', snapshot => {
            const locations = [];
            let totalLat = 0;
            let totalLng = 0;
            snapshot.forEach(childSnapshot => {
                const locationData = childSnapshot.val();
                if (locationData) {
                    locations.push(locationData);
                    totalLat += locationData.latitude;
                    totalLng += locationData.longitude;
                }
            });
            setRouteCoordinates(locations);
            setDistance(calculateDistance(locations));
            console.log("locations", locations);
            // Cập nhật vùng bản đồ
            if (locations.length > 0) {
                setRegion({
                    latitude: totalLat / locations.length,
                    longitude: totalLng / locations.length,
                    latitudeDelta: 0.009,
                    longitudeDelta: 0.009,
                });
            }
        });
    };
    useEffect(() => {
        // Định dạng ngày hiện tại để truy vấn Firebase
        const formattedDate = selectedDate.toISOString().split('T')[0].replace(/-/g, '');
        fetchDataForDate(formattedDate);
    }, [selectedDate]); // Chỉ chạy lại khi selectedDate thay đổi

    const onDateChange = (event, selectedDate) => {
        setShowDatePicker(false); // Ẩn date picker sau khi chọn ngày
        if (selectedDate) {
            setSelectedDate(selectedDate);
        }
    };

    return (
        <View style={{ flex: 1 }}>
            <MapView
                provider={PROVIDER_GOOGLE}
                style={{ flex: 1 }}
                region={region}
                initialRegion={{
                    latitude: latitude,
                    longitude: longitude,
                    latitudeDelta: 0.009,
                    longitudeDelta: 0.009,
                }}
            >
                <Polyline
                    coordinates={routeCoordinates}
                    strokeColor="#000"
                    strokeWidth={6}
                />
                {routeCoordinates.length > 0 && (
                    <Marker
                        coordinate={routeCoordinates[0]}
                        title="Bắt đầu"
                        description="Đây là điểm xuất phát của hành trình."
                        image={startMakerImage}
                    />
                )}
                {routeCoordinates.length > 0 && (
                    <Marker
                        coordinate={routeCoordinates[routeCoordinates.length - 1]}
                        title="Kết thúc"
                        description="Đây là điểm kết thúc của hành trình."
                        image={endMakerImage}
                    />
                )}
            </MapView>
            <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.datePickerButton} onPress={() => setShowDatePicker(true)}>
                    <Text style={styles.datePickerText}>
                        {selectedDate.toISOString().split('T')[0]}
                    </Text>
                </TouchableOpacity>
                {showDatePicker && (
                    <DateTimePicker
                        value={selectedDate}
                        mode="date"
                        display="calendar"
                        onChange={onDateChange}
                        maximumDate={new Date()}
                        minimumDate={new Date(new Date().setDate(new Date().getDate() - 15))}
                    />
                )}
                <TouchableOpacity style={[styles.bubble, styles.button]}>
                    <Text style={styles.bottomBarContent}>
                        {distance} km
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    datePickerButton: {
        backgroundColor: '#007bff', // Màu nền xanh dương
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 30,
        elevation: 2, // Độ nổi cho Android
        shadowColor: '#000', // Đổ bóng cho iOS
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    datePickerText: {
        color: '#fff', // Màu chữ trắng
        fontWeight: 'bold',
    },
    buttonContainer: {
        position: 'absolute',
        bottom: 20,
        left: 10,
        right: 10,
        backgroundColor: 'transparent',
        flexDirection: 'row',
        justifyContent: 'center',
    },
    bubble: {
        backgroundColor: 'rgba(0,0,0,0.7)',
        paddingHorizontal: 18,
        paddingVertical: 12,
        borderRadius: 20,
    },
    button: {
        width: 80,
        paddingHorizontal: 12,
        alignItems: 'center',
        marginHorizontal: 10,
    },
    bottomBarContent: {
        fontSize: 16,
        color: '#FFFFFF',
        fontWeight: 'bold',
        textAlign: 'center',
    },
});

export default ShowLocation;