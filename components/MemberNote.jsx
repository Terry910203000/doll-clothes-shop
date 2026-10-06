"use client";

import { useRef, useState, useTransition } from "react";
import styles from "./MemberNote.module.css";

/**
 * 會員表的備註欄：改完離開欄位就自動存。
 */
export default function MemberNote({ action, id, note }) {
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const lastSaved = useRef(note);

  const save = (value) => {
    // 沒改就不送出，避免每次點過就打一次資料庫
    if (value === lastSaved.current) return;

    const data = new FormData();
    data.set("id", id);
    data.set("note", value);

    startTransition(async () => {
      await action(data);
      lastSaved.current = value;
      setSaved(true);
      setTimeout(() => setSaved(false), 1600);
    });
  };

  return (
    <span className={styles.wrap}>
      <input
        className={styles.input}
        type="text"
        defaultValue={note}
        placeholder="新增備註"
        disabled={pending}
        aria-label="會員備註"
        onBlur={(e) => save(e.target.value.trim())}
        onKeyDown={(e) => {
          if (e.key === "Enter") e.currentTarget.blur();
        }}
      />
      {saved ? <span className={styles.saved}>已存</span> : null}
    </span>
  );
}
