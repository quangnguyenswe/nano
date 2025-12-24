import { createRoot } from "react-dom/client";
import "./global.css";

const App = () => (
  <div className="container bg-slate-200">
    <h1 className="">Welcome to Huddle!</h1>
  </div>
);

createRoot(document.getElementById("app")!).render(<App />);
