import { useEffect, useRef } from "react";
import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes.jsx";
import Navbar from "./components/Navbar.jsx";

function CursorFollower() {
  const dotRef = useRef(null);
  const ringRef = useRef(null);

  useEffect(() => {
    const dot = dotRef.current;
    const ring = ringRef.current;
    let mx = 0, my = 0;
    let rx = 0, ry = 0;

    const onMove = (e) => {
      mx = e.clientX;
      my = e.clientY;
      dot.style.left = mx - 4 + "px";
      dot.style.top = my - 4 + "px";
    };

    const lerp = () => {
      rx += (mx - rx) * 0.12;
      ry += (my - ry) * 0.12;
      ring.style.left = rx - 16 + "px";
      ring.style.top = ry - 16 + "px";
      requestAnimationFrame(lerp);
    };

    window.addEventListener("mousemove", onMove);
    lerp();
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <>
      <div ref={dotRef} className="cursor-dot" />
      <div ref={ringRef} className="cursor-ring" />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <CursorFollower />
      <div className="scan-line" />
      <Navbar />
      <AppRoutes />
    </BrowserRouter>
  );
}