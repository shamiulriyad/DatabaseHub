import React, { useCallback, useEffect, useMemo, useState } from 'react';
import api from '../../services/api';

const ui = {
  bg: '#070914',
  card: '#0f1224',
  cardAlt: '#131733',
  cardSoft: 'rgba(15, 18, 36, 0.78)',
  border: 'rgba(139, 92, 246, 0.2)',
  borderSoft: 'rgba(148, 163, 184, 0.16)',
  text: '#e2e8f0',
  sub: '#94a3b8',
  muted: '#64748b',
  purple: '#8b5cf6',
  cyan: '#22d3ee',
  green: '#10b981',
  orange: '#f59e0b',
  red: '#ef4444',
  shadow: '0 10px 30px rgba(3, 6, 20, 0.45)',
};

const competitionTypeOptions = [
  'ProgrammingMCQ',
  'DebuggingFix',
  'Quiz',
  'Mixed',
];

const periodOptions = ['Weekly', 'Monthly', 'Seasonal'];

const challengeOptions = ['ProblemSolving', 'Quiz', 'SpeedCoding', 'Debugging', 'Logical', 'AI'];

const defaultWeights = {
  ProblemSolving: 0.35,
  Quiz: 0.15,
  SpeedCoding: 0.15,
  Debugging: 0.15,
  Logical: 0.1,
  AI: 0.1,
};

const defaultForm = {
  title: '',
  description: '',
  competitionType: 'ProgrammingMCQ',
  competitionPeriod: 'Weekly',
  startAt: '',
  endAt: '',
  teamMinSize: 3,
  teamMaxSize: 4,
  topTeamsCountForClanScore: 2,
  maxTeamsPerClan: 2,
  weights: defaultWeights,
};

const defaultQuestionForm = {
  questionText: '',
  optionA: '',
  optionB: '',
  optionC: '',
  optionD: '',
  correctAnswer: 'A',
  points: 10,
};

const defaultAdminClanExpDistribution = [
  { rankRange: '1', exp: 1000 },
  { rankRange: '2', exp: 800 },
  { rankRange: '3', exp: 500 },
  { rankRange: '4-10', exp: 300 },
  { rankRange: '11+', exp: 50 },
];

const getAdminClanExpByRank = (rankNo) => {
  const rank = Number(rankNo || 0);
  if (rank <= 0) return 50;
  if (rank === 1) return 1000;
  if (rank === 2) return 800;
  if (rank === 3) return 500;
  if (rank <= 10) return 300;
  return 50;
};

const box = {
  background: ui.cardSoft,
  border: `1px solid ${ui.border}`,
  borderRadius: 16,
  padding: 18,
  boxShadow: ui.shadow,
  backdropFilter: 'blur(8px)',
};

const unwrap = (res) => res?.data?.data ?? null;

const notifyStyle = (status) => {
  if (status === 'success') return { color: ui.green, border: `${ui.green}66` };
  if (status === 'error') return { color: ui.red, border: `${ui.red}66` };
  if (status === 'warning') return { color: ui.orange, border: `${ui.orange}66` };
  return { color: ui.cyan, border: `${ui.cyan}66` };
};

const TabButton = ({ active, onClick, label }) => (
  <button
    onClick={onClick}
    className={`cc-tab-btn ${active ? 'is-active' : ''}`}
    style={{
      background: active ? 'linear-gradient(135deg,#7c3aed4f,#22d3ee3a)' : 'transparent',
      color: active ? ui.text : ui.sub,
      border: `1px solid ${active ? ui.purple : ui.borderSoft}`,
      borderRadius: 10,
      padding: '10px 14px',
      fontWeight: 600,
      cursor: 'pointer',
      whiteSpace: 'nowrap',
      transition: 'all .2s ease',
    }}
  >
    {label}
  </button>
);

