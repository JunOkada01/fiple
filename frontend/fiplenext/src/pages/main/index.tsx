import { useEffect, useState } from "react";

export default function Home() {
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/data/")
      .then((response) => response.json())
      .then((data) => {
        setMessage(data.message);
      })
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  return (
    <div>
      <h1>{message || "Loading..."}</h1>
    </div>
  );
}
