import React from 'react';
import ServerErrorPage from '../pages/ServerErrorPage';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Athena Error Boundary capturou um erro:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <ServerErrorPage
          onRetry={this.handleRetry}
          errorDetails={this.state.error?.message || this.state.error}
        />
      );
    }
    return this.props.children;
  }
}
