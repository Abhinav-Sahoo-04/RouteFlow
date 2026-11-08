
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import style from "../styles/RoutesComponent.module.css";

export default function RoutesComponent() {
  const navigate = useNavigate();

  const [busStops, setBusStops] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const fetchBusStops = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await axios.get(
          "http://127.0.0.1:8000/api/v1/route/"
        );

        if (!Array.isArray(response.data)) {
          throw new Error("Invalid API response");
        }

        // Display only named bus stops, in route order
        const stops = response.data
          .filter(
            (point) =>
              typeof point.name === "string" &&
              point.name.trim() !== ""
          )
          .sort(
            (a, b) => Number(a.order) - Number(b.order)
          );

        if (!cancelled) {
          setBusStops(stops);
        }
      } catch (err) {
        console.error("Bus stops loading error:", err);

        if (!cancelled) {
          setError("Unable to load bus stops. Please try again.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchBusStops();

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredStops = useMemo(() => {
    return busStops.filter((stop) =>
      stop.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [busStops, search]);

  return (
    <div className={style.routePage}>
      {/* Header */}
      {/* <header className={style.header}>
        <div
          className={style.logo}
          onClick={() => navigate("/homepage")}
        >
          <span>Route</span>
          <p>Flow</p>
        </div>

        <button
          className={style.backButton}
          onClick={() => navigate("/dashboard")}
        >
          <i className="ri-arrow-left-line"></i>
          Dashboard
        </button>
      </header> */}

      <main className={style.container}>
        {/* Page heading */}
        <div className={style.heading}>
          <div>
            <p className={style.subtitle}>BUS MANAGEMENT</p>
            <h1>
              Bus <span>Routes</span>
            </h1>
            <p className={style.description}>
              View and manage the stops along your bus route.
            </p>
          </div>

          <div className={style.routeIcon}>
            <i className="ri-route-line"></i>
          </div>
        </div>

        {/* Summary */}
        <div className={style.summary}>
          <div className={style.summaryIcon}>
            <i className="ri-map-pin-line"></i>
          </div>

          <div>
            <p>Total Bus Stops</p>
            <h2>{busStops.length}</h2>
          </div>
        </div>

        {/* Stop list section */}
        <section className={style.stopSection}>
          <div className={style.sectionHeader}>
            <div>
              <h2>Route Stops</h2>
              <p>Stops are displayed in their travel sequence.</p>
            </div>

            <span className={style.stopCount}>
              {filteredStops.length} Stops
            </span>
          </div>

          {/* Search */}
          <div className={style.searchBox}>
            <i className="ri-search-line"></i>

            <input
              type="text"
              placeholder="Search bus stop..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            {search && (
              <button onClick={() => setSearch("")}>
                <i className="ri-close-line"></i>
              </button>
            )}
          </div>

          {/* Loading */}
          {loading && (
            <div className={style.message}>
              <i className="ri-loader-4-line"></i>
              <p>Loading bus stops...</p>
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className={style.message}>
              <i className="ri-error-warning-line"></i>
              <p>{error}</p>

              <button onClick={() => window.location.reload()}>
                Retry
              </button>
            </div>
          )}

          {/* Empty */}
          {!loading && !error && filteredStops.length === 0 && (
            <div className={style.message}>
              <i className="ri-map-pin-line"></i>
              <p>
                {search
                  ? "No matching bus stops found."
                  : "No bus stops available."}
              </p>
            </div>
          )}

          {/* Bus stop list */}
          {!loading && !error && filteredStops.length > 0 && (
            <div className={style.stopList}>
              {filteredStops.map((stop, index) => (
                <div
                  className={style.stopItem}
                  key={stop.id ?? stop.order ?? index}
                >
                  <div className={style.stopTimeline}>
                    <div className={style.stopNumber}>
                      {index + 1}
                    </div>

                    {index !== filteredStops.length - 1 && (
                      <div className={style.timelineLine}></div>
                    )}
                  </div>

                  <div className={style.stopDetails}>
                    <div>
                      <h3>{stop.name}</h3>
                      <p>
                        <i className="ri-map-pin-2-line"></i>
                        Bus Stop
                      </p>
                    </div>

                    <span className={style.order}>
                      STOP {String(index + 1).padStart(2, "0")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
