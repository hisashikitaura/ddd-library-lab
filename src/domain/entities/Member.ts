import { DomainError } from '../errors/DomainError'

export type MemberId = string

export class Member {
  readonly id: MemberId
  readonly name: string

  private constructor(id: MemberId, name: string) {
    this.id = id
    this.name = name
  }

  static create(id: MemberId, name: string): Member {
    if (!id.trim()) {
      throw new DomainError('INVALID_MEMBER', '会員IDが空です')
    }
    if (!name.trim()) {
      throw new DomainError('INVALID_MEMBER', '会員名が空です')
    }
    return new Member(id, name.trim())
  }

  toJSON(): { id: string; name: string } {
    return { id: this.id, name: this.name }
  }

  static fromJSON(json: { id: string; name: string }): Member {
    return Member.create(json.id, json.name)
  }
}
