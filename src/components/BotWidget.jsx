import { useState, useRef, useEffect } from "react";

import { db } from '../firebase';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';

export default function BotWidget() {
  

  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hi! I am your Campus Assistant" }
  ]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);
  useEffect(() => {
  messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
}, [messages]);


  const { currentUser } = useAuth();

  const sendMessage = () => {
    if (!input.trim()) return;

    const userText = input.toLowerCase();
    let botReply = "Got it. I am still learning";

    // Greeting
    if (userText.includes("hi") || userText.includes("hello")) {
      botReply = "Hello 👋 I am your CampusVerse assistant.";
      setMessages(prev => [
        ...prev,
        { sender: "user", text: input },
        { sender: "bot", text: botReply }
      ]);
    } 
    // Profile
    else if (userText.includes("profile")) {
      botReply = "Loading your profile...";
      setMessages(prev => [
        ...prev,
        { sender: "user", text: input },
        { sender: "bot", text: botReply }
      ]);

      if (currentUser) {
        const docRef = doc(db, "users", currentUser.uid);
        getDoc(docRef).then(docSnap => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            setMessages(prev => [
              ...prev,
              { sender: "bot", text: `Email: ${data.email}\nRole: ${data.role}\nRoll Number: ${data.rollNumber}` }
            ]);
          } else {
            setMessages(prev => [
              ...prev,
              { sender: "bot", text: "Profile not found in database." }
            ]);
          }
        });
      }
    } 
    // Clubs
    else if (userText.includes("club")) {
      botReply = "Loading clubs...";
      setMessages(prev => [
        ...prev,
        { sender: "user", text: input },
        { sender: "bot", text: botReply }
      ]);

      const clubsCollection = collection(db, "clubs");
      getDocs(clubsCollection).then(snapshot => {
        if (!snapshot.empty) {
          const clubList = snapshot.docs
  .map(d => {
    const data = d.data();
    return `• ${d.id.toUpperCase()} Club\n  ${data.description}`;
  })
  .join("\n\n");


          setMessages(prev => [
            ...prev,
            { sender: "bot", text: clubList }
          ]);
        } else {
          setMessages(prev => [
            ...prev,
            { sender: "bot", text: "No clubs available." }
          ]);
        }
      });
    } 
    // Events
    else if (userText.includes("event")) {
      botReply = "Loading events...";
      setMessages(prev => [
        ...prev,
        { sender: "user", text: input },
        { sender: "bot", text: botReply }
      ]);

      const eventsCollection = collection(db, "events");
      getDocs(eventsCollection).then(snapshot => {
        if (!snapshot.empty) {
          const eventList = snapshot.docs
            .map(doc => `${doc.id} on ${doc.data().date}: ${doc.data().description}`)
            .join("\n");
          setMessages(prev => [
            ...prev,
            { sender: "bot", text: eventList }
          ]);
        } else {
          setMessages(prev => [
            ...prev,
            { sender: "bot", text: "No events available." }
          ]);
        }
      });
    }
    
    else if (userText.includes("growth") || userText.includes("analytics")) {
  botReply = "Calculating your growth score...";

  setMessages(prev => [
    ...prev,
    { sender: "user", text: input },
    { sender: "bot", text: botReply }
  ]);

  if (currentUser) {
    const docRef = doc(db, "users", currentUser.uid);
    getDoc(docRef).then(docSnap => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const growthScore = (data.projects || 0) * 3
                          + (data.hackathons || 0) * 2
                          + (data.clubsJoined || 0) * 1
                          + (data.eventsParticipated || 0) * 1;
        const analyticsText = `
Projects: ${data.projects || 0}
Hackathons: ${data.hackathons || 0}
Clubs Joined: ${data.clubsJoined || 0}
Events Participated: ${data.eventsParticipated || 0}
Growth Score: ${growthScore}
        `;
        setMessages(prev => [
          ...prev,
          { sender: "bot", text: analyticsText }
        ]);
      } else {
        setMessages(prev => [
          ...prev,
          { sender: "bot", text: "Profile not found. Cannot calculate analytics." }
        ]);
      }
    });
  }

  return;
}
  else if (userText.includes("hackathon")) {
  setMessages(prev => [
    ...prev,
    { sender: "user", text: input },
    { sender: "bot", text: "Loading hackathons..." }
  ]);

  const hackathonRef = collection(db, "Hackathons");

  getDocs(hackathonRef).then(snapshot => {
    if (!snapshot.empty) {
      const hackathonList = snapshot.docs
        .map(d => {
          const data = d.data();
          return `• ${d.id}\n  Organiser: ${data.Organiser}`;
        })
        .join("\n\n");

      setMessages(prev => [
        ...prev,
        { sender: "bot", text: hackathonList }
      ]);
    } else {
      setMessages(prev => [
        ...prev,
        { sender: "bot", text: "No hackathons found." }
      ]);
    }
  });

  setInput("");
  return;
}
else if (userText.includes("placement")) {
  setMessages(prev => [
    ...prev,
    { sender: "user", text: input },
    { sender: "bot", text: "Loading placements..." }
  ]);

  const placementRef = collection(db, "Placements");

  getDocs(placementRef).then(snapshot => {
    if (!snapshot.empty) {
      const placementList = snapshot.docs
        .map(d => {
          const data = d.data();
          return `• ${d.id}\n  Company: ${data.description}\n  Eligibility: ${data.eligibility}`;
        })
        .join("\n\n");

      setMessages(prev => [
        ...prev,
        { sender: "bot", text: placementList }
      ]);
    } else {
      setMessages(prev => [
        ...prev,
        { sender: "bot", text: "No placement drives available." }
      ]);
    }
  });

  setInput("");
  return;
}

    // Placements
    else if (userText.includes("placement")) {
  botReply = "Loading placements...";
  setMessages(prev => [
    ...prev,
    { sender: "user", text: input },
    { sender: "bot", text: botReply }
  ]);

  const placementsCollection = collection(db, "placements");
  getDocs(placementsCollection).then(snapshot => {
    if (!snapshot.empty) {
      const placementList = snapshot.docs
        .map(doc => {
          const data = doc.data();
          return `${doc.id} on ${data.date}: ${data.description}`;
        })
        .join("\n");
      setMessages(prev => [
        ...prev,
        { sender: "bot", text: placementList }
      ]);
    } else {
      setMessages(prev => [
        ...prev,
        { sender: "bot", text: "No placements available." }
      ]);
    }
  });

  return; // prevent fallback while loading
}
 
    // Other / fallback
    else {
      setMessages(prev => [
        ...prev,
        { sender: "user", text: input },
        { sender: "bot", text: botReply }
      ]);
    }

    setInput("");
  };

  return (
    <>
      <div
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          background: "#ee8e1aff",
          color: "white",
          padding: "12px 16px",
          borderRadius: "999px",
          cursor: "pointer",
          zIndex: 1000
        }}
        onClick={() => setOpen(!open)}
      >
        Chat with me
      </div>

      {open && (
        <div
          style={{
            position: "fixed",
            bottom: "80px",
            right: "20px",
            width: "300px",
            height: "400px",
            background: "white",
            borderRadius: "10px",
            boxShadow: "0 10px 30px rgba(242, 109, 26, 0.06)",
            display: "flex",
            flexDirection: "column",
            zIndex: 1000
          }}
        >
          <div style={{ padding: "10px", fontWeight: "bold" }}>
            Campus Bot
          </div>

          <div style={{ flex: 1, padding: "10px", overflowY: "auto" }}>
            {messages.map((m, i) => (
              <div
                key={i}
                style={{
                  textAlign: m.sender === "user" ? "right" : "left",
                  marginBottom: "8px"
                }}

              >
                <span
                  style={{
                    display: "inline-block",
                    padding: "6px 10px",
                    borderRadius: "6px",
                    background: m.sender === "user" ? "#eb9225ff" : "#e5e7eb",
                    color: m.sender === "user" ? "white" : "black",
                    whiteSpace: "pre-line"

                  }}
                >
                  {m.text}
                </span>
                <div ref={messagesEndRef} />

              </div>
            ))}
          </div>

          <div style={{ display: "flex", padding: "8px" }}>
            <input
  value={input}
  onChange={e => setInput(e.target.value)}
  onKeyDown={e => {
    if (e.key === "Enter") {
      sendMessage();
    }
  }}
  placeholder="Ask something..."
  style={{
  flex: 1,
  padding: "6px",
  backgroundColor: "#f1f5f9",
  color: "#0f172a",
  border: "1px solid #cbd5e1",
  borderRadius: "6px"
}}

/>

            <button onClick={sendMessage}>Send</button>
          </div>
        </div>
      )}
    </>
  );
}
