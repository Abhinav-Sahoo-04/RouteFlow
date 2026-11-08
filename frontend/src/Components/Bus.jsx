
import React, { useEffect, useState } from "react";
import axios from "axios";
import style from "../styles/Bus.module.css";

export default function Bus() {
  const [bus, setBus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchBus() {
      try {
        const response = await axios.get(
          "http://127.0.0.1:8000/api/v1/buses/"
        );

        setBus(response.data);
      } catch (error) {
        console.error("Error fetching buses:", error);
        setError("Failed to fetch buses.");
      } finally {
        setLoading(false);
      }
    }

    fetchBus();
  }, []);

  if (loading) {
    return <div className={style.Bus}>Loading buses...</div>;
  }

  if (error) {
    return <div className={style.Bus}>{error}</div>;
  }

  return (
    <ul className={style.Bus}>
      {bus.length > 0 ? (
        bus.map((item) => (
          <li key={item.id} className={style.busCard}>
            <i class="ri-bus-fill"></i>
            <h3>Bus {item.busNo}</h3>
            <p>Bus Registration Number : {item.RegcNo}</p>
          </li>
        ))
      ) : (
        <p>No buses found.</p>
      )}
    </ul>
  );
}
