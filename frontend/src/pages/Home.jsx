
import React, {
  useEffect,
  useState,
  useCallback,
} from "react";

import style from "../styles/Home.module.css";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Map from "../Components/Map";

export default function Home() {
  const [busStops, setBusStops] = useState([]);
  const [simulationData, setSimulationData] = useState(null);
  const [loadingStops, setLoadingStops] = useState(true);
  const [stopError, setStopError] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;

    const fetchBusStops = async () => {
      try {
        const response = await axios.get(
          "http://127.0.0.1:8000/api/v1/route/"
        );

        if (!Array.isArray(response.data)) {
          throw new Error("Invalid route API response.");
        }

        const stops = response.data
          .filter(
            (point) =>
              typeof point.name === "string" &&
              point.name.trim() !== ""
          )
          .sort((a, b) => Number(a.order) - Number(b.order));

        if (!cancelled) {
          setBusStops(stops);
        }
      } catch (error) {
        console.error("Bus stop loading error:", error);

        if (!cancelled) {
          setStopError("Unable to load bus stops.");
        }
      } finally {
        if (!cancelled) {
          setLoadingStops(false);
        }
      }
    };

    fetchBusStops();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleHome = () => {
    navigate("/homepage");
  };

  // Stable callback prevents infinite render loops
  const handleSimulationUpdate = useCallback((data) => {
    setSimulationData(data);
  }, []);

  const getStopDetails = (stop) => {
    if (!simulationData?.stops) {
      return {
        status: "Upcoming",
        eta: "Calculating...",
      };
    }

    return (
      simulationData.stops.find(
        (item) => item.order === Number(stop.order)
      ) || {
        status: "Upcoming",
        eta: "Calculating...",
      }
    );
  };

  return (
    <div className={style.homePage}>
      <nav className={style.navbar}>
        <div className={style.logo} onClick={handleHome}>
          <span>Route</span>
          <p>Flow</p>
        </div>

        <div className={style.dashIcon}>
          <Link to="/dashboard">
            <img src="/logo.svg" alt="Dashboard" />
          </Link>
        </div>
      </nav>

      <main className={style.home}>
        {/* Map */}
        <div className={style.mapField}>
          <Map onSimulationUpdate={handleSimulationUpdate} />
        </div>

        {/* Bus information */}
        {/* <ul className={style.stopField}>
          <li className={style.stop}>
            <i className="ri-bus-fill"></i>

            <p className={style.busNo}>13</p>

            {!loadingStops && !stopError && busStops.length > 0 && (
              <>
                <p className={style.startStop}>
                  Start Point: {busStops[0].name}
                </p>

                <p className={style.endStop}>
                  End Point: {busStops[busStops.length - 1].name}
                </p>
              </>
            )}

            <p>
              Status: {simulationData?.status || "Loading"}
            </p>

  
          </li>
        </ul> */}
        <ul className={style.stopField}>
          <li className={style.stop}>
            <i className="ri-bus-fill"></i>
            <p className={style.busNo}>13</p>
            <p>
              Status: {simulationData?.status || "Loading"}
            </p>
          </li>
        </ul>

        {/* Bus stop information */}
        <ul className={style.stopPoints}>
          {loadingStops && (
            <li className={style.stopPoint}>
              <p className={style.stopName}>
                Loading bus stops...
              </p>
            </li>
          )}

          {!loadingStops && stopError && (
            <li className={style.stopPoint}>
              <p className={style.stopName}>{stopError}</p>
            </li>
          )}

          {!loadingStops && !stopError && busStops.length === 0 && (
            <li className={style.stopPoint}>
              <p className={style.stopName}>
                No named bus stops found.
              </p>
            </li>
          )}

          {!loadingStops &&
            !stopError &&
            busStops.map((stop, index) => {
              const details = getStopDetails(stop);

              const statusColor =
                details.status === "Passed"
                  ? "#16a34a"
                  : details.status === "At Stop"
                  ? "#2563eb"
                  : "#777";

              return (
                <li
                  className={style.stopPoint}
                  key={stop.id ?? stop.order ?? index}
                >
                  <p className={style.stopName}>
                    {stop.name}
                  </p>

                  <p className={style.time}>
                    {details.eta}
                  </p>

                  <p
                    style={{
                      color: statusColor,
                      fontWeight: 600,
                      fontSize: "12px",
                    }}
                  >
                    {details.status}
                  </p>
                </li>
              );
            })}
        </ul>
      </main>
    </div>
  );
}
