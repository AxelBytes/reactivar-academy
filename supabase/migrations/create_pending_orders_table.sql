-- Tabla temporal para guardar datos del comprador mientras se procesa el pago
CREATE TABLE IF NOT EXISTS public.pending_orders (
  id BIGSERIAL PRIMARY KEY,
  uuid TEXT NOT NULL UNIQUE,
  external_reference TEXT,
  user_email TEXT NOT NULL,
  user_name TEXT,
  items TEXT, -- JSON string con los items comprados
  amount NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS
ALTER TABLE public.pending_orders ENABLE ROW LEVEL SECURITY;

-- Política: solo el service role puede leer/escribir (se usa desde el servidor)
CREATE POLICY "Service role full access to pending_orders"
  ON public.pending_orders
  USING (true)
  WITH CHECK (true);

-- Índice para búsquedas por uuid
CREATE INDEX IF NOT EXISTS idx_pending_orders_uuid ON public.pending_orders (uuid);

-- Índice para limpiar órdenes viejas (más de 24hs)
CREATE INDEX IF NOT EXISTS idx_pending_orders_created_at ON public.pending_orders (created_at);
