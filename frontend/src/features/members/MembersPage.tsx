import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Award, DollarSign, Search, Users } from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';
import { createPortal } from 'react-dom';
import { ApiError, requestJson } from '../../shared/api/http';
import type {
  MemberItem,
  MembershipItem,
  MembershipsListResponse,
  MembershipStatus,
  MemberStatus,
  PaginatedResponse,
  PaymentsListResponse,
  PlanItem,
  SingleResponse,
} from '../../shared/api/types';
import { KpiCard } from '../../shared/components/KpiCard';
import { useToast } from '../../shared/components/ToastContext';
import {
  getMemberInitials,
  getMembershipStatusLabel,
  getMemberStatusLabel,
} from '../../shared/utils/format';
import { PaymentsTable } from '../billing/PaymentsTable';
import { RegisterPaymentModal } from '../billing/RegisterPaymentModal';

type TabKey = 'memberships' | 'members' | 'payments';

const STATUS_BADGE_CLASS: Record<MembershipStatus, string> = {
  active: 'bg-[#eef8d6] text-[#22251f] border-[#d3f36b]',
  paused: 'bg-[#f4f5f0] text-[#686b63] border-[#e2e4dc]',
  expired: 'bg-[#ffe8e3] text-[#9b2c1a] border-[#ffcabf]',
  cancelled: 'bg-[#f4f5f0] text-[#9c9e96] border-[#e2e4dc]',
};

