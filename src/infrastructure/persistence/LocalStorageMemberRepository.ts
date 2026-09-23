import { Member, type MemberId } from '../../domain/entities/Member'
import type { MemberRepository } from '../../domain/repositories/MemberRepository'
import { SEED_MEMBERS } from './seedData'

const KEY = 'ddd-library-lab:members'

export class LocalStorageMemberRepository implements MemberRepository {
  async findAll(): Promise<Member[]> {
    this.ensureSeeded()
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    const list = JSON.parse(raw) as Array<{ id: string; name: string }>
    return list.map((m) => Member.fromJSON(m))
  }

  async findById(id: MemberId): Promise<Member | null> {
    const all = await this.findAll()
    return all.find((m) => m.id === id) ?? null
  }

  async saveAll(members: Member[]): Promise<void> {
    localStorage.setItem(KEY, JSON.stringify(members.map((m) => m.toJSON())))
  }

  private ensureSeeded(): void {
    if (localStorage.getItem(KEY)) return
    localStorage.setItem(KEY, JSON.stringify(SEED_MEMBERS.map((m) => m.toJSON())))
  }
}
