
import React, { useState } from "react";
import style from "../styles/Dashboard.module.css";
import AddDrops from "./AddDrops";
import Bus from "../Components/Bus";
import { useNavigate } from "react-router-dom";
import RoutesComponent from "../Components/RoutesComponent";

// Import these when you create the components
// import Users from "../Components/Users";
// import RoutesComponent from "../Components/Routes";

export default function Dashboard() {
  const [activeComponent, setActiveComponent] = useState("drops");

  const navigate=useNavigate()

  function handleHome(){
    navigate("/homepage")
  }

  function renderComponent() {
    switch (activeComponent) {
      case "buses":
        return <Bus />;

      case "drops":
        return <AddDrops />;

      // case "users":
      //   return <Users />;

      case "routes":
        return <RoutesComponent />;

      default:
        return <AddDrops />;
    }
  }

  return (
    <main className={style.dashboardContainer}>
      <nav className={style.navbar}>
        <div className={style.logo} onClick={handleHome} >
          <span>Route</span>
          <p>Flow</p>
        </div>
      </nav>

      <div className={style.dashboard}>
        <div className={style.items}>
          <div
            className={style.dashItems}
            onClick={() => setActiveComponent("users")}
          >
            <i className="ri-user-6-line"></i>
            <p>Users</p>
          </div>

          <div
            className={style.dashItems}
            onClick={() => setActiveComponent("buses")}
          >
            <i className="ri-24-hours-line"></i>
            <p>Bus</p>
          </div>

          <div
            className={style.dashItems}
            onClick={() => setActiveComponent("routes")}
          >
            <i className="ri-map-pin-line"></i>
            <p>Routes</p>
          </div>

          <div
            onClick={() => setActiveComponent("drops")}
            className={`${style.dashItems} ${style.white}`}
          >
            <p>Drops</p>
          </div>
        </div>

        <div className={style.log}>
          <div className={style.logItems}>
            {renderComponent()}
          </div>
        </div>
      </div>
    </main>
  );
}
