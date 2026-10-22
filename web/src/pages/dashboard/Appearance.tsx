import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Card, Field, Input, Select, cx } from '../../components/ui';
import { PublicView, type PublicViewData } from '../../components/PublicView';
import { useAuth } from '../../context/AuthProvider';
import { useToast } from '../../components/Toast';
import { api } from '../../lib/api';
import { useAsync } from '../../lib/useAsync';
import { LAYOUT_LABELS } from '../../lib/theme';
import {
  FONT_OPTIONS,
  TEMPLATES,
  isHex,
  isSafeHttpUrl,
  normalizeAppearance,
  templateDefaults,
  themeKeyForTemplate,
  type Appearance,
  type TemplateKey,
} from '../../lib/appearance';
import type { Layout, LinkItem, ProductItem, Profile } from '../../lib/types';

/* ----------------------------- small controls ---------------------------- */

interface EnumOption<T extends string> {
  value: T;
  label: string;
}

function enumSelect<T extends string>({
  id,
  label,
  value,
  options,
  onChange,
}: {
  id: string;
  label: string;
  value: T;
  options: EnumOption<T>[];
  onChange: (value: T) => void;
}) {
  return (
    <Field label={label} htmlFor={id}>
      <Select id={id} value={value} onChange={(e) => onChange(e.target.value as T)}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </Select>
    </Field>
  );
}

function rangeRow({
  id,
  label,
  value,
  min,
  max,
  step = 1,
  suffix = '',
  onChange,
}: {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  suffix?: string;
  onChange: (value: number) => void;
}) {
  return (
    <Field label={label} htmlFor={id} hint={`${value}${suffix}`}>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full cursor-pointer accent-accent"
      />
    </Field>
  );
}

