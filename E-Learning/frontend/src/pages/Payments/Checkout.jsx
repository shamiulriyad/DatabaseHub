import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Input,
  Button,
  VStack,
  Text,
  RadioGroup,
  HStack,
  Radio,
  FormLabel,
  FormControl,
  Container,
  Card,
  CardBody,
  CardHeader,
  Stack,
  Divider,
  Icon,
  Flex,
  useToast,
  Alert,
  AlertIcon,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Grid,
  GridItem,
  Badge,
  Progress,
} from '@chakra-ui/react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { FaLock, FaCreditCard, FaMobileAlt, FaShieldAlt } from 'react-icons/fa';
import { MdPayment, MdArrowBack } from 'react-icons/md';
import api from '../../services/api';
import { courseService } from '../../services/courseService';

export default function Checkout() {
  const [searchParams] = useSearchParams();
  const courseId = searchParams.get('courseId');
  const navigate = useNavigate();
  const toast = useToast();
  
  const [name, setName] = useState('');
  const [card, setCard] = useState('');
  const [loading, setLoading] = useState(false);
  const [phone, setPhone] = useState('');
  const [method, setMethod] = useState(searchParams.get('method') || 'bkash');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [course, setCourse] = useState(null);
  const [courseLoading, setCourseLoading] = useState(false);

  const handlePay = async () => {
    if (!name.trim()) {
      toast({
        title: 'Name required',
        description: 'Please enter your full name',
        status: 'warning',
        duration: 3000,
      });
      return;
    }

    if (method === 'card') {
      if (!card.trim() || card.length < 16) {
        toast({
          title: 'Invalid card',
          description: 'Please enter a valid card number',
          status: 'warning',
          duration: 3000,
        });
        return;
      }
      if (!expiry.trim()) {
        toast({
          title: 'Expiry required',
          description: 'Please enter card expiry date',
          status: 'warning',
          duration: 3000,
        });
        return;
      }
      if (!cvv.trim() || cvv.length < 3) {
        toast({
          title: 'CVV required',
          description: 'Please enter card CVV',
          status: 'warning',
          duration: 3000,
        });
        return;
      }
    } else {
      if (!phone.trim() || phone.length < 11) {
        toast({
          title: 'Phone required',
          description: 'Please enter a valid phone number',
          status: 'warning',
          duration: 3000,
        });
        return;
      }
    }

    setLoading(true);
    try {
      const payload = { paymentMethod: method };
      
      if (method === 'bkash' || method === 'nagad') {
        payload.phoneNumber = phone;
      }
      
      if (method === 'card') {
        payload.cardDetails = { 
          cardNumber: card, 
          cardHolderName: name, 
          expiryMonth: expiry.split('/')[0] || '01', 
          expiryYear: '20' + (expiry.split('/')[1] || '30'), 
          cvv: cvv 
        };
      }

      const res = await api.post(`/payments/course/${courseId}`, payload);
      
      if (res?.data?.success) {
        toast({
          title: 'Payment Successful!',
          description: 'Your course has been purchased successfully',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
        setTimeout(() => {
          navigate(`/courses/${courseId}`);
        }, 2000);
      } else {
        toast({
          title: 'Payment Failed',
          description: res?.data?.message || 'Unable to process payment',
          status: 'error',
          duration: 4000,
        });
      }
    } catch (err) {
      console.error(err);
      toast({
        title: 'Payment Error',
        description: err.response?.data?.message || err.message || 'Something went wrong',
        status: 'error',
        duration: 4000,
      });
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => {
    if (!courseId) return;
    let mounted = true;
    (async () => {
      setCourseLoading(true);
      try {
        const data = await courseService.getCourseById(courseId);
        if (mounted) setCourse(data || null);
      } catch (err) {
        console.error('Failed to load course for checkout', err);
      } finally {
        if (mounted) setCourseLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [courseId]);

  const paymentMethods = [
    { 
      id: 'bkash', 
      label: 'bKash', 
      icon: FaMobileAlt,
      color: '#E2136E',
    },
    { 
      id: 'nagad', 
      label: 'Nagad', 
      icon: FaMobileAlt,
      color: '#F78C23',
    },
    { 
      id: 'card', 
      label: 'Credit/Debit Card', 
      icon: FaCreditCard,
      color: '#3182CE',
    },
  ];

  return (
    <Container maxW="6xl" py={8}>
      <Button
        variant="ghost"
        leftIcon={<MdArrowBack />}
        mb={6}
        onClick={() => navigate(-1)}
        colorScheme="gray"
      >
        Back to Course
      </Button>

      <Grid templateColumns={{ base: '1fr', lg: '2fr 1fr' }} gap={8}>
        {/* Left Column - Payment Form */}
        <GridItem>
          <Card shadow="lg" borderWidth="1px" borderRadius="xl">
            <CardHeader pb={4} borderBottomWidth="1px">
              <Heading size="lg" color="gray.700">
                Secure Payment
              </Heading>
              <Text color="gray.500" mt={2}>
                Complete your purchase
              </Text>
            </CardHeader>
            
            <CardBody p={8}>
              {/* Progress Indicator */}
              <Stack spacing={8} mb={8}>
                <Box>
                  <Flex justify="space-between" mb={2}>
                    <Text fontWeight="medium" color="gray.700">
                      Step 2 of 2: Payment
                    </Text>
                    <Badge colorScheme="purple">Secure</Badge>
                  </Flex>
                  <Progress value={100} colorScheme="purple" size="sm" borderRadius="full" />
                </Box>
              </Stack>

              {/* Payment Methods */}
              <Box mb={8}>
                <FormLabel fontSize="lg" fontWeight="bold" color="gray.700" mb={4}>
                  Select Payment Method
                </FormLabel>
                <RadioGroup onChange={setMethod} value={method}>
                  <Stack spacing={4}>
                    {paymentMethods.map((pm) => (
                      <Card 
                        key={pm.id}
                        borderWidth="2px"
                        borderColor={method === pm.id ? pm.color : 'gray.200'}
                        _hover={{ borderColor: pm.color, shadow: 'sm' }}
                        cursor="pointer"
                        onClick={() => setMethod(pm.id)}
                        transition="all 0.2s"
                      >
                        <CardBody p={4}>
                          <Flex align="center" gap={4}>
                            <Radio value={pm.id} colorScheme={pm.id === 'bkash' ? 'pink' : pm.id === 'nagad' ? 'orange' : 'blue'}>
                              <Flex align="center" gap={3}>
                                <Icon as={pm.icon} color={pm.color} boxSize={5} />
                                <Text fontWeight="semibold">{pm.label}</Text>
                              </Flex>
                            </Radio>
                          </Flex>
                        </CardBody>
                      </Card>
                    ))}
                  </Stack>
                </RadioGroup>
              </Box>

              {/* Payment Form */}
              <VStack spacing={6} align="stretch">
                <Box>
                  <FormLabel fontWeight="medium" color="gray.700" mb={2}>
                    Full Name
                  </FormLabel>
                  <Input
                    placeholder="Enter your full name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    size="lg"
                    focusBorderColor="purple.500"
                  />
                </Box>

                {method === 'card' ? (
                  <>
                    <Box>
                      <FormLabel fontWeight="medium" color="gray.700" mb={2}>
                        Card Number
                      </FormLabel>
                      <InputGroup size="lg">
                        <InputLeftElement pointerEvents="none">
                          <Icon as={FaCreditCard} color="gray.400" />
                        </InputLeftElement>
                        <Input
                          placeholder="1234 5678 9012 3456"
                          value={card}
                          onChange={e => setCard(e.target.value.replace(/\s/g, ''))}
                          focusBorderColor="purple.500"
                          maxLength={16}
                        />
                      </InputGroup>
                    </Box>

                    <Grid templateColumns="1fr 1fr" gap={4}>
                      <Box>
                        <FormLabel fontWeight="medium" color="gray.700" mb={2}>
                          Expiry Date
                        </FormLabel>
                        <Input
                          placeholder="MM/YY"
                          value={expiry}
                          onChange={e => setExpiry(e.target.value)}
                          size="lg"
                          focusBorderColor="purple.500"
                          maxLength={5}
                        />
                      </Box>
                      <Box>
                        <FormLabel fontWeight="medium" color="gray.700" mb={2}>
                          CVV
                        </FormLabel>
                        <InputGroup size="lg">
                          <Input
                            placeholder="123"
                            value={cvv}
                            onChange={e => setCvv(e.target.value)}
                            focusBorderColor="purple.500"
                            maxLength={3}
                            type="password"
                          />
                          <InputRightElement>
                            <Icon as={FaLock} color="gray.400" />
                          </InputRightElement>
                        </InputGroup>
                      </Box>
                    </Grid>
                  </>
                ) : (
                  <Box>
                    <FormLabel fontWeight="medium" color="gray.700" mb={2}>
                      Phone Number
                    </FormLabel>
                    <InputGroup size="lg">
                      <InputLeftElement pointerEvents="none">
                        <Icon as={FaMobileAlt} color="gray.400" />
                      </InputLeftElement>
                      <Input
                        placeholder="01XXXXXXXXX"
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        focusBorderColor="purple.500"
                        type="tel"
                      />
                    </InputGroup>
                  </Box>
                )}

                {/* Security Info */}
                <Alert status="info" borderRadius="md" variant="left-accent">
                  <AlertIcon />
                  <Text fontSize="sm">
                    Your payment is secured with SSL encryption. We never store your card details.
                  </Text>
                </Alert>

                <Button
                  colorScheme="purple"
                  size="lg"
                  isLoading={loading}
                  onClick={handlePay}
                  leftIcon={<MdPayment />}
                  loadingText="Processing Payment..."
                  height="60px"
                  fontSize="lg"
                  _hover={{ transform: 'translateY(-2px)', shadow: 'lg' }}
                  transition="all 0.2s"
                >
                  {method === 'card' 
                    ? 'Pay with Card' 
                    : `Pay with ${method === 'bkash' ? 'bKash' : 'Nagad'}`
                  }
                </Button>
              </VStack>
            </CardBody>
          </Card>
        </GridItem>

        {/* Right Column - Order Summary */}
        <GridItem>
          <Card shadow="lg" borderWidth="1px" borderRadius="xl" position="sticky" top="100px">
            <CardHeader pb={4} borderBottomWidth="1px">
              <Heading size="md" color="gray.700">
                Order Summary
              </Heading>
            </CardHeader>
            
            <CardBody p={6}>
              <Stack spacing={4}>
                <Flex justify="space-between">
                  <Text color="gray.600">Course</Text>
                  <Text fontWeight="bold">{course ? course.title : `Course #${courseId}`}</Text>
                </Flex>
                
                <Divider />
                
                <Flex justify="space-between">
                  <Text fontSize="lg" fontWeight="bold" color="gray.800">
                    Total Amount
                  </Text>
                  <Text fontSize="xl" fontWeight="bold" color="purple.600">
                    {courseLoading ? 'Loading...' : course ? `৳${course.price ?? 0}` : '৳0'}
                  </Text>
                </Flex>
              </Stack>

              <Divider my={6} />

              {/* Security Badge */}
              <Box p={4} bg="purple.50" borderRadius="lg" borderWidth="1px" borderColor="purple.100">
                <Flex align="center" gap={3}>
                  <Icon as={FaShieldAlt} color="purple.500" boxSize={6} />
                  <Box>
                    <Text fontWeight="bold" color="purple.700">
                      100% Secure Payment
                    </Text>
                    <Text fontSize="xs" color="purple.600">
                      Your information is protected with 256-bit SSL encryption
                    </Text>
                  </Box>
                </Flex>
              </Box>
            </CardBody>
          </Card>

          {/* Help Section */}
          <Card shadow="sm" mt={6} variant="outline">
            <CardBody p={4}>
              <Text fontSize="sm" color="gray.600" textAlign="center">
                Need help?{' '}
                <Button variant="link" colorScheme="purple" size="sm">
                  Contact Support
                </Button>
              </Text>
            </CardBody>
          </Card>
        </GridItem>
      </Grid>
    </Container>
  );
}