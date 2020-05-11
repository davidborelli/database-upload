import { getRepository, getCustomRepository } from 'typeorm';

import TransactionRepository from '../repositories/TransactionsRepository';
import Transaction from '../models/Transaction';
import Category from '../models/Category';
import AppError from '../errors/AppError';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: 'string';
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    const transactionRepository = getCustomRepository(TransactionRepository);
    const categoryRepository = getRepository(Category);

    const { total } = await transactionRepository.getBalance();

    if (type === 'outcome' && value > total) {
      throw new AppError('Sem saldo');
    }

    let locatedCategory = await categoryRepository.findOne({
      where: {
        title: category,
      },
    });

    if (!locatedCategory) {
      locatedCategory = categoryRepository.create({
        title: category,
      });

      await categoryRepository.save(locatedCategory);
    }

    const transaction = transactionRepository.create({
      title,
      value,
      type,
      category: locatedCategory,
    });

    await transactionRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
