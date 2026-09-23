import type { Member, MemberId } from '../entities/Member'

export interface MemberRepository {
  findAll(): Promise<Member[]>
  findById(id: MemberId): Promise<Member | null>
  saveAll(members: Member[]): Promise<void>
}
