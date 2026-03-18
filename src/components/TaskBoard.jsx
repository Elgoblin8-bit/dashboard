import { useState, useEffect, useRef } from 'react'

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

const columns = [
  { key: 'todo', label: 'To Do', dot: 'todo' },
  { key: 'progress', label: 'In Progress', dot: 'progress' },
  { key: 'done', label: 'Done', dot: 'done' },
]

export default function TaskBoard() {
  const [tasks, setTasks] = useState(load)
  const [adding, setAdding] = useState(null)
  const [newText, setNewText] = useState('')
  const [dragItem, setDragItem] = useState(null) // { col, id }
  const [dropTarget, setDropTarget] = useState(null) // column key
  const dragNode = useRef(null)

  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks)) }, [tasks])

  function addTask(col) {
    if (!newText.trim()) return
    const task = { id: Date.now().toString(), text: newText.trim(), tag: '' }
    setTasks(prev => ({ ...prev, [col]: [...prev[col], task] }))
    setNewText('')
    setAdding(null)
  }

  function deleteTask(col, taskId) {
    setTasks(prev => ({
      ...prev,
      [col]: prev[col].filter(t => t.id !== taskId),
    }))
  }

  // --- Drag handlers ---
  function handleDragStart(e, col, taskId) {
    dragNode.current = e.target
    setDragItem({ col, id: taskId })
    // Make the drag image slightly transparent
    setTimeout(() => {
      if (dragNode.current) dragNode.current.style.opacity = '0.4'
    }, 0)
  }

  function handleDragEnd() {
    if (dragNode.current) dragNode.current.style.opacity = '1'
    dragNode.current = null
    setDragItem(null)
    setDropTarget(null)
  }

  function handleDragOver(e, colKey) {
    e.preventDefault()
    setDropTarget(colKey)
  }

  function handleDragLeave(e, colKey) {
    // Only clear if we're leaving the column entirely
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setDropTarget(null)
    }
  }

  function handleDrop(e, toCol) {
    e.preventDefault()
    setDropTarget(null)
    if (!dragItem || dragItem.col === toCol) return

    setTasks(prev => {
      const task = prev[dragItem.col].find(t => t.id === dragItem.id)
      if (!task) return prev
      return {
        ...prev,
        [dragItem.col]: prev[dragItem.col].filter(t => t.id !== dragItem.id),
        [toCol]: [...prev[toCol], task],
      }
    })
    setDragItem(null)
  }

  // --- Touch drag support ---
  const touchInfo = useRef(null)
  const ghostRef = useRef(null)

  function handleTouchStart(e, col, taskId, text) {
    const touch = e.touches[0]
    touchInfo.current = { col, id: taskId, startX: touch.clientX, startY: touch.clientY, active: false }
    
    // Create ghost element
    const ghost = document.createElement('div')
    ghost.textContent = text
    ghost.style.cssText = `
      position: fixed; z-index: 9999; pointer-events: none;
      padding: 0.75rem; background: var(--bg-secondary); border: 1px solid var(--accent);
      border-radius: 10px; color: var(--text-primary); font-size: 0.85rem;
      opacity: 0; box-shadow: 0 4px 20px rgba(0,0,0,0.4); max-width: 200px;
    `
    document.body.appendChild(ghost)
    ghostRef.current = ghost
  }

  function handleTouchMove(e) {
    if (!touchInfo.current) return
    const touch = e.touches[0]
    const info = touchInfo.current

    if (!info.active) {
      const dx = Math.abs(touch.clientX - info.startX)
      const dy = Math.abs(touch.clientY - info.startY)
      if (dx < 10 && dy < 10) return
      info.active = true
      setDragItem({ col: info.col, id: info.id })
    }

    if (ghostRef.current) {
      ghostRef.current.style.opacity = '0.9'
      ghostRef.current.style.left = (touch.clientX - 80) + 'px'
      ghostRef.current.style.top = (touch.clientY - 20) + 'px'
    }

    // Detect which column we're over
    const el = document.elementFromPoint(touch.clientX, touch.clientY)
    if (el) {
      const colEl = el.closest('[data-col]')
      setDropTarget(colEl ? colEl.dataset.col : null)
    }
  }

  function handleTouchEnd() {
    if (ghostRef.current) {
      ghostRef.current.remove()
      ghostRef.current = null
    }

    if (touchInfo.current?.active && dragItem && dropTarget && dragItem.col !== dropTarget) {
      setTasks(prev => {
        const task = prev[dragItem.col].find(t => t.id === dragItem.id)
        if (!task) return prev
        return {
          ...prev,
          [dragItem.col]: prev[dragItem.col].filter(t => t.id !== dragItem.id),
          [dropTarget]: [...prev[dropTarget], task],
        }
      })
    }

    touchInfo.current = null
    setDragItem(null)
    setDropTarget(null)
  }

  useEffect(() => {
    document.addEventListener('touchmove', handleTouchMove, { passive: false })
    document.addEventListener('touchend', handleTouchEnd)
    return () => {
      document.removeEventListener('touchmove', handleTouchMove)
      document.removeEventListener('touchend', handleTouchEnd)
    }
  })

  return (
    <div className="board">
      {columns.map(col => (
        <div
          key={col.key}
          className="board-column"
          data-col={col.key}
          onDragOver={(e) => handleDragOver(e, col.key)}
          onDragLeave={(e) => handleDragLeave(e, col.key)}
          onDrop={(e) => handleDrop(e, col.key)}
          style={{
            borderRadius: '12px',
            padding: '0.5rem',
            transition: 'background 0.15s, outline 0.15s',
            background: dropTarget === col.key && dragItem?.col !== col.key
              ? 'rgba(99, 102, 241, 0.08)' : 'transparent',
            outline: dropTarget === col.key && dragItem?.col !== col.key
              ? '2px dashed rgba(99, 102, 241, 0.4)' : '2px dashed transparent',
          }}
        >
          <h3><span className={`dot ${col.dot}`} /> {col.label} ({tasks[col.key].length})</h3>
          {tasks[col.key].map(task => (
            <div
              key={task.id}
              className="task-card"
              draggable
              onDragStart={(e) => handleDragStart(e, col.key, task.id)}
              onDragEnd={handleDragEnd}
              onTouchStart={(e) => handleTouchStart(e, col.key, task.id, task.text)}
              onDoubleClick={() => col.key === 'done' && deleteTask('done', task.id)}
              title={col.key === 'done' ? 'Double-click to remove' : 'Drag to move'}
              style={{
                cursor: 'grab',
                opacity: dragItem?.id === task.id ? 0.4 : 1,
              }}
            >
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
