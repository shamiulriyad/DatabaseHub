import React from 'react';
import { Box, Flex, Text } from '@chakra-ui/react';
import { keyframes } from '@emotion/react';

// ── Keyframes ──────────────────────────────────────────────────────────────────
const floatKF = keyframes`
  0%   { transform: translateY(0px); }
  50%  { transform: translateY(-8px); }
  100% { transform: translateY(0px); }
`;

const shakeKF = keyframes`
  0%   { transform: translateX(0); }
  20%  { transform: translateX(-10px) rotate(-3deg); }
  40%  { transform: translateX(10px)  rotate(3deg); }
  60%  { transform: translateX(-7px)  rotate(-2deg); }
  80%  { transform: translateX(7px)   rotate(2deg); }
  100% { transform: translateX(0)     rotate(0deg); }
`;

const blinkKF = keyframes`
  0%, 90%, 100% { transform: scaleY(1); }
  95%            { transform: scaleY(0.1); }
`;

const pulseKF = keyframes`
  0%, 100% { opacity: 1; transform: scale(1); }
  50%       { opacity: 0.7; transform: scale(1.15); }
`;

const antennaKF = keyframes`
  0%, 100% { transform: rotate(-8deg); }
  50%       { transform: rotate(8deg); }
`;

const scanKF = keyframes`
  0%   { transform: translateX(-100%); opacity: 0; }
  20%  { opacity: 1; }
  80%  { opacity: 1; }
  100% { transform: translateX(100%); opacity: 0; }
`;

const successKF = keyframes`
  0%   { transform: scale(1); }
  30%  { transform: scale(1.12); }
  60%  { transform: scale(0.95); }
  100% { transform: scale(1); }
`;

