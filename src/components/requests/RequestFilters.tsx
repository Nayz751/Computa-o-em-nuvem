import { useId } from 'react';
import type { PhotoRequest, RequestStatus } from '../../models';
import { REQUEST_STATUS_LABEL } from '../../models';
import { normalize } from '../../services/searchService';

export type StatusFilter = 'all' | Exclude<RequestStatus, 'not_requested'>;
export interface RequestFilterState { query: string; status: StatusFilter }

export const emptyRequestFilter: RequestFilterState = { query: '', status: 'all' };

export function filterRequests(list: PhotoRequest[], f: RequestFilterState): PhotoRequest[] {
  const q = normalize(f.query);
  return list.filter((r) =>
    (f.status === 'all' || r.status === f.status) &&
    (!q || normalize(`${r.eventName} ${r.photoTitle} ${r.runnerName} ${r.photographerName}`).includes(q)));
}

export function RequestFilters({ value, onChange, placeholder }: { value: RequestFilterState; onChange: (v: RequestFilterState) => void; placeholder: string }) {
  const searchId = useId();
  const statusId = useId();
  const statuses: StatusFilter[] = ['all', 'pending', 'fulfilled', 'declined', 'cancelled'];
  return (
    <div className="filters">
      <div className="field">
        <label htmlFor={searchId} className="field__label">Pesquisar solicitações</label>
        <input id={searchId} type="search" className="field__control" placeholder={placeholder} value={value.query} onChange={(e) => onChange({ ...value, query: e.target.value })} />
      </div>
      <div className="field">
        <label htmlFor={statusId} className="field__label">Status</label>
        <select id={statusId} className="field__control" value={value.status} onChange={(e) => onChange({ ...value, status: e.target.value as StatusFilter })}>
          {statuses.map((s) => <option key={s} value={s}>{s === 'all' ? 'Todos' : REQUEST_STATUS_LABEL[s]}</option>)}
        </select>
      </div>
    </div>
  );
}
