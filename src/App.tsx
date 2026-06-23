import { useEffect, useState } from 'react'
import { api } from './api'

export default function App() {
  const [count, setCount] = useState(0)
  useEffect(() => { api.tasks.list().then(t => setCount(t.length)) }, [])
  return <div style={{ padding: 12 }}>Tasks: {count}</div>
}
