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
      <p>
        <Link to="/payouts">← Back to payouts</Link>
      </p>
      {detailQuery.isLoading ? <LoadingState /> : null}
      {detailQuery.isError ? (
        <p className="error-text">{getErrorMessage(detailQuery.error)}</p>
      ) : null}
      {payout ? (
        <>
          <div className="card stack">
            <div className="row">
              <span className={badgeClass(payout.status)}>{payout.status}</span>
              <span className="muted">#{payout._id}</span>
            </div>
            <p>
              <strong>Vendor:</strong> {payout.vendor?.name || '—'}
            </p>
            <p>
              <strong>Amount:</strong> {payout.amount}
            </p>
            <p>
              <strong>Mode:</strong> {payout.mode}
            </p>
            <p>
              <strong>Note:</strong> {payout.note || '—'}
            </p>
            {payout.status === 'Rejected' ? (
              <p>
                <strong>Decision reason:</strong> {payout.decision_reason || '—'}
              </p>
            ) : null}
            <p className="muted">
              Created: {payout.createdAt ? new Date(payout.createdAt).toLocaleString() : '—'}
            </p>
          </div>

          <div className="card stack">
            <h2 style={{ marginTop: 0 }}>Actions</h2>
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
                {approveMutation.isPending ? 'Approving…' : 'Approve'}
              </button>
            ) : null}
            {canReject ? (
              <form
                className="stack"
                onSubmit={handleSubmit((values) => rejectMutation.mutate(values))}
                noValidate
              >
                <div className="field">
                  <label htmlFor="reason">Rejection reason</label>
                  <textarea id="reason" rows={3} {...register('reason')} />
                  {errors.reason ? (
                    <span className="error-text">{errors.reason.message}</span>
                  ) : null}
                </div>
                <button type="submit" className="btn danger" disabled={rejectMutation.isPending}>
                  {rejectMutation.isPending ? 'Rejecting…' : 'Reject'}
                </button>
              </form>
            ) : null}
            {!canSubmit && !canApprove && !canReject ? (
              <p className="muted">No actions available for your role or this status.</p>
            ) : null}
          </div>

          <div className="card">
            <h2 style={{ marginTop: 0 }}>Audit trail</h2>
            {auditTrail.length === 0 ? <p className="muted">No audit entries.</p> : null}
            <ul style={{ paddingLeft: '1.1rem' }}>
              {auditTrail.map((entry) => (
                <li key={entry.id} style={{ marginBottom: '0.65rem' }}>
                  <strong>{entry.action}</strong> ·{' '}
                  {entry.performed_by?.email || entry.performed_by?.id || '—'} (
                  {entry.performed_by?.role}) ·{' '}
                  {entry.performed_at
                    ? new Date(entry.performed_at).toLocaleString()
                    : '—'}
                </li>
              ))}
            </ul>
          </div>
        </>
      ) : null}
    </AppLayout>
  );
}
