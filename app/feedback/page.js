"use client";

import { useState } from "react";
import { Box, Button, Container, Heading, HStack, Input, Text, Textarea, VStack } from "@chakra-ui/react";

export const dynamic = "force-dynamic";

const ratingScale = [
  { value: 5, label: "Excellent", color: "green.500" },
  { value: 4, label: "Good", color: "teal.500" },
  { value: 3, label: "Okay", color: "yellow.500" },
  { value: 2, label: "Poor", color: "orange.500" },
  { value: 1, label: "Very Poor", color: "red.500" }
];

export default function FeedbackPage() {
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const lowRatingSelected = rating > 0 && rating <= 2;

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    const feedbackTrimmed = feedback.trim();
    const phoneTrimmed = phone.trim();

    if (rating < 1 || rating > 5) {
      setError("Please select a rating.");
      return;
    }
    if (lowRatingSelected && !feedbackTrimmed) {
      setError("Comments are required for ratings 1-2.");
      return;
    }
    if (lowRatingSelected && !phoneTrimmed) {
      setError("Phone is required for ratings 1-2.");
      return;
    }

    setBusy(true);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, feedback: feedbackTrimmed, patient_phone: phoneTrimmed })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data?.ok === false) {
        throw new Error(data?.error || "Unable to submit feedback right now.");
      }

      setSuccess("Thanks for your feedback. We have received it.");
      setRating(0);
      setFeedback("");
      setPhone("");
    } catch (err) {
      setError(err?.message || "Unable to submit feedback right now.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Box className="brochure-bg" py={{ base: 5, md: 7 }}>
      <Container maxW="640px">
        <Box className="soft-card" p={{ base: 4, md: 5 }}>
          <Heading size={{ base: "xl", md: "2xl" }} className="hero-title" color="gray.800">
            Share your
            <Box as="span" className="hero-subline" color="teal.700">Feedback</Box>
          </Heading>

          <Text mt={2} color="gray.700" fontSize={{ base: "sm", md: "md" }}>
            Your feedback helps us improve the website and booking experience.
          </Text>

          <VStack as="form" onSubmit={handleSubmit} align="stretch" gap={3} mt={4}>
            <Box>
              <Text fontSize="sm" color="gray.700" mb={1.5} fontWeight="700">Rating</Text>

              <HStack spacing={2} flexWrap="wrap" mb={1.5}>
                {[1, 2, 3, 4, 5].map((value) => {
                  const meta = ratingScale.find((item) => item.value === value);
                  const active = rating === value;
                  return (
                    <Button
                      key={value}
                      size="sm"
                      variant={active ? "solid" : "outline"}
                      bg={active ? meta?.color : undefined}
                      borderColor={meta?.color}
                      color={active ? "white" : "gray.700"}
                      onClick={() => setRating(value)}
                      disabled={busy}
                    >
                      {value}
                    </Button>
                  );
                })}
              </HStack>

              <HStack spacing={1} flexWrap="nowrap" justify="space-between" py={0.5} w="full">
                {ratingScale
                  .slice()
                  .reverse()
                  .map((item) => (
                    <HStack key={item.value} spacing={1} flexShrink={0}>
                      <Box w="7px" h="7px" borderRadius="full" bg={item.color} />
                      <Text fontSize={{ base: "9px", md: "11px" }} color="gray.600" whiteSpace="nowrap">
                        {item.value} - {item.label}
                      </Text>
                    </HStack>
                  ))}
              </HStack>
            </Box>

            <Box>
              <Text fontSize="sm" color="gray.700" mb={1.5} fontWeight="700">
                Comments {lowRatingSelected ? "*" : "(optional)"}
              </Text>
              <Textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder={lowRatingSelected ? "Please tell us what went wrong" : "Tell us what we should improve"}
                rows={3}
                maxLength={500}
                disabled={busy}
              />
            </Box>

            <Box>
              <Text fontSize="sm" color="gray.700" mb={1.5} fontWeight="700">
                Phone {lowRatingSelected ? "*" : "(optional)"}
              </Text>
              <Input
                type="tel"
                inputMode="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder={lowRatingSelected ? "Required for low rating follow-up" : "For follow-up if needed"}
                disabled={busy}
              />
            </Box>

            {error ? <Text fontSize="sm" color="red.600">{error}</Text> : null}
            {success ? <Text fontSize="sm" color="green.700">{success}</Text> : null}

            <HStack spacing={2} pt={0.5}>
              <Button type="submit" isLoading={busy} loadingText="Submitting...">Submit Feedback</Button>
            </HStack>
          </VStack>
        </Box>
      </Container>
    </Box>
  );
}
