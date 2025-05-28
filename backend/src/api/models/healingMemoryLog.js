import mongoose, { Schema } from "mongoose";

const HealingMemoryLogSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  journalRef: { type: Schema.Types.ObjectId, ref: "JournalEntry", required: true },
  memorySummary: { type: String, required: true },
  embedding: { type: [Number], required: true },
  createdAt: { type: Date, default: Date.now }
});

HealingMemoryLogSchema.methods.getSummary = function () {
  return this.memorySummary;
};

export default mongoose.model("HealingMemoryLog", HealingMemoryLogSchema);
