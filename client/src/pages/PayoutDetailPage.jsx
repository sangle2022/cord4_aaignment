import { yupResolver } from '@hookform/resolvers/yup';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import * as yup from 'yup';
import {
  approvePayoutRequest,
  fetchPayoutDetail,
  rejectPayoutRequest,
  submitPayoutRequest,
} from '../api/payoutApi.js';
import { getErrorMessage } from '../api/http.js';
import { useAuth } from '../context/AuthContext.jsx';
import { AppLayout } from '../components/AppLayout.jsx';
import { LoadingState } from '../components/LoadingState.jsx';
import { formatCurrency } from '../utils/format.js';

const rejectSchema = yup
  .object({
    reason: yup.string().trim().required('Reason is required'),
  })
  .required();

function badgeClass(status) {
  const key = status?.toLowerCase() || '';
  return `badge ${key}`;
}

export function PayoutDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const detailQuery = useQuery({
    queryKey: ['payout', id],
    queryFn: () => fetchPayoutDetail(id),
    enabled: Boolean(id),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(rejectSchema),
    defaultValues: { reason: '' },
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['payout', id] });
    queryClient.invalidateQueries({ queryKey: ['payouts'] });
  };

  const submitMutation = useMutation({
    mutationFn: () => submitPayoutRequest(id),
    onSuccess: () => {
      toast.success('Payout submitted');
      invalidate();
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const approveMutation = useMutation({
    mutationFn: () => approvePayoutRequest(id),
    onSuccess: () => {
      toast.success('Payout approved');
      invalidate();
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const rejectMutation = useMutation({
    mutationFn: ({ reason }) => rejectPayoutRequest(id, reason),
    onSuccess: () => {
      toast.success('Payout rejected');
      reset({ reason: '' });
      invalidate();
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const payout = detailQuery.data?.payout;
  const auditTrail = detailQuery.data?.auditTrail ?? [];

  const canSubmit = user?.role === 'OPS' && payout?.status === 'Draft';
  const canApprove = user?.role === 'FINANCE' && payout?.status === 'Submitted';
  const canReject = user?.role === 'FINANCE' && payout?.status === 'Submitted';

  return (
    <AppLayout title="Payout detail">
      <Link to="/payouts" className="link-arrow muted" style={{ marginBottom: '1rem', display: 'inline-flex' }}>
        ← Back to payouts
      </Link>
      {detailQuery.isLoading ? <LoadingState /> : null}
      {detailQuery.isError ? (
        <p className="error-text">{getErrorMessage(detailQuery.error)}</p>
      ) : null}
      {payout ? (
        <>
          <div className="card card--elevated">
            <div className="row" style={{ justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <span className={badgeClass(payout.status)}>{payout.status}</span>
              <code className="muted" style={{ fontSize: '0.75rem', wordBreak: 'break-all' }}>
                {payout._id}
              </code>
            </div>
            <dl className="dl-grid">
              <dt>Vendor</dt>
              <dd>{payout.vendor?.name || '—'}</dd>
              <dt>Amount</dt>
              <dd style={{ fontSize: '1.15rem', fontWeight: 700 }}>{formatCurrency(payout.amount)}</dd>
              <dt>Mode</dt>
              <dd>{payout.mode}</dd>
              <dt>Note</dt>
              <dd>{payout.note || '—'}</dd>
              {payout.status === 'Rejected' ? (
                <>
                  <dt>Decision</dt>
                  <dd>{payout.decision_reason || '—'}</dd>
                </>
              ) : null}
              <dt>Created</dt>
              <dd className="muted">
                {payout.createdAt ? new Date(payout.createdAt).toLocaleString() : '—'}
              </dd>
            </dl>
          </div>

          <div className="card card--elevated">
            <h2 className="card-title">Actions</h2>
            <div className="actions-stack">
              {canSubmit ? (
                <button
                  type="button"
                  className="btn"
                  disabled={submitMutation.isPending}
                  onClick={() => submitMutation.mutate()}
                >
                  {submitMutation.isPending ? 'Submitting…' : 'Submit for approval'}
                </button>
              ) : null}
              {canApprove ? (
                <button
                  type="button"
                  className="btn"
                  disabled={approveMutation.isPending}
                  onClick={() => approveMutation.mutate()}
                >
                  {approveMutation.isPending ? 'Approving…' : 'Approve payout'}
                </button>
              ) : null}
            </div>
            {canReject ? (
              <form
                className="stack stack--loose stack-separated"
                onSubmit={handleSubmit((values) => rejectMutation.mutate(values))}
                noValidate
              >
                <div className="field">
                  <label htmlFor="reason">Rejection reason (required)</label>
                  <textarea id="reason" rows={3} placeholder="Explain why Finance is rejecting" {...register('reason')} />
                  {errors.reason ? (
                    <span className="error-text">{errors.reason.message}</span>
                  ) : null}
                </div>
                <button type="submit" className="btn danger" disabled={rejectMutation.isPending}>
                  {rejectMutation.isPending ? 'Rejecting…' : 'Reject payout'}
                </button>
              </form>
            ) : null}
            {!canSubmit && !canApprove && !canReject ? (
              <p className="muted" style={{ marginBottom: 0 }}>
                No actions available for your role at this stage.
              </p>
            ) : null}
          </div>

          <div className="card card--elevated">
            <h2 className="card-title">Audit trail</h2>
            {auditTrail.length === 0 ? (
              <p className="muted">No audit entries recorded.</p>
            ) : (
              <ul className="timeline">
                {auditTrail.map((entry) => (
                  <li key={entry.id}>
                    <div className="timeline__action">{entry.action}</div>
                    <div className="timeline__meta">
                      <strong>{entry.performed_by?.email || '—'}</strong>
                      {entry.performed_by?.role ? ` · ${entry.performed_by.role}` : ''}
                      {' · '}
                      {entry.performed_at ? new Date(entry.performed_at).toLocaleString() : '—'}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      ) : null}
    </AppLayout>
  );
}
