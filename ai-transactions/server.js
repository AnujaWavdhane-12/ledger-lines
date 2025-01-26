const express = require('express');
const faker = require('faker');

const app = express();
const port = 3005;

// Generate a random transaction
function generateTransaction() {
  return {
    transaction_id: faker.datatype.number(),
    date: '2022-01-01',
    description: faker.commerce.productName(),
    amount: parseFloat(faker.finance.amount()),
    merchant_name: faker.company.companyName(),
    category: faker.random.arrayElement([
      'Food & Dining',
      'Shopping',
      'Travel',
      'Bills & Utilities',
      'Entertainment',
      'Auto & Transport'
    ]),
    pending: faker.datatype.boolean(),
    city_state: `${faker.address.city()}, ${faker.address.stateAbbr()}`
  };
}

// GET /transactions endpoint
app.get('/transactions', (req, res) => {
  // Generate between 5 and 15 random transactions
  const count = faker.datatype.number({ min: 5, max: 15 });
  const transactions = Array.from({ length: count }, generateTransaction);
  res.json(transactions);
});

app.listen(port, () => {
  console.log(`Transactions service running at http://localhost:${port}`);
});
