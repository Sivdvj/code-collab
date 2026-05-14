import { Route, Routes } from "react-router";
import Home from "./components/Home.jsx";
import Editor from "./components/Editor.jsx";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/editor/:roomId" element={<Editor />} />
    </Routes>
  );
}
export default App;
