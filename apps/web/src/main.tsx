import { createRoot } from "react-dom/client";
import "./style.css";

const App = () => (
  <div>
    <h1>Welcome to Huddle!</h1>
  </div>
);

createRoot(document.getElementById("app")!).render(<App />);
