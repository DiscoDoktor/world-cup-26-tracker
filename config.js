// Browser-safe Supabase config. These two values are PUBLIC by design:
// the publishable (anon) key can only do what Row Level Security allows.
// NEVER put the service_role / secret key or the database password here.
window.WC_CONFIG = {
  SUPABASE_URL: 'https://tbkodolfmozvpwfaqsxg.supabase.co',
  SUPABASE_KEY: 'sb_publishable_qgJuBhi-MdH-_0TyIm6R8Q_QXhO_ciQ'
};
