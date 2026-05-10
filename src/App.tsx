import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "@/shared/hooks/useAuth";
import { TaskProvider } from "@/features/ai-agent/context/TaskContext";
import AppRoutes from "./routes/AppRoutes";
import "./index.css";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <TaskProvider>
          <AppRoutes />
        </TaskProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
