import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

// Error Boundary Component
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('React Error:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{ padding: '40px', fontFamily: 'Arial', maxWidth: '800px', margin: '0 auto' }}>
                    <h1 style={{ color: '#e74c3c' }}>⚠️ Application Error</h1>
                    <p style={{ fontSize: '16px', lineHeight: '1.6' }}>
                        The application encountered an error and cannot render. This is likely due to a missing component or syntax error in App.jsx.
                    </p>
                    <details style={{ marginTop: '20px', padding: '15px', background: '#f5f5f5', borderRadius: '8px' }}>
                        <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>Error Details</summary>
                        <pre style={{ marginTop: '10px', padding: '10px', background: '#fff', overflow: 'auto', fontSize: '12px' }}>
                            {this.state.error?.toString()}
                        </pre>
                    </details>
                    <button
                        onClick={() => window.location.reload()}
                        style={{
                            marginTop: '20px',
                            padding: '10px 20px',
                            background: '#3498db',
                            color: 'white',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer',
                            fontSize: '14px'
                        }}
                    >
                        Reload Page
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

// Lazy load the main App component
const App = React.lazy(() => import('./App'));

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <ErrorBoundary>
            <React.Suspense fallback={
                <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'Arial' }}>
                    <h2>Loading Application...</h2>
                    <p>Please wait while we load the app.</p>
                </div>
            }>
                <App />
            </React.Suspense>
        </ErrorBoundary>
    </React.StrictMode>,
);
