import React, { useState } from 'react';
import { Box, Heading, Input, Button, VStack, Text } from '@chakra-ui/react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';

export default function Checkout() {
  const [searchParams] = useSearchParams();
  const courseId = searchParams.get('courseId');
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [card, setCard] = useState('');
  const [loading, setLoading] = useState(false);
  const [phone, setPhone] = useState('');
  const [method, setMethod] = useState(searchParams.get('method') || 'card');

  const handlePay = async () => {
    setLoading(true);
    try {
      const payload = { paymentMethod: method };
      if (method === 'bkash' || method === 'nagad') payload.phoneNumber = phone;
      if (method === 'card') payload.cardDetails = { cardNumber: card, cardHolderName: name, expiryMonth: '01', expiryYear: '2030', cvv: '000' };

      const res = await api.post(`/payments/course/${courseId}`, payload);
      if (res?.data?.success) {
        navigate(`/courses/${courseId}`);
      } else {
        alert('Payment initiation failed: ' + (res?.data?.message || ''));
      }
    } catch (err) {
      console.error(err);
      alert('Payment failed: ' + (err.response?.data?.message || err.message || ''));
    } finally { setLoading(false); }
  };

  return (
    <Box p={6} maxW="3xl">
      <Heading mb={4}>Checkout</Heading>
      <Text mb={4}>You're buying course <strong>{courseId}</strong>. This is a demo payment stub.</Text>
      <VStack spacing={3} align="stretch">
        <Input placeholder="Full name" value={name} onChange={e => setName(e.target.value)} />
        {method === 'card' ? (
          <Input placeholder="Card number (demo)" value={card} onChange={e => setCard(e.target.value)} />
        ) : (
          <Input placeholder="Phone number" value={phone} onChange={e => setPhone(e.target.value)} />
        )}
        <Button colorScheme="orange" isLoading={loading} onClick={handlePay}>Pay</Button>
      </VStack>
    </Box>
  );
}
