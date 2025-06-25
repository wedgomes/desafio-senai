import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';

// Vamos criar um mock do serviço inteiro.
// Não nos importamos com o que ele faz, apenas se o controller o chama.
const productsServiceMock = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  restore: jest.fn(),
  applyCoupon: jest.fn(),
  removeDiscount: jest.fn(),
};

describe('ProductsController', () => {
  let controller: ProductsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [
        // Em vez de fornecer o ProductsService real e todas as suas dependências,
        // nós o substituímos diretamente pelo nosso mock.
        {
          provide: ProductsService,
          useValue: productsServiceMock,
        },
      ],
    }).compile();

    controller = module.get<ProductsController>(ProductsController);
  });

  // O teste padrão gerado pela CLI agora deve funcionar
  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // Aqui poderíamos adicionar outros testes, por exemplo:
  // it('should call the create method on the service when creating a product', () => {
  //   const createDto = { name: 'Test', price: 10, stock: 10 };
  //   controller.create(createDto);
  //   expect(productsServiceMock.create).toHaveBeenCalledWith(createDto);
  // });
});