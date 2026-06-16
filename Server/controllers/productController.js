import { Product } from "../models/Schema.js";

export const getAllProducts = async (req, res) => {
  const { sort, category, gender, search } = req.query;
  try {
    let query = {};

    // Search filter
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } }
      ];
    }

    // Category filter
    if (category) {
      const categoriesList = category.split(",");
      query.category = { $in: categoriesList };
    }

    // Gender filter
    if (gender) {
      const gendersList = gender.split(",");
      query.gender = { $in: gendersList };
    }

    let productsQuery = Product.find(query);

    // Sorting logic
    if (sort) {
      if (sort === "Price (low to high)") {
        productsQuery = productsQuery.sort({ price: 1 });
      } else if (sort === "Price (high to low)") {
        productsQuery = productsQuery.sort({ price: -1 });
      } else if (sort === "Discount") {
        productsQuery = productsQuery.sort({ discount: -1 });
      } else if (sort === "Popular") {
        // Assume default or sort by price/discount
        productsQuery = productsQuery.sort({ price: 1 });
      }
    }

    const products = await productsQuery;
    return res.status(200).json(products);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching products", error: error.message });
  }
};

export const getProductById = async (req, res) => {
  const { id } = req.params;
  try {
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    return res.status(200).json(product);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching product details", error: error.message });
  }
};

export const createProduct = async (req, res) => {
  const { title, description, mainImg, carousel, sizes, category, gender, price, discount } = req.body;
  try {
    if (!title || !description || !mainImg || !price) {
      return res.status(400).json({ message: "Title, description, main image, and price are required" });
    }
    const newProduct = new Product({
      title,
      description,
      mainImg,
      carousel: carousel || [],
      sizes: sizes || [],
      category,
      gender,
      price: Number(price),
      discount: Number(discount) || 0
    });
    await newProduct.save();
    return res.status(201).json({ message: "Product created successfully", product: newProduct });
  } catch (error) {
    return res.status(500).json({ message: "Error creating product", error: error.message });
  }
};

export const updateProduct = async (req, res) => {
  const { id } = req.params;
  const { title, description, mainImg, carousel, sizes, category, gender, price, discount } = req.body;
  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      {
        title,
        description,
        mainImg,
        carousel,
        sizes,
        category,
        gender,
        price: Number(price),
        discount: Number(discount)
      },
      { new: true }
    );
    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }
    return res.status(200).json({ message: "Product updated successfully", product: updatedProduct });
  } catch (error) {
    return res.status(500).json({ message: "Error updating product", error: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  const { id } = req.params;
  try {
    const deletedProduct = await Product.findByIdAndDelete(id);
    if (!deletedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }
    return res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Error deleting product", error: error.message });
  }
};
