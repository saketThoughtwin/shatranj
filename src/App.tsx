// src/App.tsx
import { BrowserRouter as Router } from "react-router-dom";
import AppRoutes from "./routes/AppRoute";
import { Provider } from "react-redux";
import { store } from "./redux/store";

function App() {
  return (
    <Provider store={store}>    <Router>
      <AppRoutes />
    </Router>
    </Provider>

  );
}

export default App;
