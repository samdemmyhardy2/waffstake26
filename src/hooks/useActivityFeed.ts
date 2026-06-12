import { useCallback, useEffect, useState } from 'react'
import {
  formatActivityEntry,
  getActivityFeed,
  subscribeActivityFeed,
  type ActivityEntry,
} from '../utils/activityFeed'

export interface ActivityFeedItem {
  id: string
  message: string
  at: string
}

function toFeedItems(entries: ActivityEntry[]): ActivityFeedItem[] {
  return entries.map((entry) => ({
    id: entry.id,
    at: entry.at,
    message: formatActivityEntry(entry),
  }))
}

export function useActivityFeed(): ActivityFeedItem[] {
  const [items, setItems] = useState<ActivityFeedItem[]>(() => toFeedItems(getActivityFeed()))

  const refresh = useCallback(() => {
    setItems(toFeedItems(getActivityFeed()))
  }, [])

  useEffect(() => {
    refresh()
    return subscribeActivityFeed(refresh)
  }, [refresh])

  return items
}
