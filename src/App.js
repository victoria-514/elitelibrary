import { useEffect, useState } from "react";
import { db } from "./firebase";
import {
  collection,
  doc,
  onSnapshot,
  setDoc,
} from "firebase/firestore";

const ROOM_LAYOUTS = {
  1: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
  2: [12, 13, 14, 15, 16, 17, 18, 19],
  3: [20, 21, 22, 23, 24, 25],
  4: [26, 27, 28, 29, 30, 31, 32, 33],
  5: [34, 35, 36, 37, 38, 39, 40, 41, 42],
  6: [43, 44, 45, 46, 47, 48, 49, 50, 51],
  7: [52, 53, 54, 55, 56, 57, 58, 59, 60],
  8: [61, 62, 63, 64, 65, 66, 67, 68, 69],
  9: [70, 71, 72, 73, 74],
  10: [75, 76, 77, 78, 79, 80],
};

const defaultSeat = (id) => ({
  id,
  name: "",
  affiliation: "",
  entry: "",
  exit: "",
  contact: "",
  guardian: "",
  status: "",
});

function Seat({ seat, onClick, onStatusChange }) {
  const today = new Date();
 const isNearExit = () => {
  if (!seat.exit) return false;
  const today = new Date();
  const exitDate = new Date(seat.exit);
  const diffTime = exitDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays <= 2 && diffDays >= 0;  // 이틀 전부터 퇴실일까지
};


  const getColor = () => {
    if (seat.status === "in") return "#ffd580";
    if (seat.status === "out") return "#c8f7c5";
    return "#f0f0f0";
  };

  return (
    <div
      onClick={() => onClick(seat)}
      style={{
        width: 120,
        height: 110,
        border: "1px solid gray",
        backgroundColor: getColor(),
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        position: "relative",
        padding: 4,
        boxSizing: "border-box",
        cursor: "pointer",
      }}
    >
      {isNearExit() && (
        <div style={{ position: "absolute", top: 2, right: 4, color: "red" }}>★</div>
      )}
      <div>{seat.id}번</div>
      {seat.name && <div>{seat.name}</div>}
      {seat.exit && <div style={{ fontSize: 12 }}>{seat.exit}</div>}
      <select
        value={seat.status}
        onChange={(e) => onStatusChange(seat.id, e.target.value)}
        onClick={(e) => e.stopPropagation()}
        style={{ fontSize: 12, marginTop: 4 }}
      >
        <option value="">-</option>
        <option value="in">입실</option>
        <option value="out">퇴실</option>
      </select>
    </div>
  );
}

export default function App() {
  const [seats, setSeats] = useState([]);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [form, setForm] = useState({
    name: "",
    affiliation: "",
    entry: "",
    exit: "",
    contact: "",
    guardian: "",
  });

  useEffect(() => {
 
    const unsub = onSnapshot(collection(db, "seats"), (snapshot) => {
      const newSeats = [];
      snapshot.forEach((doc) => newSeats.push(doc.data()));
      setSeats(newSeats);
    });

    return () => unsub();
  }, []);

  const handleSeatClick = (seat) => {
    setSelectedSeat(seat);
    setForm({
      name: seat.name || "",
      affiliation: seat.affiliation || "",
      entry: seat.entry || "",
      exit: seat.exit || "",
      contact: seat.contact || "",
      guardian: seat.guardian || "",
    });
  };

  const handleSave = async () => {
    const updatedSeat = { ...selectedSeat, ...form };
    await setDoc(doc(db, "seats", String(updatedSeat.id)), updatedSeat);
    setSelectedSeat(null);
  };

  const handleStatusChange = async (id, newStatus) => {
    const seat = seats.find((s) => s.id === id);
    if (seat) {
      await setDoc(doc(db, "seats", String(id)), { ...seat, status: newStatus });
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>독서실 좌석 관리</h1>
      {Object.entries(ROOM_LAYOUTS).map(([roomId, seatIds]) => (
        <div key={roomId} style={{ marginBottom: 20 }}>
          <div style={{ marginBottom: 6, fontWeight: "bold" }}>{roomId}열람실</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {seatIds.map((seatId) => {
              const seat = seats.find((s) => s.id === seatId) || defaultSeat(seatId);
              return (
                <Seat
                  key={seat.id}
                  seat={seat}
                  onClick={handleSeatClick}
                  onStatusChange={handleStatusChange}
                />
              );
            })}
          </div>
        </div>
      ))}

      {selectedSeat && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div style={{ background: "white", padding: 20, width: 300 }}>
            <h3>{selectedSeat.id}번 좌석</h3>
            <input placeholder="이름" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={{ width: "100%", marginBottom: 6 }} />
            <input placeholder="소속" value={form.affiliation} onChange={(e) => setForm({ ...form, affiliation: e.target.value })} style={{ width: "100%", marginBottom: 6 }} />
            <input placeholder="입실일 (YYYY-MM-DD)" value={form.entry} onChange={(e) => setForm({ ...form, entry: e.target.value })} style={{ width: "100%", marginBottom: 6 }} />
            <input placeholder="퇴실일 (YYYY-MM-DD)" value={form.exit} onChange={(e) => setForm({ ...form, exit: e.target.value })} style={{ width: "100%", marginBottom: 6 }} />
            <input placeholder="연락처" value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} style={{ width: "100%", marginBottom: 6 }} />
            <input placeholder="보호자 연락처" value={form.guardian} onChange={(e) => setForm({ ...form, guardian: e.target.value })} style={{ width: "100%", marginBottom: 6 }} />
            <div style={{ textAlign: "right" }}>
              <button onClick={handleSave}>저장</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


