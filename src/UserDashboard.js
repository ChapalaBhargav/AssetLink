import React, { useEffect, useState } from "react";
import {
  db,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  addDoc,
} from "./firebase";

export default function UserDashboard({ user }) {
  const [assetId, setAssetId] = useState("");
  const [registeredAssets, setRegisteredAssets] = useState([]);
  const [message, setMessage] = useState("");
  const [messagesSent, setMessagesSent] = useState(0);
  const [maxMessages, setMaxMessages] = useState(10);
  const [status, setStatus] = useState("");
  const [userMessages, setUserMessages] = useState([]);
  const [allMessages, setAllMessages] = useState([]);

  useEffect(() => {
    fetchUserData();
    fetchConfig();
    fetchUserMessages();
    fetchAllMessages();
  }, []);

  async function fetchUserData() {
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      const data = userSnap.data();
      setRegisteredAssets(data.assets || []);
      setMessagesSent(data.messagesSent || 0);
    } else {
      await setDoc(userRef, {
        email: user.email,
        assets: [],
        messagesSent: 0,
        isAdmin: false,
      });
    }
  }

  async function fetchConfig() {
    const configRef = doc(db, "config", "global");
    const configSnap = await getDoc(configRef);
    if (configSnap.exists()) {
      setMaxMessages(configSnap.data().maxMessages || 10);
    }
  }

  async function fetchUserMessages() {
    if (!user) return;

    const messagesRef = collection(db, "messages");
    const q = query(
      messagesRef,
      where("senderId", "==", user.uid),
      orderBy("timestamp", "desc")
    );

    const querySnapshot = await getDocs(q);
    const msgs = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setUserMessages(msgs);
  }

  async function fetchAllMessages() {
    const messagesRef = collection(db, "messages");
    const q = query(messagesRef, orderBy("timestamp", "desc"));

    const querySnapshot = await getDocs(q);
    const msgs = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setAllMessages(msgs);
  }

  async function registerAsset() {
    if (!assetId.trim()) {
      setStatus("Asset ID cannot be empty");
      return;
    }

    const trimmedAssetId = assetId.trim();
    const assetRef = doc(db, "assets", trimmedAssetId);
    const assetSnap = await getDoc(assetRef);

    if (!assetSnap.exists()) {
      await setDoc(assetRef, {
        assetId: trimmedAssetId,
        userIds: [user.uid],
        conflict: false,
      });
    } else {
      const assetData = assetSnap.data();
      if (!assetData.userIds.includes(user.uid)) {
        const newUserIds = [...assetData.userIds, user.uid];
        const conflict = newUserIds.length > 1;
        await updateDoc(assetRef, { userIds: newUserIds, conflict });

        if (conflict) {
          const conflictRef = doc(db, "conflicts", trimmedAssetId);
          await setDoc(conflictRef, {
            assetId: trimmedAssetId,
            userIds: newUserIds,
          });
        }
      }
    }

    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      const data = userSnap.data();
      const newAssets = data.assets || [];
      if (!newAssets.includes(trimmedAssetId)) {
        newAssets.push(trimmedAssetId);
        await updateDoc(userRef, { assets: newAssets });
        setRegisteredAssets(newAssets);
        setStatus("Asset registered successfully!");
      } else {
        setStatus("Asset already registered by you.");
      }
    }
  }

  async function sendMessage() {
    if (!message.trim()) {
      setStatus("Please select a message to send.");
      return;
    }
    if (!assetId.trim()) {
      setStatus("Please select an Asset ID before sending message.");
      return;
    }
    if (messagesSent >= maxMessages) {
      setStatus(`Message limit reached (${maxMessages}). Contact admin.`);
      return;
    }

    try {
      await addDoc(collection(db, "messages"), {
        senderId: user.uid,
        assetId: assetId.trim(),
        content: message.trim(),
        timestamp: new Date(),
      });

      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, { messagesSent: messagesSent + 1 });
      setMessagesSent(messagesSent + 1);
      setStatus(`Message sent: "${message}"`);

      fetchUserMessages();
      fetchAllMessages();
    } catch (err) {
      setStatus("Error sending message: " + err.message);
    }
  }

  const predefinedMessages = [
    "Hello, I am using this asset.",
    "Please check the asset status.",
    "Requesting maintenance for the asset.",
    "Reporting a conflict with asset usage.",
  ];

  return (
    <div style={{ maxWidth: 600, margin: "auto" }}>
      <h2>Welcome, {user.email}</h2>

      <div>
        <h3>Register Asset</h3>
        <input
          type="text"
          placeholder="Asset ID"
          value={assetId}
          onChange={(e) => setAssetId(e.target.value)}
          style={{ width: "70%", padding: 8 }}
        />
        <button onClick={registerAsset} style={{ padding: "8px 16px", marginLeft: 8 }}>
          Register
        </button>
      </div>

      <div>
        <h4>Your Registered Assets</h4>
        <ul>
          {registeredAssets.map((a) => (
            <li key={a}>{a}</li>
          ))}
        </ul>
      </div>

      <div>
        <h3>Send Predefined Message</h3>
        <select
          value={assetId}
          onChange={(e) => setAssetId(e.target.value)}
          style={{ width: "70%", padding: 8, marginBottom: 8 }}
        >
          <option value="">Select Asset</option>
          {registeredAssets.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>

        <select
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          style={{ width: "70%", padding: 8, marginBottom: 8 }}
        >
          <option value="">Select a message</option>
          {predefinedMessages.map((msg, i) => (
            <option key={i} value={msg}>
              {msg}
            </option>
          ))}
        </select>

        <button onClick={sendMessage} style={{ padding: "8px 16px", marginLeft: 8 }}>
          Send
        </button>
        <p>
          Messages sent: {messagesSent} / {maxMessages}
        </p>
      </div>

      <div>
        <h4>Your Sent Messages</h4>
        {userMessages.length === 0 ? (
          <p>No messages sent yet.</p>
        ) : (
          <ul>
            {userMessages.map((msg) => (
              <li key={msg.id}>
                [{new Date(msg.timestamp.seconds * 1000).toLocaleString()}] Asset: {msg.assetId} — {msg.content}
              </li>
            ))}
          </ul>
        )}
      </div>
      <p style={{ color: "green" }}>{status}</p>

      <div>
        <h4>All User Messages</h4>
        {allMessages.length === 0 ? (
          <p>No messages from any user.</p>
        ) : (
          <ul>
            {allMessages.map((msg) => (
              <li key={msg.id}>
                [{new Date(msg.timestamp.seconds * 1000).toLocaleString()}]
                <br />
                <strong>User:</strong> {msg.senderId}
                <br />
                <strong>Asset:</strong> {msg.assetId}
                <br />
                <strong>Message:</strong> {msg.content}
              </li>
            ))}
          </ul>
        )}
      </div>

      
    </div>
  );
}
