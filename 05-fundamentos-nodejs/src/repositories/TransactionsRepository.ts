import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

interface CreateTransactionDTO {
  title: string;
  value: number;
  type: 'income' | 'outcome';
}

class TransactionsRepository {
  private transactions: Transaction[];

  constructor() {
    this.transactions = [];
  }

  public all(): Transaction[] {
    return this.transactions;
  }

  public getBalance(): Balance {
    const incomeTransactions = this.transactions.filter(transaction => {
      return transaction.type === 'income';
    });

    const incomeValues = incomeTransactions.map(
      transaction => transaction.value,
    );

    const income = incomeValues.reduce(
      (accumulator, currentValue) => accumulator + currentValue,
      0,
    );

    const outcomeTransactions = this.transactions.filter(transaction => {
      return transaction.type === 'outcome';
    });

    const outcomeValues = outcomeTransactions.map(
      transaction => transaction.value,
    );

    const outcome = outcomeValues.reduce(
      (accumulator, currentValue) => accumulator + currentValue,
      0,
    );

    const total = income - outcome;

    return {
      income,
      outcome,
      total,
    };
  }

  public create({ title, value, type }: CreateTransactionDTO): Transaction {
    const transaction = new Transaction({ title, value, type });

    this.transactions.push(transaction);

    return transaction;
  }
}

export default TransactionsRepository;
