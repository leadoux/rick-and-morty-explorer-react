import { useEffect } from 'react'

type DocumentMeta = {
  title: string
  description: string
}

const getOrCreateDescriptionMeta = () => {
  const existing = document.querySelector('meta[name="description"]')
  if (existing instanceof HTMLMetaElement) return existing

  const created = document.createElement('meta')
  created.name = 'description'
  document.head.appendChild(created)
  return created
}

export const useDocumentMeta = ({ title, description }: DocumentMeta) => {
  useEffect(() => {
    document.title = title
    const descriptionMeta = getOrCreateDescriptionMeta()
    descriptionMeta.content = description
  }, [description, title])
}
