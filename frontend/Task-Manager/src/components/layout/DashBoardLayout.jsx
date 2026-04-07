import React, { useContext } from 'react'
import { UserContext } from '../../context/userContext'
import Navbar from './Navbar'
import SideMenu from './SideMenu'

const DashBoardLayout = ({ children, activeMenu }) => {
  const { user } = useContext(UserContext);
  return (
    <div className="h-screen flex flex-col overflow-hidden"> 
      <Navbar activeMenu={activeMenu} />
      {user && (
        <div className="flex flex-1 overflow-hidden"> 
          <div className="max-[1080px]:hidden">
            <SideMenu activeMenu={activeMenu} />
          </div>
          <div className="grow mx-5 overflow-y-auto"> 
            {children}
          </div>
        </div>
      )}
    </div>
  )
}

export default DashBoardLayout