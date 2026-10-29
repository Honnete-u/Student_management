// Simple, dependency-free horizontal bar chart.
export default function BarChart({ data, colors = {} }) {
  const max = Math.max(1, ...Object.values(data));
  return (
    <div className="chart" role="img" aria-label="Bar chart">
      {Object.entries(data).map(([label, value]) => (
        <div className="bar-row" key={label}>
          <span className="bar-label">{label}</span>
          <div className="bar-track">
            <div className="bar" style={{ width: `${(value / max) * 100}%`, background: colors[label] }} />
          </div>
          <span className="bar-value">{value}</span>
        </div>
      ))}
    </div>
  );
}
