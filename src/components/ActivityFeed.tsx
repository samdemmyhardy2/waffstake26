import { useActivityFeed } from '../hooks/useActivityFeed'
import './ActivityFeed.css'

export function ActivityFeed() {
  const items = useActivityFeed()

  return (
    <section className="activity-feed" aria-label="Recent activity">
      <h2 className="activity-feed__title">Latest</h2>
      {items.length === 0 ? (
        <p className="activity-feed__empty">No moves yet — buys and steals show up here.</p>
      ) : (
        <ul className="activity-feed__list">
          {items.map((item) => (
            <li key={item.id} className="activity-feed__item">
              {item.message}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
