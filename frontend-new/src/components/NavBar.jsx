import React from 'react';

export default function NavBar({ currentNav, setNav, currentPage, setPage, hasLiveMatches }) {
  const handleNavClick = (navItem) => {
    setNav(navItem);
    setPage('home');
  };

  const navItems = ['HOME', 'LIVE', 'UPCOMING', 'RESULTS'];

  return (
    <header className="nav">
      <div className="nav-in">
        <span className="logo">PITCHSIDE</span>
        <nav>
          {navItems.map((item) => (
            <button
              key={item}
              className={currentPage === 'home' && currentNav === item ? 'on' : ''}
              onClick={() => handleNavClick(item)}
            >
              {item}
              {item === 'LIVE' && hasLiveMatches && <i className="live-dot" />}
            </button>
          ))}
          <button
            className={`xi-link ${currentPage === 'xi' ? 'on' : ''}`}
            onClick={() => setPage('xi')}
          >
            MAKE YOUR 11
          </button>
        </nav>
      </div>
    </header>
  );
}
