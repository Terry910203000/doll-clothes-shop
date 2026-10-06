import { redirect } from "next/navigation";
import { getCurrentUser } from "./auth";

/**
 * 後台每個頁面與動作都要先過這一關。
 *
 * 未登入 → 導去登入頁並記住原本要去哪。
 * 登入了但不是管理員 → 導回首頁，不透露後台有什麼。
 */
export async function requireAdmin(next = "/admin") {
  const user = await getCurrentUser();

  if (!user) redirect(`/login?next=${encodeURIComponent(next)}`);
  if (user.role !== "ADMIN") redirect("/");

  return user;
}
