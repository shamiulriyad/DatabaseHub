import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import {
    Box,
    Button,
    Container,
    Heading,
    Input,
    Link,
    Stack,
    Text,
    Divider,
} from "@chakra-ui/react";
import { register } from "../api/auth";
import { setAccessToken } from "../auth/token";
import AuthBackground from "../components/backgrounds/AuthBackground";

export default function RegisterPage() {
    const navigate = useNavigate();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const mutation = useMutation({
        mutationFn: () => register({ name, email, password }),
        onSuccess: (data) => {
            setAccessToken(data.token);
            navigate("/courses");
        },
        onError: (err) => {
            setError(err?.message || "Registration failed");
        },
    });

    return (
        <AuthBackground>
            <Container maxW="md">
                <Box
                    bg="white"
                    p={8}
                    borderRadius="2xl"
                    boxShadow="2xl"
                >
                    <Stack spacing={6}>
                        <Stack spacing={1} textAlign="center">
                            <Heading size="lg">Create your account</Heading>
                            <Text color="gray.500">
                                Join <b>Next Gen Minds</b> and start learning today
                            </Text>
                        </Stack>

                        <Box
                            as="form"
                            onSubmit={(e) => {
                                e.preventDefault();
                                setError("");
                                mutation.mutate();
                            }}
                        >
                            <Stack spacing={4}>
                                <Box>
                                    <Text fontSize="sm" mb={1} color="gray.600">
                                        Full name
                                    </Text>
                                    <Input
                                        size="lg"
                                        placeholder="John Doe"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                    />
                                </Box>

                                <Box>
                                    <Text fontSize="sm" mb={1} color="gray.600">
                                        Email
                                    </Text>
                                    <Input
                                        size="lg"
                                        type="email"
                                        placeholder="you@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </Box>

                                <Box>
                                    <Text fontSize="sm" mb={1} color="gray.600">
                                        Password
                                    </Text>
                                    <Input
                                        size="lg"
                                        type="password"
                                        placeholder="Create a strong password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                </Box>

                                {error && (
                                    <Text color="red.500" fontSize="sm">
                                        {error}
                                    </Text>
                                )}

                                <Button
                                    size="lg"
                                    colorScheme="purple"
                                    isLoading={mutation.isPending}
                                    type="submit"
                                >
                                    Create Account
                                </Button>
                            </Stack>
                        </Box>

                        <Text fontSize="sm" textAlign="center" color="gray.600">
                            Already have an account?{" "}
                            <Link as={RouterLink} to="/login" color="purple.500">
                                Sign in
                            </Link>
                        </Text>
                    </Stack>
                </Box>
            </Container>
        </AuthBackground>
    );
}