/** Colour picker + hex box. Only valid 6-digit hex reaches the preview. */
function ColorRow({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const [text, setText] = useState(value);
  useEffect(() => setText(value), [value]);

  return (
    <Field label={label} htmlFor={id}>
      <div className="flex items-center gap-3">
        <input
          type="color"
          aria-label={`${label} picker`}
          value={isHex(value) ? value : '#000000'}
          onChange={(e) => onChange(e.target.value)}
          className="h-10 w-14 cursor-pointer rounded-md border border-border bg-elevated p-1"
        />
        <Input
          id={id}
          value={text}
          maxLength={7}
          spellCheck={false}
          className="w-32 font-mono"
          onChange={(e) => {
            const next = e.target.value;
            setText(next);
            if (isHex(next)) onChange(next);
          }}
        />
      </div>
    </Field>
  );
}

/* --------------------------------- editor -------------------------------- */

export default function Appearance() {
  const { profile, setProfile } = useAuth();
  const toast = useToast();
  const [a, setA] = useState<Appearance>(() =>
    normalizeAppearance(profile?.appearance, profile?.theme),
  );
  const [linkLayout, setLinkLayout] = useState<Layout>(profile?.theme.layout ?? 'classic');
  const [busy, setBusy] = useState(false);
  const dirtyRef = useRef(false);

  // Hydrate once the session profile lands; keep local edits if the creator
  // is already mid-customisation.
  useEffect(() => {
    if (!profile || dirtyRef.current) return;
    setA(normalizeAppearance(profile.appearance, profile.theme));
    setLinkLayout(profile.theme.layout);
  }, [profile]);

  const linksAsync = useAsync(() => api.get<{ links: LinkItem[] }>('/api/links'));
  const productsAsync = useAsync(() => api.get<{ products: ProductItem[] }>('/api/products'));

  const activeLinks = (linksAsync.data?.links ?? []).filter((l) => l.isActive);
  const activeProducts = (productsAsync.data?.products ?? []).filter((p) => p.isActive);

  // Every patch marks the form dirty so the hydration effect cannot clobber
  // unsaved edits.
  const setBg = (patch: Partial<Appearance['background']>) => {
    dirtyRef.current = true;
    setA((p) => ({ ...p, background: { ...p.background, ...patch } }));
  };
  const setAvatar = (patch: Partial<Appearance['avatar']>) => {
    dirtyRef.current = true;
    setA((p) => ({ ...p, avatar: { ...p.avatar, ...patch } }));
  };
  const setTypeography = (patch: Partial<Appearance['typography']>) => {
    dirtyRef.current = true;
    setA((p) => ({ ...p, typography: { ...p.typography, ...patch } }));
  };
  const setButton = (patch: Partial<Appearance['button']>) => {
    dirtyRef.current = true;
    setA((p) => ({ ...p, button: { ...p.button, ...patch } }));
  };
  const setProducts = (patch: Partial<Appearance['products']>) => {
    dirtyRef.current = true;
    setA((p) => ({ ...p, products: { ...p.products, ...patch } }));
  };
  const setSection = (patch: Partial<Appearance['section']>) => {
    dirtyRef.current = true;
    setA((p) => ({ ...p, section: { ...p.section, ...patch } }));
  };
  const setLinkLayoutDirty = (v: Layout) => {
    dirtyRef.current = true;
    setLinkLayout(v);
  };

  const previewData: PublicViewData = {
    displayName: profile?.displayName ?? 'Your name',
    bio: profile?.bio ?? '',
    avatarUrl: profile?.avatarUrl ?? null,
    whatsappNumber: profile?.whatsappNumber ?? null,
    upiId: profile?.upiId ?? null,
    upiQrUrl: profile?.upiQrUrl ?? null,
    theme: profile?.theme ?? { themeKey: 'saffron', layout: linkLayout, accent: '#c2410c' },
    appearance: a,
    links: activeLinks.map((l) => ({ id: l.id, title: l.title, url: l.url, icon: l.icon })),
    products: activeProducts.map((p) => ({
      id: p.id,
      title: p.title,
      description: p.description,
      imageUrl: p.imageUrl,
      pricePaise: p.pricePaise,
      currency: p.currency,
      destinationUrl: p.destinationUrl,
    })),
  };

  function chooseTemplate(key: TemplateKey) {
    dirtyRef.current = true;
    setA(templateDefaults(key));
  }

  function revert() {
    if (!profile) return;
    dirtyRef.current = false;
    setA(normalizeAppearance(profile.appearance, profile.theme));
    setLinkLayout(profile.theme.layout);
  }

  async function save() {
    if (!profile) return;
    const rawUrl = a.background.imageUrl.trim();
    if (rawUrl && !isSafeHttpUrl(rawUrl)) {
      toast.push('Background image must be a full http:// or https:// URL.', 'error');
      return;
    }
    // Normalise first so the payload is always a complete, in-range document.
    const payload = normalizeAppearance(a);
    setBusy(true);
    try {
      // Keep the legacy theme row coherent with the chosen design.
      await api.put('/api/profile/theme', {
        themeKey: themeKeyForTemplate(payload.template),
        layout: linkLayout,
        accent: payload.button.color,
      });
      const { profile: updated } = await api.put<{ profile: Profile }>(
        '/api/profile/appearance',
        payload,
      );
      dirtyRef.current = false;
      setProfile(updated);
      toast.push('Appearance saved.', 'success');
    } catch {
      toast.push('Could not save the appearance.', 'error');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold">Design your page</h2>
        <p className="mt-1 text-sm text-text-muted">
          Pick a template, then fine-tune it. The preview updates as you go.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
        <div className="space-y-6">
          {/* ---------------------------- templates --------------------------- */}
          <Card className="space-y-4">
            <div>
              <h3 className="font-bold">Design template</h3>
              <p className="mt-1 text-xs text-text-muted">
                Choosing a template applies its default design; tweak everything below afterwards.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3" data-testid="template-gallery">
              {TEMPLATES.map((t) => {
                const selected = a.template === t.key;
                const bg = t.defaults.background;
                const surface = t.defaults.section.surface || '#ffffff';
                const paint =
                  bg.kind === 'gradient'
                    ? {
                        background: `linear-gradient(${bg.gradientAngle}deg, ${bg.gradientFrom}, ${bg.gradientTo})`,
                      }
                    : { backgroundColor: bg.color };
                return (
                  <button
                    key={t.key}
                    type="button"
                    data-template={t.key}
                    aria-pressed={selected}
                    onClick={() => chooseTemplate(t.key)}
                    className={cx(
                      'rounded-xl border p-2 text-left transition duration-200 hover:-translate-y-0.5',
                      selected
                        ? 'border-accent ring-2 ring-accent/40'
                        : 'border-border hover:border-accent/50 hover:bg-surface',
                    )}
                  >
                    <span
                      aria-hidden="true"
                      className="flex h-24 w-full flex-col items-center gap-1 overflow-hidden rounded-lg p-2"
                      style={paint}
                    >
                      <span
                        className="h-5 w-5 rounded-full"
                        style={{ background: surface, border: '1px solid rgba(0,0,0,0.12)' }}
                      />
                      <span
                        className="mt-0.5 h-1.5 w-14 rounded-full"
                        style={{ background: t.defaults.typography.headingColor, opacity: 0.75 }}
                      />
                      <span
                        className="h-1 w-16 rounded-full"
                        style={{ background: t.defaults.typography.bodyColor, opacity: 0.5 }}
                      />
                      <span
                        className="mt-1 h-3.5 w-16"
                        style={{
                          background: t.defaults.button.color,
                          borderRadius: t.defaults.button.shape === 'pill' ? 999 : 4,
                        }}
                      />
                      <span
                        className="mt-auto h-4 w-full rounded"
                        style={{ background: surface, opacity: 0.9 }}
                      />
                    </span>
                    <span className="mt-2 flex items-center justify-between gap-1">
                      <span className="text-sm font-bold leading-tight">{t.label}</span>
                      {selected && (
                        <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-bold uppercase text-on-accent">
                          Selected
                        </span>
                      )}
                    </span>
                    <span className="mt-0.5 block text-[11px] leading-snug text-text-muted">
                      {t.tagline}
                    </span>
                  </button>
                );
              })}
            </div>
          </Card>

          {/* ---------------------------- background --------------------------- */}
          <Card className="space-y-4">
            <h3 className="font-bold">Background</h3>
            {enumSelect({
              id: 'bg-kind',
              label: 'Background type',
              value: a.background.kind,
              options: [
                { value: 'solid' as const, label: 'Solid colour' },
                { value: 'gradient' as const, label: 'Two-colour gradient' },
              ],
              onChange: (v) => setBg({ kind: v }),
            })}
            <ColorRow
              id="bg-color"
              label="Background colour"
              value={a.background.color}
              onChange={(v) => setBg({ color: v })}
            />
            {a.background.kind === 'gradient' && (
              <>
                <ColorRow
                  id="bg-from"
                  label="Gradient colour 1"
                  value={a.background.gradientFrom}
                  onChange={(v) => setBg({ gradientFrom: v })}
                />
                <ColorRow
                  id="bg-to"
                  label="Gradient colour 2"
                  value={a.background.gradientTo}
                  onChange={(v) => setBg({ gradientTo: v })}
                />
                {rangeRow({
                  id: 'bg-angle',
                  label: 'Gradient angle',
                  value: a.background.gradientAngle,
                  min: 0,
                  max: 360,
                  suffix: 'deg',
                  onChange: (v) => setBg({ gradientAngle: v }),
                })}
              </>
            )}
            <Field
              label="Background image URL"
              htmlFor="bg-image"
              hint="Optional. A direct http(s) image link, used as a full-page backdrop."
            >
              <Input
                id="bg-image"
                value={a.background.imageUrl}
                placeholder="https://…"
                spellCheck={false}
                onChange={(e) => setBg({ imageUrl: e.target.value })}
              />
            </Field>
            {a.background.imageUrl.trim() !== '' && !isSafeHttpUrl(a.background.imageUrl) && (
              <p className="text-xs font-medium text-danger">
                Enter a full http:// or https:// URL to preview the image.
              </p>
            )}
          </Card>

          {/* ---------------------------- profile ------------------------------ */}
          <Card className="space-y-4">
            <h3 className="font-bold">Profile picture</h3>
            {rangeRow({
              id: 'avatar-size',
              label: 'Picture size',
              value: a.avatar.size,
              min: 64,
              max: 160,
              suffix: 'px',
              onChange: (v) => setAvatar({ size: v }),
            })}
            {enumSelect({
              id: 'avatar-shape',
              label: 'Picture shape',
              value: a.avatar.shape,
              options: [
                { value: 'circle' as const, label: 'Circle' },
                { value: 'rounded' as const, label: 'Rounded square' },
                { value: 'square' as const, label: 'Square' },
              ],
              onChange: (v) => setAvatar({ shape: v }),
            })}
            {enumSelect({
              id: 'avatar-align',
              label: 'Picture alignment',
              value: a.avatar.align,
              options: [
                { value: 'center' as const, label: 'Centred' },
                { value: 'left' as const, label: 'Left aligned' },
              ],
              onChange: (v) => setAvatar({ align: v }),
            })}
          </Card>

          {/* ---------------------------- typography --------------------------- */}
          <Card className="space-y-4">
            <h3 className="font-bold">Typography</h3>
            {enumSelect({
              id: 'font',
              label: 'Font family',
              value: a.typography.font,
              options: FONT_OPTIONS.map((f) => ({ value: f.key, label: f.label })),
              onChange: (v) => setTypeography({ font: v }),
            })}
            <ColorRow
              id="heading-color"
              label="Heading colour"
              value={a.typography.headingColor}
              onChange={(v) => setTypeography({ headingColor: v })}
            />
            <ColorRow
              id="body-color"
              label="Body text colour"
              value={a.typography.bodyColor}
              onChange={(v) => setTypeography({ bodyColor: v })}
            />
            {rangeRow({
              id: 'heading-scale',
              label: 'Heading size',
              value: a.typography.headingScale,
              min: 0.85,
              max: 1.35,
              step: 0.05,
              suffix: 'x',
              onChange: (v) => setTypeography({ headingScale: v }),
            })}
          </Card>

          {/* ---------------------------- buttons ------------------------------ */}
          <Card className="space-y-4">
            <h3 className="font-bold">Links and buttons</h3>
            <ColorRow
              id="btn-color"
              label="Button colour"
              value={a.button.color}
              onChange={(v) => setButton({ color: v })}
            />
            <ColorRow
              id="btn-text"
              label="Button text colour"
              value={a.button.textColor}
              onChange={(v) => setButton({ textColor: v })}
            />
            {enumSelect({
              id: 'btn-shape',
              label: 'Button shape',
              value: a.button.shape,
              options: [
                { value: 'pill' as const, label: 'Pill (fully rounded)' },
                { value: 'rounded' as const, label: 'Rounded' },
                { value: 'square' as const, label: 'Square' },
              ],
              onChange: (v) => setButton({ shape: v }),
            })}
            {enumSelect({
              id: 'btn-border',
              label: 'Button border',
              value: a.button.border,
              options: [
                { value: 'none' as const, label: 'None' },
                { value: 'thin' as const, label: 'Thin' },
                { value: 'strong' as const, label: 'Thick' },
              ],
              onChange: (v) => setButton({ border: v }),
            })}
            {enumSelect({
              id: 'btn-shadow',
              label: 'Button shadow',
              value: a.button.shadow,
              options: [
                { value: 'none' as const, label: 'None' },
                { value: 'soft' as const, label: 'Soft' },
                { value: 'bold' as const, label: 'Bold' },
              ],
              onChange: (v) => setButton({ shadow: v }),
            })}
            {rangeRow({
              id: 'btn-gap',
              label: 'Spacing between links',
              value: a.button.gap,
              min: 6,
              max: 32,
              suffix: 'px',
              onChange: (v) => setButton({ gap: v }),
            })}
            {enumSelect({
              id: 'link-layout',
              label: 'Link layout',
              value: linkLayout,
              options: (Object.keys(LAYOUT_LABELS) as Layout[]).map((l) => ({
                value: l,
                label: LAYOUT_LABELS[l],
              })),
              onChange: setLinkLayoutDirty,
            })}
          </Card>

          {/* ---------------------------- products ----------------------------- */}
          <Card className="space-y-4">
            <h3 className="font-bold">Products</h3>
            {enumSelect({
              id: 'prod-layout',
              label: 'Product layout',
              value: a.products.layout,
              options: [
                { value: 'list' as const, label: 'List — image on the left' },
                { value: 'grid' as const, label: 'Grid — responsive columns' },
              ],
              onChange: (v) => setProducts({ layout: v }),
            })}
            {enumSelect({
              id: 'prod-aspect',
              label: 'Product image ratio',
              value: a.products.aspect,
              options: [
                { value: 'square' as const, label: 'Square (1:1)' },
                { value: 'portrait' as const, label: 'Portrait (3:4)' },
                { value: 'landscape' as const, label: 'Landscape (4:3)' },
              ],
              onChange: (v) => setProducts({ aspect: v }),
            })}
            {enumSelect({
              id: 'prod-card',
              label: 'Product card style',
              value: a.products.card,
              options: [
                { value: 'soft' as const, label: 'Soft card — shadow' },
                { value: 'outlined' as const, label: 'Outlined — on page background' },
                { value: 'flat' as const, label: 'Flat — panel colour' },
              ],
              onChange: (v) => setProducts({ card: v }),
            })}
            {rangeRow({
              id: 'prod-img-radius',
              label: 'Product image corners',
              value: a.products.imageRadius,
              min: 0,
              max: 28,
              suffix: 'px',
              onChange: (v) => setProducts({ imageRadius: v }),
            })}
          </Card>

          {/* ---------------------------- sections ----------------------------- */}
          <Card className="space-y-4">
            <h3 className="font-bold">Sections</h3>
            <p className="text-xs text-text-muted">
              Sections are the panels that hold your products and the UPI block.
            </p>
            {enumSelect({
              id: 'section-surface-mode',
              label: 'Section background',
              value: a.section.surface === '' ? 'transparent' : 'solid',
              options: [
                { value: 'transparent' as const, label: 'Page background (transparent)' },
                { value: 'solid' as const, label: 'Solid colour' },
              ],
              onChange: (v) =>
                setSection({ surface: v === 'transparent' ? '' : a.section.surface || '#ffffff' }),
            })}
            {a.section.surface !== '' && (
              <ColorRow
                id="section-surface"
                label="Section colour"
                value={a.section.surface}
                onChange={(v) => setSection({ surface: v })}
              />
            )}
            {rangeRow({
              id: 'section-radius',
              label: 'Section corner radius',
              value: a.section.radius,
              min: 0,
              max: 32,
              suffix: 'px',
              onChange: (v) => setSection({ radius: v }),
            })}
            {rangeRow({
              id: 'section-padding',
              label: 'Section padding',
              value: a.section.padding,
              min: 8,
              max: 32,
              suffix: 'px',
              onChange: (v) => setSection({ padding: v }),
            })}
            {rangeRow({
              id: 'section-gap',
              label: 'Spacing between items',
              value: a.section.gap,
              min: 6,
              max: 32,
              suffix: 'px',
              onChange: (v) => setSection({ gap: v }),
            })}
          </Card>

          <div className="flex flex-wrap gap-3">
            <Button onClick={save} loading={busy}>
              Save appearance
            </Button>
            <Button variant="ghost" onClick={revert}>
              Discard changes
            </Button>
          </div>
        </div>

        {/* ------------------------------ preview ----------------------------- */}
        <div className="lg:sticky lg:top-20 lg:self-start">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <span
              data-testid="editor-preview-badge"
              className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-accent/70 bg-accent-soft px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-accent"
            >
              Editor preview
            </span>
            <span className="text-[11px] text-text-muted">Not your published page</span>
          </div>
          <div className="overflow-hidden rounded-2xl border-2 border-dashed border-border shadow-card">
            <div className="max-h-[70vh] overflow-y-auto" data-testid="appearance-preview">
              <PublicView data={previewData} compact />
            </div>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-text-muted">
            This is a preview only. Your saved design appears on your public page once you save and
            publish it in{' '}
            <Link className="font-semibold underline" to="/dashboard/preview">
              Preview &amp; publish
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