export function MembersPage() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<TabKey>('memberships');
  const [search, setSearch] = useState('');
  const [membershipFilter, setMembershipFilter] = useState<string>('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>('');
  const [page, setPage] = useState(1);

  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [membershipModalOpen, setMembershipModalOpen] = useState(false);
  const [memberModalOpen, setMemberModalOpen] = useState(false);

  const [mshipMemberName, setMshipMemberName] = useState('');
  const [mshipPlanId, setMshipPlanId] = useState('2');
  const [mshipStartsAt, setMshipStartsAt] = useState(() => new Date().toISOString().slice(0, 10));
  const [mshipError, setMshipError] = useState('');

  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberPhone, setNewMemberPhone] = useState('');
  const [newMemberError, setNewMemberError] = useState('');

  const membershipsQuery = useQuery({
    queryKey: ['memberships', { page, search, membershipFilter }],
    queryFn: () => {
      const params = new URLSearchParams({ page: String(page), per_page: '12' });
      if (search.trim() !== '') params.set('search', search.trim());
      if (membershipFilter !== '') params.set('status', membershipFilter);
      return requestJson<MembershipsListResponse>(`/memberships?${params.toString()}`);
    },
    retry: false,
  });

  const membersQuery = useQuery({
    queryKey: ['members', { page, search }],
    queryFn: () => {
      const params = new URLSearchParams({ page: String(page), per_page: '12' });
      if (search.trim() !== '') params.set('search', search.trim());
      return requestJson<PaginatedResponse<MemberItem>>(`/members?${params.toString()}`);
    },
    enabled: activeTab === 'members',
    retry: false,
  });

  const paymentsQuery = useQuery({
    queryKey: ['payments', { page, search, paymentStatusFilter }],
    queryFn: () => {
      const params = new URLSearchParams({ page: String(page), per_page: '12' });
      if (search.trim() !== '') params.set('search', search.trim());
      if (paymentStatusFilter !== '') params.set('status', paymentStatusFilter);
      return requestJson<PaymentsListResponse>(`/payments?${params.toString()}`);
    },
    retry: false,
  });

  const plansQuery = useQuery({
    queryKey: ['plans', 'membership-select'],
    queryFn: () => requestJson<PaginatedResponse<PlanItem>>('/plans?per_page=50&active_only=1'),
    enabled: membershipModalOpen,
    retry: false,
  });

  useEffect(() => {
    const firstPlan = plansQuery.data?.data?.[1] ?? plansQuery.data?.data?.[0];
    if (firstPlan && membershipModalOpen) {
      setMshipPlanId(String(firstPlan.id));
    }
  }, [plansQuery.data, membershipModalOpen]);

  const invalidateAll = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['memberships'] }),
      queryClient.invalidateQueries({ queryKey: ['members'] }),
      queryClient.invalidateQueries({ queryKey: ['payments'] }),
      queryClient.invalidateQueries({ queryKey: ['dashboard'] }),
    ]);
  };

  const createMembershipMutation = useMutation({
    mutationFn: () =>
      requestJson<SingleResponse<MembershipItem>>('/memberships', {
        method: 'POST',
        body: JSON.stringify({
          member_name: mshipMemberName.trim(),
          plan_id: Number(mshipPlanId),
          starts_at: mshipStartsAt,
        }),
      }),
    onSuccess: async (res) => {
      await invalidateAll();
      showToast(`Membresía asignada a ${res.data.member_name} hasta ${res.data.ends_at}.`);
      setMshipMemberName('');
      setMshipError('');
      setMembershipModalOpen(false);
    },
    onError: (err) => {
      setMshipError(err instanceof ApiError ? err.message : 'No se pudo asignar la membresía.');
    },
  });

  const paymentReviewMutation = useMutation({
    mutationFn: ({ id, decision }: { id: number; decision: 'approve' | 'reject' }) =>
      requestJson(`/payments/${id}/${decision}`, { method: 'POST' }),
    onSuccess: async (_res, vars) => {
      await invalidateAll();
      showToast(
        vars.decision === 'approve'
          ? 'Pago aprobado y membresía activada.'
          : 'Solicitud de pago rechazada.',
      );
    },
    onError: (err) => {
      showToast(err instanceof ApiError ? err.message : 'No se pudo procesar la solicitud de pago.');
    },
  });

  const membershipActionMutation = useMutation({
    mutationFn: ({ id, action }: { id: number; action: 'renew' | 'pause' | 'resume' | 'cancel' }) =>
      requestJson<SingleResponse<MembershipItem>>(`/memberships/${id}/${action}`, {
        method: 'POST',
      }),
    onSuccess: async (res, vars) => {
      await invalidateAll();
      const actionLabel =
        vars.action === 'renew'
          ? 'renovada'
          : vars.action === 'pause'
            ? 'pausada'
            : vars.action === 'resume'
              ? 'reanudada'
              : 'cancelada';
      showToast(`Membresía de ${res.data.member_name} ${actionLabel}.`);
    },
  });

  const createMemberMutation = useMutation({
    mutationFn: () =>
      requestJson<SingleResponse<MemberItem>>('/members', {
        method: 'POST',
        body: JSON.stringify({
          full_name: newMemberName.trim(),
          email: newMemberEmail.trim() !== '' ? newMemberEmail.trim() : null,
          phone: newMemberPhone.trim() !== '' ? newMemberPhone.trim() : null,
        }),
      }),
    onSuccess: async (res) => {
      await invalidateAll();
      showToast(`Socio "${res.data.full_name}" registrado.`);
      setNewMemberName('');
      setNewMemberEmail('');
      setNewMemberPhone('');
      setNewMemberError('');
      setMemberModalOpen(false);
    },
    onError: (err) => {
      setNewMemberError(err instanceof ApiError ? err.message : 'No se pudo crear el socio.');
    },
  });

  const toggleMemberStatusMutation = useMutation({
    mutationFn: ({ id, nextStatus }: { id: number; nextStatus: MemberStatus }) =>
      requestJson<SingleResponse<MemberItem>>(`/members/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: nextStatus }),
      }),
    onSuccess: async () => {
      await invalidateAll();
      showToast('Estado del socio actualizado.');
    },
  });

  const memberships = membershipsQuery.data?.data ?? [];
  const membershipStats = membershipsQuery.data?.stats;
  const members = membersQuery.data?.data ?? [];
  const payments = paymentsQuery.data?.data ?? [];
  const billingStats = paymentsQuery.data?.stats;
  const pendingPaymentsCount = billingStats?.pending_count ?? 0;

  const activeMeta =
    activeTab === 'memberships'
      ? membershipsQuery.data?.meta
      : activeTab === 'members'
        ? membersQuery.data?.meta
        : paymentsQuery.data?.meta;

  const handleMembershipSubmit = (e: FormEvent) => {
    e.preventDefault();
    setMshipError('');
    if (mshipMemberName.trim().length < 2) {
      setMshipError('Ingresa el nombre del socio.');
      return;
    }
    createMembershipMutation.mutate();
  };

  const handleMemberSubmit = (e: FormEvent) => {
    e.preventDefault();
    setNewMemberError('');
    if (newMemberName.trim().length < 2) {
      setNewMemberError('Ingresa el nombre completo del socio.');
      return;
    }
    createMemberMutation.mutate();
  };

  return (
    <div>
      <div className="mt-[9px] mb-[19px] flex flex-wrap items-end justify-between gap-[18px] md:mt-3 md:mb-6">
        <div>
          <span className="block text-[9px] font-bold text-[#8b8e84] uppercase">
            COMUNIDAD Y MEMBRESÍAS
          </span>
          <h1 className="font-display mt-[7px] text-[25px] leading-[1.15] font-semibold text-[#22251f] sm:text-[29px]">
            Socios e ingresos
          </h1>
          <p className="mt-[7px] max-w-[300px] text-[11px] leading-normal text-[#83857d] sm:max-w-none">
            Administra membresías vigentes, directorio de socios e historial de pagos.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setMembershipModalOpen(true)}
            className="inline-flex min-h-[39px] items-center justify-center gap-[9px] rounded-[3px] bg-[#d3f36b] px-[15px] text-[10px] font-bold text-[#22251f] transition-all hover:-translate-y-px hover:bg-[#c5eb50]"
          >
            <span className="text-[15px] leading-none">＋</span> Asignar membresía
          </button>
          <button
            type="button"
            onClick={() => setPaymentModalOpen(true)}
            className="inline-flex min-h-[39px] items-center justify-center gap-[9px] rounded-[3px] bg-[#22251f] px-[15px] text-[10px] font-bold text-white transition-all hover:-translate-y-px hover:bg-[#3b4037]"
          >
            <span className="text-[15px] leading-none">＋</span> Registrar ingreso
          </button>
        </div>
      </div>

      <div className="mb-[14px] grid grid-cols-2 gap-[12px] md:grid-cols-3 lg:max-w-[700px]">
        <KpiCard
          label="Membresías activas"
          value={membershipsQuery.isLoading ? '...' : (membershipStats?.active_count ?? 0)}
          subtitle={`${membershipStats?.expiring_soon_count ?? 0} por vencer en ≤7 días`}
          icon={<Award className="h-[13px] w-[13px] stroke-[2] text-[#22251f]" />}
          iconBgClass="bg-[#d3f36b]"
        />
        <KpiCard
          label="Socios registrados"
          value={paymentsQuery.isLoading ? '...' : (billingStats?.distinct_members_count ?? members.length)}
          subtitle="Comunidad en Neon DB"
          icon={<Users className="h-[13px] w-[13px] stroke-[1.9] text-[#22251f]" />}
          iconBgClass="bg-[#ffe0d8]"
        />
        <KpiCard
          label="Ingresos acumulados"
          value={paymentsQuery.isLoading ? '...' : (billingStats?.formatted_total_revenue ?? '$0.00')}
          subtitle="Todos los movimientos"
          icon={<DollarSign className="h-[13px] w-[13px] stroke-[2.1] text-[#22251f]" />}
          iconBgClass="bg-[#dceefa]"
        />
      </div>

      <div>
        <div className="min-w-0 overflow-hidden rounded-[3px] border border-[#e7e8e2] bg-white">
          <div className="flex min-h-[79px] flex-wrap items-center justify-between gap-3 px-[18px] py-[14px]">
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { key: 'memberships', label: 'Membresías' },
                { key: 'members', label: 'Directorio de socios' },
                {
                  key: 'payments',
                  label:
                    pendingPaymentsCount > 0
                      ? `Historial de pagos (${pendingPaymentsCount} pend.)`
                      : 'Historial de pagos',
                },
              ].map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => {
                    setActiveTab(tab.key as TabKey);
                    setPage(1);
                  }}
                  className={`rounded-[3px] px-3 py-1.5 text-[10px] font-bold transition-colors ${
                    activeTab === tab.key
                      ? 'bg-[#22251f] text-white'
                      : 'bg-[#f8f9f5] text-[#686b63] hover:text-[#22251f]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {activeTab === 'memberships' ? (
                <select
                  aria-label="Filtrar membresías por estado"
                  value={membershipFilter}
                  onChange={(e) => {
                    setMembershipFilter(e.target.value);
                    setPage(1);
                  }}
                  className="h-[34px] rounded-[3px] border border-[#e7e8e2] bg-white px-2.5 text-[10px] text-[#22251f] outline-none"
                >
                  <option value="">Todos los estados</option>
                  <option value="active">Activas</option>
                  <option value="expiring_soon">Por vencer (≤7d)</option>
                  <option value="paused">Pausadas</option>
                  <option value="expired">Vencidas</option>
                </select>
              ) : null}

              {activeTab === 'payments' ? (
                <select
                  aria-label="Filtrar pagos por estado"
                  value={paymentStatusFilter}
                  onChange={(e) => {
                    setPaymentStatusFilter(e.target.value);
                    setPage(1);
                  }}
                  className="h-[34px] rounded-[3px] border border-[#e7e8e2] bg-white px-2.5 text-[10px] text-[#22251f] outline-none"
                >
                  <option value="">Todos los pagos</option>
                  <option value="pending">En revisión</option>
                  <option value="paid">Pagados</option>
                  <option value="rejected">Rechazados</option>
                </select>
              ) : null}

              {activeTab === 'members' ? (
                <button
                  type="button"
                  onClick={() => setMemberModalOpen(true)}
                  className="h-[34px] rounded-[3px] border border-[#e7e8e2] bg-[#f8f9f5] px-3 text-[10px] font-bold text-[#22251f] hover:bg-[#d3f36b]"
                >
                  + Nuevo socio
                </button>
              ) : null}

              <label className="flex h-[34px] w-full items-center gap-[7px] rounded-[3px] border border-[#e7e8e2] px-[10px] text-[#898b83] focus-within:border-[#97bd42] sm:w-[210px]">
                <Search className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                <input
                  type="search"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Buscar socio..."
                  aria-label="Buscar socio"
                  className="w-full min-w-0 border-0 bg-transparent text-[10px] text-[#22251f] outline-none placeholder:text-[#898b83]"
                />
              </label>
            </div>
          </div>

          {activeTab === 'memberships' ? (
            <>
              <div className="w-full overflow-x-auto">
                <table className="w-full border-collapse text-left">
                  <thead className="bg-[#f8f9f5]">
                    <tr>
                      <th className="px-[13px] py-[10px] text-[8px] font-bold text-[#92948c] uppercase">
                        Socio
                      </th>
                      <th className="px-[13px] py-[10px] text-[8px] font-bold text-[#92948c] uppercase">
                        Plan
                      </th>
                      <th className="px-[13px] py-[10px] text-[8px] font-bold text-[#92948c] uppercase">
                        Vigencia
                      </th>
                      <th className="px-[13px] py-[10px] text-[8px] font-bold text-[#92948c] uppercase">
                        Estado
                      </th>
                      <th className="px-[13px] py-[10px] text-[8px] font-bold text-[#92948c] uppercase">
                        Días rest.
                      </th>
                      <th className="px-[13px] py-[10px] text-right text-[8px] font-bold text-[#92948c] uppercase">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {memberships.map((m, idx) => (
                      <tr key={m.id} className="border-b border-[#f0f1ec] last:border-b-0">
                        <td className="px-[13px] py-[11px] text-[10px] whitespace-nowrap">
                          <span className="flex items-center gap-2 font-semibold text-[#22251f]">
                            <span
                              className={`grid h-[26px] w-[26px] shrink-0 place-items-center rounded-full text-[8px] font-bold text-[#262820] ${
                                idx % 3 === 0
                                  ? 'bg-[#d9ef9f]'
                                  : idx % 3 === 1
                                    ? 'bg-[#ffd3c8]'
                                    : 'bg-[#cbe4f3]'
                              }`}
                            >
                              {getMemberInitials(m.member_name)}
                            </span>
                            {m.member_name}
                          </span>
                        </td>
                        <td className="px-[13px] py-[11px] text-[10px] text-[#666960]">
                          {m.plan_name}
                        </td>
                        <td className="tabular-nums px-[13px] py-[11px] text-[10px] text-[#666960]">
                          {m.starts_at} → {m.ends_at}
                        </td>
                        <td className="px-[13px] py-[11px]">
                          <span
                            className={`inline-block rounded-[3px] border px-2 py-0.5 text-[8px] font-bold uppercase ${
                              STATUS_BADGE_CLASS[m.status]
                            }`}
                          >
                            {getMembershipStatusLabel(m.status)}
                            {m.is_expiring_soon ? ' · Por vencer' : ''}
                          </span>
                        </td>
                        <td className="tabular-nums px-[13px] py-[11px] text-[10px] font-bold text-[#22251f]">
                          {m.days_remaining} d
                        </td>
                        <td className="px-[13px] py-[11px] text-right whitespace-nowrap">
                          <div className="inline-flex gap-1.5">
                            {m.status !== 'cancelled' ? (
                              <button
                                type="button"
                                onClick={() =>
                                  membershipActionMutation.mutate({ id: m.id, action: 'renew' })
                                }
                                className="rounded-[3px] border border-[#e7e8e2] bg-[#d3f36b] px-2 py-1 text-[9px] font-bold text-[#22251f] hover:bg-[#c5eb50]"
                              >
                                Renovar
                              </button>
                            ) : null}
                            {m.status === 'active' ? (
                              <button
                                type="button"
                                onClick={() =>
                                  membershipActionMutation.mutate({ id: m.id, action: 'pause' })
                                }
                                className="rounded-[3px] border border-[#e7e8e2] px-2 py-1 text-[9px] font-semibold text-[#686b63] hover:bg-[#f5f6f1]"
                              >
                                Pausar
                              </button>
                            ) : m.status === 'paused' ? (
                              <button
                                type="button"
                                onClick={() =>
                                  membershipActionMutation.mutate({ id: m.id, action: 'resume' })
                                }
                                className="rounded-[3px] border border-[#e7e8e2] px-2 py-1 text-[9px] font-semibold text-[#22251f] hover:bg-[#f5f6f1]"
                              >
                                Reanudar
                              </button>
                            ) : null}
                            {m.status !== 'cancelled' ? (
                              <button
                                type="button"
                                onClick={() =>
                                  membershipActionMutation.mutate({ id: m.id, action: 'cancel' })
                                }
                                className="rounded-[3px] border border-[#e7e8e2] px-2 py-1 text-[9px] font-semibold text-[#9b2c1a] hover:bg-red-50"
                              >
                                Cancelar
                              </button>
                            ) : null}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {membershipsQuery.isLoading ? (
                <p className="py-10 text-center text-[10px] text-[#73756e]">
                  Consultando membresías...
                </p>
              ) : memberships.length === 0 ? (
                <div className="px-5 py-[35px] text-center text-[#73756e]">
                  <strong className="font-display block text-[14px] font-semibold text-[#22251f]">
                    Sin membresías registradas
                  </strong>
                  <p className="mt-1.5 text-[10px]">
                    Asigna una membresía o registra un pago para activar automáticamente a un socio.
                  </p>
                </div>
              ) : null}
            </>
          ) : activeTab === 'members' ? (
            <>
              <div className="w-full overflow-x-auto">
                <table className="w-full border-collapse text-left">
                  <thead className="bg-[#f8f9f5]">
                    <tr>
                      <th className="px-[13px] py-[10px] text-[8px] font-bold text-[#92948c] uppercase">
                        Socio
                      </th>
                      <th className="px-[13px] py-[10px] text-[8px] font-bold text-[#92948c] uppercase">
                        Correo / Teléfono
                      </th>
                      <th className="px-[13px] py-[10px] text-[8px] font-bold text-[#92948c] uppercase">
                        Ingreso
                      </th>
                      <th className="px-[13px] py-[10px] text-[8px] font-bold text-[#92948c] uppercase">
                        Estado
                      </th>
                      <th className="px-[13px] py-[10px] text-right text-[8px] font-bold text-[#92948c] uppercase">
                        Acción
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {members.map((member, idx) => (
                      <tr key={member.id} className="border-b border-[#f0f1ec] last:border-b-0">
                        <td className="px-[13px] py-[11px] text-[10px]">
                          <span className="flex items-center gap-2 font-semibold text-[#22251f]">
                            <span
                              className={`grid h-[26px] w-[26px] shrink-0 place-items-center rounded-full text-[8px] font-bold text-[#262820] ${
                                idx % 2 === 0 ? 'bg-[#d9ef9f]' : 'bg-[#cbe4f3]'
                              }`}
                            >
                              {getMemberInitials(member.full_name)}
                            </span>
                            {member.full_name}
                          </span>
                        </td>
                        <td className="px-[13px] py-[11px] text-[10px] text-[#666960]">
                          {member.email || member.phone || 'Sin contacto'}
                        </td>
                        <td className="tabular-nums px-[13px] py-[11px] text-[10px] text-[#666960]">
                          {member.joined_at}
                        </td>
                        <td className="px-[13px] py-[11px] text-[9px] font-bold uppercase">
                          {getMemberStatusLabel(member.status)}
                        </td>
                        <td className="px-[13px] py-[11px] text-right">
                          <button
                            type="button"
                            onClick={() =>
                              toggleMemberStatusMutation.mutate({
                                id: member.id,
                                nextStatus: member.status === 'active' ? 'suspended' : 'active',
                              })
                            }
                            className="rounded-[3px] border border-[#e7e8e2] px-2.5 py-1 text-[9px] font-bold text-[#22251f] hover:bg-[#f5f6f1]"
                          >
                            {member.status === 'active' ? 'Suspender' : 'Activar'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {membersQuery.isLoading ? (
                <p className="py-10 text-center text-[10px] text-[#73756e]">Consultando socios...</p>
              ) : members.length === 0 ? (
                <div className="px-5 py-[35px] text-center text-[#73756e]">
                  <strong className="font-display block text-[14px] font-semibold text-[#22251f]">
                    No hay socios registrados
                  </strong>
                </div>
              ) : null}
            </>
          ) : (
            <>
              <PaymentsTable
                payments={payments}
                busyPaymentId={
                  paymentReviewMutation.isPending
                    ? (paymentReviewMutation.variables?.id ?? null)
                    : null
                }
                onApprove={(id) => paymentReviewMutation.mutate({ id, decision: 'approve' })}
                onReject={(id) => paymentReviewMutation.mutate({ id, decision: 'reject' })}
              />
              {paymentsQuery.isLoading ? (
                <p className="py-10 text-center text-[10px] text-[#73756e]">Consultando historial...</p>
              ) : payments.length === 0 ? (
                <div className="px-5 py-[35px] text-center text-[#73756e]">
                  <strong className="font-display block text-[14px] font-semibold text-[#22251f]">
                    No hay resultados
                  </strong>
                  <p className="mt-1.5 text-[10px]">
                    Prueba con otro nombre o registra un nuevo ingreso.
                  </p>
                </div>
              ) : null}
            </>
          )}

          {activeMeta && activeMeta.last_page > 1 ? (
            <div className="flex items-center justify-between border-t border-[#e8e9e3] px-[18px] py-3 text-[10px]">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="rounded-[3px] border border-[#e8e9e3] px-3 py-1 font-semibold text-[#22251f] disabled:opacity-40"
              >
                Anterior
              </button>
              <span className="tabular-nums text-[#85877f]">
                Página {activeMeta.current_page} de {activeMeta.last_page}
              </span>
              <button
                type="button"
                disabled={page >= activeMeta.last_page}
                onClick={() => setPage((p) => p + 1)}
                className="rounded-[3px] border border-[#e8e9e3] px-3 py-1 font-semibold text-[#22251f] disabled:opacity-40"
              >
                Siguiente
              </button>
            </div>
          ) : null}
        </div>

        <p className="mt-[13px] text-[9px] text-[#999b93]">
          Los registros se guardan en Neon PostgreSQL vía Laravel API.
        </p>
      </div>

      <RegisterPaymentModal open={paymentModalOpen} onClose={() => setPaymentModalOpen(false)} />

      {membershipModalOpen
        ? createPortal(
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-[#1c201b]/75 p-3.5 backdrop-blur-[2px]"
              role="dialog"
              aria-modal="true"
              onClick={(e) => {
                if (e.target === e.currentTarget) setMembershipModalOpen(false);
              }}
            >
              <div className="w-[min(420px,100%)] rounded-[4px] bg-white p-6 shadow-[0_20px_70px_rgba(23,26,22,0.44)]">
                <div className="mb-5 flex items-start justify-between">
                  <div>
                    <span className="block text-[9px] font-bold text-[#8b8e84] uppercase">
                      MEMBRESÍA LOBO
                    </span>
                    <h2 className="font-display mt-1 text-[21px] font-semibold text-[#22251f]">
                      Asignar membresía
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => setMembershipModalOpen(false)}
                    aria-label="Cerrar"
                    className="grid h-[31px] w-[31px] place-items-center rounded-[3px] border border-[#e8e9e3] text-[20px]"
                  >
                    ×
                  </button>
                </div>

                <form onSubmit={handleMembershipSubmit} className="space-y-3.5">
                  <div>
                    <label className="mb-1.5 block text-[9px] font-bold text-[#5f6259]">
                      Nombre del socio
                    </label>
                    <input
                      type="text"
                      autoFocus
                      required
                      value={mshipMemberName}
                      onChange={(e) => setMshipMemberName(e.target.value)}
                      placeholder="Ej. Alex Rivera"
                      className="min-h-[39px] w-full rounded-[3px] border border-[#e2e4dc] px-2.5 text-[11px]"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="mb-1.5 block text-[9px] font-bold text-[#5f6259]">Plan</label>
                      <select
                        value={mshipPlanId}
                        onChange={(e) => setMshipPlanId(e.target.value)}
                        className="min-h-[39px] w-full rounded-[3px] border border-[#e2e4dc] bg-white px-2.5 text-[11px]"
                      >
                        {(plansQuery.data?.data ?? [
                          { id: 1, name: 'Pase diario' },
                          { id: 2, name: 'Mensualidad' },
                          { id: 3, name: 'Trimestral' },
                        ]).map((plan) => (
                          <option key={plan.id} value={plan.id}>
                            {plan.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="mb-1.5 block text-[9px] font-bold text-[#5f6259]">
                        Fecha inicio
                      </label>
                      <input
                        type="date"
                        value={mshipStartsAt}
                        onChange={(e) => setMshipStartsAt(e.target.value)}
                        className="min-h-[39px] w-full rounded-[3px] border border-[#e2e4dc] px-2.5 text-[11px]"
                      />
                    </div>
                  </div>
                  {mshipError ? <p className="text-[11px] text-red-600">{mshipError}</p> : null}
                  <button
                    type="submit"
                    disabled={createMembershipMutation.isPending}
                    className="flex min-h-[39px] w-full items-center rounded-[3px] bg-[#22251f] px-[15px] text-[10px] font-bold text-white"
                  >
                    <span>
                      {createMembershipMutation.isPending ? 'Asignando...' : 'Activar membresía'}
                    </span>
                    <span className="ml-auto text-[15px]">→</span>
                  </button>
                </form>
              </div>
            </div>,
            document.body,
          )
        : null}

      {memberModalOpen
        ? createPortal(
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-[#1c201b]/75 p-3.5 backdrop-blur-[2px]"
              role="dialog"
              aria-modal="true"
              onClick={(e) => {
                if (e.target === e.currentTarget) setMemberModalOpen(false);
              }}
            >
              <div className="w-[min(400px,100%)] rounded-[4px] bg-white p-6 shadow-[0_20px_70px_rgba(23,26,22,0.44)]">
                <span className="block text-[9px] font-bold text-[#8b8e84] uppercase">NUEVO SOCIO</span>
                <h2 className="font-display mt-1 text-[21px] font-semibold text-[#22251f]">
                  Registrar socio
                </h2>
                <form onSubmit={handleMemberSubmit} className="mt-4 space-y-3">
                  <div>
                    <label className="mb-1.5 block text-[9px] font-bold text-[#5f6259]">
                      Nombre completo
                    </label>
                    <input
                      type="text"
                      autoFocus
                      required
                      value={newMemberName}
                      onChange={(e) => setNewMemberName(e.target.value)}
                      placeholder="Ej. Sofía Morales"
                      className="min-h-[38px] w-full rounded-[3px] border border-[#e2e4dc] px-2.5 text-[11px]"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-[9px] font-bold text-[#5f6259]">
                      Correo electrónico (opcional)
                    </label>
                    <input
                      type="email"
                      value={newMemberEmail}
                      onChange={(e) => setNewMemberEmail(e.target.value)}
                      placeholder="sofia@ejemplo.com"
                      className="min-h-[38px] w-full rounded-[3px] border border-[#e2e4dc] px-2.5 text-[11px]"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-[9px] font-bold text-[#5f6259]">
                      Teléfono (opcional)
                    </label>
                    <input
                      type="text"
                      value={newMemberPhone}
                      onChange={(e) => setNewMemberPhone(e.target.value)}
                      placeholder="+52 55 0000 0000"
                      className="min-h-[38px] w-full rounded-[3px] border border-[#e2e4dc] px-2.5 text-[11px]"
                    />
                  </div>
                  {newMemberError ? <p className="text-[11px] text-red-600">{newMemberError}</p> : null}
                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setMemberModalOpen(false)}
                      className="min-h-[38px] flex-1 rounded-[3px] border border-[#e2e4dc] text-[10px] font-bold text-[#686b63]"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={createMemberMutation.isPending}
                      className="min-h-[38px] flex-1 rounded-[3px] bg-[#22251f] text-[10px] font-bold text-white"
                    >
                      {createMemberMutation.isPending ? 'Guardando...' : 'Guardar socio'}
                    </button>
                  </div>
                </form>
              </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
