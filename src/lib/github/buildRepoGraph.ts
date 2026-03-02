// lib/github/buildRepoGraph.ts

interface FileNode {
  path: string;
  content: string;
  size: number;
}

interface GraphNode {
  id: string;
  label: string;
  folder: string;
  type: 'file' | 'folder' | 'page' | 'component' | 'api';
  imports?: string[];
}

interface GraphEdge {
  source: string;
  target: string;
  type: 'imports' | 'contains' | 'routes-to' | 'uses';
}

export function buildRepoGraph(files: FileNode[]): { nodes: GraphNode[], edges: GraphEdge[] } {
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];
  const nodeMap = new Map<string, GraphNode>();
  
  // First pass: Create nodes for all files
  files.forEach(file => {
    const pathParts = file.path.split('/');
    const fileName = pathParts.pop() || '';
    const folder = pathParts.join('/') || 'root';
    
    // Determine node type based on path and content
    let type: 'file' | 'folder' | 'page' | 'component' | 'api' = 'file';
    
    if (file.path.includes('/pages/') || file.path.includes('/app/') && fileName.includes('page.')) {
      type = 'page';
    } else if (file.path.includes('/components/')) {
      type = 'component';
    } else if (file.path.includes('/api/')) {
      type = 'api';
    }
    
    const node: GraphNode = {
      id: file.path,
      label: fileName,
      folder: folder,
      type: type,
      imports: []
    };
    
    nodes.push(node);
    nodeMap.set(file.path, node);
  });

  // Second pass: Create folder nodes and establish folder structure
  const folderSet = new Set<string>();
  files.forEach(file => {
    const pathParts = file.path.split('/');
    let currentPath = '';
    
    pathParts.slice(0, -1).forEach((part, index) => {
      currentPath = currentPath ? `${currentPath}/${part}` : part;
      
      if (!folderSet.has(currentPath)) {
        folderSet.add(currentPath);
        
        // Create folder node
        const folderNode: GraphNode = {
          id: `folder-${currentPath}`,
          label: part,
          folder: currentPath.split('/').slice(0, -1).join('/') || 'root',
          type: 'folder'
        };
        nodes.push(folderNode);
        nodeMap.set(`folder-${currentPath}`, folderNode);
      }
      
      // Connect folder to its parent
      if (index > 0) {
        const parentPath = pathParts.slice(0, index).join('/');
        edges.push({
          source: `folder-${parentPath}`,
          target: `folder-${currentPath}`,
          type: 'contains'
        });
      }
      
      // Connect file to its parent folder
      if (index === pathParts.length - 2) {
        edges.push({
          source: `folder-${currentPath}`,
          target: file.path,
          type: 'contains'
        });
      }
    });
  });

  // Third pass: Parse imports and dependencies
  files.forEach(file => {
    if (file.path.match(/\.(js|jsx|ts|tsx)$/)) {
      const imports = extractImports(file.content);
      nodeMap.get(file.path)!.imports = imports;
      
      imports.forEach(importPath => {
        // Resolve relative imports
        const resolvedPath = resolveImportPath(file.path, importPath);
        const targetFile = files.find(f => f.path === resolvedPath || f.path.endsWith(importPath));
        
        if (targetFile) {
          edges.push({
            source: file.path,
            target: targetFile.path,
            type: 'imports'
          });
        }
      });
    }
  });

  // Fourth pass: Create route connections for Next.js pages
  files.forEach(file => {
    if (file.path.includes('/app/') && file.path.includes('page.')) {
      // Connect page to its layout
      const layoutPath = file.path.replace(/page\.[^/]+$/, 'layout.tsx');
      if (nodeMap.has(layoutPath)) {
        edges.push({
          source: file.path,
          target: layoutPath,
          type: 'routes-to'
        });
      }
      
      // Connect page to its components
      if (file.content) {
        const componentMatches = file.content.matchAll(/import\s+(\w+)\s+from\s+['"]@\/components\/([^'"]+)['"]/g);
        for (const match of componentMatches) {
          const componentName = match[2];
          const componentPath = `src/components/${componentName}.tsx`;
          if (nodeMap.has(componentPath)) {
            edges.push({
              source: file.path,
              target: componentPath,
              type: 'uses'
            });
          }
        }
      }
    }
  });

  console.log(`Built graph with ${nodes.length} nodes and ${edges.length} edges`);
  
  return { nodes, edges };
}

function extractImports(content: string): string[] {
  const imports: string[] = [];
  const importRegex = /import\s+.*?\s+from\s+['"]([^'"]+)['"]/g;
  const requireRegex = /require\(['"]([^'"]+)['"]\)/g;
  
  let match;
  while ((match = importRegex.exec(content)) !== null) {
    imports.push(match[1]);
  }
  while ((match = requireRegex.exec(content)) !== null) {
    imports.push(match[1]);
  }
  
  return imports;
}

function resolveImportPath(currentFilePath: string, importPath: string): string {
  if (importPath.startsWith('.')) {
    const currentDir = currentFilePath.split('/').slice(0, -1).join('/');
    const resolved = require('path').resolve('/', currentDir, importPath);
    return resolved.slice(1); // Remove leading slash
  }
  return importPath;
}