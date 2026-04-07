import AppButton from '@/components/AppButton'

type PaginationControlsProps = {
  page: number
  totalPages: number
  onPageChange: (value: number) => void
}

export default function PaginationControls({ page, totalPages, onPageChange }: PaginationControlsProps) {
  return (
    <nav className="pagination card" aria-label="Pagination">
      <AppButton
        variant="secondary"
        disabled={page <= 1}
        aria-label="Go to previous page"
        onClick={() => onPageChange(page - 1)}
      >
        Previous
      </AppButton>
      <p role="status" aria-live="polite" aria-atomic="true">
        Page {page} / {totalPages}
      </p>
      <AppButton
        variant="secondary"
        disabled={page >= totalPages}
        aria-label="Go to next page"
        onClick={() => onPageChange(page + 1)}
      >
        Next
      </AppButton>
    </nav>
  )
}
