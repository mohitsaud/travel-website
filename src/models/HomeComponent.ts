import mongoose, { Schema } from "mongoose";

const homeComponentSchema = new Schema({
  type: { type: String, required: true, enum: ["hero", "trip-showcase", "editorial", "callout"] },
  title: { type: String, required: true, trim: true, maxlength: 120 },
  subtitle: { type: String, trim: true, maxlength: 240, default: "" },
  body: { type: String, trim: true, maxlength: 1200, default: "" },
  image: { type: String, trim: true, maxlength: 2048, default: "" },
  linkLabel: { type: String, trim: true, maxlength: 40, default: "" },
  linkHref: { type: String, trim: true, maxlength: 200, default: "" },
  tripSlugs: { type: [String], default: [] },
  enabled: { type: Boolean, default: true },
  order: { type: Number, min: 0, max: 10000, default: 0 },
}, { timestamps: true });

const HomeComponent = mongoose.models.HomeComponent || mongoose.model("HomeComponent", homeComponentSchema);
export default HomeComponent;