import mongoose, { Document, Schema, Model, Types } from "mongoose";

export interface IConnectionRequest {
  fromUserId: Types.ObjectId;
  toUserId: Types.ObjectId;
  status: "ignored" | "interested" | "accepted" | "rejected";
  createdAt: Date;
  updatedAt: Date;
}

export interface IConnectionRequestDocument extends IConnectionRequest, Document {}

const connectionRequestSchema = new Schema<IConnectionRequestDocument>(
  {
    fromUserId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    toUserId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: {
        values: ["ignored", "interested", "accepted", "rejected"],
        message: `{VALUE} is incorrect status type`,
      },
    },
  },
  {
    timestamps: true,
  }
);

connectionRequestSchema.index({ fromUserId: 1, toUserId: 1 });

connectionRequestSchema.pre<IConnectionRequestDocument>("save", function (next) {
  const connectionRequest = this;
  if (connectionRequest.fromUserId.equals(connectionRequest.toUserId)) {
    throw new Error("You can't send a connection request to yourself");
  }
  next();
});

const ConnectionRequestModel: Model<IConnectionRequestDocument> =
  mongoose.models.connectionRequest ||
  mongoose.model<IConnectionRequestDocument>("connectionRequest", connectionRequestSchema);

export default ConnectionRequestModel;
