import { Component } from "react";

export default class ErrorBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(error, info) { console.error("Error no controlado", error, info); }
  render() {
    if (this.state.failed) return <main className="app-error"><div><span>Autoestética Tucumán</span><h1>No pudimos cargar esta pantalla</h1><p>Actualizá la página para volver a intentarlo. Tus datos guardados no se perdieron.</p><button type="button" onClick={() => window.location.reload()}>Actualizar página</button></div></main>;
    return this.props.children;
  }
}

