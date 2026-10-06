"use client";

import { useTransition } from "react";
import styles from "./StatusSelect.module.css";

/**
 * 表格裡可直接改的狀態下拉。
 * 選完立即送出，不必再按一次儲存。
 */
export default function StatusSelect({ action, id, field, value, options, label }) {
  const [pending, startTransition] = useTransition();

  return (
    <select
      className={`${styles.select} ${styles[value] ?? ""}`}
      defaultValue={value}
      disabled={pending}
      aria-label={label}
      onChange={(e) => {
        const next = e.target.value;
        const data = new FormData();
        data.set("id", id);
        data.set("field", field);
        data.set("value", next);
        startTransition(() => action(data));
      }}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
