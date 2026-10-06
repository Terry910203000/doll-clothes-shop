"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

/** 後台會員表的「備註」欄（手稿第 13 頁） */
export async function updateMemberNote(formData) {
  await requireAdmin("/admin/members");

  const id = String(formData.get("id") ?? "");
  const note = String(formData.get("note") ?? "").trim();

  await prisma.user.update({
    where: { id },
    data: { note: note || null },
  });

  revalidatePath("/admin/members");
}
