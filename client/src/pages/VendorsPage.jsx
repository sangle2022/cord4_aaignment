import { yupResolver } from '@hookform/resolvers/yup';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import * as yup from 'yup';
import { createVendorRequest, fetchVendors } from '../api/vendorApi.js';
import { getErrorMessage } from '../api/http.js';
import { AppLayout } from '../components/AppLayout.jsx';
import { EmptyState } from '../components/EmptyState.jsx';
import { LoadingState } from '../components/LoadingState.jsx';

const vendorSchema = yup
  .object({
    name: yup.string().trim().required('Name is required'),
    upi_id: yup.string().trim().default(''),
    bank_account: yup.string().trim().default(''),
    ifsc: yup.string().trim().default(''),
    is_active: yup.boolean().default(true),
  })
  .required();

export function VendorsPage() {
  const queryClient = useQueryClient();
  const vendorsQuery = useQuery({ queryKey: ['vendors'], queryFn: fetchVendors });
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(vendorSchema),
    defaultValues: {
      name: '',
      upi_id: '',
      bank_account: '',
      ifsc: '',
      is_active: true,
    },
  });

  const createMutation = useMutation({
    mutationFn: (payload) => createVendorRequest(payload),
    onSuccess: () => {
      toast.success('Vendor created');
      reset({ name: '', upi_id: '', bank_account: '', ifsc: '', is_active: true });
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const rows = vendorsQuery.data;
  const isEmpty = rows && rows.length === 0;

  return (
    <AppLayout
      title="Vendors"
      description="Register payees here before OPS creates payouts against them."
    >
      <div className="layout-split layout-split--vendor">
        <div className="card card--elevated">
          <h2 className="card-title">Add vendor</h2>
          <form
            className="stack stack--loose"
            onSubmit={handleSubmit((values) => createMutation.mutate(values))}
            noValidate
          >
            <div className="field">
              <label htmlFor="name">Name</label>
              <input id="name" placeholder="Legal or display name" {...register('name')} />
              {errors.name ? <span className="error-text">{errors.name.message}</span> : null}
            </div>
            <div className="field">
              <label htmlFor="upi_id">UPI ID (optional)</label>
              <input id="upi_id" placeholder="name@bank" {...register('upi_id')} />
            </div>
            <div className="field">
              <label htmlFor="bank_account">Bank account (optional)</label>
              <input id="bank_account" {...register('bank_account')} />
            </div>
            <div className="field">
              <label htmlFor="ifsc">IFSC (optional)</label>
              <input id="ifsc" placeholder="e.g. SBIN0001234" {...register('ifsc')} />
            </div>
            <label className="field-checkbox">
              <input type="checkbox" {...register('is_active')} /> Active for payouts
            </label>
            <button className="btn btn--block" type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Saving…' : 'Create vendor'}
            </button>
          </form>
        </div>

        <div className="card card--elevated">
          <h2 className="card-title">Directory</h2>
          {vendorsQuery.isLoading ? <LoadingState /> : null}
          {vendorsQuery.isError ? (
            <p className="error-text">{getErrorMessage(vendorsQuery.error)}</p>
          ) : null}
          {isEmpty ? (
            <EmptyState title="No vendors yet" hint="Add your first vendor using the form." />
          ) : null}
          {rows && rows.length > 0 ? (
            <div className="data-table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>UPI</th>
                    <th>Bank</th>
                    <th>IFSC</th>
                    <th>Active</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((v) => (
                    <tr key={v._id}>
                      <td>
                        <strong>{v.name}</strong>
                      </td>
                      <td>{v.upi_id || '—'}</td>
                      <td>{v.bank_account || '—'}</td>
                      <td>{v.ifsc || '—'}</td>
                      <td>
                        {v.is_active ? (
                          <span className="badge approved">Yes</span>
                        ) : (
                          <span className="badge rejected">No</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </div>
      </div>
    </AppLayout>
  );
}
