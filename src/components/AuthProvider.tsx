import { createContext, useContext, useEffect, useState } from 'react'
import { auth } from '../firebase'
import {
  signInWithEmailAndPassword,
  signOut,
  User
} from "firebase/auth"

interface AuthContextType {
  user: any;
  loginError: string;
  getToken: () => Promise<string | null>,
  login: (email: string, password: string, callback: VoidFunction) => void;
  logout: (callback: VoidFunction) => void;
}

const AuthContext = createContext<AuthContextType>(null!)

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User>()
  const [loading, setLoading] = useState(false)
  const [loginError, setLoginError] = useState("")

  async function login(email: string, password: string, callback: VoidFunction) {
    try {
      setLoading(true)
      var result = await signInWithEmailAndPassword(auth, email, password)
      callback()
      return result
    } catch (err: any) {
      setLoading(false)
      console.log(err)
      setLoginError(err["message"])
    }
  }

  function logout(callback: VoidFunction) {
    signOut(auth)
    callback()
  }

  function getUser() {
    return auth.currentUser
  }

  async function getToken(): Promise<string | null> {
    if (auth.currentUser != null) {
      return await auth.currentUser.getIdToken(false);
    }
    return null
  }

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user !== null) {
        setCurrentUser(user!)
        setLoading(false)
      }
    })

    return unsubscribe
  }, [])

  const value = {
    user: currentUser,
    loginError: loginError,
    getUser,
    getToken,
    login,
    logout
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
      {loading && <div>Checking auth</div>}
    </AuthContext.Provider>
  )

}