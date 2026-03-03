import React from 'react';
import { HStack, Input, Select, Button, Box, Text } from '@chakra-ui/react';

export default function SearchFilterBar({
  value,
  onChange,
  filters,
  onFilterChange,
  onClear,
  instructorOptions = [],
  onInstructorChange,
  statusOptions = [],
  onStatusChange,
}) {
  return (
    <HStack w="100%" spacing={3} mb={4} flexWrap="wrap">
      <Box minW="220px" flex={1}>
        <Text fontSize="xs" color="whiteAlpha.700" mb={1}>Search</Text>
        <Input placeholder="Search courses, teachers, keywords..." value={value} onChange={e => onChange(e.target.value)} />
      </Box>

      <Box w="160px">
        <Text fontSize="xs" color="whiteAlpha.700" mb={1}>Price</Text>
        <Select aria-label="Filter by price" title="Filter by price" w="160px" value={filters.price || 'all'} onChange={e => onFilterChange({ ...filters, price: e.target.value })}>
          <option value="all">All Prices</option>
          <option value="free">Free</option>
          <option value="paid">Paid</option>
        </Select>
      </Box>

      <Box w="160px">
        <Text fontSize="xs" color="whiteAlpha.700" mb={1}>Difficulty</Text>
        <Select aria-label="Filter by difficulty" title="Filter by difficulty" w="160px" value={filters.difficulty || 'all'} onChange={e => onFilterChange({ ...filters, difficulty: e.target.value })}>
          <option value="all">All Difficulty</option>
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </Select>
      </Box>
      {statusOptions.length > 0 && (
        <Box w="160px">
          <Text fontSize="xs" color="whiteAlpha.700" mb={1}>Status</Text>
          <Select aria-label="Filter by status" title="Filter by status" w="160px" value={filters.status || 'all'} onChange={e => { onFilterChange({ ...filters, status: e.target.value }); onStatusChange && onStatusChange(e.target.value); }}>
            <option value="all">All Status</option>
            {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
          </Select>
        </Box>
      )}
      {instructorOptions.length > 0 && (
        <Box w="220px">
          <Text fontSize="xs" color="whiteAlpha.700" mb={1}>Instructor</Text>
          <Select aria-label="Filter by instructor" title="Filter by instructor" w="220px" value={filters.instructorId || ''} onChange={e => { onFilterChange({ ...filters, instructorId: e.target.value }); onInstructorChange && onInstructorChange(e.target.value); }}>
            <option value="">All Instructors</option>
            {instructorOptions.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </Select>
        </Box>
      )}
      <Button onClick={onClear}>Clear</Button>
    </HStack>
  );
}
