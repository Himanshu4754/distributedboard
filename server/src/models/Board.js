import mongoose from 'mongoose';

const elementSchema = new mongoose.Schema({
  id: String,
  tool: { type: String, enum: ['pencil', 'rect', 'circle', 'text'] },
  points: [Number],
  x: Number,
  y: Number,
  width: Number,
  height: Number,
  color: String,
  strokeWidth: Number,
  text: String,
}, { _id: false });

const boardSchema = new mongoose.Schema({
  roomId: { type: String, required: true, unique: true, index: true },
  elements: [elementSchema],
  versions: [{
    elements: [elementSchema],
    savedAt: { type: Date, default: Date.now },
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

boardSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.model('Board', boardSchema);