export type Member = {
  id: string
  name: string
  email: string
  created_at: string
}

export type Product = {
  id: string
  name: string
  slug: string
  tagline: string | null
  description: string | null
  url: string | null
  maker_name: string | null
  maker_email: string | null
  category: string | null
  tags: string[] | null
  approved: boolean
  created_at: string
}

export type Comment = {
  id: string
  product_slug: string
  author_name: string
  author_email: string
  body: string
  created_at: string
}

export type PostMeta = {
  title: string
  description: string
  date: string
  tags: string[]
  slug: string
  readingTime?: string
}
