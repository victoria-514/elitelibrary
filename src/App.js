import { useState, useEffect } from "react";

const TOTAL_SEATS = 80;
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

const initSeats = Array.from({ length: TOTAL_SEATS }, (_, i) => ({
  id: i + 1,
  room: Object.entries(ROOM_LAYOUTS).find(([_, list]) => list.includes(i + 1))[0],
  name: "",
  affiliation: "",
  entry: "",
  exit: "",
  contact: "",
  guardian: "",
  status: "", // "in" or "out"
}));

function Seat({ seat, onClick, onStatusChange }) {
  const today = new Date();
  const exitDate = new Date(seat.exit);
  const isNearExit = seat.exit && Math.ceil((exitDate - today) / (1000 * 60 * 60 * 24)) === 2;

  const getColor = () => {
    if (seat.status === "in") return "#ffd580";
    if (seat.status === "out") return "#c8f7c5";
    return "#f0f0f0";
  };

  return (
    <div
      onClick={() => onClick(seat)}
      style={{
        width: "120px",
        height: "110px",
        border: "1px solid gray",
        backgroundColor: getColor(),
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        position: "relative",
        boxSizing: "border-box",
        padding: 4,
        cursor: "pointer",
        fontSize: 14,
      }}
    >
      {isNearExit && (
        <div style={{ position: "absolute", top: 2, right: 4, color: "red" }}>★</div>
      )}
      <div>{seat.id}번</div>
      {seat.name && <div>{seat.name}</div>}
      {seat.exit && <div style={{ fontSize: 12 }}>{seat.exit}</div>}
      <select
        value={seat.status}
        onChange={(e) => onStatusChange(seat.id, e.target.value)}
        style={{ fontSize: 12, marginTop: 4 }}
        onClick={(e) => e.stopPropagation()}
      >
        <option value="">-</option>
        <option value="in">입실</option>
        <option value="out">퇴실</option>
      </select>
    </div>
  );
}

export default function App() {
  const [seats, setSeats] = useState(initSeats);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [form, setForm] = useState({
    name: "",
    affiliation: "",
    entry: "",
    exit: "",
    contact: "",
    guardian: "",
  });

  // localStorage 저장/불러오기
  useEffect(() => {
    const saved = localStorage.getItem("reading-room-seats");
    if (saved) {
      setSeats(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("reading-room-seats", JSON.stringify(seats));
  }, [seats]);

  const handleSeatClick = (seat) => {
    setSelectedSeat(seat);
    setForm({
      name: seat.name,
      affiliation: seat.affiliation,
      entry: seat.entry,
      exit: seat.exit,
      contact: seat.contact,
      guardian: seat.guardian,
    });
  };

  const handleSave = () => {
    setSeats((prev) =>
      prev.map((s) => (s.id === selectedSeat.id ? { ...s, ...form } : s))
    );
    setSelectedSeat(null);
  };

  const handleStatusChange = (id, status) => {
    setSeats((prev) => prev.map((s) => (s.id === id ? { ...s, status } : s)));
  };

  const getRoomLabel = (seatId) => {
    return Object.entries(ROOM_LAYOUTS).find(([_, ids]) => ids.includes(seatId))?.[0];
  };

  const rows = [];
  for (let i = 0; i < seats.length; i += 10) {
    rows.push(seats.slice(i, i + 10));
  }

  let lastRoomShown = "";

  return (
    <div style={{ padding: 20 }}>
      <h1>독서실 좌석 관리</h1>

      {rows.map((rowSeats, rowIndex) => {
        const firstSeat = rowSeats[0];
        const roomLabel = getRoomLabel(firstSeat.id);
        const showRoomLabel = roomLabel !== lastRoomShown;
        lastRoomShown = roomLabel;

        return (
          <div key={rowIndex} style={{ marginBottom: 30 }}>
            <div style={{ display: "flex", gap: 10 }}>
              {rowSeats.map((seat) => {
                const room = getRoomLabel(seat.id);
                const isRoomStart = ROOM_LAYOUTS[room]?.[0] === seat.id;

                return (
                  <div key={seat.id} style={{ marginRight: 10, position: "relative" }}>
                    {isRoomStart && (
                      <div style={{
                        position: "absolute",
                        top: -24,
                        width: "100%",
                        textAlign: "center",
                        fontWeight: "bold"
                      }}>
                        {room}열람실
                      </div>
                    )}
                    <Seat
                      seat={seat}
                      onClick={handleSeatClick}
                      onStatusChange={handleStatusChange}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* 사용자 정보 입력 모달 */}
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
            zIndex: 10,
          }}
        >
          <div
            style={{
              background: "white",
              padding: "20px 24px",
              width: 300,
              boxSizing: "border-box",
            }}
          >
            <h3>{selectedSeat.id}번 좌석</h3>
            {Object.entries(form).map(([key, value]) => (
              <input
                key={key}
                value={value}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                placeholder={
                  key === "name"
                    ? "이름"
                    : key === "affiliation"
                    ? "소속"
                    : key === "entry"
                    ? "입실일 (예: YYYY-MM-DD)"
                    : key === "exit"
                    ? "퇴실일 (예: YYYY-MM-DD)"
                    : key === "contact"
                    ? "연락처 (예: 010-1234-5678)"
                    : key === "guardian"
                    ? "보호자 연락처 (예: 010-1234-5678)"
                    : key
                }
                style={{
                  marginBottom: 8,
                  padding: 6,
                  width: "100%",
                  boxSizing: "border-box",
                }}
              />
            ))}
            <div style={{ textAlign: "right" }}>
              <button onClick={handleSave}>저장</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}







