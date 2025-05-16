// src/App.js
import React, { useEffect, useState } from "react";
import { auth, onAuthStateChanged, doc, getDoc, db, signOut } from "./firebase";
import Login from "./Login";
import UserDashboard from "./UserDashboard";
import AdminDashboard from "./AdminDashboard";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        // Fetch isAdmin flag from user doc
        const userRef = doc(db, "users", firebaseUser.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          setIsAdmin(userSnap.data().isAdmin || false);
        } else {
          setIsAdmin(false);
        }
      } else {
        setUser(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) return <div>Loading...</div>;

  if (!user) return <Login />;

  return (
    <div>
      <header style={{ display: "flex", justifyContent: "space-between", padding: 10, background: "#ddd" }}>
        <h1>Asset Conflict App</h1>
        <button onClick={() => signOut(auth)}>Logout</button>
      </header>
      {isAdmin ? <AdminDashboard user={user} /> : <UserDashboard user={user} />}
    </div>
  );
}

export default App;
