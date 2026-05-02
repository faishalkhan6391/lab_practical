const express = require('express');
const mongoose = require('mongoose');

const app = express();
app.use(express.json());


mongoose.connect('mongodb://127.0.0.1:27017/productDB')
.then(() => console.log("MongoDB is  Connected"))
.catch(err => console.log(err));


const productSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    min: 0
  },
  stock: {
    type: Number,
    min: 0
  }
});

const Product = mongoose.model('Product', productSchema);

app.post('/products', async (req, res) => {
  try {
    const { title, price, stock } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }
    if (price < 0 || stock < 0) {
      return res.status(400).json({ message: "Price/Stock cannot be negative" });
    }

    const product = new Product({ title, price, stock });
    await product.save();

    res.status(201).json(product);
  } catch (err) {
    res.status(500).json(err);
  }
});



app.get('/products', async (req, res) => {
  const products = await Product.find();
  res.json(products);
});



app.get('/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(product);
  } catch {
    res.status(400).json({ message: "Invalid ID" });
  }
});



app.put('/products/:id', async (req, res) => {
  try {
    const { price, stock } = req.body;

    if (price < 0 || stock < 0) {
      return res.status(400).json({ message: "Invalid values" });
    }

    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json(updated);
  } catch {
    res.status(400).json({ message: "Update failed" });
  }
});


app.delete('/products/:id', async (req, res) => {
  await Product.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted successfully" });
});



app.get('/products/out-of-stock', async (req, res) => {
  const products = await Product.find({ stock: 0 });
  res.json(products);
});



app.listen(3000, () => {
  console.log("Server running on port 3000");
});