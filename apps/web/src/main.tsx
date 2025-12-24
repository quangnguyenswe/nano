import { createRoot } from "react-dom/client";
import "./global.css";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const App = () => (
  <div className="h-full bg-slate-200">
    <h1 className="container">Welcome to Huddle!</h1>
    <Input />
    <Button>Click Me</Button>
  </div>
);

createRoot(document.getElementById("app")!).render(<App />);
