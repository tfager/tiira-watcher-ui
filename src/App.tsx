import './App.css';
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation, Link, useNavigate } from "react-router-dom";
import Login from './Login';
import Map from './Map';
import { AuthProvider, useAuth } from './components/AuthProvider'

// Work around missing marker icon - https://github.com/Leaflet/Leaflet/issues/4968
import L from 'leaflet';
//delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});
// End workaround

function App() {

  return (
    <div className="App">
      <AuthProvider>
        <Router>
          <Header />
          <Routes>
            <Route path="/" element={<MainPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/map" element={
              <RequireAuth>
                <Map />
              </RequireAuth>
            } />
          </Routes>
        </Router>
      </AuthProvider>
    </div>
  );
}

function MainPage() {
  return (
    <div>
      <p>An app for rendering bird sightings on a map.</p>

      <p><Link to="/map">Go to map</Link></p>

    </div>

  )
}
function Header() {
  let auth = useAuth()
  let navigate = useNavigate()

  var loginInfo;
  if (auth.user != null) {
    loginInfo = (
      <div id='loginInfo' className='loginInfo'>
        <span>Welcome {auth.user.email}</span><br />
        <span><button onClick={() => {
          auth.logout(() => navigate("/"))
        }}>Log out</button>
        </span>
      </div>
    )
  } else {
    loginInfo = (
      <Link to="/login">Log in</Link>
    )
  }

  return (
    <div className='topHeader'>
      <div className='titleText'>
        Tiira-watcher
      </div>
      <div id='topMessage' className='topMessage'>

      </div>
      {loginInfo}
    </div>
  )
}

function RequireAuth({ children }: { children: JSX.Element }) {
  let auth = useAuth();
  let location = useLocation();

  if (!auth.user) {
    // Redirect them to the /login page, but save the current location they were
    // trying to go to when they were redirected. This allows us to send them
    // along to that page after they login, which is a nicer user experience
    // than dropping them off on the home page.
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

export default App;
