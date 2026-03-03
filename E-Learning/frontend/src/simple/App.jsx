import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { ChakraProvider, Box, HStack, Button } from '@chakra-ui/react';
import ClanMembers from './ClanMembers';
import ProfilePage from './ProfilePage';

export default function App() {
  return (
    <ChakraProvider>
      <BrowserRouter>
        <Box p={4}>
          <HStack spacing={3} mb={4}>
            <Button as={Link} to="/">Home</Button>
            {/* Example link to a clan id 1 members page; replace as needed */}
            <Button as={Link} to="/clans/1/members">Clan 1 Members</Button>
          </HStack>

          <Routes>
            <Route path="/clans/:clanId/members" element={<ClanMembers />} />
            <Route path="/profiles/:userId" element={<ProfilePage />} />
            {/* support legacy/singular path */}
            <Route path="/profile/:userId" element={<ProfilePage />} />
            <Route path="/" element={<Box p={6}>Simple demo: open a clan members page.</Box>} />
          </Routes>
        </Box>
      </BrowserRouter>
    </ChakraProvider>
  );
}
