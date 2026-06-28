import mongoose from 'mongoose';

const elementSchema = new mongoose.Schema(
  {
    id:          { type: String, required: true },
    tool:        { type: String, enum: ['pencil', 'eraser', 'rect', 'circle'], required: true },
    points:      { type: [Number], default: undefined },
    x:           Number,
    y:           Number,
    width:       Number,
    height:      Number,
    color:       { type: String, default: '#ffffff' },
    strokeWidth: { type: Number, default: 3 },
  },
  { _id: false }
);

const versionSchema = new mongoose.Schema(
  {
    elements: [elementSchema],
    savedAt:  { type: Date, default: Date.now },
  },
  { _id: false }
);

const boardSchema = new mongoose.Schema({
  roomId:    { type: String, required: true, unique: true },
  elements:  { type: [elementSchema], default: [] },
  versions:  { type: [versionSchema], default: [] },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Compound index for fast lookups
boardSchema.index({ roomId: 1, updatedAt: -1 });

export default mongoose.model('Board', boardSchema);