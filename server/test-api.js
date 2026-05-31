const testData = {
  name: 'Test Product',
  type: 'product',
  price: '100.00',
  isActive: true
};

fetch('http://localhost:3000/api/products', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(testData)
})
.then(r => r.json())
.then(console.log)
.catch(console.error);
