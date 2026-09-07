import React from 'react'
import style from "../styles/Home.module.css"
import { Link } from 'react-router-dom'
import Map from '../Components/Map'
export default function Home() {
  return (
    <div className={style.homePage} >
      <nav  className={style.navbar}>
        <div className={style.logo}>
          <span>Route</span>
          <p>Flow</p>
        </div>
        <div className={style.dashIcon}>
          <Link to="/dashboard">D</Link>
        </div>
      </nav>
      <main className={style.home}>
        <div className={style.mapField}>
          <Map/>
        </div>
        <ul className={style.stopField}>
          <li className={style.stop}>
            <i className="ri-bus-fill"></i>
            <p className={style.busNo}>64</p>
            <p className={style.time} >ETA</p>
          </li>
        </ul>
      </main>
    </div>
  )
}
