import RouterProviderApp from "./app/router";
import { AuthProvider } from "./context/AuthContext";

function App() {
  return <AuthProvider><RouterProviderApp /></AuthProvider>;
}

export default App;
