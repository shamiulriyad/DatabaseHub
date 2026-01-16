# Frontend Changes Required for Codeforces-Style Contests

## ✅ Completed Changes

### 1. Updated `competitionService.js`
Added two new API methods:
- `getAdminQuestions(competitionId)` - For creator/admin to view questions anytime
- `getParticipantQuestions(competitionId)` - For participants to view questions during contest

---

## 🔧 Changes Needed in Frontend

### 1. **CompetitionDetail.jsx** - Main Updates Required

#### A. Hide "Join Competition" Button for Creator/Admin
```jsx
// Check if user is creator or admin
const isCreatorOrAdmin = competition?.creatorId === user?.id || user?.isAdmin;

// In the render section:
{!isCreatorOrAdmin && competition?.status === 'upcoming' && (
  <Button 
    colorScheme="purple" 
    onClick={handleJoinCompetition}
    isLoading={joiningLoading}
  >
    Join Competition
  </Button>
)}

{isCreatorOrAdmin && (
  <Badge colorScheme="orange">Creator/Admin - Cannot Participate</Badge>
)}
```

#### B. Add Questions Tab with Status-Based Access
```jsx
<Tab>Questions</Tab>

// In TabPanels:
<TabPanel>
  {competition?.status === 'upcoming' && !isCreatorOrAdmin && (
    <Alert status="info">
      <AlertIcon />
      Questions will be visible when the contest starts ({formatDate(competition.startDate)})
    </Alert>
  )}
  
  {competition?.status === 'upcoming' && isCreatorOrAdmin && (
    <Box>
      <Badge colorScheme="green" mb={4}>Admin Preview</Badge>
      <CompetitionQuestions 
        competitionId={id} 
        isAdmin={true}
      />
    </Box>
  )}
  
  {competition?.status === 'ongoing' && isJoined && (
    <CompetitionQuestions 
      competitionId={id} 
      isAdmin={false}
    />
  )}
  
  {competition?.status === 'ongoing' && !isJoined && (
    <Alert status="warning">
      <AlertIcon />
      You must join the competition to view questions
    </Alert>
  )}
  
  {competition?.status === 'completed' && (
    <Alert status="info">
      <AlertIcon />
      Contest has ended. Questions are no longer visible.
    </Alert>
  )}
</TabPanel>
```

### 2. **Create CompetitionQuestions.jsx Component**

```jsx
import React, { useEffect, useState } from 'react';
import { Box, VStack, Text, Badge, Spinner, Alert } from '@chakra-ui/react';
import competitionService from '../../services/competitionService';

const CompetitionQuestions = ({ competitionId, isAdmin }) => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchQuestions();
  }, [competitionId, isAdmin]);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      let response;
      
      if (isAdmin) {
        response = await competitionService.getAdminQuestions(competitionId);
      } else {
        response = await competitionService.getParticipantQuestions(competitionId);
      }
      
      if (response.success) {
        setQuestions(response.data || []);
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load questions');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Spinner />;
  if (error) return <Alert status="error">{error}</Alert>;
  if (!questions.length) return <Text>No questions available</Text>;

  return (
    <VStack align="stretch" spacing={4}>
      {questions.map((q, index) => (
        <Box key={q.id} p={4} borderWidth={1} borderRadius="md">
          <Text fontWeight="bold" mb={2}>
            Question {index + 1} 
            <Badge ml={2} colorScheme="purple">{q.points} pts</Badge>
          </Text>
          <Text mb={3}>{q.questionText}</Text>
          
          <VStack align="stretch" spacing={2}>
            <Box p={2} bg="gray.50" borderRadius="md">A. {q.optionA}</Box>
            <Box p={2} bg="gray.50" borderRadius="md">B. {q.optionB}</Box>
            <Box p={2} bg="gray.50" borderRadius="md">C. {q.optionC}</Box>
            <Box p={2} bg="gray.50" borderRadius="md">D. {q.optionD}</Box>
          </VStack>
          
          {isAdmin && (
            <Badge colorScheme="green" mt={2}>
              Correct Answer: {q.correctAnswer}
            </Badge>
          )}
        </Box>
      ))}
    </VStack>
  );
};

export default CompetitionQuestions;
```

### 3. **CompetitionList.jsx** - Optional Enhancement

Add visual indicators for contest status:
```jsx
<Badge colorScheme={
  status === 'upcoming' ? 'blue' :
  status === 'ongoing' ? 'green' :
  'gray'
}>
  {status === 'ongoing' && '🔴 LIVE'} {status.toUpperCase()}
</Badge>
```

### 4. **Error Handling Updates**

Update toast messages to handle new error responses:
```jsx
catch (error) {
  const message = error.response?.data?.message || 'Operation failed';
  toast({
    title: 'Error',
    description: message,
    status: 'error',
    duration: 5000,
    isClosable: true,
  });
}
```

---

## 📋 Summary of Behavioral Changes

### Before Contest (Upcoming)
- ✅ Admin/Creator: Can view questions via admin endpoint
- ❌ Participants: Cannot see questions, show countdown timer
- ❌ Creator/Admin: Cannot join competition

### During Contest (Ongoing)
- ✅ Admin/Creator: Can view questions
- ✅ Registered Participants: Can view questions via participant endpoint
- ❌ Non-registered users: Must join first
- ❌ Creator/Admin: Still cannot join

### After Contest (Completed)
- ✅ Admin/Creator: Can view questions
- ❌ Participants: Questions no longer visible
- Show results/leaderboard instead

---

## 🎯 Key Frontend Logic

```javascript
// Check if user can view questions
const canViewQuestions = () => {
  const isCreator = competition.creatorId === user?.id;
  const isAdmin = user?.isAdmin;
  const isOngoing = competition.status === 'ongoing';
  const isParticipant = isJoined;
  
  // Admin/Creator: anytime
  if (isCreator || isAdmin) return { can: true, endpoint: 'admin' };
  
  // Participant: only during ongoing
  if (isOngoing && isParticipant) return { can: true, endpoint: 'participant' };
  
  return { can: false, reason: getBlockedReason() };
};

const getBlockedReason = () => {
  if (competition.status === 'upcoming') {
    return `Contest starts at ${formatDate(competition.startDate)}`;
  }
  if (competition.status === 'completed') {
    return 'Contest has ended';
  }
  if (!isJoined) {
    return 'You must join the competition first';
  }
  return 'Questions not available';
};
```

---

## 🚀 Testing Checklist

- [ ] Creator can view questions before contest starts
- [ ] Participants cannot see questions before contest
- [ ] Participants can see questions during contest (if joined)
- [ ] Non-participants cannot see questions during contest
- [ ] Proper error messages shown for each scenario
- [ ] Admin can never join competitions
- [ ] Creator can never join their own competition
- [ ] Questions disappear after contest ends (for participants)
- [ ] Status badges update in real-time
- [ ] Countdown timer shown for upcoming contests

---

## 📝 Notes

1. **Real-time Updates**: Consider adding WebSocket/polling for status changes
2. **Timer Component**: Add countdown to contest start/end
3. **Question Submission**: You'll need to add answer submission logic
4. **Score Tracking**: Track user answers and calculate scores
5. **Navigation Guard**: Prevent access to question routes if not authorized
