import mongoose from 'mongoose';

const elementSchema = new mongoose.Schema(
  {
    id:          { type: String, required: true },
    tool:        { type: String, enum: ['pencil','eraser','rect','circle','text'], required: true },
    points:      { type: [Number], default: undefined },
    x:           Number,
    y:           Number,
    width:       Number,
    height:      Number,
    color:       { type: String, default: '#ffffff' },
    strokeWidth: { type: Number, default: 3 },
    text:        String,
    fontSize:    Number,
    userId:      String,
    timestamp:   { type: Number, default: () => Date.now() },
  },
  { _id: false }
);

const versionSchema = new mongoose.Schema(
  {
    elements: [elementSchema],
    savedAt:  { type: Date, default: Date.now },
    savedBy:  String,
  },
  { _id: false }
);

const boardSchema = new mongoose.Schema({
  roomId:      { type: String, required: true, unique: true },
  name:        { type: String, default: 'Untitled Board' },
  owner:       { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  members:     [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  elements:    { type: [elementSchema], default: [] },
  versions:    { type: [versionSchema], default: [] },
  thumbnail:   { type: String, default: '' },
  isPublic:    { type: Boolean, default: true },
  createdAt:   { type: Date, default: Date.now },
  updatedAt:   { type: Date, default: Date.now },
});

boardSchema.index({ roomId: 1 });
boardSchema.index({ owner: 1, updatedAt: -1 });

export default mongoose.model('Board', boardSchema);