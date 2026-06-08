import React from 'react';
import './StarryBackground.css';

export default function StarryBackground({ title }) {
  return (
    <div className="starry-container" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: -1 }}>
      <div id="stars"></div>
      <div id="stars2"></div>
      <div id="stars3"></div>
      {title && (
        <div id="title">
          <span>{title}</span>
        </div>
      )}
    </div>
  );
}
