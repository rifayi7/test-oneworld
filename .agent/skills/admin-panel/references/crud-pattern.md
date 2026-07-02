# CRUD-per-resource pattern (worked example)

Repeat this for every managed entity. Names below: entity = `item`, table =
`items`, list URL = `/admin/items`. Adapt tokens/imports to the host project.

## Routes (under the authenticated `(panel)` group)

```
src/app/admin/(panel)/items/page.tsx          # LIST
src/app/admin/(panel)/items/new/page.tsx       # CREATE
src/app/admin/(panel)/items/[id]/page.tsx      # VIEW (read-only)
src/app/admin/(panel)/items/[id]/edit/page.tsx # EDIT
```

Every page is a server component. `params` is a Promise in App Router (`await` it).
Role-gate in the page: editors+ for `new`/`edit` (redirect Viewers to the list),
everyone signed-in for list/view.

```tsx
// items/[id]/edit/page.tsx
export default async function EditItemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");
  if (!canEditContent(user.role)) redirect("/admin/items");
  const item = await getItemById(Number(id));
  if (!item) notFound();
  return <ItemForm item={item} />;
}
```

## One form for create AND edit

Hidden `id` only when editing. The `upsert` action INSERTs when id is absent,
UPDATEs when present. On success, navigate back to the list.

```tsx
"use client";
export default function ItemForm({ item }: { item?: ItemRow | null }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    const res = await upsertItem(new FormData(e.currentTarget));   // server action
    setBusy(false);
    if (res.ok) { router.push("/admin/items"); router.refresh(); }
    else setError(res.error ?? "Could not save.");
  }
  return (
    <form onSubmit={onSubmit} className="bg-surface border border-border rounded-premium p-6 flex flex-col gap-5">
      {item && <input type="hidden" name="id" value={item.id} />}
      {/* labelled fields using shared inputClass/labelClass; published checkbox; sort number */}
      {error && <p role="alert" className="text-sm text-red-500">{error}</p>}
      <button disabled={busy}>{busy ? "Saving…" : item ? "Save changes" : "Create item"}</button>
    </form>
  );
}
```

## List table (uses ResponsiveTable)

```tsx
"use client";
const columns: Column<ItemRow>[] = [
  { header: "Sort", cell: (r) => r.sort },
  { header: "Title", primary: true, cell: (r) => <span className="text-bone font-medium">{r.title}</span> },
  { header: "Status", cell: (r) => (r.published ? "Published" : "Hidden") },
];
<ResponsiveTable
  rows={items} columns={columns} rowKey={(r) => r.id}
  empty="No items yet."
  actions={(r) => (<>
    <Link href={`/admin/items/${r.id}`}>View</Link>
    {canEdit && <>
      <Link href={`/admin/items/${r.id}/edit`}>Edit</Link>
      <button onClick={() => onDelete(r)}>Delete</button>
    </>}
  </>)}
/>
```
Delete handler: `confirm()` → `deleteItem(r.id)` → `router.refresh()`.

## Upsert action with resequencing (server)

```ts
export async function upsertItem(fd: FormData): Promise<{ ok: boolean; error?: string }> {
  await requireEditor();
  const id = intOr(fd, "id", 0);
  const title = str(fd, "title");
  if (!title) return { ok: false, error: "Title is required." };
  const sort = intOr(fd, "sort", 0), published = fd.get("published") ? 1 : 0;

  let targetId = id;
  if (id > 0) {
    await getDb().execute({ sql: "UPDATE items SET title=?, sort=?, published=? WHERE id=?", args: [title, sort, published, id] });
  } else {
    const res = await getDb().execute({ sql: "INSERT INTO items (title, sort, published) VALUES (?,?,?)", args: [title, sort, published] });
    targetId = Number(res.lastInsertRowid);
  }
  await resequence("items", null, targetId);   // contiguous 0..n, target wins ties
  revalidatePath("/"); revalidatePath("/admin");
  return { ok: true };
}
```

See `responsive-table.tsx` for the table primitive and `../SKILL.md` for auth,
RBAC, sessions, and the security rules.
