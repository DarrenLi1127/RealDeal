import "../styles/ExpBar.css";

interface Props {
  exp: number;
  level: number;
}

const thresholds = [
  0,50,120,210,320,450,600,760,930,1110,
  1300,1500,1710,1930,2160,2400,2650,2910,3180,3460,
  3750,4050,4360,4680,5010,5350,5700,6060,6430
];

export default function ExpBar({exp, level}: Props) {
  const curMin = thresholds[level-1];
  const nextMin = thresholds[Math.min(level, thresholds.length-1)];
  const pct = ((exp - curMin) / (nextMin - curMin)) * 100;

  return (
    <div className="exp-bar">
      <span className="exp-lv">Lv {level}</span>
      <div className="exp-track">
        <div className="exp-fill" style={{width: `${pct}%`}} />
      </div>
      <span className="exp-text">{exp}/{nextMin}</span>
    </div>
  );
}
