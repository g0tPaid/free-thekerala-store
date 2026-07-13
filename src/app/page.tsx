export const dynamic = 'force-dynamic';

/** Temporary minimal homepage to isolate production 500s. */
export default function Home() {
  return (
    <main style={{ minHeight: '100vh', padding: 24, fontFamily: 'system-ui' }}>
      <h1 style={{ fontSize: 28, margin: 0 }}>The Kerala Store</h1>
      <p style={{ marginTop: 12 }}>
        Store is up. Full catalog UI is being restored.
      </p>
      <p style={{ marginTop: 8 }}>
        <a href="/wishlist">Wishlist</a>
        {' · '}
        <a href="/checkout">Checkout</a>
        {' · '}
        <a href="/admin/login">Admin</a>
      </p>
    </main>
  );
}
