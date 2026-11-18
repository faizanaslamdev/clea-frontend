'use client';

import { useEffect, useId, useMemo, useState } from 'react';
import { Check, LoaderCircle, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { fetchCatalogBrands } from '@/lib/api/products';
import { displayBrandName } from '@/lib/domain/brands/product-brands';
import {
  BUDGET_SLIDER_MAX,
  BUDGET_STEP,
  STYLE_BUDGET_ROWS,
  STYLE_SIZE_ROWS,
  fetchStyleProfile,
  formatBudget,
  readLocalStyleProfile,
  saveStyleProfile,
  writeLocalStyleProfile,
  type StyleProfile,
} from '@/lib/style-profile/style-profile';

type SaveState = 'idle' | 'saving' | 'saved' | 'error';

/**
 * Account section for the style profile: favourite brands, what you like to
 * spend per category and your sizes. Clea uses it to show pieces in your
 * range and from your brands first.
 */
export function StyleProfileEditor() {
  const brandInputId = useId();
  const brandListId = useId();
  const [profile, setProfile] = useState<StyleProfile>(() => ({ favouriteBrands: [], budgets: {}, sizes: {} }));
  const [loading, setLoading] = useState(true);
  const [brandDraft, setBrandDraft] = useState('');
  const [brandOptions, setBrandOptions] = useState<string[]>([]);
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const local = readLocalStyleProfile();
    setProfile(local);
    fetchStyleProfile()
      .then((remote) => {
        if (cancelled) return;
        // The account copy wins; an empty account takes what this browser had.
        const hasRemote =
          remote.favouriteBrands.length > 0 ||
          Object.keys(remote.budgets).length > 0 ||
          Object.keys(remote.sizes).length > 0;
        const next = hasRemote ? remote : local;
        setProfile(next);
        writeLocalStyleProfile(next);
      })
      .catch(() => undefined)
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    fetchCatalogBrands(400)
      .then((brands) => {
        if (cancelled) return;
        const seen = new Set<string>();
        setBrandOptions(
          brands
            .map((b) => displayBrandName(b.brand))
            .filter((name) => {
              const key = name.toLowerCase();
              if (!name || seen.has(key)) return false;
              seen.add(key);
              return true;
            }),
        );
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  const update = (next: StyleProfile) => {
    setProfile(next);
    setDirty(true);
    setSaveState('idle');
  };

  const addBrand = (name: string) => {
    const brand = name.trim();
    if (!brand) return;
    const exists = profile.favouriteBrands.some((b) => b.toLowerCase() === brand.toLowerCase());
    if (!exists && profile.favouriteBrands.length < 30) {
      update({ ...profile, favouriteBrands: [...profile.favouriteBrands, brand] });
    }
    setBrandDraft('');
  };

  const suggestions = useMemo(() => {
    const chosen = new Set(profile.favouriteBrands.map((b) => b.toLowerCase()));
    return brandOptions.filter((b) => !chosen.has(b.toLowerCase())).slice(0, 400);
  }, [brandOptions, profile.favouriteBrands]);

  const save = async () => {
    setSaveState('saving');
    writeLocalStyleProfile(profile);
    try {
      const saved = await saveStyleProfile(profile);
      setProfile(saved);
      writeLocalStyleProfile(saved);
      setSaveState('saved');
      setDirty(false);
    } catch {
      setSaveState('error');
    }
  };

  return (
    <div className="style-profile">
      <div className="style-profile__group">
        <h3 className="style-profile__heading">Favorittmerker</h3>
        <ul className="style-profile__brands" aria-label="Favorittmerker">
          {profile.favouriteBrands.map((brand) => (
            <li key={brand} className="style-profile__brand">
              <span>{brand}</span>
              <button
                type="button"
                aria-label={`Fjern ${brand}`}
                onClick={() =>
                  update({ ...profile, favouriteBrands: profile.favouriteBrands.filter((b) => b !== brand) })
                }
              >
                <X aria-hidden className="size-3.5" />
              </button>
            </li>
          ))}
        </ul>
        <form
          className="style-profile__add"
          onSubmit={(event) => {
            event.preventDefault();
            addBrand(brandDraft);
          }}
        >
          <label htmlFor={brandInputId} className="sr-only">
            Legg til merke
          </label>
          <input
            id={brandInputId}
            list={brandListId}
            value={brandDraft}
            onChange={(event) => setBrandDraft(event.target.value)}
            placeholder="Legg til et merke, f.eks. Arket"
            className="style-profile__input"
            autoComplete="off"
          />
          <datalist id={brandListId}>
            {suggestions.map((brand) => (
              <option key={brand} value={brand} />
            ))}
          </datalist>
          <Button type="submit" variant="outline" size="sm" disabled={!brandDraft.trim()}>
            <Plus aria-hidden className="size-4" />
            Legg til
          </Button>
        </form>
      </div>

      <div className="style-profile__group">
        <h3 className="style-profile__heading">Hva du liker å bruke</h3>
        <div className="style-profile__budgets">
          {STYLE_BUDGET_ROWS.map(({ key, label }) => {
            const amount = profile.budgets[key];
            return (
              <label key={key} className="style-profile__budget">
                <span className="style-profile__budget-row">
                  <span>{label}</span>
                  <span className="style-profile__budget-value">{formatBudget(amount)}</span>
                </span>
                <input
                  type="range"
                  min={0}
                  max={BUDGET_SLIDER_MAX}
                  step={BUDGET_STEP}
                  value={amount ?? BUDGET_SLIDER_MAX}
                  aria-valuetext={formatBudget(amount)}
                  onChange={(event) => {
                    const value = Number(event.target.value);
                    const budgets = { ...profile.budgets };
                    if (value >= BUDGET_SLIDER_MAX || value < BUDGET_STEP) {
                      delete budgets[key];
                    } else {
                      budgets[key] = value;
                    }
                    update({ ...profile, budgets });
                  }}
                />
              </label>
            );
          })}
        </div>
        <p className="style-profile__hint">Clea viser plagg innenfor budsjettet først. Du ser fortsatt alt.</p>
      </div>

      <div className="style-profile__group">
        <h3 className="style-profile__heading">Størrelsene dine</h3>
        <div className="style-profile__sizes">
          {STYLE_SIZE_ROWS.map(({ key, label, options }) => (
            <label key={key} className="style-profile__size">
              <span>{label}</span>
              <select
                value={profile.sizes[key] ?? ''}
                onChange={(event) => {
                  const sizes = { ...profile.sizes };
                  if (event.target.value) sizes[key] = event.target.value;
                  else delete sizes[key];
                  update({ ...profile, sizes });
                }}
              >
                <option value="">—</option>
                {options.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
          ))}
        </div>
        <p className="style-profile__hint">Butikkene oppgir størrelser ulikt, så sjekk alltid størrelsesguiden hos butikken.</p>
      </div>

      <div className="style-profile__actions">
        <Button type="button" onClick={() => void save()} disabled={loading || saveState === 'saving' || !dirty}>
          {saveState === 'saving' ? <LoaderCircle aria-hidden className="size-4 animate-spin" /> : null}
          Lagre stilprofil
        </Button>
        <span className="style-profile__status" role="status">
          {saveState === 'saved' ? (
            <>
              <Check aria-hidden className="size-4" /> Lagret
            </>
          ) : saveState === 'error' ? (
            'Klarte ikke å lagre på kontoen. Profilen er lagret i denne nettleseren.'
          ) : null}
        </span>
      </div>
    </div>
  );
}
