// components/RepoGraph.tsx

"use client";

import React, { useEffect, useState, useCallback } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  useNodesState,
  useEdgesState,
  MarkerType,
  Position,
  Panel
} from "reactflow";
import dagre from "dagre";
import "reactflow/dist/style.css";
import { Card } from "@/components/ui/card";
import { 
  Loader2, 
  FolderOpen, 
  File, 
  FileJson, 
  FileCode, 
  Globe, 
  Component,
  Database,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const nodeWidth = 220;
const nodeHeight = 90;

interface GraphNode {
  id: string;
  label: string;
  folder: string;
  type?: string;
}

interface GraphEdge {
  source: string;
  target: string;
  type?: string;
}

interface RepoGraphProps {
  graph: {
    nodes: GraphNode[];
    edges: GraphEdge[];
  };
}

// Custom node component with type-specific styling
const CustomNode = ({ data }: { data: any }) => {
  const getNodeIcon = () => {
    if (data.id?.startsWith('folder-')) {
      return <FolderOpen className="w-4 h-4" />;
    }
    return <FileCode className="w-4 h-4" />;
  };

  const getNodeColors = () => {
    if (data.id?.startsWith('folder-')) {
      return 'bg-purple-500/10 border-purple-500/30 text-purple-600 dark:text-purple-400';
    }
    return 'bg-blue-500/10 border-blue-500/30 text-blue-600 dark:text-blue-400';
  };

  const fileName = data.label.split('/').pop() || data.label;
  
  return (
    <div className={cn(
      "px-3 py-2 rounded-xl shadow-lg border-2 backdrop-blur-sm",
      "transition-all duration-200 hover:scale-105 hover:shadow-xl",
      "min-w-[180px] max-w-[250px]",
      getNodeColors()
    )}>
      <div className="flex items-center gap-2">
        {getNodeIcon()}
        <div className="font-semibold text-sm truncate flex-1">{fileName}</div>
      </div>
      {data.folder && data.folder !== 'root' && data.folder !== '/' && (
        <div className="text-xs opacity-70 mt-1 truncate pl-6">
          {data.folder}
        </div>
      )}
    </div>
  );
};

const nodeTypes = {
  custom: CustomNode,
};

function getLayoutedElements(nodes: Node[], edges: Edge[], direction: 'TB' | 'LR' = 'TB') {
  if (nodes.length === 0) return { nodes, edges };

  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({ rankdir: direction, ranksep: 150, nodesep: 100 }); // Increased spacing

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, {
      width: nodeWidth,
      height: nodeHeight
    });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    
    if (!nodeWithPosition) {
      return {
        ...node,
        position: { 
          x: Math.random() * 500, 
          y: Math.random() * 500 
        },
        sourcePosition: direction === 'TB' ? Position.Bottom : Position.Right,
        targetPosition: direction === 'TB' ? Position.Top : Position.Left,
      };
    }

    return {
      ...node,
      position: {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - nodeHeight / 2
      },
      sourcePosition: direction === 'TB' ? Position.Bottom : Position.Right,
      targetPosition: direction === 'TB' ? Position.Top : Position.Left,
    };
  });

  return { nodes: layoutedNodes, edges };
}

export default function RepoGraph({ graph }: RepoGraphProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    console.log("RepoGraph received data:", graph);
    
    if (!graph || !graph.nodes || graph.nodes.length === 0) {
      console.log("No graph data available");
      return;
    }

    try {
      // Convert to ReactFlow nodes
      const rfNodes: Node[] = graph.nodes.map((node) => {
        // Determine if it's a folder node
        const isFolder = node.id.startsWith('folder-');
        
        return {
          id: node.id,
          type: 'custom',
          data: { 
            label: node.label,
            folder: node.folder || (isFolder ? node.label : ''),
            type: isFolder ? 'folder' : 'file'
          },
          position: { x: 0, y: 0 },
        };
      });

      // Convert edges with better styling
      const rfEdges: Edge[] = (graph.edges || []).map((edge, index) => ({
        id: `e-${index}`,
        source: edge.source,
        target: edge.target,
        type: 'smoothstep',
        animated: true,
        style: { 
          stroke: '#8b5cf6', 
          strokeWidth: 3, // Increased stroke width
          strokeOpacity: 0.8
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: '#8b5cf6',
          width: 15,
          height: 15,
        },
      }));

      console.log(`Created ${rfNodes.length} nodes and ${rfEdges.length} edges`);

      // Layout the elements
      const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(rfNodes, rfEdges, 'TB');
      
      setNodes(layoutedNodes);
      setEdges(layoutedEdges);
      setIsReady(true);
      
    } catch (error) {
      console.error("Error processing graph data:", error);
    }
  }, [graph]);

  if (!graph || !graph.nodes || graph.nodes.length === 0) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-muted/20 rounded-lg">
        <div className="text-center space-y-3">
          <Loader2 className="h-8 w-8 animate-spin text-purple-500 mx-auto" />
          <p className="text-sm text-muted-foreground">No graph data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full relative bg-muted/5 rounded-lg overflow-hidden">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-left"
        className="bg-background"
        minZoom={0.1}
        maxZoom={1.5}
        defaultViewport={{ x: 0, y: 0, zoom: 0.8 }} // Added default zoom
        style={{ width: '100%', height: '100%' }}
      >
        <Controls 
          className="bg-background border-border" 
          showInteractive={false}
        />
        <MiniMap 
          nodeColor={(node) => {
            const isFolder = node.id?.startsWith('folder-');
            return isFolder ? '#8b5cf6' : '#3b82f6';
          }}
          className="bg-background border-border"
        />
        <Background 
          color="#94a3b8" 
          gap={16} 
          size={1}
        />
      </ReactFlow>

      <div className="absolute bottom-2 right-2 text-xs text-muted-foreground bg-background/80 backdrop-blur-sm px-2 py-1 rounded border border-border z-10">
        {nodes.length} nodes • {edges.length} connections
      </div>
    </div>
  );
}