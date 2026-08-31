export default function GlassCard({ children, className = '', dark = false }) {
  return <div className={`glass-card ${dark ? 'dark' : ''} ${className}`.trim()}>{children}</div>;
}
