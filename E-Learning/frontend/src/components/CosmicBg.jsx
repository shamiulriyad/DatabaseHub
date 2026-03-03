import React, { useRef } from 'react';
import { Box } from '@chakra-ui/react';

function CosmicBg() {
  const stars = useRef([]);
  if (!stars.current.length) {
    stars.current = Array.from({ length: 80 }, (_, i) => ({
      top: Math.random() * 100,
      left: Math.random() * 100,
      size: i % 7 === 0 ? 2 : 1,
      opacity: Math.random() * 0.7 + 0.1,
      duration: 2 + Math.random() * 4,
      delay: Math.random() * 5,
    }));
  }

  return (
    <Box position="fixed" inset={0} zIndex={0} pointerEvents="none" overflow="hidden">
      <style>{`
        @keyframes twinkle { 0%,100%{opacity:var(--op)} 50%{opacity:0.05} }
        @keyframes orb1 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(-50px,40px) scale(1.1)} }
        @keyframes orb2 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(40px,-50px)} }
        @keyframes orb3 { 0%,100%{transform:translate(0,0)} 33%{transform:translate(-20px,30px)} 66%{transform:translate(30px,-20px)} }
      `}</style>

      {stars.current.map((s, i) => (
        <Box key={i} position="absolute" borderRadius="full" bg="white"
          style={{ top: `${s.top}%`, left: `${s.left}%`, width: s.size, height: s.size, "--op": s.opacity,
            animation: `twinkle ${s.duration}s ease-in-out infinite`, animationDelay: `${s.delay}s` }} />
      ))}

      <Box position="absolute" top="-20%" right="-10%" w="700px" h="700px" borderRadius="full"
        style={{ background: "radial-gradient(circle, rgba(112,85,255,0.13) 0%, transparent 70%)", animation: "orb1 22s ease-in-out infinite" }} />
      <Box position="absolute" bottom="-15%" left="-10%" w="600px" h="600px" borderRadius="full"
        style={{ background: "radial-gradient(circle, rgba(251,191,36,0.08) 0%, transparent 70%)", animation: "orb2 28s ease-in-out infinite" }} />
      <Box position="absolute" top="35%" left="25%" w="400px" h="400px" borderRadius="full"
        style={{ background: "radial-gradient(circle, rgba(112,85,255,0.06) 0%, transparent 70%)", animation: "orb3 35s ease-in-out infinite" }} />
    </Box>
  );
}

export default CosmicBg;
