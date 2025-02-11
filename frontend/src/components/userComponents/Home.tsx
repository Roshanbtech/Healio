import Banner from "../common/userCommon/Banner"
import Header from "../common/userCommon/Header"
import SpecialityMenu from "../common/userCommon/SpecialityMenu"
import TopDoctors from "../common/userCommon/TopDoctors"

const Home = () => {
  
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