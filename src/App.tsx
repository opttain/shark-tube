import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { Home } from "./pages/Home";
import { SimpleOffset } from "./pages/SimpleOffset";
import { RollingOffset } from "./pages/RollingOffset";
import { SegmentedBend } from "./pages/SegmentedBend";
import { FractionConverter } from "./pages/FractionConverter";
import { PipeDimensions } from "./pages/PipeDimensions";
import { Offset3D } from "./pages/Offset3D";
import { TeePiece } from "./pages/TeePiece";

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/offset" element={<SimpleOffset />} />
          <Route path="/rolling-offset" element={<RollingOffset />} />
          <Route path="/segmented-bend" element={<SegmentedBend />} />
          <Route path="/fractions" element={<FractionConverter />} />
          <Route path="/dimensions" element={<PipeDimensions />} />
          <Route path="/offset-3d" element={<Offset3D />} />
          <Route path="/tee" element={<TeePiece />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
