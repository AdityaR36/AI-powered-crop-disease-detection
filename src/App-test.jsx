import React from 'react';

export default function App() {
    return (
        <div style={{ padding: '20px', fontFamily: 'Arial' }}>
            <h1>Test - React is Working!</h1>
            <p>If you see this, React is rendering correctly.</p>
            <p>Time: {new Date().toLocaleTimeString()}</p>
        </div>
    );
}
