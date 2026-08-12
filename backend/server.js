const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;
const DB_PATH = path.join(__dirname, 'data', 'athena-db.json');

app.use(cors());
app.use(express.json());

// Ensure DB File Exists
function ensureDb() {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  if (!fs.existsSync(DB_PATH)) {
    const initialData = {
      categories: [
        {
          id: 'cat_elevadores',
          name: 'Elevadores',
          slug: 'elevadores',
          description: 'Elevadores hidráulicos de 2 colunas, 4 colunas e tesoura para automóveis e utilitários.',
          icon: 'Layers'
        },
        {
          id: 'cat_scanners',
          name: 'Scanners',
          slug: 'scanners',
          description: 'Scanners e leitores de diagnóstico automotivo multimarca de última geração com IA.',
          icon: 'Cpu'
        },
        {
          id: 'cat_alinhadores',
          name: 'Alinhadores',
          slug: 'alinhadores',
          description: 'Sistemas de alinhamento de direção 3D computadorizados com câmeras de alta precisão.',
          icon: 'Target'
        },
        {
          id: 'cat_desmontadoras',
          name: 'Desmontadoras & Balanceadoras',
          slug: 'desmontadoras',
          description: 'Equipamentos para serviços de borracharia, desmontadoras pneumáticas e balanceadoras de rodas.',
          icon: 'Disc'
        },
        {
          id: 'cat_ferramentas',
          name: 'Ferramentas Especiais',
          slug: 'ferramentas',
          description: 'Kits de sincronismo, saca-filtros, prensas hidráulicas e ferramentas para centro automotivo.',
          icon: 'Wrench'
        }
      ],
      brands: [
        {
          id: 'brand_engecass',
          name: 'Engecass',
          description: 'Líder nacional em elevadores automotivos de alta resistência.',
          logo: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=200&auto=format&fit=crop&q=80'
        },
        {
          id: 'brand_raven',
          name: 'Raven',
          description: 'Referência em ferramentas especiais e diagnóstico para oficinas.',
          logo: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=200&auto=format&fit=crop&q=80'
        },
        {
          id: 'brand_launch',
          name: 'Launch',
          description: 'Tecnologia global em scanners de diagnóstico e codificação de módulos.',
          logo: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=200&auto=format&fit=crop&q=80'
        },
        {
          id: 'brand_napro',
          name: 'Napro',
          description: 'Pioneira em sistemas informatizados de diagnóstico automotivo.',
          logo: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=200&auto=format&fit=crop&q=80'
        },
        {
          id: 'brand_sun',
          name: 'Sun Equipment',
          description: 'Sistemas de alinhamento 3D e diagnóstico premium.',
          logo: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=200&auto=format&fit=crop&q=80'
        }
      ],
      products: [
        {
          id: 'prod_1',
          name: 'Elevador Automotivo 2 Colunas 4.000kg Trifásico - Engecass',
          categoryId: 'cat_elevadores',
          brandId: 'brand_engecass',
          price: 18900.0,
          priceNegotiable: false,
          badge: 'Mais Vendido',
          image: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&auto=format&fit=crop&q=80',
          description: 'Elevador eletro-hidráulico de 2 colunas com capacidade de carga para 4 toneladas. Ideal para carros de passeio, SUVs e caminhonetes leves.',
          specs: [
            'Capacidade: 4.000 kg',
            'Altura Máxima de Elevação: 1.900 mm',
            'Tempo de Elevação: ~45 segundos',
            'Motor: 3.0 HP Trifásico (220V/380V)',
            'Trava de Segurança: Automática dupla'
          ],
          inStock: true
        },
        {
          id: 'prod_2',
          name: 'Scanner Automotivo Multimarca X-431 PAD VII - Launch',
          categoryId: 'cat_scanners',
          brandId: 'brand_launch',
          price: 24500.0,
          priceNegotiable: false,
          badge: 'Lançamento',
          image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80',
          description: 'Scanner de nível fabril com suporte a protocolos DoIP e CAN-FD. Diagnóstico completo de todos os sistemas eletrônicos.',
          specs: [
            'Tela: 13.3 polegadas IPS Full HD',
            'Processador: 8-Core 2.0GHz + 8GB RAM',
            'Conectividade: Wi-Fi 5GHz + Bluetooth Smart'
          ],
          inStock: true
        },
        {
          id: 'prod_3',
          name: 'Alinhador 3D de Direção Computadorizado com Torre Móvel',
          categoryId: 'cat_alinhadores',
          brandId: 'brand_sun',
          price: 45900.0,
          priceNegotiable: true,
          badge: 'Destaque',
          image: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=800&auto=format&fit=crop&q=80',
          description: 'Alinhador 3D de alta precisão com 2 câmeras digitais de alta resolução e garras de fixação rápida.',
          specs: [
            'Câmeras: 2x Câmeras HD de Alta Velocidade',
            'Garras: Fixação no pneu',
            'Banco de Dados: Mais de 50.000 veículos'
          ],
          inStock: true
        }
      ]
    };
    fs.writeFileSync(DB_PATH, JSON.stringify(initialData, null, 2), 'utf-8');
  }
}

