-- Insertar un producto de ejemplo para la sección de Artículos Deportivos
-- Este producto puede ser eliminado desde el panel admin cuando se carguen productos reales

INSERT INTO products (
  name,
  description,
  detailed_description,
  category,
  price,
  original_price,
  stock,
  image_url,
  status,
  sales,
  is_new,
  created_at
)
VALUES (
  'Pelota Oficial Newcom - Ejemplo',
  'Pelota oficial para la práctica del deporte Newcom. Material de alta calidad, perfecta para entrenamientos y competencias.',
  'Pelota diseñada específicamente para el deporte Newcom, cumpliendo con todas las especificaciones del reglamento oficial. Fabricada con materiales resistentes y duraderos. Ideal para entrenamientos, prácticas y competencias oficiales. 

**Características técnicas:**
- Peso: 260-280 gramos
- Circunferencia: 65-67 cm
- Material: Cuero sintético de alta calidad
- Color: Blanco con detalles azules
- Incluye: Inflador manual

**Envío:** Acordar por WhatsApp (próximamente calculador de envíos)',
  'Fisico',
  15000,
  NULL,
  50,
  'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&q=80',
  'active',
  0,
  true,
  NOW()
)
ON CONFLICT DO NOTHING;
