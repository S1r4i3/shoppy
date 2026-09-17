import { Component } from 'react';

/** Catches unexpected render errors so the user never sees a blank white screen. */
export default class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('myShoppy crashed:', error, info);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="app-shell">
        <div className="state state--error" role="alert">
          <div className="state__icon" aria-hidden="true">⚠️</div>
          <h2>Something went wrong</h2>
          <p>{String(this.state.error?.message || this.state.error)}</p>
          <button className="btn btn--primary btn--md" onClick={() => { window.location.href = '/'; }}>Reload app</button>
        </div>
      </div>
    );
  }
}
