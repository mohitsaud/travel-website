import mongoose, { Schema, type InferSchemaType } from 'mongoose';

const postSchema = new Schema(
  {
    slug: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
      sparse: true,
      maxlength: 160,
    },
    title: { type: String, required: true, trim: true, maxlength: 120 },
    excerpt: { type: String, required: true, trim: true, maxlength: 240 },
    content: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true, maxlength: 40 },
    status: { type: String, enum: ['Draft', 'Published'], default: 'Draft' },
    cover: { type: String, default: '' },
    readTime: { type: Number, default: 4, min: 1, max: 60 },
  },
  { timestamps: true },
);

export type PostDocument = InferSchemaType<typeof postSchema>;

const Post = mongoose.models.Post || mongoose.model('Post', postSchema);

export default Post;
