import React, { useEffect, useState } from "react";
import { syncConflicts } from "./utils";

import {
  db,
  collection,
  getDocs,
  doc,
  getDoc,
  setDoc,
} from "./firebase";

export default function AdminDashboard({ user }) {
  const [assets, setAssets] = useState([]);
  const [conflicts, setConflicts] = useState([]);
  const [messages, setMessages] = useState([]);
  const [maxMessages, setMaxMessages] = useState(10);
  const [newMaxMessages, setNewMaxMessages] = useState(10);

  useEffect(() => {
    fetchAssets();
    fetchConflicts();
    fetchConfig();
    fetchMessages();
  }, []);

  async function fetchAssets() {
    try {
      const assetsCol = collection(db, "assets");
      const assetsSnap = await getDocs(assetsCol);
      const allAssets = assetsSnap.docs.map((doc) => ({
        assetId: doc.id,
        ...doc.data(),
      }));
      setAssets(allAssets);
    } catch (err) {
      console.error("Error fetching assets:", err.message);
    }
  }

  async function fetchConflicts() {
    try {
      const conflictsCol = collection(db, "conflicts");
      const conflictsSnap = await getDocs(conflictsCol);
      const allConflicts = conflictsSnap.docs.map((doc) => ({
        assetId: doc.id,
        ...doc.data(),
      }));
      setConflicts(allConflicts);
    } catch (err) {
      console.error("Error fetching conflicts:", err.message);
    }
  }

  async function fetchConfig() {
    const configRef = doc(db, "config", "global");
    const configSnap = await getDoc(configRef);
    if (configSnap.exists()) {
      const data = configSnap.data();
      setMaxMessages(data.maxMessages || 10);
      setNewMaxMessages(data.maxMessages || 10);
    }
  }

  async function fetchMessages() {
  try {
    const messagesCol = collection(db, "messages");
    const messagesSnap = await getDocs(messagesCol);

    const allMessages = messagesSnap.docs
      .map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      .sort((a, b) => {
        const t1 = a.timestamp?.toMillis?.() || 0;
        const t2 = b.timestamp?.toMillis?.() || 0;
        return t2 - t1; // Newest first
      });

    // Fetch asset user info
    const assetIds = [...new Set(allMessages.map((m) => m.assetId))];
    const assetUserMap = {};

    for (const assetId of assetIds) {
      const assetRef = doc(db, "assets", assetId);
      const assetSnap = await getDoc(assetRef);
      if (assetSnap.exists()) {
        const data = assetSnap.data();
        assetUserMap[assetId] = data.userIds || [];
      } else {
        assetUserMap[assetId] = ["Unknown"];
      }
    }

    // Append user info to messages
    const enrichedMessages = allMessages.map((msg) => ({
      ...msg,
      registeredUsers: assetUserMap[msg.assetId] || [],
    }));

    setMessages(enrichedMessages);
  } catch (err) {
    console.error("Error fetching messages:", err.message);
  }
}



  async function updateMaxMessages() {
    if (newMaxMessages <= 0) {
      alert("Max messages must be positive");
      return;
    }
    const configRef = doc(db, "config", "global");
    await setDoc(configRef, { maxMessages: newMaxMessages });
    setMaxMessages(newMaxMessages);
    alert("Max messages limit updated");
  }

  return (
    <div style={{ maxWidth: 800, margin: "auto" }}>
      <h2>Admin Dashboard</h2>
      <p>Welcome, {user.email}</p>

      <div style={{ marginBottom: 20 }}>
        <h3>Set Max Messages Per User</h3>
        <input
          type="number"
          value={newMaxMessages}
          onChange={(e) => setNewMaxMessages(parseInt(e.target.value))}
          style={{ padding: 8, width: 100 }}
        />
        <button
          onClick={updateMaxMessages}
          style={{ marginLeft: 8, padding: "8px 16px" }}
        >
          Update
        </button>
        <p>Current max messages: {maxMessages}</p>
      </div>

      <div>
        <h3>All Assets</h3>
        {assets.length === 0 ? (
          <p>No assets found.</p>
        ) : (
          <table
            border="1"
            cellPadding="8"
            style={{ width: "100%", borderCollapse: "collapse" }}
          >
            <thead>
              <tr>
                <th>Asset ID</th>
                <th>Registered Users</th>
                <th>Conflict</th>
              </tr>
            </thead>
            <tbody>
              {assets.map((asset) => (
                <tr key={asset.assetId}>
                  <td>{asset.assetId}</td>
                  <td>{Array.isArray(asset.userIds) ? asset.userIds.join(", ") : "N/A"}</td>
                  <td style={{ color: asset.conflict ? "red" : "green" }}>
                    {asset.conflict ? "Yes" : "No"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div>
        <h3>Conflicts</h3>
        {conflicts.length === 0 ? (
          <p>No conflicts currently.</p>
        ) : (
          <ul>
            {conflicts.map((conflict) => (
              <li key={conflict.assetId}>
                Asset <strong>{conflict.assetId}</strong> used by users:{" "}
                {Array.isArray(conflict.userIds) ? conflict.userIds.join(", ") : "N/A"}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div style={{ marginBottom: 20 }}>
        <button
          onClick={async () => {
            try {
              await syncConflicts(db);
              await fetchConflicts();
              alert("Conflicts synchronized!");
            } catch (err) {
              alert("Error syncing conflicts: " + err.message);
            }
          }}
          style={{ padding: "8px 16px" }}
        >
          Refresh Conflicts
        </button>
      </div>

      <div>
  <h3>All Messages</h3>
  {messages.length === 0 ? (
    <p>No messages available.</p>
  ) : (
    <ul>
      {messages.map((msg) => (
        <li key={msg.id} style={{ marginBottom: "10px" }}>
          {new Date(msg.timestamp?.seconds * 1000).toLocaleString()} <br />
          Asset: <strong>{msg.assetId}</strong> <br />
          Message: <strong>{msg.content}</strong> <br />
          Registered Users: {msg.registeredUsers.join(", ")}
        </li>
      ))}
    </ul>
  )}
</div>

    </div>
  );
}
