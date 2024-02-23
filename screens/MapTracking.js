import { StyleSheet, Text, View, TouchableOpacity, PermissionsAndroid, ToastAndroid } from 'react-native';
import React from 'react';
import MapView, { Marker, AnimatedRegion, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import Haversine from 'haversine';
import Geolocation from '@react-native-community/geolocation';
import { Platform } from 'react-native';
import database from '@react-native-firebase/database';
import { useNavigation } from '@react-navigation/native';


const LATITUDE_DELTA = 0.009;
const LONGITUDE_DELTA = 0.009;
// const LATITUDE = 37.78825;
// const LONGITUDE = -122.4324;
const LATITUDE = 10.794534368603113;
const LONGITUDE = 106.63676138505912;
class MapTracking extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            latitude: LATITUDE,
            longitude: LONGITUDE,
            routeCoordinates: [],
            distanceTravelled: 0,
            prevLatLng: {},
            isStart: false,
            isStop: false,
            coordinate: new AnimatedRegion({
                latitude: LATITUDE,
                longitude: LONGITUDE,
                latitudeDelta: 0,
                longitudeDelta: 0
            })
        };
    }
    startTracking = () => {
        if(this.state.isStart) {
            console.log("đã bắt đầu theo dõi rồi");
            return;
        
        };
        console.log("startTracking");
        this.setState({
            isStart: true,
            isStop: false,
            routeCoordinates: [],
            distanceTravelled: 0,
            prevLatLng: {}
        }, () => {
            this.beginLocationTracking();
        });
        ToastAndroid.show("Bắt đầu ghi lại vị trí", ToastAndroid.SHORT);
    }
    stopTracking = () => {
        console.log("stopTracking");
        if (this.watchID !== null) {
            Geolocation.clearWatch(this.watchID);
            this.watchID = null; // Đặt lại watchID sau khi clear
        }
        this.setState({
            isStart: false,
            routeCoordinates: [],
            distanceTravelled: 0,
            prevLatLng: {}
        });
        ToastAndroid.show("Kết thúc ", ToastAndroid.SHORT);
    }
    componentDidMount() {
        this.beginLocationTracking();
    }
    beginLocationTracking = () => {
        if (this.state.isStart) {
            const { coordinate } = this.state;
            this.watchID = Geolocation.watchPosition(
                position => {
                    const { routeCoordinates, distanceTravelled } = this.state;
                    const { latitude, longitude } = position.coords;
                    const newCoordinate = {
                        latitude,
                        longitude
                    };
    
                    console.log("newCoordinate", newCoordinate);
                    const timestamp = new Date().getTime();
                    const date = new Date();
                    const dateString = date.toISOString().split('T')[0].replace(/-/g, '');
                    const locationRef = database().ref(`/locations/${dateString}`).push();
                    locationRef.set({ ...newCoordinate, timestamp }).then(() => console.log('New data added.'));
    
                    if (Platform.OS === "android") {
                        if (this.marker) {
                            this.marker.animateMarkerToCoordinate(newCoordinate, 500);
                        }
                    } else {
                        coordinate.timing(newCoordinate).start();
                    }
                    this.setState({
                        latitude,
                        longitude,
                        routeCoordinates: routeCoordinates.concat([newCoordinate]),
                        distanceTravelled:
                            distanceTravelled + this.calcDistance(newCoordinate),
                        prevLatLng: newCoordinate
                    });
                },
                error => console.log(error),
                {
                    enableHighAccuracy: true,
                    timeout: 20000,
                    maximumAge: 1000,
                    distanceFilter: 15
                }
            );
        }
    }
    componentWillUnmount() {
        Geolocation.clearWatch(this.watchID);
    }
    getMapRegion = () => ({
        latitude: this.state.latitude,
        longitude: this.state.longitude,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA
    });
    calcDistance = newLatLng => {
        const { prevLatLng } = this.state;
        return Haversine(prevLatLng, newLatLng) || 0;
    };


    render() {
        const nav = this.props.navigation;
        return (
            <View style={styles.container}>
                <MapView
                    style={styles.map}
                    provider={PROVIDER_GOOGLE}
                    showUserLocation
                    followUserLocation
                    loadingEnabled
                    region={this.getMapRegion()}
                >
                    <Polyline coordinates={this.state.routeCoordinates} strokeWidth={5} />
                    <Marker.Animated
                        ref={marker => {
                            this.marker = marker;
                        }}
                        coordinate={this.state.coordinate}
                    />
                </MapView>

                <View style={styles.buttonContainer}>
                    <TouchableOpacity style={[styles.bubble, styles.button]} onPress={() => nav.navigate('ShowLocation')}>
                        <Text style={styles.bottomBarContent}>
                            {parseFloat(this.state.distanceTravelled).toFixed(2)} km
                        </Text>
                    </TouchableOpacity>

                </View>
                <View style={styles.buttonContainer}>
                    <TouchableOpacity style={[styles.bubble, styles.button]} onPress={this.startTracking}>
                        <Text style={styles.bottomBarContent}>
                            Bắt đầu
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.bubble, styles.button]} onPress={this.stopTracking}>
                        <Text style={styles.bottomBarContent}>
                            Kết thúc
                        </Text>
                    </TouchableOpacity>
                </View>

            </View>
        );
    }
}



const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: "flex-end",
        alignItems: "center"
    },
    map: {
        ...StyleSheet.absoluteFillObject
    },
    bubble: {
        flex: 1,
        backgroundColor: "rgba(255,255,255,0.7)",
        paddingHorizontal: 18,
        paddingVertical: 12,
        borderRadius: 20
    },
    latlng: {
        width: 200,
        alignItems: "stretch"
    },
    button: {
        backgroundColor: "black",
        width: 80,
        paddingHorizontal: 12,
        alignItems: "center",
        marginHorizontal: 5
    },
    buttonContainer: {
        flexDirection: "row",
        marginVertical: 10,
        backgroundColor: "transparent"
    },
    bottomBarContent: {
        fontSize: 16,
        color: "#FFFFFF",
        fontWeight: "bold",
        textAlign: "center"
    }
});
export default MapTracking