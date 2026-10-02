import React from 'react';
import { NEWS_ITEMS } from '../data/news.js';

export default function News() {
  return (
    <section className="panel">
      <h3>TRANSFER & NEWS</h3>
      <ul className="news">
        {NEWS_ITEMS.map((item) => (
          <li key={item.id}>
            <small>{item.club}</small>
            <p>{item.text}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
