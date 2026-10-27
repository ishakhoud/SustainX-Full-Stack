export default function Impact({ co2, acts }: { co2: number; acts: number }) {
  const cards: [string, string | number, string][] = [
    ['🌍', `${co2.toFixed(1)} kg`, 'CO₂ saved'],
    ['✅', acts, 'actions logged'],
    ['🌳', (co2 / 20).toFixed(1), 'trees’ worth of CO₂ per year'],
  ]
  return (
    <>
      <h2>Your impact</h2>
      <div className="impact">
        {cards.map(([icon, big, label]) => (
          <div key={label} className="box"><span style={{ fontSize: '2rem' }}>{icon}</span><b>{big}</b>{label}</div>
        ))}
      </div>
    </>
  )
}
