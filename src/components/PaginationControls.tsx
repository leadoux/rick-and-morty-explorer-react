import AppButton from '@/components/AppButton'

type PaginationControlsProps = {
  page: number
  totalPages: number
  onPageChange: (value: number) => void
}

export default function PaginationControls({ page, totalPages, onPageChange }: PaginationControlsProps) {
  return (
    <div className="pagination card">
      <AppButton variant="secondary" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
        Previous
      </AppButton>
      <p>
        Page {page} / {totalPages}
      </p>
      <AppButton variant="secondary" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
        Next
      </AppButton>
    </div>
  )
}
