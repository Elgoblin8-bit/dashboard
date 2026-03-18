import { useState, useEffect } from 'react'
import { schedule, deadlines, events, quickLinks } from './data/config'
import GitHubHeatmap from './components/GitHubHeatmap'
import TaskBoard from './components/TaskBoard'

const DAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

function daysUntil(dateStr) {
  const now = new Date(); now.setHours(0,0,0,0)
  const target = new Date(dateStr + 'T00:00:00')
  return Math.ceil((target - now) / 86400000)
}

function MiniCalendar() {
  const now = new Date()
  const year = now.getFullYear(), month = now.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const today = now.getDate()
  const eventDays = events.filter(e => {
    const d = new Date(e.date)
    return d.getMonth() === month && d.getFullYear() === year
  }).map(e => new Date(e.date).getDate())

  const cells = []
  for (let i = 0; i < firstDay; i++) cells.push(<div key={`e${i}`} className="day" />)
  for (let d = 1; d <= daysInMonth; d++) {
    const cls = ['day']
    if (d === today) cls.push('today')
    if (eventDays.includes(d)) cls.push('has-event')
    cells.push(<div key={d} className={cls.join(' ')}>{d}</div>)
  }

  return (
    <div>
      <div style={{ color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.9rem' }}>
        {MONTHS[month]} {year}
      </div>
      <div className="mini-cal">
        {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => <div key={d} className="day-header">{d}</div>)}
        {cells}
      </div>
      <div className="event-list">
        {events.filter(e => daysUntil(e.date) >= 0).slice(0, 4).map((e, i) => (
          <div key={i} className="event-item">
            <div className="event-dot" />
            <div className="event-date">{e.date.slice(5)}</div>
            <div>{e.name}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function App() {
  const [time, setTime] = useState(new Date())
  useEffect(() => { const t = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(t) }, [])

  const dayName = DAYS[time.getDay()]
  const todayClasses = schedule[dayName] || []

  const sortedDeadlines = [...deadlines].sort((a, b) => new Date(a.due) - new Date(b.due))

  return (
    <div className="dashboard">
      <div className="header">
        <div>
          <h1>{getGreeting()}, <span>Kenner</span> 👋</h1>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
            {dayName} — {todayClasses.length ? `${todayClasses.length} classes today` : 'No classes today'}
          </div>
        </div>
        <div className="datetime">
          <div className="time">{time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</div>
          <div>{time.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
        </div>
      </div>

      <div className="grid">
        {/* GitHub Activity */}
        <div className="card two-col">
          <div className="card-title">🐙 GitHub Activity</div>
          <GitHubHeatmap />
        </div>

        {/* Calendar */}
        <div className="card">
          <div className="card-title">📅 Calendar</div>
          <MiniCalendar />
        </div>

        {/* Today's Schedule */}
        <div className="card">
          <div className="card-title">📚 Today's Schedule</div>
          {todayClasses.length === 0 ? (
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No classes today 🎉</div>
          ) : (
            todayClasses.map((c, i) => (
              <div key={i} className="schedule-item">
                <div className="schedule-time">{c.time}</div>
                <div>
                  <div className="schedule-name">{c.name}</div>
                  <div className="schedule-room">{c.room}</div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Deadlines */}
        <div className="card">
          <div className="card-title">⏰ Deadlines</div>
          {sortedDeadlines.map((d, i) => {
            const days = daysUntil(d.due)
            const urgency = days <= 2 ? 'urgent' : days <= 5 ? 'soon' : 'later'
            const label = days === 0 ? 'Today' : days === 1 ? 'Tomorrow' : `${days}d`
            return (
              <div key={i} className="deadline-item">
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 500 }}>{d.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{d.course}</div>
                </div>
                <div className={`deadline-due ${urgency}`}>{label}</div>
              </div>
            )
          })}
        </div>

        {/* Quick Links */}
        <div className="card">
          <div className="card-title">⚡ Quick Links</div>
          <div className="links-grid">
            {quickLinks.map((l, i) => (
              <a key={i} className="link-card" href={l.url} target="_blank" rel="noopener noreferrer">
                <div className="icon">{l.icon}</div>
                <div>{l.name}</div>
              </a>
            ))}
          </div>
        </div>

        {/* Task Board */}
        <div className="card full-width">
          <div className="card-title">📋 Project Board</div>
          <TaskBoard />
        </div>
      </div>
    </div>
  )
}
