import { useEffect, useState, useRef, useMemo } from 'react';
import { Stage, Layer, Circle, Line, Text, Group } from 'react-konva';
import Konva from 'konva';
import { motion, AnimatePresence } from 'motion/react';
import { useWindowSize } from 'react-use';
import { useDreamStore, Dream } from '@/store/dreamStore';
import { X, Heart, Feather, MapPin, Sparkles, User as UserIcon } from 'lucide-react';

const mapDreamsToNodes = (dreams: Dream[]) => {
  return dreams.map((dream) => {
    // Generate deterministic random based on string id
    let seed = dream.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const random = () => {
      const x = Math.sin(seed++) * 10000;
      return x - Math.floor(x);
    };

    return {
      id: dream.id,
      x: (random() * 2000) - 1000,
      y: (random() * 2000) - 1000,
      radius: random() * 4 + 2,
      color: random() > 0.5 ? '#ea580c' : '#b45309', // Desert Mirage colors
      symbol: dream.symbols?.[0] || 'mystery',
      snippet: dream.text.substring(0, 100) + '...',
      resonance: dream.resonanceCount || 0,
      location: dream.location
    };
  });
};

const generateEdges = (nodes: any[]) => {
  const edges = [];
  for (let i = 0; i < nodes.length; i++) {
    const numConnections = Math.floor(Math.random() * 3);
    for (let j = 0; j < numConnections; j++) {
      const target = nodes[Math.floor(Math.random() * nodes.length)];
      if (target.id !== nodes[i].id) {
        edges.push({
          id: `edge-${i}-${j}`,
          source: nodes[i],
          target: target
        });
      }
    }
  }
  return edges;
};

