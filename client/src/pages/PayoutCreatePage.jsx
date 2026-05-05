import { yupResolver } from '@hookform/resolvers/yup';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import * as yup from 'yup';
import { fetchVendors } from '../api/vendorApi.js';
import { createPayoutRequest } from '../api/payoutApi.js';
import { getErrorMessage } from '../api/http.js';
import { AppLayout } from '../components/AppLayout.jsx';
import { LoadingState } from '../components/LoadingState.jsx';

const schema = yup
  .object({
    vendor_id: yup.string().required('Vendor is required'),
    amount: yup
      .number()
      .typeError('Amount must be a number')
      .positive('Amount must be greater than 0')
      .required('Amount is required'),
    mode: yup.string().oneOf(['UPI', 'IMPS', 'NEFT']).required('Mode is required'),
    note: yup.string().trim().default(''),
  })
  .required();

export function PayoutCreatePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const vendorsQuery = useQuery({ queryKey: ['vendors'], queryFn: fetchVendors });
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { vendor_id: '', amount: '', mode: 'UPI', note: '' },
  });

  const mutation = useMutation({
    mutationFn: (payload) => createPayoutRequest(payload),
    onSuccess: (payout) => {
      toast.success('Payout created');
      queryClient.invalidateQueries({ queryKey: ['payouts'] });
      navigate(`/payouts/${payout._id}`);
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  return (
    <AppLayout title="Create payout">
      {vendorsQuery.isLoading ? <LoadingState /> : null}
      <form
        className="card stack"
        onSubmit={handleSubmit((values) =>
          mutation.mutate({
            vendor_id: values.vendor_id,
            amount: Number(values.amount),
            mode: values.mode,
            note: values.note || '',
          })
        )}
        noValidate
      >
        <div className="field">
          <label htmlFor="vendor_id">Vendor</label>
          <select id="vendor_id" {...register('vendor_id')}>
            <option value="">Select vendor</option>
            {vendorsQuery.data?.map((v) => (
              <option key={v._id} value={v._id}>
                {v.name}
              </option>
            ))}
          </select>
          {errors.vendor_id ? (
            <span className="error-text">{errors.vendor_id.message}</span>
          ) : null}
        </div>
        <div className="field">
          <label htmlFor="amount">Amount</label>
          <input id="amount" type="number" step="0.01" {...register('amount')} />
          {errors.amount ? <span className="error-text">{errors.amount.message}</span> : null}
        </div>
        <div className="field">
          <label htmlFor="mode">Mode</label>
          <select id="mode" {...register('mode')}>
            <option value="UPI">UPI</option>
            <option value="IMPS">IMPS</option>
            <option value="NEFT">NEFT</option>
          </select>
          {errors.mode ? <span className="error-text">{errors.mode.message}</span> : null}
        </div>
        <div className="field">
          <label htmlFor="note">Note (optional)</label>
          <textarea id="note" rows={3} {...register('note')} />
        </div>
        <button className="btn" type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? 'Creating…' : 'Create draft'}
        </button>
      </form>
    </AppLayout>
  );
}
