import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Seller } from '../../users';
import { Product } from '../entities';
import {
  CreateProductsBodyReq,
  CreateProductsParamsReq,
  DeleteProductParamsReq,
  DeleteProductsBodyReq,
  DeleteProductsParamsReq,
  ProductRes,
  ProductsRes,
  ReadProductParamsReq,
  ReadProductsParamsReq,
  UpdateProductBodyReq,
  UpdateProductParamsReq,
  UpdateProductsBodyReq,
  UpdateProductsParamsReq,
} from '../dtos';

@Injectable()
export class ProductsService {
  public constructor(
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,

    @InjectRepository(Seller)
    private readonly sellersRepository: Repository<Seller>,
  ) {}

  public async createProducts(
    id: CreateProductsParamsReq,
    products: CreateProductsBodyReq,
  ): Promise<ProductsRes> {
    const seller = await this.sellersRepository.findOneOrFail({
      id: id.sellerId,
    });

    const results = await this.productsRepository.save(
      await Promise.all(
        products.map(async (product) => {
          return this.productsRepository.create({
            ...product,
            seller: seller,
          });
        }),
      ),
    );

    return results.map((result) => {
      return {
        id: result.id,
        sellerId: result.seller.id,
        name: result.name,
        description: result.description,
        price: result.price,
        stock: result.stock,
      };
    });
  }

  public async readProduct(id: ReadProductParamsReq): Promise<ProductRes> {
    const seller = await this.sellersRepository.findOneOrFail({
      id: id.sellerId,
    });

    const result = await this.productsRepository.findOneOrFail(id.productId, {
      where: { seller: seller },
      relations: ['seller'],
    });

    return {
      id: result.id,
      sellerId: result.seller.id,
      name: result.name,
      description: result.description,
      price: result.price,
      stock: result.stock,
    };
  }

  public async readProducts(id: ReadProductsParamsReq): Promise<ProductsRes> {
    const seller = await this.sellersRepository.findOneOrFail({
      id: id.sellerId,
    });

    const results = await this.productsRepository.find({
      where: { seller: seller },
      relations: ['seller'],
    });

    return results.map((result) => {
      return {
        id: result.id,
        sellerId: result.seller.id,
        name: result.name,
        description: result.description,
        price: result.price,
        stock: result.stock,
      };
    });
  }

  public async updateProduct(
    id: UpdateProductParamsReq,
    product: UpdateProductBodyReq,
  ): Promise<ProductRes> {
    const seller = await this.sellersRepository.findOneOrFail({
      id: id.sellerId,
    });

    const oldProduct = await this.productsRepository.findOneOrFail(
      { id: id.productId },
      { where: { seller: seller }, relations: ['seller'] },
    );

    const result = await this.productsRepository.save(
      this.productsRepository.create({
        ...oldProduct,
        ...product,
      }),
    );

    return {
      id: result.id,
      sellerId: result.seller.id,
      name: result.name,
      description: result.description,
      price: result.price,
      stock: result.stock,
    };
  }

  public async updateProducts(
    id: UpdateProductsParamsReq,
    products: UpdateProductsBodyReq,
  ): Promise<ProductsRes> {
    const seller = await this.sellersRepository.findOneOrFail({
      id: id.sellerId,
    });

    const results = await this.productsRepository.save(
      await Promise.all(
        products.map(async (product) => {
          const oldProduct = await this.productsRepository.findOneOrFail(
            { id: product.id },
            { where: { seller: seller }, relations: ['seller'] },
          );

          return this.productsRepository.create({
            ...oldProduct,
            ...product,
          });
        }),
      ),
    );

    return results.map((result) => {
      return {
        id: result.id,
        sellerId: result.seller.id,
        name: result.name,
        description: result.description,
        price: result.price,
        stock: result.stock,
      };
    });
  }

  public async deleteProduct(id: DeleteProductParamsReq): Promise<void> {
    const seller = await this.sellersRepository.findOneOrFail({
      id: id.sellerId,
    });

    await this.productsRepository.remove(
      await this.productsRepository.findOneOrFail(
        { id: id.productId },
        { where: { seller: seller } },
      ),
    );
  }

  public async deleteProducts(
    id: DeleteProductsParamsReq,
    products: DeleteProductsBodyReq,
  ): Promise<void> {
    const seller = await this.sellersRepository.findOneOrFail({
      id: id.sellerId,
    });

    await this.productsRepository.remove(
      await Promise.all(
        products.map(async (product) => {
          return await this.productsRepository.findOneOrFail(
            { id: product.id },
            { where: { seller: seller } },
          );
        }),
      ),
    );
  }
}
