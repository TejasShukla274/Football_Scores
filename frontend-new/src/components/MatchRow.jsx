import React from 'react';

const TeamBadge = ({ name }) => {
  const initials = name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .slice(0, 3);

  return <span className="badge">{initials}</span>;
};

export default function MatchRow({ match }) {
  const isLive = match.status === 'LIVE';
  const isUpcoming = match.status === 'UP';

  const formatStatus = () => {
    if (isLive) return `LIVE ${match.min || 0}'`;
    if (isUpcoming) return `KO ${match.time}`;
    return 'FT';
  };

  return (
    <li className="match">
      <span className="team h">
        {match.home}
        <TeamBadge name={match.home} />
      </span>

      <span className={`score ${isLive ? 'live' : ''}`}>
        {isUpcoming ? match.time : `${match.hs} - ${match.as}`}
      </span>

      <span className="team">
        <TeamBadge name={match.away} />
        {match.away}
      </span>

      <span className={`status ${match.status}`}>
        {formatStatus()}
      </span>
    </li>
  );
}
