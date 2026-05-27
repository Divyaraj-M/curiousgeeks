import { getSession } from '@/lib/auth'
import Nav from './Nav'

export default async function NavWrapper() {
  const session = await getSession()
  return <Nav session={session} />
}
