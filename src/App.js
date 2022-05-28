import './App.css';
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from './Login';
import Map from './Map';

function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route exact path="/" element={ <Login />} />
          <Route exact path="/map" element={ <Map />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
