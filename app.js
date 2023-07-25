const express = require('express');
const app = express();
const port = 3000;

app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use('/public', express.static('public'));

// Function to calculate sales tax based on province
function calculateSalesTax(province, amount) {
    const taxRates = {
      'alberta': 0.05,
      'british columbia': 0.12,
      'manitoba': 0.13,
      'new brunswick': 0.15,
      'newfoundland and labrador': 0.15,
      'northwest territories': 0.05,
      'nova scotia': 0.15,
      'nunavut': 0.05,
      'ontario': 0.13,
      'prince edward island': 0.15,
      'quebec': 0.14975,
      'saskatchewan': 0.11,
      'yukon': 0.05,
    };

  const lowercaseProvince = province.toLowerCase();
  const taxRate = taxRates[lowercaseProvince] || 0;
  return amount * taxRate;
}


// Render the index page with the web form
app.get('/', (req, res) => {
  res.render('index', { errors: [] });
});

// POST route for form submission
app.post('/process', (req, res) => {
  const { name, address, city, province, phone, email, products } = req.body;
  let errors = [];
  const selectedProducts = Array.isArray(products) ? products : [products];

  // Checking for mandatory fields
  if (!name || !address || !city || !province || !phone || !email) {
    errors.push('Please fill out all the required fields.');
  }

  // Validating phone number format (using a simple regex)
  const phoneNumberPattern = /^\d{10}$/;
  if (!phoneNumberPattern.test(phone)) {
    errors.push('Invalid phone number. Please enter a 10-digit number without spaces or dashes.');
  }

  // Validating email format (using a simple regex)
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email)) {
    errors.push('Invalid email address. Please enter a valid email.');
  }

  // If any errors exist, it displays them to the user
  if (errors.length > 0) {
    return res.render('index', { errors });
  }

  // Calculating total purchase amount and products bought
  let totalAmount = 0;
  let productsBought = [];

  const productPrices = {
    apple: 5,
    orange: 4,
    mango: 4,
    banana: 6,
  };

  selectedProducts.forEach((product) => {
    const price = productPrices[product] || 0;
    totalAmount += price;
    productsBought.push(`${product} ($${price})`);
  });

  // Checking minimum purchase amount (excluding tax)
  const minimumPurchaseAmountWithoutTax = 10;
  if (totalAmount < minimumPurchaseAmountWithoutTax) {
    return res.send(`Minimum purchase should be at least $${minimumPurchaseAmountWithoutTax} before tax.`);
  }

  // Calculating sales tax
  const salesTax = calculateSalesTax(province, totalAmount);

  // Generating the receipt data
  const receiptData = {
    name,
    address,
    city,
    province,
    phone,
    email,
    productsBought,
    totalAmount,
    salesTax,
    grandTotal: totalAmount + salesTax,
  };

  // Render the receipt template with receiptData
  res.render('receipt', { receiptData });
});

//Starting the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
