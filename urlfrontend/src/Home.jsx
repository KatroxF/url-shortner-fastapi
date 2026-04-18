import "./style.css";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Card from "./components/Card";
import Login from "./components/Login";
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