import mongoose from "mongoose";

/**
 * Mongoose schema for Medicine documents.
 * Represents a medicine product in the application, including its name, price, description, image, and category.
 *
 * Fields:
 * - name: Name of the medicine (required, trimmed)
 * - price: Price of the medicine (required, non-negative)
 * - shortDesc: Short description of the medicine (required, trimmed)
 * - image: Image URL for the medicine (required)
 * - category: Category of the medicine (default: "General")
 * - createdAt: Timestamp of creation (auto-generated)
 * - updatedAt: Timestamp of last update (auto-generated)
 *
 * @typedef {Object} Medicine
 * @property {string} name - The name of the medicine.
 * @property {number} price - The price of the medicine.
 * @property {string} shortDesc - Short description of the medicine.
 * @property {string} image - Image URL of the medicine.
 * @property {string} [category='General'] - The category of the medicine.
 * @property {Date} createdAt - Creation timestamp.
 * @property {Date} updatedAt - Last update timestamp.
 */
const medicineSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide a medicine name!"],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, "Please provide a price for the medicine!"],
      min: [0, "Price cannot be negative"],
    },
    shortDesc: {
      type: String,
      required: [true, "Please provide a short description!"],
      trim: true,
    },
    image: {
      type: String,
      required: [true, "Please provide an image URL!"],
    },
    category: {
      type: String,
      default: "General",
    },
  },
  {
    timestamps: true,
  }
);

const Medicine = mongoose.model("Medicine", medicineSchema);

export default Medicine;