function readDb() {
  ensureDb();
  const raw = fs.readFileSync(DB_PATH, 'utf-8');
  return JSON.parse(raw);
}

function writeDb(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

// Routes
// 1. Categories
app.get('/api/categories', (req, res) => {
  const db = readDb();
  res.json(db.categories || []);
});

app.post('/api/categories', (req, res) => {
  const db = readDb();
  const newCat = { id: `cat_${Date.now()}`, ...req.body };
  db.categories.push(newCat);
  writeDb(db);
  res.status(201).json(newCat);
});

app.delete('/api/categories/:id', (req, res) => {
  const db = readDb();
  db.categories = db.categories.filter((c) => c.id !== req.params.id);
  writeDb(db);
  res.json({ success: true, id: req.params.id });
});

// 2. Brands
app.get('/api/brands', (req, res) => {
  const db = readDb();
  res.json(db.brands || []);
});

app.post('/api/brands', (req, res) => {
  const db = readDb();
  const newBrand = { id: `brand_${Date.now()}`, ...req.body };
  db.brands.push(newBrand);
  writeDb(db);
  res.status(201).json(newBrand);
});

app.put('/api/brands/:id', (req, res) => {
  const db = readDb();
  const index = db.brands.findIndex((b) => b.id === req.params.id);
  if (index !== -1) {
    db.brands[index] = { ...db.brands[index], ...req.body };
    writeDb(db);
    return res.json(db.brands[index]);
  }
  res.status(404).json({ error: 'Marca não encontrada' });
});

app.delete('/api/brands/:id', (req, res) => {
  const db = readDb();
  db.brands = db.brands.filter((b) => b.id !== req.params.id);
  writeDb(db);
  res.json({ success: true, id: req.params.id });
});

// 3. Products
app.get('/api/products', (req, res) => {
  const db = readDb();
  res.json(db.products || []);
});

app.post('/api/products', (req, res) => {
  const db = readDb();
  const newProduct = { id: `prod_${Date.now()}`, ...req.body };
  db.products.unshift(newProduct);
  writeDb(db);
  res.status(201).json(newProduct);
});

app.put('/api/products/:id', (req, res) => {
  const db = readDb();
  const index = db.products.findIndex((p) => p.id === req.params.id);
  if (index !== -1) {
    db.products[index] = { ...db.products[index], ...req.body };
    writeDb(db);
    return res.json(db.products[index]);
  }
  res.status(404).json({ error: 'Produto não encontrado' });
});

app.delete('/api/products/:id', (req, res) => {
  const db = readDb();
  db.products = db.products.filter((p) => p.id !== req.params.id);
  writeDb(db);
  res.json({ success: true, id: req.params.id });
});

app.listen(PORT, () => {
  console.log(`🚀 Athena API Backend rodando em http://localhost:${PORT}/api`);
});
