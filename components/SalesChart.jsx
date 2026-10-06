"use client";

import { useId, useMemo, useState } from "react";
import styles from "./SalesChart.module.css";

const LINE = "#935A24"; // 與站內 --c-logo 同色；已通過對比與色盲檢查

const W = 760;
const H = 260;
const PAD = { top: 18, right: 18, bottom: 30, left: 44 };

/**
 * 銷售折線圖（手稿第 12 頁）
 *
 * 單一數列，所以不需要圖例；標題已經說明這條線是什麼。
 * 滑過會出現十字線與數值。
 */
export default function SalesChart({ data, unit = "件" }) {
  const [hover, setHover] = useState(null);
  const clipId = useId();

  const plotW = W - PAD.left - PAD.right;
  const plotH = H - PAD.top - PAD.bottom;

  const max = Math.max(1, ...data.map((d) => d.qty));
  // 讓刻度落在整數上，圖才讀得準
  const top = Math.ceil(max / 4) * 4 || 4;

  const x = (i) => PAD.left + (data.length <= 1 ? plotW / 2 : (i / (data.length - 1)) * plotW);
  const y = (v) => PAD.top + plotH - (v / top) * plotH;

  const path = useMemo(
    () => data.map((d, i) => `${i === 0 ? "M" : "L"} ${x(i)} ${y(d.qty)}`).join(" "),
    [data, top],
  );

  const area = `${path} L ${x(data.length - 1)} ${PAD.top + plotH} L ${x(0)} ${PAD.top + plotH} Z`;

  const ticks = [0, top / 4, top / 2, (top * 3) / 4, top];

  // 刻度太密時只標示部分，避免文字疊在一起
  const labelEvery = Math.ceil(data.length / 12);

  return (
    <figure className={styles.figure}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className={styles.svg}
        role="img"
        aria-label={`銷售趨勢，單位${unit}`}
        onMouseLeave={() => setHover(null)}
      >
        <defs>
          <linearGradient id={`fill-${clipId}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={LINE} stopOpacity="0.18" />
            <stop offset="100%" stopColor={LINE} stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* 格線與 y 軸刻度，刻意做得很淡不搶資料 */}
        {ticks.map((t) => (
          <g key={t}>
            <line
              x1={PAD.left}
              x2={W - PAD.right}
              y1={y(t)}
              y2={y(t)}
              stroke="rgba(99,49,49,0.12)"
              strokeWidth="1"
            />
            <text x={PAD.left - 10} y={y(t) + 4} className={styles.axis} textAnchor="end">
              {t}
            </text>
          </g>
        ))}

        <path d={area} fill={`url(#fill-${clipId})`} />
        <path
          d={path}
          fill="none"
          stroke={LINE}
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {/* x 軸標籤 */}
        {data.map((d, i) =>
          i % labelEvery === 0 || i === data.length - 1 ? (
            <text key={i} x={x(i)} y={H - 10} className={styles.axis} textAnchor="middle">
              {d.label}
            </text>
          ) : null,
        )}

        {/* 滑過時的十字線與點 */}
        {hover !== null ? (
          <g>
            <line
              x1={x(hover)}
              x2={x(hover)}
              y1={PAD.top}
              y2={PAD.top + plotH}
              stroke="rgba(99,49,49,0.3)"
              strokeWidth="1"
              strokeDasharray="3 3"
            />
            <circle
              cx={x(hover)}
              cy={y(data[hover].qty)}
              r="5"
              fill={LINE}
              stroke="#fff"
              strokeWidth="2"
            />
          </g>
        ) : null}

        {/* 透明的感應區，比資料點大才好滑到 */}
        {data.map((d, i) => (
          <rect
            key={i}
            x={x(i) - plotW / data.length / 2}
            y={PAD.top}
            width={plotW / data.length}
            height={plotH}
            fill="transparent"
            onMouseEnter={() => setHover(i)}
          />
        ))}
      </svg>

      {hover !== null ? (
        <p className={styles.tooltip} role="status">
          <strong>{data[hover].label}</strong>
          <span>
            {data[hover].qty} {unit}
          </span>
          <span className={styles.tooltipAmount}>
            NT$ {data[hover].amount.toLocaleString("zh-TW")}
          </span>
        </p>
      ) : (
        <p className={styles.tooltipHint}>滑過圖表看各期間的數字</p>
      )}

      {/* 不靠顏色或滑鼠也能讀到完整數據 */}
      <details className={styles.table}>
        <summary>以表格檢視</summary>
        <table>
          <thead>
            <tr>
              <th>期間</th>
              <th>數量</th>
              <th>金額</th>
            </tr>
          </thead>
          <tbody>
            {data.map((d) => (
              <tr key={d.label}>
                <td>{d.label}</td>
                <td>
                  {d.qty} {unit}
                </td>
                <td>NT$ {d.amount.toLocaleString("zh-TW")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </figure>
  );
}
