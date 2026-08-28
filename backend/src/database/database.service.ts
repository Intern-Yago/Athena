import { Injectable, OnModuleInit } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon?: string;
}

export interface Brand {
  id: string;
  name: string;
  description: string;
  logo?: string;
}

export interface Product {
  id: string;
  name: string;
  categoryId: string;
  brandId: string;
  price: number;
  priceNegotiable: boolean;
  badge?: string;
  image?: string;
  images?: string[];
  altText?: string;
  description: string;
  specs: string[];
  attachments?: Array<{ id: string; name?: string; title?: string; fileName?: string; url: string; fileSize?: string }>;
  inStock?: boolean;
  videoUrl?: string;
  customTabs?: Array<{ id: string; title: string; content: string }>;
}

export interface DatabaseData {
  categories: Category[];
  brands: Brand[];
  products: Product[];
}

@Injectable()
export class DatabaseService implements OnModuleInit {
  private dbPath = path.join(process.cwd(), 'data', 'athena-db.json');
  private data: DatabaseData = {
    categories: [],
    brands: [],
    products: []
  };

  onModuleInit() {
    this.ensureDirectoryAndFile();
    this.loadData();
  }

  private ensureDirectoryAndFile() {
    const dir = path.dirname(this.dbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    if (!fs.existsSync(this.dbPath)) {
      // Initial Seed Data
      const initialSeed: DatabaseData = {
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
            description: 'Scanner de nível fabril com suporte a protocolos DoIP e CAN-FD. Diagnóstico completo de todos os sistemas eletrônicos e codificação de módulos.',
            specs: [
              'Tela: 13.3 polegadas IPS Full HD',
              'Processador: 8-Core 2.0GHz + 8GB RAM',
              'Conectividade: Wi-Fi 5GHz + Bluetooth Smart',
              'Suporte: Leves, Pesados e Híbridos/Elétricos'
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
              'Garras: Fixação no pneu (não risca as rodas)',
              'Banco de Dados: Mais de 50.000 veículos'
            ],
            inStock: true
          }
        ]
      };
      fs.writeFileSync(this.dbPath, JSON.stringify(initialSeed, null, 2), 'utf-8');
    }
  }

  private loadData() {
    try {
      const content = fs.readFileSync(this.dbPath, 'utf-8');
      this.data = JSON.parse(content);
    } catch (e) {
      console.error('Erro ao carregar banco de dados JSON:', e);
    }
  }

  private saveData() {
    try {
      fs.writeFileSync(this.dbPath, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (e) {
      console.error('Erro ao salvar banco de dados JSON:', e);
    }
  }

  // Categories Methods
  getCategories(): Category[] {
    return this.data.categories;
  }

  createCategory(category: Category): Category {
    this.data.categories.push(category);
    this.saveData();
    return category;
  }

  deleteCategory(id: string): boolean {
    const initialLen = this.data.categories.length;
    this.data.categories = this.data.categories.filter((c) => c.id !== id);
    if (this.data.categories.length !== initialLen) {
      this.saveData();
      return true;
    }
    return false;
  }

  // Brands Methods
  getBrands(): Brand[] {
    return this.data.brands;
  }

  createBrand(brand: Brand): Brand {
    this.data.brands.push(brand);
    this.saveData();
    return brand;
  }

  deleteBrand(id: string): boolean {
    const initialLen = this.data.brands.length;
    this.data.brands = this.data.brands.filter((b) => b.id !== id);
    if (this.data.brands.length !== initialLen) {
      this.saveData();
      return true;
    }
    return false;
  }

  // Products Methods
  getProducts(): Product[] {
    return this.data.products;
  }

  createProduct(product: Product): Product {
    this.data.products.unshift(product);
    this.saveData();
    return product;
  }

  updateProduct(id: string, updated: Partial<Product>): Product | null {
    const index = this.data.products.findIndex((p) => p.id === id);
    if (index !== -1) {
      this.data.products[index] = { ...this.data.products[index], ...updated };
      this.saveData();
      return this.data.products[index];
    }
    return null;
  }

  deleteProduct(id: string): boolean {
    const initialLen = this.data.products.length;
    this.data.products = this.data.products.filter((p) => p.id !== id);
    if (this.data.products.length !== initialLen) {
      this.saveData();
      return true;
    }
    return false;
  }
}
