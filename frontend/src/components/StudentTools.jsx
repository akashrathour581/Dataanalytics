import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  GraduationCap,
  Calculator,
  Percent,
  Award,
  BookOpen,
  Plus,
  Trash2,
  RefreshCw,
  Copy,
  CheckCircle2,
  TrendingUp,
  Target,
  Sparkles,
  Info,
  ChevronRight,
  HelpCircle,
  Sigma,
  History,
  Delete,
  RotateCcw,
  Hash,
  Binary,
  Divide,
  CornerDownLeft,
  Volume2,
  VolumeX
} from 'lucide-react';

export default function StudentTools({ toolId = 'calculator', onToast, onNavigate }) {
  const [activeTab, setActiveTab] = useState(
    toolId === 'scientific-calculator' ? 'calculator' : (toolId || 'calculator')
  );

  // Synchronize when toolId prop changes from parent / URL
  React.useEffect(() => {
    if (toolId) {
      setActiveTab(toolId === 'scientific-calculator' ? 'calculator' : toolId);
    }
  }, [toolId]);

  const switchTab = (tab) => {
    setActiveTab(tab);
    if (onNavigate) {
      onNavigate(`/${tab}`);
    }
  };

  const copyToClipboard = (text, message = 'Copied to clipboard!') => {
    navigator.clipboard.writeText(text);
    if (onToast) onToast(message);
  };

  return (
    <div className="tool-view-container" style={{ maxWidth: 1120, margin: '0 auto', paddingBottom: 48 }}>
      {/* Top Student Tools Hub Navigation Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(129, 140, 248, 0.14) 0%, rgba(192, 132, 252, 0.12) 50%, rgba(56, 189, 248, 0.08) 100%)',
        border: '1px solid rgba(129, 140, 248, 0.3)',
        borderRadius: 18,
        padding: '24px 28px',
        marginBottom: 24,
        boxShadow: '0 12px 36px -10px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: -30,
          right: -30,
          width: 140,
          height: 140,
          background: 'radial-gradient(circle, rgba(129, 140, 248, 0.25) 0%, transparent 70%)',
          borderRadius: '50%',
          pointerEvents: 'none'
        }} />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{
              width: 52,
              height: 52,
              borderRadius: 14,
              background: 'linear-gradient(135deg, #818cf8 0%, #c084fc 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 20px rgba(129, 140, 248, 0.55)',
              color: '#090d16'
            }}>
              <GraduationCap size={28} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                <h1 style={{
                  fontSize: '1.65rem',
                  fontWeight: 800,
                  background: 'linear-gradient(135deg, #ffffff 30%, #818cf8 70%, #c084fc 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  margin: 0,
                  letterSpacing: '-0.02em'
                }}>
                  Student Academic Suite
                </h1>
                <span style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  padding: '3px 8px',
                  borderRadius: 6,
                  background: 'rgba(129, 140, 248, 0.2)',
                  border: '1px solid rgba(129, 140, 248, 0.4)',
                  color: '#818cf8'
                }}>
                  ACADEMIC v2.0
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '0.88rem', color: '#cbd5e1' }}>
                Accurate Indian & Global university grading calculators: CGPA, SGPA, Percentage & Target Planner.
              </p>
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div style={{
          display: 'flex',
          gap: 8,
          marginTop: 20,
          overflowX: 'auto',
          paddingBottom: 4
        }}>
          {[
            { id: 'calculator', name: 'Scientific Calculator', icon: Sigma, color: '#38bdf8' },
            { id: 'cgpa-calculator', name: 'CGPA Calculator', icon: GraduationCap, color: '#818cf8' },
            { id: 'sgpa-calculator', name: 'SGPA Calculator', icon: Calculator, color: '#a855f7' },
            { id: 'cgpa-to-percentage', name: 'CGPA → Percentage', icon: Percent, color: '#34d399' },
            { id: 'percentage-to-cgpa', name: 'Percentage → CGPA', icon: Award, color: '#f59e0b' },
            { id: 'overall-cgpa-calculator', name: 'Overall CGPA Calculator', icon: BookOpen, color: '#ec4899' }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => switchTab(tab.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '9px 15px',
                  borderRadius: 12,
                  fontSize: '0.84rem',
                  fontWeight: isActive ? 700 : 500,
                  fontFamily: 'Inter, sans-serif',
                  cursor: 'pointer',
                  border: isActive ? `1px solid ${tab.color}70` : '1px solid rgba(255, 255, 255, 0.08)',
                  background: isActive ? `${tab.color}25` : 'rgba(18, 22, 29, 0.65)',
                  color: isActive ? tab.color : '#cbd5e1',
                  boxShadow: isActive ? `0 0 16px ${tab.color}35` : 'none',
                  transition: 'all 0.2s ease',
                  whiteSpace: 'nowrap'
                }}
              >
                <Icon size={15} color={isActive ? tab.color : '#94a3b8'} />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Render Active Tool */}
      {activeTab === 'calculator' && <ScientificCalculatorSection onToast={onToast} onCopy={copyToClipboard} />}
      {activeTab === 'cgpa-calculator' && <CgpaCalculatorSection onToast={onToast} onCopy={copyToClipboard} />}
      {activeTab === 'sgpa-calculator' && <SgpaCalculatorSection onToast={onToast} onCopy={copyToClipboard} />}
      {activeTab === 'cgpa-to-percentage' && <CgpaToPercentageSection onToast={onToast} onCopy={copyToClipboard} />}
      {activeTab === 'percentage-to-cgpa' && <PercentageToCgpaSection onToast={onToast} onCopy={copyToClipboard} />}
      {activeTab === 'overall-cgpa-calculator' && <OverallCgpaSection onToast={onToast} onCopy={copyToClipboard} />}
    </div>
  );
}

