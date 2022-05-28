import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth, logInWithEmailAndPassword, logout } from "./firebase";
import { useAuthState } from "react-firebase-hooks/auth";

function Map() {

  return (
    <div className="map">
      <div className="map__container">
        Hello world.
      </div>
    </div>
    )
}

export default Map;
