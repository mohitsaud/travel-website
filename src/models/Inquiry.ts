import mongoose, { Schema } from "mongoose";

const inquirySchema = new Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  email: { type: String, required: true, trim: true, lowercase: true, maxlength: 254 },
  tripSlug: { type: String, trim: true, maxlength: 120, default: "" },
  startDate: { type: String, trim: true, maxlength: 30, default: "" },
  groupSize: { type: Number, required: true, min: 1, max: 20 },
  message: { type: String, required: true, trim: true, maxlength: 3000 },
  status: { type: String, enum: ["New", "Contacted", "Closed"], default: "New" },
}, { timestamps: true });

const Inquiry = mongoose.models.Inquiry || mongoose.model("Inquiry", inquirySchema);
export default Inquiry;