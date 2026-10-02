import React, { useState } from 'react';
import { ALL_LEAGUES } from '../data/leagues.js';
import LeaguePicker from './LeaguePicker.jsx';

const TeamBadge = ({ name }) => {
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 3);
  return <span className="badge">{initials}</span>;
};

export default function PopularLeagues({
  featuredLeagues,
  setFeaturedLeagues,
  activeLeague,
  setActiveLeague,
  counts
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [showMore, setShowMore] = useState(false);

  const moreLeagues = ALL_LEAGUES.filter(
    (lg) => !featuredLeagues.includes(lg.name)
  );

  return (
    <section className="panel">
      <h3>
        {isEditing ? 'MY LEAGUES' : 'POPULAR COMPETITIONS'}
        {!isEditing && (
          <button className="link" onClick={() => setIsEditing(true)}>
            Edit
          </button>
        )}
      </h3>

      {isEditing ? (
        <LeaguePicker
          currentFeatured={featuredLeagues}
          onSave={(newLeagues) => {
            setFeaturedLeagues(newLeagues);
            setIsEditing(false);
          }}
          onCancel={() => setIsEditing(false)}
        />
      ) : (
        <>
          <ul className="lg-list">
            {featuredLeagues.map((leagueName) => {
              const isActive = activeLeague === leagueName;
              return (
                <li key={leagueName}>
                  <button
                    className={isActive ? 'on' : ''}
                    onClick={() => setActiveLeague(isActive ? null : leagueName)}
                  >
                    <TeamBadge name={leagueName} />
                    {leagueName}
                    <em>{counts[leagueName] || 0}</em>
                  </button>
                </li>
              );
            })}
          </ul>

          <button
            className="more-btn"
            onClick={() => setShowMore(!showMore)}
            aria-expanded={showMore}
          >
            MORE LEAGUES{' '}
            <span className={showMore ? 'up' : ''}>▼</span>
          </button>

          {showMore && (
            <ul className="more-list">
              {moreLeagues.map((lg) => (
                <li key={lg.id}>
                  <button
                    onClick={() => {
                      setActiveLeague(lg.name);
                      setShowMore(false);
                    }}
                  >
                    {lg.name}
                    <em>{counts[lg.name] || 0}</em>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </section>
  );
}
