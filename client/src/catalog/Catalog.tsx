import { useMemo, useState } from 'react';
import '../styles/Catalog.css';

export interface Review {
    id: number;
    product: string;
    brand: string;
    category: string;
    title: string;
    snippet: string;
}

/* -------------------------------------------------------------------------- */
/*  ⚠️  Replace this with a real fetch once the BE endpoint is ready           */
/* -------------------------------------------------------------------------- */
const DUMMY_REVIEWS: Review[] = [
    {
        id: 1,
        product: 'Noise‑Canceling Headphones X500',
        brand: 'SoundWave',
        category: 'Electronics',
        title: 'Surprisingly good build for the price',
        snippet: 'ANC rivals the big brands — battery life is stellar…'
    },
    {
        id: 2,
        product: 'Smart Air Purifier Pro',
        brand: 'EcoHome',
        category: 'Home',
        title: 'Quiet and effective',
        snippet: 'Removes smoke smell in under 10 minutes; app is intuitive.'
    },
    {
        id: 3,
        product: 'Vitamin C Brightening Serum',
        brand: 'PureGlow',
        category: 'Beauty',
        title: 'Glowy skin in two weeks',
        snippet: 'Texture absorbs fast; no sticky residue or fragrance.'
    },
    {
        id: 4,
        product: 'Ultralight Trekking Poles',
        brand: 'TrailEdge',
        category: 'Outdoors',
        title: 'Saved my knees on a 20‑mile hike',
        snippet: 'Shock absorption is legit; adjustment locks stay tight.'
    }
];

const CATEGORIES = ['All', 'Electronics', 'Home', 'Beauty', 'Outdoors'] as const;
const BRANDS = ['All', 'SoundWave', 'EcoHome', 'PureGlow', 'TrailEdge'] as const;

const Catalog = () => {
    const [keyword, setKeyword] = useState('');
    const [category, setCategory] = useState<typeof CATEGORIES[number]>('All');
    const [brand, setBrand] = useState<typeof BRANDS[number]>('All');

    const filtered = useMemo(() => {
        const kw = keyword.trim().toLowerCase();

        return DUMMY_REVIEWS.filter(r => {
            const kwMatch =
                kw === '' ||
                r.title.toLowerCase().includes(kw) ||
                r.product.toLowerCase().includes(kw) ||
                r.snippet.toLowerCase().includes(kw);

            const catMatch = category === 'All' || r.category === category;
            const brandMatch = brand === 'All' || r.brand === brand;

            return kwMatch && catMatch && brandMatch;
        });
    }, [keyword, category, brand]);

    /* ---------------------------------------------------------------------- */
    /*  Render                                                                */
    /* ---------------------------------------------------------------------- */
    return (
        <section className="catalog" aria-labelledby="catalog-heading">
            <h2 id="catalog-heading">Browse Reviews</h2>

            {/* ---------- Filter / Search toolbar ---------- */}
            <form
                className="toolbar"
                onSubmit={e => e.preventDefault()}
                aria-label="Review filters"
            >
                <input
                    type="search"
                    placeholder="Search keywords…"
                    value={keyword}
                    onChange={e => setKeyword(e.target.value)}
                    aria-label="Keyword search"
                />

                <select
                    value={category}
                    onChange={e => setCategory(e.target.value as typeof category)}
                    aria-label="Filter by category"
                >
                    {CATEGORIES.map(c => (
                        <option key={c}>{c}</option>
                    ))}
                </select>

                <select
                    value={brand}
                    onChange={e => setBrand(e.target.value as typeof brand)}
                    aria-label="Filter by brand"
                >
                    {BRANDS.map(b => (
                        <option key={b}>{b}</option>
                    ))}
                </select>
            </form>

            {/* ---------- Hint / result count ---------- */}
            {keyword === '' && category === 'All' && brand === 'All' ? (
                <p className="hint">Recommended for you (sample data below)</p>
            ) : (
                <p className="hint">
                    Showing&nbsp;
                    <strong>{filtered.length}</strong>&nbsp;
                    result{filtered.length !== 1 && 's'}
                </p>
            )}

            {/* ---------- Review grid ---------- */}
            <ul className="review-grid">
                {filtered.map(r => (
                    <li key={r.id} className="review-card">
                        <h3 className="review-title">{r.title}</h3>
                        <p className="product-meta">
                            {r.brand} • {r.product}
                        </p>
                        <p className="snippet">{r.snippet}</p>
                    </li>
                ))}
            </ul>
        </section>
    );
};

export default Catalog;
