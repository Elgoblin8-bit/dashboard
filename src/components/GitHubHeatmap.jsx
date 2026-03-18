import { useMemo } from 'react'

function generateMockData() {
  const data = []
  const now = new Date()
  for (let i = 90; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    const rand = Math.random()
    let level = 0
    if (rand > 0.3) level = 1
    if (rand > 0.55) level = 2
    if (rand > 0.75) level = 3
    if (rand > 0.9) level = 4
    data.push({ date: d, level })
  }
  return data
}

export default function GitHubHeatmap() {
  const data = useMemo(generateMockData, [])
  const streak = data.reduceRight((acc, d) => {
    if (acc.broken) return acc
    if (d.level > 0) { acc.count++; return acc }
    acc.broken = true
    return acc
  }, { count: 0, broken: false }).count

  const totalContribs = data.filter(d => d.level > 0).length

  return (
    <div>
      <div className="heatmap">
        {data.map((d, i) => (
          <div key={i} className={`heatmap-cell ${d.level > 0 ? `l${d.level}` : ''}`}
               title={`${d.date.toLocaleDateString()}: ${d.level} contributions`} />
        ))}
      </div>
      <div className="streak-stats">
        <div className="streak-stat">
          <div className="number">{streak}</div>
          <div className="label">Day Streak 🔥</div>
        </div>
        <div className="streak-stat">
          <div className="number">{totalContribs}</div>
          <div className="label">Contributions (90d)</div>
        </div>
      </div>
    </div>
  )
}
