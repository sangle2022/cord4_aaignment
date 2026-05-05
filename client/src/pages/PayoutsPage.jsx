import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { fetchPayouts } from '../api/payoutApi.js';
import { fetchVendors } from '../api/vendorApi.js';
import { getErrorMessage } from '../api/http.js';
import { AppLayout } from '../components/AppLayout.jsx';
import { LoadingState } from '../components/LoadingState.jsx';

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

  return (
    <AppLayout title="Payouts">
      <div className="card row" style={{ alignItems: 'flex-end' }}>
        <div className="field">
          <label htmlFor="filter-status">Status</label>
          <select
            id="filter-status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            {statuses.map((s) => (
              <option key={s || 'all'} value={s}>
                {s || 'All'}
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

      <div className="card">
        {payoutsQuery.isLoading ? <LoadingState /> : null}
        {payoutsQuery.isError ? (
          <p className="error-text">{getErrorMessage(payoutsQuery.error)}</p>
        ) : null}
        {payoutsQuery.data ? (
          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th>Vendor</th>
                  <th>Amount</th>
                  <th>Mode</th>
                  <th>Status</th>
                  <th>Updated</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {payoutsQuery.data.map((p) => (
                  <tr key={p._id}>
                    <td>{p.vendor?.name || '—'}</td>
                    <td>{p.amount}</td>
                    <td>{p.mode}</td>
                    <td>
                      <span className={badgeClass(p.status)}>{p.status}</span>
                    </td>
                    <td>{p.updatedAt ? new Date(p.updatedAt).toLocaleString() : '—'}</td>
                    <td>
                      <Link to={`/payouts/${p._id}`}>View</Link>
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
