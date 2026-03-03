import React, { useState } from 'react';
import CosmicBg from '../../components/CosmicBg';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  Box, Container, Flex, Grid, Text, VStack,
  Avatar, Icon, Tooltip, Skeleton, SkeletonCircle, SkeletonText,
  useToast,
} from '@chakra-ui/react';
import {
  Search, Plus, Users, TrendingUp, Star, Lock, Globe,
  Sparkles, ChevronLeft, ChevronRight,
} from 'lucide-react';

/* ─── Google Fonts + CSS Variables + Keyframes ─── */
const FontLoader = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;0,800;1,400;1,700&family=DM+Sans:wght@300;400;500;600&display=swap');

    :root {
      --void:     #04040a;
      --surface:  #0b0b14;
      --card:     #0d0d18;
      --rim:      rgba(255,255,255,0.055);
      --rim-glow: rgba(139,92,246,0.45);
      --nebula:   #5b21b6;
      --nova:     #7c3aed;
      --quasar:   #a78bfa;
      --dust:     #c4b5fd;
      --star:     #ede9fe;
      --muted:    #5a6a7e;
      --body:     #8a9ab8;
      --gold:     #f59e0b;
      --green:    #10b981;
      --red:      #ef4444;
    }

    *, *::before, *::after { box-sizing: border-box; }

    ::-webkit-scrollbar { width: 3px; }
    ::-webkit-scrollbar-track { background: var(--void); }
    ::-webkit-scrollbar-thumb { background: var(--nebula); border-radius: 2px; }

    /* Grain overlay */
    .page-root::after {
      content: '';
      position: fixed;
      inset: 0;
      pointer-events: none;
      z-index: 9999;
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23g)' opacity='0.04'/%3E%3C/svg%3E");
      opacity: 0.5;
    }

    @keyframes drift {
      0%, 100% { transform: translate(0,0) scale(1); }
      33%       { transform: translate(50px,-70px) scale(1.1); }
      66%       { transform: translate(-45px,55px) scale(0.9); }
    }
    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(24px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes cardIn {
      from { opacity: 0; transform: translateY(28px) scale(0.98); }
      to   { opacity: 1; transform: translateY(0) scale(1); }
    }
    @keyframes ringBreath {
      0%, 100% { opacity: 0.14; transform: translate(-50%,-50%) scale(1); }
      50%       { opacity: 0.04; transform: translate(-50%,-50%) scale(1.1); }
    }
    @keyframes pulseBadge {
      0%, 100% { box-shadow: 0 0 0 0 rgba(124,58,237,0.4); }
      50%       { box-shadow: 0 0 0 7px rgba(124,58,237,0); }
    }
    @keyframes spinOrb {
      from { transform: rotate(0deg); }
      to   { transform: rotate(360deg); }
    }
    @keyframes shimmer {
      0%   { background-position: -300% 0; }
      100% { background-position: 300% 0; }
    }

    .clan-card {
      transition: transform .5s cubic-bezier(.23,1,.32,1), border-color .35s ease, box-shadow .5s ease;
      position: relative;
    }
    .clan-card:hover {
      transform: translateY(-10px);
      border-color: rgba(124,58,237,0.5) !important;
      box-shadow: 0 32px 70px rgba(0,0,0,0.65), 0 0 80px rgba(91,33,182,0.18) !important;
    }
    .clan-card .banner-img {
      transition: transform .7s cubic-bezier(.23,1,.32,1);
    }
    .clan-card:hover .banner-img {
      transform: scale(1.1);
    }
    .clan-card .card-top-line {
      opacity: 0;
      transition: opacity .4s ease;
    }
    .clan-card:hover .card-top-line {
      opacity: 1;
    }

    .ghost-btn {
      background: rgba(91,33,182,0.1);
      border: 1px solid rgba(124,58,237,0.28);
      border-radius: 10px;
      color: var(--quasar);
      font-family: 'DM Sans', sans-serif;
      font-size: 13.5px;
      font-weight: 600;
      cursor: pointer;
      width: 100%;
      height: 42px;
      transition: all .35s ease;
      margin-top: 4px;
    }
    .ghost-btn:hover {
      background: linear-gradient(135deg, rgba(91,33,182,0.35), rgba(124,58,237,0.35));
      border-color: rgba(124,58,237,0.55);
      color: white;
      transform: translateY(-1px);
    }

    .primary-btn {
      background: linear-gradient(135deg, #5b21b6, #7c3aed);
      border: none;
      border-radius: 12px;
      color: white;
      font-family: 'DM Sans', sans-serif;
      font-size: 14.5px;
      font-weight: 600;
      letter-spacing: 0.02em;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 0 32px;
      height: 52px;
      transition: all .35s ease;
    }
    .primary-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 18px 44px rgba(91,33,182,0.5);
    }

    .chip {
      font-family: 'DM Sans', sans-serif;
      font-size: 12.5px;
      cursor: pointer;
      padding: 0 18px;
      height: 36px;
      border-radius: 10px;
      border: 1px solid rgba(255,255,255,0.07);
      background: rgba(13,13,24,0.8);
      color: var(--muted);
      font-weight: 400;
      transition: all .25s ease;
      backdrop-filter: blur(10px);
    }
    .chip:hover {
      transform: translateY(-2px);
      border-color: rgba(124,58,237,0.35);
      color: var(--quasar);
    }
    .chip.active {
      background: rgba(91,33,182,0.2);
      border-color: rgba(124,58,237,0.5);
      color: var(--dust);
      font-weight: 600;
    }

    .cosmos-select {
      background: rgba(13,13,24,0.85);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(255,255,255,0.07);
      border-radius: 10px;
      color: var(--dust);
      font-family: 'DM Sans', sans-serif;
      font-size: 13px;
      font-weight: 400;
      padding: 0 36px 0 14px;
      height: 38px;
      outline: none;
      cursor: pointer;
      appearance: none;
      -webkit-appearance: none;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%237c3aed' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 12px center;
      transition: border-color .25s ease;
      min-width: 168px;
    }
    .cosmos-select:focus { border-color: rgba(124,58,237,0.5); }
    .cosmos-select option { background: #0d0d18; color: #c4b5fd; }

    .search-wrap { position: relative; width: 100%; max-width: 640px; margin: 0 auto; }
    .search-icon { position: absolute; left: 18px; top: 50%; transform: translateY(-50%); color: var(--muted); pointer-events: none; display: flex; align-items: center; z-index: 2; }
    .search-field {
      width: 100%; height: 54px;
      padding: 0 22px 0 50px;
      background: rgba(13,13,24,0.8);
      backdrop-filter: blur(14px);
      border: 1px solid rgba(255,255,255,0.07);
      border-radius: 14px;
      color: var(--star);
      font-family: 'DM Sans', sans-serif;
      font-size: 14.5px;
      font-weight: 300;
      outline: none;
      transition: border-color .25s ease, box-shadow .25s ease;
    }
    .search-field::placeholder { color: var(--muted); }
    .search-field:focus {
      border-color: rgba(124,58,237,0.5);
      box-shadow: 0 0 0 3px rgba(124,58,237,0.1), 0 8px 28px rgba(0,0,0,0.3);
    }

    .orb-ring {
      position: absolute;
      border-radius: 50%;
      border: 1.5px solid rgba(124,58,237,0.16);
      top: 50%; left: 50%;
      animation: ringBreath 10s ease-in-out infinite;
    }

    .stat-label {
      font-family: 'DM Sans', sans-serif;
      font-size: 12.5px;
      color: var(--muted);
      display: flex;
      align-items: center;
      gap: 5px;
    }

    .page-dot { cursor: pointer; transition: all .3s cubic-bezier(.23,1,.32,1); }
    .page-dot:hover { transform: scale(1.35); }

    .pag-btn {
      width: 42px; height: 42px;
      background: rgba(13,13,24,0.8);
      border: 1px solid rgba(255,255,255,0.07);
      border-radius: 10px;
      color: var(--muted);
      cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      transition: all .25s ease;
    }
    .pag-btn:hover:not(:disabled) {
      border-color: rgba(124,58,237,0.45);
      color: var(--quasar);
    }
    .pag-btn:disabled { opacity: 0.3; cursor: not-allowed; }
  `}</style>
);

/* ─── API ─── */
const searchClans = async (params) => {
  const q = new URLSearchParams();
  if (params.query)    q.append('query', params.query);
  if (params.clanType) q.append('clanType', params.clanType);
  if (params.isPublic != null) q.append('isPublic', params.isPublic);
  if (params.sortBy)   q.append('sortBy', params.sortBy);
  if (params.sortOrder) q.append('sortOrder', params.sortOrder);
  if (params.page)     q.append('page', params.page);
  if (params.pageSize) q.append('pageSize', params.pageSize);
  const res = await fetch(`/api/clans/search?${q.toString()}`, { headers: { 'Content-Type': 'application/json' } });
  if (!res.ok) throw new Error('Failed to fetch clans');
  return res.json();
};

/* ─── Skeleton Card ─── */
const ClanCardSkeleton = () => (
  <Box bg="var(--card)" border="1px solid var(--rim)" borderRadius="20px" overflow="hidden">
    <Skeleton height="148px" startColor="#0f0f1c" endColor="#181828" />
    <Box px="22px" mt="-42px" position="relative" zIndex={2}>
      <SkeletonCircle size="86px" startColor="#0f0f1c" endColor="#181828" />
    </Box>
    <VStack align="stretch" p="14px 22px 22px" spacing={3}>
      <Skeleton height="20px" width="52%" startColor="#0f0f1c" endColor="#181828" />
      <SkeletonText mt={1} noOfLines={2} spacing={2} startColor="#0f0f1c" endColor="#181828" />
      <Skeleton height="36px" mt={3} startColor="#0f0f1c" endColor="#181828" />
    </VStack>
  </Box>
);

/* ─── Clan Card ─── */
const ClanCard = ({ clan, index, onClick }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <Box
      className="clan-card"
      bg="var(--card)"
      border="1px solid var(--rim)"
      borderRadius="20px"
      overflow="hidden"
      cursor="pointer"
      animation="cardIn .55s ease-out both"
      style={{ animationDelay: `${index * 0.075}s` }}
      onClick={() => onClick(clan.id)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Top shimmer line on hover */}
      <Box
        className="card-top-line"
        position="absolute" top={0} left={0} right={0} h="1px" zIndex={10}
        bgGradient="linear(90deg, transparent 0%, var(--quasar) 50%, transparent 100%)"
      />

      {/* Banner */}
      <Box position="relative" h="148px" overflow="hidden">
        <img
          className="banner-img"
          src={clan.bannerUrl || clan.banner || 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=800&h=300&fit=crop'}
          alt={clan.name}
          style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }}
          onError={e => { e.target.src='https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=800&h=300&fit=crop'; }}
        />
        {/* Fade to card bg */}
        <Box position="absolute" inset={0} bgGradient="linear(to-b, transparent 20%, rgba(13,13,24,0.95))" />

        {/* Rank */}
        {clan.rank && (
          <Flex
            position="absolute" top="13px" left="13px"
            px="11px" py="4px" align="center" gap="5px"
            bg="rgba(0,0,0,0.65)" backdropFilter="blur(10px)"
            border="1px solid rgba(245,158,11,0.28)" borderRadius="7px"
          >
            <Icon as={Star} size={11} color="var(--gold)" />
            <Text fontFamily="'DM Sans'" fontSize="12px" fontWeight="600" color="var(--gold)">
              #{clan.rank}
            </Text>
          </Flex>
        )}

        {/* Privacy */}
        <Tooltip label={clan.isPublic ? 'Public Clan' : 'Private Clan'} placement="left">
          <Flex
            position="absolute" top="13px" right="13px"
            w="32px" h="32px" align="center" justify="center"
            bg="rgba(0,0,0,0.65)" backdropFilter="blur(10px)"
            border="1px solid" borderRadius="7px"
            borderColor={clan.isPublic ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}
            color={clan.isPublic ? 'var(--green)' : 'var(--red)'}
          >
            <Icon as={clan.isPublic ? Globe : Lock} size={12} />
          </Flex>
        </Tooltip>
      </Box>

      {/* Avatar */}
      <Box px="22px" mt="-42px" position="relative" zIndex={2} display="inline-flex">
        <Box position="relative">
          <Avatar
            src={clan.avatar || clan.logoUrl}
            name={clan.name}
            size="lg"
            border="3px solid var(--card)"
            boxShadow={hovered ? '0 0 0 2px var(--nova), 0 0 16px rgba(124,58,237,0.4)' : 'none'}
            style={{ transition: 'box-shadow .35s ease' }}
          />
          {hovered && (
            <Box
              position="absolute" inset="-5px" borderRadius="full"
              style={{
                background: 'linear-gradient(var(--card),var(--card)) padding-box, linear-gradient(135deg,#5b21b6,#a78bfa,#ec4899) border-box',
                border: '2px solid transparent',
                animation: 'spinOrb 3s linear infinite',
              }}
            />
          )}
        </Box>
      </Box>

      {/* Content */}
      <VStack align="stretch" p="14px 22px 22px" spacing={3}>
        {/* Name */}
        <Flex align="center" gap={2} flexWrap="wrap">
          <Text
            fontFamily="'Playfair Display', serif"
            fontSize="18px" fontWeight="700"
            color="var(--star)" noOfLines={1} letterSpacing="-0.01em"
          >
            {clan.name}
          </Text>
          {clan.tag && (
            <Text
              px="8px" py="2px"
              bg="rgba(124,58,237,0.12)" border="1px solid rgba(124,58,237,0.22)"
              borderRadius="5px" color="var(--quasar)"
              fontSize="10.5px" fontWeight="600"
              fontFamily="monospace" letterSpacing="0.5px"
            >
              [{clan.tag}]
            </Text>
          )}
        </Flex>

        {/* Badges */}
        {clan.badges?.length > 0 && (
          <Flex gap={1.5} flexWrap="wrap">
            {clan.badges.map((b, i) => (
              <Text
                key={i} px="9px" py="2px"
                bg="rgba(91,33,182,0.1)" border="1px solid rgba(91,33,182,0.2)"
                borderRadius="5px" color="var(--dust)"
                fontSize="10px" fontWeight="600"
                textTransform="uppercase" letterSpacing="0.7px"
                fontFamily="'DM Sans'"
              >
                {b}
              </Text>
            ))}
          </Flex>
        )}

        {/* Description */}
        <Text
          fontFamily="'DM Sans'" fontSize="13px"
          color="var(--body)" lineHeight="1.7"
          minH="40px" noOfLines={2} fontWeight="300"
        >
          {clan.description || 'No description available.'}
        </Text>

        {/* Stats */}
        <Flex gap={5} pt={2.5} borderTop="1px solid rgba(255,255,255,0.05)" flexWrap="wrap">
          <span className="stat-label">
            <Icon as={Users} size={13} color="var(--nova)" />
            {clan.memberCount || clan.members || 0}
          </span>
          <span className="stat-label">
            <Icon as={TrendingUp} size={13} color="var(--nova)" />
            {(clan.totalPoints || clan.points || 0).toLocaleString()}
          </span>
          {clan.rating && (
            <span className="stat-label">
              <Icon as={Star} size={13} color="var(--gold)" />
              {clan.rating}
            </span>
          )}
        </Flex>

        {/* CTA */}
        <button className="ghost-btn" onClick={e => { e.stopPropagation(); onClick(clan.id); }}>
          View Clan
        </button>
      </VStack>
    </Box>
  );
};

/* ─── Main Page ─── */
const ClanListPage = () => {
  const navigate = useNavigate();
  const toast    = useToast();

  const [searchTerm, setSearchTerm]           = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [activeFilter, setActiveFilter]       = useState('All');
  const [clanType, setClanType]               = useState('');
  const [privacyFilter, setPrivacyFilter]     = useState('');
  const [sortBy, setSortBy]                   = useState('rank');
  const [sortOrder, setSortOrder]             = useState('asc');
  const [currentPage, setCurrentPage]         = useState(1);
  const pageSize = 12;

  React.useEffect(() => {
    const t = setTimeout(() => { setDebouncedSearch(searchTerm); setCurrentPage(1); }, 500);
    return () => clearTimeout(t);
  }, [searchTerm]);

  const queryParams = {
    query: debouncedSearch, clanType: clanType || undefined,
    isPublic: privacyFilter === 'public' ? true : privacyFilter === 'private' ? false : undefined,
    sortBy, sortOrder, page: currentPage, pageSize,
  };

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['clans', queryParams],
    queryFn: () => searchClans(queryParams),
    keepPreviousData: true,
    staleTime: 30000,
  });

  React.useEffect(() => {
    if (isError) toast({ title: 'Error loading clans', description: error?.message, status: 'error', duration: 5000, isClosable: true });
  }, [isError, error, toast]);

  const clans      = data?.clans || [];
  const totalPages = data?.total ? Math.ceil(data.total / pageSize) : 1;
  const quickFilters = ['All', 'Top Rated', 'Most Active', 'Newest'];

  const handleFilterClick = (f) => {
    setActiveFilter(f); setCurrentPage(1);
    const map = { 'Top Rated':['rating','desc'], 'Most Active':['memberCount','desc'], 'Newest':['createdAt','desc'], 'All':['rank','asc'] };
    const [sb, so] = map[f] || ['rank','asc'];
    setSortBy(sb); setSortOrder(so);
  };

  const handleSortChange = (e) => {
    setCurrentPage(1);
    const map = { rank:['rank','asc'], members:['memberCount','desc'], points:['totalPoints','desc'], rating:['rating','desc'] };
    const [sb, so] = map[e.target.value] || ['rank','asc'];
    setSortBy(sb); setSortOrder(so);
  };

  const handlePageChange = (p) => { setCurrentPage(p); window.scrollTo({ top:0, behavior:'smooth' }); };

  return (
    <>
      <FontLoader />

      <Box
        className="page-root"
        minH="100vh"
        bg="#070B1A"
        color="var(--star)"
        position="relative"
        overflow="hidden"
        fontFamily="'DM Sans', sans-serif"
      >
        <CosmicBg />
        {/* ── Ambient Orbs ── */}
        <Box position="fixed" inset={0} pointerEvents="none" zIndex={0}>
          {[
            { w:720, h:720, top:'-300px', left:'-300px', c:'#4c1d95', d:'0s' },
            { w:580, h:580, bottom:'-220px', right:'-220px', c:'#5b21b6', d:'7s' },
            { w:440, h:440, top:'40%', right:'12%', c:'#6d28d9', d:'14s' },
          ].map((o, i) => (
            <Box
              key={i}
              position="absolute"
              w={o.w+'px'} h={o.h+'px'}
              top={o.top} bottom={o.bottom} left={o.left} right={o.right}
              borderRadius="50%"
              filter="blur(140px)"
              opacity={0.22}
              bg={`radial-gradient(circle, ${o.c}, transparent 70%)`}
              animation="drift 24s infinite ease-in-out"
              style={{ animationDelay: o.d }}
            />
          ))}
        </Box>

        {/* ── Hero ── */}
        <Box position="relative" zIndex={1} pt="112px" pb="72px" textAlign="center">
          <Container maxW="container.xl">

            {/* Decorative rings */}
            <Box position="absolute" top="50%" left="50%" pointerEvents="none" zIndex={-1}>
              {[500, 700, 900].map((s, i) => (
                <Box
                  key={i} className="orb-ring"
                  w={s+'px'} h={s+'px'}
                  style={{ animationDelay: `${i * 3.2}s` }}
                />
              ))}
            </Box>

            <VStack spacing={7} animation="fadeUp .85s ease-out both">

              {/* Eyebrow */}
              <Flex
                fontFamily="'DM Sans'"
                letterSpacing="1.5px"
                textTransform="uppercase"
                align="center"
                justify="center"
                style={{ animation: 'pulseBadge 3.5s ease-in-out infinite' }}
              >
                <Icon as={Sparkles} size={12} />
                <Text>Discover Your Tribe</Text>
              </Flex>

              {/* Headline — Playfair Display */}
              <Box>
                <Text
                  fontFamily="'Playfair Display', serif"
                  fontSize={{ base:'44px', md:'60px', lg:'76px' }}
                  fontWeight="800"
                  lineHeight="1.08"
                  letterSpacing="-0.025em"
                  color="var(--star)"
                  display="inline"
                >
                  Find Your{' '}
                </Text>
                <Text
                  fontFamily="'Playfair Display', serif"
                  fontStyle="italic"
                  fontSize={{ base:'44px', md:'60px', lg:'76px' }}
                  fontWeight="800"
                  lineHeight="1.08"
                  letterSpacing="-0.025em"
                  display="inline"
                  style={{
                    background: 'linear-gradient(135deg, #a78bfa 0%, #c4b5fd 45%, #818cf8 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  Learning Clan
                </Text>
              </Box>

              {/* Subtitle */}
              <Text
                fontFamily="'DM Sans'" fontSize="17px" fontWeight="300"
                color="var(--body)" maxW="480px" lineHeight="1.75"
              >
                Join forces with like-minded learners and achieve mastery together
              </Text>

              {/* CTA */}
              <button className="primary-btn" onClick={() => navigate('/clans/create')}>
                <Icon as={Plus} size={16} />
                Create a Clan
              </button>
            </VStack>
          </Container>
        </Box>

        {/* ── Search & Filters ── */}
        <Box position="relative" zIndex={1} py={8}>
          <Container maxW="container.xl">
            <VStack spacing={5}>

              {/* Search */}
              <div className="search-wrap">
                <div className="search-icon">
                  <Icon as={Search} size={15} />
                </div>
                <input
                  className="search-field"
                  placeholder="Search by name, tag, or description…"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Quick chips */}
              <Flex gap={2} flexWrap="wrap" justify="center">
                {quickFilters.map(f => (
                  <button
                    key={f}
                    className={`chip ${activeFilter === f ? 'active' : ''}`}
                    onClick={() => handleFilterClick(f)}
                  >
                    {f}
                  </button>
                ))}
              </Flex>

              {/* Advanced selects */}
              <Flex gap={3} flexWrap="wrap" justify="center">
                <select className="cosmos-select" value={clanType} onChange={e => { setClanType(e.target.value); setCurrentPage(1); }}>
                  <option value="">All Types</option>
                  <option value="study">Study Groups</option>
                  <option value="project">Project Teams</option>
                  <option value="mentorship">Mentorship</option>
                  <option value="competition">Competition</option>
                </select>

                <select className="cosmos-select" value={privacyFilter} onChange={e => { setPrivacyFilter(e.target.value); setCurrentPage(1); }}>
                  <option value="">Public &amp; Private</option>
                  <option value="public">Public Only</option>
                  <option value="private">Private Only</option>
                </select>

                <select className="cosmos-select" onChange={handleSortChange}>
                  <option value="rank">Sort: Rank</option>
                  <option value="members">Sort: Members</option>
                  <option value="points">Sort: Points</option>
                  <option value="rating">Sort: Rating</option>
                </select>
              </Flex>
            </VStack>
          </Container>
        </Box>

        {/* ── Clan Grid ── */}
        <Box position="relative" zIndex={1} py={8} pb={24}>
          <Container maxW="container.xl">

            {/* Loading */}
            {isLoading && (
              <Grid templateColumns={{ base:'1fr', md:'repeat(2,1fr)', lg:'repeat(3,1fr)' }} gap={7} mb={16}>
                {Array.from({ length: 6 }).map((_, i) => <ClanCardSkeleton key={i} />)}
              </Grid>
            )}

            {/* Error */}
            {isError && !isLoading && (
              <Flex justify="center" align="center" minH="360px">
                <VStack spacing={4} textAlign="center">
                  <Text fontFamily="'Playfair Display', serif" fontSize="22px" fontWeight="700" color="var(--red)">
                    Something went wrong
                  </Text>
                  <Text fontFamily="'DM Sans'" fontSize="14px" color="var(--muted)">
                    {error?.message || 'Failed to fetch clans'}
                  </Text>
                  <button className="chip active" onClick={() => refetch()} style={{ padding:'0 22px', height:'40px' }}>
                    Try Again
                  </button>
                </VStack>
              </Flex>
            )}

            {/* Empty */}
            {!isLoading && !isError && clans.length === 0 && (
              <Flex justify="center" align="center" minH="360px">
                <VStack spacing={3} textAlign="center">
                  <Text fontFamily="'Playfair Display', serif" fontSize="22px" fontWeight="600" color="var(--body)">
                    No clans found
                  </Text>
                  <Text fontFamily="'DM Sans'" fontSize="13.5px" color="var(--muted)">
                    Try adjusting your filters or search terms
                  </Text>
                  {searchTerm && (
                    <button className="chip" onClick={() => setSearchTerm('')} style={{ color:'var(--quasar)', borderColor:'rgba(124,58,237,0.3)' }}>
                      Clear Search
                    </button>
                  )}
                </VStack>
              </Flex>
            )}

            {/* Cards */}
            {!isLoading && !isError && clans.length > 0 && (
              <>
                <Grid
                  templateColumns={{ base:'1fr', md:'repeat(2,1fr)', lg:'repeat(3,1fr)' }}
                  gap={7} mb={16}
                >
                  {clans.map((clan, index) => (
                    <ClanCard
                      key={clan.id}
                      clan={clan}
                      index={index}
                      onClick={id => navigate(`/clans/${id}`)}
                    />
                  ))}
                </Grid>

                {/* Pagination */}
                {totalPages > 1 && (
                  <Flex align="center" justify="center" gap={5}>
                    <button
                      className="pag-btn"
                      disabled={currentPage === 1}
                      onClick={() => handlePageChange(currentPage - 1)}
                    >
                      <Icon as={ChevronLeft} size={17} />
                    </button>

                    <Flex gap={2} align="center">
                      {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                        let page;
                        if (totalPages <= 5)             page = i + 1;
                        else if (currentPage <= 3)       page = i + 1;
                        else if (currentPage >= totalPages - 2) page = totalPages - 4 + i;
                        else                             page = currentPage - 2 + i;
                        const active = page === currentPage;
                        return (
                          <Box
                            key={page}
                            className="page-dot"
                            w={active ? '26px' : '8px'}
                            h="8px"
                            borderRadius={active ? '4px' : 'full'}
                            bg={active ? 'linear-gradient(135deg, #5b21b6, #a78bfa)' : 'rgba(124,58,237,0.22)'}
                            boxShadow={active ? '0 0 10px rgba(124,58,237,0.55)' : 'none'}
                            onClick={() => handlePageChange(page)}
                          />
                        );
                      })}
                    </Flex>

                    <button
                      className="pag-btn"
                      disabled={currentPage === totalPages}
                      onClick={() => handlePageChange(currentPage + 1)}
                    >
                      <Icon as={ChevronRight} size={17} />
                    </button>
                  </Flex>
                )}
              </>
            )}
          </Container>
        </Box>
      </Box>
    </>
  );
};

export default ClanListPage;