import Banner from "../common/userCommon/Banner"
import Header from "../common/userCommon/Header"
import SpecialityMenu from "../common/userCommon/SpecialityMenu"
import TopDoctors from "../common/userCommon/TopDoctors"
import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
const Home = () => {
  // const navigate = useNavigate()
  // useEffect(() => {
  //     // Check if the token exists in localStorage, if not, redirect to login
  //     const token = localStorage.getItem("authToken");
  //     if (!token) {
  //       navigate("/login"); // Redirect to login if no token is found
  //     }
  //   }, [navigate]);
  
  return (
    <>
      <Header/>
      <SpecialityMenu />
      <TopDoctors />
      <Banner />
    </>
  )
}

export default Home