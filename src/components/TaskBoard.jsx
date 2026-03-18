import { useState, useEffect } from 'react'

const STORAGE_KEY = 'dashboard-tasks'

const defaultTasks = {
  todo: [
    { id: '1', text: 'Set up GitHub repo', tag: 'setup' },
    { id: '2', text: 'Research project ideas', tag: 'planning' },
  ],
  progress: [
    { id: '3', text: 'LeetCode daily challenge', tag: 'practice' },
  ],
  done: [
    { id: '4', text: 'Update resume', tag: 'career' },
  ],
}

function load() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? JSON.parse(saved) : defaultTasks
  } catch { return defaultTasks }
}

export default function TaskBoard() {
  const [tasks, setTasks] = useState(load)
  const [adding, setAdding] = useState(null) // which column
  const [newText, setNewText] = useState('')

  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks)) }, [tasks])

  function addTask(col) {
    if (!newText.trim()) return
    const task = { id: Date.now().toString(), text: newText.trim(), tag: '' }
    setTasks(prev => ({ ...prev, [col]: [...prev[col], task] }))
    setNewText('')
    setAdding(null)
  }

  function moveTask(fromCol, taskId, toCol) {
    setTasks(prev => {
      const task = prev[fromCol].find(t => t.id === taskId)
      if (!task) return prev
      return {
        ...prev,
        [fromCol]: prev[fromCol].filter(t => t.id !== taskId),
        [toCol]: [...prev[toCol], task],
      }
    })
  }

  function deleteTask(col, taskId) {
    setTasks(prev => ({
      ...prev,
      [col]: prev[col].filter(t => t.id !== taskId),
    }))
  }

  const columns = [
    { key: 'todo', label: 'To Do', dot: 'todo', next: 'progress' },
    { key: 'progress', label: 'In Progress', dot: 'progress', next: 'done' },
    { key: 'done', label: 'Done', dot: 'done', next: null },
  ]

  return (
    <div className="board">
      {columns.map(col => (
        <div key={col.key} className="board-column">
          <h3><span className={`dot ${col.dot}`} /> {col.label} ({tasks[col.key].length})</h3>
          {tasks[col.key].map(task => (
            <div key={task.id} className="task-card"
                 onClick={() => col.next && moveTask(col.key, task.id, col.next)}
                 title={col.next ? `Click to move to ${col.next}` : 'Double-click to remove'}
                 onDoubleClick={() => col.key === 'done' && deleteTask('done', task.id)}>
              {task.text}
              {task.tag && <div className="tag">{task.tag}</div>}
            </div>
          ))}
          {adding === col.key ? (
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              <input
                autoFocus
                value={newText}
                onChange={e => setNewText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addTask(col.key)}
                placeholder="Task name..."
                style={{
                  flex: 1, padding: '0.5rem', background: 'var(--bg-card)',
                  border: '1px solid var(--accent)', borderRadius: '8px',
                  color: 'var(--text-primary)', fontSize: '0.8rem', outline: 'none'
                }}
              />
              <button className="btn btn-primary" onClick={() => addTask(col.key)}
                      style={{ padding: '0.5rem 0.75rem', fontSize: '0.75rem' }}>+</button>
            </div>
          ) : (
            <button className="add-task" onClick={() => { setAdding(col.key); setNewText('') }}>
              + Add task
            </button>
          )}
        </div>
      ))}
    </div>
  )
}
