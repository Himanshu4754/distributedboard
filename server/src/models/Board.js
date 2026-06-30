import mongoose from 'mongoose';

const elementSchema = new mongoose.Schema(
  {
    id:          { type: String, required: true },
    tool:        { type: String, enum: ['pencil','eraser','rect','circle','text'], required: true },
    points:      { type: [Number], default: undefined },
    x: Number, y: Number, width: Number, height: Number,
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
  { elements: [elementSchema], savedAt: { type: Date, default: Date.now }, savedBy: String },
  { _id: false }
);

// Each member has a role
const memberSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    role: { type: String, enum: ['owner', 'editor', 'viewer'], default: 'editor' },
  },
  { _id: false }
);

// Pending join requests
const joinRequestSchema = new mongoose.Schema(
  {
    user:        { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    username:    String,
    requestedAt: { type: Date, default: Date.now },
    status:      { type: String, enum: ['pending','approved','denied'], default: 'pending' },
  },
  { _id: true }
);

const boardSchema = new mongoose.Schema({
  roomId:        { type: String, required: true, unique: true },
  name:          { type: String, default: 'Untitled Board' },
  owner:         { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  members:       [memberSchema],
  joinRequests:  [joinRequestSchema],
  isPublic:      { type: Boolean, default: false }, // false = requires approval
  elements:      { type: [elementSchema], default: [] },
  versions:      { type: [versionSchema], default: [] },
  thumbnail:     { type: String, default: '' },
  createdAt:     { type: Date, default: Date.now },
  updatedAt:     { type: Date, default: Date.now },
});

boardSchema.index({ roomId: 1 });
boardSchema.index({ owner: 1, updatedAt: -1 });
boardSchema.index({ 'members.user': 1 });

// Helper: get a user's role on this board
boardSchema.methods.getRole = function (userId) {
  if (String(this.owner) === String(userId)) return 'owner';
  const member = this.members.find(m => String(m.user) === String(userId));
  return member ? member.role : null;
};

export default mongoose.model('Board', boardSchema);