import React from 'react';
import { HStack, Input, Select, Button } from '@chakra-ui/react';

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
      <Input flex={1} minW="220px" placeholder="Search courses, teachers, keywords..." value={value} onChange={e => onChange(e.target.value)} />
      <Select w="160px" value={filters.price || 'all'} onChange={e => onFilterChange({ ...filters, price: e.target.value })}>
        <option value="all">All Prices</option>
        <option value="free">Free</option>
        <option value="paid">Paid</option>
      </Select>
      <Select w="160px" value={filters.difficulty || 'all'} onChange={e => onFilterChange({ ...filters, difficulty: e.target.value })}>
        <option value="all">All Difficulty</option>
        <option value="beginner">Beginner</option>
        <option value="intermediate">Intermediate</option>
        <option value="advanced">Advanced</option>
      </Select>
      {statusOptions.length > 0 && (
        <Select w="160px" value={filters.status || 'all'} onChange={e => { onFilterChange({ ...filters, status: e.target.value }); onStatusChange && onStatusChange(e.target.value); }}>
          <option value="all">All Status</option>
          {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
        </Select>
      )}
      {instructorOptions.length > 0 && (
        <Select w="220px" value={filters.instructorId || ''} onChange={e => { onFilterChange({ ...filters, instructorId: e.target.value }); onInstructorChange && onInstructorChange(e.target.value); }}>
          <option value="">All Instructors</option>
          {instructorOptions.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
        </Select>
      )}
      <Button onClick={onClear}>Clear</Button>
    </HStack>
  );
}
