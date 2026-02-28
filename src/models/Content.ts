import mongoose, { Schema } from "mongoose";
import User from "./User";

interface RepoNode {
  id: string;
  label: string;
}

interface RepoEdge {
  source: string;
  target: string;
}

interface RepoFile {
  path: string;
  size?: number;
  type?: string;
}

interface RepoGraph {
  nodes: RepoNode[];
  edges: RepoEdge[];
}

export interface IContent {
  userId: mongoose.Schema.Types.ObjectId;

  type: "youtube" | "pdf" | "github";

  title: string;

  sourceUrl?: string;

  content?: string;

  status: "processing" | "ready" | "failed";

  repoStructure?: any;

  repoFiles?: RepoFile[];

  repoGraph?: RepoGraph;

  createdAt: Date;
  updatedAt: Date;
}

const ContentSchema = new Schema<IContent>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: User,
      required: true,
    },

    type: {
      type: String,
      enum: ["youtube", "pdf", "github"],
      required: true,
    },

    title: {
      type: String,
      required: true,
    },

    sourceUrl: {
      type: String,
      default: null,
    },

    content: {
      type: String,
      default: null,
    },

    status: {
      type: String,
      enum: ["processing", "ready", "failed"],
      default: "processing",
    },

    repoStructure: {
      type: Schema.Types.Mixed,
      default: null,
    },

    repoFiles: {
      type: [
        {
          path: { type: String },
          size: { type: Number },
          type: { type: String },
        },
      ],
      default: [],
    },

    repoGraph: {
      type: {
        nodes: [
          {
            id: { type: String },
            label: { type: String },
          },
        ],
        edges: [
          {
            source: { type: String },
            target: { type: String },
          },
        ],
      },
      default: {
        nodes: [],
        edges: [],
      },
    },
  },
  {
    timestamps: true,
  }
);

const Content =
  mongoose.models.Content ||
  mongoose.model<IContent>("Content", ContentSchema);

export default Content;