const FieldLabel = ({ children }) => (
  <p style={{ fontSize: 11, color: ui.muted, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>
    {children}
  </p>
);

const Input = ({ style = {}, className = '', ...props }) => (
  <input
    {...props}
    className={`cc-field ${className}`.trim()}
    style={{
      width: '100%',
      borderRadius: 10,
      background: ui.cardAlt,
      border: `1px solid ${ui.borderSoft}`,
      color: ui.text,
      padding: '10px 12px',
      outline: 'none',
      transition: 'all .2s ease',
      ...style,
    }}
  />
);

const Textarea = ({ style = {}, className = '', ...props }) => (
  <textarea
    {...props}
    className={`cc-field ${className}`.trim()}
    style={{
      width: '100%',
      minHeight: 80,
      borderRadius: 10,
      background: ui.cardAlt,
      border: `1px solid ${ui.borderSoft}`,
      color: ui.text,
      padding: '10px 12px',
      outline: 'none',
      resize: 'vertical',
      transition: 'all .2s ease',
      ...style,
    }}
  />
);

const Select = ({ style = {}, children, className = '', ...props }) => (
  <select
    {...props}
    className={`cc-field ${className}`.trim()}
    style={{
      width: '100%',
      borderRadius: 10,
      background: ui.cardAlt,
      border: `1px solid ${ui.borderSoft}`,
      color: ui.text,
      padding: '10px 12px',
      outline: 'none',
      transition: 'all .2s ease',
      ...style,
    }}
  >
    {children}
  </select>
);

const Button = ({ variant = 'purple', style = {}, className = '', ...props }) => {
  const map = {
    purple: { background: 'linear-gradient(135deg,#7c3aed,#8b5cf6)', color: '#fff' },
    green: { background: 'linear-gradient(135deg,#059669,#10b981)', color: '#fff' },
    blue: { background: 'linear-gradient(135deg,#0284c7,#22d3ee)', color: '#fff' },
    orange: { background: 'linear-gradient(135deg,#d97706,#f59e0b)', color: '#fff' },
    red: { background: 'linear-gradient(135deg,#dc2626,#ef4444)', color: '#fff' },
    ghost: { background: 'transparent', color: ui.sub, border: `1px solid ${ui.border}` },
  };
  const v = map[variant] || map.purple;
  return (
    <button
      {...props}
      className={`cc-btn cc-btn-${variant} ${className}`.trim()}
      style={{
        borderRadius: 10,
        border: v.border || 'none',
        padding: '10px 14px',
        fontWeight: 600,
        cursor: 'pointer',
        background: v.background,
        color: v.color,
        transition: 'transform .2s ease, box-shadow .2s ease, opacity .2s ease',
        ...style,
      }}
    />
  );
};

const Badge = ({ children, color = ui.purple }) => (
  <span
    style={{
      border: `1px solid ${color}88`,
      color,
      background: `${color}22`,
      borderRadius: 999,
      padding: '2px 10px',
      fontSize: 12,
      fontWeight: 700,
      whiteSpace: 'nowrap',
    }}
  >
    {children}
  </span>
);

const EmptyState = ({ title }) => (
  <div style={{ ...box, textAlign: 'center', color: ui.sub, padding: 26 }}>{title}</div>
);

const DataTable = ({ columns, rows, keyField = 'id' }) => (
  <div className="cc-table-wrap" style={{ overflowX: 'auto' }}>
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr>
          {columns.map((col) => (
            <th
              key={col.key}
              style={{
                fontSize: 11,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: ui.muted,
                textAlign: col.align || 'left',
                borderBottom: `1px solid ${ui.border}`,
                padding: '10px 12px',
                position: 'sticky',
                top: 0,
                background: 'rgba(19, 23, 51, 0.95)',
                zIndex: 1,
              }}
            >
              {col.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.length === 0 ? (
          <tr>
            <td colSpan={columns.length} style={{ padding: 20, textAlign: 'center', color: ui.muted }}>
              No data
            </td>
          </tr>
        ) : (
          rows.map((row, i) => (
            <tr key={row[keyField] ?? i} className="cc-table-row">
              {columns.map((col) => (
                <td key={col.key} style={{ padding: '10px 12px', borderBottom: `1px solid rgba(139, 92, 246, 0.08)`, color: ui.text, textAlign: col.align || 'left' }}>
                  {col.render ? col.render(row[col.key], row) : row[col.key] ?? '—'}
                </td>
              ))}
            </tr>
          ))
        )}
      </tbody>
    </table>
  </div>
);

const ClanCompetitionAdmin = () => {
  const [activeTab, setActiveTab] = useState('competitions');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const [competitions, setCompetitions] = useState([]);
  const [selectedCompetition, setSelectedCompetition] = useState(null);
  const [editingCompetitionId, setEditingCompetitionId] = useState(null);
  const [form, setForm] = useState(defaultForm);

  const [teams, setTeams] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [teamLeaderboard, setTeamLeaderboard] = useState([]);
  const [clanLeaderboard, setClanLeaderboard] = useState([]);
  const [expDistribution, setExpDistribution] = useState(defaultAdminClanExpDistribution);
  const [globalClanRanking, setGlobalClanRanking] = useState([]);

  const [suggestionPolicy, setSuggestionPolicy] = useState({
    totalTeamsAllowed: 20,
    topTierMaxTeams: 3,
    midTierMaxTeams: 2,
    lowTierMaxTeams: 1,
    historicalPerformanceWeight: 0.2,
    activeMemberWeight: 0.1,
  });
  const [suggestions, setSuggestions] = useState([]);
  const [suggestionSummary, setSuggestionSummary] = useState(null);
  const [overrideCounts, setOverrideCounts] = useState({});

  const [selectedType, setSelectedType] = useState('ProgrammingMCQ');
  const [typePerformance, setTypePerformance] = useState([]);
  const [typePerformanceLoading, setTypePerformanceLoading] = useState(false);
  const [questionForm, setQuestionForm] = useState(defaultQuestionForm);

  const pushMessage = useCallback((title, status = 'info') => {
    setMessage({ title, status });
    setTimeout(() => setMessage(null), 2500);
  }, []);

  const totalWeight = useMemo(() => Object.values(form.weights).reduce((sum, v) => sum + Number(v || 0), 0), [form.weights]);
  const isWeightValid = Math.abs(totalWeight - 1) < 0.001;

  const fetchCompetitions = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/clan-competitions');
      const rows = unwrap(response) || [];
      setCompetitions(rows);
      setSelectedCompetition((prev) => {
        if (!prev) return null;
        const next = rows.find((r) => r.id === prev.id);
        return next || null;
      });
    } catch (error) {
      pushMessage(error?.response?.data?.message || 'Failed to load competitions', 'error');
    } finally {
      setLoading(false);
    }
  }, [pushMessage]);

  const fetchGlobalRanking = useCallback(async () => {
    try {
      const response = await api.get('/admin/clan-competitions/clans/ranking');
      setGlobalClanRanking(unwrap(response) || []);
    } catch {
      setGlobalClanRanking([]);
    }
  }, []);

  const loadCompetitionMeta = useCallback(async (competition) => {
    if (!competition) return;
    setSelectedCompetition(competition);
    try {
      const [teamsRes, submissionsRes, teamLbRes, clanLbRes, suggestionRes, questionsRes] = await Promise.all([
        api.get(`/admin/clan-competitions/${competition.id}/teams`),
        api.get(`/admin/clan-competitions/${competition.id}/submissions`),
        api.get(`/admin/clan-competitions/${competition.id}/leaderboard/teams`).catch(() => null),
        api.get(`/admin/clan-competitions/${competition.id}/leaderboard/clans`).catch(() => null),
        api.get(`/admin/clan-competitions/${competition.id}/team-suggestions`).catch(() => null),
        api.get(`/admin/clan-competitions/${competition.id}/questions`).catch(() => null),
      ]);

      setTeams(unwrap(teamsRes) || []);
      setSubmissions(unwrap(submissionsRes) || []);
      setQuestions(unwrap(questionsRes) || []);
      setTeamLeaderboard(unwrap(teamLbRes) || []);
      setClanLeaderboard(unwrap(clanLbRes) || []);

      const summary = unwrap(suggestionRes);
      setSuggestionSummary(summary || null);
      const summarySuggestions = summary?.suggestions || [];
      setSuggestions(summarySuggestions);
      setOverrideCounts(summarySuggestions.reduce((acc, row) => ({ ...acc, [row.clanId]: row.suggestedTeamCount }), {}));
    } catch (error) {
      pushMessage(error?.response?.data?.message || 'Failed to load competition details', 'error');
    }
  }, [pushMessage]);

  useEffect(() => {
    fetchCompetitions();
    fetchGlobalRanking();
  }, [fetchCompetitions, fetchGlobalRanking]);

  const resetForm = () => {
    setForm(defaultForm);
    setEditingCompetitionId(null);
  };

  const beginEdit = (row) => {
    setActiveTab('competitions');
    setEditingCompetitionId(row.id);
    setForm({
      title: row.title || '',
      description: row.description || '',
      competitionType: row.competitionType || 'ProgrammingMCQ',
      competitionPeriod: row.competitionPeriod || 'Weekly',
      startAt: row.startDate ? new Date(row.startDate).toISOString().slice(0, 16) : '',
      endAt: row.endDate ? new Date(row.endDate).toISOString().slice(0, 16) : '',
      teamMinSize: row.teamMinSize || 3,
      teamMaxSize: row.teamMaxSize || 4,
      topTeamsCountForClanScore: row.topTeamsCountForClanScore || 2,
      maxTeamsPerClan: row.maxTeamsPerClan || 2,
      weights: row.challengeTypes?.length
        ? row.challengeTypes.reduce((acc, c) => ({ ...acc, [c.challengeType]: Number(c.weight) }), defaultWeights)
        : defaultWeights,
    });
      window.scrollTo({ top: 0, behavior: 'smooth' });
      pushMessage(`Edit mode enabled: ${row.title || 'Competition'}`, 'info');
  };

  const saveCompetition = async () => {
    if (!form.title || !form.startAt || !form.endAt) {
      pushMessage('Title, start time and end time are required', 'warning');
      return;
    }
    if (!isWeightValid) {
      pushMessage('Challenge weights must total 1.00', 'warning');
      return;
    }

    const payload = {
      title: form.title,
      description: form.description,
      competitionType: form.competitionType,
      competitionPeriod: form.competitionPeriod,
      startAt: new Date(form.startAt).toISOString(),
      endAt: new Date(form.endAt).toISOString(),
      teamMinSize: Number(form.teamMinSize),
      teamMaxSize: Number(form.teamMaxSize),
      topTeamsCountForClanScore: Number(form.topTeamsCountForClanScore),
      maxTeamsPerClan: Number(form.maxTeamsPerClan),
      challengeTypes: challengeOptions.map((challengeType) => ({
        challengeType,
        weight: Number(form.weights[challengeType] || 0),
      })),
    };

    setLoading(true);
    try {
      if (editingCompetitionId) {
        await api.put(`/admin/clan-competitions/${editingCompetitionId}`, {
          title: payload.title,
          description: payload.description,
          startDate: payload.startAt,
          endDate: payload.endAt,
        });
        pushMessage('Competition updated', 'success');
      } else {
        await api.post('/admin/clan-competitions', payload);
        pushMessage('Competition created', 'success');
      }
      resetForm();
      await fetchCompetitions();
    } catch (error) {
      pushMessage(error?.response?.data?.message || 'Failed to save competition', 'error');
    } finally {
      setLoading(false);
    }
  };

  const deleteCompetition = async (id) => {
    if (!window.confirm('Delete this competition?')) return;
    setLoading(true);
    try {
      await api.delete(`/admin/clan-competitions/${id}`);
      pushMessage('Competition deleted', 'success');
      if (selectedCompetition?.id === id) {
        setSelectedCompetition(null);
        setQuestions([]);
        setSuggestions([]);
        setSuggestionSummary(null);
      }
      await fetchCompetitions();
    } catch (error) {
      pushMessage(error?.response?.data?.message || 'Failed to delete competition', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadLeaderboards = async () => {
    if (!selectedCompetition) {
      pushMessage('Select a competition first', 'warning');
      return;
    }
    setLoading(true);
    try {
      const [teamRes, clanRes] = await Promise.all([
        api.get(`/admin/clan-competitions/${selectedCompetition.id}/leaderboard/teams`),
        api.get(`/admin/clan-competitions/${selectedCompetition.id}/leaderboard/clans`),
      ]);
      setTeamLeaderboard(unwrap(teamRes) || []);
      setClanLeaderboard(unwrap(clanRes) || []);
      pushMessage('Leaderboards loaded', 'success');
    } catch (error) {
      pushMessage(error?.response?.data?.message || 'Failed to load leaderboard', 'error');
    } finally {
      setLoading(false);
    }
  };

  const finalizeCompetition = async () => {
    if (!selectedCompetition) {
      pushMessage('Select a competition first', 'warning');
      return;
    }
    if (!window.confirm('Finalize this competition and compute final ranking?')) return;

    setLoading(true);
    try {
      const response = await api.post(`/admin/clan-competitions/${selectedCompetition.id}/finalize`);
      const finalized = unwrap(response) || {};
      setTeamLeaderboard(finalized.teamLeaderboard || []);
      setClanLeaderboard(finalized.clanLeaderboard || []);
      setExpDistribution(finalized.expDistribution?.length ? finalized.expDistribution : defaultAdminClanExpDistribution);
      pushMessage('Competition finalized', 'success');
      await fetchCompetitions();
    } catch (error) {
      pushMessage(error?.response?.data?.message || 'Failed to finalize', 'error');
    } finally {
      setLoading(false);
    }
  };

  const exportCsv = (rows, filename) => {
    if (!rows?.length) {
      pushMessage('No rows to export', 'warning');
      return;
    }
    const columns = Object.keys(rows[0]);
    const csv = [
      columns.join(','),
      ...rows.map((r) => columns.map((c) => `"${String(r[c] ?? '').replaceAll('"', '""')}"`).join(',')),
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}.csv`;
    link.click();
  };

  const generateSuggestions = async () => {
    if (!selectedCompetition) {
      pushMessage('Select a competition first', 'warning');
      return;
    }
    setLoading(true);
    try {
      const payload = {
        totalTeamsAllowed: Number(suggestionPolicy.totalTeamsAllowed),
        topTierMaxTeams: Number(suggestionPolicy.topTierMaxTeams),
        midTierMaxTeams: Number(suggestionPolicy.midTierMaxTeams),
        lowTierMaxTeams: Number(suggestionPolicy.lowTierMaxTeams),
        historicalPerformanceWeight: Number(suggestionPolicy.historicalPerformanceWeight),
        activeMemberWeight: Number(suggestionPolicy.activeMemberWeight),
      };

      const response = await api.post(`/admin/clan-competitions/${selectedCompetition.id}/suggest-teams`, payload);
      const rows = response?.data?.suggestions || [];
      setSuggestions(rows);
      const distributionFromSuggestions = rows.reduce((acc, row) => {
        acc[row.clanId] = Number(row.suggestedTeamCount || 0);
        return acc;
      }, {});
      setOverrideCounts(distributionFromSuggestions);
      pushMessage(response?.data?.message || 'Suggestions generated', 'success');

      const summaryRes = await api.get(`/admin/clan-competitions/${selectedCompetition.id}/team-suggestions`);
      setSuggestionSummary(unwrap(summaryRes));
    } catch (error) {
      pushMessage(error?.response?.data?.message || 'Failed to generate suggestions', 'error');
    } finally {
      setLoading(false);
    }
  };

  const applyOverrides = async () => {
    if (!selectedCompetition) {
      pushMessage('Select a competition first', 'warning');
      return;
    }

    const maxTeams = Number(selectedCompetition?.maxTeamsPerClan || form.maxTeamsPerClan || 2);
    const overrides = suggestions
      .map((row) => ({ clanId: row.clanId, assignedTeamCount: Number(overrideCounts[row.clanId] ?? row.suggestedTeamCount) }))
      .filter((row) => Number.isFinite(row.assignedTeamCount));

    if (overrides.some((row) => row.assignedTeamCount < 0 || row.assignedTeamCount > maxTeams)) {
      pushMessage(`Override must be between 0 and ${maxTeams}`, 'warning');
      return;
    }

    setLoading(true);
    try {
      await api.post(`/admin/clan-competitions/${selectedCompetition.id}/override-teams`, {
        totalTeamsAllowed: Number(suggestionPolicy.totalTeamsAllowed),
        overrides,
      });
      const summaryRes = await api.get(`/admin/clan-competitions/${selectedCompetition.id}/team-suggestions`);
      const summary = unwrap(summaryRes);
      setSuggestionSummary(summary);
      setSuggestions(summary?.suggestions || []);
      pushMessage('Manual overrides applied', 'success');
    } catch (error) {
      pushMessage(error?.response?.data?.message || 'Failed to apply overrides', 'error');
    } finally {
      setLoading(false);
    }
  };

  const approveTeam = async (teamId, action) => {
    if (!selectedCompetition) return;
    setLoading(true);
    try {
      await api.put(`/admin/clan-competitions/${selectedCompetition.id}/teams/${teamId}/approval`, { action });
      const response = await api.get(`/admin/clan-competitions/${selectedCompetition.id}/teams`);
      setTeams(unwrap(response) || []);
      pushMessage(`Team ${action.toLowerCase()} successfully`, 'success');
    } catch (error) {
      pushMessage(error?.response?.data?.message || 'Team approval failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadQuestions = async () => {
    if (!selectedCompetition) {
      pushMessage('Select a competition first', 'warning');
      return;
    }
    setLoading(true);
    try {
      const response = await api.get(`/admin/clan-competitions/${selectedCompetition.id}/questions`);
      setQuestions(unwrap(response) || []);
    } catch (error) {
      pushMessage(error?.response?.data?.message || 'Failed to load questions', 'error');
    } finally {
      setLoading(false);
    }
  };

  const addQuestion = async () => {
    if (!selectedCompetition) {
      pushMessage('Select a competition first', 'warning');
      return;
    }

    if (!questionForm.questionText || !questionForm.optionA || !questionForm.optionB || !questionForm.optionC || !questionForm.optionD) {
      pushMessage('Question text and all options are required', 'warning');
      return;
    }

    setLoading(true);
    try {
      await api.post(`/admin/clan-competitions/${selectedCompetition.id}/questions`, {
        questionText: questionForm.questionText,
        optionA: questionForm.optionA,
        optionB: questionForm.optionB,
        optionC: questionForm.optionC,
        optionD: questionForm.optionD,
        correctAnswer: questionForm.correctAnswer,
        points: Number(questionForm.points || 1),
        questionOrder: questions.length + 1,
      });

      setQuestionForm(defaultQuestionForm);
      await loadQuestions();
      pushMessage('Question added', 'success');
    } catch (error) {
      pushMessage(error?.response?.data?.message || 'Failed to add question', 'error');
    } finally {
      setLoading(false);
    }
  };

  const deleteQuestion = async (questionId) => {
    if (!selectedCompetition) return;
    if (!window.confirm('Delete this question?')) return;

    setLoading(true);
    try {
      await api.delete(`/admin/clan-competitions/${selectedCompetition.id}/questions/${questionId}`);
      await loadQuestions();
      pushMessage('Question deleted', 'success');
    } catch (error) {
      pushMessage(error?.response?.data?.message || 'Failed to delete question', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadTypePerformance = async () => {
    setTypePerformanceLoading(true);
    try {
      const candidates = competitions.filter((c) => (c.competitionType || 'ProgrammingMCQ') === selectedType);
      if (!candidates.length) {
        setTypePerformance([]);
        return;
      }

      const clanMap = new Map();
      await Promise.all(
        candidates.map(async (comp) => {
          try {
            const res = await api.get(`/admin/clan-competitions/${comp.id}/leaderboard/clans`);
            const rows = unwrap(res) || [];
            rows.forEach((row) => {
              const existing = clanMap.get(row.clanId) || {
                clanId: row.clanId,
                clanName: row.clanName,
                competitionsPlayed: 0,
                totalScore: 0,
                rankSum: 0,
                bestClanRank: Number.POSITIVE_INFINITY,
              };
              existing.competitionsPlayed += 1;
              existing.totalScore += Number(row.totalScore || 0);
              existing.rankSum += Number(row.rankNo || 0);
              existing.bestClanRank = Math.min(existing.bestClanRank, Number(row.rankNo || Number.POSITIVE_INFINITY));
              clanMap.set(row.clanId, existing);
            });
          } catch {
            return null;
          }
          return null;
        })
      );

      const rows = [...clanMap.values()]
        .map((row) => ({
          ...row,
          averageClanRank: row.competitionsPlayed ? Number((row.rankSum / row.competitionsPlayed).toFixed(2)) : 0,
          averageScore: row.competitionsPlayed ? Number((row.totalScore / row.competitionsPlayed).toFixed(2)) : 0,
        }))
        .sort((a, b) => a.averageClanRank - b.averageClanRank || b.totalScore - a.totalScore);

      setTypePerformance(rows);
    } finally {
      setTypePerformanceLoading(false);
    }
  };

  const selectedInfo = selectedCompetition ? (
    <div style={{ ...box, marginBottom: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
      <div>
        <p style={{ color: ui.muted, fontSize: 12 }}>Selected Competition</p>
        <p style={{ color: ui.text, fontWeight: 700 }}>{selectedCompetition.title}</p>
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <Badge color={ui.cyan}>{selectedCompetition.competitionType || 'ProgrammingMCQ'}</Badge>
        <Badge color={ui.purple}>Max Teams/Clan: {selectedCompetition.maxTeamsPerClan ?? 2}</Badge>
        <Badge color={selectedCompetition.status === 'Completed' ? ui.green : ui.orange}>{selectedCompetition.status}</Badge>
      </div>
    </div>
  ) : null;

  return (
    <div
      className="cc-admin-root"
      style={{
        minHeight: '100vh',
        background: `radial-gradient(circle at top, rgba(139,92,246,0.18), transparent 45%), radial-gradient(circle at 80% 0%, rgba(34,211,238,0.12), transparent 32%), ${ui.bg}`,
        color: ui.text,
        padding: '28px 22px',
      }}
    >
      <style>{`
        select option { background: #0f1224; color: #e2e8f0; }
        .cc-admin-root * { box-sizing: border-box; }
        .cc-admin-root h1, .cc-admin-root h3 { letter-spacing: .2px; }
        .cc-tab-btn:hover { border-color: rgba(139, 92, 246, .8) !important; transform: translateY(-1px); }
        .cc-tab-btn.is-active { box-shadow: 0 8px 22px rgba(139, 92, 246, .25); }
        .cc-btn:hover { transform: translateY(-1px); }
        .cc-btn:disabled { opacity: .6; cursor: not-allowed; transform: none; }
        .cc-btn-purple:hover, .cc-btn-green:hover, .cc-btn-blue:hover, .cc-btn-orange:hover, .cc-btn-red:hover { box-shadow: 0 9px 22px rgba(10, 14, 35, .45); }
        .cc-btn-ghost:hover { border-color: rgba(139,92,246,.65) !important; background: rgba(139,92,246,.10) !important; color: #e2e8f0 !important; }
        .cc-field:focus { border-color: rgba(139,92,246,.7) !important; box-shadow: 0 0 0 3px rgba(139,92,246,.14); }
        .cc-table-wrap { border: 1px solid rgba(139, 92, 246, .18); border-radius: 12px; overflow: auto; }
        .cc-table-row:hover { background: rgba(139, 92, 246, .07); }
        .cc-scroll { overflow-y: auto; }
        .cc-header-panel {
          background: linear-gradient(135deg, rgba(124,58,237,.18), rgba(34,211,238,.08));
          border: 1px solid rgba(139,92,246,.24);
          border-radius: 16px;
          padding: 16px;
          box-shadow: 0 14px 30px rgba(3, 6, 20, .42);
          margin-bottom: 16px;
        }
        .cc-tabs-bar {
          position: sticky;
          top: 10px;
          z-index: 4;
          background: rgba(7, 9, 20, .78);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(139,92,246,.22);
          border-radius: 12px;
          padding: 8px;
          margin-bottom: 14px;
        }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-thumb { background: rgba(139,92,246,0.45); border-radius: 999px; }
        @media (max-width: 1080px) {
          .cc-grid-2, .cc-grid-2-wide, .cc-grid-questions, .cc-grid-performance, .cc-grid-leaderboard, .cc-grid-suggest {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

      <div style={{ maxWidth: 1400, margin: '0 auto' }}>
        <div className="cc-header-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 28 }}>Clan Multi-Competition Admin</h1>
            <p style={{ marginTop: 6, color: ui.sub }}>
              Create competition by type, enforce clan team limit, generate performance-based clan suggestions, and manage separate leaderboards.
            </p>
          </div>
          {loading ? <Badge color={ui.cyan}>Loading...</Badge> : null}
        </div>

        {message ? (
          <div style={{ ...box, marginBottom: 14, borderColor: notifyStyle(message.status).border, color: notifyStyle(message.status).color }}>
            {message.title}
          </div>
        ) : null}

        <div className="cc-tabs-bar" style={{ display: 'flex', gap: 8, overflowX: 'auto' }}>
          <TabButton active={activeTab === 'competitions'} onClick={() => setActiveTab('competitions')} label="Competitions" />
          <TabButton active={activeTab === 'questions'} onClick={() => setActiveTab('questions')} label="Questions" />
          <TabButton active={activeTab === 'suggestions'} onClick={() => setActiveTab('suggestions')} label="Suggestions" />
          <TabButton active={activeTab === 'leaderboards'} onClick={() => setActiveTab('leaderboards')} label="Leaderboards" />
          <TabButton active={activeTab === 'teams'} onClick={() => setActiveTab('teams')} label="Teams" />
          <TabButton active={activeTab === 'submissions'} onClick={() => setActiveTab('submissions')} label="Submissions" />
          <TabButton active={activeTab === 'performance'} onClick={() => setActiveTab('performance')} label="Type Performance" />
        </div>

        {selectedInfo}

        {activeTab === 'competitions' && (
          <div className="cc-grid-2-wide" style={{ display: 'grid', gridTemplateColumns: 'minmax(380px, 1fr) minmax(450px, 1.2fr)', gap: 14 }}>
            <div style={box}>
              <h3 style={{ marginTop: 0, marginBottom: 12 }}>{editingCompetitionId ? 'Edit Competition' : 'Create Competition'}</h3>

              <div style={{ display: 'grid', gap: 10 }}>
                <div>
                  <FieldLabel>Title</FieldLabel>
                  <Input value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} placeholder="Competition title" />
                </div>

                <div>
                  <FieldLabel>Description</FieldLabel>
                  <Textarea value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} placeholder="Competition details" />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div>
                    <FieldLabel>Competition Type</FieldLabel>
                    <Select value={form.competitionType} onChange={(e) => setForm((p) => ({ ...p, competitionType: e.target.value }))}>
                      {competitionTypeOptions.map((type) => <option key={type} value={type}>{type}</option>)}
                    </Select>
                  </div>
                  <div>
                    <FieldLabel>Period</FieldLabel>
                    <Select value={form.competitionPeriod} onChange={(e) => setForm((p) => ({ ...p, competitionPeriod: e.target.value }))}>
                      {periodOptions.map((period) => <option key={period} value={period}>{period}</option>)}
                    </Select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div>
                    <FieldLabel>Start</FieldLabel>
                    <Input type="datetime-local" value={form.startAt} onChange={(e) => setForm((p) => ({ ...p, startAt: e.target.value }))} />
                  </div>
                  <div>
                    <FieldLabel>End</FieldLabel>
                    <Input type="datetime-local" value={form.endAt} onChange={(e) => setForm((p) => ({ ...p, endAt: e.target.value }))} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div>
                    <FieldLabel>Team Min Size</FieldLabel>
                    <Input type="number" min={3} max={4} value={form.teamMinSize} onChange={(e) => setForm((p) => ({ ...p, teamMinSize: Number(e.target.value) }))} />
                  </div>
                  <div>
                    <FieldLabel>Team Max Size</FieldLabel>
                    <Input type="number" min={3} max={4} value={form.teamMaxSize} onChange={(e) => setForm((p) => ({ ...p, teamMaxSize: Number(e.target.value) }))} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div>
                    <FieldLabel>Top Teams for Clan Score</FieldLabel>
                    <Input type="number" min={1} max={10} value={form.topTeamsCountForClanScore} onChange={(e) => setForm((p) => ({ ...p, topTeamsCountForClanScore: Number(e.target.value) }))} />
                  </div>
                  <div>
                    <FieldLabel>Max Teams Per Clan</FieldLabel>
                    <Input type="number" min={1} max={10} value={form.maxTeamsPerClan} onChange={(e) => setForm((p) => ({ ...p, maxTeamsPerClan: Number(e.target.value) }))} />
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <FieldLabel>Challenge Weights</FieldLabel>
                    <Badge color={isWeightValid ? ui.green : ui.red}>Total: {totalWeight.toFixed(2)}</Badge>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                    {challengeOptions.map((key) => (
                      <div key={key}>
                        <p style={{ fontSize: 11, marginBottom: 4, color: ui.sub }}>{key}</p>
                        <Input
                          type="number"
                          min={0}
                          max={1}
                          step="0.01"
                          value={form.weights[key]}
                          onChange={(e) => setForm((p) => ({ ...p, weights: { ...p.weights, [key]: Number(e.target.value) } }))}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                  <Button variant="green" onClick={saveCompetition} style={{ flex: 1 }}>
                    {editingCompetitionId ? 'Update Competition' : 'Create Competition'}
                  </Button>
                  <Button variant="ghost" onClick={resetForm}>Reset</Button>
                </div>
              </div>
            </div>

            <div style={box}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <h3 style={{ margin: 0 }}>Competitions ({competitions.length})</h3>
                <Button variant="ghost" onClick={fetchCompetitions} style={{ padding: '8px 12px' }}>Refresh</Button>
              </div>
              <div className="cc-scroll" style={{ maxHeight: 650 }}>
                {competitions.length === 0 ? (
                  <EmptyState title="No competitions created yet" />
                ) : (
                  competitions.map((row) => (
                    <div
                      key={row.id}
                      style={{
                        background: selectedCompetition?.id === row.id ? '#7c3aed22' : ui.cardAlt,
                        border: `1px solid ${selectedCompetition?.id === row.id ? ui.purple : ui.border}`,
                        borderRadius: 12,
                        padding: 12,
                        marginBottom: 10,
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
                        <div style={{ minWidth: 0 }}>
                          <p style={{ margin: 0, fontWeight: 700 }}>{row.title}</p>
                          <p style={{ margin: '6px 0', color: ui.sub, fontSize: 13 }}>
                            {new Date(row.startDate).toLocaleString()} → {new Date(row.endDate).toLocaleString()}
                          </p>
                          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                            <Badge color={ui.cyan}>{row.competitionType || 'ProgrammingMCQ'}</Badge>
                            <Badge color={ui.purple}>Max/Clan: {row.maxTeamsPerClan ?? 2}</Badge>
                            <Badge color={row.status === 'Completed' ? ui.green : ui.orange}>{row.status || 'Upcoming'}</Badge>
                          </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                          <Button variant="blue" style={{ padding: '7px 10px', fontSize: 12 }} onClick={() => loadCompetitionMeta(row)}>Select</Button>
                          <Button
                            variant="green"
                            style={{ padding: '7px 10px', fontSize: 12 }}
                            onClick={async () => {
                              await loadCompetitionMeta(row);
                              setActiveTab('leaderboards');
                            }}
                          >
                            Rank List
                          </Button>
                          <Button
                            variant="purple"
                            style={{ padding: '7px 10px', fontSize: 12 }}
                            onClick={async () => {
                              await loadCompetitionMeta(row);
                              setActiveTab('questions');
                            }}
                          >
                            Questions
                          </Button>
                          <Button variant="ghost" style={{ padding: '7px 10px', fontSize: 12 }} onClick={() => beginEdit(row)}>Edit</Button>
                          <Button
                            variant="red"
                            style={{ padding: '7px 10px', fontSize: 12, opacity: row.status === 'Ongoing' || row.status === 'Completed' ? 0.55 : 1 }}
                            disabled={row.status === 'Ongoing' || row.status === 'Completed'}
                            title={row.status === 'Ongoing' || row.status === 'Completed' ? 'Ongoing/Completed competition cannot be deleted' : 'Delete competition'}
                            onClick={() => deleteCompetition(row.id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'suggestions' && (
          !selectedCompetition ? (
            <EmptyState title="Select a competition from Competitions tab to generate performance-based clan suggestions" />
          ) : (
            <div className="cc-grid-suggest" style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: 14 }}>
              <div style={box}>
                <h3 style={{ marginTop: 0, marginBottom: 12 }}>Suggestion Policy</h3>
                <div style={{ display: 'grid', gap: 8 }}>
                  <div>
                    <FieldLabel>Total Teams Allowed</FieldLabel>
                    <Input type="number" min={1} value={suggestionPolicy.totalTeamsAllowed} onChange={(e) => setSuggestionPolicy((p) => ({ ...p, totalTeamsAllowed: Number(e.target.value) }))} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                    <div>
                      <FieldLabel>Top Tier</FieldLabel>
                      <Input type="number" min={1} value={suggestionPolicy.topTierMaxTeams} onChange={(e) => setSuggestionPolicy((p) => ({ ...p, topTierMaxTeams: Number(e.target.value) }))} />
                    </div>
                    <div>
                      <FieldLabel>Mid Tier</FieldLabel>
                      <Input type="number" min={1} value={suggestionPolicy.midTierMaxTeams} onChange={(e) => setSuggestionPolicy((p) => ({ ...p, midTierMaxTeams: Number(e.target.value) }))} />
                    </div>
                    <div>
                      <FieldLabel>Low Tier</FieldLabel>
                      <Input type="number" min={1} value={suggestionPolicy.lowTierMaxTeams} onChange={(e) => setSuggestionPolicy((p) => ({ ...p, lowTierMaxTeams: Number(e.target.value) }))} />
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    <div>
                      <FieldLabel>Historical Weight</FieldLabel>
                      <Input type="number" min={0} max={2} step="0.01" value={suggestionPolicy.historicalPerformanceWeight} onChange={(e) => setSuggestionPolicy((p) => ({ ...p, historicalPerformanceWeight: Number(e.target.value) }))} />
                    </div>
                    <div>
                      <FieldLabel>Active Member Weight</FieldLabel>
                      <Input type="number" min={0} max={2} step="0.01" value={suggestionPolicy.activeMemberWeight} onChange={(e) => setSuggestionPolicy((p) => ({ ...p, activeMemberWeight: Number(e.target.value) }))} />
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 8 }}>
                    <Button variant="green" style={{ flex: 1 }} onClick={generateSuggestions}>Generate Suggestions</Button>
                    <Button variant="purple" style={{ flex: 1 }} onClick={applyOverrides}>Apply Overrides</Button>
                  </div>
                  <p style={{ margin: '4px 0 0', fontSize: 12, color: ui.sub }}>
                    Suggestions are generated by backend weighted policy and may assign 0 teams to lower-priority clans when limits are tight.
                  </p>
                </div>

                {suggestionSummary ? (
                  <div style={{ marginTop: 14, background: ui.cardAlt, border: `1px solid ${ui.border}`, borderRadius: 10, padding: 12 }}>
                    <p style={{ margin: 0, marginBottom: 6, color: ui.sub, fontSize: 13 }}>Suggestion Summary</p>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <Badge color={ui.cyan}>Allowed: {suggestionSummary.totalTeamsAllowed}</Badge>
                      <Badge color={ui.green}>Distributed: {suggestionSummary.totalTeamsDistributed}</Badge>
                      <Badge color={ui.orange}>Remaining: {suggestionSummary.remainingTeams}</Badge>
                    </div>
                  </div>
                ) : null}
              </div>

              <div style={box}>
                <h3 style={{ marginTop: 0, marginBottom: 12 }}>Performance-Based Clan Suggestions</h3>
                <DataTable
                  keyField="clanId"
                  columns={[
                    { key: 'clanRank', label: 'Rank' },
                    { key: 'clanName', label: 'Clan' },
                    { key: 'historicalPerformanceScore', label: 'History Score', align: 'right', render: (v) => Number(v || 0).toFixed(2) },
                    { key: 'activeMembers', label: 'Active', align: 'right' },
                    { key: 'suggestedTeamCount', label: 'Suggested', align: 'right' },
                    {
                      key: 'override',
                      label: 'Override Teams',
                      render: (_, row) => (
                        <Input
                          type="number"
                          min={0}
                          max={selectedCompetition?.maxTeamsPerClan ?? 2}
                          value={overrideCounts[row.clanId] ?? row.suggestedTeamCount}
                          onChange={(e) => setOverrideCounts((p) => ({ ...p, [row.clanId]: Number(e.target.value) }))}
                          style={{ width: 90, padding: '6px 8px' }}
                        />
                      ),
                    },
                    { key: 'suggestionReason', label: 'Reason' },
                  ]}
                  rows={suggestions}
                />
              </div>
            </div>
          )
        )}

        {activeTab === 'questions' && (
          !selectedCompetition ? (
            <EmptyState title="Select a competition to add and manage questions" />
          ) : (
            <div className="cc-grid-questions" style={{ display: 'grid', gridTemplateColumns: '430px 1fr', gap: 14 }}>
              <div style={box}>
                <h3 style={{ marginTop: 0, marginBottom: 12 }}>Add Question</h3>
                <div style={{ display: 'grid', gap: 10 }}>
                  <div>
                    <FieldLabel>Question Text</FieldLabel>
                    <Textarea
                      value={questionForm.questionText}
                      onChange={(e) => setQuestionForm((p) => ({ ...p, questionText: e.target.value }))}
                      placeholder="Write question text"
                    />
                  </div>

                  <div style={{ display: 'grid', gap: 8 }}>
                    <div>
                      <FieldLabel>Option A</FieldLabel>
                      <Input value={questionForm.optionA} onChange={(e) => setQuestionForm((p) => ({ ...p, optionA: e.target.value }))} placeholder="Option A" />
                    </div>
                    <div>
                      <FieldLabel>Option B</FieldLabel>
                      <Input value={questionForm.optionB} onChange={(e) => setQuestionForm((p) => ({ ...p, optionB: e.target.value }))} placeholder="Option B" />
                    </div>
                    <div>
                      <FieldLabel>Option C</FieldLabel>
                      <Input value={questionForm.optionC} onChange={(e) => setQuestionForm((p) => ({ ...p, optionC: e.target.value }))} placeholder="Option C" />
                    </div>
                    <div>
                      <FieldLabel>Option D</FieldLabel>
                      <Input value={questionForm.optionD} onChange={(e) => setQuestionForm((p) => ({ ...p, optionD: e.target.value }))} placeholder="Option D" />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    <div>
                      <FieldLabel>Correct Answer</FieldLabel>
                      <Select value={questionForm.correctAnswer} onChange={(e) => setQuestionForm((p) => ({ ...p, correctAnswer: e.target.value }))}>
                        <option value="A">A</option>
                        <option value="B">B</option>
                        <option value="C">C</option>
                        <option value="D">D</option>
                      </Select>
                    </div>
                    <div>
                      <FieldLabel>Points</FieldLabel>
                      <Input
                        type="number"
                        min={1}
                        max={100}
                        value={questionForm.points}
                        onChange={(e) => setQuestionForm((p) => ({ ...p, points: Number(e.target.value) }))}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 8 }}>
                    <Button variant="green" style={{ flex: 1 }} onClick={addQuestion}>Add Question</Button>
                    <Button variant="ghost" onClick={() => setQuestionForm(defaultQuestionForm)}>Reset</Button>
                  </div>
                </div>
              </div>

              <div style={box}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <h3 style={{ margin: 0 }}>Questions ({questions.length})</h3>
                  <Button variant="ghost" onClick={loadQuestions} style={{ padding: '8px 12px' }}>Refresh</Button>
                </div>

                <DataTable
                  keyField="id"
                  columns={[
                    { key: 'questionOrder', label: 'Order', align: 'right' },
                    { key: 'questionText', label: 'Question', render: (v) => <span style={{ color: ui.text }}>{v}</span> },
                    {
                      key: 'options',
                      label: 'Options',
                      render: (_, row) => (
                        <div style={{ display: 'grid', gap: 2, color: ui.sub, fontSize: 12 }}>
                          <span>A: {row.optionA}</span>
                          <span>B: {row.optionB}</span>
                          <span>C: {row.optionC}</span>
                          <span>D: {row.optionD}</span>
                        </div>
                      ),
                    },
                    { key: 'correctAnswer', label: 'Correct', align: 'center', render: (v) => <Badge color={ui.green}>{v}</Badge> },
                    { key: 'points', label: 'Points', align: 'right' },
                    {
                      key: 'actions',
                      label: 'Actions',
                      render: (_, row) => (
                        <Button variant="red" style={{ padding: '6px 8px', fontSize: 12 }} onClick={() => deleteQuestion(row.id)}>
                          Delete
                        </Button>
                      ),
                    },
                  ]}
                  rows={questions}
                />
              </div>
            </div>
          )
        )}

        {activeTab === 'leaderboards' && (
          !selectedCompetition ? (
            <EmptyState title="Select a competition to view separate team and clan leaderboard" />
          ) : (
            <div className="cc-grid-leaderboard" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div style={box}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                  <h3 style={{ margin: 0 }}>Team Leaderboard</h3>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <Button variant="ghost" style={{ padding: '6px 10px' }} onClick={loadLeaderboards}>Reload</Button>
                    <Button variant="ghost" style={{ padding: '6px 10px' }} onClick={() => exportCsv(teamLeaderboard, 'team-leaderboard')}>CSV</Button>
                  </div>
                </div>
                <DataTable
                  keyField="teamId"
                  columns={[
                    { key: 'rankNo', label: 'Rank', render: (v) => <Badge color={ui.orange}>#{v}</Badge> },
                    { key: 'teamName', label: 'Team' },
                    { key: 'clanName', label: 'Clan' },
                    { key: 'totalScore', label: 'Score', align: 'right' },
                    { key: 'rankNo', label: 'EXP Reward', align: 'right', render: (v) => `${getAdminClanExpByRank(v)} EXP` },
                    { key: 'penaltySeconds', label: 'Time/Penalty', align: 'right', render: (v) => `${Math.floor((Number(v || 0)) / 60)}m` },
                  ]}
                  rows={teamLeaderboard}
                />
              </div>

              <div style={box}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                  <h3 style={{ margin: 0 }}>Clan Leaderboard</h3>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <Button variant="ghost" style={{ padding: '6px 10px' }} onClick={() => exportCsv(clanLeaderboard, 'clan-leaderboard')}>CSV</Button>
                    <Button variant="orange" style={{ padding: '6px 10px' }} onClick={finalizeCompetition}>Finalize</Button>
                  </div>
                </div>
                <div style={{ marginBottom: 12, background: ui.cardAlt, border: `1px solid ${ui.borderSoft}`, borderRadius: 10, padding: 10 }}>
                  <p style={{ margin: 0, marginBottom: 8, color: ui.sub, fontSize: 12 }}>
                    Finalize EXP Distribution (per team rank)
                  </p>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {(expDistribution?.length ? expDistribution : defaultAdminClanExpDistribution).map((row) => (
                      <Badge key={`${row.rankRange}-${row.exp}`} color={ui.cyan}>
                        Rank {row.rankRange}: {row.exp} EXP
                      </Badge>
                    ))}
                  </div>
                </div>
                <DataTable
                  keyField="clanId"
                  columns={[
                    { key: 'rankNo', label: 'Rank', render: (v) => <Badge color={ui.orange}>#{v}</Badge> },
                    { key: 'clanName', label: 'Clan' },
                    { key: 'totalScore', label: 'Score', align: 'right' },
                    { key: 'teamCount', label: 'Teams', align: 'right' },
                  ]}
                  rows={clanLeaderboard}
                />
              </div>
            </div>
          )
        )}

        {activeTab === 'teams' && (
          !selectedCompetition ? (
            <EmptyState title="Select a competition to manage clan team approvals" />
          ) : (
            <div style={box}>
              <h3 style={{ marginTop: 0, marginBottom: 12 }}>Clan Team Registrations</h3>
              <DataTable
                keyField="teamId"
                columns={[
                  { key: 'teamName', label: 'Team' },
                  { key: 'clanName', label: 'Clan' },
                  { key: 'memberCount', label: 'Members', align: 'right' },
                  {
                    key: 'hasParticipated',
                    label: 'Participated',
                    render: (v) => <Badge color={v ? ui.green : ui.orange}>{v ? 'Yes' : 'No'}</Badge>
                  },
                  {
                    key: 'totalScore',
                    label: 'Points',
                    align: 'right',
                    render: (v) => <span style={{ fontWeight: 700 }}>{Number(v || 0)}</span>
                  },
                  { key: 'status', label: 'Status', render: (v) => <Badge color={v === 'Approved' ? ui.green : v === 'Rejected' ? ui.red : ui.orange}>{v}</Badge> },
                  {
                    key: 'actions',
                    label: 'Actions',
                    render: (_, row) => row.status === 'Pending' ? (
                      <div style={{ display: 'flex', gap: 6 }}>
                        <Button variant="green" style={{ padding: '6px 8px', fontSize: 12 }} onClick={() => approveTeam(row.teamId, 'Approved')}>Approve</Button>
                        <Button variant="red" style={{ padding: '6px 8px', fontSize: 12 }} onClick={() => approveTeam(row.teamId, 'Rejected')}>Reject</Button>
                      </div>
                    ) : '—',
                  },
                ]}
                rows={teams}
              />
            </div>
          )
        )}

        {activeTab === 'submissions' && (
          !selectedCompetition ? (
            <EmptyState title="Select a competition to inspect team scores and submission status" />
          ) : (
            <div style={box}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
                <h3 style={{ margin: 0 }}>Team Scores & Submissions</h3>
                <div style={{ display: 'flex', gap: 6 }}>
                  <Badge color={ui.green}>{submissions.filter((x) => x.hasSubmitted).length} Submitted</Badge>
                  <Badge color={ui.orange}>{submissions.filter((x) => !x.hasSubmitted).length} Pending</Badge>
                </div>
              </div>
              <DataTable
                keyField="teamId"
                columns={[
                  { key: 'teamName', label: 'Team' },
                  { key: 'clanName', label: 'Clan' },
                  { key: 'hasSubmitted', label: 'Status', render: (v) => <Badge color={v ? ui.green : ui.orange}>{v ? 'Submitted' : 'Pending'}</Badge> },
                  { key: 'totalScore', label: 'Score', align: 'right' },
                  { key: 'timeTakenSeconds', label: 'Time', align: 'right', render: (v) => (v ? `${Math.floor(v / 60)}m ${v % 60}s` : '—') },
                ]}
                rows={submissions}
              />
            </div>
          )
        )}

        {activeTab === 'performance' && (
          <div className="cc-grid-performance" style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: 14 }}>
            <div style={box}>
              <h3 style={{ marginTop: 0, marginBottom: 12 }}>Competition Type Performance</h3>
              <div style={{ display: 'grid', gap: 10 }}>
                <div>
                  <FieldLabel>Competition Type</FieldLabel>
                  <Select value={selectedType} onChange={(e) => setSelectedType(e.target.value)}>
                    {competitionTypeOptions.map((type) => <option key={type} value={type}>{type}</option>)}
                  </Select>
                </div>
                <Button variant="blue" onClick={loadTypePerformance}>
                  {typePerformanceLoading ? 'Loading...' : 'Load Clan Performance'}
                </Button>
              </div>

              <div style={{ marginTop: 16 }}>
                <p style={{ margin: 0, marginBottom: 8, color: ui.sub, fontWeight: 700 }}>Global Clan Ranking Snapshot</p>
                <DataTable
                  keyField="clanId"
                  columns={[
                    { key: 'rankNo', label: 'Rank' },
                    { key: 'clanName', label: 'Clan' },
                    { key: 'totalScore', label: 'Score', align: 'right' },
                  ]}
                  rows={globalClanRanking.slice(0, 10)}
                />
              </div>
            </div>

            <div style={box}>
              <h3 style={{ marginTop: 0, marginBottom: 12 }}>{selectedType} Clan Performance</h3>
              <DataTable
                keyField="clanId"
                columns={[
                  { key: 'clanName', label: 'Clan' },
                  { key: 'competitionsPlayed', label: 'Played', align: 'right' },
                  { key: 'averageClanRank', label: 'Avg Rank', align: 'right' },
                  { key: 'bestClanRank', label: 'Best Rank', align: 'right' },
                  { key: 'totalScore', label: 'Total Score', align: 'right', render: (v) => Number(v || 0).toFixed(2) },
                  { key: 'averageScore', label: 'Avg Score', align: 'right', render: (v) => Number(v || 0).toFixed(2) },
                ]}
                rows={typePerformance}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClanCompetitionAdmin;
