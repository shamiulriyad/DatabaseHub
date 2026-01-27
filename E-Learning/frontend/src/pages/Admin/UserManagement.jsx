import React, { useEffect, useState } from 'react';
import {
	Container,
	Heading,
	Input,
	Table,
	Thead,
	Tbody,
	Tr,
	Th,
	Td,
	TableContainer,
	Spinner,
	Badge,
	Button,
	Flex,
	Text
} from '@chakra-ui/react';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';

export default function UserManagement() {
	const [users, setUsers] = useState([]);
	const [loading, setLoading] = useState(true);
	const [page, setPage] = useState(1);
	const [pageSize] = useState(10);
	const [total, setTotal] = useState(null);
	const [search, setSearch] = useState('');
	const navigate = useNavigate();

	useEffect(() => {
		let mounted = true;
		const load = async () => {
			try {
				const res = await api.get('/admin/users', { params: { page, pageSize, search } });
				const payload = res.data?.users ?? res.data?.data ?? res.data?.users ?? res.data ?? [];
				if (res.data?.total != null) setTotal(res.data.total);
				if (!mounted) return;
				setUsers(Array.isArray(payload) ? payload : []);
			} catch (err) {
				console.error('Failed to load users', err);
				setUsers([]);
			} finally {
				if (mounted) setLoading(false);
			}
		};
		setLoading(true);
		load();
		return () => { mounted = false; };
	}, [page, pageSize, search]);

	return (
		<Container maxW="container.xl" py={8}>
			<Flex justify="space-between" align="center" mb={6}>
				<Heading size="lg">User Management</Heading>
				<Button colorScheme="purple" size="sm" onClick={() => navigate('/admin/users/create')}>Create User</Button>
			</Flex>

			{loading ? (
				<Flex justify="center" py={20}><Spinner size="xl" /></Flex>
			) : (
				<>
					<Flex mb={4} justify="space-between" align="center">
						<Input
							placeholder="Search by name or email"
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							onKeyDown={(e) => { if (e.key === 'Enter') { setPage(1); } }}
							maxW="360px"
						/>
						<Flex align="center">
							<Button size="sm" mr={2} onClick={() => { if (page > 1) { setPage(p => p - 1); } }}>Prev</Button>
							<Text mr={2}>{page}{total ? ` of ${Math.ceil(total / pageSize)}` : ''}</Text>
							<Button size="sm" onClick={() => { setPage(p => p + 1); }}>Next</Button>
						</Flex>
					</Flex>
					<TableContainer>
						<Table variant="simple">
							<Thead>
								<Tr>
									<Th>Name</Th>
									<Th>Email</Th>
									<Th>Roles</Th>
									<Th>Joined</Th>
									<Th>Teacher Request</Th>
									<Th>Action</Th>
								</Tr>
							</Thead>
							<Tbody>
								{users.map(u => (
									<Tr key={u.id ?? u.userId ?? u.email}>
										<Td>
											<Text fontWeight="bold">{u.fullName ?? ((`${u.firstName ?? ''} ${u.lastName ?? ''}`.trim()) || u.username || '—')}</Text>
											<Text fontSize="sm" color="gray.500">{u.username ?? u.email}</Text>
										</Td>
										<Td>{u.email ?? '-'}</Td>
										<Td>
											{u.isAdmin && <Badge colorScheme="red" mr={2}>Admin</Badge>}
											{u.isTeacher && <Badge colorScheme="green" mr={2}>Teacher</Badge>}
											{u.isStudent && <Badge colorScheme="blue">Student</Badge>}
										</Td>
										<Td>{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '-'}</Td>
										<Td>{u.teacherRequestDate ? new Date(u.teacherRequestDate).toLocaleDateString() : '-'}</Td>
										<Td>
											<Button size="sm" onClick={() => navigate(`/user/${u.id ?? u.userId ?? u.email}`)}>View</Button>
										</Td>
									</Tr>
								))}
							</Tbody>
							</Table>
						</TableContainer>
					</>
			)}
		</Container>
	);
}