// =============================================================================
// 0. SCIENTIFIC & SMART CALCULATOR SECTION
// =============================================================================
function ScientificCalculatorSection({ onToast, onCopy }) {
  const [expression, setExpression] = useState('');
  const [result, setResult] = useState('0');
  const [previewResult, setPreviewResult] = useState('');
  const [isDeg, setIsDeg] = useState(true);
  const [is2nd, setIs2nd] = useState(false);
  const [memory, setMemory] = useState(0);
  const [hasMemory, setHasMemory] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [activeSideTab, setActiveSideTab] = useState('history'); // 'history', 'solvers', 'conversions', 'keyboard'
  const [history, setHistory] = useState(() => {
    try {
      const saved = localStorage.getItem('datasphere_calc_history');
      return saved ? JSON.parse(saved) : [
        { id: 1, expr: 'sin(30) + cos(60)', res: '1', time: '10:15 AM' },
        { id: 2, expr: '5! / (3! * 2!)', res: '10', time: '10:14 AM' },
        { id: 3, expr: 'sqrt(144) + 2^5', res: '44', time: '10:12 AM' }
      ];
    } catch {
      return [];
    }
  });

  // Save history to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('datasphere_calc_history', JSON.stringify(history));
    } catch {}
  }, [history]);

  // Audio Click Feedback
  const playClickSound = (type = 'click') => {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'eval') {
        osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.08); // A5
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
        osc.start();
        osc.stop(ctx.currentTime + 0.12);
      } else {
        osc.frequency.setValueAtTime(750, ctx.currentTime);
        gain.gain.setValueAtTime(0.03, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
        osc.start();
        osc.stop(ctx.currentTime + 0.04);
      }
    } catch {}
  };

  // Math Evaluator Engine
  const evaluateMath = (exprStr, degMode = isDeg) => {
    if (!exprStr || !exprStr.trim()) return null;
    try {
      let clean = exprStr
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/−/g, '-')
        .replace(/\^/g, '**')
        .replace(/π/g, '(' + Math.PI + ')')
        .replace(/\be\b/g, '(' + Math.E + ')');

      // Factorial function
      const fact = (n) => {
        n = Math.floor(Number(n));
        if (n < 0) return NaN;
        if (n <= 1) return 1;
        let r = 1;
        for (let i = 2; i <= Math.min(n, 170); i++) r *= i;
        return r;
      };

      const toRad = (d) => degMode ? (d * Math.PI / 180) : d;
      const fromRad = (r) => degMode ? (r * 180 / Math.PI) : r;

      const scope = {
        sin: (x) => Math.sin(toRad(x)),
        cos: (x) => Math.cos(toRad(x)),
        tan: (x) => Math.tan(toRad(x)),
        asin: (x) => fromRad(Math.asin(x)),
        acos: (x) => fromRad(Math.acos(x)),
        atan: (x) => fromRad(Math.atan(x)),
        sqrt: (x) => Math.sqrt(x),
        cbrt: (x) => Math.cbrt(x),
        log: (x) => Math.log10(x),
        ln: (x) => Math.log(x),
        abs: (x) => Math.abs(x),
        exp: (x) => Math.exp(x),
        fact: fact
      };

      clean = clean.replace(/(\d+(\.\d+)?)!/g, 'scope.fact($1)');
      clean = clean.replace(/\bsin\(/g, 'scope.sin(')
                   .replace(/\bcos\(/g, 'scope.cos(')
                   .replace(/\btan\(/g, 'scope.tan(')
                   .replace(/\basin\(/g, 'scope.asin(')
                   .replace(/\bacos\(/g, 'scope.acos(')
                   .replace(/\batan\(/g, 'scope.atan(')
                   .replace(/\bsqrt\(/g, 'scope.sqrt(')
                   .replace(/\bcbrt\(/g, 'scope.cbrt(')
                   .replace(/\blog\(/g, 'scope.log(')
                   .replace(/\bln\(/g, 'scope.ln(')
                   .replace(/\babs\(/g, 'scope.abs(')
                   .replace(/\bexp\(/g, 'scope.exp(');

      // Handle simple percent e.g. 50% -> (50/100)
      clean = clean.replace(/(\d+(\.\d+)?)%/g, '($1/100)');

      const fn = new Function('scope', 'Math', 'return (' + clean + ');');
      const val = fn(scope, Math);

      if (typeof val === 'number' && !isNaN(val) && isFinite(val)) {
        return parseFloat(val.toFixed(12));
      }
      return val;
    } catch {
      return null;
    }
  };

  // Live preview update
  useEffect(() => {
    if (!expression) {
      setPreviewResult('');
      return;
    }
    const val = evaluateMath(expression);
    if (val !== null && typeof val === 'number' && !isNaN(val)) {
      setPreviewResult(val.toString());
    } else {
      setPreviewResult('');
    }
  }, [expression, isDeg]);

  // Insert token into expression
  const insertToken = (token) => {
    playClickSound('click');
    setExpression((prev) => {
      // If previous ended with function or operator, format nicely
      if (token === 'sin(' || token === 'cos(' || token === 'tan(' || 
          token === 'asin(' || token === 'acos(' || token === 'atan(' || 
          token === 'sqrt(' || token === 'log(' || token === 'ln(' || token === 'abs(') {
        return prev + token;
      }
      return prev + token;
    });
  };

  // Backspace
  const handleBackspace = () => {
    playClickSound('click');
    setExpression((prev) => {
      if (!prev) return '';
      // Check if ends with multi-letter function
      const funcs = ['asin(', 'acos(', 'atan(', 'sqrt(', 'log(', 'sin(', 'cos(', 'tan(', 'ln(', 'abs('];
      for (const f of funcs) {
        if (prev.endsWith(f)) {
          return prev.slice(0, -f.length);
        }
      }
      return prev.slice(0, -1);
    });
  };

  // Clear expression
  const handleClear = () => {
    playClickSound('click');
    setExpression('');
    setPreviewResult('');
  };

  // All Clear
  const handleAllClear = () => {
    playClickSound('click');
    setExpression('');
    setResult('0');
    setPreviewResult('');
  };

  // Evaluate Expression
  const handleEquals = () => {
    if (!expression.trim()) return;
    playClickSound('eval');
    const val = evaluateMath(expression);
    if (val === null || (typeof val === 'number' && isNaN(val))) {
      setResult('Syntax Error');
      onToast && onToast('Invalid mathematical syntax', 'error');
    } else {
      const resStr = val.toString();
      setResult(resStr);

      // Add to history
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const newEntry = {
        id: Date.now(),
        expr: expression,
        res: resStr,
        time: timeStr
      };
      setHistory((prev) => [newEntry, ...prev.slice(0, 49)]); // keep up to 50
    }
  };

  // Memory operations
  const handleMemory = (op) => {
    playClickSound('click');
    const currentVal = parseFloat(result) || 0;
    if (op === 'MC') {
      setMemory(0);
      setHasMemory(false);
      onToast && onToast('Memory Cleared (MC)');
    } else if (op === 'MR') {
      insertToken(memory.toString());
    } else if (op === 'M+') {
      setMemory((prev) => prev + currentVal);
      setHasMemory(true);
      onToast && onToast(`M+ (${currentVal})`);
    } else if (op === 'M-') {
      setMemory((prev) => prev - currentVal);
      setHasMemory(true);
      onToast && onToast(`M- (${currentVal})`);
    } else if (op === 'MS') {
      setMemory(currentVal);
      setHasMemory(true);
      onToast && onToast(`Memory Stored: ${currentVal}`);
    }
  };

  // Use previous answer
  const handleAns = () => {
    if (result && result !== 'Syntax Error') {
      insertToken(result);
    }
  };

  // Keyboard Listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Avoid capturing when user is typing inside an input/textarea in sub-panels
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) {
        return;
      }

      const key = e.key;
      if (key >= '0' && key <= '9') {
        insertToken(key);
      } else if (key === '.') {
        insertToken('.');
      } else if (key === '+') {
        insertToken(' + ');
      } else if (key === '-') {
        insertToken(' − ');
      } else if (key === '*' || key === 'x') {
        insertToken(' × ');
      } else if (key === '/') {
        e.preventDefault();
        insertToken(' ÷ ');
      } else if (key === '^') {
        insertToken('^');
      } else if (key === '%') {
        insertToken('%');
      } else if (key === '(' || key === ')') {
        insertToken(key);
      } else if (key === 'Enter' || key === '=') {
        e.preventDefault();
        handleEquals();
      } else if (key === 'Backspace') {
        handleBackspace();
      } else if (key === 'Escape') {
        handleAllClear();
      } else if (key.toLowerCase() === 's') {
        insertToken('sin(');
      } else if (key.toLowerCase() === 'c') {
        insertToken('cos(');
      } else if (key.toLowerCase() === 't') {
        insertToken('tan(');
      } else if (key.toLowerCase() === 'l') {
        insertToken('log(');
      } else if (key.toLowerCase() === 'p') {
        insertToken('π');
      } else if (key.toLowerCase() === 'e') {
        insertToken('e');
      } else if (key === '!') {
        insertToken('!');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  // Continued fraction conversion for exact math fractions
  const fractionResult = useMemo(() => {
    const val = parseFloat(result);
    if (isNaN(val) || !isFinite(val) || Number.isInteger(val)) return null;
    const sign = val < 0 ? '-' : '';
    let absVal = Math.abs(val);
    let h1 = 1, h2 = 0, k1 = 0, k2 = 1;
    let b = absVal;
    let iters = 0;
    do {
      let a = Math.floor(b);
      let aux = h1; h1 = a * h1 + h2; h2 = aux;
      aux = k1; k1 = a * k1 + k2; k2 = aux;
      if (Math.abs(b - a) < 1e-9) break;
      b = 1 / (b - a);
      iters++;
    } while (Math.abs(absVal - h1 / k1) > absVal * 1e-6 && iters < 25 && k1 < 10000);
    return `${sign}${h1}/${k1}`;
  }, [result]);

  // Base conversions
  const baseConversions = useMemo(() => {
    const val = parseFloat(result);
    if (isNaN(val) || !isFinite(val)) return null;
    const intVal = Math.round(val);
    return {
      bin: intVal >= 0 ? intVal.toString(2) : `-${Math.abs(intVal).toString(2)}`,
      hex: (intVal >= 0 ? intVal.toString(16) : `-${Math.abs(intVal).toString(16)}`).toUpperCase(),
      oct: intVal >= 0 ? intVal.toString(8) : `-${Math.abs(intVal).toString(8)}`,
      exp: val.toExponential(4)
    };
  }, [result]);

  // Quadratic Solver State
  const [qa, setQa] = useState(1);
  const [qb, setQb] = useState(-5);
  const [qc, setQc] = useState(6);

  const quadResult = useMemo(() => {
    const a = parseFloat(qa);
    const b = parseFloat(qb);
    const c = parseFloat(qc);
    if (isNaN(a) || isNaN(b) || isNaN(c) || a === 0) {
      return { error: 'Coefficient "a" must not be zero.' };
    }
    const d = b * b - 4 * a * c;
    const vertexX = -b / (2 * a);
    const vertexY = c - (b * b) / (4 * a);

    if (d > 0) {
      const r1 = (-b + Math.sqrt(d)) / (2 * a);
      const r2 = (-b - Math.sqrt(d)) / (2 * a);
      return {
        d: d.toFixed(2),
        type: 'Two Distinct Real Roots',
        roots: [`x₁ = ${r1.toFixed(4)}`, `x₂ = ${r2.toFixed(4)}`],
        vertex: `(${vertexX.toFixed(2)}, ${vertexY.toFixed(2)})`
      };
    } else if (d === 0) {
      const r = -b / (2 * a);
      return {
        d: '0',
        type: 'One Repeated Real Root',
        roots: [`x = ${r.toFixed(4)}`],
        vertex: `(${vertexX.toFixed(2)}, ${vertexY.toFixed(2)})`
      };
    } else {
      const realPart = (-b / (2 * a)).toFixed(3);
      const imagPart = (Math.sqrt(-d) / (2 * a)).toFixed(3);
      return {
        d: d.toFixed(2),
        type: 'Two Complex Conjugate Roots',
        roots: [`x₁ = ${realPart} + ${imagPart}i`, `x₂ = ${realPart} − ${imagPart}i`],
        vertex: `(${vertexX.toFixed(2)}, ${vertexY.toFixed(2)})`
      };
    }
  }, [qa, qb, qc]);

  // Percentage Assistant State
  const [pctP, setPctP] = useState(15);
  const [pctV, setPctV] = useState(250);
  const [pctV1, setPctV1] = useState(45);
  const [pctV2, setPctV2] = useState(180);
  const [pctOld, setPctOld] = useState(80);
  const [pctNew, setPctNew] = useState(120);

  return (
    <div className="student-tool-grid">
      {/* Left Column: The Main Scientific Console */}
      <div style={{
        background: 'linear-gradient(145deg, rgba(24, 30, 42, 0.96) 0%, rgba(12, 15, 22, 0.98) 100%)',
        border: '1px solid rgba(56, 189, 248, 0.3)',
        borderRadius: 20,
        padding: 24,
        boxShadow: '0 24px 60px -15px rgba(0, 0, 0, 0.8), 0 0 35px rgba(56, 189, 248, 0.12)',
        position: 'relative'
      }}>
        {/* Top Control Bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: '0.78rem',
              fontWeight: 800,
              letterSpacing: '0.08em',
              color: '#38bdf8',
              textTransform: 'uppercase'
            }}>
              <Sigma size={16} />
              PRO SCIENTIFIC ENGINE
            </span>

            {hasMemory && (
              <span style={{
                fontSize: '0.68rem',
                fontWeight: 800,
                padding: '2px 6px',
                borderRadius: 4,
                background: 'rgba(245, 158, 11, 0.25)',
                color: '#f59e0b',
                border: '1px solid rgba(245, 158, 11, 0.4)'
              }}>
                M = {memory}
              </span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {/* Sound Toggle */}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              title={soundEnabled ? 'Mute Key Clicks' : 'Enable Key Audio'}
              style={{
                background: soundEnabled ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                border: soundEnabled ? '1px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.08)',
                color: soundEnabled ? '#38bdf8' : '#94a3b8',
                borderRadius: 8,
                padding: '5px 8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                fontSize: '0.74rem'
              }}
            >
              {soundEnabled ? <Volume2 size={13} /> : <VolumeX size={13} />}
              <span>{soundEnabled ? 'Audio ON' : 'Audio OFF'}</span>
            </button>

            {/* Angle Mode Toggle: DEG vs RAD */}
            <button
              onClick={() => setIsDeg(!isDeg)}
              style={{
                background: isDeg ? 'rgba(52, 211, 153, 0.2)' : 'rgba(129, 140, 248, 0.2)',
                border: isDeg ? '1px solid #34d399' : '1px solid #818cf8',
                color: isDeg ? '#34d399' : '#818cf8',
                borderRadius: 8,
                padding: '5px 10px',
                cursor: 'pointer',
                fontSize: '0.75rem',
                fontWeight: 800
              }}
            >
              {isDeg ? 'DEG (360°)' : 'RAD (2π)'}
            </button>
          </div>
        </div>

        {/* OLED Glass Screen Display */}
        <div style={{
          background: 'linear-gradient(180deg, #05070a 0%, #090d14 100%)',
          border: '1px solid rgba(56, 189, 248, 0.35)',
          borderRadius: 14,
          padding: '16px 20px',
          boxShadow: 'inset 0 2px 10px rgba(0, 0, 0, 0.8), 0 0 20px rgba(56, 189, 248, 0.08)',
          marginBottom: 20,
          position: 'relative'
        }}>
          {/* Upper: Formula Expression */}
          <div style={{
            minHeight: 28,
            fontSize: '1.05rem',
            color: '#94a3b8',
            fontFamily: 'JetBrains Mono, monospace',
            overflowX: 'auto',
            whiteSpace: 'nowrap',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: 4
          }}>
            {expression ? (
              <span>{expression}</span>
            ) : (
              <span style={{ color: '#475569', fontSize: '0.9rem' }}>Type formula or use keypad...</span>
            )}
          </div>

          {/* Lower: High-Contrast LED Result & Live Preview */}
          <div style={{
            display: 'flex',
            alignItems: 'baseline',
            justifyContent: 'space-between',
            marginTop: 6,
            gap: 12
          }}>
            {/* Live Preview Pill */}
            <div style={{ minWidth: 60 }}>
              {previewResult && previewResult !== result && (
                <span style={{
                  fontSize: '0.82rem',
                  color: '#38bdf8',
                  background: 'rgba(56, 189, 248, 0.15)',
                  padding: '3px 8px',
                  borderRadius: 6,
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                  fontWeight: 600
                }}>
                  ≈ {previewResult}
                </span>
              )}
            </div>

            {/* Main Result */}
            <div 
              className="calc-screen-result"
              style={{
                color: result === 'Syntax Error' ? '#f43f5e' : '#ffffff',
                textShadow: result === 'Syntax Error' ? '0 0 15px rgba(244, 63, 94, 0.6)' : '0 0 20px rgba(56, 189, 248, 0.4)'
              }}
            >
              {result}
            </div>
          </div>

          {/* Quick Screen Actions */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, paddingTop: 10, borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
            <div style={{ display: 'flex', gap: 6 }}>
              {fractionResult && (
                <button
                  onClick={() => onCopy(fractionResult, `Fraction ${fractionResult} copied!`)}
                  style={{
                    background: 'rgba(129, 140, 248, 0.15)',
                    border: '1px solid rgba(129, 140, 248, 0.3)',
                    color: '#818cf8',
                    borderRadius: 6,
                    padding: '3px 8px',
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Fraction: {fractionResult}
                </button>
              )}
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => onCopy(result, 'Result copied to clipboard!')}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: '#cbd5e1',
                  borderRadius: 6,
                  padding: '4px 8px',
                  fontSize: '0.74rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4
                }}
              >
                <Copy size={12} />
                <span>Copy</span>
              </button>

              <button
                onClick={handleClear}
                style={{
                  background: 'rgba(244, 63, 94, 0.12)',
                  border: '1px solid rgba(244, 63, 94, 0.25)',
                  color: '#f43f5e',
                  borderRadius: 6,
                  padding: '4px 8px',
                  fontSize: '0.74rem',
                  cursor: 'pointer'
                }}
              >
                Clear
              </button>
            </div>
          </div>
        </div>

        {/* 2nd Function & Memory Key Row */}
        <div className="calc-top-row">
          <button
            onClick={() => setIs2nd(!is2nd)}
            style={{
              gridColumn: 'span 2',
              padding: '8px 4px',
              borderRadius: 8,
              border: is2nd ? '1px solid #c084fc' : '1px solid rgba(255,255,255,0.08)',
              background: is2nd ? 'rgba(192, 132, 252, 0.3)' : 'rgba(255, 255, 255, 0.04)',
              color: is2nd ? '#e879f9' : '#cbd5e1',
              fontWeight: 800,
              fontSize: '0.76rem',
              cursor: 'pointer'
            }}
          >
            2nd (Inv)
          </button>

          <button onClick={() => handleMemory('MC')} className="calc-btn-sm" style={memBtnStyle}>MC</button>
          <button onClick={() => handleMemory('MR')} className="calc-btn-sm" style={memBtnStyle}>MR</button>
          <button onClick={() => handleMemory('M+')} className="calc-btn-sm" style={memBtnStyle}>M+</button>
          <button onClick={() => handleMemory('M-')} className="calc-btn-sm" style={memBtnStyle}>M-</button>
          <button onClick={() => handleMemory('MS')} className="calc-btn-sm" style={memBtnStyle}>MS</button>

          <button onClick={() => insertToken('(')} className="calc-btn-sm" style={bracketBtnStyle}>(</button>
          <button onClick={() => insertToken(')')} className="calc-btn-sm" style={bracketBtnStyle}>)</button>
          <button onClick={handleAllClear} className="calc-btn-sm" style={acBtnStyle}>AC</button>
        </div>

        {/* Master Keypad Grid */}
        <div className="calc-main-keypad">
          {/* Row 1 */}
          <button onClick={() => insertToken(is2nd ? 'asin(' : 'sin(')} style={sciBtnStyle}>{is2nd ? 'sin⁻¹' : 'sin'}</button>
          <button onClick={() => insertToken(is2nd ? 'acos(' : 'cos(')} style={sciBtnStyle}>{is2nd ? 'cos⁻¹' : 'cos'}</button>
          <button onClick={() => insertToken(is2nd ? 'atan(' : 'tan(')} style={sciBtnStyle}>{is2nd ? 'tan⁻¹' : 'tan'}</button>
          <button onClick={() => insertToken('^')} style={sciBtnStyle}>xʸ</button>
          <button onClick={handleBackspace} style={delBtnStyle}>⌫ Delete</button>

          {/* Row 2 */}
          <button onClick={() => insertToken(is2nd ? 'exp(' : 'ln(')} style={sciBtnStyle}>{is2nd ? 'eˣ' : 'ln'}</button>
          <button onClick={() => insertToken(is2nd ? '10^' : 'log(')} style={sciBtnStyle}>{is2nd ? '10ˣ' : 'log'}</button>
          <button onClick={() => insertToken('7')} style={numBtnStyle}>7</button>
          <button onClick={() => insertToken('8')} style={numBtnStyle}>8</button>
          <button onClick={() => insertToken('9')} style={numBtnStyle}>9</button>

          {/* Row 3 */}
          <button onClick={() => insertToken(is2nd ? 'cbrt(' : 'sqrt(')} style={sciBtnStyle}>{is2nd ? '∛x' : '√x'}</button>
          <button onClick={() => insertToken('!')} style={sciBtnStyle}>x!</button>
          <button onClick={() => insertToken('4')} style={numBtnStyle}>4</button>
          <button onClick={() => insertToken('5')} style={numBtnStyle}>5</button>
          <button onClick={() => insertToken('6')} style={numBtnStyle}>6</button>

          {/* Row 4 */}
          <button onClick={() => insertToken('π')} style={sciBtnStyle}>π</button>
          <button onClick={() => insertToken('e')} style={sciBtnStyle}>e</button>
          <button onClick={() => insertToken('1')} style={numBtnStyle}>1</button>
          <button onClick={() => insertToken('2')} style={numBtnStyle}>2</button>
          <button onClick={() => insertToken('3')} style={numBtnStyle}>3</button>

          {/* Row 5: Operators & Equals */}
          <button onClick={() => insertToken('%')} style={opBtnStyle}>%</button>
          <button onClick={() => insertToken('0')} style={numBtnStyle}>0</button>
          <button onClick={() => insertToken('.')} style={numBtnStyle}>.</button>
          <button onClick={() => insertToken(' + ')} style={opBtnStyle}>+</button>
          <button onClick={() => insertToken(' − ')} style={opBtnStyle}>−</button>

          {/* Row 6 */}
          <button onClick={() => insertToken(' × ')} style={opBtnStyle}>×</button>
          <button onClick={() => insertToken(' ÷ ')} style={opBtnStyle}>÷</button>
          <button onClick={() => insertToken('abs(')} style={sciBtnStyle}>|x|</button>
          <button onClick={handleAns} style={ansBtnStyle}>ANS</button>
          <button onClick={handleEquals} style={equalsBtnStyle}>=</button>
        </div>
      </div>

      {/* Right Column: Assistant Dock (History, Solvers, Conversions, Guide) */}
      <div style={{
        background: 'rgba(18, 22, 29, 0.85)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: 20,
        padding: 20,
        boxShadow: '0 12px 36px rgba(0, 0, 0, 0.5)'
      }}>
        {/* Helper Tab Switcher */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6, marginBottom: 16 }}>
          {[
            { id: 'history', label: 'History', icon: History },
            { id: 'solvers', label: 'Solvers', icon: Target },
            { id: 'conversions', label: 'Bases', icon: Binary },
            { id: 'keyboard', label: 'Guide', icon: HelpCircle }
          ].map((tab) => {
            const Icon = tab.icon;
            const isSel = activeSideTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSideTab(tab.id)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 4,
                  padding: '8px 4px',
                  borderRadius: 10,
                  fontSize: '0.72rem',
                  fontWeight: isSel ? 700 : 500,
                  border: isSel ? '1px solid #38bdf8' : '1px solid rgba(255,255,255,0.06)',
                  background: isSel ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255, 255, 255, 0.02)',
                  color: isSel ? '#38bdf8' : '#94a3b8',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab 1: Persistent Calculation History */}
        {activeSideTab === 'history' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontSize: '0.76rem', fontWeight: 700, color: '#e2e8f0' }}>CALCULATION LOG</span>
              {history.length > 0 && (
                <button
                  onClick={() => {
                    setHistory([]);
                    onToast && onToast('History Cleared');
                  }}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#f43f5e',
                    fontSize: '0.72rem',
                    cursor: 'pointer',
                    fontWeight: 600
                  }}
                >
                  Clear All
                </button>
              )}
            </div>

            {history.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '36px 12px', color: '#64748b', fontSize: '0.82rem' }}>
                No past calculations yet.<br />Calculations are saved automatically!
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 380, overflowY: 'auto', paddingRight: 4 }}>
                {history.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      background: 'rgba(10, 13, 18, 0.65)',
                      border: '1px solid rgba(255, 255, 255, 0.06)',
                      borderRadius: 10,
                      padding: '10px 12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      transition: 'border-color 0.2s'
                    }}
                    onClick={() => insertToken(item.res)}
                    title="Click to insert result"
                  >
                    <div>
                      <div style={{ fontSize: '0.78rem', color: '#94a3b8', fontFamily: 'JetBrains Mono, monospace' }}>
                        {item.expr}
                      </div>
                      <div style={{ fontSize: '1rem', fontWeight: 800, color: '#38bdf8', marginTop: 2, fontFamily: 'JetBrains Mono, monospace' }}>
                        = {item.res}
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onCopy(item.res, `Copied ${item.res}!`);
                      }}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#64748b',
                        cursor: 'pointer',
                        padding: 4
                      }}
                      title="Copy result"
                    >
                      <Copy size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Math Solvers (Quadratic & Percentages) */}
        {activeSideTab === 'solvers' && (
          <div>
            <h4 style={{ fontSize: '0.84rem', fontWeight: 700, color: '#38bdf8', margin: '0 0 10px' }}>
              Quadratic Equation Solver (ax² + bx + c = 0)
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 12 }}>
              <div>
                <label style={{ fontSize: '0.7rem', color: '#94a3b8' }}>a</label>
                <input
                  type="number"
                  value={qa}
                  onChange={(e) => setQa(e.target.value)}
                  style={solverInputStyle}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.7rem', color: '#94a3b8' }}>b</label>
                <input
                  type="number"
                  value={qb}
                  onChange={(e) => setQb(e.target.value)}
                  style={solverInputStyle}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.7rem', color: '#94a3b8' }}>c</label>
                <input
                  type="number"
                  value={qc}
                  onChange={(e) => setQc(e.target.value)}
                  style={solverInputStyle}
                />
              </div>
            </div>

            {quadResult.error ? (
              <div style={{ fontSize: '0.75rem', color: '#f43f5e' }}>{quadResult.error}</div>
            ) : (
              <div style={{ background: 'rgba(10, 13, 18, 0.7)', padding: 12, borderRadius: 10, border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Discriminant D = {quadResult.d} ({quadResult.type})</div>
                <div style={{ display: 'flex', gap: 10, marginTop: 6, flexWrap: 'wrap' }}>
                  {quadResult.roots.map((r, i) => (
                    <span key={i} style={{ fontSize: '0.9rem', fontWeight: 800, color: '#34d399', background: 'rgba(52,211,153,0.15)', padding: '3px 8px', borderRadius: 6 }}>
                      {r}
                    </span>
                  ))}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: 6 }}>
                  Parabola Vertex: {quadResult.vertex}
                </div>
              </div>
            )}

            <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.08)', margin: '16px 0' }} />

            <h4 style={{ fontSize: '0.84rem', fontWeight: 700, color: '#f59e0b', margin: '0 0 10px' }}>
              Percentage Assistant
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ background: 'rgba(10, 13, 18, 0.7)', padding: 10, borderRadius: 8, fontSize: '0.78rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  <span>What is</span>
                  <input type="number" value={pctP} onChange={(e) => setPctP(e.target.value)} style={miniInputStyle} />
                  <span>% of</span>
                  <input type="number" value={pctV} onChange={(e) => setPctV(e.target.value)} style={miniInputStyle} />
                  <span>?</span>
                </div>
                <div style={{ fontWeight: 800, color: '#f59e0b' }}>
                  = {((parseFloat(pctP) || 0) / 100 * (parseFloat(pctV) || 0)).toFixed(2)}
                </div>
              </div>

              <div style={{ background: 'rgba(10, 13, 18, 0.7)', padding: 10, borderRadius: 8, fontSize: '0.78rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  <span>% Change from</span>
                  <input type="number" value={pctOld} onChange={(e) => setPctOld(e.target.value)} style={miniInputStyle} />
                  <span>to</span>
                  <input type="number" value={pctNew} onChange={(e) => setPctNew(e.target.value)} style={miniInputStyle} />
                </div>
                <div style={{ fontWeight: 800, color: (parseFloat(pctNew) >= parseFloat(pctOld)) ? '#34d399' : '#f43f5e' }}>
                  = {parseFloat(pctOld) !== 0 ? (((parseFloat(pctNew) - parseFloat(pctOld)) / parseFloat(pctOld)) * 100).toFixed(2) : 0}%
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Base & Fraction Conversions */}
        {activeSideTab === 'conversions' && (
          <div>
            <span style={{ fontSize: '0.76rem', fontWeight: 700, color: '#e2e8f0', display: 'block', marginBottom: 10 }}>
              NUMBER BASE CONVERSIONS (FROM: {result})
            </span>

            {baseConversions ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={convBoxStyle}>
                  <span style={convLabelStyle}>EXACT FRACTION</span>
                  <span style={{ ...convValStyle, color: '#38bdf8' }}>{fractionResult || 'Not a decimal'}</span>
                </div>

                <div style={convBoxStyle}>
                  <span style={convLabelStyle}>BINARY (BASE 2)</span>
                  <span style={{ ...convValStyle, color: '#34d399' }}>0b{baseConversions.bin}</span>
                </div>

                <div style={convBoxStyle}>
                  <span style={convLabelStyle}>HEXADECIMAL (BASE 16)</span>
                  <span style={{ ...convValStyle, color: '#c084fc' }}>0x{baseConversions.hex}</span>
                </div>

                <div style={convBoxStyle}>
                  <span style={convLabelStyle}>OCTAL (BASE 8)</span>
                  <span style={{ ...convValStyle, color: '#f59e0b' }}>0o{baseConversions.oct}</span>
                </div>

                <div style={convBoxStyle}>
                  <span style={convLabelStyle}>SCIENTIFIC NOTATION</span>
                  <span style={{ ...convValStyle, color: '#cbd5e1' }}>{baseConversions.exp}</span>
                </div>
              </div>
            ) : (
              <div style={{ color: '#64748b', fontSize: '0.8rem', textAlign: 'center', padding: 20 }}>
                Calculate any number on the left to see instant representations.
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Keyboard Shortcuts Guide */}
        {activeSideTab === 'keyboard' && (
          <div>
            <span style={{ fontSize: '0.76rem', fontWeight: 700, color: '#e2e8f0', display: 'block', marginBottom: 10 }}>
              KEYBOARD POWER SHORTCUTS
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: '0.78rem' }}>
              {[
                { k: '0 - 9', d: 'Enter numbers' },
                { k: '+  -  *  /', d: 'Arithmetic operators' },
                { k: 'Enter / =', d: 'Calculate result' },
                { k: 'Backspace', d: 'Delete last character' },
                { k: 'Escape', d: 'All Clear (AC)' },
                { k: '^', d: 'Power (xʸ)' },
                { k: 's / c / t', d: 'sin( / cos( / tan(' },
                { k: 'l / p / e', d: 'log( / π / e constant' },
                { k: '!', d: 'Factorial (x!)' },
                { k: '(  )', d: 'Parentheses' }
              ].map((item, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 8px', borderRadius: 6, background: 'rgba(255,255,255,0.02)' }}>
                  <kbd style={{ background: 'rgba(56, 189, 248, 0.15)', border: '1px solid rgba(56, 189, 248, 0.3)', color: '#38bdf8', padding: '2px 6px', borderRadius: 4, fontFamily: 'JetBrains Mono, monospace', fontWeight: 700 }}>
                    {item.k}
                  </kbd>
                  <span style={{ color: '#94a3b8' }}>{item.d}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Button Style Constants for Scientific Calculator
const numBtnStyle = {
  padding: '14px 10px',
  borderRadius: 12,
  background: 'rgba(255, 255, 255, 0.05)',
  border: '1px solid rgba(255, 255, 255, 0.09)',
  color: '#ffffff',
  fontSize: '1.15rem',
  fontWeight: 700,
  cursor: 'pointer',
  transition: 'all 0.15s ease'
};

const sciBtnStyle = {
  padding: '14px 6px',
  borderRadius: 12,
  background: 'rgba(129, 140, 248, 0.12)',
  border: '1px solid rgba(129, 140, 248, 0.22)',
  color: '#cbd5e1',
  fontSize: '0.88rem',
  fontWeight: 700,
  cursor: 'pointer',
  transition: 'all 0.15s ease'
};

const opBtnStyle = {
  padding: '14px 10px',
  borderRadius: 12,
  background: 'rgba(56, 189, 248, 0.14)',
  border: '1px solid rgba(56, 189, 248, 0.35)',
  color: '#38bdf8',
  fontSize: '1.2rem',
  fontWeight: 800,
  cursor: 'pointer',
  transition: 'all 0.15s ease'
};

const equalsBtnStyle = {
  padding: '14px 10px',
  borderRadius: 12,
  background: 'linear-gradient(135deg, #38bdf8 0%, #34d399 100%)',
  border: 'none',
  color: '#090d16',
  fontSize: '1.5rem',
  fontWeight: 900,
  cursor: 'pointer',
  boxShadow: '0 0 20px rgba(56, 189, 248, 0.45)',
  transition: 'all 0.15s ease'
};

const ansBtnStyle = {
  padding: '14px 8px',
  borderRadius: 12,
  background: 'rgba(245, 158, 11, 0.15)',
  border: '1px solid rgba(245, 158, 11, 0.35)',
  color: '#f59e0b',
  fontSize: '0.88rem',
  fontWeight: 800,
  cursor: 'pointer'
};

const delBtnStyle = {
  padding: '14px 6px',
  borderRadius: 12,
  background: 'rgba(244, 63, 94, 0.12)',
  border: '1px solid rgba(244, 63, 94, 0.3)',
  color: '#f43f5e',
  fontSize: '0.8rem',
  fontWeight: 700,
  cursor: 'pointer'
};

const memBtnStyle = {
  padding: '8px 2px',
  borderRadius: 6,
  background: 'rgba(255, 255, 255, 0.03)',
  border: '1px solid rgba(255, 255, 255, 0.06)',
  color: '#94a3b8',
  fontSize: '0.72rem',
  fontWeight: 700,
  cursor: 'pointer'
};

const bracketBtnStyle = {
  padding: '8px 2px',
  borderRadius: 6,
  background: 'rgba(56, 189, 248, 0.08)',
  border: '1px solid rgba(56, 189, 248, 0.2)',
  color: '#38bdf8',
  fontSize: '0.8rem',
  fontWeight: 800,
  cursor: 'pointer'
};

const acBtnStyle = {
  padding: '8px 2px',
  borderRadius: 6,
  background: 'rgba(244, 63, 94, 0.2)',
  border: '1px solid rgba(244, 63, 94, 0.4)',
  color: '#f43f5e',
  fontSize: '0.76rem',
  fontWeight: 800,
  cursor: 'pointer'
};

const solverInputStyle = {
  width: '100%',
  padding: '6px 8px',
  borderRadius: 6,
  background: 'rgba(255, 255, 255, 0.05)',
  border: '1px solid rgba(255, 255, 255, 0.12)',
  color: '#ffffff',
  fontWeight: 700,
  outline: 'none',
  fontSize: '0.85rem'
};

const miniInputStyle = {
  width: 55,
  padding: '3px 6px',
  borderRadius: 4,
  background: 'rgba(255, 255, 255, 0.08)',
  border: '1px solid rgba(255, 255, 255, 0.15)',
  color: '#38bdf8',
  fontWeight: 700,
  fontSize: '0.78rem',
  outline: 'none'
};

const convBoxStyle = {
  background: 'rgba(10, 13, 18, 0.7)',
  padding: '8px 12px',
  borderRadius: 8,
  border: '1px solid rgba(255, 255, 255, 0.05)',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center'
};

const convLabelStyle = {
  fontSize: '0.7rem',
  color: '#94a3b8',
  fontWeight: 600
};

const convValStyle = {
  fontSize: '0.85rem',
  fontWeight: 800,
  fontFamily: 'JetBrains Mono, monospace'
};

// =============================================================================
// 1. CGPA CALCULATOR SECTION
// =============================================================================
function CgpaCalculatorSection({ onToast, onCopy }) {
  const [scale, setScale] = useState(10); // 10 or 4
  const [isWeighted, setIsWeighted] = useState(true);
  const [multiplier, setMultiplier] = useState(9.5);
  const [semesters, setSemesters] = useState([
    { id: 1, name: 'Semester 1', gpa: '8.40', credits: '22' },
    { id: 2, name: 'Semester 2', gpa: '8.75', credits: '24' },
    { id: 3, name: 'Semester 3', gpa: '8.20', credits: '20' },
    { id: 4, name: 'Semester 4', gpa: '8.90', credits: '22' }
  ]);

  const addSemester = () => {
    const nextNum = semesters.length + 1;
    setSemesters([...semesters, { id: Date.now(), name: `Semester ${nextNum}`, gpa: '8.00', credits: '22' }]);
  };

  const removeSemester = (id) => {
    if (semesters.length <= 1) {
      onToast && onToast('At least 1 semester is required', 'error');
      return;
    }
    setSemesters(semesters.filter(s => s.id !== id));
  };

  const updateSemester = (id, field, value) => {
    setSemesters(semesters.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const loadDemo = () => {
    setSemesters([
      { id: 1, name: 'Semester 1', gpa: '8.60', credits: '22' },
      { id: 2, name: 'Semester 2', gpa: '8.85', credits: '24' },
      { id: 3, name: 'Semester 3', gpa: '9.10', credits: '20' },
      { id: 4, name: 'Semester 4', gpa: '8.75', credits: '22' },
      { id: 5, name: 'Semester 5', gpa: '9.25', credits: '24' },
      { id: 6, name: 'Semester 6', gpa: '9.40', credits: '22' }
    ]);
    onToast && onToast('Demo 6-semester grades loaded!');
  };

  const clearAll = () => {
    setSemesters([
      { id: 1, name: 'Semester 1', gpa: '', credits: '20' }
    ]);
  };

  // Calculations
  const stats = useMemo(() => {
    let totalCredits = 0;
    let totalQualityPoints = 0;
    let simpleGpaSum = 0;
    let validCount = 0;

    semesters.forEach(s => {
      const gpaVal = parseFloat(s.gpa);
      const creditVal = parseFloat(s.credits) || 0;

      if (!isNaN(gpaVal) && gpaVal >= 0) {
        validCount++;
        simpleGpaSum += gpaVal;
        if (creditVal > 0) {
          totalCredits += creditVal;
          totalQualityPoints += gpaVal * creditVal;
        }
      }
    });

    let cgpa = 0;
    if (isWeighted && totalCredits > 0) {
      cgpa = totalQualityPoints / totalCredits;
    } else if (!isWeighted && validCount > 0) {
      cgpa = simpleGpaSum / validCount;
    }

    const percentage = cgpa * multiplier;

    let standing = 'Pass Class';
    let standingColor = '#38bdf8';
    let gradeLabel = 'P';

    if (scale === 10) {
      if (cgpa >= 8.5) { standing = 'First Class with Distinction'; standingColor = '#34d399'; gradeLabel = 'O / A+'; }
      else if (cgpa >= 7.0) { standing = 'First Class'; standingColor = '#38bdf8'; gradeLabel = 'A'; }
      else if (cgpa >= 6.0) { standing = 'Second Class'; standingColor = '#fbbf24'; gradeLabel = 'B+'; }
      else if (cgpa >= 5.0) { standing = 'Higher Pass Class'; standingColor = '#fb923c'; gradeLabel = 'B'; }
      else if (cgpa >= 4.0) { standing = 'Pass Class'; standingColor = '#ec4899'; gradeLabel = 'C'; }
      else { standing = 'Fail / Backlog'; standingColor = '#f43f5e'; gradeLabel = 'F'; }
    } else {
      if (cgpa >= 3.7) { standing = 'Summa Cum Laude / Outstanding'; standingColor = '#34d399'; gradeLabel = 'A+'; }
      else if (cgpa >= 3.0) { standing = 'Magna Cum Laude / Excellent'; standingColor = '#38bdf8'; gradeLabel = 'A'; }
      else if (cgpa >= 2.5) { standing = 'Good Standing'; standingColor = '#fbbf24'; gradeLabel = 'B'; }
      else if (cgpa >= 2.0) { standing = 'Satisfactory'; standingColor = '#fb923c'; gradeLabel = 'C'; }
      else { standing = 'Academic Probation'; standingColor = '#f43f5e'; gradeLabel = 'F'; }
    }

    return {
      cgpa: cgpa.toFixed(2),
      percentage: percentage.toFixed(2),
      totalCredits,
      totalQualityPoints: totalQualityPoints.toFixed(1),
      validCount,
      standing,
      standingColor,
      gradeLabel
    };
  }, [semesters, isWeighted, scale, multiplier]);

  return (
    <div className="student-tool-grid">
      {/* Left Column: Semester Input List */}
      <div style={{
        background: 'rgba(18, 22, 29, 0.75)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: 16,
        padding: 24,
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
      }}>
        {/* Controls Bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 4px', color: '#ffffff' }}>
              Semester Grade Point Average (SGPA) Entries
            </h3>
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8' }}>
              Add all completed semesters with SGPA and credit hours.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={loadDemo}
              style={{
                background: 'rgba(129, 140, 248, 0.15)',
                border: '1px solid rgba(129, 140, 248, 0.35)',
                color: '#818cf8',
                borderRadius: 8,
                padding: '6px 12px',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Demo Data
            </button>
            <button
              onClick={clearAll}
              style={{
                background: 'rgba(244, 63, 94, 0.12)',
                border: '1px solid rgba(244, 63, 94, 0.3)',
                color: '#f43f5e',
                borderRadius: 8,
                padding: '6px 12px',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Clear
            </button>
          </div>
        </div>

        {/* Configuration Switches */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 12,
          padding: '12px 14px',
          background: 'rgba(10, 13, 18, 0.65)',
          borderRadius: 12,
          border: '1px solid rgba(255, 255, 255, 0.05)',
          marginBottom: 20
        }}>
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', display: 'block', marginBottom: 6 }}>
              GRADING SCALE
            </label>
            <div style={{ display: 'flex', gap: 6 }}>
              <button
                onClick={() => setScale(10)}
                style={{
                  flex: 1,
                  padding: '6px 10px',
                  borderRadius: 6,
                  border: scale === 10 ? '1px solid #818cf8' : '1px solid rgba(255,255,255,0.08)',
                  background: scale === 10 ? 'rgba(129, 140, 248, 0.25)' : 'transparent',
                  color: scale === 10 ? '#818cf8' : '#cbd5e1',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                10-Point Scale (India)
              </button>
              <button
                onClick={() => setScale(4)}
                style={{
                  flex: 1,
                  padding: '6px 10px',
                  borderRadius: 6,
                  border: scale === 4 ? '1px solid #818cf8' : '1px solid rgba(255,255,255,0.08)',
                  background: scale === 4 ? 'rgba(129, 140, 248, 0.25)' : 'transparent',
                  color: scale === 4 ? '#818cf8' : '#cbd5e1',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                4.0 Scale (US / Global)
              </button>
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', display: 'block', marginBottom: 6 }}>
              CALCULATION METHOD
            </label>
            <div style={{ display: 'flex', gap: 6 }}>
              <button
                onClick={() => setIsWeighted(true)}
                style={{
                  flex: 1,
                  padding: '6px 10px',
                  borderRadius: 6,
                  border: isWeighted ? '1px solid #34d399' : '1px solid rgba(255,255,255,0.08)',
                  background: isWeighted ? 'rgba(52, 211, 153, 0.2)' : 'transparent',
                  color: isWeighted ? '#34d399' : '#cbd5e1',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Credit-Weighted (Accurate)
              </button>
              <button
                onClick={() => setIsWeighted(false)}
                style={{
                  flex: 1,
                  padding: '6px 10px',
                  borderRadius: 6,
                  border: !isWeighted ? '1px solid #34d399' : '1px solid rgba(255,255,255,0.08)',
                  background: !isWeighted ? 'rgba(52, 211, 153, 0.2)' : 'transparent',
                  color: !isWeighted ? '#34d399' : '#cbd5e1',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Simple Average
              </button>
            </div>
          </div>
        </div>

        {/* Semesters Table */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div className="semester-entry-row header" style={{
            padding: '4px 10px',
            fontSize: '0.74rem',
            fontWeight: 700,
            color: '#64748b',
            letterSpacing: '0.05em'
          }}>
            <span>SEMESTER</span>
            <span>SGPA (0 - {scale})</span>
            <span>CREDIT HOURS</span>
            <span></span>
          </div>

          {semesters.map((sem, index) => (
            <div
              key={sem.id}
              className="semester-entry-row"
              style={{
                transition: 'border-color 0.2s ease'
              }}
            >
              <input
                type="text"
                value={sem.name}
                onChange={(e) => updateSemester(sem.id, 'name', e.target.value)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#ffffff',
                  fontWeight: 600,
                  fontSize: '0.86rem',
                  outline: 'none',
                  fontFamily: 'inherit'
                }}
              />

              <input
                type="number"
                step="0.01"
                min="0"
                max={scale}
                placeholder={`e.g. ${scale === 10 ? '8.50' : '3.60'}`}
                value={sem.gpa}
                onChange={(e) => updateSemester(sem.id, 'gpa', e.target.value)}
                style={{
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: 6,
                  padding: '6px 10px',
                  color: '#38bdf8',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  outline: 'none'
                }}
              />

              <input
                type="number"
                step="1"
                min="1"
                max="60"
                placeholder="Credits"
                disabled={!isWeighted}
                value={sem.credits}
                onChange={(e) => updateSemester(sem.id, 'credits', e.target.value)}
                style={{
                  background: isWeighted ? 'rgba(255, 255, 255, 0.04)' : 'rgba(255, 255, 255, 0.01)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: 6,
                  padding: '6px 10px',
                  color: isWeighted ? '#f59e0b' : '#64748b',
                  fontWeight: 600,
                  fontSize: '0.88rem',
                  outline: 'none'
                }}
              />

              <button
                onClick={() => removeSemester(sem.id)}
                title="Delete Semester"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#f43f5e',
                  cursor: 'pointer',
                  padding: 4,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: 0.8
                }}
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>

        {/* Add Semester Button */}
        <button
          onClick={addSemester}
          style={{
            width: '100%',
            marginTop: 16,
            padding: '10px',
            borderRadius: 10,
            background: 'rgba(129, 140, 248, 0.08)',
            border: '1px dashed rgba(129, 140, 248, 0.4)',
            color: '#818cf8',
            fontSize: '0.85rem',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            transition: 'background 0.2s ease'
          }}
        >
          <Plus size={16} />
          <span>Add Another Semester</span>
        </button>
      </div>

      {/* Right Column: Dynamic CGPA Result Card */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{
          background: 'linear-gradient(145deg, rgba(28, 34, 46, 0.95) 0%, rgba(14, 17, 24, 0.98) 100%)',
          border: '1px solid rgba(129, 140, 248, 0.35)',
          borderRadius: 18,
          padding: 26,
          boxShadow: '0 20px 48px -10px rgba(0, 0, 0, 0.7), 0 0 30px rgba(129, 140, 248, 0.15)',
          position: 'relative'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <span style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: '#818cf8'
            }}>
              CUMULATIVE RESULT
            </span>

            <button
              onClick={() => onCopy(`My CGPA is ${stats.cgpa}/${scale} (${stats.percentage}%) - ${stats.standing}`)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                padding: '4px 10px',
                borderRadius: 6,
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                color: '#cbd5e1',
                fontSize: '0.74rem',
                cursor: 'pointer'
              }}
            >
              <Copy size={12} />
              <span>Copy Score</span>
            </button>
          </div>

          {/* Glowing CGPA Hero */}
          <div style={{ textAlign: 'center', margin: '20px 0 24px' }}>
            <div style={{
              fontSize: '3.8rem',
              fontWeight: 900,
              fontFamily: 'JetBrains Mono, monospace',
              background: 'linear-gradient(135deg, #ffffff 10%, #818cf8 60%, #c084fc 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              filter: 'drop-shadow(0 0 20px rgba(129, 140, 248, 0.45))',
              lineHeight: 1
            }}>
              {stats.cgpa}
            </div>
            <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: 8 }}>
              Cumulative Grade Point Average ({scale}-Point Scale)
            </div>

            {/* Standing Pill */}
            <div style={{
              display: 'inline-block',
              marginTop: 14,
              padding: '6px 16px',
              borderRadius: 20,
              background: `${stats.standingColor}20`,
              border: `1px solid ${stats.standingColor}60`,
              color: stats.standingColor,
              fontWeight: 700,
              fontSize: '0.85rem',
              boxShadow: `0 0 14px ${stats.standingColor}30`
            }}>
              ★ {stats.standing} ({stats.gradeLabel})
            </div>
          </div>

          {/* Quick Metrics Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 12,
            paddingTop: 18,
            borderTop: '1px solid rgba(255, 255, 255, 0.08)'
          }}>
            <div style={{
              background: 'rgba(10, 13, 18, 0.7)',
              borderRadius: 10,
              padding: '12px 14px',
              border: '1px solid rgba(255, 255, 255, 0.05)'
            }}>
              <span style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block' }}>PERCENTAGE EQUIV.</span>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#34d399', marginTop: 4 }}>
                {stats.percentage}%
              </div>
              <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Formula: CGPA × {multiplier}</span>
            </div>

            <div style={{
              background: 'rgba(10, 13, 18, 0.7)',
              borderRadius: 10,
              padding: '12px 14px',
              border: '1px solid rgba(255, 255, 255, 0.05)'
            }}>
              <span style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block' }}>TOTAL CREDITS</span>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f59e0b', marginTop: 4 }}>
                {stats.totalCredits}
              </div>
              <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Across {stats.validCount} Semesters</span>
            </div>
          </div>

          {/* Percentage Multiplier Adjustment */}
          <div style={{ marginTop: 18 }}>
            <label style={{ fontSize: '0.74rem', color: '#94a3b8', display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span>Percentage Conversion Multiplier:</span>
              <span style={{ color: '#38bdf8', fontWeight: 700 }}>× {multiplier}</span>
            </label>
            <div style={{ display: 'flex', gap: 6 }}>
              {[9.5, 10.0, 9.0].map(val => (
                <button
                  key={val}
                  onClick={() => setMultiplier(val)}
                  style={{
                    flex: 1,
                    padding: '5px 8px',
                    borderRadius: 6,
                    fontSize: '0.75rem',
                    fontWeight: multiplier === val ? 700 : 500,
                    border: multiplier === val ? '1px solid #38bdf8' : '1px solid rgba(255,255,255,0.08)',
                    background: multiplier === val ? 'rgba(56, 189, 248, 0.2)' : 'transparent',
                    color: multiplier === val ? '#38bdf8' : '#cbd5e1',
                    cursor: 'pointer'
                  }}
                >
                  {val === 9.5 ? '9.5 (CBSE/AICTE)' : val === 10.0 ? '10 (Direct)' : `${val} (Custom)`}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Semester Trend Preview */}
        <div style={{
          background: 'rgba(18, 22, 29, 0.6)',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          borderRadius: 14,
          padding: 18
        }}>
          <h4 style={{ fontSize: '0.84rem', fontWeight: 700, color: '#e2e8f0', margin: '0 0 12px' }}>
            Semester Progression Trend
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {semesters.map((s, idx) => {
              const val = parseFloat(s.gpa) || 0;
              const pct = Math.min(100, (val / scale) * 100);
              return (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.78rem' }}>
                  <span style={{ width: 80, color: '#94a3b8', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                    {s.name}
                  </span>
                  <div style={{ flex: 1, height: 8, background: 'rgba(255,255,255,0.06)', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{
                      width: `${pct}%`,
                      height: '100%',
                      background: 'linear-gradient(90deg, #818cf8, #34d399)',
                      borderRadius: 4,
                      transition: 'width 0.3s ease'
                    }} />
                  </div>
                  <span style={{ width: 42, textAlign: 'right', fontWeight: 700, color: '#38bdf8' }}>
                    {val > 0 ? val.toFixed(2) : '-'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// 2. SGPA CALCULATOR SECTION
// =============================================================================
function SgpaCalculatorSection({ onToast, onCopy }) {
  const [scale, setScale] = useState(10);
  const [subjects, setSubjects] = useState([
    { id: 1, name: 'Data Structures & Algorithms', gradePoint: 9, credits: 4, letter: 'A+' },
    { id: 2, name: 'Database Management Systems', gradePoint: 10, credits: 4, letter: 'O' },
    { id: 3, name: 'Operating Systems', gradePoint: 8, credits: 3, letter: 'A' },
    { id: 4, name: 'Computer Networks', gradePoint: 9, credits: 3, letter: 'A+' },
    { id: 5, name: 'Web Engineering & Full-Stack', gradePoint: 10, credits: 3, letter: 'O' },
    { id: 6, name: 'DSA Laboratory', gradePoint: 10, credits: 2, letter: 'O' }
  ]);

  const GRADE_OPTIONS = [
    { label: 'O (Outstanding)', points: 10 },
    { label: 'A+ (Excellent)', points: 9 },
    { label: 'A (Very Good)', points: 8 },
    { label: 'B+ (Good)', points: 7 },
    { label: 'B (Above Average)', points: 6 },
    { label: 'C (Average)', points: 5 },
    { label: 'P (Pass)', points: 4 },
    { label: 'F (Fail)', points: 0 }
  ];

  const addSubject = () => {
    const nextNum = subjects.length + 1;
    setSubjects([...subjects, { id: Date.now(), name: `Subject ${nextNum}`, gradePoint: 8, credits: 3, letter: 'A' }]);
  };

  const removeSubject = (id) => {
    if (subjects.length <= 1) {
      onToast && onToast('At least 1 subject is required', 'error');
      return;
    }
    setSubjects(subjects.filter(s => s.id !== id));
  };

  const updateSubject = (id, field, value) => {
    setSubjects(subjects.map(s => {
      if (s.id === id) {
        if (field === 'gradePoint') {
          const num = parseFloat(value) || 0;
          return { ...s, gradePoint: num };
        }
        return { ...s, [field]: value };
      }
      return s;
    }));
  };

  const loadSample = () => {
    setSubjects([
      { id: 1, name: 'Engineering Mathematics', gradePoint: 9, credits: 4 },
      { id: 2, name: 'Theory of Computation', gradePoint: 8, credits: 4 },
      { id: 3, name: 'Artificial Intelligence', gradePoint: 10, credits: 3 },
      { id: 4, name: 'Software Engineering', gradePoint: 9, credits: 3 },
      { id: 5, name: 'Cloud Computing Lab', gradePoint: 10, credits: 2 }
    ]);
    onToast && onToast('Loaded B.Tech 5-course semester subjects!');
  };

  const sgpaStats = useMemo(() => {
    let totalCredits = 0;
    let earnedPoints = 0;

    subjects.forEach(s => {
      const c = parseFloat(s.credits) || 0;
      const g = parseFloat(s.gradePoint) || 0;
      if (c > 0) {
        totalCredits += c;
        earnedPoints += c * g;
      }
    });

    const sgpa = totalCredits > 0 ? (earnedPoints / totalCredits) : 0;
    const percentage = sgpa * 9.5;

    let gradeTitle = 'Outstanding Performance';
    let gradeColor = '#34d399';

    if (sgpa >= 9.0) { gradeTitle = 'Outstanding (O)'; gradeColor = '#34d399'; }
    else if (sgpa >= 8.0) { gradeTitle = 'Excellent (A+)'; gradeColor = '#38bdf8'; }
    else if (sgpa >= 7.0) { gradeTitle = 'Very Good (A)'; gradeColor = '#818cf8'; }
    else if (sgpa >= 6.0) { gradeTitle = 'Good (B+)'; gradeColor = '#fbbf24'; }
    else if (sgpa >= 5.0) { gradeTitle = 'Above Average (B)'; gradeColor = '#fb923c'; }
    else if (sgpa >= 4.0) { gradeTitle = 'Pass (P)'; gradeColor = '#ec4899'; }
    else { gradeTitle = 'Needs Improvement / Fail (F)'; gradeColor = '#f43f5e'; }

    return {
      sgpa: sgpa.toFixed(2),
      percentage: percentage.toFixed(2),
      totalCredits,
      earnedPoints: earnedPoints.toFixed(1),
      gradeTitle,
      gradeColor
    };
  }, [subjects]);

  return (
    <div className="student-tool-grid">
      {/* Left Column: Subject Entry List */}
      <div style={{
        background: 'rgba(18, 22, 29, 0.75)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: 16,
        padding: 24,
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 4px', color: '#ffffff' }}>
              Semester Subject Courses
            </h3>
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8' }}>
              Enter each theory & lab course with assigned credit weightage.
            </p>
          </div>

          <button
            onClick={loadSample}
            style={{
              background: 'rgba(56, 189, 248, 0.15)',
              border: '1px solid rgba(56, 189, 248, 0.35)',
              color: '#38bdf8',
              borderRadius: 8,
              padding: '6px 12px',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Load Sample
          </button>
        </div>

        {/* Subjects Table */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div className="subject-entry-row header" style={{
            padding: '4px 10px',
            fontSize: '0.74rem',
            fontWeight: 700,
            color: '#64748b',
            letterSpacing: '0.05em'
          }}>
            <span>COURSE / SUBJECT</span>
            <span>GRADE (POINTS)</span>
            <span>CREDITS</span>
            <span></span>
          </div>

          {subjects.map((sub) => (
            <div
              key={sub.id}
              className="subject-entry-row"
            >
              <input
                type="text"
                value={sub.name}
                onChange={(e) => updateSubject(sub.id, 'name', e.target.value)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#ffffff',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  outline: 'none'
                }}
              />

              <select
                value={sub.gradePoint}
                onChange={(e) => updateSubject(sub.id, 'gradePoint', Number(e.target.value))}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: 6,
                  padding: '6px 8px',
                  color: '#38bdf8',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  outline: 'none'
                }}
              >
                {GRADE_OPTIONS.map(opt => (
                  <option key={opt.points} value={opt.points} style={{ background: '#090d16', color: '#ffffff' }}>
                    {opt.label} ({opt.points} pts)
                  </option>
                ))}
              </select>

              <input
                type="number"
                step="0.5"
                min="0.5"
                max="10"
                value={sub.credits}
                onChange={(e) => updateSubject(sub.id, 'credits', e.target.value)}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: 6,
                  padding: '6px 10px',
                  color: '#f59e0b',
                  fontWeight: 700,
                  fontSize: '0.86rem',
                  outline: 'none'
                }}
              />

              <button
                onClick={() => removeSubject(sub.id)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#f43f5e',
                  cursor: 'pointer',
                  padding: 4,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>

        <button
          onClick={addSubject}
          style={{
            width: '100%',
            marginTop: 16,
            padding: '10px',
            borderRadius: 10,
            background: 'rgba(56, 189, 248, 0.08)',
            border: '1px dashed rgba(56, 189, 248, 0.4)',
            color: '#38bdf8',
            fontSize: '0.85rem',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8
          }}
        >
          <Plus size={16} />
          <span>Add Subject Course</span>
        </button>
      </div>

      {/* Right Column: SGPA Score Display */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{
          background: 'linear-gradient(145deg, rgba(28, 34, 46, 0.95) 0%, rgba(14, 17, 24, 0.98) 100%)',
          border: '1px solid rgba(56, 189, 248, 0.35)',
          borderRadius: 18,
          padding: 26,
          boxShadow: '0 20px 48px -10px rgba(0, 0, 0, 0.7), 0 0 30px rgba(56, 189, 248, 0.15)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#38bdf8', textTransform: 'uppercase' }}>
              SEMESTER GRADE REPORT
            </span>
            <button
              onClick={() => onCopy(`My Semester SGPA is ${sgpaStats.sgpa} (${sgpaStats.gradeTitle})`)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                padding: '4px 10px',
                borderRadius: 6,
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                color: '#cbd5e1',
                fontSize: '0.74rem',
                cursor: 'pointer'
              }}
            >
              <Copy size={12} />
              <span>Copy</span>
            </button>
          </div>

          <div style={{ textAlign: 'center', margin: '24px 0' }}>
            <div style={{
              fontSize: '4rem',
              fontWeight: 900,
              fontFamily: 'JetBrains Mono, monospace',
              background: 'linear-gradient(135deg, #ffffff 10%, #38bdf8 60%, #34d399 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              filter: 'drop-shadow(0 0 20px rgba(56, 189, 248, 0.5))',
              lineHeight: 1
            }}>
              {sgpaStats.sgpa}
            </div>
            <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: 8 }}>
              Semester Grade Point Average (SGPA)
            </div>

            <div style={{
              display: 'inline-block',
              marginTop: 14,
              padding: '6px 16px',
              borderRadius: 20,
              background: `${sgpaStats.gradeColor}20`,
              border: `1px solid ${sgpaStats.gradeColor}60`,
              color: sgpaStats.gradeColor,
              fontWeight: 700,
              fontSize: '0.85rem'
            }}>
              ● {sgpaStats.gradeTitle}
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 12,
            paddingTop: 18,
            borderTop: '1px solid rgba(255, 255, 255, 0.08)'
          }}>
            <div style={{ background: 'rgba(10, 13, 18, 0.7)', borderRadius: 10, padding: '12px 14px' }}>
              <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>TOTAL CREDITS</span>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f59e0b', marginTop: 4 }}>
                {sgpaStats.totalCredits}
              </div>
            </div>
            <div style={{ background: 'rgba(10, 13, 18, 0.7)', borderRadius: 10, padding: '12px 14px' }}>
              <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>TOTAL CREDIT PTS</span>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#34d399', marginTop: 4 }}>
                {sgpaStats.earnedPoints}
              </div>
            </div>
          </div>

          <div style={{
            marginTop: 18,
            padding: '12px 14px',
            borderRadius: 10,
            background: 'rgba(56, 189, 248, 0.08)',
            border: '1px solid rgba(56, 189, 248, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <span style={{ fontSize: '0.82rem', color: '#cbd5e1' }}>Semester Equivalent Percentage:</span>
            <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#38bdf8' }}>{sgpaStats.percentage}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// 3. CGPA TO PERCENTAGE CONVERTER SECTION
// =============================================================================
function CgpaToPercentageSection({ onToast, onCopy }) {
  const [cgpa, setCgpa] = useState(8.40);
  const [formulaKey, setFormulaKey] = useState('cbse');
  const [customMultiplier, setCustomMultiplier] = useState(9.5);

  const FORMULAS = {
    cbse: {
      name: 'CBSE & AICTE Standard (9.5×)',
      desc: 'Most widely used across Indian universities (Percentage = CGPA × 9.5)',
      calc: (c) => c * 9.5,
      expr: (c) => `${c} × 9.5`
    },
    anna: {
      name: 'Anna University / Direct (10×)',
      desc: 'Standard 10 multiplier (Percentage = CGPA × 10)',
      calc: (c) => c * 10,
      expr: (c) => `${c} × 10`
    },
    vtu: {
      name: 'VTU Visvesvaraya Formula',
      desc: 'VTU Engineering standard (Percentage = (CGPA - 0.75) × 10)',
      calc: (c) => (Math.max(0, c - 0.75)) * 10,
      expr: (c) => `(${c} - 0.75) × 10`
    },
    mu: {
      name: 'Mumbai University (MU)',
      desc: 'For CGPA >= 7: 7.1 × CGPA + 11; For CGPA < 7: 7.25 × CGPA + 11',
      calc: (c) => c >= 7 ? (7.1 * c + 11) : (7.25 * c + 11),
      expr: (c) => c >= 7 ? `7.1 × ${c} + 11` : `7.25 × ${c} + 11`
    },
    us: {
      name: 'US 4.0 Scale Conversion',
      desc: 'Percentage = (CGPA / 10) × 100 or 4.0 scale equivalent',
      calc: (c) => (c / 10) * 100,
      expr: (c) => `(${c} / 10) × 100`
    },
    custom: {
      name: 'Custom Multiplier',
      desc: 'Specify your college/university exact multiplier',
      calc: (c) => c * customMultiplier,
      expr: (c) => `${c} × ${customMultiplier}`
    }
  };

  const currentFormula = FORMULAS[formulaKey];
  const percentage = Math.min(100, Math.max(0, currentFormula.calc(cgpa)));

  let division = 'First Division with Distinction';
  let divColor = '#34d399';
  if (percentage >= 75) { division = 'First Class with Distinction'; divColor = '#34d399'; }
  else if (percentage >= 60) { division = 'First Division / First Class'; divColor = '#38bdf8'; }
  else if (percentage >= 50) { division = 'Second Division / Class'; divColor = '#fbbf24'; }
  else if (percentage >= 40) { division = 'Third / Pass Class'; divColor = '#fb923c'; }
  else { division = 'Fail'; divColor = '#f43f5e'; }

  return (
    <div className="student-tool-grid">
      {/* Left Column: Interactive Controls */}
      <div style={{
        background: 'rgba(18, 22, 29, 0.75)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: 16,
        padding: 24
      }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 6px', color: '#ffffff' }}>
          CGPA to Percentage Converter
        </h3>
        <p style={{ margin: '0 0 20px', fontSize: '0.82rem', color: '#94a3b8' }}>
          Convert your Cumulative Grade Point Average into exact percentage using university standards.
        </p>

        {/* CGPA Slider & Number Input */}
        <div style={{
          background: 'rgba(10, 13, 18, 0.7)',
          padding: '18px 20px',
          borderRadius: 14,
          border: '1px solid rgba(255, 255, 255, 0.06)',
          marginBottom: 20
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#e2e8f0' }}>YOUR CGPA (10-POINT SCALE)</span>
            <input
              type="number"
              step="0.01"
              min="0"
              max="10"
              value={cgpa}
              onChange={(e) => setCgpa(Math.min(10, Math.max(0, parseFloat(e.target.value) || 0)))}
              style={{
                width: 90,
                padding: '6px 10px',
                borderRadius: 8,
                background: 'rgba(56, 189, 248, 0.15)',
                border: '1px solid rgba(56, 189, 248, 0.4)',
                color: '#38bdf8',
                fontWeight: 800,
                fontSize: '1.1rem',
                textAlign: 'center',
                outline: 'none'
              }}
            />
          </div>

          <input
            type="range"
            min="0"
            max="10"
            step="0.05"
            value={cgpa}
            onChange={(e) => setCgpa(parseFloat(e.target.value))}
            style={{
              width: '100%',
              accentColor: '#34d399',
              cursor: 'pointer'
            }}
          />

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#64748b', marginTop: 6 }}>
            <span>0.00</span>
            <span>4.00 (Pass)</span>
            <span>6.00 (1st Div)</span>
            <span>8.00</span>
            <span>10.00 (Max)</span>
          </div>
        </div>

        {/* University Formula Selector */}
        <label style={{ fontSize: '0.76rem', fontWeight: 700, color: '#94a3b8', display: 'block', marginBottom: 8 }}>
          SELECT UNIVERSITY / BOARD FORMULA
        </label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {Object.entries(FORMULAS).map(([key, item]) => {
            const isSelected = formulaKey === key;
            return (
              <div
                key={key}
                onClick={() => setFormulaKey(key)}
                style={{
                  padding: '12px 14px',
                  borderRadius: 10,
                  border: isSelected ? '1px solid #34d399' : '1px solid rgba(255, 255, 255, 0.06)',
                  background: isSelected ? 'rgba(52, 211, 153, 0.14)' : 'rgba(10, 13, 18, 0.5)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ fontSize: '0.86rem', fontWeight: isSelected ? 700 : 600, color: isSelected ? '#34d399' : '#ffffff' }}>
                    {item.name}
                  </div>
                  <div style={{ fontSize: '0.74rem', color: '#94a3b8', marginTop: 2 }}>
                    {item.desc}
                  </div>
                </div>
                <div style={{
                  width: 18,
                  height: 18,
                  borderRadius: '50%',
                  border: isSelected ? '2px solid #34d399' : '2px solid rgba(255,255,255,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {isSelected && <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#34d399' }} />}
                </div>
              </div>
            );
          })}
        </div>

        {formulaKey === 'custom' && (
          <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: '0.82rem', color: '#cbd5e1' }}>Custom Multiplier:</span>
            <input
              type="number"
              step="0.05"
              value={customMultiplier}
              onChange={(e) => setCustomMultiplier(parseFloat(e.target.value) || 1)}
              style={{
                width: 80,
                padding: '5px 10px',
                borderRadius: 6,
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.15)',
                color: '#34d399',
                fontWeight: 700
              }}
            />
          </div>
        )}
      </div>

      {/* Right Column: Calculated Percentage Hero */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{
          background: 'linear-gradient(145deg, rgba(28, 34, 46, 0.95) 0%, rgba(14, 17, 24, 0.98) 100%)',
          border: '1px solid rgba(52, 211, 153, 0.35)',
          borderRadius: 18,
          padding: 28,
          boxShadow: '0 20px 48px -10px rgba(0, 0, 0, 0.7), 0 0 30px rgba(52, 211, 153, 0.15)',
          textAlign: 'center'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#34d399', letterSpacing: '0.08em' }}>
              CONVERTED PERCENTAGE
            </span>
            <button
              onClick={() => onCopy(`${cgpa} CGPA = ${percentage.toFixed(2)}% (${currentFormula.name})`)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                padding: '4px 10px',
                borderRadius: 6,
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                color: '#cbd5e1',
                fontSize: '0.74rem',
                cursor: 'pointer'
              }}
            >
              <Copy size={12} />
              <span>Copy</span>
            </button>
          </div>

          <div style={{ margin: '24px 0' }}>
            <div style={{
              fontSize: '4.2rem',
              fontWeight: 900,
              fontFamily: 'JetBrains Mono, monospace',
              background: 'linear-gradient(135deg, #ffffff 10%, #34d399 60%, #06b6d4 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              filter: 'drop-shadow(0 0 20px rgba(52, 211, 153, 0.45))',
              lineHeight: 1
            }}>
              {percentage.toFixed(2)}%
            </div>
            <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: 8 }}>
              Formula: {currentFormula.expr(cgpa)} = {percentage.toFixed(2)}%
            </div>

            <div style={{
              display: 'inline-block',
              marginTop: 16,
              padding: '6px 16px',
              borderRadius: 20,
              background: `${divColor}20`,
              border: `1px solid ${divColor}60`,
              color: divColor,
              fontWeight: 700,
              fontSize: '0.85rem'
            }}>
              ★ {division}
            </div>
          </div>

          {/* Quick Conversion Chart */}
          <div style={{
            background: 'rgba(10, 13, 18, 0.75)',
            borderRadius: 12,
            padding: 16,
            border: '1px solid rgba(255, 255, 255, 0.06)',
            textAlign: 'left'
          }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', display: 'block', marginBottom: 10 }}>
              QUICK REFERENCE LOOKUP
            </span>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: '0.78rem' }}>
              {[
                { c: 10.0, p: (10.0 * 9.5).toFixed(1) },
                { c: 9.0, p: (9.0 * 9.5).toFixed(1) },
                { c: 8.5, p: (8.5 * 9.5).toFixed(1) },
                { c: 8.0, p: (8.0 * 9.5).toFixed(1) },
                { c: 7.5, p: (7.5 * 9.5).toFixed(1) },
                { c: 7.0, p: (7.0 * 9.5).toFixed(1) },
                { c: 6.5, p: (6.5 * 9.5).toFixed(1) },
                { c: 6.0, p: (6.0 * 9.5).toFixed(1) }
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 6px', borderRadius: 4, background: 'rgba(255,255,255,0.02)' }}>
                  <span style={{ color: '#ffffff', fontWeight: 600 }}>{item.c.toFixed(1)} CGPA</span>
                  <span style={{ color: '#34d399', fontWeight: 700 }}>{item.p}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// 4. PERCENTAGE TO CGPA CONVERTER SECTION
// =============================================================================
function PercentageToCgpaSection({ onToast, onCopy }) {
  const [percent, setPercent] = useState(82.5);
  const [formulaKey, setFormulaKey] = useState('cbse');
  const [customDivisor, setCustomDivisor] = useState(9.5);

  const FORMULAS = {
    cbse: {
      name: 'Standard (Percentage ÷ 9.5)',
      calc: (p) => p / 9.5,
      expr: (p) => `${p} ÷ 9.5`
    },
    anna: {
      name: 'Direct Scale (Percentage ÷ 10)',
      calc: (p) => p / 10,
      expr: (p) => `${p} ÷ 10`
    },
    vtu: {
      name: 'VTU Reverse ((Percentage ÷ 10) + 0.75)',
      calc: (p) => (p / 10) + 0.75,
      expr: (p) => `(${p} ÷ 10) + 0.75`
    },
    us: {
      name: 'US 4.0 Scale GPA ((Percentage ÷ 100) × 4.0)',
      calc: (p) => (p / 100) * 4.0,
      expr: (p) => `(${p} ÷ 100) × 4.0`
    },
    custom: {
      name: 'Custom Divisor',
      calc: (p) => p / customDivisor,
      expr: (p) => `${p} ÷ ${customDivisor}`
    }
  };

  const currentFormula = FORMULAS[formulaKey];
  const maxScale = formulaKey === 'us' ? 4.0 : 10.0;
  const calculatedCgpa = Math.min(maxScale, Math.max(0, currentFormula.calc(percent)));

  // Equivalent Letter Grade
  let letterGrade = 'A+';
  let gradeColor = '#34d399';
  if (percent >= 90) { letterGrade = 'O (Outstanding)'; gradeColor = '#34d399'; }
  else if (percent >= 80) { letterGrade = 'A+ (Excellent)'; gradeColor = '#38bdf8'; }
  else if (percent >= 70) { letterGrade = 'A (Very Good)'; gradeColor = '#818cf8'; }
  else if (percent >= 60) { letterGrade = 'B+ (Good)'; gradeColor = '#fbbf24'; }
  else if (percent >= 50) { letterGrade = 'B (Above Average)'; gradeColor = '#fb923c'; }
  else if (percent >= 40) { letterGrade = 'C (Pass)'; gradeColor = '#ec4899'; }
  else { letterGrade = 'F (Fail)'; gradeColor = '#f43f5e'; }

  return (
    <div className="student-tool-grid">
      {/* Left Column */}
      <div style={{
        background: 'rgba(18, 22, 29, 0.75)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: 16,
        padding: 24
      }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 6px', color: '#ffffff' }}>
          Percentage to CGPA Converter
        </h3>
        <p style={{ margin: '0 0 20px', fontSize: '0.82rem', color: '#94a3b8' }}>
          Convert percentage marks into 10-point CGPA or 4.0 US GPA for college applications.
        </p>

        {/* Slider & Input */}
        <div style={{
          background: 'rgba(10, 13, 18, 0.7)',
          padding: '18px 20px',
          borderRadius: 14,
          border: '1px solid rgba(255, 255, 255, 0.06)',
          marginBottom: 20
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#e2e8f0' }}>YOUR PERCENTAGE (%)</span>
            <input
              type="number"
              step="0.1"
              min="0"
              max="100"
              value={percent}
              onChange={(e) => setPercent(Math.min(100, Math.max(0, parseFloat(e.target.value) || 0)))}
              style={{
                width: 90,
                padding: '6px 10px',
                borderRadius: 8,
                background: 'rgba(245, 158, 11, 0.15)',
                border: '1px solid rgba(245, 158, 11, 0.4)',
                color: '#f59e0b',
                fontWeight: 800,
                fontSize: '1.1rem',
                textAlign: 'center',
                outline: 'none'
              }}
            />
          </div>

          <input
            type="range"
            min="0"
            max="100"
            step="0.25"
            value={percent}
            onChange={(e) => setPercent(parseFloat(e.target.value))}
            style={{ width: '100%', accentColor: '#f59e0b', cursor: 'pointer' }}
          />

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#64748b', marginTop: 6 }}>
            <span>0%</span>
            <span>40% (Pass)</span>
            <span>60% (1st Div)</span>
            <span>75% (Distinction)</span>
            <span>100%</span>
          </div>
        </div>

        {/* Formula Options */}
        <label style={{ fontSize: '0.76rem', fontWeight: 700, color: '#94a3b8', display: 'block', marginBottom: 8 }}>
          CHOOSE CONVERSION FORMULA
        </label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {Object.entries(FORMULAS).map(([key, item]) => {
            const isSelected = formulaKey === key;
            return (
              <div
                key={key}
                onClick={() => setFormulaKey(key)}
                style={{
                  padding: '12px 14px',
                  borderRadius: 10,
                  border: isSelected ? '1px solid #f59e0b' : '1px solid rgba(255, 255, 255, 0.06)',
                  background: isSelected ? 'rgba(245, 158, 11, 0.14)' : 'rgba(10, 13, 18, 0.5)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <span style={{ fontSize: '0.86rem', fontWeight: isSelected ? 700 : 600, color: isSelected ? '#f59e0b' : '#ffffff' }}>
                  {item.name}
                </span>
                <div style={{
                  width: 18,
                  height: 18,
                  borderRadius: '50%',
                  border: isSelected ? '2px solid #f59e0b' : '2px solid rgba(255,255,255,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {isSelected && <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#f59e0b' }} />}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Column: Calculated CGPA */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{
          background: 'linear-gradient(145deg, rgba(28, 34, 46, 0.95) 0%, rgba(14, 17, 24, 0.98) 100%)',
          border: '1px solid rgba(245, 158, 11, 0.35)',
          borderRadius: 18,
          padding: 28,
          boxShadow: '0 20px 48px -10px rgba(0, 0, 0, 0.7), 0 0 30px rgba(245, 158, 11, 0.15)',
          textAlign: 'center'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#f59e0b', letterSpacing: '0.08em' }}>
              CALCULATED CGPA
            </span>
            <button
              onClick={() => onCopy(`${percent}% = ${calculatedCgpa.toFixed(2)} CGPA (${letterGrade})`)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                padding: '4px 10px',
                borderRadius: 6,
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                color: '#cbd5e1',
                fontSize: '0.74rem',
                cursor: 'pointer'
              }}
            >
              <Copy size={12} />
              <span>Copy</span>
            </button>
          </div>

          <div style={{ margin: '24px 0' }}>
            <div style={{
              fontSize: '4.2rem',
              fontWeight: 900,
              fontFamily: 'JetBrains Mono, monospace',
              background: 'linear-gradient(135deg, #ffffff 10%, #f59e0b 60%, #fb923c 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              filter: 'drop-shadow(0 0 20px rgba(245, 158, 11, 0.45))',
              lineHeight: 1
            }}>
              {calculatedCgpa.toFixed(2)}
            </div>
            <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: 8 }}>
              {currentFormula.expr(percent)} = {calculatedCgpa.toFixed(2)} / {maxScale}
            </div>

            <div style={{
              display: 'inline-block',
              marginTop: 16,
              padding: '6px 16px',
              borderRadius: 20,
              background: `${gradeColor}20`,
              border: `1px solid ${gradeColor}60`,
              color: gradeColor,
              fontWeight: 700,
              fontSize: '0.85rem'
            }}>
              ● Grade: {letterGrade}
            </div>
          </div>

          {/* US GPA vs 10-Point Comparison Box */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 12,
            background: 'rgba(10, 13, 18, 0.7)',
            borderRadius: 12,
            padding: '14px 16px',
            border: '1px solid rgba(255, 255, 255, 0.06)'
          }}>
            <div>
              <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>10-POINT SCALE</span>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#38bdf8', marginTop: 4 }}>
                {(percent / 9.5).toFixed(2)}
              </div>
            </div>
            <div>
              <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>4.0 US GPA SCALE</span>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#34d399', marginTop: 4 }}>
                {((percent / 100) * 4.0).toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// 5. OVERALL CGPA CALCULATOR & TARGET GOAL PLANNER
// =============================================================================
function OverallCgpaSection({ onToast, onCopy }) {
  const [totalSemesters, setTotalSemesters] = useState(8); // 4, 6, 8
  const [targetCgpa, setTargetCgpa] = useState(8.50);
  const [records, setRecords] = useState([
    { sem: 1, sgpa: '8.40', credits: '22', completed: true },
    { sem: 2, sgpa: '8.60', credits: '24', completed: true },
    { sem: 3, sgpa: '8.10', credits: '20', completed: true },
    { sem: 4, sgpa: '8.80', credits: '22', completed: true },
    { sem: 5, sgpa: '', credits: '22', completed: false },
    { sem: 6, sgpa: '', credits: '24', completed: false },
    { sem: 7, sgpa: '', credits: '20', completed: false },
    { sem: 8, sgpa: '', credits: '20', completed: false }
  ]);

  const handleProgramChange = (num) => {
    setTotalSemesters(num);
    const newRecords = [];
    for (let i = 1; i <= num; i++) {
      const existing = records.find(r => r.sem === i);
      if (existing) {
        newRecords.push(existing);
      } else {
        newRecords.push({ sem: i, sgpa: '', credits: '22', completed: false });
      }
    }
    setRecords(newRecords);
  };

  const updateRecord = (sem, field, value) => {
    setRecords(records.map(r => r.sem === sem ? { ...r, [field]: value } : r));
  };

  const toggleCompleted = (sem) => {
    setRecords(records.map(r => r.sem === sem ? { ...r, completed: !r.completed } : r));
  };

  // Calculations
  const stats = useMemo(() => {
    let completedCredits = 0;
    let earnedPoints = 0;
    let completedCount = 0;
    let remainingCredits = 0;
    let remainingCount = 0;

    records.forEach(r => {
      const c = parseFloat(r.credits) || 0;
      const g = parseFloat(r.sgpa);

      if (r.completed && !isNaN(g) && g >= 0 && c > 0) {
        completedCredits += c;
        earnedPoints += g * c;
        completedCount++;
      } else if (!r.completed && c > 0) {
        remainingCredits += c;
        remainingCount++;
      }
    });

    const currentCgpa = completedCredits > 0 ? (earnedPoints / completedCredits) : 0;
    const totalDegreeCredits = completedCredits + remainingCredits;

    // Target Planner
    const targetPointsRequired = targetCgpa * totalDegreeCredits;
    const pointsNeeded = targetPointsRequired - earnedPoints;
    const requiredSgpa = remainingCredits > 0 ? (pointsNeeded / remainingCredits) : null;

    let targetStatus = 'Possible';
    let targetColor = '#34d399';
    let targetMessage = '';

    if (remainingCount === 0) {
      if (currentCgpa >= targetCgpa) {
        targetStatus = 'Goal Achieved! 🎉';
        targetColor = '#34d399';
        targetMessage = 'Congratulations! You have achieved your graduation target CGPA.';
      } else {
        targetStatus = 'Degree Completed';
        targetColor = '#fbbf24';
        targetMessage = `Graduated with ${currentCgpa.toFixed(2)} CGPA.`;
      }
    } else if (requiredSgpa !== null) {
      if (requiredSgpa <= currentCgpa) {
        targetStatus = 'Very Achievable 🌟';
        targetColor = '#34d399';
        targetMessage = `You need an average SGPA of ${requiredSgpa.toFixed(2)} in remaining semesters.`;
      } else if (requiredSgpa <= 9.5) {
        targetStatus = 'Challenging but Doable 🎯';
        targetColor = '#38bdf8';
        targetMessage = `Aim for SGPA ${requiredSgpa.toFixed(2)} per semester to reach your goal.`;
      } else if (requiredSgpa <= 10.0) {
        targetStatus = 'High Effort Required 🔥';
        targetColor = '#f59e0b';
        targetMessage = `You need near perfect 9.5+ or 10.0 grades (${requiredSgpa.toFixed(2)} SGPA).`;
      } else {
        targetStatus = 'Mathematically Not Possible ⚠️';
        targetColor = '#f43f5e';
        targetMessage = `Even with 10.0 SGPA in all remaining semesters, max possible CGPA is ${((earnedPoints + 10 * remainingCredits) / totalDegreeCredits).toFixed(2)}.`;
      }
    }

    return {
      currentCgpa: currentCgpa.toFixed(2),
      completedCredits,
      totalDegreeCredits,
      completedCount,
      remainingCount,
      requiredSgpa: requiredSgpa !== null ? requiredSgpa.toFixed(2) : null,
      targetStatus,
      targetColor,
      targetMessage
    };
  }, [records, targetCgpa]);

  return (
    <div className="student-tool-grid">
      {/* Left Column: All Semesters Grid */}
      <div style={{
        background: 'rgba(18, 22, 29, 0.75)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: 16,
        padding: 24
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 4px', color: '#ffffff' }}>
              Overall Degree Semester Tracker
            </h3>
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8' }}>
              Track completed semesters vs upcoming semesters towards your degree.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 6 }}>
            {[4, 6, 8].map(num => (
              <button
                key={num}
                onClick={() => handleProgramChange(num)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 8,
                  border: totalSemesters === num ? '1px solid #ec4899' : '1px solid rgba(255,255,255,0.08)',
                  background: totalSemesters === num ? 'rgba(236, 72, 153, 0.2)' : 'transparent',
                  color: totalSemesters === num ? '#ec4899' : '#cbd5e1',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                {num === 4 ? '4 Sems (Masters)' : num === 6 ? '6 Sems (Bachelors)' : '8 Sems (B.Tech)'}
              </button>
            ))}
          </div>
        </div>

        {/* Semesters list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div className="overall-sem-row header" style={{
            gap: 10,
            padding: '4px 10px',
            fontSize: '0.74rem',
            fontWeight: 700,
            color: '#64748b'
          }}>
            <span>SEMESTER</span>
            <span>SGPA SCORED</span>
            <span>CREDITS</span>
            <span>STATUS</span>
          </div>

          {records.map(r => (
            <div
              key={r.sem}
              className="overall-sem-row"
              style={{
                background: r.completed ? 'rgba(13, 16, 22, 0.85)' : 'rgba(255, 255, 255, 0.02)',
                border: r.completed ? '1px solid rgba(255, 255, 255, 0.07)' : '1px dashed rgba(255, 255, 255, 0.08)'
              }}
            >
              <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#e2e8f0' }}>
                Sem {r.sem}
              </span>

              <input
                type="number"
                step="0.01"
                min="0"
                max="10"
                placeholder={r.completed ? 'e.g. 8.5' : 'Upcoming'}
                value={r.sgpa}
                onChange={(e) => updateRecord(r.sem, 'sgpa', e.target.value)}
                style={{
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: 6,
                  padding: '5px 8px',
                  color: '#38bdf8',
                  fontWeight: 700,
                  fontSize: '0.86rem',
                  outline: 'none'
                }}
              />

              <input
                type="number"
                min="1"
                max="50"
                value={r.credits}
                onChange={(e) => updateRecord(r.sem, 'credits', e.target.value)}
                style={{
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: 6,
                  padding: '5px 8px',
                  color: '#f59e0b',
                  fontWeight: 600,
                  fontSize: '0.86rem',
                  outline: 'none'
                }}
              />

              <button
                onClick={() => toggleCompleted(r.sem)}
                style={{
                  padding: '4px 8px',
                  borderRadius: 6,
                  border: r.completed ? '1px solid rgba(52, 211, 153, 0.4)' : '1px solid rgba(255,255,255,0.1)',
                  background: r.completed ? 'rgba(52, 211, 153, 0.18)' : 'transparent',
                  color: r.completed ? '#34d399' : '#64748b',
                  fontSize: '0.74rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                {r.completed ? 'Completed' : 'Upcoming'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Right Column: Goal Planner & Overall CGPA */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Current Overall CGPA */}
        <div style={{
          background: 'linear-gradient(145deg, rgba(28, 34, 46, 0.95) 0%, rgba(14, 17, 24, 0.98) 100%)',
          border: '1px solid rgba(236, 72, 153, 0.35)',
          borderRadius: 18,
          padding: 24,
          boxShadow: '0 20px 48px -10px rgba(0, 0, 0, 0.7), 0 0 30px rgba(236, 72, 153, 0.15)',
          textAlign: 'center'
        }}>
          <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#ec4899', letterSpacing: '0.08em' }}>
            CURRENT CUMULATIVE DEGREE CGPA
          </span>

          <div style={{ margin: '18px 0' }}>
            <div style={{
              fontSize: '3.8rem',
              fontWeight: 900,
              fontFamily: 'JetBrains Mono, monospace',
              background: 'linear-gradient(135deg, #ffffff 10%, #ec4899 60%, #c084fc 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              lineHeight: 1
            }}>
              {stats.currentCgpa}
            </div>
            <div style={{ fontSize: '0.82rem', color: '#94a3b8', marginTop: 8 }}>
              Based on {stats.completedCount} of {totalSemesters} Semesters Completed ({stats.completedCredits} Credits)
            </div>
          </div>
        </div>

        {/* Target CGPA Goal Planner */}
        <div style={{
          background: 'rgba(18, 22, 29, 0.85)',
          border: '1px solid rgba(129, 140, 248, 0.3)',
          borderRadius: 16,
          padding: 22
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <Target size={18} color="#818cf8" />
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0, color: '#ffffff' }}>
              Target CGPA Goal Planner
            </h4>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 14px',
            background: 'rgba(10, 13, 18, 0.7)',
            borderRadius: 10,
            marginBottom: 16
          }}>
            <span style={{ fontSize: '0.82rem', color: '#cbd5e1' }}>I want to graduate with:</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <input
                type="number"
                step="0.05"
                min="0"
                max="10"
                value={targetCgpa}
                onChange={(e) => setTargetCgpa(parseFloat(e.target.value) || 0)}
                style={{
                  width: 70,
                  padding: '4px 8px',
                  borderRadius: 6,
                  background: 'rgba(129, 140, 248, 0.2)',
                  border: '1px solid rgba(129, 140, 248, 0.4)',
                  color: '#818cf8',
                  fontWeight: 800,
                  fontSize: '0.95rem',
                  textAlign: 'center'
                }}
              />
              <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>CGPA</span>
            </div>
          </div>

          {stats.remainingCount > 0 ? (
            <div style={{
              padding: '14px 16px',
              borderRadius: 12,
              background: `${stats.targetColor}12`,
              border: `1px solid ${stats.targetColor}35`,
              textAlign: 'center'
            }}>
              <span style={{
                display: 'inline-block',
                fontSize: '0.78rem',
                fontWeight: 700,
                color: stats.targetColor,
                marginBottom: 6
              }}>
                ● {stats.targetStatus}
              </span>

              {stats.requiredSgpa && parseFloat(stats.requiredSgpa) <= 10.0 && (
                <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#ffffff', margin: '4px 0' }}>
                  SGPA <span style={{ color: stats.targetColor }}>{stats.requiredSgpa}</span> Required
                </div>
              )}

              <p style={{ fontSize: '0.8rem', color: '#cbd5e1', margin: '6px 0 0' }}>
                {stats.targetMessage}
              </p>
            </div>
          ) : (
            <div style={{ padding: '12px', textAlign: 'center', color: '#94a3b8', fontSize: '0.82rem' }}>
              All semesters are marked as completed!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
