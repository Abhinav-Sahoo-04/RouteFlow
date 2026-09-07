import React from 'react'
import style from "../styles/Dashboard.module.css"
export default function Dashboard() {
  return (
    <main className={style.dashboardContainer} >
      <nav  className={style.navbar}>
        <div className={style.logo}>
          <span>Route</span>
          <p>Flow</p>
        </div>
      </nav>
      <div className={style.dashboard}>
        <div className={style.items}>
          <div className={style.dashItems}>
            <i class="ri-user-6-line"></i>
            <p>Users</p>
          </div>
          <div className={style.dashItems}>
            <i class="ri-24-hours-line"></i>
            <p>Bus</p>
          </div>
          <div className={style.dashItems}>
            <i class="ri-map-pin-line"></i>
            <p>Routes</p>
          </div>
          <div  className={`${style.dashItems} ${style.white}`}>
            <p>Info</p>
          </div>
        </div>
        <div className={style.log}>
          <div className={style.logItems}></div>
        </div>
      </div>
    </main>
  )
}
