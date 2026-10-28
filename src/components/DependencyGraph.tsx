import { useMemo, useState } from 'react'
import { Background, Controls, ReactFlow, type Edge, type Node } from '@xyflow/react'
import dagre from 'dagre'
import '@xyflow/react/dist/style.css'
import { transitiveClosure, transitiveReduction, type DependencyNode } from '../lib/graphAlgorithms'

type Item = DependencyNode & { name: string; status: 'Completed' | 'Ready' | 'Blocked' }
const layout = (items: Item[], hasse: boolean) => {
  const graph = new dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}))
  graph.setGraph({ rankdir: 'TB', nodesep: 54, ranksep: 72, marginx: 25, marginy: 25 })
  items.forEach(item => graph.setNode(item.id, { width: 178, height: 66 }))
  const links = hasse ? transitiveReduction(items) : items.flatMap(item => item.prerequisites.map(prereq => [prereq, item.id] as [string, string]))
  links.forEach(([from, to]) => graph.setEdge(from, to))
  dagre.layout(graph)
  return { graph, links }
}

export function DependencyGraph({ items, title = 'Dependency graph' }: { items: Item[]; title?: string }) {
  const [hasse, setHasse] = useState(true)
  const [selected, setSelected] = useState<string | null>(null)
  const { nodes, edges } = useMemo(() => {
    const { graph, links } = layout(items, hasse)
    const closure = transitiveClosure(items)
    const connected = new Set<string>()
    if (selected) {
      connected.add(selected)
      closure.get(selected)?.forEach(id => connected.add(id))
      items.forEach(item => { if (closure.get(item.id)?.has(selected)) connected.add(item.id) })
    }
    const nodes: Node[] = items.map(item => {
      const p = graph.node(item.id)
      return { id: item.id, position: { x: p.x - 89, y: p.y - 33 }, data: { label: <div className={`graph-node ${item.status.toLowerCase()} ${connected.size && !connected.has(item.id) ? 'dimmed' : ''}`}><b>{item.name}</b><small>{item.status} · {item.prerequisites.length} prerequisite{item.prerequisites.length === 1 ? '' : 's'}</small></div> }, style: { width: 178, padding: 0, border: 0, background: 'transparent' } }
    })
    const edges: Edge[] = links.map(([from, to], index) => ({ id: `${from}-${to}-${index}`, source: from, target: to, type: 'smoothstep', animated: Boolean(selected && connected.has(from) && connected.has(to)), markerEnd: { type: 'arrowclosed' }, style: { stroke: selected && connected.has(from) && connected.has(to) ? '#578753' : '#aab4a5', strokeWidth: selected && connected.has(from) && connected.has(to) ? 2.5 : 1.5 } }))
    return { nodes, edges }
  }, [items, hasse, selected])
  const current = items.find(item => item.id === selected)
  const ancestors = selected ? [...(transitiveClosure(items).get(selected) ?? [])] : []
  return <div className="graph-wrap">
    <div className="graph-toolbar"><b>{title}</b><div><button className={hasse ? 'active' : ''} onClick={() => setHasse(true)}>Hasse diagram</button><button className={!hasse ? 'active' : ''} onClick={() => setHasse(false)}>Direct dependencies</button></div></div>
    <div className="flow-canvas"><ReactFlow nodes={nodes} edges={edges} fitView fitViewOptions={{ padding: .18 }} minZoom={.35} maxZoom={1.7} onNodeClick={(_, node) => setSelected(node.id === selected ? null : node.id)} onPaneClick={() => setSelected(null)} nodesDraggable={false} nodesConnectable={false} proOptions={{ hideAttribution: true }}><Background color="#e8ece5" gap={22} /><Controls showInteractive={false}/></ReactFlow></div>
    <div className="graph-legend"><span><i className="legend-dot completed"/>Completed</span><span><i className="legend-dot ready"/>Ready</span><span><i className="legend-dot blocked"/>Blocked</span><span>Click a node to trace its dependency chain</span></div>
    {current && <div className="graph-detail"><b>{current.name}</b><span>{current.status}. {ancestors.length ? `Prerequisite chain: ${ancestors.map(id => items.find(item => item.id === id)?.name ?? id).join(' → ')}.` : 'No prerequisites.'}</span><button onClick={() => setSelected(null)}>Clear selection</button></div>}
  </div>
}