// ── Robot Component ────────────────────────────────────────────────────────────
const Robot = ({ state = 'normal' }) => {
  const isCover   = state === 'coverEyes';
  const isWriting = state === 'writing';
  const isError   = state === 'error';
  const isSuccess = state === 'success';

  // Body animation
  const bodyAnim = isError
    ? `${shakeKF} 0.6s ease-in-out`
    : isSuccess
    ? `${successKF} 0.5s ease-in-out, ${floatKF} 3s ease-in-out 0.5s infinite`
    : `${floatKF} 3s ease-in-out infinite`;

  // Colors
  const headBg    = isError ? '#2d1a1a' : isSuccess ? '#0f2d1a' : '#1e1b4b';
  const headBorder= isError ? '#f87171' : isSuccess ? '#34d399' : '#7c3aed';
  const eyeColor  = isError ? '#f87171' : isSuccess ? '#34d399' : '#a78bfa';
  const glowColor = isError
    ? 'rgba(248,113,113,0.5)'
    : isSuccess
    ? 'rgba(52,211,153,0.5)'
    : 'rgba(124,58,237,0.5)';

  return (
    <Flex direction="column" align="center" gap={4} py={4}>

      {/* ── Whole robot wrapper ── */}
      <Box position="relative" animation={bodyAnim}>

        {/* Antenna */}
        <Flex justify="center" mb="-2px">
          <Box
            w="4px" h="22px"
            bg="linear-gradient(to top, #7c3aed, #c4b5fd)"
            borderRadius="full"
            transformOrigin="bottom center"
            animation={`${antennaKF} 2s ease-in-out infinite`}
          />
        </Flex>
        <Flex justify="center" mb="2px">
          <Box
            w="10px" h="10px"
            borderRadius="full"
            bg={isError ? '#f87171' : isSuccess ? '#34d399' : '#a78bfa'}
            boxShadow={`0 0 8px 3px ${glowColor}`}
            animation={`${pulseKF} 1.5s ease-in-out infinite`}
          />
        </Flex>

        {/* ── Head ── */}
        <Box
          w="140px"
          h="130px"
          borderRadius="24px"
          bg={headBg}
          border="2px solid"
          borderColor={headBorder}
          boxShadow={`0 0 24px ${glowColor}, inset 0 1px 0 rgba(255,255,255,0.08)`}
          position="relative"
          overflow="hidden"
          transition="all 0.4s ease"
        >
          {/* scanline shimmer */}
          {isWriting && (
            <Box
              position="absolute"
              top="0" bottom="0"
              w="40px"
              bgGradient="linear(to-r, transparent, rgba(167,139,250,0.2), transparent)"
              animation={`${scanKF} 1.4s ease-in-out infinite`}
              zIndex={1}
            />
          )}

          {/* Inner screen tint */}
          <Box
            position="absolute" inset="8px"
            borderRadius="16px"
            bg="rgba(0,0,0,0.35)"
            border="1px solid rgba(255,255,255,0.05)"
          />

          {/* ── Eyes row ── */}
          <Flex
            position="absolute"
            top="28px" left="0" right="0"
            justify="center"
            gap="24px"
            zIndex={2}
          >
            {/* Left eye */}
            <Box position="relative">
              {isCover ? (
                /* Covered eye — "X" */
                <Box w="28px" h="28px" display="flex" alignItems="center" justifyContent="center">
                  <Text fontSize="22px" lineHeight="1" color="#f87171" fontWeight="900">✕</Text>
                </Box>
              ) : (
                <Box
                  w="28px" h="28px"
                  borderRadius="8px"
                  bg={eyeColor}
                  boxShadow={`0 0 12px ${glowColor}`}
                  transformOrigin="center"
                  animation={`${blinkKF} 4s ease-in-out infinite`}
                  transition="background 0.3s"
                >
                  {/* pupil */}
                  <Box
                    w="10px" h="10px"
                    borderRadius="full"
                    bg="rgba(0,0,0,0.6)"
                    mx="auto"
                    mt="6px"
                    transition="transform 0.2s"
                    transform={isWriting ? 'translateX(-3px)' : 'none'}
                  />
                </Box>
              )}
            </Box>

            {/* Right eye */}
            <Box position="relative">
              {isCover ? (
                <Box w="28px" h="28px" display="flex" alignItems="center" justifyContent="center">
                  <Text fontSize="22px" lineHeight="1" color="#f87171" fontWeight="900">✕</Text>
                </Box>
              ) : (
                <Box
                  w="28px" h="28px"
                  borderRadius="8px"
                  bg={eyeColor}
                  boxShadow={`0 0 12px ${glowColor}`}
                  transformOrigin="center"
                  animation={`${blinkKF} 4s ease-in-out 0.3s infinite`}
                  transition="background 0.3s"
                >
                  <Box
                    w="10px" h="10px"
                    borderRadius="full"
                    bg="rgba(0,0,0,0.6)"
                    mx="auto"
                    mt="6px"
                    transition="transform 0.2s"
                    transform={isWriting ? 'translateX(3px)' : 'none'}
                  />
                </Box>
              )}
            </Box>
          </Flex>

          {/* ── Mouth ── */}
          <Box
            position="absolute"
            bottom="22px" left="0" right="0"
            display="flex"
            justifyContent="center"
            zIndex={2}
          >
            {isSuccess && (
              /* Big smile — arc via border-radius trick */
              <Box
                w="52px" h="14px"
                border="3px solid #34d399"
                borderTop="none"
                borderRadius="0 0 30px 30px"
                boxShadow="0 0 8px rgba(52,211,153,0.5)"
              />
            )}
            {isError && (
              /* Sad frown */
              <Box
                w="44px" h="12px"
                border="3px solid #f87171"
                borderBottom="none"
                borderRadius="30px 30px 0 0"
                boxShadow="0 0 8px rgba(248,113,113,0.5)"
              />
            )}
            {isWriting && (
              /* Wavy/typing line */
              <Flex gap="4px" align="center">
                {[0, 1, 2].map((i) => (
                  <Box
                    key={i}
                    w="8px" h="8px"
                    borderRadius="full"
                    bg="#a78bfa"
                    animation={`${pulseKF} 0.9s ease-in-out ${i * 0.2}s infinite`}
                  />
                ))}
              </Flex>
            )}
            {isCover && (
              <Box w="36px" h="5px" bg="#f87171" borderRadius="full" opacity={0.7} />
            )}
            {!isWriting && !isError && !isSuccess && !isCover && (
              /* Neutral flat mouth */
              <Box w="40px" h="5px" bg="#7c3aed" borderRadius="full" opacity={0.8} />
            )}
          </Box>

          {/* corner screws decoration */}
          {['8px', '8px', 'auto', '8px', '8px', 'auto', 'auto', 'auto'].reduce((acc, _, i, arr) => {
            if (i % 2 === 0) {
              const positions = [
                { top: '6px', left: '6px' },
                { top: '6px', right: '6px' },
                { bottom: '6px', left: '6px' },
                { bottom: '6px', right: '6px' },
              ];
              acc.push(
                <Box
                  key={i}
                  position="absolute"
                  w="5px" h="5px"
                  borderRadius="full"
                  bg="rgba(255,255,255,0.12)"
                  {...positions[i / 2]}
                  zIndex={3}
                />
              );
            }
            return acc;
          }, [])}
        </Box>

        {/* ── Neck ── */}
        <Flex justify="center">
          <Box w="28px" h="10px" bg="#312e81" borderRadius="0 0 6px 6px" />
        </Flex>

        {/* ── Body ── */}
        <Box
          w="110px"
          h="75px"
          borderRadius="16px"
          bg={headBg}
          border="2px solid"
          borderColor={headBorder}
          boxShadow={`0 0 16px ${glowColor}`}
          mx="auto"
          position="relative"
          overflow="hidden"
        >
          {/* chest panel */}
          <Box
            position="absolute"
            inset="10px"
            borderRadius="10px"
            bg="rgba(0,0,0,0.3)"
            border="1px solid rgba(255,255,255,0.06)"
            display="flex"
            alignItems="center"
            justifyContent="center"
            gap="6px"
          >
            {/* chest LEDs */}
            {[
              isError ? '#f87171' : '#34d399',
              isError ? '#f87171' : '#a78bfa',
              isError ? '#f87171' : '#60a5fa',
            ].map((c, i) => (
              <Box
                key={i}
                w="10px" h="10px"
                borderRadius="full"
                bg={c}
                boxShadow={`0 0 6px ${c}`}
                animation={`${pulseKF} ${1.2 + i * 0.3}s ease-in-out ${i * 0.15}s infinite`}
              />
            ))}
          </Box>
        </Box>
      </Box>

      {/* ── Status label ── */}
      <Box
        minH="28px"
        px={4} py={1}
        borderRadius="full"
        bg={
          isError   ? 'rgba(248,113,113,0.15)' :
          isSuccess ? 'rgba(52,211,153,0.15)'  :
          isWriting ? 'rgba(167,139,250,0.15)' :
          'rgba(255,255,255,0.05)'
        }
        border="1px solid"
        borderColor={
          isError   ? 'rgba(248,113,113,0.4)' :
          isSuccess ? 'rgba(52,211,153,0.4)'  :
          isWriting ? 'rgba(167,139,250,0.4)' :
          'rgba(255,255,255,0.1)'
        }
        transition="all 0.3s"
      >
        {isWriting && <Text fontSize="xs" color="#c4b5fd" fontWeight="600" letterSpacing="0.05em">● READING INPUT</Text>}
        {isCover   && <Text fontSize="xs" color="#f87171" fontWeight="600" letterSpacing="0.05em">● PRIVACY MODE</Text>}
        {isError   && <Text fontSize="xs" color="#f87171" fontWeight="600" letterSpacing="0.05em">● ERROR DETECTED</Text>}
        {isSuccess && <Text fontSize="xs" color="#34d399" fontWeight="600" letterSpacing="0.05em">● ACCESS GRANTED</Text>}
        {!isWriting && !isCover && !isError && !isSuccess &&
          <Text fontSize="xs" color="rgba(255,255,255,0.3)" fontWeight="600" letterSpacing="0.05em">● STANDBY</Text>
        }
      </Box>

    </Flex>
  );
};

export default Robot;