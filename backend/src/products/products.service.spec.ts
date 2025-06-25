import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { PrismaService } from '../prisma/prisma.service';
import { ConflictException, BadRequestException, UnprocessableEntityException } from '@nestjs/common';
import { CouponType } from '@prisma/client';

// Criamos um mock do PrismaService. Todas as chamadas ao banco serão interceptadas por este objeto.
const dbMock = {
  product: {
    findUniqueOrThrow: jest.fn(),
    // Adicione outras funções que serão usadas nos testes aqui
  },
  coupon: {
    findUniqueOrThrow: jest.fn(),
  },
  productCouponApplication: {
    findFirst: jest.fn(),
    create: jest.fn(),
  },
  // O $transaction precisa ser mockado para simplesmente executar a função que recebe
  $transaction: jest.fn().mockImplementation(callback => callback(dbMock)),
};

describe('ProductsService', () => {
  let service: ProductsService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: PrismaService,
          useValue: dbMock, // Usamos nosso mock em vez do PrismaService real
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    prisma = module.get<PrismaService>(PrismaService);

    // Limpa os mocks antes de cada teste para garantir que um teste não interfira no outro
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // Nossos testes virão aqui!
  describe('applyCoupon', () => {
  it('should apply a valid coupon to a product successfully', async () => {
    // Arrange: Preparamos os dados e os retornos dos mocks
    const mockProduct = { id: 1, price: 100.00 };
    const mockCoupon = { 
      id: 1, 
      code: 'PROMO10', 
      type: CouponType.percent, 
      value: 10, 
      validFrom: new Date('2025-01-01'), 
      validUntil: new Date('2025-12-31') 
    };

    // Dizemos aos mocks o que retornar quando forem chamados
    dbMock.product.findUniqueOrThrow.mockResolvedValue(mockProduct);
    dbMock.coupon.findUniqueOrThrow.mockResolvedValue(mockCoupon);
    dbMock.productCouponApplication.findFirst.mockResolvedValue(null); // Nenhum desconto existente
    dbMock.productCouponApplication.create.mockResolvedValue({ id: 1, productId: 1, couponId: 1 });
    // O findOne no final também precisa ser mockado
    jest.spyOn(service, 'findOne').mockResolvedValue(mockProduct as any);
    
    // Act: Executamos a função que queremos testar
    await service.applyCoupon(1, { code: 'PROMO10' });

    // Assert: Verificamos se tudo ocorreu como esperado
    expect(dbMock.productCouponApplication.create).toHaveBeenCalled();
    expect(dbMock.productCouponApplication.create).toHaveBeenCalledWith({
      data: {
        productId: mockProduct.id,
        couponId: mockCoupon.id,
      },
    });
  });


  it('should throw ConflictException if product already has an active discount', async () => {
    // Arrange
    const mockProduct = { id: 1, price: 100.00 };
    const existingApplication = { id: 1, productId: 1, couponId: 2 };
    
    dbMock.product.findUniqueOrThrow.mockResolvedValue(mockProduct);
    dbMock.productCouponApplication.findFirst.mockResolvedValue(existingApplication); // Já existe um desconto!

    // Act & Assert
    // Verificamos se a chamada à função REJEITA a promise e lança o erro esperado
    await expect(service.applyCoupon(1, { code: 'TENTADENOVO' })).rejects.toThrow(ConflictException);
});

it('should throw BadRequestException if coupon is expired', async () => {
    // Arrange
    const mockProduct = { id: 1, price: 100.00 };
    const expiredCoupon = { 
      id: 2, 
      code: 'EXPIRADO', 
      type: CouponType.percent, 
      value: 10, 
      validFrom: new Date('2022-01-01'), 
      validUntil: new Date('2023-12-31') // Data no passado
    };
    
    dbMock.product.findUniqueOrThrow.mockResolvedValue(mockProduct);
    dbMock.productCouponApplication.findFirst.mockResolvedValue(null);
    dbMock.coupon.findUniqueOrThrow.mockResolvedValue(expiredCoupon);

    // Act & Assert
    await expect(service.applyCoupon(1, { code: 'EXPIRADO' })).rejects.toThrow(BadRequestException);
});

it('should throw UnprocessableEntityException if discount makes price below 0.01', async () => {
    // Arrange
    const mockProduct = { id: 1, price: 50.00 };
    const largeDiscountCoupon = {
      id: 3,
      code: 'DESCONTAO',
      type: CouponType.fixed,
      value: 50.00, // Preço R$50, desconto R$50 -> preço final R$0
      validFrom: new Date('2025-01-01'),
      validUntil: new Date('2025-12-31'),
    };
    
    dbMock.product.findUniqueOrThrow.mockResolvedValue(mockProduct);
    dbMock.productCouponApplication.findFirst.mockResolvedValue(null);
    dbMock.coupon.findUniqueOrThrow.mockResolvedValue(largeDiscountCoupon);

    // Act & Assert
    await expect(service.applyCoupon(1, { code: 'DESCONTAO' })).rejects.toThrow(UnprocessableEntityException);
});
});

});