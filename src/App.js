import './App.css';
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from './Login';
import Map from './Map';

// Work around missing marker icon - https://github.com/Leaflet/Leaflet/issues/4968
import L from 'leaflet';
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});
// End workaround

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
