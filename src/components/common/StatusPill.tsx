import {
  REQUEST_STATUS_LABEL,
  PHOTO_PROCESSING_STATUS_LABEL,
  type RequestStatus,
  type PhotoProcessingStatus,
} from '../../models';

type Props = {
  status: RequestStatus | PhotoProcessingStatus;
};

export function StatusPill({ status }: Props) {
  const label = status in REQUEST_STATUS_LABEL
    ? REQUEST_STATUS_LABEL[status as RequestStatus]
    : PHOTO_PROCESSING_STATUS_LABEL[status as PhotoProcessingStatus];

  return (
    <span className={`pill pill--status pill--${status}`}>
      {label}
    </span>
  );
}