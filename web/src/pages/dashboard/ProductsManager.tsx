import { useState, type FormEvent } from 'react';
import {
  Button,
  Card,
  Dialog,
  Field,
  Input,
  Skeleton,
  Textarea,
  Toggle,
  cx,
} from '../../components/ui';
import { IconDown, IconGrip, IconPlus, IconTrash, IconUp } from '../../components/icons';
import { useToast } from '../../components/Toast';
import { ApiError, api } from '../../lib/api';
import { useAsync } from '../../lib/useAsync';
import { formatINR, hostOf } from '../../lib/format';
import type { ProductItem } from '../../lib/types';

interface Draft {
  id?: string;
  title: string;
  description: string;
  imageUrl: string;
  price: string;
  destinationUrl: string;
  isActive: boolean;
}

const EMPTY: Draft = {
  title: '',
  description: '',
  imageUrl: '',
  price: '',
  destinationUrl: '',
  isActive: true,
};

export default function ProductsManager() {
  const toast = useToast();
  const { data, loading, setData, reload } = useAsync(() =>
    api.get<{ products: ProductItem[] }>('/api/products'),
  );
  const [draft, setDraft] = useState<Draft | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  const products = data?.products ?? [];

  function openAdd() {
    setErrors({});
    setDraft({ ...EMPTY });
  }

  function openEdit(p: ProductItem) {
    setErrors({});
    setDraft({
      id: p.id,
      title: p.title,
      description: p.description,
      imageUrl: p.imageUrl ?? '',
      price: p.pricePaise === null ? '' : String(p.pricePaise / 100),
      destinationUrl: p.destinationUrl,
      isActive: p.isActive,
    });
  }

  function pricePayload(): number | null {
    if (!draft || draft.price.trim() === '') return null;
    const rupees = Number(draft.price);
    if (!Number.isFinite(rupees) || rupees < 0) return null;
    return Math.round(rupees * 100);
  }

  async function save(e: FormEvent) {
    e.preventDefault();
    if (!draft) return;
    setBusy(true);
    setErrors({});
    const payload = {
      title: draft.title,
      description: draft.description,
      imageUrl: draft.imageUrl,
      pricePaise: pricePayload(),
      destinationUrl: draft.destinationUrl,
      isActive: draft.isActive,
    };
    try {
      if (draft.id) {
        const { product } = await api.put<{ product: ProductItem }>(`/api/products/${draft.id}`, payload);
        setData((prev) => ({
          products: (prev?.products ?? []).map((p) => (p.id === product.id ? product : p)),
        }));
      } else {
        const { product } = await api.post<{ product: ProductItem }>('/api/products', payload);
        setData((prev) => ({ products: [...(prev?.products ?? []), product] }));
      }
      setDraft(null);
      toast.push('Product saved.', 'success');
    } catch (err) {
      if (err instanceof ApiError) {
        const fe: Record<string, string> = {};
        for (const d of err.details ?? []) {
          const key = d.path.split('.').pop() ?? d.path;
          if (!fe[key]) fe[key] = d.message;
        }
        setErrors(fe);
        if (Object.keys(fe).length === 0) toast.push(err.message, 'error');
      } else {
        toast.push('Could not save the product.', 'error');
      }
    } finally {
      setBusy(false);
    }
  }

  async function toggleActive(p: ProductItem) {
    try {
      const { product } = await api.put<{ product: ProductItem }>(`/api/products/${p.id}`, {
        isActive: !p.isActive,
      });
      setData((prev) => ({
        products: (prev?.products ?? []).map((x) => (x.id === product.id ? product : x)),
      }));
    } catch {
      toast.push('Could not update the product.', 'error');
    }
  }

  async function remove(p: ProductItem) {
    if (!window.confirm(`Delete “${p.title}”?`)) return;
    try {
      await api.delete(`/api/products/${p.id}`);
      setData((prev) => ({ products: (prev?.products ?? []).filter((x) => x.id !== p.id) }));
      toast.push('Product deleted.', 'success');
    } catch {
      toast.push('Could not delete the product.', 'error');
    }
  }

  async function move(index: number, delta: number) {
    const next = [...products];
    const target = index + delta;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target]!, next[index]!];
    const reordered = next.map((p, i) => ({ ...p, position: i }));
    setData({ products: reordered });
    try {
      const { products: saved } = await api.put<{ products: ProductItem[] }>('/api/products/reorder', {
        ids: reordered.map((p) => p.id),
      });
      setData({ products: saved });
    } catch {
      toast.push('Could not save the new order.', 'error');
      await reload();
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-extrabold">Products</h2>
          <p className="mt-1 text-sm text-text-muted">List what you sell with a price in ₹ and a link.</p>
        </div>
        <Button onClick={openAdd}>
          <span className="flex items-center gap-1.5"><IconPlus /> Add product</span>
        </Button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24" />)}
        </div>
      ) : products.length === 0 ? (
        <Card className="text-center">
          <p className="font-semibold">No products yet</p>
          <p className="mt-1 text-sm text-text-muted">Add a product so visitors know what you sell.</p>
          <Button className="mt-4" onClick={openAdd}>
            <span className="flex items-center gap-1.5"><IconPlus /> Add product</span>
          </Button>
        </Card>
      ) : (
        <ul className="space-y-3">
          {products.map((p, i) => (
            <li key={p.id}>
              <div className="flex items-center gap-3 rounded-lg border border-border bg-elevated p-3 shadow-card">
                <span className="cursor-grab text-text-muted" aria-hidden="true"><IconGrip /></span>
                {p.imageUrl ? (
                  <img src={p.imageUrl} alt="" className="h-12 w-12 shrink-0 rounded-md object-cover" />
                ) : (
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-accent-soft text-lg font-bold text-accent">
                    {p.title.charAt(0).toUpperCase()}
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <p className={cx('truncate font-semibold', !p.isActive && 'text-text-muted line-through')}>
                    {p.title}
                  </p>
                  <p className="truncate text-xs text-text-muted">
                    {formatINR(p.pricePaise) ?? 'No price'} · {hostOf(p.destinationUrl)}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    className="rounded p-1.5 text-text-muted hover:bg-surface disabled:opacity-30"
                    aria-label={`Move ${p.title} up`}
                    disabled={i === 0}
                    onClick={() => void move(i, -1)}
                  >
                    <IconUp />
                  </button>
                  <button
                    type="button"
                    className="rounded p-1.5 text-text-muted hover:bg-surface disabled:opacity-30"
                    aria-label={`Move ${p.title} down`}
                    disabled={i === products.length - 1}
                    onClick={() => void move(i, 1)}
                  >
                    <IconDown />
                  </button>
                  <Toggle
                    checked={p.isActive}
                    onChange={() => void toggleActive(p)}
                    label={`${p.isActive ? 'Hide' : 'Show'} ${p.title}`}
                  />
                  <button
                    type="button"
                    className="rounded p-1.5 text-text-muted hover:bg-surface hover:text-danger"
                    aria-label={`Delete ${p.title}`}
                    onClick={() => void remove(p)}
                  >
                    <IconTrash />
                  </button>
                </div>
              </div>
              <div className="mt-1 ml-3">
                <Button size="sm" variant="ghost" onClick={() => openEdit(p)}>
                  Edit details
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Dialog
        open={draft !== null}
        onClose={() => setDraft(null)}
        title={draft?.id ? 'Edit product' : 'Add product'}
        footer={
          <>
            <Button variant="ghost" onClick={() => setDraft(null)}>
              Cancel
            </Button>
            <Button form="product-form" type="submit" loading={busy}>
              Save
            </Button>
          </>
        }
      >
        <form id="product-form" onSubmit={save} noValidate className="space-y-4">
          <Field label="Title" htmlFor="product-title" error={errors.title} required>
            <Input
              id="product-title"
              value={draft?.title ?? ''}
              onChange={(e) => setDraft((d) => (d ? { ...d, title: e.target.value } : d))}
              maxLength={120}
              required
            />
          </Field>
          <Field label="Description" htmlFor="product-desc" error={errors.description}>
            <Textarea
              id="product-desc"
              rows={2}
              maxLength={1000}
              value={draft?.description ?? ''}
              onChange={(e) => setDraft((d) => (d ? { ...d, description: e.target.value } : d))}
            />
          </Field>
          <Field label="Price (₹)" htmlFor="product-price" error={errors.pricePaise} hint="Leave blank if there is no fixed price.">
            <Input
              id="product-price"
              inputMode="decimal"
              placeholder="250"
              value={draft?.price ?? ''}
              onChange={(e) => setDraft((d) => (d ? { ...d, price: e.target.value } : d))}
            />
          </Field>
          <Field label="Image URL" htmlFor="product-image" error={errors.imageUrl}>
            <Input
              id="product-image"
              placeholder="https://…"
              value={draft?.imageUrl ?? ''}
              onChange={(e) => setDraft((d) => (d ? { ...d, imageUrl: e.target.value } : d))}
            />
          </Field>
          <Field label="Destination URL" htmlFor="product-url" error={errors.destinationUrl} required hint="Where the button takes buyers.">
            <Input
              id="product-url"
              type="url"
              placeholder="https://…"
              value={draft?.destinationUrl ?? ''}
              onChange={(e) => setDraft((d) => (d ? { ...d, destinationUrl: e.target.value } : d))}
              required
            />
          </Field>
          <label className="flex items-center justify-between rounded-md border border-border px-3 py-2">
            <span className="text-sm font-semibold">Visible on my page</span>
            <Toggle
              checked={draft?.isActive ?? true}
              onChange={(v) => setDraft((d) => (d ? { ...d, isActive: v } : d))}
              label="Visible on my page"
            />
          </label>
        </form>
      </Dialog>
    </div>
  );
}
