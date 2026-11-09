import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { 
  isProductEligibleForRecommendation, 
  getCompatibleProducts, 
  getRecommendedProducts 
} from '../../src/utils/recommendationEngine.js';

describe('Athena Recommendation Engine — Unit Test Suite (Pacote B)', () => {

  const baseImage = 'https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/produtos/test.webp';

  const mockCatalog = [
    {
      id: 'prod_elevador_1001',
      name: 'Elevador 2 Colunas 4T MAH-1001',
      slug: 'elevador-mah-1001',
      categoryId: 'cat_elevadores',
      brandId: 'brand_mahovi',
      status: 'published',
      image: baseImage,
      commercial_mode: 'technical_consultative',
      compatibleProductIds: ['prod_suporte_u', 'prod_tapete_borracha'],
      recommendedProductIds: ['prod_rampa_3001']
    },
    {
      id: 'prod_suporte_u',
      name: 'Viga U de Apoio para Elevador',
      slug: 'viga-u-elevador',
      categoryId: 'cat_acessorios',
      brandId: 'brand_mahovi',
      status: 'published',
      image: baseImage,
      commercial_mode: 'direct_sale',
      price: 450
    },
    {
      id: 'prod_tapete_borracha',
      name: 'Kit de Tapetes de Borracha para MAH-1001',
      slug: 'kit-tapetes-mah-1001',
      categoryId: 'cat_acessorios',
      brandId: 'brand_mahovi',
      status: 'published',
      image: baseImage,
      commercial_mode: 'direct_sale',
      price: 250
    },
    {
      id: 'prod_rampa_3001',
      name: 'Rampa de Alinhamento 4.5T MAH-3001',
      slug: 'rampa-alinhamento-mah-3001',
      categoryId: 'cat_elevadores',
      brandId: 'brand_mahovi',
      status: 'published',
      image: baseImage,
      commercial_mode: 'technical_consultative'
    },
    {
      id: 'prod_elevador_portico',
      name: 'Elevador Pórtico 4.2T MAH-1010',
      slug: 'elevador-portico-mah-1010',
      categoryId: 'cat_elevadores',
      brandId: 'brand_mahovi',
      status: 'published',
      image: baseImage,
      commercial_mode: 'technical_consultative'
    },
    {
      id: 'prod_desmontadora_5001',
      name: 'Desmontadora de Pneus MAH-5001',
      slug: 'desmontadora-pneus-mah-5001',
      categoryId: 'cat_borracharia',
      brandId: 'brand_mahovi',
      status: 'published',
      image: baseImage,
      commercial_mode: 'technical_consultative'
    },
    {
      id: 'prod_inbound_accessory',
      name: 'Adaptador de Chassi Especial',
      slug: 'adaptador-chassi',
      categoryId: 'cat_acessorios',
      brandId: 'brand_mahovi',
      status: 'published',
      image: baseImage,
      commercial_mode: 'direct_sale',
      price: 320,
      compatibleProductIds: ['prod_elevador_1001'] // Aponta para o elevador (inbound)
    },
    {
      id: 'prod_draft_item',
      name: 'Produto em Rascunho',
      slug: 'produto-rascunho',
      categoryId: 'cat_elevadores',
      brandId: 'brand_mahovi',
      status: 'draft',
      image: baseImage
    },
    {
      id: 'prod_no_image',
      name: 'Produto Sem Foto',
      slug: 'produto-sem-foto',
      categoryId: 'cat_elevadores',
      brandId: 'brand_mahovi',
      status: 'published',
      image: ''
    }
  ];

  describe('1. Elegibilidade Estrita de Recomendações', () => {
    it('deve aprovar produto publicado com foto e modalidade comercial válida', () => {
      const prod = mockCatalog[0];
      assert.equal(isProductEligibleForRecommendation(prod), true);
    });

    it('deve rejeitar produtos com status diferente de published (ex: draft)', () => {
      const draftProd = mockCatalog.find(p => p.id === 'prod_draft_item');
      assert.equal(isProductEligibleForRecommendation(draftProd), false);
    });

    it('deve rejeitar produtos sem imagem válida', () => {
      const noImgProd = mockCatalog.find(p => p.id === 'prod_no_image');
      assert.equal(isProductEligibleForRecommendation(noImgProd), false);
    });

    it('deve rejeitar valores nulos ou vazios', () => {
      assert.equal(isProductEligibleForRecommendation(null), false);
      assert.equal(isProductEligibleForRecommendation(undefined), false);
      assert.equal(isProductEligibleForRecommendation({}), false);
    });
  });

  describe('2. Compatibilidade Técnica Real (getCompatibleProducts)', () => {
    it('deve retornar acessórios diretos e vínculos recíprocos (inbound)', () => {
      const current = mockCatalog[0]; // prod_elevador_1001
      const compat = getCompatibleProducts({ currentProduct: current, allProducts: mockCatalog });

      const compatIds = compat.map(p => p.id);
      assert.ok(compatIds.includes('prod_suporte_u'), 'Deve incluir viga U');
      assert.ok(compatIds.includes('prod_tapete_borracha'), 'Deve incluir kit de tapetes');
      assert.ok(compatIds.includes('prod_inbound_accessory'), 'Deve incluir o acessório que aponta inbound');
      assert.equal(compatIds.includes('prod_elevador_1001'), false, 'Nunca deve incluir o próprio produto');
    });

    it('deve filtrar produtos não elegíveis da lista de compatíveis', () => {
      const current = {
        id: 'prod_test',
        name: 'Equipamento Teste',
        compatibleProductIds: ['prod_draft_item', 'prod_suporte_u']
      };
      const compat = getCompatibleProducts({ currentProduct: current, allProducts: mockCatalog });
      const compatIds = compat.map(p => p.id);

      assert.ok(compatIds.includes('prod_suporte_u'));
      assert.equal(compatIds.includes('prod_draft_item'), false, 'Não pode incluir item em rascunho');
    });
  });

  describe('3. Recomendações e Transparência Editorial (getRecommendedProducts)', () => {
    it('deve priorizar itens curados (recommendedProductIds)', () => {
      const current = mockCatalog[0]; // prod_elevador_1001 (recomenda rampa_3001)
      const res = getRecommendedProducts({ currentProduct: current, allProducts: mockCatalog, limit: 3 });

      assert.equal(res.curated.length, 1);
      assert.equal(res.curated[0].id, 'prod_rampa_3001');
      assert.equal(res.all[0].id, 'prod_rampa_3001', 'O item curado deve ser a primeira recomendação');
      assert.equal(res.sectionTitle, 'Produtos Recomendados');
    });

    it('deve rotular honestamente como "Outros Produtos da Categoria" quando não há curadoria', () => {
      const currentWithoutCurated = {
        id: 'prod_elevador_portico',
        name: 'Elevador Pórtico 4.2T MAH-1010',
        categoryId: 'cat_elevadores',
        brandId: 'brand_mahovi',
        recommendedProductIds: [] // Sem curadoria manual
      };

      const res = getRecommendedProducts({ currentProduct: currentWithoutCurated, allProducts: mockCatalog, limit: 3 });
      
      assert.equal(res.curated.length, 0);
      assert.ok(res.categoryFallbacks.length > 0, 'Deve preencher com fallbacks da mesma categoria');
      assert.equal(res.sectionTitle, 'Outros Produtos da Categoria', 'Título deve ser transparente');
    });

    it('deve rotular honestamente como "Mais desta Marca" se só houver produtos da marca de outras categorias', () => {
      const currentUniqueCategory = {
        id: 'prod_unique',
        name: 'Item Categoria Única',
        categoryId: 'cat_categoria_sem_outros_itens',
        brandId: 'brand_mahovi',
        recommendedProductIds: []
      };

      const res = getRecommendedProducts({ currentProduct: currentUniqueCategory, allProducts: mockCatalog, limit: 3 });
      
      assert.equal(res.categoryFallbacks.length, 0);
      assert.ok(res.brandFallbacks.length > 0);
      assert.equal(res.sectionTitle, 'Mais desta Marca');
    });

    it('nunca deve incluir o produto atual nem duplicados no array all', () => {
      const current = mockCatalog[0];
      const res = getRecommendedProducts({ currentProduct: current, allProducts: mockCatalog, limit: 10 });

      assert.equal(res.all.some(p => p.id === current.id), false);
      const uniqueIds = new Set(res.all.map(p => p.id));
      assert.equal(uniqueIds.size, res.all.length, 'Não pode haver duplicatas');
    });
  });

});
