export default function StatusBadge({ value, type = 'status' }) {
  if (!value) return null
  const key = value.toLowerCase().replace('_', '_')
  return <span className={`badge badge-${key}`}>{value.replace('_', ' ')}</span>
}
