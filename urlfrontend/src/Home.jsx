
import Navbar from "./components/Navbar/Navbar";
import Hero from "./components/Hero/Hero";
import Card from "./components/Card/Card";
import Login from "./components/Login/Login";
import "./index.css"

function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <Card />
    </>
  );
}

export default Home;