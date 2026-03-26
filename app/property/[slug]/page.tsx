import { fetchComplexesFromSheets } from '@/lib/googleSheets'
import { notFound } from 'next/navigation'
import PropertyPageContent from '@/components/PropertyPageContent'

export const revalidate = 60

function toSlug(name: string) {
  return name.toLowerCase().replace(/\s+/g, '-')
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const complexes = await fetchComplexesFromSheets()
  const property = complexes.find(c => toSlug(c.name) === slug)
  if (!property) return { title: 'Not Found — ArmNair' }
  return {
    title: `${property.name} — ArmNair`,
    description: property.description || `${property.name} — ${property.developer}, ${property.district}`,
    openGraph: {
      title: property.name,
      description: property.description,
      images: property.image ? [property.image] : [],
    },
  }
}

export default async function PropertyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const complexes = await fetchComplexesFromSheets()
  const property = complexes.find(c => toSlug(c.name) === slug)
  if (!property) notFound()
  return <PropertyPageContent property={property} />
}
