import { prisma } from "@/lib/prisma";
import { updateMemberNote } from "@/app/actions/admin-members";
import MemberNote from "@/components/MemberNote";
import styles from "@/components/admin.module.css";

export const dynamic = "force-dynamic";

const dateFmt = new Intl.DateTimeFormat("zh-TW", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

export default async function AdminMembersPage() {
  const members = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
      note: true,
      role: true,
      createdAt: true,
      _count: { select: { orders: true } },
    },
  });

  return (
    <>
      <div className={styles.pageHead}>
        <h2 className={styles.pageTitle}>會員資料</h2>
      </div>

      {members.length === 0 ? (
        <p className={styles.empty}>還沒有會員。</p>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>ID</th>
                <th>姓名</th>
                <th>EMAIL</th>
                <th>電話</th>
                <th>訂單</th>
                <th>註冊日</th>
                <th className={styles.wrapCell}>備註</th>
              </tr>
            </thead>
            <tbody>
              {members.map((m) => (
                <tr key={m.id}>
                  {/* cuid 很長，只顯示末 6 碼夠辨識即可 */}
                  <td title={m.id}>…{m.id.slice(-6)}</td>
                  <td>
                    {m.name || "—"}
                    {m.role === "ADMIN" ? (
                      <span className={`${styles.tag} ${styles.tagMuted}`}>管理員</span>
                    ) : null}
                  </td>
                  <td>{m.email}</td>
                  <td>{m.phone || "—"}</td>
                  <td>{m._count.orders}</td>
                  <td>{dateFmt.format(m.createdAt)}</td>
                  <td className={styles.wrapCell}>
                    <MemberNote action={updateMemberNote} id={m.id} note={m.note ?? ""} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
