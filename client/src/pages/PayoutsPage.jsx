import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { fetchPayouts } from '../api/payoutApi.js';
import { fetchVendors } from '../api/vendorApi.js';
import { getErrorMessage } from '../api/http.js';
import { AppLayout } from '../components/AppLayout.jsx';
import { EmptyState } from '../components/EmptyState.jsx';
import { LoadingState } from '../components/LoadingState.jsx';
import { formatCurrency } from '../utils/format.js';

const statuses = ['', 'Draft', 'Submitted', 'Approved', 'Rejected'];

function badgeClass(status) {
  const key = status?.toLowerCase() || '';
  return `badge ${key}`;
}

export function PayoutsPage() {
  const [status, setStatus] = useState('');
  const [vendorId, setVendorId] = useState('');
  const vendorsQuery = useQuery({ queryKey: ['vendors'], queryFn: fetchVendors });
  const params = useMemo(() => {
    const p = {};
    if (status) {
      p.status = status;
    }
    if (vendorId) {
      p.vendor_id = vendorId;
    }
    return p;
  }, [status, vendorId]);

  const payoutsQuery = useQuery({
    queryKey: ['payouts', params],
    queryFn: () => fetchPayouts(params),
  });

  const payouts = payoutsQuery.data;
  const isEmpty = payouts && payouts.length === 0;

  return (
    <AppLayout
      title="Payouts"
      description="Filter by status or vendor, then open a row to review details and take action."
    >
      <div className="card card--elevated">
        <h2 className="card-title">Filters</h2>
        <div className="filters-bar">
          <div className="field">
            <label htmlFor="filter-status">Status</label>
            <select
              id="filter-status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              {statuses.map((s) => (
                <option key={s || 'all'} value={s}>
                  {s || 'All statuses'}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="filter-vendor">Vendor</label>
            <select
              id="filter-vendor"
              value={vendorId}
              onChange={(e) => setVendorId(e.target.value)}
            >
              <option value="">All vendors</option>
              {vendorsQuery.data?.map((v) => (
                <option key={v._id} value={v._id}>
                  {v.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="card card--elevated">
        <h2 className="card-title">All payouts</h2>
        {payoutsQuery.isLoading ? <LoadingState /> : null}
        {payoutsQuery.isError ? (
          <p className="error-text">{getErrorMessage(payoutsQuery.error)}</p>
        ) : null}
        {isEmpty ? (
          <EmptyState
            title="No payouts match your filters"
            hint="Create a vendor first, then add a payout as OPS."
          />
        ) : null}
        {payouts && payouts.length > 0 ? (
          <div className="data-table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Vendor</th>
                  <th>Amount</th>
                  <th>Mode</th>
                  <th>Status</th>
                  <th>Updated</th>
                  <th aria-label="Actions" />
                </tr>
              </thead>
              <tbody>
                {payouts.map((p) => (
                  <tr key={p._id}>
                    <td>
                      <strong>{p.vendor?.name || '—'}</strong>
                    </td>
                    <td className="num">{formatCurrency(p.amount)}</td>
                    <td>
                      <span className="badge badge--plain">{p.mode}</span>
                    </td>
                    <td>
                      <span className={badgeClass(p.status)}>{p.status}</span>
                    </td>
                    <td className="muted" style={{ fontSize: '0.85rem' }}>
                      {p.updatedAt ? new Date(p.updatedAt).toLocaleString() : '—'}
                    </td>
                    <td>
                      <Link to={`/payouts/${p._id}`} className="btn-ghost">
                        View →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </div>
    </AppLayout>
  );
}
