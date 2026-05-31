import { Route, Routes } from "react-router";
import Home from "./components/Home.jsx";
import EditorPage from "./components/Editor.jsx";
import { Toaster } from "react-hot-toast";

function App() {
  return (
    <>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/editor/:roomId" element={<EditorPage />} />
      </Routes>
    </>
  );
}
export default App;
