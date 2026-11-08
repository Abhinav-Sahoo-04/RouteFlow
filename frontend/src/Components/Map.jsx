
import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  MapContainer,
  TileLayer,
  Polyline,
  Marker,
  CircleMarker,
  useMap,
} from "react-leaflet";

import L from "leaflet";
import axios from "axios";
import "leaflet/dist/leaflet.css";

const BUS_SPEED = 40;
const STOP_WAIT_TIME = 15;
const TICK_RATE = 250;

const defaultCenter = [20.466838, 85.854722];

// Bus icon
const busIcon = L.divIcon({
  className: "bus-marker",
  html: `
    <div style="
      font-size: 27px;
      background: white;
      border-radius: 50%;
      width: 38px;
      height: 38px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    ">🚌</div>
  `,
  iconSize: [38, 38],
  iconAnchor: [19, 19],
});

// Haversine distance in meters
function calculateDistance(a, b) {
  const R = 6371000;

  const lat1 = (a[0] * Math.PI) / 180;
  const lat2 = (b[0] * Math.PI) / 180;

  const deltaLat = ((b[0] - a[0]) * Math.PI) / 180;
  const deltaLng = ((b[1] - a[1]) * Math.PI) / 180;

  const value =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(lat1) *
      Math.cos(lat2) *
      Math.sin(deltaLng / 2) ** 2;

  return R * 2 * Math.atan2(
    Math.sqrt(value),
    Math.sqrt(1 - value)
  );
}