export default function Tapestry() {
  const { width, height } = useWindowSize();
  const { language, user, dreams, globalDreams, loadGlobalDreams, resonateWithDream } = useDreamStore();
  const [nodes, setNodes] = useState<any[]>([]);
  const [edges, setEdges] = useState<any[]>([]);
  const [particles, setParticles] = useState<any[]>([]);
  const [scale, setScale] = useState(1);
  const [selectedNode, setSelectedNode] = useState<any | null>(null);
  const [isWeaving, setIsWeaving] = useState(false);
  const [continuationText, setContinuationText] = useState('');
  
  const stageRef = useRef<any>(null);
  const layerRef = useRef<any>(null);
  const particleNodesRef = useRef<{[key: string]: any}>({});
  const particlesDataRef = useRef<any[]>([]);

  // Find user's latest symbols for synchronicities
  const userSymbols = useMemo(() => {
    if (!dreams || dreams.length === 0) return new Set<string>();
    const latestDream = dreams[0];
    return new Set(latestDream.symbols?.map(s => s.toLowerCase()) || []);
  }, [dreams]);

  useEffect(() => {
    if (user) {
      loadGlobalDreams();
    }
  }, [user, loadGlobalDreams]);

  useEffect(() => {
    if (!globalDreams || globalDreams.length === 0) return;

    const newNodes = mapDreamsToNodes(globalDreams);
    const newEdges = generateEdges(newNodes);
    setNodes(newNodes);
    setEdges(newEdges);

    const newParticles = Array.from({ length: Math.min(250, newEdges.length * 2) }).map((_, i) => {
      const edge = newEdges[Math.floor(Math.random() * newEdges.length)];
      return {
        id: `particle-${i}`,
        edge,
        progress: Math.random(),
        speed: (Math.random() * 0.002 + 0.0005) * (Math.random() > 0.5 ? 1 : -1),
        color: edge?.source?.color || '#ea580c'
      };
    }).filter(p => p.edge);
    
    setParticles(newParticles);
    particlesDataRef.current = newParticles;
  }, [globalDreams]);

  useEffect(() => {
    if (!layerRef.current || particles.length === 0) return;

    const anim = new Konva.Animation((frame) => {
      if (!frame) return;
      
      particlesDataRef.current.forEach(p => {
        p.progress += p.speed;
        if (p.progress > 1) p.progress = 0;
        if (p.progress < 0) p.progress = 1;

        const node = particleNodesRef.current[p.id];
        if (node && p.edge) {
          const x = p.edge.source.x + (p.edge.target.x - p.edge.source.x) * p.progress;
          const y = p.edge.source.y + (p.edge.target.y - p.edge.source.y) * p.progress;
          node.position({ x, y });
        }
      });
    }, layerRef.current);

    anim.start();
    return () => { anim.stop(); };
  }, [particles]);

  const handleWheel = (e: any) => {
    e.evt.preventDefault();
    const scaleBy = 1.1;
    const stage = e.target.getStage();
    const oldScale = stage.scaleX();
    const pointer = stage.getPointerPosition();

    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };

    let newScale = e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy;
    newScale = Math.max(0.1, Math.min(newScale, 5));
    setScale(newScale);
    stage.scale({ x: newScale, y: newScale });

    const newPos = {
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    };
    stage.position(newPos);
  };

  const handleNodeClick = (node: any) => {
    setSelectedNode(node);
    setIsWeaving(false);
  };

  const handleResonate = () => {
    if (!selectedNode) return;
    
    resonateWithDream(selectedNode.id);
    
    // Create a visual ripple effect (handled in state)
    setNodes(prev => prev.map(n => {
      if (n.id === selectedNode.id) {
        return { ...n, resonance: n.resonance + 1, radius: n.radius * 1.2 };
      }
      return n;
    }));
    
    setSelectedNode({ ...selectedNode, resonance: selectedNode.resonance + 1 });
  };

  const handleContinuationSubmit = () => {
    if (!continuationText.trim() || !selectedNode) return;
    
    // In a real app, save to Supabase and link to parentId
    console.log("Saving continuation:", continuationText, "for parent:", selectedNode.id);
    
    setIsWeaving(false);
    setContinuationText('');
    setSelectedNode(null);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <div className="glass-panel p-8 text-center flex flex-col items-center justify-center max-w-md w-full">
          <UserIcon className="w-12 h-12 text-aether-muted mb-4 opacity-50" />
          <p className="text-aether-text mb-4">
            {language === 'ur' ? 'اجتماعی شعور دیکھنے کے لیے سائن ان کریں۔' : 'Please sign in to view the Collective Tapestry.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen bg-aether-bg overflow-hidden relative">
      <div className="absolute top-12 left-6 z-10 pointer-events-none">
        <h1 className="text-3xl font-serif text-aether-gold glow-text">
          {language === 'ur' ? 'اجتماعی شعور' : 'Collective Tapestry'}
        </h1>
        <p className="text-aether-muted italic text-sm" dir={language === 'ur' ? 'rtl' : 'ltr'}>
          {language === 'ur' ? 'زوم کرنے کے لیے چٹکی بھریں۔ دریافت کرنے کے لیے گھسیٹیں۔' : 'Pinch or scroll to zoom. Drag to explore.'}
        </p>
        {userSymbols.size > 0 && (
          <div className="mt-4 flex items-center gap-2 text-aether-gold/80 text-xs">
            <Sparkles className="w-4 h-4" />
            <span>{language === 'ur' ? 'سنکرونیسیٹیز کو نمایاں کیا گیا ہے۔' : 'Synchronicities highlighted'}</span>
          </div>
        )}
      </div>

      <Stage
        width={width}
        height={height}
        draggable
        onWheel={handleWheel}
        ref={stageRef}
        x={width / 2}
        y={height / 2}
      >
        <Layer ref={layerRef}>
          {edges.map((edge) => (
            <Group key={edge.id}>
              <Line
                points={[edge.source.x, edge.source.y, edge.target.x, edge.target.y]}
                stroke={edge.source.color}
                strokeWidth={3 / scale}
                opacity={0.08}
                shadowColor={edge.source.color}
                shadowBlur={15}
              />
              <Line
                points={[edge.source.x, edge.source.y, edge.target.x, edge.target.y]}
                stroke="rgba(255, 255, 255, 0.15)"
                strokeWidth={1 / scale}
              />
            </Group>
          ))}
          
          {particles.map((p) => (
            <Circle
              key={p.id}
              ref={(node) => {
                if (node) particleNodesRef.current[p.id] = node;
              }}
              radius={1.5 / scale}
              fill={p.color}
              shadowColor={p.color}
              shadowBlur={10}
              opacity={0.9}
              x={p.edge.source.x + (p.edge.target.x - p.edge.source.x) * p.progress}
              y={p.edge.source.y + (p.edge.target.y - p.edge.source.y) * p.progress}
            />
          ))}
          
          {nodes.map((node) => {
            const isSynchronicity = userSymbols.has(node.symbol.toLowerCase());
            return (
              <Group 
                key={node.id} 
                x={node.x} 
                y={node.y}
                onClick={() => handleNodeClick(node)}
                onTap={() => handleNodeClick(node)}
              >
                {/* Resonance Glow */}
                <Circle
                  radius={node.radius * 2}
                  fill={isSynchronicity ? '#ffd700' : node.color}
                  opacity={isSynchronicity ? 0.3 : 0.1 + (node.resonance * 0.001)}
                  shadowColor={isSynchronicity ? '#ffd700' : node.color}
                  shadowBlur={isSynchronicity ? 30 : 20 + (node.resonance * 0.5)}
                />
                <Circle
                  radius={isSynchronicity ? node.radius * 1.5 : node.radius}
                  fill={isSynchronicity ? '#ffd700' : node.color}
                  shadowColor={isSynchronicity ? '#ffd700' : node.color}
                  shadowBlur={10}
                  shadowOpacity={0.8}
                />
                {scale > 1.5 && (
                  <Text
                    text={node.symbol}
                    y={10}
                    fill={isSynchronicity ? '#ffd700' : "rgba(255, 255, 255, 0.5)"}
                    fontSize={10 / scale}
                    align="center"
                    offsetX={20}
                  />
                )}
              </Group>
            );
          })}
        </Layer>
      </Stage>

      {/* Node Detail Modal */}
      <AnimatePresence>
        {selectedNode && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedNode(null)}
              className="absolute inset-0 z-40 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.95 }}
              className="absolute bottom-24 left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:w-[500px] z-50 glass-panel p-6"
            >
              <button 
                onClick={() => setSelectedNode(null)}
                className="absolute top-4 right-4 text-aether-muted hover:text-aether-text"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="mb-4 flex items-center gap-3">
                <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-aether-cyan uppercase tracking-widest">
                  {selectedNode.symbol}
                </span>
                {selectedNode.location && (
                  <span className="flex items-center gap-1 text-xs text-aether-muted">
                    <MapPin className="w-3 h-3" />
                    {selectedNode.location.name || `${selectedNode.location.lat.toFixed(2)}, ${selectedNode.location.lng.toFixed(2)}`}
                  </span>
                )}
              </div>

              <p className="text-aether-text/90 italic font-light leading-relaxed mb-6">
                "{selectedNode.snippet}"
              </p>

              {!isWeaving ? (
                <div className="flex items-center justify-between">
                  <button 
                    onClick={handleResonate}
                    className="flex items-center gap-2 text-aether-magenta hover:text-white transition-colors"
                  >
                    <Heart className="w-5 h-5" fill="currentColor" />
                    <span className="text-sm font-mono">{selectedNode.resonance}</span>
                  </button>

                  <button 
                    onClick={() => {
                      if (user) setIsWeaving(true);
                    }}
                    disabled={!user}
                    className={`flex items-center gap-2 transition-colors ${!user ? 'text-aether-muted opacity-50 cursor-not-allowed' : 'text-aether-gold hover:text-white'}`}
                    title={!user ? (language === 'ur' ? 'کہانی آگے بڑھانے کے لیے سائن ان کریں' : 'Sign in to weave continuation') : ''}
                  >
                    <Feather className="w-5 h-5" />
                    <span className="text-sm uppercase tracking-widest font-serif">
                      {!user 
                        ? (language === 'ur' ? 'سائن ان درکار ہے' : 'Sign in to Weave')
                        : (language === 'ur' ? 'کہانی آگے بڑھائیں' : 'Weave Continuation')}
                    </span>
                  </button>
                </div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-4"
                >
                  <textarea
                    value={continuationText}
                    onChange={(e) => setContinuationText(e.target.value)}
                    placeholder={language === 'ur' ? 'اس خواب کو آگے بڑھائیں...' : 'Continue this dream...'}
                    dir={language === 'ur' ? 'rtl' : 'ltr'}
                    className={`w-full bg-black/20 border border-white/10 rounded-xl p-3 text-sm text-aether-text focus:outline-none focus:border-aether-gold/50 resize-none h-24 ${language === 'ur' ? 'font-urdu' : ''}`}
                  />
                  <div className="flex justify-end gap-3">
                    <button 
                      onClick={() => setIsWeaving(false)}
                      className="text-xs text-aether-muted hover:text-white uppercase tracking-widest"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleContinuationSubmit}
                      disabled={!continuationText.trim()}
                      className="bg-aether-gold/20 text-aether-gold px-4 py-2 rounded-lg text-xs uppercase tracking-widest hover:bg-aether-gold/30 disabled:opacity-50 transition-colors"
                    >
                      Weave
                    </button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
