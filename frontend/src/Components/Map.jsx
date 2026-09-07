import { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from "react-leaflet";

import L from "leaflet";
import axios from "axios";

import "leaflet/dist/leaflet.css";

import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// Fix Leaflet marker
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});


function ChangeView({ center }) {
  const map = useMap();

  useEffect(() => {
    map.setView(center, 13);
  }, [center, map]);

  return null;
}


export default function Map() {

  const [position, setPosition] = useState(null);

  const [busData, setBusData] = useState([]);

  const [routePath, setRoutePath] = useState([]);


  // --------------------------------
  // Get user's location
  // --------------------------------

  useEffect(() => {

    if (!navigator.geolocation) {
      console.log("Geolocation not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition(

      (position) => {

        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        setPosition([lat, lng]);

      },

      (error) => {
        console.error(error);
      },

      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }

    );

  }, []);


  // --------------------------------
  // Get bus + route data from Django
  // --------------------------------

  useEffect(() => {

    axios.get("http://127.0.0.1:8000/api/v1/route/")
      .then((response) => {

        console.log(response.data);

        setBusData(response.data);

      })
      .catch((error) => {

        console.error(error);

      });

  }, []);


  // --------------------------------
  // Create OSRM route
  // --------------------------------

  useEffect(() => {

    if (busData.length === 0) {
      return;
    }

    const bus = busData[0];

    if (!bus.route || bus.route.length < 2) {
      return;
    }


    // OSRM expects:
    // longitude,latitude
    //
    // NOT:
    // latitude,longitude

    const coordinates = bus.route
      .map((point) => {

        return `${point.longitude},${point.latitude}`;

      })
      .join(";");


    const url =
      `https://router.project-osrm.org/route/v1/driving/${coordinates}` +
      `?overview=full&geometries=geojson`;


    fetch(url)

      .then((response) => response.json())

      .then((data) => {

        console.log("OSRM:", data);

        if (data.code !== "Ok") {

          console.error("OSRM error:", data);

          return;

        }


        const coordinates =
          data.routes[0].geometry.coordinates;


        // OSRM gives:
        // [longitude, latitude]
        //
        // Leaflet needs:
        // [latitude, longitude]

        const leafletCoordinates = coordinates.map(
          ([lng, lat]) => [lat, lng]
        );


        setRoutePath(leafletCoordinates);

      })

      .catch((error) => {

        console.error("OSRM request failed:", error);

      });

  }, [busData]);


  // --------------------------------
  // Loading
  // --------------------------------

  if (!position) {

    return (

      <h2
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        Getting your location...
      </h2>

    );

  }


  // --------------------------------
  // Map
  // --------------------------------

  return (

    <MapContainer
      center={position}
      zoom={13}
      style={{
        height: "100%",
        width: "100%",
      }}
    >

      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />


      <ChangeView center={position} />


      {/* User location */}

      <Marker position={position}>

        <Popup>
          You are here 📍
        </Popup>

      </Marker>


      {/* Route markers */}

      {busData.length > 0 &&
        busData[0].route?.map((point) => (

          <Marker
            key={point.id}
            position={[
              Number(point.latitude),
              Number(point.longitude),
            ]}
          >

            <Popup>

              <strong>
                {point.name}
              </strong>

            </Popup>

          </Marker>

        ))
      }


      {/* OSRM road route */}

      {routePath.length > 0 && (

        <Polyline
          positions={routePath}
          pathOptions={{
            color: "blue",
            weight: 5,
          }}
        />

      )}

    </MapContainer>

  );
}