// ETA formatter
function formatETA(seconds) {
  if (!Number.isFinite(seconds)) {
    return "ETA unavailable";
  }

  if (seconds <= 0) {
    return "Arriving";
  }

  const minutes = Math.ceil(seconds / 60);

  if (minutes < 60) {
    return `${minutes} min`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  return `${hours} hr ${remainingMinutes} min`;
}

// Fit map when route changes, not on every render
function FitRoute({ routePath, routeKey }) {
  const map = useMap();

  useEffect(() => {
    if (routePath.length > 1) {
      map.fitBounds(routePath, {
        padding: [40, 40],
        maxZoom: 16,
      });
    } else if (routePath.length === 1) {
      map.setView(routePath[0], 15);
    }
  }, [map, routeKey]);

  return null;
}

function MapResizeHandler() {
  const map = useMap();

  useEffect(() => {
    const container = map.getContainer();

    const observer = new ResizeObserver(() => {
      map.invalidateSize();
    });

    observer.observe(container);

    return () => observer.disconnect();
  }, [map]);

  return null;
}


export default function Map({ onSimulationUpdate }) {
  const [routeData, setRouteData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [simulation, setSimulation] = useState({
    progress: 0,
    nextStopIndex: 0,
    dwellRemaining: 0,
    running: false,
    started: false,
    completed: false,
  });

  // Fetch route and automatically start simulation
  useEffect(() => {
    let cancelled = false;

    const fetchRoute = async () => {
      try {
        const response = await axios.get(
          "http://127.0.0.1:8000/api/v1/route/"
        );

        if (!Array.isArray(response.data)) {
          throw new Error("Invalid route response.");
        }

        const points = response.data
          .map((point, index) => ({
            ...point,
            latitude: Number(point.latitude),
            longitude: Number(point.longitude),
            order: Number.isFinite(Number(point.order))
              ? Number(point.order)
              : index,
          }))
          .filter(
            (point) =>
              Number.isFinite(point.latitude) &&
              Number.isFinite(point.longitude) &&
              Math.abs(point.latitude) <= 90 &&
              Math.abs(point.longitude) <= 180
          )
          .sort((a, b) => a.order - b.order);

        if (points.length < 2) {
          throw new Error("Not enough valid route points.");
        }

        if (!cancelled) {
          setRouteData(points);

          // Automatically start when route loads
          setSimulation({
            progress: 0,
            nextStopIndex: 0,
            dwellRemaining: 0,
            running: true,
            started: true,
            completed: false,
          });
        }
      } catch (err) {
        console.error("Route loading error:", err);

        if (!cancelled) {
          setError("Unable to load route.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchRoute();

    return () => {
      cancelled = true;
    };
  }, []);

  // Route points with cumulative distance
  const routePoints = useMemo(() => {
    let distance = 0;

    return routeData.map((point, index) => {
      const position = [
        point.latitude,
        point.longitude,
      ];

      if (index > 0) {
        const previous = [
          routeData[index - 1].latitude,
          routeData[index - 1].longitude,
        ];

        distance += calculateDistance(previous, position);
      }

      return {
        ...point,
        position,
        distance,
      };
    });
  }, [routeData]);

  const routePath = useMemo(
    () => routePoints.map((point) => point.position),
    [routePoints]
  );

  const routeKey = useMemo(
    () =>
      routePath
        .map((point) => `${point[0]},${point[1]}`)
        .join("|"),
    [routePath]
  );

  const totalDistance =
    routePoints.length > 0
      ? routePoints[routePoints.length - 1].distance
      : 0;

  const speedInMetersPerSecond = BUS_SPEED / 3.6;

  // Named bus stops
  const stops = useMemo(
    () =>
      routePoints.filter(
        (point) =>
          typeof point.name === "string" &&
          point.name.trim() !== ""
      ),
    [routePoints]
  );

  // Calculate bus position
  const getBusPosition = (progress) => {
    if (routePoints.length === 0) {
      return defaultCenter;
    }

    for (let i = 1; i < routePoints.length; i++) {
      const previous = routePoints[i - 1];
      const next = routePoints[i];

      if (progress <= next.distance) {
        const segmentDistance =
          next.distance - previous.distance;

        const ratio =
          segmentDistance === 0
            ? 0
            : Math.max(
                0,
                Math.min(
                  1,
                  (progress - previous.distance) /
                    segmentDistance
                )
              );

        return [
          previous.position[0] +
            (next.position[0] - previous.position[0]) * ratio,

          previous.position[1] +
            (next.position[1] - previous.position[1]) * ratio,
        ];
      }
    }

    return routePoints[routePoints.length - 1].position;
  };

  const busPosition = getBusPosition(simulation.progress);

  // Stop status and ETA
  const stopDetails = useMemo(() => {
    return stops.map((stop, index) => {
      const isCurrentStop =
        simulation.dwellRemaining > 0 &&
        index === simulation.nextStopIndex - 1;

      const isPassed =
        index < simulation.nextStopIndex &&
        !isCurrentStop;

      let status = "Upcoming";
      let eta = "";

      if (isPassed) {
        status = "Passed";
        eta = "Completed";
      } else if (isCurrentStop) {
        status = "At Stop";
        eta = `Departing in ${Math.ceil(
          simulation.dwellRemaining
        )} sec`;
      } else {
        const remainingDistance = Math.max(
          0,
          stop.distance - simulation.progress
        );

        const remainingStops = stops
          .slice(simulation.nextStopIndex, index)
          .length;

        const travelTime =
          remainingDistance / speedInMetersPerSecond;

        const waitingTime =
          simulation.dwellRemaining +
          remainingStops * STOP_WAIT_TIME;

        eta = simulation.started
          ? formatETA(travelTime + waitingTime)
          : "Waiting for simulation";
      }

      return {
        order: Number(stop.order),
        name: stop.name,
        position: stop.position,
        distance: stop.distance,
        status,
        eta,
      };
    });
  }, [
    stops,
    simulation,
    speedInMetersPerSecond,
  ]);

  // Send simulation data to Home
  useEffect(() => {
    if (!onSimulationUpdate) return;

    let status = "Not started";

    if (simulation.completed) {
      status = "Completed";
    } else if (simulation.running) {
      status = "Running";
    } else if (simulation.started) {
      status = "Paused";
    }

    onSimulationUpdate({
      status,
      speed: BUS_SPEED,
      stops: stopDetails,
    });
  }, [
    simulation,
    stopDetails,
    onSimulationUpdate,
  ]);

  // Automatic bus movement
  useEffect(() => {
    if (!simulation.running || totalDistance <= 0) {
      return;
    }

    const timer = setInterval(() => {
      setSimulation((previous) => {
        if (!previous.running) return previous;

        // Waiting at a bus stop
        if (previous.dwellRemaining > 0) {
          const remaining =
            previous.dwellRemaining - TICK_RATE / 1000;

          if (remaining <= 0) {
            const finished =
              previous.progress >= totalDistance &&
              previous.nextStopIndex >= stops.length;

            return {
              ...previous,
              dwellRemaining: 0,
              running: !finished,
              completed: finished,
            };
          }

          return {
            ...previous,
            dwellRemaining: remaining,
          };
        }

        const movement =
          speedInMetersPerSecond *
          (TICK_RATE / 1000);

        const nextProgress = Math.min(
          totalDistance,
          previous.progress + movement
        );

        const nextStop = stops[previous.nextStopIndex];

        // Stop the bus at the next named stop
        if (
          nextStop &&
          nextStop.distance <= nextProgress
        ) {
          return {
            ...previous,
            progress: nextStop.distance,
            nextStopIndex: previous.nextStopIndex + 1,
            dwellRemaining: STOP_WAIT_TIME,
          };
        }

        // Finish journey
        if (
          nextProgress >= totalDistance &&
          previous.nextStopIndex >= stops.length
        ) {
          return {
            ...previous,
            progress: totalDistance,
            running: false,
            completed: true,
          };
        }

        return {
          ...previous,
          progress: nextProgress,
        };
      });
    }, TICK_RATE);

    return () => clearInterval(timer);
  }, [
    simulation.running,
    totalDistance,
    stops,
    speedInMetersPerSecond,
  ]);

  if (loading) {
    return <div>Loading map...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
      }}
    >
      <MapContainer
        center={defaultCenter}
        zoom={13}
        style={{
          height: "100%",
          width: "100%",
        }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <FitRoute
          routePath={routePath}
          routeKey={routeKey}
        />

        {/* Route line */}
        <Polyline
          positions={routePath}
          pathOptions={{
            color: "#2563eb",
            weight: 5,
            opacity: 0.8,
          }}
        />

        {/* Bus stops */}
        {stopDetails.map((stop, index) => {
          const color =
            stop.status === "Passed"
              ? "#16a34a"
              : stop.status === "At Stop"
              ? "#2563eb"
              : "#dc2626";

          return (
            <CircleMarker
              key={`${stop.order}-${index}`}
              center={stop.position}
              radius={7}
              pathOptions={{
                color: "white",
                weight: 2,
                fillColor: color,
                fillOpacity: 1,
              }}
            />
          );
        })}

        {/* Moving bus */}
        <Marker
          position={busPosition}
          icon={busIcon}
        />
      </MapContainer>
    </div>
  );
}
